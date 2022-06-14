const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins');
const source = require('vinyl-source-stream');
const sass = require('gulp-sass')(require('sass'));

/* ----------------- */
/* Scripts
/* ----------------- */

gulp.task('scripts', function () {
    return browserify({
        'entries': ['./src/scripts/main.js'],
        'debug': true,
        'paths': [
            './node_modules',
            './src/scripts',
            './src/scripts/lib'
        ],
        'transform': [
            babelify.configure({
                'presets': ['@babel/preset-env']
            })
        ]
    })
        .require("./src/scripts/lib/jquery", {expose: "jquery"})
        .bundle()
        .on('error', function () {
            var args = Array.prototype.slice.call(arguments);

            plugins().notify.onError({
                'title': 'Compile Error',
                'message': '<%= error.message %>'
            }).apply(this, args);

            this.emit('end');
        })
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(plugins().sourcemaps.init({'loadMaps': true}))
        .pipe(plugins().sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/'));
});


/* ----------------- */
/* Styles
/* ----------------- */

gulp.task('styles', function () {
    return gulp.src('./src/styles/**/*.scss')
        .pipe(plugins().sourcemaps.init())
        .pipe(sass())
        .pipe(plugins().postcss([
            require('autoprefixer')
        ]))
        .pipe(plugins().sourcemaps.write())
        .pipe(gulp.dest('./dist/'));
});


/* ----------------- */
/* Cssmin
/* ----------------- */

gulp.task('cssmin', function () {
    return gulp.src('./src/styles/**/*.scss')
        .pipe(sass())
        .pipe(plugins().postcss([
            require('autoprefixer'),
            require('cssnano')
        ]))
        .pipe(gulp.dest('./dist/'));
});


/* ----------------- */
/* Jsmin
/* ----------------- */

gulp.task('jsmin', () => {
    var envs = plugins().env.set({
        'NODE_ENV': 'production'
    });

    return browserify({
        'entries': ['./src/scripts/main.js'],
        'debug': false,
        'paths': [
            './node_modules',
            './src/scripts',
            './src/scripts/lib'
        ],
        'transform': [
            babelify.configure({
                'presets': ['@babel/preset-env']
            })
        ]
    })
        .require("./src/scripts/lib/jquery", {expose: "jquery"})
        .bundle()
        .pipe(source('main.js'))
        .pipe(envs)
        .pipe(buffer())
        .pipe(plugins().uglify())
        .pipe(envs.reset)
        .pipe(gulp.dest('./dist/'));
});

/* ----------------- */
/* Taks
/* ----------------- */


gulp.task('development', gulp.parallel('scripts', 'styles', function developmentWatch () {
    gulp.watch('./src/styles/**/*.scss', gulp.parallel('styles'));
    gulp.watch('./src/scripts/**/*.js', gulp.parallel('scripts'));
}));

gulp.task('default', gulp.series('development'));
gulp.task('production', gulp.parallel('cssmin', 'jsmin'));