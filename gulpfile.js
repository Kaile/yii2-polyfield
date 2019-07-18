var gulp = require('gulp');
var uglify = require('gulp-uglify');
var coffee = require('gulp-coffee');
var rename = require('gulp-rename');

gulp.task('coffee', function () {
    return gulp.src('./src/coffee/*.coffee')
        .pipe(coffee({
            transpile: {
                presets: [
                    'env'
                ]
            }
        }))
        .pipe(gulp.dest('./web/js/'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./web/js/'));
});

gulp.task('coffee:watch', function () {
    gulp.watch('./src/coffee/*.coffee', gulp.task('coffee'));
});