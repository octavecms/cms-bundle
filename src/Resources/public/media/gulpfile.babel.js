import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import source from 'vinyl-source-stream';


/* ----------------- */
/* Development
/* ----------------- */

gulp.task('development', ['scripts', 'styles'], () => {
    gulp.watch('./src/styles/**/*.scss', ['styles']);
    gulp.watch('./src/scripts/**/*.js', ['scripts']);
});


/* ----------------- */
/* Scripts
/* ----------------- */

gulp.task('scripts', () => {
    return browserify({
        'entries': [
            './src/scripts/main.js'
        ],
        'debug': true,
        'paths': [
            './node_modules',
            './src/scripts',
            './src/scripts/lib'
        ],
        'transform': [
            babelify.configure({
                'presets': ['es2015']
            })
        ]
    })
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
        .pipe(plugins().sass().on('error', plugins().sass.logError))
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
        .pipe(plugins().sass().on('error', plugins().sass.logError))
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
        'entries': [
            './src/scripts/main.js'
        ],
        'debug': false,
        'paths': [
            './node_modules',
            './src/scripts',
            './src/scripts/lib'
        ],
        'transform': [
            babelify.configure({
                'presets': ['es2015']
            })
        ]
    })
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

gulp.task('default', ['development']);
gulp.task('production', ['cssmin', 'jsmin']);