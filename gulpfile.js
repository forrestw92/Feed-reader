const gulp = require('gulp');
const inject = require('gulp-inject');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const clean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const runSequence = require('run-sequence');

const testFiles = 'test/spec/feedreader.js';
const jasmineCSS = 'src/jasmine/lib/jasmine-2.1.2/jasmine.css';
const jasmineJS = ['src/jasmine/lib/jasmine-2.1.2/jasmine.js', 'src/jasmine/lib/jasmine-2.1.2/jasmine-html.js', 'src/jasmine/lib/jasmine-2.1.2/boot.js'];

let debug = true;
gulp.task('production', function () {
    debug = false;
});
gulp.task('copyHtml', function () {
    return gulp.src('src/*.html')
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true,
        }))
        .pipe(gulp.dest(((debug) ? 'tmp' : 'dist')));
});
gulp.task('copyJavascript', function () {
    return gulp.src('src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest(((debug) ? 'tmp/js' : 'dist/js')));
});
gulp.task('copyCss', () => {
    gulp.src('src/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest(((debug) ? 'tmp/css' : 'dist/css')));
});
gulp.task('copyFonts', () => {
    gulp.src('src/fonts/*')
        .pipe(gulp.dest(((debug) ? 'tmp/fonts' : 'dist/fonts')));
});
gulp.task('copyJasmine', () => {
    gulp.src('src/jasmine/**/*')
        .pipe(gulp.dest('tmp/jasmine'));
});
gulp.task('copyTest', () => {
    gulp.src(testFiles)
        .pipe(gulp.dest('tmp/test/spec'));
});
gulp.task('clean:test', function () {
    return gulp.src('tmp/', {read: false})
        .pipe(clean());
});
gulp.task('clean:dist', function () {
    return gulp.src('dist/', {read: false})
        .pipe(clean());
});
gulp.task('test', function () {
    return gulp.src('src/index.html')
        .pipe(inject(gulp.src(jasmineJS, {read: false}), {name: 'head', relative: true}))
        .pipe(inject(gulp.src(jasmineCSS, {read: false}), {relative: true}))
        .pipe(inject(gulp.src(testFiles, {read: false})))
        .pipe(gulp.dest('tmp'));
});

gulp.task('build', function () {
    runSequence('clean:test', 'clean:dist', 'production', ['copyHtml', 'copyCss', 'copyFonts', 'copyJavascript']);
});
gulp.task('serve:build', function () {
    runSequence('clean:dist', 'production', ['copyHtml', 'copyCss', 'copyFonts', 'copyJavascript'], function () {
        browserSync.init({
            server: './dist'
        });
        watch('src/**/*', function () {
            runSequence('production', ['copyHtml', 'copyCss', 'copyFonts', 'copyJavascript'], function () {
                browserSync.reload();
            });
        });
    });
});
gulp.task('serve:test', function () {

    runSequence('clean:test', ['copyHtml', 'copyCss', 'copyFonts', 'copyJasmine', 'copyJavascript', 'copyTest'], 'test', function () {
        browserSync.init({
            server: './tmp'
        });
        watch(['src/**/*'], function () {
            runSequence('production', ['copyHtml', 'copyCss', 'copyFonts', 'copyJavascript'],'test', function () {
                browserSync.reload();
            });
        });
        watch(testFiles, function () {
            runSequence('production', [ 'copyTest'], function () {
                browserSync.reload();
            });
        });
    });
});