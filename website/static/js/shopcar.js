/*购物车*/
$(document).ready(function(){
	/*载入时运行的函数*/
	/*购物车展示*/
	function display(){
		$.ajax({
			type:"GET",
			url:"/S_display",
			success:function(data){
				var shopName=[];
				$.each(data,function(index,obj){
					if(index===0){
						shopName.push(obj.shopName);
						let $shop=$('.shop:hidden').clone();
						$shop.attr('hidden',false);
						$shop.attr('value',obj.shopName);
						$shop.find('.shopName').html(obj.shopName);
						$('table').append($shop);
					}else{
						if(shopName.every(function(item){
							return obj.shopName!=item;
						})){
							shopName.push(obj.shopName);
							let $shop=$('.shop:hidden').clone();
							$shop.attr('hidden',false);
							$shop.attr('value',obj.shopName);
							$shop.find('.shopName').html(obj.shopName);
							$('table').append($shop);
						}
					}
					var $item=$(".item:hidden").clone();
					$item.attr('hidden',false);
					$item.find('.productID').html(obj.productID);
					$item.find('.itemImg').attr('src',obj.src);
					$item.find('.description').html(obj.description);
					$item.find('.color').html(obj.color);
					$item.find('.size').html(obj.size);
					if(obj.discount){
						$item.find('.discount').html(obj.discount.toFixed(2));
					}else{
						$item.find('.disBox').next().remove();
						$item.find('.disBox').remove();
					}
					$item.find('.realPrice').html(obj.price.toFixed(2));
					$item.find('.productNum').val(obj.amount);
					$item.find('.prices').html(obj.prices.toFixed(2));
					$('.shop[value="'+obj.shopName+'"]').after($item);
				});
				$('#shopNum').html(data.length);
				$('body').append("<script src=\"js/shopcar1.js\"></script>");
			},
			error:function(err){
				alert(err);
			}
		});
	}
	display();
});