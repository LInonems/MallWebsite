/*注册页面*/
$(document).ready(function(){
	$(".registerBox").on("focusin","input",function(e){
		if(e.target.type!="submit"){
			$(this).addClass('input_active');
		}
	});
	$(".registerBox").on("focusout","input",function(e){
		if(e.target.type!="submit"){
			$(this).removeClass('input_active');
		}
	});


	var Tips1,Tips2,Tips3,Tips4,Tips5;
	$("#R_username").focusout(function(){
		var ret=/^(?![^a-zA-Z]+$)(?!\D+$).{6,12}$/;
		var val=$("#R_username").val();
		if(!ret.test(val)){
			$(".Tips1").html("请输入有效的用户名");
			Tips1=false;
		}
		else{
			$(".Tips1").html("");
			Tips1=true;
		}
	});
	$("#R_password").focusout(function(){
		if($(this).val().length>18||$(this).val().length<6){
			$(".Tips2").html("请输入6-18位的密码");
			Tips2=false;
		}
		else{
			$(".Tips2").html("");
			Tips2=true;
		}
	});
	$("#passwordCheck").focusout(function(){
		if($(this).val()!=$("#R_password").val()){
			$(".Tips3").html("密码不一致");
			Tips3=false;
		}
		else if($(this).val().length===0){
			$(".Tips3").html("密码不能为空");
			Tips3=false;
		}
		else{
			$(".Tips3").html("");
			Tips3=true;
		}
	});
	$("#email").focusout(function(){
		if($(this).val().length===0){
			$(".Tips4").html("邮箱不能为空");
			Tips4=false;
		}
		else{
			$(".Tips4").html("");
			Tips4=true;
		}
	});
	$("#address").focusout(function(){
		if($(this).val().length===0){
			$(".Tips5").html("地址不能为空");
			Tips5=false;
		}
		else{ 
			$(".Tips5").html("");
			Tips5=true;
		}
	});
	/*注册按钮*/
	$("#submit").click(function(){
		$("#R_username").focusout();
		$("#R_password").focusout();
		$("#passwordCheck").focusout();
		$("#email").focusout();
		$("#address").focusout();
		if(Tips1&&Tips2&&Tips3&&Tips4&&Tips5){
			var username=$("#R_username").val();
			var password=$("#R_password").val();
			var email=$("#email").val();
			var address=$("#address").val();
			var time=(new Date()).toLocaleString();
			var json={
				username:username,
				password:password,
				email:email,
				address:address,
				time:time
			};
			$.ajax({
				type:"POST",
				url:"/signup",
				contentType:"application/json; charset=utf-8",
				data:JSON.stringify(json),
				success:function(data){
					if(data=="用户名已存在"){
						$(".Tips1").html("用户名已存在");
					}else if(data){
						alert("注册成功");
						window.location.href="/index.html";
					}
				},
				error:function(err){
					alert(err);
				}
			});
		}
		else{
			return false;
		}
	});
	/*登录按钮*/
	$(".submit").click(function(){
		var json={
			username:$("#L_username").val(),
			password:$("#L_password").val()
		};
		$.ajax({
			type:"POST",
			url:"/login",
			contentType:"application/json; charset=utf-8",
			data:JSON.stringify(json),
			success:function(data){
				alert(data);
				if(data=="登录成功"){
					window.location.href="/index.html";
				}
			}, 
			error:function(err){
				alert("发生错误"+err);
			}
		});
	});
});
