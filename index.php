<?php header( "Content-type: text/html; charset=UTF-8"); header( 'Access-Control-Allow-Origin: http://localhost'); ?>
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no">
	<title>Impet firmy</title>
	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp?key=AIzaSyDHaItyuZuyU_DvDJ9y-BnUu7WHionh29A"></script>
	<link rel="Shortcut icon" href="./images/impetIkona.png" />
	<link type="text/css" href="./css/ui.css" rel="stylesheet">
	<link rel="stylesheet" href="./css/theme.blue.css">
	<link type="text/css" href="./css/impet.css" rel="stylesheet">
</head>
<body>
	<div id="main-container">
		<div id='obsluga'></div>
		<div id='map-container'>
			<div id="panelLewy">
				<div id="panelLewyWrapper">
					<div id="panelLewyTrasa"></div>
					<div id="panelLewyTrasy">
					</div>
					<div id="trasaOpis">
						<b></b>
					</div>
				</div>
			</div>
			<div id="panelLewyHandler">

			</div>
			<button id='buttonTrasy' onclick="impet.zacznijZaznaczanie()">
				T
			</button>
<!--
			<div id="trasaOpis2" style="position:fixed; padding: 5px 2px 2px 2px; top:0px; height:55px; width:inherit; background-color: #dddddd; z-index: 3;">
				Trasa:
			</div>
-->
			<div id="mapCanvas">
			</div>
		</div>
	</div>
	<div id="panelDolny">
		<div class="handle" id="uchwytPanelDolny">
		</div>
		<div id="table-container">
		</div>
	</div>
	<div id="panel">
		<input id="address" type="textbox" size="30" placeholder="Wpisz szukany adres...">
		<input type="button" value="Szukaj" onclick="codeAddress()">
	</div>
	<div id="panel-gorny-container2">
		<div>
			 <?php include "panelfirmy.php" ?>
			<button id="button-panel-gorny2">
				Zwiń
			</button>
		</div>
	</div>

	<div id="panel-gorny-container">

		<div id="panel-gorny">
			<form name="przelaczniki" id=przelaczniki>
				<fieldset name="fieldDlaPrzelacznikow">
					<legend>
						Warstwa:
					</legend>
					<ul>
						<li>
							<label for="toggleLayer1">Ocena</label>
							<input type="checkbox" onchange="layer_1.setMap(!$('#toggleLayer1')[0].checked ? null : map);" id='toggleLayer1' />
						</li>
						<li>
							<label for="toggleLayer">Priorytet</label>
							<input type="checkbox" onchange="layer.setMap(!$('#toggleLayer')[0].checked ? null : map);" id='toggleLayer' />
						</li>
						<li>
							<label for="checkboxPrzelaczPogode">Pogoda</label>
							<input type="checkbox" onchange="przelaczPogode();" id='checkboxPrzelaczPogode' />
						</li>
						<li>
							<label for="checkboxPrzelaczChmury">Chmury</label>
							<input type="checkbox" onchange="przelaczChmury();" id='checkboxPrzelaczChmury' />
						</li>
					</ul>
				</fieldset>
			</form>
			<div>
				<input type="text" oninput="" id="search-string_0">
				<input type="button" onclick="" value="Szukaj">

				<br>
			</div>
			<div id='ustawieniaMiast'>
				<input type='checkbox' id='czyMiasta'>
				<input type='color' id='colorMiast'>
				<div id='opacityMiast' style='width:200px; float:left; margin:10px;'></div>
			</div>
			<div id='optFirmy'>
				<label for="czyNasi">Wszyscy?</label>
				<input type="checkbox" id="czyNasi" />
			</div>
			<h1>A tak</h1>
		</div>
		<div>
			<button id="button-panel-gorny">
				Zwijaj
			</button>
		</div>
	</div>
	<script src="./js/jquery-1.10.2.js" type="text/javascript"></script>
	<script src="./js/jquery-ui.min.js" type="text/javascript"></script>
	<!--
        <script src="./js/jquery.tablesorter.js" type="text/javascript"></script>
        <script src="./js/jquery.tablesorter.widgets.js" type="text/javascript"></script>
-->
	<script src="./js/infobox.js"></script>
	<script src="./js/canvas.js"></script>
	<script src="./js/markery.js"></script>
	<script src="./js/imp.js" type="text/javascript"></script>
	<script src="./js/dodatki.js" type="text/javascript"></script>
	<script defer src="./js/contextMenu.js"></script>
</body>
</html>

