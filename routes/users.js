var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;  <!-- 根据id删除 -->
var async = require('async');
var router = express.Router();

var url = 'mongodb://127.0.0.1:27017';
<!-- 分页操作 -->
router.get('/',function(req,res,next){
  var page = parseInt(req.query.page) || 1; <!-- 页码(当前页码,默认第一页) -->
  var pageSize = parseInt(req.query.pageSize) || 5; <!--  每页显示的条数 -->
  var totalSize = 0; <!-- 总条数 -->
  
MongoClient.connect(url, { useNewUrlParser: true },function(err,client){
  if(err){
    res.render('error',{
      message:'连接失败',
      error:err
    });
    return;
  }

  var db = client.db('register');

  async.series([
    function(cb){
      db.collection('usertable').find().count(function(err,num){
        if(err){
          cb(err)
        }else{
          tatalSize = num;
          cb(null);
        }
      })
    },
    function(cb){
      db.collection('usertable').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err,data){
        if(err){
          cb(err)
        }else{
          cb(null,data)
        }
      })
    }  
  ],function(err,results){
    if(err){
     res.render('error',{
       message:'错误',
       error:err
     })
    }else{
      var totalPage = Math.ceil(totalSize / pageSize);   <!-- 总页数  -->
      <!-- 传回前端的参数 -->
      res.render('users',{
        list:results[1],
        totalPage:totalPage,
        pageSize:pageSize,
        currentPage:page
      })
    }
  })
})

})


<!-- 登录操作 -->
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

<!-- 注册操作 -->
router.post('/register',function(req,res){
  var name = req.body.name;
  var pwd = req.body.pwd;
  var nickname = req.body.nickname;
  var age = parseInt(req.body.age);
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === '是' ? true : false;

  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }

    var db = client.db('register');

    async.series([
      function(cb){
        db.collection('usertable').find({username:name}).count(function(err,num){
          if(err){
            cb(err)
          }else if(num > 0){
            cb(new Error('注册过了'));
          }else{
            cb(null)
          }
        })
      },
      function(cb){
        db.collection('usertable').insertOne({
          username: name,
          password: pwd,
          nickname: nickname,
          age: age,
          sex: sex,
          isAdmin: isAdmin
        },function(err){
          if(err){
            cb(err)
          }else{
            cb(null)
          }
        })
      }
    ],function(err,result){
      if(err){
        res.render('error',{
          massage:'错误',
          error:err
        })
      }else{
        res.redirect('/login.html')
      }
      client.close();
    })
  })
})

<!-- 删除操作 -->
router.get('/delete', function(req, res){
  var id = req.query.id;

  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }
    var db = client.db('register');
    db.collection('usertable').deleteOne({
      _id: ObjectId(id)
    }, function(err, data) {
      console.log(data);
      if (err) {
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        res.redirect('/users');
      }
      client.close();
    })
  })
})

module.exports = router;
