var gulp = require('gulp-param')(require('gulp'), process.argv);
var less = require('gulp-less');
var watch = require('gulp-watch');
var path = require('path');
var browserSync = require('browser-sync').create();



function swallowError (error) {

    //If you want details of the error in the console
    console.log(error.toString());

    this.emit('end');
}

gulp.task('less', function () {
	return gulp.src('less/main.less')  // only compile the entry file
		.pipe(less({
			paths: [path.join(__dirname + "less/")]
		}))
		.on('error', swallowError)
		.pipe(gulp.dest('css/'))
		.pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('watch', function () {
	gulp.watch('less/*.less', ['less']);  // Watch all the .less files, then run the less task
});

gulp.task('browser-sync', function () {
	browserSync.init({
		proxy: "parkeer.widget"
	});
});



gulp.task('default', ['watch', 'browser-sync']);



