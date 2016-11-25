const gulp  = require('gulp');
const ts    = require('gulp-typescript');
const cfg   = require('./config');

const CONFIG = {
    SOURCE_DIR: cfg.sourceDir, 
    BUILD_DIR: cfg.buildDir,

    TS_CONFIG_FILE: 'tsconfig.json'
};

const tsProject = ts.createProject(CONFIG.TS_CONFIG_FILE);

gulp.task('build-typescript', () => {
    const tsResult = tsProject.src().pipe(tsProject());
    return tsResult.js.pipe(gulp.dest(CONFIG.BUILD_DIR))
});

gulp.task('watch', () => {
    gulp.watch(`${CONFIG.SOURCE_DIR}/**/*.ts`, ['build-typescript'])
})

gulp.task('build', ['build-typescript']);
gulp.task('default', ['build', 'watch']);
