/*主页*/
$(document).ready(function(){
	$(".shopClass_show").on('click','dl',function(){
		$('.shopClass_items').each(function(){
			if($(this).is('.shopClass_active')){
				$(this).removeClass('shopClass_active');
			}
		});
		$(this).addClass('shopClass_active');
		$('.shopClass_list').toggleClass('none').toggleClass('block');
	});
	$(".shopClass h3").click(function(){
		$(this).next().toggleClass('none').toggleClass('block');
		if($(this).next().is('.none')){
			$(this).next().next().removeClass('block').addClass('none');
		}
	});
	function display(){
		$.ajax({
			type:"GET",
			url:"I_display",
			success:function(data){
				$.each(data,function(index){
					
				});

			}
		});
	}
});