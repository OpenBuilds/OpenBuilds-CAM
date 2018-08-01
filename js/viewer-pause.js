// check if browser window has focus
var notIE = (document.documentMode === undefined),
  isChromium = window.chrome;

if (notIE && !isChromium) {

  // checks for Firefox and other  NON IE Chrome versions
  $(window).on("focusin", function() {

    // tween resume() code goes here
    setTimeout(function() {
      console.log("focus");
      pauseAnimation = false;
      animate();
      // $('html, body').css('filter', 'blur(0px)');
    }, 100);

  }).on("focusout", function() {

    // tween pause() code goes here
    console.log("blur");
    pauseAnimation = true;

  });

} else {

  // checks for IE and Chromium versions
  if (window.addEventListener) {

    // bind focus event
    window.addEventListener("focus", function(event) {

      // tween resume() code goes here
      setTimeout(function() {
        // $('html, body').css('filter', 'blur(0px)');
        console.log("focus");
        pauseAnimation = false;
        animate();
      }, 100);

    }, false);

    // bind blur event
    window.addEventListener("blur", function(event) {

      // tween pause() code goes here
      console.log("blur");
      pauseAnimation = true;
      // $('html, body').css('filter', 'blur(2px)');
    }, false);

  } else {

    // bind focus event
    window.attachEvent("focus", function(event) {

      // tween resume() code goes here
      setTimeout(function() {
        console.log("focus");
        pauseAnimation = false;
        animate();
        // $('html, body').css('filter', 'blur(0px)');
      }, 100);

    });

    // bind focus event
    window.attachEvent("blur", function(event) {

      // tween pause() code goes here
      pauseAnimation = true;
      console.log("blur");

    });
  }
}