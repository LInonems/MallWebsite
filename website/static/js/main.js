/*登录以后登录信息的显示*/
$(document).ready(function(){
	/*hover函数*/
	$('.username').hover(function(){
		$('.personalInfo').removeClass('none');
		$('.username').addClass('loginedHover');
	},function(){
		$('.personalInfo').addClass('none');
		$('.username').removeClass('loginedHover');
	});
	$('.personalInfo').hover(function(){
		$('.username').trigger("mouseenter");
	},function(){
		$('.username').trigger("mouseleave");
	});

	/*购物栏中的删除商品*/
	function s_del(){
		if(confirm("是否删除此件商品?")){
			var json=[];
			json.push({
				productID:$(this).closest('.shopItem').find('.productID').html()
			});
			$.ajax({
				type:"POST",
				url:"/S_del",
				contentType:"application/json;charset=utf-8",
				data:JSON.stringify(json),
				success:function(data){
					alert("删除成功");
					$(this).closest('.shopItem').remove();
				},
				error:function(data){
					alert(data);
				}
			});
		}
	}

	/*购物栏显示*/
	$('.info li:nth-child(3)').hover(function(){
		$('.shopcarList').removeClass('none');
		$.ajax({
			type:"GET",
			url:"/S_shopcarList",
			success:function(data){
				if(data.length==0){
					$('#nothing').removeClass('none');
				}else{
					$('#nothing').addClass('none');
					$.each(data,function(index,item){
						var $item=$('.shopItem:hidden').clone();
						$item.attr('hidden',false);
						$item.find('.productID').html(data[index].productID);
						$item.find('img').attr('src',data[index].src);
						$item.find('.des').html(data[index].description);
						$item.find('.col').html(data[index].color);
						$item.find('.siz').html(data[index].size);
						$item.find('.pri').html(data[index].realPrice.toFixed(2));
						$item.find('.s_del').click(s_del);
						$('.shopcarList').append($item);
					});
				}
			},
			error:function(err){
				alert(err);
			}
		});
	},function(){
		$.each($('.shopItem:visible'),function(){
			$(this).remove();
		});
		$('.shopcarList').addClass('none');
	});


	$('.info li:nth-child(4)').hover(function(){
		$('.business').removeClass('none');
	},function(){
		$('.business').addClass('none');
	});


	/*获取个人信息*/
	function getUser(){
		$.ajax({
			type:"GET",
			url:"/getUser",
			success:function(data){
				$('#username').html(data.name);
				$('.headPic').attr('src',data.src);
				$('.num').html(data.number);
			},
			error:function(err){
				alert(err);
			}
		});
	}
	
	/*判断是否登录*/
	function user(){
		$.ajax({
			type:"GET",
			url:"/logined",
			success:function(data){
				if(data.logined){
					$('.logined').removeClass('none');
					$('.logined').prev().addClass('none');
					getUser();
				}
			},
			error:function(err){
				alert(err);
			}
		});
	}
	user();

	/*退出登录*/
	$('.quit').click(function(){
		$.ajax({
			type:"GET",
			url:"/logout",
			success:function(data){
				alert(data);
				$('.logined').addClass('none');
				$('.logined').prev().removeClass('none');
			},
			error:function(err){
				alert(err);
			}
		});
	});
});