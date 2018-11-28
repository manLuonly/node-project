var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;  <!-- 根据id删除 -->
var async = require('async');
var router = express.Router();

var url = 'mongodb://127.0.0.1:27017';

router.get('/',function(req,res,next){

    MongoClient.connect(url, { useNewUrlParser: true}, function(err, client) {
        if(err){
            console.log('连接失败',err)
            res.render('error',{
                message:'连接失败',
                error:err
            });
            return;
        }
        var db = client.db('register');
        db.collection('brand').find().toArray(function(err,data){
            if(err){
                console.log('查询失败',err)
                res.render('error',{
                    message:'查询失败',
                    error:err
                })
            }else{
                console.log(data)
                res.render('users'{
                    list:'data'
                });
            }
            client.close();
        })
    })
})

module.exports = router;