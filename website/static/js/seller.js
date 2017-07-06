/*商家页面*/
$(document).ready(function(){

	function remove(){
		if(confirm("是否下架此商品?")){
			var json={productID:$(this).closest('.sellingItem').find('.productID').html()};
			$.ajax({
				type:"POST",
				url:"/K_del",
				contentType:"application/json;charset=utf-8",
				data:JSON.stringify(json),
				success:function(data){
					alert('删除成功');
					$(this).closest('.sellingItem').remove();
				},
				error:function(err){
					alert(err);
				}
			});
			$(this).closest('.sellingItem').remove();
		}
	}
	function revise(){

	}


	$('.open').click(function(){
		$('.sellingItem:visible').remove();
		$.each($('div[name="same"]'),function(){
			$(this).addClass('none');
		});
		$('.setUp').removeClass('none');
	});
	$('.opened').click(function(){
		$('.sellingItem:visible').remove();
		$.each($('div[name="same"]'),function(){
			$(this).addClass('none');
		});
		$('.shopInfo').removeClass('none');
	});
	$('.sell').click(function(){
		$('.sellingItem:visible').remove();
		$.each($('div[name="same"]'),function(){
			$(this).addClass('none');
		});
		$('.sellGoods').removeClass('none');
	});

	

	

	/*注册商铺*/
	$('#setUp').click(function(){
		$('.sellingItem:visible').remove();

		var json={
			shopName:$('#shopName').val(),
			ownerName:$('#ownerName').val(),
			identity:$('#identity').val(),
			time:(new Date()).toLocaleString()
		};
		$.ajax({
			type:"POST",
			url:"/K_setUp",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(json),
			success:function(data){
				alert("注册商铺成功");
				window.location.reload();
			},
			error:function(err){
				alert(err);
			}
		});
	});

	/*出售宝贝*/
	$('#upload').click(function(){
		$.ajaxFileUpload({
			type:"POST",
			url:'/K_uploadImg',
			secureuri:false,
			fileElementId:'goodsImg',
			dataType:'json',
			success:function(data){
				var json={
					src:data.src,
					productID:data.productID,
					description:$('#goodsDescription').val(),
					price:$('#goodsPrice').val(),
					stock:$('#goodsStock').val()
				};
				$.ajax({
					type:"POST",
					url:"/K_sell",
					contentType:"application/json;charset=utf-8",
					data:JSON.stringify(json),
					success:function(data){
						alert('出售成功!');
						$('.selling').click();
					},
					error:function(err){
						alert(err);
					}
				});
			},
			error:function(err){
				alert(err);
			}
		});
	});

	/*出售商品展示*/
	$('.selling').click(function(){
		if($('.sellingGoods').is('.none')){
			$.ajax({
				type:"GET",
				url:"/K_showSelling",
				success:function(data){
					$.each(data,function(index){
						var $item=$('.sellingItem:hidden').clone();
						$item.removeClass('hidden');
						$item.find('.productID').html(data[index].productID);
						$item.find('.itemImg').attr('src',data[index].src);
						$item.find('.represent').html(data[index].description);
						$item.find('.RMB').html(data[index].price.toFixed(2));
						$item.find('.quantity').html(data[index].amount);
						$item.find('.revise').click(revise);
						$item.find('.remove').click(remove);
						$('.sellingGoods table').append($item);
						$('.sellingNum').html(data.length);
					});
				},
				error:function(err){
					alert(err);
				}
			});

			$.each($('div[name="same"]'),function(){
				$(this).addClass('none');
			});
			$('.sellingGoods').removeClass('none');
		}
	});

	/*图片预览*/
	$('#goodsImg').change(function(event){
		var reader=new FileReader();
		reader.readAsDataURL($('#goodsImg')[0].files[0]);
		reader.onload=function(){
			$('.goodsInfo img').attr('src',reader.result);
		};
	});

	/*订单展示*/
	$('.send').click(function(){
		$('.sellingItem:visible').remove();
		$.ajax({
			type:"GET",
			url:"/K_showSend",
			success:function(data){
				$.each(data,function(index){
					var length=data[index].length;
					$.each(data[index],function(inde,item){
						if(inde==length-1){
							return;
						}
						$item=$('.sendItem:hidden').clone();
						$item.removeClass('hidden');
						$item.find('.productID').html(item.productID);
						$item.find('.itemImg').attr('src',item.src);
						$item.find('.represent').html(item.description);
						$item.find('.color').html(item.color);
						$item.find('.size').html(item.size);
						$item.find('.s_RMB').html(item.price);
						$item.find('.s_amount').html(item.amount);
						$item.find('.s_totalPrices').html(item.prices);
						$item.find('.orderID').html(data[index][length-1].orderID);
						$item.find('.s_receiver').html(data[index][length-1].receiver);
						$item.find('.s_general').html(data[index][length-1].city+data[index][length-1].district);
						$item.find('.s_detail').html(data[index][length-1].detail);
						$item.find('.s_send').click(send);
						$('.sendGoods table').append($item);
					});
				});
			}
		});
		$.each($('div[name="same"]'),function(){
			$(this).addClass('none');
		});
		$('.sendGoods').removeClass('none');
	});

	/*发货*/
	function send(){
		var json={
			orderID:$(this).closest('.sendItem').find('.orderID').html(),
			productID:$(this).closest('.sendItem').find('.productID').html()
		};
		$that=$(this);
		if(confirm('是否已经发货?')){
			$.ajax({
				type:"POST",
				url:"/K_send",
				contentType:"application/json;charset=utf-8",
				data:JSON.stringify(json),
				success:function(data){
					alert(data);
					$that.closest('.sendItem').remove();
				},
				error:function(err){
					alert(err);
				}
			});
		}
	}
});