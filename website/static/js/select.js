$(document).ready(function(){
	function display(){
		$.ajax({
			type:"GET",
			url:"/productDisplay",
			success:function(data){
				$.each(data,function(index,item){
					var $item=$('.goodsBox:hidden').clone();
					$item.attr('hidden',false);
					$item.find('.productID').html(item.productID);
					$item.find('.pic').attr('src',item.src);
					$item.find('.descrip').html(item.description);
					$item.find('.price').html(item.price.toFixed(2));
					$item.find('.buy').click(buy);
					$('.products_list').append($item);
				});
			},
			error:function(err){
				alert(err);
			}
		});
	}
	display();

	function buy(){
		var json={
			productID:$(this).siblings('.productID').html()
		};
		$.ajax({
			type:"POST",
			url:"/buy",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(json),
			success:function(data){
				if(data.number){
					$('.num').html(data.number);
					alert("已加入购物车");
				}
			},
			error:function(err){
				alert(err);
			}
		});
	}
});
