/*数量加减的hover函数*/
function addHover(){
	$(this).addClass('hover');
}
function removeHover(){
	$(this).removeClass('hover');
}

function amount(that,value){
	$item=that.closest('.item');
	var val=value;
	var prices=(val*$item.find('.realPrice').html());
	var variable=prices-$item.find('.prices').html();
	var productID=$item.find('.productID').html();
	var json={
		productID:parseInt(productID),
		amount:parseInt(val),
		prices:parseFloat(prices)
	};
	$.ajax({
		type:"POST",
		url:"/S_amount",
		contentType:"application/json;charset=utf-8",
		data:JSON.stringify(json),
		success:function(data){
			$item.find('.prices').html(prices.toFixed(2));
			if($item.find('input[name="product"]').prop('checked')){
				var totalPrices=parseFloat($('#totalPrices').html());
				totalPrices+=variable;
				$('#totalPrices').html(totalPrices.toFixed(2));
			}
		},
		error:function(err){
			alert(err);
		}
	});
}
/*数量减少函数*/
function minus(){
	var val=$(this).next().val();
	if(val>1){
		$(this).next().val(parseInt(val)-1);
		$(this).next().trigger('change');
		amount($(this),$(this).next().val());
	}
}
/*数量增加函数*/
function plus(){
	var val=$(this).prev().val();
	if(val<12){
		$(this).prev().val(parseInt(val)+1);
		$(this).prev().trigger('change');
		amount($(this),$(this).prev().val());
	}
}
/*商品数量和总价格变化函数*/
function change(check,that){
	var prices=parseInt(that.parent().parent().next().next().next().next().children().children().html());
	var totalPrices=parseInt($('#totalPrices').html());
	var amount=parseInt($('.amount').html());
	if(check){
		totalPrices=totalPrices+prices;
		$('#totalPrices').html(totalPrices.toFixed(2));
		$('.amount').html(amount+1);
	}else{
		totalPrices=totalPrices-prices;
		$('#totalPrices').html(totalPrices.toFixed(2));
		$('.amount').html(amount-1);
	}
}


var $product=$('input[name="product"]:visible');

/*单选*/
$product.click(function(){
	$('.checkAll').prop("checked",$product.length==$("input[name='product']:checked").length);
	$(this).parent().parent().parent().toggleClass('check',this.checked);
	change(this.checked,$(this));
});

/*全选*/
$('.checkAll').click(function(){
	var check=this.checked;
	if(check){
		$.each($product,function(index){
			if($(this).closest('.item').attr('hidden')){
				$product.splice(index,1);
			}
		});
	}
	$('.checkAll').prop("checked",check);
	$.each($product,function(){
		$(this).parent().parent().parent().toggleClass('check',check);
		if(!this.checked){
			change(!this.checked,$(this));
		}
		if(!check){
			change(check,$(this));
		}
		$(this).prop("checked",check);
	});
});

/*数量输入框提交*/
$('.productNum').keyup(function(){
	var productID=$(this).closest('.item').find('.productID').html();
	if(isNaN($(this).val())){
		var json={productID:parseInt(productID)};
		$.ajax({
			type:"GET",
			url:"/S_amount",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(json),
			success:function(data){
				$(this).val(data.amount);
			},
			error:function(err){
				alert(err);
			}
		});
		$(this).val("1");
	}
	else if($(this).val()>12){
		$(this).val("12");
	}
	else if($(this).val()<1){
		$(this).val("1");
	}else{
		amount($(this),$(this).val());
	}
});

$('.productNum').change(function(){
	var val=$(this).val();
	var minusEvent=$._data($(this).prev()[0], "events");
	var plusEvent=$._data($(this).next()[0], "events");
	if(val==1){
		if(!(plusEvent && plusEvent.click)){
			$(this).next().on('click',plus).removeClass('hover').hover(addHover,removeHover).html('+').css("cursor","pointer");
		}	
		$(this).prev().off('click').html('&nbsp;').removeClass('hover').unbind('mouseenter mouseleave').css("cursor","default");
	}
	else if(val==12){
		if(!(minusEvent && minusEvent.click)){
			$(this).prev().on('click',minus).removeClass('hover').hover(addHover,removeHover).html('-').css("cursor","pointer");
		}
		$(this).next().off('click').html('&nbsp;').removeClass('hover').unbind('mouseenter mouseleave').css("cursor","default");
	}
	else{
		if(!(minusEvent && minusEvent.click)){
			$(this).prev().on('click',minus).removeClass('hover').hover(addHover,removeHover).html('-').css("cursor","pointer");
		}
		if(!(plusEvent && plusEvent.click)){
			$(this).next().on('click',plus).removeClass('hover').hover(addHover,removeHover).html('+').css("cursor","pointer");
		}
	}
});



$.each($('.productNum:visible'),function(index){
	if($(this).val()==1){
		$(this).prev().html('&nbsp;');
		$(this).prev().html('&nbsp;');
		$(this).next().click(plus);
		$(this).next().hover(addHover,removeHover);
	}else if($(this).val()==12){
		$(this).next().html('&nbsp;');
		$(this).next().html('&nbsp;');
		$(this).prev().click(minus);
		$(this).prev().hover(addHover,removeHover);
	}else{
		$(this).prev().click(minus);
		$(this).prev().hover(addHover,removeHover);
		$(this).next().click(plus);
		$(this).next().hover(addHover,removeHover);
	}
});

/*删除商品*/
$('.del').click(function(){
	if(confirm("是否删除此件商品?")){
		var $item=$(this).parent().closest('.item');
		var json=[{productID:parseInt($item.find('.productID').html())}];
		$.ajax({
			type:"POST",
			url:"/S_del",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(json),
			success:function(data){
				alert(data);
				$item.remove();
			},
			error:function(err){
				alert(err);
			}
		});
	}
});

/*删除选中的商品*/
$('.aDel').click(function(){
	if(confirm("是否删除选中的商品?")){
		var $del=$("input[name='product']:checked");
		var json=[];
		$.each($del,function(index){
			json[index]={};
			json[index].productID=parseInt($(this).closest('.item').find('.productID').html());
		});
		$.ajax({
			type:"POST",
			url:"/S_del",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(json),
			success:function(data){
				alert(data);
				$.each($del,function(){
					$(this).closest('.item').remove();
				});
			},
			error:function(err){
				alert(err);
			}
		});
	}
});
/*删除失效宝贝*/
$('.rem').click(function(){
});
/*结账*/
$('#pay').click(function(){
	var json=[];
	var totalPrices=0;
	$.each($("input[name='product']:checked"),function(index){
		json[index]={};
		json[index].productID=$(this).closest('.item').find('.productID').html();
	});
	json[json.length]={
		totalPrices:parseFloat($('#totalPrices').html()),
		time:(new Date()).toLocaleString()
	};
	$.ajax({
		type:"POST",
		url:"/S_pay",
		contentType:"application/json; charset=utf-8",
		data:JSON.stringify(json),
		success:function(data){
			if(data=="success"){
				window.location.href="/order.html";
			}
		},
		error:function(err){
			alert(err);
		}
	});
});