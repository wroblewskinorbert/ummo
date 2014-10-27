<style>
	#panelFirma {
		position: relative;
/*		top: -15px;*/
		left: 0px;
		height: 300px;
/*		width:100%;*/
		border: 2px black solid;
		border-radius: 0px 0px 10px 10px;
		padding:12px;
		background: linear-gradient( -11deg, #cceeff, #eeeeff, #bbddff) ;

	}
	#panelFirma > * {
		float:left;
/*		position: absolute;*/
/*		background-color: #eeccee;*/
		top: 5px;
		bottom: 5px;
/*		outline: solid grey 1px;*/
		margin: 2px;
		overflow-y:auto;
		overflow-x: hidden;
/*		font-size: 80%;*/
	}

	#firmaDane{
		margin-top:-5px;
		font-size:0.8em;
		left:5px;
		width:390px;
		background-color:none;
	}
	#firmaDane #firmaNazwa{
		font-weight: 800;
		font-size: 1.25em;
		padding-bottom: 1px;

	}
	#firmaDane #firmaKontakt{
		font-weight: 500;
		float: left;
/*		width:50%;*/
	}

	#firmaDane #firmaAdres{
		float: left;
		width:50%;
		padding-left:5px;
	}

	#firmaUwagi{
		padding:4px;
		background-color:rgba(255,255,255,.6);
		left:400px;
		width:400px;
	}
	#firmaZdarzenia{
		position:absolute;
		left:835px;
		right: 440px;
	}
	#firmaZdarzenia > *, #firmaUwagi > div{
		zoom:0.8;

	}

	* #firmaFaktury{
		padding: 0px;
		margin:0px;
		float:right;
		right:10px;
		width: auto;
	}
	#containerLoader{width:420px;height:50px;top:75%;position:absolute;margin:0 0;left:3PX;right:0;overflow:hidden}
.loader{float:left;width:50px;height:50px;margin:0 5px;position:relative;-webkit-perspective:50px;-moz-perspective:50px;-o-perspective:50px;-ms-perspective:50px;perspective:50px;}
.loader .flip{position:relative;display:block;width:100%;height:100%;background:#fff;-webkit-transform:rotateX(0deg);-moz-transform:rotateX(0deg);-o-transform:rotateX(0deg);-ms-transform:rotateX(0deg);transform:rotateX(0deg);-webkit-transition:all .7s ease;-moz-transition:all .7s ease;-o-transition:all .7s ease;-ms-transition:all .7s ease;transition:all .7s ease;-webkit-transform-style:preserve-3d;-moz-transform-style:preserve-3d;-ms-transform-style:preserve-3d;transform-style:preserve-3d;-webkit-backface-visibility:hidden;-moz-backface-visibility:hidden;-o-backface-visibility:hidden;-ms-backface-visibility:hidden;backface-visibility:hidden}
.loader .flip span{color:#fff;-webkit-backface-visibility:hidden;-moz-backface-visibility:hidden;-o-backface-visibility:hidden;-ms-backface-visibility:hidden;backface-visibility:hidden;position:absolute;display:block;text-align:center;font-size:40px;width:100%;height:100%;top:0;left:0;text-shadow:1px 1px 1px #000}
.loader .flip .front{background:#000;}
.loader .flip .back{-webkit-transform:rotateX(180deg);-moz-transform:rotateX(180deg);-o-transform:rotateX(180deg);-ms-transform:rotateX(180deg);transform:rotateX(180deg)}

.loader1,
.loader1 .flip .back{background:#f30;}
.loader1 .flip{-webkit-animation:loader1 2.5s linear infinite .01s;-moz-animation:loader1 2.5s linear infinite .01s;-ms-animation:loader1 2.5s linear infinite .01s;-o-animation:loader1 2.5s linear infinite .01s;animation:loader1 2.5s linear infinite .01s}

.loader2,
.loader2 .flip .back{background:#7030a0;-webkit-border-radius: 5%;border-radius: 5%;}
.loader2 .flip .front{-webkit-border-radius: 5%;border-radius: 5%;}
.loader2 .flip{-webkit-border-radius: 5%;border-radius: 5%;-webkit-animation:loader1 2.5s linear infinite .2s;-moz-animation:loader1 2.5s linear infinite .2s;-ms-animation:loader1 2.5s linear infinite .2s;-o-animation:loader1 2.5s linear infinite .2s;animation:loader1 2.5s linear infinite .2s}

.loader3,
.loader3 .flip .back{background:#92d050;-webkit-border-radius: 10%;border-radius: 10%;}
.loader3 .flip .front{-webkit-border-radius: 10%;border-radius: 10%;}
.loader3 .flip{-webkit-border-radius: 10%;border-radius: 10%;-webkit-animation:loader1 2.5s linear infinite .4s;-moz-animation:loader1 2.5s linear infinite .4s;-ms-animation:loader1 2.5s linear infinite .4s;-o-animation:loader1 2.5s linear infinite .4s;animation:loader1 2.5s linear infinite .4s}

.loader4,
.loader4 .flip .back{background:#00b0f0;-webkit-border-radius: 20%;border-radius: 20%;}
.loader4 .flip .front{-webkit-border-radius: 20%;border-radius: 20%;}
.loader4 .flip{-webkit-border-radius: 20%;border-radius: 20%;-webkit-animation:loader1 2.5s linear infinite .6s;-moz-animation:loader1 2.5s linear infinite .6s;-ms-animation:loader1 2.5s linear infinite .6s;-o-animation:loader1 2.5s linear infinite .6s;animation:loader1 2.5s linear infinite .6s}

.loader5,
.loader5 .flip .back{background:#f39;-webkit-border-radius: 30%;border-radius: 30%;}
.loader5 .flip .front{-webkit-border-radius: 30%;border-radius: 30%;}
.loader5 .flip{-webkit-border-radius: 30%;border-radius: 30%;-webkit-animation:loader1 2.5s linear infinite .8s;-moz-animation:loader1 2.5s linear infinite .8s;-ms-animation:loader1 2.5s linear infinite .8s;-o-animation:loader1 2.5s linear infinite .8s;animation:loader1 2.5s linear infinite .8s}

.loader6,
.loader6 .flip .back{background:#ffc61d;-webkit-border-radius: 40%;border-radius: 40%;}
.loader6 .flip .front{-webkit-border-radius: 40%;border-radius: 40%;}
.loader6 .flip{-webkit-border-radius: 40%;border-radius: 40%;-webkit-animation:loader1 2.5s linear infinite 1s;-moz-animation:loader1 2.5s linear infinite 1s;-ms-animation:loader1 2.5s linear infinite 1s;-o-animation:loader1 2.5s linear infinite 1s;animation:loader1 2.5s linear infinite 1s}

.loader7,
.loader7 .flip .back{background:#4f81bd;-webkit-border-radius: 100%; border-radius: 100%;}
.loader7 .flip .front{-webkit-border-radius: 100%;border-radius: 100%;}
.loader7 .flip{-webkit-border-radius: 100%;border-radius: 100%;-webkit-animation:loader1 2.5s linear infinite 1.2s;-moz-animation:loader1 2.5s linear infinite 1.2s;-ms-animation:loader1 2.5s linear infinite 1.2s;-o-animation:loader1 2.5s linear infinite 1.2s;animation:loader1 2.5s linear infinite 1.2s}


@keyframes "loader1" {
 0% {

    transform: rotateX(0deg);
 }
 60% {

    transform: rotateX(0deg);
 }
 100% {

    transform: rotateX(360deg);
 }

}

@-moz-keyframes loader1 {
 0% {
   -moz-transform: rotateX(0deg);

 }
 60% {
   -moz-transform: rotateX(0deg);

 }
 100% {
   -moz-transform: rotateX(360deg);

 }

}

@-webkit-keyframes "loader1" {
 0% {
   -webkit-transform: rotateX(0deg);

 }
 60% {
   -webkit-transform: rotateX(0deg);

 }
 100% {
   -webkit-transform: rotateX(360deg);

 }

}

@-ms-keyframes "loader1" {
 0% {
   -ms-transform: rotateX(0deg);

 }
 60% {
   -ms-transform: rotateX(0deg);

 }
 100% {
   -ms-transform: rotateX(360deg);

 }

}

@-o-keyframes "loader1" {
 0% {
   -o-transform: rotateX(0deg);

 }
 60% {
   -o-transform: rotateX(0deg);

 }
 100% {
   -o-transform: rotateX(360deg);

 }

}

</style>

<div id="panelFirma">
	<div id="firmaDane">
		<div id="firmaNazwa">
			ALBUD PHU Wiesława i Andrzej Laskowscy
		</div>
		<div id="firmaAdres">
			ul. Kopernika 8<br />
			14-260 Lubawa<br />
			<a href="mailto:dawid.anko@wp.pl" target="_blank">dawid.anko@wp.pl</a><br />
			<a href="mailto:dawid.anko@wp.pl" target="_blank">albud@ablud.pl</a><br />
			<a href="http://www.impet.eu" target="_blank">www.ablud.pl</a><br />
			od: 8:00 do: 17:00
<div id="containerLoader">
	<div class="loader1 loader">
		<span class="flip">
			<span class="front">N</span>
			<span class="back">N</span>
		</span>
	</div>
	<div class="loader2 loader">
		<span class="flip">
			<span class="front">O</span>
			<span class="back">O</span>
		</span>
	</div>
	<div class="loader3 loader">
		<span class="flip">
			<span class="front">R</span>
			<span class="back">R</span>
		</span>
	</div>
	<div class="loader4 loader">
		<span class="flip">
			<span class="front">B</span>
			<span class="back">B</span>
		</span>
	</div>
	<div class="loader5 loader">
		<span class="flip">
			<span class="front">E</span>
			<span class="back">E</span>
		</span>
	</div>
	<div class="loader6 loader">
		<span class="flip">
			<span class="front">R</span>
			<span class="back">R</span>
		</span>
	</div>
	<div class="loader7 loader">
		<span class="flip">
			<span class="front">T</span>
			<span class="back">T</span>
		</span>
	</div>
</div>
		</div>
		<div id="firmaKontakt">

			<b>Janusz Kisicki</b><br />
			Adam drugi skelp<br />

		 	<span title="Dawid"><a href="callto:+48600294253">600294253</a></span><br />
		 	<span title="P. Janusz"><a href="callto:+48896453720">896453720</a></span><br />
		 	<span title="nr do drugiego sklepu"><a href="callto:+48896454535">896454535</a></span><br />

		</div>
	</div>
	<div id="firmaUwagi">
		<?php include "uwagi.php" ?>
	</div>

	<div id="firmaZdarzenia">
		<?php include "zdarzenia.php" ?>
	</div>
	<div id="firmaFaktury">

		<iframe style="background-color:white;width:260px; margin:0px; padding:0px;height:97%;" src="data.html"></iframe>
	</div>


</div>
<?php

?>
