'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync'); // Local server and live reload
var browserify = require('browserify'); // Bundles JS
var source = require('vinyl-source-stream'); // User conventional text streams with Gulp
var sass = require('gulp-sass'); // Scss compiler
var cleanCss = require('gulp-clean-css'); // Minify CSS
var sourceMaps = require('gulp-sourcemaps'); // Sourcemaps
var eslint = require('gulp-eslint'); // JS and JSX linting
var autoprefixer = require('gulp-autoprefixer'); // Browser vendor prefixes
var uglify = require('gulp-uglify'); // Minify and mangle JS
var streamify = require('gulp-streamify'); // Stream functionality for old plugins
var rename = require('gulp-rename'); // Rename flies

// Config
var config = {
    devBaseUrl: 'http://localhost',
    port: 9015,
    paths: {
        js: './app/components/**/*.js',
        appJS: './app/components/app.js',
        scss: './app/assets/sass/**/*.scss',
        vendorJS: './app/assets/vendor/**/*.js',
        appRoot: './app',
        assets: './app/assets',
        views: './app/views'
    }    
};

gulp.task('browser-sync', function() {
	browserSync.init(null, {
        server: config.paths.appRoot,
        logFileChanges: false
	});
});

// AngularJS bundle
gulp.task('bundleJS', function() {
    return browserify({
        entries: config.paths.appJS,
        debug: true
    })
    .bundle()
    .on('error', console.error.bind(console))
    .pipe(source('main.js'))
    .pipe(streamify(sourceMaps.init({loadMaps: true})))
    .pipe(streamify(uglify({mangle: false})))
    .pipe(streamify(sourceMaps.write()))
    .pipe(gulp.dest(config.paths.appRoot + '/release'));
});

gulp.task('sass', function() {
    return gulp.src(config.paths.scss)
        .pipe(sourceMaps.init())
        .pipe(sass({
            includePaths: [
                config.paths.assets + '/sass'
            ],
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(cleanCss())
        .pipe(sourceMaps.write())
        .pipe(autoprefixer())
        .pipe(gulp.dest(config.paths.assets + '/stylesheets'))
        .pipe(browserSync.stream());
});

gulp.task('eslint', function() {
    return gulp.src(config.paths.js)
        .pipe(eslint({config: 'package.json'}))
        .pipe(eslint.format());
});

gulp.task('watch', function() {
    gulp.watch(config.paths.js, ['bundleJS']);
    gulp.watch(config.paths.scss, ['sass']);
    gulp.watch([config.paths.appRoot + '/**/*.html', config.paths.appRoot + '/**/*.js']).on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync', 'bundleJS', 'sass', 'watch']);