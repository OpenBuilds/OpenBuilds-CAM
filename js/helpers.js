//  Functions to extend prototypes


// Helper to generate hours:minutes:seconds for accumulated job time
// Adapted from StackOverflow
// http://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss/6313008#6313008
Number.prototype.toHHMMSS = function () {
    var sec_num = Math.round(this);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}


//JQuery extension to add additional event triggers
// This assumes JQuery has been loaded first!
!function ($) {

	$.each(['show', 'hide'], function (i, ev) {
		var el = $.fn[ev];
		$.fn[ev] = function () {
			this.trigger(ev);
			return el.apply(this, arguments);
		};
	});
} (jQuery);

