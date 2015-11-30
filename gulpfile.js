var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	bower = require('main-bower-files'),
	concat = require('gulp-concat'),
	del = require('del'),
	ghPages = require('gulp-gh-pages'),
	htmlmin = require('gulp-htmlmin'),
	imagemin = require('gulp-imagemin'),
	inject = require('gulp-inject'),
	livereload = require('gulp-livereload'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	series = require('stream-series'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch');

var paths = {
	js: './src/js/',
	scss: './src/scss/',
	img: './src/img/',
	html: './src/',
	dest: './dist/'
};

var injectParams = {
	file: 'index.html',
	options: {relative: true, read: false}
};

var scssLoadPaths = [
	paths.scss,
	'./bower_components/font-awesome/scss/'
];

// Scripts
gulp.task('js:clean', function(cb) {
	return del([paths.dest + '**/*.js'], cb);
});
gulp.task('js:lib', ['js:clean'], function(){
	return gulp.src(bower('**/*.js'))
		.pipe(concat('lib.js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dest + 'js'));
});
gulp.task('js', ['js:lib'], function () {
	return gulp.src(paths.js + '**/*.js')
		.pipe(concat('main.js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dest + 'js'));
});

// Styles
gulp.task('css:clean', function(cb) {
	return del([paths.dest + '**/*.css'], cb);
});
gulp.task('css', ['css:clean'], function() {
	return gulp.src(paths.scss + 'styles.scss')
		.pipe(sass({
			outputStyle: 'compressed',
			includePaths: scssLoadPaths
		}))
		.on('error', sass.logError)
		.pipe(autoprefixer('last 2 versions', 'ie 9', 'ios 6', 'android 4'))
		.pipe(concat('styles.css'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.dest + 'css'));
});

// Fonts
gulp.task('fonts:clean', function(cb) {
	return del([paths.dest + 'fonts/**/*'], cb);
});
gulp.task('fonts', ['fonts:clean'], function(){
	return gulp.src(bower('**/*.{eot,svg,ttf,woff,woff2}'))
		.pipe(gulp.dest(paths.dest + 'fonts'));
});

// Images
gulp.task('img:clean', function(cb) {
	return del([paths.dest + 'img/**/*'], cb);
});
gulp.task('img', ['img:clean'], function() {
	return gulp.src(paths.img + '**/*.{jpg,png,gif}')
		.pipe(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true }))
		.pipe(gulp.dest(paths.dest + 'img'));
});

// Html
gulp.task('html:clean', function(cb) {
	return del([paths.dest + '*.html'], cb);
});
gulp.task('html', ['html:clean'], function() {
	return gulp.src(paths.html + '*.html')
		.pipe(gulp.dest(paths.dest));
});

// Inject
gulp.task('inject', ['css','js','html'], function () {
	var target = gulp.src(paths.dest + injectParams.file),
		sources = gulp.src([paths.dest + '**/*.css', paths.dest + '**/*.js'], {read: false});

	return target.pipe(inject(sources, injectParams.options))
		.pipe(gulp.dest(paths.dest));
});

// Deploy
gulp.task('deploy', function() {
	return gulp.src(paths.dest + '**/*')
		.pipe(ghPages({
			branch: 'master'
		}));
});

gulp.task('watch', function() {
	// Listen on port 35729
	livereload.listen(35729, function (err) {
		if (err) {
			return console.log(err)
		};

		gulp.watch([paths.js + '**/*.js', './bower_components/' + '**/*.js'], ['js']);
		gulp.watch([paths.scss + '**/*.scss'], ['css']);
		gulp.watch([paths.html + '*.html'], ['html']);
	});
});

gulp.task('default', ['img','fonts','inject','watch']);