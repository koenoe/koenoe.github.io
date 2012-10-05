//Google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-7034441-4']);
_gaq.push(['_trackPageview']);

(function() {
var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

//When dom is loaded do some awesomeness
$(function(){

	//Fade in the social media icons
	var delay = 200;
	$('#socialmedia a').each(function(){
		$(this).delay(delay).animate({
			opacity: 1,
			marginTop: 0
		}, 500);
		delay += 200;
	});
});

