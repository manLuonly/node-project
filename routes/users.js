var express = require('express');
var MongoClient = require('mongodb').MongoClient;
<!-- 根据id删除 -->
var Objectid = require('mongodb').Objectid; 
var async = require('async');
var router = express.Router();

var url = 'mongodb://127.0.0.1:27017';

router.get('/',function(req,res,next){
<!-- 连接数据库 -->
  MongoClient.connect(url,{ useNewUrlParser: true },function(err,client) {
    if(err){
      console.log('数据库连接失败',err)
      res.render('error',{
        message:'数据库连接失败',
        error:err
      });
      return;
    }
    var db = client.db('register');

    db.collection('usertable').find().toArray(function(err,data){
      if(err){
        console.log('查询用户失败',err);

        res.render('error',{
          message:'查询失败',
          error:err
        })
      }else{
        console.log(data)
        res.render('users',{
          list:data
        })
      }

      client.close();
    })
  })
})


router.post('/login', function(req, res) {
   <!-- 获取前端传递过来的参数 -->
  var username = req.body.name;
  var password = req.body.pwd;
   <!-- 验证参数的有效性 -->
  if (!username) {
    res.render('error', {
      message: '用户名不能为空',
      error: new Error('用户名不能为空')
    })
    return;
  }

  if (!password) {
    res.render('error', {
      message: '密码不能为空',
      error: new Error('密码不能为空')
    })
    return;
  }

   <!-- 链接数据库做验证 -->
  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      console.log('连接失败', err);
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }

    var db = client.db('register');

    db.collection('usertable').find({
      username: username,
      password: password
    }).toArray(function(err, data) {
      if (err) {
        console.log('查询失败', err);
        res.render('error', {
          message: '查询失败',
          error: err
        })
      } else if (data.length <= 0) {
         <!-- 没找到，登录失败 -->
        res.render('error', {
          message: '登录失败',
          error: new Error('登录失败')
        })
      } else {
         <!-- 登录成功 -->

        <!-- cookie操作,向cookie存储账号密码 -->
        res.cookie('nickname', data[0].nickname, {
          maxAge: 10 * 60 * 1000
        });
        <!-- 登录成功重定向 -->
        res.redirect('/');
      }
      client.close();
    })

  })
});

module.exports = router;
