var gulp        =		require('gulp'),
		gutil       =		require('gulp-util'),
		es          =		require('event-stream'),
		livereload  =		require('gulp-livereload'),
		runSequence = 	require('run-sequence'),
		browserSync = 	require('browser-sync'),
		reload 			= 	browserSync.reload,
		plugins     = 	require("gulp-load-plugins")({
											pattern: ['gulp-*', 'gulp.*'],
											replaceString: /\bgulp[\-.]/
										});

var htmlOWp         = false,
		wpThemeName     = 'wp-framework',
		isProduction    = true,
		sassStyle       = 'compressed';

var AUTOPREFIXER_BROWSERS = [
  'ie >= 8', 'ie_mob >= 10', 'ff >= 20', 'chrome >= 24', 'safari >= 5', 'opera >= 12', 'ios >= 7', 'android >= 2.3', '> 1%', 'last 4 versions', 'bb >= 10'
];

if (htmlOWp == true) {
	var basePaths = {
		src: 'assets/',
		cache: 'application/templates_c/*.php',
		dest: './html/'
	};
}
else {
	var basePaths = {
		src: 'assets/',
		cache: 'application/templates_c/*.php',
		dest: './wordpress/wp-content/themes/' + wpThemeName + '/'
	};
}
var paths = {
		images: {
				src: basePaths.src + 'img/**',
				dest: basePaths.dest + 'img/'
		},
		scripts: {
				src: basePaths.src + 'js/**',
				dest: basePaths.dest + 'js/'
		},
		styles: {
				src: basePaths.src + 'sass/',
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
var appFiles = {
		styles: paths.styles.src + '*.scss',
		scripts: [paths.scripts.src + '*.js']
};
var spriteConfig = {
		imgName: 'sprite.png',
		cssName: '_sprite.scss',
		imgPath: paths.images.dest + 'sprite.png'
};

// WARN
if (gutil.env.dev === true) {
		sassStyle       =   'nested',
		isProduction    =   false;
}

var changeEvent = function(evt) {
	gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};

// Copy web fonts to dist
gulp.task('fonts', function () {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(plugins.size({title: 'fonts'}));
});

// Optimize images
gulp.task('image', function() {
	return gulp.src(paths.images.src)
		.pipe(plugins.cache(
			plugins.imageOptimization({
				optimizationLevel: 3,
				progressive: true,
				interlaced: true
			})
		))
		.pipe(gulp.dest(paths.images.dest))
		.pipe(plugins.size({showFiles:true}));
});

gulp.task('sprite', function () {
	var spriteData = gulp.src(paths.sprite.src).pipe(plugins.spritesmith({
		imgName: spriteConfig.imgName,
		cssName: spriteConfig.cssName,
		imgPath: spriteConfig.imgPath,
		cssVarMap: function (sprite) {
				sprite.name = 'sprite-' + sprite.name;
		}
	}));
	spriteData.img
		.pipe(plugins.size({showFiles:true}))
		.pipe(plugins.cache(
			plugins.imageOptimization({
				optimizationLevel: 3,
				progressive: true,
				interlaced: true
			})
		))
		.pipe(gulp.dest(paths.images.dest))
		.pipe(plugins.size({showFiles:true}))
		.pipe(plugins.webp())
		.pipe(gulp.dest(paths.images.dest+'webp/'))
		.pipe(plugins.size({showFiles:true}));
	spriteData.css.pipe(gulp.dest(paths.styles.src));
});

gulp.task('webp', function () {
	return gulp.src(paths.images.src)
		.pipe(plugins.webp())
		.pipe(gulp.dest(paths.images.dest+'webp/'))
		.pipe(plugins.size({showFiles:true}));
});

// Compile and automatically prefix stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src(appFiles.styles)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(plugins.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    // Concatenate and minify styles
    .pipe(plugins.if('*.css', plugins.csso()))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(livereload())
    .pipe(plugins.size({title: 'styles'}));
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src(paths.scripts.src)
    .pipe(reload({stream: true, once: true}))
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))

    // .pipe(plugins.if(!browserSync.active, plugins.jshint.reporter('fail')));
});




gulp.task('scripts', function(){
		gulp.src(appFiles.scripts)
				.pipe(plugins.concat('app.js'))
				.pipe(gulp.dest(paths.scripts.dest))
				.pipe(isProduction ? plugins.uglify() : gutil.noop())
				.pipe(plugins.size({showFiles:true}))
				.pipe(gulp.dest(paths.scripts.dest));
});







gulp.task('clearcache', function () {
		return gulp.src(basePaths.cache, {read: false})
				.pipe(plugins.wait(500))
				.pipe(plugins.rimraf());
});

// gulp.task('watch', ['sprite', 'clearcache', 'css', 'style', 'scripts', 'image', 'webp'], function(){
//     gulp.watch(appFiles.styles, ['css', 'style', 'clearcache']).on('change', function(evt) {
//         changeEvent(evt);
//     });
//     gulp.watch(paths.scripts.src + '*.js', ['scripts', 'clearcache']).on('change', function(evt) {
//         changeEvent(evt);
//     });
//     gulp.watch(paths.sprite.src, ['sprite', 'css', 'style', 'clearcache']).on('change', function(evt) {
//         changeEvent(evt);
//     });
//     gulp.watch(paths.images.src, ['image', 'webp', 'clearcache']).on('change', function(evt) {
//         changeEvent(evt);
//     });
// });

gulp.task('watch', ['css'], function(){
		gulp.watch(appFiles.styles, ['css']).on('change', function(evt) {
				changeEvent(evt);
		});
});

gulp.task('default', ['css', 'prefixr', 'scripts', 'image', 'clearcache']);







/*
 .pipe(plugins.browsersync.reload({stream:true, once:true}))

*/
