var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

<!-- 连接html页面(路由) -->
router.get('/users.html', function(req, res) {
  res.render('users', { title: 'Express' });
});

router.get('/brand.html', function(req, res) {
  res.render('brand', { title: 'Express' });
});

router.get('/phone.html', function(req, res) {
  res.render('phone', { title: 'Express' });
});

router.get('/register.html', function(req, res) {
  res.render('register', { title: 'Express' });
});

router.get('/login.html', function(req, res) {
  res.render('login', { title: 'Express' });
});
module.exports = router;
