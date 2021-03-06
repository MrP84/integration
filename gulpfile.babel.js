import gulp from 'gulp';
import autoprefixer from 'autoprefixer';
import browserify from 'browserify';
import concat from 'gulp-concat';
import cssnano from 'cssnano';
import del from 'del';
import gutil from 'gutil';
import imagemin from 'gulp-imagemin';
import livereload from 'gulp-livereload';
import mqpacker from 'css-mqpacker';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const ENABLE_LIVE_RELOAD = true;

const FILENAMES = { jsCode: 'app.js', jsVendor: 'vendor.js' };

const PATHS = {
    dest: {
        global: './dist',
        imgFolder: 'img',
        prodFolder: 'prod',
        devFolder: 'dev'
    },
    src: {
        assets: ['src/assets/**', '!src/assets/{img,img/**}'],
        html: 'src/html/*.html',
        img: 'src/assets/img/**/*',
        jsCode: ['src/js/**/*.js', '!src/js/{vendor,vendor/**}'],
        jsEntry: 'src/js/index.js',
        jsVendor: 'src/js/vendor/**/*.js',
        scss: 'src/scss/**/*.scss',
        templates: '../templates/**/*.twig'
    }
};

function html () {
    return gulp.src(PATHS.src.html).pipe(livereload());
}
gulp.task('html', html);

function templates () {
    return gulp.src(PATHS.src.templates).pipe(livereload());
}
gulp.task('templates', templates);

function JSVendor (opts) {
    const development = opts.type === 'changed';

    if (development) {
        // Development mode
        return gulp.src(PATHS.src.jsVendor)
            .pipe(concat(FILENAMES.jsVendor))
            .pipe(gulp.dest(PATHS.dest.global + '/' + PATHS.dest.devFolder))
            .pipe(livereload());
    } else {
        // Production mode
        return gulp.src(PATHS.src.jsVendor)
            .pipe(concat(FILENAMES.jsVendor))
            .pipe(uglify())
            .pipe(gulp.dest(PATHS.dest.global + '/' + PATHS.dest.prodFolder));
    }
}
gulp.task('JSVendor', JSVendor);

function JSCode (opts) {
    const development = opts.type === 'changed';
    const bundler = browserify({ entries: PATHS.src.jsEntry, debug: development });

    if (development) {
        // Development mode
        return bundler
            .transform('babelify', { presets: ['es2015'] })
            .bundle()
            .on('error', catchJSErrors)
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(PATHS.dest.global + '/' + PATHS.dest.devFolder))
            .pipe(livereload());
    } else {
        // Production mode
        return bundler
            .transform('babelify', { presets: ['es2015'] })
            .bundle()
            .on('error', catchJSErrors)
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(PATHS.dest.global + '/' + PATHS.dest.prodFolder));
    }
}
gulp.task('JSCode', JSCode);

function catchJSErrors (err) {
    if (err instanceof SyntaxError) {
        gutil.log('Syntax Error');
        console.log(err.message);
        console.log(err.codeFrame);
    } else {
        gutil.log('Error', err.message);
    }
    this.emit('end');
}

function copyAssets (opts) {
    const folder = opts.type === 'changed' ? PATHS.dest.devFolder : PATHS.dest.prodFolder;
    return gulp.src(PATHS.src.assets)
        .pipe(gulp.dest(PATHS.dest.global + '/' + folder));
}
gulp.task('copyAssets', copyAssets);

function cleanDist (opts) {
    const folder = opts.type === 'changed' ? PATHS.dest.devFolder : PATHS.dest.prodFolder;
    return del(PATHS.dest.global + '/' + folder);
}
gulp.task('cleanDist', cleanDist);

function minifyImages (opts) {
    const destFolder = PATHS.dest.global + '/' + (opts.type === 'changed' ? PATHS.dest.devFolder : PATHS.dest.prodFolder) + '/' + PATHS.dest.imgFolder;

    return gulp.src(PATHS.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true, optimizationLevel: 2 }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 4 }),
            imagemin.svgo({
                // https://github.com/svg/svgo#what-it-can-do
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ], {
            verbose: false
        }))
        .pipe(gulp.dest(destFolder));
}
gulp.task('minifyImages', minifyImages);

function css (opts) {
    const postcssPlugins = [
        mqpacker({
            sort: true
        }),
        autoprefixer({
            browsers: ['last 3 versions', 'Firefox >= 50', 'IE 11'],
            flexbox: 'no-2009'
        })
    ];

    // Production mode -> minify CSS
    if (opts.type !== 'changed') {
        postcssPlugins.push(
            cssnano({
                preset: ['default', {
                    discardComments: {
                        removeAll: false // loud comments are needed to turn autoprefixer off
                    }
                }]
            })
        );
    }

    if (opts.type === 'changed') {
        // Development mode
        return gulp.src(PATHS.src.scss)
            .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(postcss(postcssPlugins))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(PATHS.dest.global + '/dev'))
            .pipe(livereload());
    } else {
        // Production mode
        return gulp.src(PATHS.src.scss)
            .pipe(sass())
            .pipe(postcss(postcssPlugins))
            .pipe(gulp.dest(PATHS.dest.global + '/prod'));
    }
}
gulp.task('css', css);

gulp.task('dev', function () {
    const devOptions = { type: 'changed' };
    // Launches tasks once before watching (creates files if needed)
    cleanDist(devOptions)
        .then(() => {
            minifyImages(devOptions);
            copyAssets(devOptions);
            css(devOptions);
            JSVendor(devOptions);
            JSCode(devOptions);
            html(devOptions);
            templates(devOptions);
        })
        .catch((err) => { throw new Error(err); });

    if (ENABLE_LIVE_RELOAD) {
        livereload.listen({ start: true });
    }

    gulp.watch(PATHS.src.jsVendor, JSVendor);
    gulp.watch(PATHS.src.jsCode, JSCode);
    gulp.watch(PATHS.src.scss, css);
    gulp.watch(PATHS.src.assets, copyAssets);
    gulp.watch(PATHS.src.img, minifyImages);
    gulp.watch(PATHS.src.html, html);
    gulp.watch(PATHS.src.templates, templates);
});

/**
 * Production task
 */
gulp.task('prod', function () {
    const prodOptions = { type: '' };

    cleanDist(prodOptions)
        .then(() => {
            minifyImages(prodOptions);
            copyAssets(prodOptions);
            css(prodOptions);
            JSVendor(prodOptions);
            JSCode(prodOptions);
        })
        .catch((err) => { throw new Error(err); });
});

gulp.task('watch', ['dev']);
gulp.task('build', ['prod']);

/**
 * Default task
 */
gulp.task('default', ['minifyImages', 'css', 'JSVendor', 'JSCode'], function () {});
