const gulp   = require('gulp');
const ts     = require('gulp-typescript');
const tslint = require('gulp-tslint');
const gutil  = require('gulp-util');
const uglify = require('gulp-uglify');
const pump   = require('pump');
const del    = require('del');
const rs     = require('run-sequence');
const cfg    = require('./config');

const CONFIG = {
    SOURCE_DIR: cfg.sourceDir, 
    BUILD_DIR: cfg.buildDir,

    TS_CONFIG_FILE: 'tsconfig.json'
};

CONFIG.TS_FILES = `${CONFIG.SOURCE_DIR}/**/*.ts`;

const tsProject = ts.createProject(CONFIG.TS_CONFIG_FILE);

gulp.task('tslint', (cb) =>
    pump([
        gulp.src(CONFIG.TS_FILES),
        tslint(),
        tslint.report()
    ])
);

gulp.task('build-typescript', () => {
    const tsResult = tsProject.src().pipe(tsProject());
    return pump([
        tsResult.js,
        cfg.isProduction ? uglify() : gutil.noop(),
        gulp.dest(CONFIG.BUILD_DIR)
    ]);
});

gulp.task('clean', () => del('./dist'));

gulp.task('watch', () => {
    gulp.watch(CONFIG.TS_FILES, ['build-typescript']);
});

gulp.task('lint', ['tslint']);
gulp.task('build', ['build-typescript']);
gulp.task('default', (cb) => rs('clean', 'build', 'watch', cb));
