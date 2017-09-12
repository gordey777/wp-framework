'use strict';
/* if work with html set TRUE, else - FALSE */
const htmlOWp = true;

/* import dependencies */
import config from 'config';

import gulp from 'gulp';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';

const reload = browserSync.reload;
const plugins = require("gulp-load-plugins")({
  pattern: ['gulp-*', 'gulp.*'],
  replaceString: /\bgulp[\-.]/
});

if (htmlOWp === false) {
  config.path.base.dest = './wordpress/wp-content/themes/' + config.theme + '/';
}

let basePaths = '';

var paths = {
  scripts: {
    src: basePaths.src + 'js/**',
    dest: basePaths.dest + 'js/'
  },
  styles: {
    src: basePaths.src + 'scss/',
    css: basePaths.src + 'css/',
    dest: basePaths.dest + 'css/'
  },
  fonts: {
    src: basePaths.src + 'fonts/**',
    dest: basePaths.dest + 'fonts/'
  },
  sprite: {
    src: basePaths.src + 'sprite/*'
  }
};

// Optimize images
gulp.task('images', function() {
  return gulp
		.src(config.path.images.srcimg)
		.pipe(plugins.newer(config.path.images.dest))
    .pipe(plugins.imagemin([
      plugins.imagemin.gifsicle({ interlaced: true }),
      plugins.imagemin.jpegtran({ progressive: true }),
      plugins.imagemin.optipng({ optimizationLevel: 5 }),
      plugins.imagemin.svgo({ plugins: [{ removeViewBox: true }] })
    ]))
		.pipe(plugins.size({ showFiles: true, title: 'task:images' }))
		.pipe(gulp.dest(config.path.images.dest));
});


// Custom Plumber function for catching errors
function customPlumber(errTitle) {
  return plugins.plumber({
    errorHandler: plugins.notify.onError({
      // Customizing error title
      title: errTitle || 'Error running Gulp',
      message: 'Error: <%= error.message %>',
      sound: "Bottle"
    })
  });
};
module.exports = customPlumber;
