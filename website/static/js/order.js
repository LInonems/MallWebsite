/*结算页*/
$(document).ready(function(){
	
	function addHover1(){
		$(this).addClass('sDeliInfoHover');
	}
	function removeHover1(){
		$(this).removeClass('sDeliInfoHover');
	}
	function choose(){
		var $that=$(this);
		$.each($('.sDeliInfo:visible'),function(){
			if($(this).is($that)){
				$(this).children('.choose').removeClass('none');
				$(this).addClass('sDeliInfoHover1');
			}else{
				$(this).children('.choose').addClass('none');
				$(this).removeClass('sDeliInfoHover1');
			}	
		});
	}
	function display(){
		$.ajax({
			type:"GET",
			url:"/O_display",
			success:function(data){
				$.each(data,function(index){
					if(index===data.length-1){
						$('#totalPrices').html(data[index].totalPrices.toFixed(2));
						return;
					}
					$item=$('.goods:hidden').clone();
					$item.removeClass('hidden');
					$item.find('.productID').html(data[index].productID);
					$item.find('.itemImg').attr('src',data[index].src);
					$item.find('.descript').children().html(data[index].description);
					$item.find('.color').html(data[index].color);
					$item.find('.size').html(data[index].size);
					$item.find('.pric').html(data[index].price.toFixed(2));
					$item.find('.amo').html(data[index].amount);
					$item.find('.prices').html(data[index].prices.toFixed(2));
					$('table').append($item);
				});
			},
			error:function(err){
				alert(err);
				window.location.href="/";
			}
		});
	}
	function address(){
		$.ajax({
			type:"GET",
			url:"/O_address",
			success:function(data){
				if(data.length===0){
					return;
				}
				$.each(data,function(index){
					var $info=$('.sDeliInfo.hidden').clone();
					$info.removeClass('hidden');
					$info.find('.addressID').html(data[index].addressID);
					$info.find('.city').html(data[index].city);
					$info.find('.district').html(data[index].district);
					$info.find('.receiver').html(data[index].receiver);
					$info.find('.address').html(data[index].detail);
					$info.find('.phoneNum').html(data[index].phoneNum);
					$info.hover(addHover1,removeHover1);
					$info.click(choose);
					$('.deliveryInfo').append($info);
				});
				$('.deliInfo').addClass('none');
				$('.addAddress').removeClass('none');
				$('.delAddress').removeClass('none');
			},
			error:function(err){
				alert(err);
			}
		});
	}
	display();
	address();
	/*地区选择*/
	$('.citys').change(function(){
		$select=$('select[name]');
		$.each($select,function(){
			if($('.citys option:selected').val()===$(this).attr('name')){
				$(this).removeClass('none');
			}else{
				$(this).addClass('none');
			}
		});
	});
	/*确认*/
	$('.sure').click(function(){
		var city=$('.citys option:selected').val();
		var district=$('select[name]:visible option:selected').val();
		var address=$('#address').val();
		var receiver=$('#receiver').val();
		var phoneNum=$('#phoneNum').val();
		var json={
			city:city,
			district:district,
			detail:address,
			receiver:receiver,
			phoneNum:phoneNum
		};
		$.ajax({
			type:"POST",
			url:"/O_addAddress",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(json),
			success:function(data){
				$info=$('.sDeliInfo.hidden').clone();
				$info.removeClass('hidden');
				$info.find('.addressID').html(data.addressID);
				$info.find('.city').html(city);
				$info.find('.district').html(district);
				$info.find('.receiver').html(receiver);
				$info.find('.address').html(address);
				$info.find('.phoneNum').html(phoneNum);
				$info.hover(addHover1,removeHover1);
				$info.click(choose);
				$('.deliInfo').addClass('none');
				$('.deliveryInfo').append($info);
				$.each($('.sDeliInfo'),function(){
					$(this).removeClass('none');
				});
				$('.addAddress').removeClass('none');
				$('.delAddress').removeClass('none');
			},
			error:function(err){
				alert(err);
			}
		});
	});

	/*地址栏hover事件*/
	$('.sDeliInfo').hover(addHover1,removeHover1);
	/*地址点击事件*/
	$('.sDeliInfo').click(choose);
	/*添加新地址*/
	$('.addAddress').click(function(){
		$('.deliInfo').removeClass('none');
		$.each($('.sDeliInfo'),function(){
			$(this).addClass('none');
		});
		$('.addAddress').addClass('none');
		$('.delAddress').addClass('none');
	});
	/*删除地址*/
	$('.delAddress').click(function(){
		if(confirm("是否删除选中的地址？")){
			var $address=$('.choose:visible').parent();
			var json={addressID:$address.find('.addressID').html()};
			$.ajax({
				type:"POST",
				url:"/O_delAddress",
				contentType:"application/json;charset=utf-8",
				data:JSON.stringify(json),
				success:function(data){
					$address.remove();
					if($('.sDeliInfo').length==1){
						$('.addAddress').trigger('click');
					}
				},
				error:function(err){
					alert(err);
				}
			});
		}
	});
	/*订单提交*/
	$('#oPay').click(function(){
		var $address=$('.choose:visible').parent();
		var payMethod=$('input[name=payMethod]:checked').val();
		var json={
			addressID:$address.find('.addressID').html(),
			payMethod:payMethod
		};
		$.ajax({
			type:"POST",
			url:"/O_order",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(json),
			success:function(data){
				alert("订单提交成功");
				window.location.href="/select.html";
			},
			error:function(err){
				alert(err);
			}
		});
	});
});