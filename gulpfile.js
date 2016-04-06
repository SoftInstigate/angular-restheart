/**
 * IMPORTANT: set the version number here when ready for a new release
 * then run the 'gulp build' task to update both bower.json and package.json
 * See the README.md file for more information.
 */
var VERSION = '1.2.2';

var gulp = require('gulp'),
   del = require('del'),
   runSequence = require('run-sequence'),
   concat = require('gulp-concat'),
   uglify = require('gulp-uglify'),
   bump = require('gulp-bump');

// Update bower, component, npm at once:
gulp.task('bump', function() {
   gulp.src(['./bower.json', './component.json', './package.json'])
      .pipe(bump({
         version: VERSION
      }))
      .pipe(gulp.dest('./'));
});

gulp.task('default', function(callback) {
   runSequence('build', callback);
});

gulp.task('build', function(callback) {
   runSequence(
      'clean',
      'bump',
      'copy-build',
      callback);
});


gulp.task('clean', function() {
   return del(['./dist'], {
      force: true
   });
});

gulp.task('copy-build', ['concat-js', 'concat-min-js']);


gulp.task('concat-js', function() {
   return gulp.src(['./angular-restheart.module.js', './angular-restheart.config.js', './services/**/*.js', '!node_modules{,/**}', '!example/{,/**}', '!gulpfile.js'])
      .pipe(concat('angular-restheart.js'))
      .pipe(gulp.dest('./dist'));
});

gulp.task('concat-min-js', function() {
   return gulp.src(['./angular-restheart.module.js', './angular-restheart.config.js', './services/**/*.js', '!node_modules{,/**}', '!example/{,/**}', '!gulpfile.js'])
      .pipe(concat('angular-restheart.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('./dist'));
});
