var ENABLE_LIVE_RELOAD = true;
var ENABLE_IMAGE_COMPRESSION = true;

var FILENAMES = {
    jsCode: 'app.js',
    jsVendor: 'vendor.js'
};

var PATHS = {
    dest: {
        global: './dist',
        img: './dist/img'
    },
    src: {
        assets: './src/assets/*',
        html: './src/html/*.html',
        img: './src/img/*',
        jsCode: './src/js/app/*.js',
        jsVendor: './src/js/vendor/*.js',
        scss: './src/scss/*.scss'
    }
};

var gulp = require('gulp'),
    autoprefixer = require('autoprefixer'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    cssnano = require('cssnano'),
    imagemin = require('gulp-imagemin'),
    livereload = require('gulp-livereload'),
    mqpacker = require('css-mqpacker'),
    pngquant = require('imagemin-pngquant'),
    postcss = require('gulp-postcss'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify');

// TODO
// Tâches de copie des assets (tout sauf images qui ont leur propre tâche)
// Source maps
// Tâche de build
// Vendor CSS
// Dossier JS 'specifics' ?

gulp.task('html', function () {
    return gulp.src(PATHS.src.html)
        .pipe(livereload());
});

gulp.task('concatJsVendor', function () {
    return gulp.src(PATHS.src.jsVendor)
        .pipe(concat(FILENAMES.jsVendor))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest(PATHS.dest.global))
        .pipe(livereload());
});

gulp.task('concatJsCode', function () {
    return gulp.src(PATHS.src.jsCode)
        .pipe(concat(FILENAMES.jsCode))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest(PATHS.dest.global))
        .pipe(livereload());
    });

gulp.task('css', function () {
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

    return gulp.src(PATHS.src.scss)
        .pipe(sass())
        .pipe(postcss(postcssPlugins))
        .pipe(gulp.dest(PATHS.dest.global))
        .pipe(livereload());
});

gulp.task('images', function () {
    return gulp.src(PATHS.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(PATHS.dest.img));
});

gulp.task('watch', function () {
    // // Launches tasks once before watching (creates files if needed)
    gulp.start('css');
    gulp.start('concatJsVendor');
    gulp.start('concatJsCode');
    gulp.start('html');

    if (ENABLE_LIVE_RELOAD) {
        livereload.listen({
            start: true
        });
    }

    gulp.watch(PATHS.src.jsVendor, ['concatJsVendor']);
    gulp.watch(PATHS.src.jsCode, ['concatJsCode']);
    gulp.watch(PATHS.src.scss, ['css']);
    gulp.watch(PATHS.src.html, ['html']);
});

/**
 * Production task
 */
gulp.task('build', function () {
    gulp.src(PATHS.src.scss)
        .pipe(sass())
        // TODO: add CSS task
        .pipe(gulp.dest(PATHS.dest.global));

    gulp.src(PATHS.src.jsVendor)
        .pipe(concat(FILENAMES.jsVendor))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(PATHS.dest.global));

    gulp.src(PATHS.src.jsCode)
        .pipe(concat(FILENAMES.jsCode))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(PATHS.dest.global));

    if (ENABLE_IMAGE_COMPRESSION) {
        gulp.start('images');
    }
});

/**
 * Default task
 */
gulp.task('default', ['css', 'concatJsVendor', 'concatJsCode', 'images'], function () {});
