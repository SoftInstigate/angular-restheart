var gulp = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

gulp.task('default', function(callback) {
    runSequence('build', callback);
});

gulp.task('build', function (callback) {
    runSequence(
        'clean',
        'copy-build',
        callback);
});


gulp.task('clean', function () {
    return del(['./dist'], {force: true});
});

gulp.task('copy-build', [ 'concat-js','concat-min-js']);


gulp.task('concat-js', function () {
    return gulp.src(['./angular-restheart.module.js','./angular-restheart.config.js','./services/**/*.js','!node_modules{,/**}','!example/{,/**}','!gulpfile.js'])
        .pipe(concat('angular-restheart.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('concat-min-js', function () {
    return gulp.src(['./angular-restheart.module.js','./angular-restheart.config.js','./services/**/*.js','!node_modules{,/**}','!example/{,/**}','!gulpfile.js'])
        .pipe(concat('angular-restheart.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
});
