var Feedback =  {
	init: function() {

		var feedbackType = '';

		$('.feedback-positive').click(function(){
			feedbackType = 'Positief';
			$(this).addClass('is-active');
			$('.feedback-negative').removeClass('is-active');
			$('.feedback-overlay').removeClass('negative-form').addClass('positive-form').fadeIn(300);
		});

		$('.feedback-negative').click(function(){
			feedbackType = 'Negatief';
			$(this).addClass('is-active');
			$('.feedback-positive').removeClass('is-active');
			$('.feedback-overlay').addClass('negative-form').removeClass('positive-form').fadeIn(300);
		});

		$('.feedback-close').click(function(e) {
			e.preventDefault();
			$('.feedback-negative, .feedback-positive').removeClass('is-active');
			$('.feedback-overlay').fadeOut(300, function(){
				$('.feedback-overlay').removeClass('negative-form').removeClass('positive-form');
				$('.feedback-error').hide();
				$('.feedback-form form').show();
				$('.feedback-succes').hide();
			});
		});

		$('.feedback-form').on('submit', function(e){
			e.preventDefault();

			var formData = {
				'feedback': $('.widget-feedback').val(),
				'type': feedbackType
			};

			if (formData !== ''){
				$.ajax({
		            type: 'post',
		            url: '../feedback',
		            data: formData,
		            success: function (data) {
		            	if (data == false) {
		            		$('.feedback-error').show();
		            	} else {
		            		$('.feedback-form textarea').val('');
		            		$('.feedback-form form').hide();
		            		$('.feedback-succes').show();
		            		setTimeout(function(){ 
		            			$('.feedback-negative, .feedback-positive').removeClass('is-active');
								$('.feedback-overlay').fadeOut(300, function(){
									$('.feedback-overlay').removeClass('negative-form').removeClass('positive-form');
									$('.feedback-error').hide();
									$('.feedback-form form').show();
		            				$('.feedback-succes').hide();
								});
		            		}, 3000);
		            	}
		            	
		            }
		        });
			}

		});
	}
}

Feedback.init();