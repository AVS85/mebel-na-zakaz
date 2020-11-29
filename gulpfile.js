//*выбор препроцессора
let preproccessor = 'sass'
//подключаем переменные к пакету gulp
const { src, dest, parallel, series, watch } = require('gulp')

//установка live server [указываем параметр подключения create]
const browserSync  = require('browser-sync').create()
const concat       = require('gulp-concat')
const uglify       = require('gulp-uglify-es').default
const sass         = require('gulp-sass')
const less         = require('gulp-less')
const autoprefixer = require('gulp-autoprefixer')
const cleancss     = require('gulp-clean-css')
const imagemin     = require('gulp-imagemin')
const newer        = require('gulp-newer') //отслеживает изменения 
const del          = require('del') //nodejs модуль

function browsersync(){
    browserSync.init({
        server: { baseDir: 'app/' },
        notify: false, //отключение уведомлений
        online: true //false, если работаем без сети (иначе bsync не запустится в offline)
    })
}

function scripts(){
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/app.js'
    ])
    .pipe(concat('app.min.js'))
    .pipe(uglify({}))
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream()) //stream - работает как hardreload в скриптах, а в стилях слежение без перезагрузки
}

function styles(){
    return src('app/' + preproccessor + '/main.' + preproccessor)
    .pipe( eval(preproccessor)() )
    .pipe(concat('app.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist:['last 10 versions'], grid: true }))
    .pipe(cleancss( { level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ } )) // Минифицируем стили
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())
}

function images(){
    return src('app/images/src/**/*')
    .pipe(newer('app/images/dest/')) //
    .pipe(imagemin())
    .pipe(dest('app/images/dest/'))
}

function cleanimg(){
    return del('app/images/dest/**/*', { force: true })
}
function cleanDist(){
    return del('dist/**/*', { force: true })
}

function buildcopy(){
    return src([
        // 'app/css/**/*.min.css',
        'app/css/**/*.css',
        'app/js/**/*.min.js',
        'app/images/dest/**/*',
        'app/fonts/**/*',
        'app/**/*.html',
        ], {
            base: 'app'
        })
        .pipe(dest('dist'))
}

function startwatch(){
    watch('app/**/' + preproccessor + '/**/*', styles)
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts)
    watch('app/**/*.html').on('change', browserSync.reload)
    watch('app/images/src/**/*', images)
}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync
exports.scripts     = scripts
exports.styles      = styles
exports.images      = images
exports.cleanimg    = cleanimg



exports.build = series(cleanDist, styles, scripts, images, buildcopy)

//возможно... есть варик не корректной работы - тогда настроить последовательное выполнение части задач
exports.default = parallel(scripts, styles, browsersync, startwatch)