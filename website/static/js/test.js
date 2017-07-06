Vue.use(VueRouter);
var user={
	template:'#user',
	data:function(){
		return {
			datalist:[{
				username:"cpr98yw",
				password:"123456",
				name:"Linonems",
				email:"513480169@qq.com",
				address:"广州市天河区",
				time:(new Date()).toLocaleString()
			},
			{
				username:"cpr98yw",
				password:"123456",
				name:"Linonems",
				email:"513480169@qq.com",
				address:"广州市天河区",
				time:(new Date()).toLocaleString()
			},
			{
				username:"cpr98yw",
				password:"123456",
				name:"Linonems",
				email:"513480454545169@qq.com",
				address:"广州市天河区",
				time:(new Date()).toLocaleString()
			},
			{
				username:"cpr98yw",
				password:"123456",
				name:"Linonems",
				email:"513480169@qq.com",
				address:"广州市天河区",
				time:(new Date()).toLocaleString()
			},
			{
				username:"cpr98yw",
				password:"123456",
				name:"Linonems",
				email:"513480169@qq.com",
				address:"广州市天河区",
				time:(new Date()).toLocaleString()
			}]
		};
	},
	methods:{
		edit:function(){
		},
		del:function(){

		}
	}
};
var routes=[{path:'/user',component:user}];
var router=new VueRouter({routes});

var wrap=new Vue({
	router,
	el:'#wrap',
	data:{
		tableName:"用户管理",
		searchText:"",
		disabled:"disabled",
		totalPage:10, 	//总页数
		activePage:1,	//当前页
		pageNum:20,		//每页显示多少个
		datalist:[{
			username:"cpr98yw",
			password:"123456",
			name:"Linonems",
			email:"513480169@qq.com",
			address:"广州市天河区",
			time:(new Date()).toLocaleString()
		},
		{
			username:"cpr98yw",
			password:"123456",
			name:"Linonems",
			email:"513480169@qq.com",
			address:"广州市天河区",
			time:(new Date()).toLocaleString()
		},
		{
			username:"cpr98yw",
			password:"123456",
			name:"Linonems",
			email:"513480454545169@qq.com",
			address:"广州市天河区",
			time:(new Date()).toLocaleString()
		},
		{
			username:"cpr98yw",
			password:"123456",
			name:"Linonems",
			email:"513480169@qq.com",
			address:"广州市天河区",
			time:(new Date()).toLocaleString()
		},
		{
			username:"cpr98yw",
			password:"123456",
			name:"Linonems",
			email:"513480169@qq.com",
			address:"广州市天河区",
			time:(new Date()).toLocaleString()
		},
		]
	},
	methods:{
		user:function(){
			this.tableName="用户列表";
		},
		seller:function(){
			this.tableName="商家列表";
			
		},
		order:function(){
			this.tableName="订单列表";
			
		},
		product:function(){
			this.tableName="商品列表";
			
		},
		address:function(){
			this.tableName="用户地址列表";
			
		},
		search:function(){

		},
		add:function(){

		},
		selectAll:function(){

		},
		edit:function(){

		},
		del:function(){

		},
		toPage:function(index){
			this.activePage=index;
			var json={
				pageNum:pageNum,
				activePage:activePage,
				tableName:manager.$data.tableName
			};
			var table;
			$.ajax({
				type:"GET",
				url:"/toPage",
				data:stringify(json),
				success:function(data){
					$.each(data,function(index,item){
						if(index===0){
							table=item.table;
							return;
						}
						if(table=="user"){
							datalist[index]={
								username:item.username,
								password:item.password,
								name:item.name,
								email:item.email,
								address:item.address,
								time:item.time					
							};
						}else if(table=="owner"){
							datalist[index]={
								user:item.user,
								ownerName:item.ownerName,
								shopName:item.shopName,
								identity:item.identity,
								time:item.item
							};
						}else if(table=="order"){
							datalist[index]={
								orderID:item.orderID,
								user:item.user,
								shopName:item.shopName,
								payMethod:item.payMethod,
								addressID:item.addressID,
								ordering:item.ordeing,
								pay:item.pay,
								time:item.time
							};
						}else if(table=="product"){
							datalist[index]={
								productID:item.productID,
								src:item.src,
								description:item.description,
								price:item.price,
								amount:item.amount,
								color:item.color,
								size:item.size,
								shopName:item.shopName
							};
						}else if(table=="address"){
							datalist[index]={
								user:item.user,
								addressID:item.addressID,
								city:item.city,
								district:item.district,
								detail:item.detail,
								phoneNum:item.phoneNum,
								receiver:item.receiver
							};
						}
					});
				},
				error:function(err){
					alert(err);
				}
			});
		},
		pageUp:function(){
			
		},
		pageDown:function(){

		}
	}
});

var  topbar=new Vue({
	el:"#topbar",
	data:{
		managerName:"张某某",
		headPic:"",
		showinfo:false,
	},
	methods:{
		loginout:function(){
			$.ajax({
				type:"POST",
				url:"/manager-logout",
				success:function(data){
					alert(data);
				},
				error:function(err){
					alert(err);
				}
			});
		},
		showInfo:function(){
			this.showinfo=true;
		},
		hideInfo:function(){
			this.showinfo=false;
		}
	}
});




var login=new Vue({
	el:"#login",
	data:{
		username:"",
		password:"",
		remind:null,
		logined:false,
	},
	computed:{
		json:function(){
			return {username:this.username,password:this.password};
		}
	},
	methods:{
		login:function(){
			$.ajax({
				type:"POST",
				url:"/manager-login",
				contentType:"application/json;charset=UTF-8",
				data:JSON.stringify(this.json),
				success:function(data){
					alert(data.msg);
					if(data.msg="success"){
						this.logined=true;
					}
				},
				error:function(err){
					alert(err);
				}
			});
		}
	}
});

$("#sidebar ul").on('click',"a",function(){
	$that=$(this);
	$.each($("#sidebar").find('a'),function(index){
		if($that.html()===$(this).html()){
			$(this).addClass('on');
		}else{
			$(this).removeClass('on');
		}
	});
});

$(".pageNum").on("click",function(){
	$that=$(this);
	$.each($('.pageNum'),function(){
		if($that.html()===$(this).html()){
			$(this).addClass('active');
		}else{
			$(this).removeClass('active');
		}
	});
});





