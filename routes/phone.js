var express = require('express');
var MongoClient = require('mongodb').MongoClient;
// <!-- 根据id删除 -->
var ObjectId = require('mongodb').ObjectId;
var async = require('async');
var multer = require('multer');
var router = express.Router();

var url = 'mongodb://127.0.0.1:27017';

// <!-- 分页操作 -->
router.get('/', function(req, res, next) {
  // <!-- 当前显示页码 -->
  var page = parseInt(req.query.page) || 1;
  // <!-- 每页显示的条数 -->  
  var pageSize = parseInt(req.query.pageSize) || 5;
  // <!-- 总条数 -->
  var totalSize = 0;

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }

    var db = client.db('register');
    async.series([
      function(cb) {
        db.collection('phone').find().count(function(err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },

      function(cb) {
        db.collection('phone').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err, data) {
          if (err) {
            cb(err)
          } else {
            cb(null, data)
          }
        })

      }
    ], function(err, results) {
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        // <!-- 总页数 -->
        var totalPage = Math.ceil(totalSize / pageSize);

        res.render('phone', {
          list: results[1],
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page
        })
      }
    })
  })
});

// <!-- 删除操作 -->
router.get('/delete', function(req, res) {
  var id = req.query.id;

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }
    var db = client.db('register');
    db.collection('phone').deleteOne({
      _id: ObjectId(id)
    }, function(err, data) {
      console.log(data);
      if (err) {
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        res.redirect('/phone');
      }
      client.close();
    })
  })
})

// <!-- 增加操作 -->
router.post('/', function(req, res) {
  var name = req.body.phonename;
  var opstion = req.body.opstion;
  var money = req.body.money;
  var twomoney = req.body.twomoney;

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      console.log('连接失败', err)
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }

    var db = client.db('register');

    db.collection('phone').insertOne({
      phonename: name,
      money: '¥' + money,
      twomoney: '¥' + twomoney
    }, function(err, data) {
      console.log(data);
      if (err) {
        res.render('error', {
          message: '插入失败',
          error: err
        })
      } else {
        res.redirect('/phone');
      }
      client.close();
    })
  })
})

// < !--搜索操作 -->
router.post('/phone', function(req, res) {
  var name = req.body.searchInput;
  var page = parseInt(req.query.page) || 1;
  // < !--当前显示页码 -->
  var pageSize = parseInt(req.query.pageSize) || 5;
  // < !--每页显示的条数 -->
  var totalSize = 0;
  // < !--总条数 -->

  console.log('进来了-------')
  var filter = new RegExp(name);
  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('register');

    async.series([
      function(cb) {
        db.collection('phone').find().count(function(err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },

      function(cb) {
        db.collection('phone').find({
          phonename: filter
        }).limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err, data) {
          if (err) {
            cb(err)
          } else {
            cb(null, data)
          }
        })

      }
    ], function(err, results) {
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        // < !--总页数 -->
        var totalPage = Math.ceil(totalSize / pageSize);

        console.log(results[1]);

        res.render('phone', {
          list: results[1],
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page
        })
      }

      client.close();
    })
  })
})
module.exports = router;