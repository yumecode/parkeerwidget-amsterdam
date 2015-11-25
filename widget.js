window.onresize = function(){
	iframe = document.getElementById("parkwidget");
	
	if(iframe.offsetWidth < 581) {
		iframe.style.height = '710px';
	} else {
		iframe.style.height = '450px';
	}
}

if (typeof console == 'undefined') {
	console = {
		log: function () {
			return false;
		}
	}
}