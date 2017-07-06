const express=require('express');
const db=require('./db');
const path=require('path');
const fs=require('fs');
const formidable=require('formidable');
const bodyParser=require('body-parser');
const session=require('express-session');
const FileStore=require('session-file-store')(session);
const app=express();


let auth=function (req,res,next){
	if(req.session.loginUser){
		next();
	}else{
		res.redirect('/');
	}
};
function open(req,res,realPath) {
	fs.exists(realPath,function(exists){
		if(!exists){
			res.writeHead(404,{'Content-Type':'text/plain'});
			res.write("This request URL was not found on this server!");
			res.end();
		}else{
			fs.readFile(realPath,"binary",function(err,file){
				if(err){
					res.writeHead(500,{'Content-Type':'text/plain'});
					res.end(err);
				}else{
					res.writeHead(200,{'Content-Type':'text/html'});
					res.write(file,"binary");
					res.end();
				}
			});
		}
	});
}

//服务器端session设置
let identityKey='skey';
app.use(session({
	name:'skey',
	secret:'121144',
	store:new FileStore(),
	saveUninitialized:false,
	resave:false,
	cooie:{
		maxAge:10*1000
	}
}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
/*访问静态资源库*/
app.use(express.static('website/static'));


app.get('/',function(req,res){
	let realPath=path.join('./website/static/index.html');
	open(req,res,realPath);
});

/*访问非静态资源*/
app.get('/login.html',function(req,res){
	if(!req.session.loginUser){
		let realPath=path.join('./website/login.html');
		open(req,res,realPath);
	}else{
		res.redirect('/');
	}
});

app.get('/shopcar.html',auth,function(req,res){
	
	let realPath=path.join('./website/shopcar.html');
	open(req,res,realPath);
});

app.get('/order.html',auth,function(req,res){
	let realPath=path.join('./website/order.html');
	open(req,res,realPath);
});



/*登录*/
app.post('/login',function(req,res){
	db.query("select username from user where username='"+req.body.username+
		"' and password='"+req.body.password+"'",
		function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}else{
				if(typeof(rows[0])=="undefined"){
					res.end("用户名或密码错误!!");
				}
				else{
					req.session.regenerate(function(err){
						if(err){
							res.end("登录失败");
						}
						req.session.loginUser=req.body.username;
						res.end("登录成功");
					});
				}
			}
		});
});

/*登出*/
app.get('/logout',function(req,res){
	req.session.destroy(function(err){
		if(err){
			res.end("退出登录失败");
		}
		res.clearCookie(identityKey);
		res.end("退出登录成功");
	});
});

/*注册*/
app.post('/signup',function(req,res){
	db.query("insert into user(username,password,email,address,name,src,time) values('"+
		req.body.username+"','"+
		req.body.password+"','"+
		req.body.email+"','"+
		req.body.address+"','"+
		req.body.username+"','images/head.jpg','"+
		req.body.time+"')" ,
		function(err,rows){
			if(err){
				if(err.toString().indexOf("ER_DUP_ENTRY")){
					res.end("用户名已存在");
				}
				else{
					res.end('注册失败:'+err.toString());
				}
			}else{
				req.session.regenerate(function(err){
					if(err){
						res.end("登录失败");
					}
					req.session.loginUser=req.body.username;
					res.end("注册成功");
				});
			}
	});
});



/*topbar*/

	/*是否已经登录*/
app.get('/logined',function(req,res){
	let json;
	if(req.session.loginUser){
		json={logined:true};
	}else{
		json={logined:false};
	}
	res.writeHead(200,{"Content-Type":"application/json"});
	res.end(JSON.stringify(json));
});

	/*购物车栏*/
app.get('/S_shopcarList',function(req,res){
	db.query("select * from shopcar where user='"+req.session.loginUser+
		"' and orderID is null",function(err,rows){
			if(err){
				res.end(err.toString());
			}else{
				let	json=[];
				let length=rows.length;
				if(rows.length!=0){
					rows.forEach(function(item,index){
						//购物车栏只显示前5个商品
						db.query("select * from product where productID="+item.productID,
							function(err,rows){
								if(err){
									res.end(err.toString());
								}else{
									json[index]={};
									json[index].productID=rows[0].productID;
									json[index].src=rows[0].src;
									json[index].description=rows[0].description;
									json[index].color=rows[0].color;
									json[index].size=rows[0].size;
									json[index].realPrice=rows[0].price;
									if(index==4||(index==length-1 && index<4)){
										res.writeHead(200,{"Content-Type":"application/json"});
										res.end(JSON.stringify(json));
									}
								}
						});
					});
				}else{
					res.writeHead(200,{"Content-Type":"application/json"});
					res.end(JSON.stringify(json));
				}	
			}
	});
});

	/*用户资料*/
app.get('/getUser',function(req,res){
	var json={};
	db.query("select * from user where username='"+req.session.loginUser+"'",
		function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}else{
				json.name=rows[0].name;
				json.src=rows[0].src;
			}
	});
	db.query("select * from shopcar where user='"+req.session.loginUser+"' and orderID is null",
		function(err,rows){
			if(err){
				res.end(err.toString());
			}else{
				json.number=rows.length;
				res.writeHead(200,{"Content-Type":"application/json"});
				res.end(JSON.stringify(json));
			}
	});
});





/*筛选页*/

app.get('/productDisplay',function(req,res){
	db.query("select * from product",function(err,rows){
		if(err){
			res.writeHead(500);
			res.end(err.toString());
		}
		var json=[];
		rows.forEach(function(item,index){
			json[index]={};
			json[index].productID=item.productID;
			json[index].src=item.src;
			json[index].description=item.description;
			json[index].price=item.price;
			if(index==rows.length-1){
				res.writeHead(200,{"Content-Type":"application/json"});
				res.end(JSON.stringify(json));
			}
		});
	});
});

app.post('/buy',function(req,res){
	var price,amount,shopName;
	db.query("select * from product where productID='"+req.body.productID+"'",function(err,rows){
		if(err){
			res.writeHead(500);
			res.end(err.toString());
		}
		price=rows[0].price;
		shopName=rows[0].shopName;
	});
	db.query("select * from shopcar where user='"+req.session.loginUser+"' and productID='"+req.body.productID+"' and orderID is null",
		function(err,obj){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			if(typeof(obj[0])=="undefined"){
				db.query("insert into shopcar values('"+req.session.loginUser+"','"+
					req.body.productID+"',1,"+price+",null,'"+shopName+"',null)",
					function(err){
						if(err){
							res.writeHead(500);
							res.end(err.toString());
						}
				});
			}else{
				console.log(obj[0].amount);
				amount=obj[0].amount+1;
				var prices=price*amount;
				console.log(amount+" "+price+" "+prices);
				db.query("update shopcar set prices="+prices+",amount="+amount+" where productID='"+req.body.productID+"' and user='"+req.session.loginUser+"'",
					function(err,rows){
						if(err){
							res.writeHead(500);
							res.end(err.toString());
						}
				});

			}
			db.query("select * from shopcar where user='"+req.session.loginUser+"' and orderID is null",
				function(err,rows){
					if(err){
						res.end(err.toString());
					}else{
						var json={number:rows.length}
						res.writeHead(200,{"Content-Type":"application/json"});
						res.end(JSON.stringify(json));
					}
			});
	});

});




/*购物车页面*/

	/*购物车列表展示*/
app.get('/S_display',function(req,res){
	db.query("select * from shopcar where user='"+req.session.loginUser+
		"' and orderID is null",function(err,rows){ 
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			let	json=[];
			if(rows.length==0){
				res.writeHead(200,{"Content-Type":"application/json"});
				res.end(JSON.stringify(json));
			}else{
				rows.forEach(function(item,index){	
					json[index]={};
					json[index].amount=item.amount;
					json[index].prices=item.prices;
					db.query("select * from product where productID="+item.productID,
						function(err,result){
							if(err){
								res.end(err.toString());
							}
							json[index].productID=result[0].productID;
							json[index].src=result[0].src;
							json[index].description=result[0].description;
							json[index].price=result[0].price;
							json[index].shopName=result[0].shopName;
							if(index==rows.length-1){
								res.writeHead(200,{"Content-Type":"application/json"});
								res.end(JSON.stringify(json));
							}
					});
				});
			}
				
	});
});

	/*商品数量改变*/
app.post('/S_amount',function(req,res){
	db.query("update shopcar set amount="+req.body.amount+
		",prices="+req.body.prices+
		" where user='"+req.session.loginUser+"' and productID="+req.body.productID,
		function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}else{
				res.end("success");
			}
		});
});
	
	/*获取数量*/
app.get('/S_amount',function(req,res){
	db.query("select amount from shopcar where user='"+req.session.loginUser+
		"' and productID="+req.body.productID,
		function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			let json={amount:rows[0].amount};
			res.writeHead(200,{"Content-Type":"application/json"});
			res.end(JSON.stringify(json));
		});
});

	/*删除商品*/
app.post('/S_del',function(req,res){
	let product=req.body;
	product.forEach(function(item,index){
		db.query("delete from shopcar where user='"+req.session.loginUser+
			"' and productID="+item.productID,
			function(err){
				if(err){
					res.writeHead(500);
					res.end(err.toString());
				}
				if(index==product.length-1){
					res.end("success");
				}
	 	});
	});
	
});
	
	/*结算*/
app.post('/S_pay',function(req,res){
	var date=new Date();
	var orderID=""+date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+
		date.getMinutes()+date.getSeconds()+date.getMilliseconds();
	var result=req.body;
	console.log(typeof(orderID));

	db.query("insert into t_order(orderID,user,totalPrices,ordering,send,time)values('"+
				orderID+"','"+req.session.loginUser+"',"+
				result[result.length-1].totalPrices+",1,null,'"+
				result[result.length-1].time+"')",
			function(err){
				if(err){
					res.writeHead(500);
					res.end(err.toString());
				}else{
					result.forEach(function(item,index){
						if(index!=result.length-1){
							db.query("update shopcar set orderID='"+orderID+
								"' where user='"+req.session.loginUser+"' and productID='"+item.productID+"' and orderID is null",
								function(err){
									if(err){
										res.end(err.toString());
									}
									res.end("success");
							});
						}
					});
				}	
	});
});

/*订单页*/

	/*订单商品展示*/
app.get('/O_display',function(req,res){
	let json=[];
	let orderID,totalPrices;

	db.query("select * from t_order where user='"+req.session.loginUser+"' and ordering=1",
		function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			orderID=rows[0].orderID;
			totalPrices=rows[0].totalPrices;
			db.query("select * from shopcar where orderID="+orderID+
				" and user='"+req.session.loginUser+"'",
				function(err,result){
					if(err){
						res.writeHead(500);
						res.end(err.toString());
					}
					result.forEach(function(item,index){
						json[index]={};
						json[index].amount=item.amount;
						json[index].prices=item.prices;
						db.query("select * from product where productID="+item.productID,
							function(err,rows){
								if(err){
									res.end(err.toString());
								}
								json[index].productID=rows[0].productID;
								json[index].src=rows[0].src;
								json[index].description=rows[0].description;
								json[index].price=rows[0].price;
								json[index].color=rows[0].color;
								json[index].size=rows[0].size;
								if(index==result.length-1){
									json[json.length]={totalPrices:totalPrices};
									res.writeHead(200,{"Content-Type":"application/json"});
									res.end(JSON.stringify(json));
								}
						});
					});
			});
	});
	
});

	/*获取地址*/
app.get('/O_address',function(req,res){
	var json=[];
	db.query("select * from t_address where user='"+req.session.loginUser+"'",
		function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			rows.forEach(function(item,index){
				json[index]={
					addressID:item.addressID,
					city:item.city,
					district:item.district,
					detail:item.detail,
					phoneNum:item.phoneNum,
					receiver:item.receiver
				};
			});
			res.writeHead(200,{"Content-Type":"application/json"});
			res.end(JSON.stringify(json));
	});
});

	/*添加地址*/
app.post('/O_addAddress',function(req,res){
	var addressID;
	db.query("select addressID from t_address where user='"+req.session.loginUser+"'",
		function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			if(rows.length===0){
				addressID=1;
			}else{
				addressID=rows.length+1;
			}
			db.query("insert into t_address(user,addressID,city,district,detail,phoneNum,receiver) values('"+req.session.loginUser+"','"+addressID+"','"+req.body.city+"','"+req.body.district+
				"','"+req.body.detail+"','"+req.body.phoneNum+"','"+req.body.receiver+"')",
				function(err,rows){
					if(err){
						console.log("send");
						res.writeHead(500);
						res.end(err.toString());
					}
					var json={addressID:addressID};
					console.log(json);
					res.writeHead(200,{"Content-Type":"application/json"});
					res.end(JSON.stringify(json));
			});
	});
});

	/*删除地址*/
app.post('/O_delAddress',function(req,res){
	db.query("delete from t_address where user='"+req.session.loginUser+
		"' and addressID='"+req.body.addressID+"'",
		function(err){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			res.end("success");
	});
});

	/*提交订单*/
app.post('/O_order',function(req,res){
	let orderID;
	db.query("select orderID from t_order where user='"+req.session.loginUser+"' and ordering=1",
		function(err,result){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			orderID=result[0].orderID;
			db.query("select productID from shopcar where orderID="+orderID,
				function(err,rows){
					if(err){
						res.writeHead(500);
						res.end(err.toString());
					}
					var shopName=[];
					rows.forEach(function(item,index){
						db.query("select shopName from product where productID="+item.productID,
							function(err,rows){
								if(err){
									res.writeHead(500);
									res.end(err.toString());
								}
								if(shopName.length==0){
									shopName.push(rows[0].shopName);
								}else{
									shopName.forEach(function(item){
										if(rows[0].shopName==item){
											return;
										}
										shopName.push(rows[0].shopName);
									});
								}
								if(index==rows.length-1){
									shopName.forEach(function(obj){
										db.query("insert into t_orderowner(orderID,shopName) values('"+orderID+"','"+obj+"')",
											function(err){
												if(err){
													res.writeHead(500);
													res.end(err.toString());
												}
												db.query("update t_order set addressID='"+req.body.addressID+"',pay=1,ordering=0,payMethod='"+req.body.payMethod+"'",
													function(err){
														if(err){
															res.writeHead(500);
															res.end(err.toString());
														}
														res.end("success")
												});
										});
									});
								}
							});
					});
			});
	});
});

app.get('/O_unload',function(req,res){
	db.query("update order set ordering=0 where user='"+req.session.loginUser+"' and '"+req.body.orderID+"'",function(err){
		if(err){
			res.writeHead(500);
			res.end(err.toString());
		}else{
			res.end("success");
		}
	});
});

/*商家页面*/

	/*出售商品展示 √ */
app.get('/K_showSelling',function(req,res){
	db.query("select shopName from owner where user='"+req.session.loginUser+"'",
		function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			db.query("select * from product where shopName='"+rows[0].shopName+"'",
				function(err,rows){
					if(err){
						res.writeHead(500);
						res.end(err.toString());
					}
					let json=[];
					rows.forEach(function(item,index){
						json[index]={};
						json[index].productID=item.productID;
						json[index].src=item.src;
						json[index].description=item.description;
						json[index].price=item.price;
						json[index].amount=item.amount;
					});
					res.writeHead(200,{"Content-Type":"application/json"});
					res.end(JSON.stringify(json));
			});
	});
});

	/*订单展示*/
app.get('/K_showSend',function(req,res){
	let json=[];
	db.query("select shopName from owner where user='"+req.session.loginUser+"'",
		function(err,owner){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			let shopName=owner[0].shopName;
			console.log(shopName);
			db.query("select orderID from t_orderowner where shopName='"+shopName+"' and send is null",function(err,orderowner){
				if(err){
					res.writeHead(500);
					res.end(err.toString());
				}
				console.log(orderowner);
				orderowner.forEach(function(obj,index){
					json[index]=[];
					db.query("select * from shopcar where orderID='"+obj.orderID+"' and shopName='"+shopName+"' and send is null",function(err,product){
						if(err){
							res.writeHead(500);
							res.end(err.toString());
						}
						console.log( index+" "+product.length);
						product.forEach(function(item,inde){
							db.query("select * from product where productID='"+item.productID+"'",function(err,rows){
								if(err){
									res.writeHead(500);
									res.end(err.toString());
								}
								json[index][inde]={};
								json[index][inde].productID=rows[0].productID;
								json[index][inde].src=rows[0].src;
								json[index][inde].description=rows[0].description;
								json[index][inde].size=rows[0].size;
								json[index][inde].color=rows[0].color;
								json[index][inde].price=rows[0].price;
								json[index][inde].amount=item.amount;
								json[index][inde].prices=item.prices;
								if(inde==product.length-1){
									console.log(json);
									db.query("select addressID,user from t_order where orderID='"+obj.orderID+"' and send is null",function(err,order){
										if(err){
											res.writeHead(500);
											res.end(err.toString());
										}
										console.log(order);
										db.query("select * from t_address where addressID='"+order[0].addressID+"' and user='"+order[0].user+"'",function(err,result){
											if(err){
												res.writeHead(500);
												res.end(err.toString());
											}
											var length=json[index].length;
											console.log(length);
											json[index][length]={};
											json[index][length].city=result[0].city;
											json[index][length].district=result[0].district;
											json[index][length].detail=result[0].detail;
											json[index][length].receiver=result[0].receiver;
											json[index][length].orderID=obj.orderID;
											if(index==orderowner.length-1){
												console.log(json);
												res.writeHead(200,{"Content-Type":"application/json"});
												res.end(JSON.stringify(json));
											}
										});
									});
								}
							});
						});
					});
				});
			});
	});
});

	/*商铺注册 √ */
app.post('/K_setUp',function(req,res){
	db.query("insert into owner(user,ownerName,shopName,identity,time) values('"+req.session.loginUser+
		"','"+req.body.ownerName+"','"+req.body.shopName+"','"+req.body.identity+"','"+req.body.time+"')",
		function(err){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			res.end("success");
	});
});

	/*上架商品 √ */
app.post('/K_uploadImg',function(req,res){
	const form=new formidable.IncomingForm();
	form.uploadDir="D:/front-end-tech/Nodejs/server/website/static/images";
	form.keepExtensions=true;
	form.maxFieldsSize=20*1024*1024;
	form.parse(req,function(err,fields,files){
		if(err){
			console.log(err);
			res.end(err.toString());
		}
		ext=files.goodsImg.type.substring(6);
		var date=new Date();
		var productID=""+date.getFullYear()+date.getMonth()+date.getDate()+date.getHours()+
			date.getMinutes()+date.getSeconds()+date.getMilliseconds();
		fs.renameSync(files.goodsImg.path,"website/static/images/"+productID+"."+ext);
		var json={
			productID:productID,
			src:productID+"."+ext
		};
		res.writeHead(200,{"Content-Type":"application/json"});
		res.end(JSON.stringify(json));
	});
});

app.post('/K_sell',function(req,res){
	db.query("select shopName from owner where user='"+req.session.loginUser+"'",function(err,rows){
		db.query("insert into product values('"+req.body.productID+"','images/"+req.body.src+"','"+
			req.body.description+"',"+req.body.price+","+req.body.stock+",null,null,'"+rows[0].shopName+"')",
			function(err){
				if(err){
					res.writeHead(500);
					res.end(err.toString());
				}
				res.end("success");
		});
	});
});

	/*下架商品 √ */
app.post('/K_del',function(req,res){
	db.query("delete from product where productID='"+req.body.productID+"'",
		function(err){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			res.end("success");
	});
});
	
	/*发货*/
app.post('/K_send',function(req,res){
	console.log(req.body.orderID);
	db.query("update shopcar set send=1 where orderID='"+req.body.orderID+"' and productID='"+req.body.productID+"'",function(err){
		if(err){
			res.writeHead(500);
			res.end(err.toString());
		}
		db.query("select send from shopcar where orderID='"+req.body.orderID+"'",function(err,rows){
			if(err){
				res.writeHead(500);
				res.end(err.toString());
			}
			console.log(rows);
			if(rows.every(function(item){
				return item;
			})){
				db.query("update t_order set send=1 where orderID='"+req.body.orderID+"'",function(err){
					if(err){
						res.writeHead(500);
						res.end(err.toString());
					}
					db.query("update t_orderowner set send=1 where orderID='"+req.body.orderID+"'",function(err){
						if(err){
							res.writeHead(500);
							res.end(err.toString());
						}
						res.end("发货成功");
					});
				});
			}else{
				res.end("发货成功");
			}
		});
	});
});


app.get('/myorder',function(req,res){
	var json=[],product1,address1;
	db.query("select * from shopcar where send=1 and user='"+req.session.loginUser+"'",function(err,shopcar){
		console.log(shopcar.length);
		shopcar.forEach(function(item,index){
			db.query("select * from product where productID='"+item.productID+"'",function(err,product){
				db.query("select addressID from t_order where orderID='"+item.orderID+"'",function(err,addressID){
					db.query("select * from t_address where addressID='"+addressID[0].addressID+"' and user='"+req.session.loginUser+"'",function(err,address){
						json[index]={};
						json[index].productID=product[0].productID;
						json[index].src=product[0].src;
						json[index].description=product[0].description;
						json[index].price=product[0].price;
						json[index].amount=item.amount;
						json[index].prices=item.prices;
						json[index].orderID=item.orderID;
						json[index].receiver=address[0].receiver;
						json[index].district=address[0].district;
						json[index].city=address[0].city;
						json[index].detail=address[0].detail;
						console.log(json);
						if(index==shopcar.length-1){
							console.log(json);
							res.writeHead(200,{"Content-Type":"application/json"});
							res.end(JSON.stringify(json));
						}
					});
				});
			});
		});
	});
});
const server=app.listen(3000,function(){
	const port=server.address().port;
	console.log('Server is listening at http://localhost'+':'+port);
});
