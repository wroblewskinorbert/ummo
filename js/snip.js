// javascript:var scr=document.createElement('script');scr.src="http://ummo.pl/snip.js";document.body.appendChild(scr);

(function() {

  if (window.snip) return;

  var snip = window.snip = {};

  // JavaScript Document
  if (!window.jQuery) {
    var scr = document.createElement('script');
    scr.src = "http://code.jquery.com/jquery-latest.js";
    document.body.appendChild(scr);
    scr = document.createElement('script');
    scr.src = "http://code.jquery.com/ui/1.11.1/jquery-ui.js";
    document.body.appendChild(scr);
    scr = document.createElement('link');
    scr.rel = "stylesheet"
    scr.href = "//code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css";
    document.head.appendChild(scr);
  }

  window.log = function() {
    log.history = log.history || [];
    log.history.push(arguments);
    if (this.console) {
      // console.log(Array.prototype.slice.call(arguments))
      var arg = arguments;
      console.log.apply(window.console, arg);
    }
  };


  var paramValue;

  snip.paramValue = function(name) {
    var regex, regexS, results;
    name = name.replace(/[\[]/, "\\[")
      .replace(/[\]]/, "\\]");
    regexS = "[\\?&]" + name + "=([^&#]*)";
    regex = new RegExp(regexS);
    results = regex.exec(window.location.href);
    if (results == null) {
      return "";
    }
    else {
      return results[1];
    }
  };

  snip.loadScriptGoogleMaps= function () {
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = 'https://maps.googleapis.com/maps/api/js?v=3.7&key=AIzaSyB7lRFcV3AlGluh99OAMjgUd2So_exfswI=false&libraries=weather&' + 'callback=initialize';
				document.body.appendChild(script);
			}


  
  window.log('Snip loaded!')

})();