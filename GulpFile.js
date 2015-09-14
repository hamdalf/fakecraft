'use strict';

var gulp = require('gulp');
var less = require('gulp-less');

gulp.task('less', function () {
  gulp.src('./static/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('./static/'));
});

gulp.task('less:watch', function () {
  gulp.watch('./static/**/*.less', ['less']);
});