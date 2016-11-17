const gulp  = require('gulp');
const ts    = require('gulp-typescript');

const SOURCE_DIR = './src';
const BUILD_DIR = './dist'

const CONFIG = {
    typescript: {
        target: 'ES6',
        module: 'commonjs'
    }
}

gulp.task('build-typescript', () => gulp
    .src(`${SOURCE_DIR}/**/*.ts`)
    .pipe(ts(CONFIG.typescript))
    .pipe(gulp.dest(BUILD_DIR))
);

gulp.task('watch', () => {
    gulp.watch(`${SOURCE_DIR}/**/*.ts`, ['build-typescript'])
})

gulp.task('build', ['build-typescript']);
gulp.task('default', ['build', 'watch']);
