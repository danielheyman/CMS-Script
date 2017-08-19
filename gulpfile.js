const gulp = require("gulp");
const sourcemaps = require('gulp-sourcemaps');
const concatenate = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const autoPrefix = require("gulp-autoprefixer");
const gulpSASS = require("gulp-sass");
const babel = require("gulp-babel");

const cssFiles = [
    "./node_modules/tether/dist/css/tether.css", // required by bootstrap
    "./node_modules/bootstrap/dist/css/bootstrap.css",
    "./node_modules/react-datepicker/dist/react-datepicker.css", // Used for admin datepicker
    "./node_modules/font-awesome/css/font-awesome.css",
    "./node_modules/react-quill/dist/quill.snow.css", // Used for admin wysiwyg editor
    "./public/css/source/**/*.css"
];
const sassFiles = "./public/css/source/sass/**/*.scss";
const jsxFiles = ["./app_source/components/**/*.js", "./app_source/store.js", "./app_source/initializer.js"];
const fontFiles = "./node_modules/font-awesome/fonts/**.*";
const vendorFiles = [
    "./node_modules/jquery/dist/jquery.js", // used for ajax calls and bootstrap
    "./node_modules/tether/dist/js/tether.js", // required by bootstrap
    "./node_modules/bootstrap/dist/js/bootstrap.js",
    "./node_modules/react/dist/react.js",
    "./node_modules/react-dom/dist/react-dom.js",
    "./node_modules/react-router-dom/umd/react-router-dom.js",
    "./node_modules/async/dist/async.js", // Used for calling multiple api routes in parallel
    "./node_modules/bootbox/bootbox.js", // Used for the signup popup
    "./node_modules/react-onclickoutside/index.js", // required by datepicker
    "./node_modules/moment/moment.js", // required by datepicker
    "./node_modules/react-datepicker/dist/react-datepicker.js", // Used for admin datepicker
    "./node_modules/react-quill/dist/react-quill.js", // Used for admin wysiwyg editor
];

gulp.task("sass", () => {
    gulp
        .src(sassFiles)
        .pipe(gulpSASS())
        .pipe(concatenate("styles-from-sass.min.css"))
        .pipe(autoPrefix())
        //.pipe(cleanCSS())
        .pipe(gulp.dest("./public/css/"));
});

gulp.task("css", () => {
    gulp
        .src(cssFiles)
        .pipe(concatenate("styles.min.css"))
        .pipe(autoPrefix())
        .pipe(cleanCSS())
        .pipe(gulp.dest("./public/css/"));
})

gulp.task("jsx", () => {
    return gulp
        .src(jsxFiles)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015', 'react']
        }))
        .pipe(concatenate("components.js"))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./public/js/"));
});

gulp.task("vendor", () => {
    return gulp
        .src(vendorFiles)
        .pipe(concatenate("vendor.js"))
        .pipe(gulp.dest("./public/js/"));
});

gulp.task('fonts', function() { 
    return gulp
        .src(fontFiles)
        .pipe(gulp.dest('./public/fonts/'));
});

gulp.task("watch", () => {
    gulp.watch(cssFiles, ["css"]);
    gulp.watch(sassFiles, ["sass"]);
    gulp.watch(jsxFiles, ["jsx"]);
});

gulp.task("default", ["jsx", "watch"]);
