var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync'); //.create();
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var notify = require('gulp-notify');
var size = require('gulp-size');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var minifyhtml = require('gulp-htmlmin');
var rename = require('gulp-rename');
var changed = require('gulp-changed');

// Check for --production flag
var isProduction = !!(argv.production);

var config = {
  //sassPath: './resources/assets/sass',
  bowerDir: 'vendor/bower_components'
}

var jsFiles = [
  config.bowerDir + '/jquery/dist/jquery.js',
  // This is the full bootstrap javascript library
  config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap.js',
  //
  // These are the single files
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/affix.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/alert.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/button.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/carousel.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/collapse.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/dropdown.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/modal.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/popover.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/scrollspy.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/tab.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/tooltip.js',
  //config.bowerDir + '/bootstrap-sass/assets/javascripts/bootstrap/transition.js',
  //config.bowerDir + '/motion-ui/dist/motion-ui.js',

  // AdminLTE full javascript file
  config.bowerDir + '/AdminLTE/dist/js/app.js',

  'resources/assets/js/main.js'
]

// Process sass files from resources/sass/styles.scss
// Autoprefix
gulp.task('sass', function() {

  const SRC = 'resources/assets/sass/*.scss';
  const DEST = 'public/assets/css/';

  return gulp.src(SRC)
    .pipe(changed(DEST)) // stream only changed files?? Does not work!! Check.
    //.pipe(plumber())
    //.pipe($.sourcemaps.init())
    //.pipe(debug({title: 'sass files:'}))
    .pipe(sass({
      outputStyle: 'expanded',
      precision: 8,
      includePaths: []
    }).on('error', notify.onError(function(error) {
      return 'Sass error: ' + error.message;
    })))
    .pipe(autoprefixer({
      browsers: [
        "Android 2.3",
        "Android >= 4",
        "Chrome >= 20",
        "Firefox >= 24",
        "Explorer >= 8",
        "iOS >= 6",
        "Opera >= 12",
        "Safari >= 6"
      ]
    }))
    .pipe(gulpif(isProduction, cssnano({
      discardComments: {
        removeAll: true
      },
      autoprefixer: false
    })))
    //.pipe($.sourcemaps.write())
    .pipe(gulp.dest(DEST))
    //.pipe(debug({title: 'css files:'}))
    .pipe(size({
      showFiles: true
    }))
    .pipe(browserSync.stream());

});

// Combine all javascript files into one file: js/main.js
gulp.task('javascript', function() {

  return gulp.src(jsFiles)
    //.pipe($.sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(gulpif(isProduction, uglify()))
    //.pipe(gulpif(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('public/assets/js'))
    .pipe(size({
      showFiles: true
    }))
    .pipe(browserSync.stream());
});

// Run all of the above tasks
gulp.task('build', ['sass', 'javascript']);

// Static Server + watching scss, php and javascript files
gulp.task('serve', ['build'], function() {

  browserSync.init({
    proxy: 'lara5.dev'
    //server: 'public/'
  });

  gulp.watch("resources/assets/sass/**/*.scss", ['sass']);
  gulp.watch("resources/assets/js/**/*.js", ['javascript']);

  gulp.watch([
    'app/**/*',
    'resources/**/*',
    'public/**/*'
  ]).on('change', browserSync.reload);
});

// Copy all files installed with bower
// to resources/assets nad to public /assets
gulp.task('copy', function() {

  // bootstrap framework
  gulp.src(config.bowerDir + '/bootstrap-sass/assets/stylesheets/**/*.*')
    .pipe(gulp.dest('resources/assets/sass/bootstrap'));

  // Fontawesome icons
  gulp.src(config.bowerDir + '/font-awesome/fonts/**/*.*')
    .pipe(gulp.dest('public/assets/fonts'));
  gulp.src(config.bowerDir + '/font-awesome/scss/**/*.*')
    .pipe(gulp.dest('resources/assets/sass/fa'));

  // Ion icons
  gulp.src(config.bowerDir + '/Ionicons/fonts/**/*.*')
    .pipe(gulp.dest('public/assets/fonts'));
  gulp.src(config.bowerDir + '/Ionicons/scss/**/*.*')
    .pipe(gulp.dest('resources/assets/sass/ion'));

  // AdminLTE template
  gulp.src(config.bowerDir + '/AdminLTE/dist/css/AdminLTE.css')
    .pipe(gulp.dest('resources/assets/sass/AdminLTE'));
  gulp.src(config.bowerDir + '/AdminLTE/dist/css/skins/**/*')
    .pipe(gulp.dest('resources/assets/sass/AdminLTE/skins'));
});
