var gulp        = require('gulp');
var plugins     = require('gulp-load-plugins')();
var babel       = require('gulp-babel');
var minifyCss   = require('gulp-mini-css');
var uglify      = require('uglify-js-harmony');
var minifyJs    = require('gulp-uglify/minifier');
var rename      = require('gulp-rename');

var sassPaths = [
    'bower_components/foundation-sites/scss',
    'bower_components/foundation-perfect-scrollbar/src/scss'
];

gulp.task('sass', function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(plugins.sass({
            includePaths: sassPaths
        })
            .on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({
            browsers: [
                'last 2 versions',
                'ie >= 9',
                'Android >= 2.3'
            ]
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-css', function () {
    return gulp.src(['dist/css/**/*.css', '!dist/css/**/*.min.css'])
        .pipe(minifyCss({ext: '.min.css'}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-js', function () {
    return gulp.src(['dist/js/**/*.js', '!dist/js/**/*.min.js'])
        //.pipe(minifyJs({}, uglify))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('babel', function () {
    return gulp.src(['src/js/**/*.js'])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('default', ['babel', 'minify-js', 'sass', 'minify-css'], function () {
    gulp.watch(['src/js/**/*.js'], ['babel']);
    gulp.watch(['dist/js/**/*.js', '!dist/js/**/*.min.js'], ['minify-js']);
    gulp.watch(['src/scss/**/*.scss'], ['sass']);
    gulp.watch(['dist/css/**/*.css', '!dist/css/**/*.min.css'], ['minify-css']);
});
