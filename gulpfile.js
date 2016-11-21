const gulp  = require('gulp');
const ts    = require('gulp-typescript');

const CONFIG = {
    SOURCE_DIR: './src', 
    BUILD_DIR: './dist',

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
