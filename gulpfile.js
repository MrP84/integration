var enableLivereload = true;
var enableImageCompression = true;

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    jqc = require('gulp-jquery-closure'),
    minifyCSS = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    babel = require('gulp-babel'),
    combineMq = require('gulp-combine-mq');

/**
 * Dev tasks
 */
gulp.task('html', function () {
    gulp.src('*.html')
        .pipe(livereload());
});

gulp.task('sass', function () {
    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(combineMq({ beautify: true }))
        .pipe(gulp.dest('./css'))
        .pipe(livereload());
});

gulp.task('concatLibs', function () {
    gulp.src('./js/lib/*.js')
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('./js'))
        .pipe(babel({ presets: ['babel-preset-es2015'].map(require.resolve) }))
        .pipe(livereload());
});

gulp.task('concatApp', function () {
    gulp.src('./js/app/*.js')
        .pipe(concat('app.js'))
        .pipe(jqc({$: false, window: true, document: true, undefined: true}))
        .pipe(gulp.dest('./js'))
        .pipe(babel({ presets: ['babel-preset-es2015'].map(require.resolve) }))
        .pipe(livereload());
});

gulp.task('images', function () {
    gulp.src('./img/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('./img'));
});

gulp.task('watch', function () {
    // Launches tasks once before watching (creates files if needed)
    gulp.start('sass');
    gulp.start('concatLibs');
    gulp.start('concatApp');
    gulp.start('html');

    if (enableLivereload) {
        livereload.listen({
            start: true
        });
    }

    gulp.watch('js/lib/*.js', ['concatLibs']);
    gulp.watch('js/app/*.js', ['concatApp']);
    gulp.watch('scss/*.scss', ['sass']);
    gulp.watch('*.html', ['html']);
});

/**
 * Production task
 */
gulp.task('build', function () {
    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(combineMq({ beautify: false }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./css'));

    gulp.src('./js/lib/*.js')
        .pipe(concat('lib.js'))
        .pipe(uglify())
        .pipe(babel({ presets: ['babel-preset-es2015'].map(require.resolve) }))
        .pipe(gulp.dest('./js'));

    gulp.src('./js/app/*.js')
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(jqc({$: false, window: true, document: true, undefined: true}))
        .pipe(babel({ presets: ['babel-preset-es2015'].map(require.resolve) }))
        .pipe(gulp.dest('./js'));

    if (enableImageCompression) gulp.start('images');
});

/**
 * Default task
 */
gulp.task('default', ['sass', 'concatLibs', 'concatApp', 'watch', 'images'], function () {});
