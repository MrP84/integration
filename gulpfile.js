var ENABLE_LIVE_RELOAD = true;
var ENABLE_IMAGE_COMPRESSION = true;

var FILENAMES = {
    jsCode: 'app.js',
    jsVendor: 'vendor.js'
};

var PATHS = {
    dest: {
        global: './dist',
        imgFolder: 'img',
        prodFolder: 'prod',
        devFolder: 'dev'
    },
    src: {
        assets: ['src/assets/**', '!src/assets/{img,img/**}'],
        html: './src/html/*.html',
        img: './src/assets/img/*',
        jsCode: './src/js/app/*.js',
        jsVendor: './src/js/vendor/*.js',
        scss: './src/scss/*.scss'
    }
};

var gulp = require('gulp'),
    autoprefixer = require('autoprefixer'),
    babel = require('gulp-babel'),
    babelify = require('babelify'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    cssnano = require('cssnano'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    livereload = require('gulp-livereload'),
    mqpacker = require('css-mqpacker'),
    pngquant = require('imagemin-pngquant'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify');

function html () {
    return gulp.src(PATHS.src.html)
        .pipe(livereload());
}
gulp.task('html', html);

function JSVendor (opts) {
    var targetFolder = opts.type === 'changed' ? PATHS.dest.devFolder : PATHS.dest.prodFolder;
    return gulp.src(PATHS.src.jsVendor)
        .pipe(concat(FILENAMES.jsVendor))
        .pipe(gulp.dest(PATHS.dest.global + '/' + targetFolder))
        .pipe(livereload());
}
gulp.task('JSVendor', JSVendor);

function JSCode (opts) {
    if (opts.type === 'changed') {
        // Development mode
        return gulp.src(PATHS.src.jsCode)
            .pipe(sourcemaps.init())
            .pipe(browserify({ transform: ['babelify'] }))
            .pipe(babel())
            .pipe(concat(FILENAMES.jsCode))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(PATHS.dest.global + '/' + PATHS.dest.devFolder))
            .pipe(livereload());
    } else {
        // Production mode
        return gulp.src(PATHS.src.jsCode)
            .pipe(browserify({ transform: ['babelify'] }))
            .pipe(babel())
            .pipe(concat(FILENAMES.jsCode))
            .pipe(uglify())
            .pipe(gulp.dest(PATHS.dest.global + '/' + PATHS.dest.prodFolder));
    }
}
gulp.task('concatJsCode', JSCode);

function copyAssets (opts) {
    var folder = opts.type === 'changed' ? PATHS.dest.devFolder : PATHS.dest.prodFolder;
    return gulp.src(PATHS.src.assets)
        .pipe(gulp.dest(PATHS.dest.global + '/' + folder));
}
gulp.task('copyAssets', copyAssets);

function cleanDist (opts) {
    var folder = opts.type === 'changed' ? PATHS.dest.devFolder : PATHS.dest.prodFolder;
    return del(PATHS.dest.global + '/' + folder);
}
gulp.task('cleanDist', cleanDist);

function minifyImages (opts) {
    var destFolder = PATHS.dest.global + '/' + (opts.type === 'changed' ? PATHS.dest.devFolder : PATHS.dest.prodFolder) + '/' + PATHS.dest.imgFolder;

    return gulp.src(PATHS.src.img)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5})
        ]))
        .pipe(gulp.dest(destFolder));
}
gulp.task('minifyImages', minifyImages);

function css (opts) {
    var postcssPlugins = [
        mqpacker({
            sort: true
        }),
        autoprefixer({
            browsers: ['last 1 version']
        }),
        cssnano({
            preset: ['default', {
                discardComments: {
                    removeAll: true
                }
            }]
        })
    ];

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

function images () {
    return gulp.src(PATHS.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(PATHS.dest.img));
}
gulp.task('images', images);

gulp.task('dev', function () {
    var devOptions = { type: 'changed' };
    // Launches tasks once before watching (creates files if needed)
    cleanDist(devOptions)
        .then(function () {
            minifyImages(devOptions);
            copyAssets(devOptions);
            minifyImages(devOptions);
            copyAssets(devOptions);
            css(devOptions);
            JSVendor(devOptions);
            JSCode(devOptions);
            html(devOptions);
        }).catch(function (err) {
            throw new err;
        });

    if (ENABLE_LIVE_RELOAD) {
        livereload.listen({
            start: true
        });
    }

    gulp.watch(PATHS.src.jsVendor, function (opts) { JSVendor(opts); });
    gulp.watch(PATHS.src.jsCode, function (opts) { JSCode(opts); });
    gulp.watch(PATHS.src.scss, function (opts) { css(opts); });
    gulp.watch(PATHS.src.assets, function (opts) { copyAssets(opts); });
    gulp.watch(PATHS.src.img, function (opts) { minifyImages(opts); });
    gulp.watch(PATHS.src.html, function (opts) { html(opts); });
});

/**
 * Production task
 */
gulp.task('prod', function () {
    var prodOptions = { type: '' };
    
    // cleaningTask
    cleanDist(prodOptions)
        .then(function () {
            minifyImages(prodOptions);
            copyAssets(prodOptions);
            css(prodOptions);
            JSVendor(prodOptions);
            JSCode(prodOptions);
        })
        .catch(function (err) {
            throw new err;
        });
});

gulp.task('watch', ['dev']);
gulp.task('build', ['prod']);

/**
 * Default task
 */
gulp.task('default', ['css', 'JSVendor', 'concatJsCode', 'images'], function () {});
