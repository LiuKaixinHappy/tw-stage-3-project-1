'use strict';
const HTTP = require('http');
const FS = require('fs');
const MONGO_CLIENT = require('mongodb').MongoClient;
const DB_URL = "mongodb://localhost:27017/todolist";
const SUCCESS = 'success';
const ERROR = 'error';
let dbClient;

MONGO_CLIENT.connect(DB_URL, {useNewUrlParser: true}, function (err, db) {
    if (err) throw err;
    console.log("数据库已创建!");
    dbClient = db.db("todolist");
});

let server = HTTP.createServer(function (request, response) {
    console.log(request.method + ': ' + request.url);
    if (request.url === '/todo') {
        switch (request.method) {
            case 'POST':
                let item = '';
                request.setEncoding('utf8');
                request.on('data', function (chunk) {
                    item += chunk;
                });
                request.on('end', function () {
                    item = JSON.parse(item);
                    console.log(item);
                    try {
                        dbClient.collection('todo').insertOne(item, function (err, result) {
                            if (err) throw err;
                            if (result.result.ok === 1) {
                                let text = JSON.stringify({'result': SUCCESS, 'message': '添加成功'});
                                console.log(text);
                                response.end(text);
                            } else {
                                response.end(JSON
                                    .stringify({'result': ERROR, 'message': '添加失败'}));
                            }
                        });
                    } catch (e) {
                        console.log(e);
                        response.end(JSON.stringify({'result': ERROR, 'message': '添加失败'}));
                    }
                });
                break;
            case 'GET':
                try {
                    dbClient.collection('todo').find({}).project({_id: 0}).toArray(function (err, data) {
                        if (err) throw err;
                        response.end(JSON.stringify({'result': SUCCESS, 'message': data}));
                    });
                } catch (e) {
                    console.log(e);
                    response.end(JSON.stringify({'result': ERROR, 'message': '获取失败'}));
                }
                break;
            case 'PUT':
                let idAndStatus = '';
                request.setEncoding('utf8');
                request.on('data', function (chunk) {
                    idAndStatus += chunk;
                });
                request.on('end', function () {
                    idAndStatus = JSON.parse(idAndStatus);
                    try {
                        dbClient.collection('todo')
                            .updateOne({id: idAndStatus.id}, {$set: {status: idAndStatus.status}},
                                function (err, result) {
                                    if (err) throw err;
                                    if (result.result.n === 1 && result.result.ok === 1) {
                                        let text = JSON.stringify({'result': SUCCESS, 'message': '修改成功'});
                                        console.log(text);
                                        response.end(text);
                                    } else {
                                        response.end(JSON
                                            .stringify({'result': ERROR, 'message': '修改失败'}));
                                    }
                                });
                    } catch (e) {
                        console.log(e);
                        response.end(JSON.stringify({'result': ERROR, 'message': '修改失败'}));
                    }
                });
                break;
            case 'DELETE':
                let delIds = '';
                request.setEncoding('utf8');
                request.on('data', function (chunk) {
                    delIds += chunk;
                });
                request.on('end', function () {
                    delIds = JSON.parse(delIds);
                    try {
                        dbClient.collection('todo').deleteMany({id: {$in: delIds}}, function (err, result) {
                            if (err) throw err;
                            if (result.result.ok === 1) {
                                let text = JSON.stringify({'result': SUCCESS, 'message': '删除成功'});
                                console.log(text);
                                response.end(text);
                            } else {
                                response.end(JSON
                                    .stringify({'result': ERROR, 'message': '删除失败'}));
                            }
                        });
                    } catch (e) {
                        console.log(e);
                        response.end(JSON.stringify({'result': ERROR, 'message': '删除失败'}));
                    }
                });
                break;
        }
    }
});

// 让服务器监听8080端口:
server.listen(8080);

console.log('Server is running at http://127.0.0.1:8080/');
