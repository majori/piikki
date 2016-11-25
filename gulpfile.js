const gulp   = require('gulp');
const ts     = require('gulp-typescript');
const tslint = require('gulp-tslint');
const cfg    = require('./config');

const CONFIG = {
    SOURCE_DIR: cfg.sourceDir, 
    BUILD_DIR: cfg.buildDir,

    TS_CONFIG_FILE: 'tsconfig.json'
};

CONFIG.TS_FILES = `${CONFIG.SOURCE_DIR}/**/*.ts`;

const tsProject = ts.createProject(CONFIG.TS_CONFIG_FILE);

gulp.task('tslint', () => 
    gulp.src(CONFIG.TS_FILES)
        .pipe(tslint())
        .pipe(tslint.report())
);

gulp.task('build-typescript', () => {
    const tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest(CONFIG.BUILD_DIR))
});

gulp.task('watch', () => {
    gulp.watch(CONFIG.TS_FILES, ['build-typescript'])
})

gulp.task('lint', ['tslint']);
gulp.task('build', ['build-typescript']);
gulp.task('default', ['build', 'watch']);
