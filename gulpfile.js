var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	bower = require('main-bower-files'),
	cloudflare = require('gulp-cloudflare'),
	concat = require('gulp-concat'),
	del = require('del'),
	download = require('gulp-download'),
	ghPages = require('gulp-gh-pages'),
	htmlmin = require('gulp-htmlmin'),
	i18n = require('gulp-html-i18n'),
	imagemin = require('gulp-imagemin'),
	inject = require('gulp-inject'),
	livereload = require('gulp-livereload'),
	minifyCss = require('gulp-minify-css'),
	rename = require('gulp-rename'),
	sass = require('gulp-sass'),
	series = require('stream-series'),
	smoosher = require('gulp-smoosher'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch');

var config = require('./gulpconfig.json');

// Scripts
gulp.task('js:clean', function(cb) {
	return del([config.destinationPath + '**/*.js'], cb);
});
gulp.task('js:lib', ['js:clean'], function(){
	return gulp.src(bower('**/*.js'))
		.pipe(concat('lib.js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest(config.destinationPath + 'js'));
});
gulp.task('js', ['js:lib'], function () {
	return gulp.src(config.sourcePaths.js + '**/*.js')
		.pipe(concat('main.js'))
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(gulp.dest(config.destinationPath + 'js'));
});

// Styles
gulp.task('css:clean', function(cb) {
	return del([config.destinationPath + '**/*.css'], cb);
});
gulp.task('css', ['css:clean'], function() {
	return gulp.src(config.sourcePaths.scss + 'styles.scss')
		.pipe(sass({
			outputStyle: 'compressed',
			includePaths: config.loadPaths
		}))
		.on('error', sass.logError)
		.pipe(autoprefixer('last 2 versions', 'ie 9', 'ios 6', 'android 4'))
		.pipe(concat('styles.css'))
		.pipe(minifyCss({compatibility: 'ie9'}))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(config.destinationPath + 'css'));
});

// Fonts
gulp.task('fonts:clean', function(cb) {
	return del([config.destinationPath + 'fonts/**/*'], cb);
});
gulp.task('fonts', ['fonts:clean'], function(){
	return gulp.src(bower('**/*.{eot,svg,ttf,woff,woff2}'))
		.pipe(gulp.dest(config.destinationPath + 'fonts'));
});

// Images
gulp.task('img:clean', function(cb) {
	return del([config.destinationPath + 'img/**/*'], cb);
});
gulp.task('img', ['img:clean'], function() {
	return gulp.src(config.sourcePaths.img + '**/*.{jpg,png,gif}')
		.pipe(imagemin({ optimizationLevel: 7, progressive: true, interlaced: true }))
		.pipe(gulp.dest(config.destinationPath + 'img'));
});

// Html
gulp.task('html:clean', function(cb) {
	return del([config.destinationPath + '**/*.html'], cb);
});
gulp.task('html', ['html:clean'], function() {
	return gulp.src(config.sourcePaths.html + '*.html')
		.pipe(htmlmin({collapseWhitespace: true, minifyJS: true}))
		.pipe(gulp.dest(config.destinationPath));
});

// Inject
gulp.task('inject', ['css','js','html'], function() {
	var target = gulp.src(config.destinationInject, {base: config.destinationPath}),
		sources = gulp.src([config.destinationPath + '**/*.css', config.destinationPath + '**/*.js'], {read: false});

	return target
		.pipe(inject(sources, {relative: true, read: false}))
		.pipe(smoosher())
		.pipe(gulp.dest(config.destinationPath));
});

// Translate html
gulp.task('translate', ['inject'], function() {
	return gulp.src(config.destinationInject, {base: config.destinationPath})
		.pipe(i18n({
			langDir: './lang',
			createLangDirs: true
		}))
		.pipe(gulp.dest(config.destinationPath));
});
// gulp.task('translate', ['translate:build'], function(cb) {
// 	return del([config.destinationPath + '*.html'], cb);
// });

// Deploy
gulp.task('fetch-google-analytics', function() {
	return download('https://www.google-analytics.com/analytics.js')
    	.pipe(gulp.dest(config.destinationPath + 'js'));
});
gulp.task('purge-cache-cloudflare', function() {
	var options = {
		token: config.cloudflare.token,
		email: config.cloudflare.email,
		domain: config.cloudflare.domain
	};

	cloudflare(options);
});
gulp.task('deploy', ['purge-cache-cloudflare','fetch-google-analytics'], function() {
	return gulp.src(config.destinationPath + '**/*')
		.pipe(ghPages({
			branch: 'master'
		}));
});

// Watch
gulp.task('watch', function() {
	// Listen on port 35729
	livereload.listen(35729, function (err) {
		if (err) {
			return console.log(err)
		};

		gulp.watch([config.sourcePaths.js + '**/*.js', './bower_components/' + '**/*.js'], ['js']);
		gulp.watch([config.sourcePaths.scss + '**/*.scss'], ['smoosher']);
		gulp.watch([config.sourcePaths.html + '*.html'], ['html']);
	});
});

// Default
gulp.task('default', ['img','fonts','translate','watch']);