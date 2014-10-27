<!DOCTYPE html>
<html>

<head>
	<meta charset="UTF-8">
	<title>CodePen - A Pen by norbertwroblewski</title>
	<style>

	</style>
<link rel="stylesheet" href="./css/style.css">
	<body>
		<meta name="viewport" content="initial-scale=1.0, user-scalable=no">
		<title>Impet firmy</title>
		<script src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script>
			<div id="gora"></div>
		<div id="main" style="height: 80%;">
			<div id="goraIn"></div>
			<div id="lewy"></div>
			<div id="prawy"></div>
			<div id="dolIn"></div>
			<div id="mapCanvas"></div>
			
		</div>
		<div id="dol"></div>
		<script>
			window.onload = initialize;

			function initialize() {
				var opt = {
					zoom: 7,
					center: {
						lat: 52,
						lng: 19.5
					}
				}
				var mapCan = document.getElementById('mapCanvas');
				window.map = new google.maps.Map(mapCan, opt);
			}
			 //@ sourceURL=pen.js
		</script>
	</body>

</html>