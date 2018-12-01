var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ignoreRouter = require('./config/ignoreRouter');
var multer = require('multer');
var upload = multer({ dest: 'E:/tmp' });

// <!-- 引入模块 -->
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var brandRouter = require('./routes/brand');
var phoneRouter = require('./routes/phone');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// <!-- 中间件,用来判断用户是否登录 -->
app.use(function(req, res, next) {
  if (ignoreRouter.indexOf(req.url) > -1) {
    next();
    return;
  }

  var nickname = req.cookies.nickname;
  if (nickname) {
    next();
  } else {
    res.redirect('/login.html');
  }
})


app.post('/upload',upload.single('file'),function(req,res){
  console.log(req.file)
  res.send('');
})
// app.listen(3000);

// <!-- 设置路由 -->
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/brand', brandRouter);
app.use('/phone', phoneRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
