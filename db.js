//连接MySQL
var mysql=require('mysql');
var pool=mysql.createPool({
	host:'localhost',
	user:'root',
	password:'513480169',
	database:'online'
});

function query(sql,callback){
	pool.getConnection(function(err,connection){
		connection.query(sql,function(err,rows){
			callback(err,rows);
			connection.release();
		});
	});
}
exports.query=query;