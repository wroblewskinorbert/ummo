var impet = {};
var sterownik, google, MiastaKontroler, Miasta;
impet.draw = false;
impet.debug = true;
impet.initialization = true;

var panoramaOptions, map, panorama, geocoder, infoWindow, mapDiv, markerGeocoder, directionsDisplay, directionsService;
var nastepny, poprzedni, zapisz;
var trasy;
var firmaBiezaca = {};

var serwer = 'http://192.168.2.220/'; //'http://localhost'; // document.location.origin;
//var serwer = 'http://213.92.139.215'; //'http://localhost'; // document.location.origin;
var serwer = 'http://localhost'; // document.location.origin;
var dbo = {};

$.getScript(serwer + '/ajax/ajaxuniversal2.php?table=ImpetPracownicy&action=select&condition=id%3did&data=0', function(data) {
		var kto = $('<select id="wyborPracownika"></select>')
		impet.users = [];
		for (var x in dbo.tblImpetPracownicy) {
			impet.users[dbo.tblImpetPracownicy[x].id] = dbo.tblImpetPracownicy[x];
			impet.users[dbo.tblImpetPracownicy[x].inicjaly.toLowerCase()] = dbo.tblImpetPracownicy[x];
			if (dbo.tblImpetPracownicy[x].aktywny){
				kto.append($('<option id="' + dbo.tblImpetPracownicy[x].id + '" value="' + dbo.tblImpetPracownicy[x].id + '">' + dbo.tblImpetPracownicy[x].inicjaly + '</option>'));
			}
		}
		$('#panel')
			.append(kto);
		kto.change(function(e) {
			impet.ster.set('user', this.value);
		})
		console.log('Pracwonicny wczytani');
	});


function Settings() {
	Object.defineProperty(this, 'user', {
		configurable: true,
		get: function() {
			var lastUser = localStorage['impetSettingsLastUser'];
			lastUser = lastUser ? lastUser : 4;
			return +lastUser; //+ zeby zwrocil Number
		},
		set: function(val) {
			localStorage['impetSettingsLastUser'] = val;
		}
	});
	var userSettings = localStorage['impetSettings' + this.user];
	userSettings = userSettings ? $.parseJSON(userSettings) : {};
	$.extend(this, userSettings);
	var that = this;
	this.center = new google.maps.LatLng(that.center.lat, that.center.lng);
}
impet.defaultsSettings = {

	zoom: 7,
	zoomChanged: true,
	center: {
		lat: 52.27189,
		lng: 20.10803
	},
	czyWyswietlacWszystkich: false,
	trybGenerowaniaTabeli: 0,
	inputs: {
		ocena: 2,
		priorytet: 3,
		ogranicznikZoomu: 7,
		rysowac: false,
		okragle: true,
		wielkoscMarkerow: 4,
		wszyscy: false,
		wyborMiast: false

	}
};
Settings.prototype = impet.defaultsSettings;
//Settings.prototype= new google.maps.MVCObject;
Object.defineProperty(Settings.prototype, 'constructor', {
	value: Settings,
	configurable: true,
	writable: true
});

function Sterownik(sett) {
	google.maps.MVCObject.prototype.setOptions.call(this, sett);
}
Sterownik.prototype = new google.maps.MVCObject;
Object.defineProperty(Sterownik.prototype, 'constructor', {
	value: Sterownik,
	configurable: true,
	writable: true
});
Sterownik.prototype.changed = function(e, what) {
	//    console.dir(e);

	if (impet.initialization) {
		return;
	}
	var that = this;
	var userSettings = localStorage['impetSettings' + impet.mset.user];
	userSettings = userSettings ? $.parseJSON(userSettings) : {};
	userSettings[e] = this[e];
	switch (e) {
		case 'center':
			{
				userSettings[e] = {
					lat: this[e].lat(),
					lng: this[e].lng()
				};
				break;
			}
		case 'wielkoscMarkerow':
			{

			}
			break;
		case 'inputs':
			{
				console.log(e);

			}
			break;
		default:
			{
				console.log(e);
			}
			break;
	}
	localStorage['impetSettings' + impet.mset.user] = JSON.stringify(userSettings);
};
Sterownik.prototype.handleInputs = function(who, el) {
	var that = this;
	if (who) {
		that.inputs[who] = that.panel[who];
		switch (who) {
			case 'priorytet':
				{
					$('#spanPriorytet')
						.text(that.inputs.priorytet);
				}
				break;
			case 'ocena':
				{

					$('#spanOcena')
						.text(that.inputs.ocena);
				}
				break;
			case 'ogranicznikZoomu':
				{
					$('#spanZoom')
						.text(that.inputs.ogranicznikZoomu);

				}
				break;
			case 'wielkoscMarkerow':
				{
					$('#spanWielkosc')
						.text(that.inputs.wielkoscMarkerow);
				}
			case 'okragle':
			case 'rysowac':
			case 'wszyscy':
				{
					sterownik.id.forEach(function(el) {
						el.marker.set('icon', el.icon)
					})

				}
				break;

			default:
				{

				}
		}

		this.set('inputs', that.inputs);
		sterownik.MarkeryDraw(true);
		sterownik.MarkeryDraw();
		google.maps.event.trigger(impet.map, 'bounds_changed');

	}
	else {
		for (var xy in that.panel) {
			that.panel[xy] = that.inputs[xy];

		}
		$('#spanPriorytet')
			.text(that.inputs.priorytet);
		$('#spanOcena')
			.text(that.inputs.ocena);
		$('#spanZoom')
			.text(that.inputs.ogranicznikZoomu);
		$('#spanWielkosc')
			.text(that.inputs.wielkoscMarkerow);

		this.set('inputs', that.inputs);

	}

}

function dp(that, property, opt) {
	var prop = {};
	prop.configurable = typeof opt.configurable !== 'boolean' || opt.configurable;
	prop.enumerable = typeof opt.enumerable !== 'boolean' || opt.enumerable;
	prop.set = (typeof opt.set === 'function') ? opt.set : undefined;
	prop.get = opt.get;
	Object.defineProperty(that, property, prop);
}
function Drogi(route) {
	this.bounds = route.bounds;
	this.order = route.waypoint_order;
	this.path = route.overview_path;
	this.dystans = 0;
	this.czas = 0;
	this.encodePoly = route.overview_polyline;
	this.drogi = [];
	for (var x = 0; x < route.legs.length; x++) {
		var odcinek = route.legs[x];
		var droga = {
			dystans: odcinek.distance.value,
			czas: odcinek.duration.value,
			odAdresu: odcinek.start_address,
			doAdresu: odcinek.end_address,
			od: odcinek.start_location,
			'do': odcinek.end_location,
			path: [],
			encodePoly: ""
		};
		for (var y = 0; y < odcinek.steps.length; y++) {
			droga.path.push(odcinek.steps[y].start_location);
			droga.path = droga.path.concat(odcinek.steps[y].path);
			droga.path.push(odcinek.steps[y].end_location);
		}
		droga.encodePoly = google.maps.geometry.encoding.encodePath(droga.path);
		this.drogi.push(droga);
		this.dystans += droga.dystans;
		this.czas += droga.czas;

	}
}
function TrasaShow(punkty) {
	this.poly = undefined;
	this.punkty = punkty; //new google.maps.MVCArray(punkty);
	this.odcinki = [];
	//this.wyznaczOdcinkiAll();
	this.poly = new google.maps.Polyline({
		map: impet.map
	});
	this.wyznaczOdcinkiNew();
	this.path = [];

}
TrasaShow.prototype.wyznaczOdcinkiNew = function() {
	var paths = this.poly.latLngs;
	for (var x = 0; x < this.punkty.length - 1; x++) {
		if (!this.punkty[x].firma.odcinki[this.punkty[x + 1].firma.key]) {
			this.punkty[x].firma.odcinki[this.punkty[x + 1].firma.key] = new google.maps.MVCArray();
			this.punkty[x].firma.odcinki[this.punkty[x + 1].firma.key].push(this.punkty[x].firma.position)
			this.punkty[x].firma.odcinki[this.punkty[x + 1].firma.key].push(this.punkty[x + 1].firma.position)
			this.TwoPointsToWay(this.punkty[x], this.punkty[x + 1])
		}
		paths.setAt(x, (this.punkty[x].firma.odcinki[this.punkty[x + 1].firma.key]));

	}
}
TrasaShow.prototype.TwoPointsToWay = function(fromPoint, toPoint, reply) {
	if (fromPoint.firma.position.lat() == 0) {
		fromPoint.firma.mvc.set('position', new google.maps.LatLng(49, 19));
	};
	if (toPoint.firma.position.lat() == 0) {
		toPoint.firma.mvc.set('position', new google.maps.LatLng(49, 19));
	};
	var that = this;
	var fromKey = fromPoint.firma.key;
	var toKey = toPoint.firma.key;
	if (sessionStorage.getItem(fromKey + ';' + toKey)) {
		var odcinek = google.maps.geometry.encoding.decodePath(unescape(sessionStorage.getItem(fromKey + ';' + toKey)));
		fromPoint.firma.odcinki[toPoint.firma.key].clear();
		odcinek.forEach(function(ele) {
			fromPoint.firma.odcinki[toPoint.firma.key].push(ele)
		});
		that.poly.setVisible(false);
		that.poly.setVisible(true);
		return;
	}
	else {
		var con = " key1='" + fromKey + "' AND key2='" + toKey + "'";
		var that = this;
		var obj = {
			action: 'select',
			table: 'Odcinki',
			data: 0,
			condition: con
		};
		$.getJSON(serwer + '/ajax/ajaxuniversal4.php', obj, function(data) {
			var odcinki = data;
			if (odcinki.length > 0) {
				sessionStorage.setItem(fromKey + ';' + toKey, odcinki[0].data);
				var odcinek = google.maps.geometry.encoding.decodePath(unescape(odcinki[0].data));
				fromPoint.firma.odcinki[toPoint.firma.key].clear();
				odcinek.forEach(function(ele) {
					fromPoint.firma.odcinki[toPoint.firma.key].push(ele)
				});
				that.poly.setVisible(false);
				that.poly.setVisible(true);
				return;
			}
			var req = {
				origin: fromPoint.firma.position,
				destination: toPoint.firma.position,

				waypoints: [],
				optimizeWaypoints: false,
				travelMode: google.maps.TravelMode.DRIVING
			};
			//if (req.origin.position.lat){}
			directionsService.ile++;
			directionsService.route(req, function(response, status) {

				console.debug(status);
				res = response;
				if (status == google.maps.DirectionsStatus.OK) {
					directionsService.ile--;
					if (directionsService.ile < 0)
						directionsService.ile = 0;
					var odcinekDroga = new Drogi(response.routes[0]);
					var encodeOdcinek;
					var odcinek = odcinekDroga.drogi[0];
					fromPoint.firma.odcinki[toPoint.firma.key].clear();
					odcinek.path.forEach(function(ele) {
						fromPoint.firma.odcinki[toPoint.firma.key].push(ele)
					});
					encodeOdcinek = escape(google.maps.geometry.encoding.encodePath(odcinek.path));
					sessionStorage.setItem(fromKey + ';' + toKey, encodeOdcinek);
					var plain = {
						action: 'insert',
						table: 'odcinki',
						data: JSON.stringify({
							key1: fromPoint.firma.key,
							key2: toPoint.firma.key,
							data: encodeOdcinek
						}),
						condition: '1=1'
					};
					$.post(serwer + '/ajax/ajaxuniversal.php', plain);

				}
				else if (status == "OVER_QUERY_LIMIT") {
					setTimeout(function() {
						that.TwoPointsToWay(fromPoint, toPoint)
					}, directionsService.ile * 1000);
					return;
				}
			})



		});
	}
};


function miastaOpacity(event, ui) {
	MiastaKontroler.changeOptions({
		fillOpacity: ui.value
	});
}
var inKolor, chboxMiasta, Firmy, Markero, Trasy, TrasyClass;

function wczytajPanelDolny() {
	//   $.get('panelDolny.html', function (data) {
	//      $('#panelDolny').html(data);
	inKolor = $('#colorMiast');
	inKolor.val(MiastaKontroler.options.fillColor);
	inKolor.on('change', ustawionoKolor);
	inKolor.prop('disabled', true);
	$('#opacityMiast')
		.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: MiastaKontroler.options.fillOpacity,
			disabled: true
		});
	$('#opacityMiast')
		.on('slide', miastaOpacity);
	chboxMiasta = $('#czyMiasta');
	chboxMiasta.on('change', function(e) {
		if (this.checked) {
			MiastaKontroler.wyswietl(true);
			inKolor.prop('disabled', false);
			$('#opacityMiast')
				.slider('enable');

		}
		else {
			MiastaKontroler.wyswietl(false);
			inKolor.prop('disabled', true);
			$('#opacityMiast')
				.slider('disable');
		}
		//	MiastaKontroler



		google.maps.event.trigger(impet.map, 'bounds_changed');
	});

	//	chbockCzyNasi = $('#wszyscy')
	//		.on('change', function (e) {
	//			sterownik.czyWyswietlaWszystkich = this.checked;
	//			sterownik.MarkeryDraw(true);
	//			sterownik.MarkeryDraw();
	//			google.maps.event.trigger(impet.map, 'bounds_changed');
	//		});
	$('#uchwytPanelDolny')
		.draggable({
			axis: 'y',
			helper: 'clone',
			opacity: 0.35,
			cursor: 'w-resize'
		});
	$('#uchwytPanelDolny')
		.on("drag", function(event, ui) {
			$('#panelDolny')
				.css('max-height', document.body.clientHeight - event.clientY);
		});
	$('#dodajTrase')
		.click(function(e) {
			var nazwa = prompt("Podaj nazwe trasy");
			trasy.nowaTrasa(nazwa);
			e.preventDefault();
		});
	$('#dodajTraseDoListyIWyswietl')
		.click(function(e) {
			trasy.tblTrasy.unshift(trasy.trasa);
			trasy.panel.przelacz(true);
			e.preventDefault();
			e.stopImmediatePropagation();
			trasy.wyswietl();
		});
	impet.ster.handleInputs();
	sterownik.MarkeryDraw(true);
	sterownik.MarkeryDraw();
	google.maps.event.trigger(impet.map, 'bounds_changed');
	delete impet.initialization;

}

function ustawionoKolor(e) {
	MiastaKontroler.changeOptions({
		fillColor: this.value
	});
}

function wczytajMape() {
	debugger;
	$.getScript('js/mapa.js', function() {});
}

function Rekordy(zrodlo) {
	this.zrodlo = zrodlo;
	this.biezacyId = 0;
}
Rekordy.prototype.wczytaj = function(offset, ile) {};
Rekordy.prototype.nastepnyRekord = function() {};
Rekordy.prototype.poprzedniRekord = function() {};

function FirmaBiezaca(id, rekordy) {
	this.id = id;
	this.rekordy = rekordy;
	this.firma = Firmy[id];
	this.zaladujFormatke();
}
FirmaBiezaca.prototype.ustaw = function(id) {
	this.id = id;
	this.firma = Firmy[id];
	this.zaladujFormatke();
};
FirmaBiezaca.prototype.zaladujFormatke = function() {
	$('#inputFirma')
		.val(this.firma.nazwa);
	$('#inputMiejscowosc')
		.val(Miasta[this.id].nazwa);
};

function ustawInterfejsObslugi() {
	$('#przeladujObluge')
		.click(function(e) {
			$.get('obsluga.html', function(data) {
				//alert('dupa');
				$('#obsluga')
					.html(data);
				ustawInterfejsObslugi();
			});
		});
	$('#filtrOcena')
		.on('change', function(el) {
			impet.ster.handleInputs('ocena', el, this);
		});
	$('#wielkoscMarkerow')
		.on('change', function(el) {
			impet.ster.handleInputs('wielkoscMarkerow', el, this);
		});
	$('#miastaSchowac')
		.on('change', function(el) {
			MiastaKontroler.wyswietl(!this.checked);
			impet.ster.handleInputs('miastaSchowac', el, this);
		});
	$('#markerySchowac')
		.on('change', function(el) {
			if (!this.checked) {
				Markero.show();
			}
			else {
				Markero.hide();
			}
			//	impet.ster.handleInputs('markerySchowac', el, this);
		});
	$('#okragle')
		.on('change', function(el) {
			impet.ster.handleInputs('okragle', el, this);
		});
	$('#wszyscy')
		.on('change', function(el) {
			impet.ster.handleInputs('wszyscy', el, this);
		});
	$('#rysowac')
		.on('change', function(el) {
			impet.ster.handleInputs('rysowac', el, this);
		});

	$('#filtrPriorytet')
		.on('change', function(el) {
			impet.ster.handleInputs('priorytet', el, this);
		});
	$('#filtrZoom')
		.on('change', function(el) {
			impet.ster.handleInputs('ogranicznikZoomu', el, this);
		});
	$('#wyborMiast')
		.on('change', function(el) {

			MiastaKontroler.wyswietl(true);
			impet.ster.handleInputs('wyborMiast', el, this);
		});


	$('#panelLewyHandler')
		.draggable({
			axis: 'x',
			helper: 'clone',
			opacity: 0.35,
			cursor: 'w-resize'
		})
		//.each (function(ind,ele){
		//		this.marker=new Markero({
		//			map:map,
		//			position:map.getCenter()
		//
		//		}
		//	)}
		//	)
	$('#przeladuMape')
		.click(function() {
			wczytajMape();
		});

	$('#wczytajMiejscowosci')
		.click(function() {
			Trasy = new TrasyClass(trasy, impet.map);
		});

	$('#wczytajPanelDolny')
		.click(function() {
			wczytajPanelDolny();
		});

	nastepny = $('#nastepnaFirma');
	nastepny.click(function(e) {
		if (rekordy.length <= ++firmaBiezaca.id) {
			nastepny.attr('disabled', 'disabled');
		}
		else {
			if (firmaBiezaca.id === rekordy.length - 2)
				nastepny.removeAttr('disabled');
			firmaBiezaca.ustaw(firmaBiezaca.id);
		}
	});
	poprzedni = $('#poprzedniaFirma');
	poprzedni.click(function(e) {
		if (--firmaBiezaca.id === 0) {
			poprzedni.attr('disabled', 'disabled');
		}
		else {
			if (firmaBiezaca.id === 1)
				nastepny.removeAttr('disabled');
			firmaBiezaca.ustaw(firmaBiezaca.id);
		}
	});

	// koniec ******************************
	var pan = document.forms.obsluga.elements;
	impet.ster.panel = {};
	dp(impet.ster.panel, 'okragle', {
		set: function(x) {
			pan.okragle.checked = x;
			$(pan.okragle)
				.trigger('change');
		},
		get: function() {
			return pan.okragle.checked
		}
	});
	dp(impet.ster.panel, 'wszyscy', {
		set: function(x) {
			pan.wszyscy.checked = x;
			$(pan.wszyscy)
				.trigger('change');
		},
		get: function() {
			return pan.wszyscy.checked
		}
	});
	dp(impet.ster.panel, 'rysowac', {
		set: function(x) {
			pan.rysowac.checked = x;
			$(pan.rysowac)
				.trigger('change');
		},
		get: function() {
			return pan.rysowac.checked;
		}
	});
	dp(impet.ster.panel, 'priorytet', {
		set: function(x) {
			pan.ogranicznikPriorytetu.value = x;
			$(pan.ogranicznikPriorytetu)
				.trigger('change');
		},
		get: function() {
			return pan.ogranicznikPriorytetu.value;
		}
	});
	dp(impet.ster.panel, 'wielkoscMarkerow', {
		set: function(x) {
			pan.ogranicznikWielkosci.value = x;
			$(pan.ogranicznikWielkosci)
				.trigger('change');
		},
		get: function() {
			return pan.ogranicznikWielkosci.value;
		}
	});
	dp(impet.ster.panel, 'ogranicznikZoomu', {
		set: function(x) {
			pan.ogranicznikZoomu.value = x;
			$(pan.ogranicznikZoomu)
				.trigger('change');
		},
		get: function() {
			return pan.ogranicznikZoomu.value;
		}
	});
	dp(impet.ster.panel, 'ocena', {
		set: function(x) {
			pan.ogranicznik.value = x;
			$(pan.ogranicznik)
				.trigger('change');
		},
		get: function() {
			return pan.ogranicznik.value;
		}
	});
	//	impet.ster.panel=
}

function initialize() {
	impet.mset = new Settings;
	impet.ster = new Sterownik(impet.mset);
	window.st = impet.ster;
	google.maps.visualRefresh = true;
	mapDiv = document.getElementById('mapCanvas');
	impet.map = new google.maps.Map(mapDiv, {
		//center : new google.maps.LatLng(52.27188697176918, 20.108034841796883),
		//zoom : 7,
		disableDoubleClickZoom: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		minZoom: 6,
		maxZoom: 15
	});

	if (impet.debug) {
		map = impet.map;
	}
	impet.map.bindTo('center', impet.ster);
	impet.map.bindTo('zoom', impet.ster);
	infoWindow = new google.maps.InfoWindow();
	geocoder = new google.maps.Geocoder();
	$('#wyborPracownika')
	.val(impet.mset.user);

	// console.time('wczytujePracownikow');
	// var y=0;
	// for (var x = 0; x < 200000000; x++) {
	// 	y=y+x;
	// 	if (x % 10000 === 0){
	// 		console.log('.');
	// 	}
	// }
	// console.timeEnd('wczytujePracownikow');
	(function() {
		var newId = -1;
		var punktNewId = -1;

		function TrasyClass() {
			var that = this;
			this.trasyId = [];
			this.odKiedy = new Date('2014-03-01');
		}
		TrasyClass.prototype = new google.maps.MVCObject();
		TrasyClass.prototype.constructor = TrasyClass;
		TrasyClass.prototype.wczytaj = function() {
			var that = this;
			var con = ' kiedy >  CONVERT(DATETIME, \'' + this.odKiedy.toISOString()
				.slice(0, 10) + ' 00:00:00\', 102) ORDER BY kiedy DESC';
			var obj = {
				action: 'select',
				table: 'Trasy',
				data: 0,
				condition: con
			};
			return $.getJSON(serwer + '/ajax/ajaxuniversal4.php', obj, function(data) {})
		};
		TrasyClass.prototype.wyswietl = function() {
			panel.przelacz(true);
			var that = this;
			this.trasyId = [];
			var listaTras = "<ol id='selectable'>";
			for (var x = 0; x < this.tblTrasy.length; x++) {
				var trasa = this.tblTrasy[x];
				if (!trasa.ktoId) {
					trasa.ktoId = trasa.kto;
				}
				that.trasyId[trasa.id] = new Trasa(trasa);
				listaTras += "<li data-id='" + trasa.id + "'><span style=\'float:right;\'>" + impet.users[trasa.ktoId].inicialyKolor + "<br /><span title=\'" + trasa.kiedy.date.slice(0, 4) + "\'>" + trasa.kiedy.date.slice(5, 10) + "</span></span>" + trasa.opis + "</li>";
			}
			panelTrasy.html(listaTras);
			$("#selectable")
				.off('mouseleave mouseenter');
			$("#selectable")
				.on('mouseenter', 'li', function(e) {
					$(this)
						.addClass('aktywny');
					var trasaId = $(this)
						.data('id');
					if (trasy.trasyId[trasaId].drogaNaMapie) {
						var poly = trasy.trasyId[trasaId].drogaNaMapie.poly;
						poly.storeState();
						poly.color = 'red';
						poly.weight = 6;
					}

				});
			$("#selectable")
				.on('mouseleave', 'li', function(e) {
					$(this)
						.removeClass('aktywny');
					var trasaId = $(this)
						.data('id');
					if (trasy.trasyId[trasaId].drogaNaMapie) {
						var poly = trasy.trasyId[trasaId].drogaNaMapie.poly;
						poly.restoreState();
					}

				});
			$("#selectable")
				.selectable({
					filter: "li"
				});
			$("#selectable")
				.on("selectableselected", function(event, ui) {
					trasy.pokazTrase($(ui.selected)
						.data('id'), true);
					event.stopImmediatePropagation();
				});
			$("#selectable")
				.on("selectableunselected", function(event, ui) {
					that.pokazTrase($(ui.unselected)
						.data('id'), false);
				});
			$("#selectable")
				.on("selectablestart", function(event, ui) {
					if (!event.ctrlKey) {
						trasy.bounds = new google.maps.LatLngBounds();
					}
				})

			//       Trasy = new TrasyClass(Trasy, map);

			var tmpColor = $('#trasaOpis')
				.css('backgroundColor');
			$('#trasaOpis')
				.css({
					backgroundColor: '#8f6'
				})
				.animate({
					backgroundColor: tmpColor
				}, {
					duration: 1500
				});

		};
		TrasyClass.prototype.wczytajIWyswietl = function() {
			var that = this;
			this.wczytaj()
				.done(function(data) {
					that.tblTrasy = data;
					//that.tblTrasy = dbo.tblTrasy;
					that.wyswietl();
					panelTrasy.dataPrzedzial = $.now() - Date.parse((that.trasyId.find(function(el) {
							return el;
						}))
						.kiedy.date);
				});
		};
		TrasyClass.prototype.pokazTrase = function(trasaId, czyPokazac) {
			var thatTrasy = this;
			var trasa = this.trasyId[trasaId];
			if (!trasa.get('loaded')) {
				trasa.wczytajPunkty(function() {
					thatTrasy.pokazTrase(trasaId, czyPokazac);
				});
			}
			else {
				trasa.pokaz(czyPokazac);
			}
			if (czyPokazac) {
				trasy.bounds.union(trasa.drogaNaMapie.poly.getBounds());
				impet.map.fitBounds(trasy.bounds);
			}
		};

		TrasyClass.prototype.nowaTrasa = function(opis) {
			var trasaStart = {
				id: newId--,
				kiedy: new Date(),

				kto: sterownik.uzytkownik,
				ktoId: sterownik.uzytkownik.id,
				opis: opis,
				utworzono: new Date(),
				zakonczone: false
			};
			trasaStart.kiedy.date = trasaStart.kiedy.toJSON();
			this.trasa = new Trasa(trasaStart);
			this.trasa.aktualnaPozycja = 0;
			panel.przelacz(false);
			this.trasa.pokaz();
			this.trasa.edytuj();

		};

		function Trasa(trasa) {
			//			var that = this;
			this.markery = [];
			google.maps.MVCArray.call(this, []);
			this.setValues(trasa);
			this.pokaz();
		}

		Trasa.prototype = new google.maps.MVCArray();
		Trasa.prototype.constructor = Trasa;
		Trasa.prototype.wczytajPunkty = function(callback) {
			var that = this;
			var con = ' trasaId =' + this.get('id') + ' ORDER BY kolejnosc ASC';
			var obj = {
				action: 'select',
				table: 'TrasyPunktyShort',
				data: 0,
				condition: con
			};

			$.get(serwer + '/ajax/ajaxuniversal4.php', obj, function(data) {
				var punkty = data; //dbo.tblTrasyPunktyShort.slice(0);
				if (!that.get('loaded')) {
					for (var xxx = 0; xxx < punkty.length; xxx++) {
						var punkt = new Punkt(punkty[xxx]);
						that.push(punkt);
					}
				}
				that.set('loaded', true);
				if ((!!callback) && ($.isFunction(callback))) {
					callback.call(this, that);
				}
			});
		};
		Trasa.prototype.pokaz = function(czyPokazac) {
			if (czyPokazac == undefined)
				czyPokazac = true;
			var that = this;
			this.forEach(function(el, ind) {
				if (!el.marker) {
					var iconTemp = el.markerOptions.icon;
					delete el.markerOptions.icon;
					el.marker = new Markero(el.markerOptions); //google.maps.
					// 					el.marker.set('icon', iconTemp);
					el.marker.setIcon(Markero.icon(0.8, '#' + el.kto.kolor.slice(0, 3), ind + 1));
					el.marker.set('map', impet.map);
					el.marker.addListener('rightclick', impet.markerRightClicked)
					that.markery[ind] = el.marker;
					var postemp = el.firma.position;
					//if()
					el.marker.bindTo('position', el.firma.mvc);
					var opacityDiv = ($.now() - el.kiedy.getTime()) / panelTrasy.dataPrzedzial;
					if (opacityDiv > 1)
						opacityDiv = 1;
					if (opacityDiv < 0)
						opacityDiv = 0;
					var opacity = 1 - opacityDiv * 0.95;
					el.marker.setOpacity(opacity);

				}
				else {
					el.marker.setIcon(Markero.icon(0.8, '#' + el.kto.kolor.slice(0, 3), ind + 1));
					el.marker.notify('icon');
					el.marker.bindTo('position', el.firma.mvc);

				}
				el.marker.setVisible(czyPokazac);
			});

			if ((this.drogaNaMapie == null) || this.drogaNaMapie.poly.getPath() == undefined || (this.drogaNaMapie.poly.getPath()
				.getLength() == 0)) {
				this.drogaNaMapie = new TrasaShow(this.getArray());
			}
			else if ((this.drogaNaMapie.poly))
				this.drogaNaMapie.poly.setVisible(czyPokazac);
		};
		Trasa.prototype.dodaj = function(firma, kolej) {
			var element = {
				firma: firma,
				firmaId: firma.id,
				id: punktNewId--,
				kto: sterownik.uzytkownik,
				ktoId: sterownik.uzytkownik.id,
				kolejnosc: -1,
				kiedy: new Date(),
				trasaId: this.id,
				zakonczone: false
			};
			var punkt = new Punkt(element);
			var prev, next, min = Infinity,
				ind;
			if (this.getLength() > 1) {
				for (var count = 0; count < this.getLength() - 1; count++) {
					this.tprev = this.getAt(count);
					this.tnext = this.getAt(count + 1);
					var temp = google.maps.geometry.spherical.computeDistanceBetween(this.tprev.firma.position, punkt.firma.position)
					temp += google.maps.geometry.spherical.computeDistanceBetween(this.tnext.firma.position, punkt.firma.position);
					if (temp < min) {
						min = temp;
						next = this.tnext;
						prev = this.tprev;
						ind = count;
					}
				}
				this.insertAt(ind, punkt)
			}
			else {
				this.push(punkt);
			}
			this.drogaNaMapie.wyznaczOdcinkiNew(this.getArray());
			this.edytuj();

		};
		Trasa.prototype.listaHTML = function() {
			var that = this;
			var trasaOpis = this.get('opis');
			$('#trasaOpis')
				.html('<b>' + trasaOpis + '</b>');

			var result = "<ol id='selectable2'>";
			var liczba = this.getLength();
			this.forEach(function(element, index) {
				element.kolejnosc = index + 1;
				result += '<li data-trasaid="' + element.id + '" data-id="' + element.firma.id + '" class=\"ui-widget-content\">&nbsp;' + element.kolejnosc +
					'. <b  class="nazwaNaLiscie" title=\"' + element.kiedy.toJSON()
					.slice(0, 10) + '\">' + element.firma.nazwa +
					'</b>  <span style=\"float:right;display:inline-block;\"><i title=\"' + element.firma.ulica + '\">' + element.firma.miejscowosc.nazwa + '</span></i></li>';
			});
			result += '</ol>';
			return result;
		}
		Trasa.prototype.zakreslacz = new google.maps.Marker({
			map: map,
			icon: {
				fillOpacity: 0,
				path: 0,
				scale: 15,
				strokeWeight: 4,
				strokeColor: "red"
			}
		})
		window.zakreslacz = Trasa.prototype.zakreslacz;
		if (typeof inter !== 'undefined') {
			clearInterval(2)
		};
		//		inter = setInterval(function () {
		//			zakreslacz.icon.strokeColor = '#' + kolejnyKolor(64).toString(16);
		//			zakreslacz.notify('icon');
		//		}, 100)
		kolejnyKolor = (function() {
			var x = 0;
			return function(skok) {
				if (x > 255) {
					x = -255
				};
				var y = x;
				if (y < 0) {
					y = y * -1
				};
				var kolor = (((255 << 8) + y) << 8) + y;
				x += skok;
				return kolor
			}
		})();


		Trasa.prototype.edytuj = function() {
			var that = this;

			Trasa.prevIndex = 1
			panelTrasa.html(this.listaHTML());
			var sort = $('#selectable2')
				.sortable({
					start: function(event, ui) {
						console.log('start');
						that.prevIndex = $(ui.item)
							.index();
						that.moveItem = that.getAt(that.prevIndex);

					},
					change: function(event, ui) {
						//var index = that.removeAt(Trasa.prevIndex)
						console.log($(ui.item)
							.index());

						console.log($(ui.placeholder)
								.index())
							//that.insertAt(index);
						that.lastIndex = $(ui.placeholder)
							.index();
					},
					stop: function(event, ui) {
						if (that.lastIndex < that.prevIndex) {
							that.removeAt(that.prevIndex);
							that.insertAt(that.lastIndex, that.moveItem);
						}
						else if (that.lastIndex > that.prevIndex) {
							that.insertAt(that.lastIndex, that.moveItem);
							that.removeAt(that.prevIndex);
						}
						console.log('stop');
						console.log($(ui.item)
							.index());

						console.log($(ui.placeholder)
							.index())
						trasy.trasa.drogaNaMapie.poly.latLngs.clear();
						trasy.trasa.pokaz();
						trasy.trasa.edytuj();
					}
				})
				.disableSelection()
				.on('mouseenter', 'li', function(e) {
					var firmaId = $(this)
						.data('id');
					zakreslacz.setVisible(true);
					var firma = sterownik.id[firmaId];
					zakreslacz.bindTo('position', firma.mvc);

					var trasaId = $(this)
						.data('trasaid');
					trasy.trasa.forEach(function(el) {
						if (el.id == trasaId) {
							el.marker.setAnimation(1);
						}
					})
				})
				.on('mouseleave', 'li', function(e) {

					var trasaId = $(this)
						.data('trasaid');
					trasy.trasa.forEach(function(el) {
						if (el.id == trasaId) {
							el.marker.setAnimation(null);
						}
					})
				})
				.on('dblclick', 'li', function(e) {
					var firmaId = $(this)
						.data('id');
					var firma = sterownik.id[firmaId];
					map.panTo(firma.position);
					var zoom = map.getZoom();
					if (zoom < 12) {
						map.setZoom(zoom + 2);
					}
					impet.fb = firma;
				})
				.on('click', 'li', function(e) {
					var firmaId = $(this)
						.data('id');
					var firma = sterownik.id[firmaId];
					map.panTo(firma.position);
					var zoom = map.getZoom();

				});
		};

		function Punkt(element) {
			this.markerOptions = {
				map: null,
				position: null,
				anchorPoint: null,
				animation: null,
				clickable: null,
				cursor: null,
				draggable: null,
				icon: null,
				title: null,
				visible: false,
				zIndex: 20000
			};
			if (typeof element.kiedy === 'string') {
				element.kiedy = new Date(element.kiedy.replace(/(..)(..)(..)/, '20$1-$2-$3'));
			}

			this.setValues(element);
			this.markery = {};
			if (element.id > 0) { //  bo mniejsze od 1 b ozanaczaly nowe !!!
				this.firma = sterownik.id[this.firmaId];
				this.kto = impet.users[this.kto];
			}
			this.ustawMarker();
		}
		Punkt.prototype = new google.maps.MVCObject();
		Punkt.prototype.constructor = Punkt;

		Punkt.prototype.ustawMarker = function() {
			var kat = -55,
				size = 0.66,
				color = this.kto.kolor.slice(0, 3);
			this.markerOptions.icon = {};
			this.markerOptions.icon = Markero.icon(0.8, '#' + this.kto.kolor.slice(0, 3), this.kolejnosc);
		};
		impet.TrasyClass = TrasyClass;
		trasy = new TrasyClass();
		var panel = $('#panelLewy');
		var panelTrasy = $('#panelLewyTrasy');
		var panelTrasa = $('#panelLewyTrasa');
		panel.przelacz = function(czyTrasy) {
			var par = [
				[-panelTrasy.width(), 0.01],
				[0, 1]
			];

			if (((typeof czyTrasy === 'undefined') && (panelTrasy.offset()
				.left)) || czyTrasy) {
				var tmp = par.shift();
				par.push(tmp);
			}

			var wektor = par[0][0];
			panelTrasy.animate({
				left: wektor
			}, {
				duration: 1000
			});
			panelTrasy.fadeTo(700, par[0][1]);
			panelTrasa.fadeTo(700, par[1][1]);
		};
		panel.przyciagaj = true;
		panel.on('mouseup', function(e) {
			if (e.which == 2) {
				panel.przyciagaj = !panel.przyciagaj;
			}
		})

		panelTrasy.on('contextmenu', 'li', function(e) {
			$('#trasaOpis')
				.removeClass('ui-effects-transfer');
			var poprzedni = $(panelTrasy.data('poprzedniWybor'));
			if (poprzedni) {
				poprzedni.removeClass('ui-effects-transfer');
			}
			panelTrasy.data('poprzedniWybor', $(this));
			trasy.trasa = trasy.trasyId[$(this)
				.data('id')];
			panelTrasa.empty();
			var tmpLi = this;
			trasy.trasa.wczytajPunkty(function() {
				$(tmpLi)
					.addClass('ui-effects-transfer')
					.effect("transfer", {
						to: $('#trasaOpis')
							.eq(0)
					}, 1500, function() {
						$('#trasaOpis')
							.addClass('ui-effects-transfer');
						setTimeout(function() {
							$('#trasaOpis')
								.removeClass('ui-effects-transfer', 1000, 'easeInQuint');
						}, 1000);
					});
				panel.przelacz(false);
				trasy.trasa.edytuj();
			});

			e.stopImmediatePropagation();
			e.preventDefault();

		});
		panelTrasa.on('contextmenu', function(e) {
			panel.przelacz(true);

			e.stopImmediatePropagation();
			e.preventDefault();

		});
		trasy.panel = panel;
	})();


	$('#address')
		.keypress(function(e) {
			if (e.which === 13) {
				e.preventDefault();
				codeAddress();
			}
		});

	markerGeocoder = new Markero({ //google.maps.
		map: impet.map,
		visible: false,
		position: impet.map.getCenter(),
		draggable: true
	});
	markerGeocoder.infoWin = new google.maps.InfoWindow();
	google.maps.event.addListener(markerGeocoder.infoWin, 'closeclick', function(e) {
		markerGeocoder.setVisible(false);
	});
	impet.map.addListener('dblclick', function(e) {
		markerGeocoder.setPosition(e.latLng);
		markerGeocoder.setVisible(true);
		google.maps.event.trigger(markerGeocoder, 'dragend', e);
		e.stop();
	});
	google.maps.event.addListener(markerGeocoder, 'dragend', function(e) {
		geocoder.geocode({
			'latLng': e.latLng,
			region: 'pl'
		}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					markerGeocoder.infoWin.setContent('<div><h3>' + results[0].formatted_address + '</h3></div>');
					markerGeocoder.infoWin.open(impet.map, markerGeocoder);
					$('#address')
						.val(e.latLng.lat()
							.toFixed(6) + ', ' + e.latLng.lng()
							.toFixed(6));

				}
			}
		});

	});
	impet.map.addListener('zoom_changed', function() {
		$('#zoomText')
			.text(impet.map.getZoom());
	});
	$(function() { //Iniciacja !!!!!
		$.when(
				$.getScript(serwer + '/ajax/miasta.php', function(data) {
					MiastaKontroler = {
						miasta: Miasta
					};
					MiastaKontroler.miastaId = [];
					MiastaKontroler.miasta.forEach(function(ele, ind, tab) {
						MiastaKontroler.miastaId[ele.id] = ele;
					});
					MiastaKontroler.wyswietl = function(czyWidoczne) {
						MiastaKontroler.options.map = impet.map;
						czyWidoczne = (czyWidoczne === false) ? false : true;
						if (MiastaKontroler.miasta[0].cityCircle) {
							MiastaKontroler.miasta.forEach(function(ele, ind, tab) {
								ele.cityCircle.setVisible(czyWidoczne);
							});
							return;
						}
						var opt = Object.create(MiastaKontroler.options);
						var length = MiastaKontroler.miasta.length;
						for (var x = 0; x < length; x++) {
							var miasto = MiastaKontroler.miasta[x];
							opt.radius = Math.pow(miasto.ludnoscSuma, 0.5) * 10;
							opt.center = new google.maps.LatLng(miasto.wspN, miasto.wspE);
							miasto.cityCircle = new google.maps.Circle(opt);
							miasto.cityCircle.opt = opt;
						}
					};
					MiastaKontroler.options = {
						strokeColor: '#000',
						strokeOpacity: 0.45,
						fillColor: '#ff0000',
						fillOpacity: 0.26,
						visible: true,
						clickable: true
					};

					MiastaKontroler.changeOptions = function(optio) {
						if (!optio) {
							optio = MiastaKontroler.options;
						}
						var length = MiastaKontroler.miasta.length;
						for (var x = 0; x < length; x++) {
							MiastaKontroler.miasta[x].cityCircle.setOptions(optio);
						}
					};
				}),
				$.post(serwer + '/ajax/ajaxuniversal4.php', {
					table: 'Firmy',
					condition: 'id=id',
					action: 'select',
					data: 0
				})
				.done(function(data) {
					dbo.tblFirmy = data;
				}),
				$.post(serwer + '/ajax/ajaxuniversal4.php', {
					table: 'FirmyV',
					condition: 'khId=khId',
					action: 'select',
					data: 0
				}, function(data) {
					dbo.tblFirmyV = data;
				})
			)
			.done(function(data) {
				FirmyImpet = dbo.tblFirmy;
				FirmyKh = [];
				myFirmyId = [];
				var Data = dbo.tblFirmyV;
				for (var x in Data) {
					FirmyKh[Data[x].khId] = Data[x];
				}
				for (x = 0, len = FirmyImpet.length; x < len; x++) {
					myFirmyId[FirmyImpet[x].id] = FirmyImpet[x];
					if (FirmyKh[FirmyImpet[x].khId]) {
						FirmyImpet[x].kh = FirmyKh[FirmyImpet[x].khId];
					}
					if (FirmyImpet[x].wspN === null)
						FirmyImpet[x].wspN = '49.000000';
					if (FirmyImpet[x].wspE === null)
						FirmyImpet[x].wspE = '19.000000';
					if (FirmyImpet[x].ocena === null)
						FirmyImpet[x].ocena = -1;
					if (FirmyImpet[x].priorytet === null)
						FirmyImpet[x].priorytet = -1;
					FirmyImpet[x].miejscowosc = MiastaKontroler.miastaId[FirmyImpet[x].miejscowoscId];
				}
				Firmy = FirmyImpet;
				sterownik = firmySterownikSetup(impet.map, FirmyImpet);
				// domyslnym uzytkownikiem jestem
				sterownik.uzytkownik = impet.users[4];
				wczytajPanelDolny();
			});
		directionsService = new google.maps.DirectionsService();
		directionsService.ile = 0;
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(impet.map);
		$('#button-panel-gorny')
			.click(function(e) {
				$(this)
					.parent()
					.prev()
					.slideToggle();
			})
			.click();
		$('#button-panel-gorny2')
			.click(function(e) {
				$(this)
					.parent()
					.prev()
					.slideToggle();
			})
			.click();
		$.get('obsluga.html', function(data) {
			$('#obsluga')
				.html(data);
			ustawInterfejsObslugi();

		});
		$('#panelLewyHandler')
			.on("drag", function(event, ui) {
				$('#panelLewy')
					.css('width', ui.position.left);
			});
		$('div#panelLewy')
			.on('contextmenu', function(e) {
				var panel = $('#panelLewyTrasy');
				var liFirma = $('#panelLewyTrasa')
					.has(e.target);
				if (liFirma.length) {
					$('#nora')
						.remove();
					var m = new MenuCreator('nora');
					m.dodaj('Przyblizenie', 'Przybli danÄ na mapie', 'zoomin');
					m.dodaj('Droga od', "Ustaw jako pocztek wyznaczania drogi (maksywmalnie 8 mozem!)", 'home');
					m.dodaj('Droga do', "Ustaw jako koniec wyznaczania drogi (maksywmalnie 8 punktm!)", 'flag', true);
					m.dodaj('Usun,  dany punkt z trasy', 'trash');
					me = $(m.html());
					$('body')
						.append(me);
					me.menu();
					me.offset({
						top: e.clientY,
						left: e.clientX
					});
					me.show();
					e.preventDefault();
					e.stopImmediatePropagation();
					impet.addEventListener('mousedown', function(e) {
						if (me.has(e.srcElement)
							.size() === 0)
							me.remove();
					}, true);
					return;
				}
				e.stopImmediatePropagation();
				e.preventDefault();
			});
		trasy.wczytajIWyswietl();
		impet.ster.handleInputs();
		google.maps.event.trigger(impet.map, 'bounds_changed');

	});
	impet.zacznijZaznaczanie = function() {
		$('#panelLewyTrasa li')
			.removeClass('start stop');
		$('#panelLewyTrasa')
			.on('click', 'li', function(e) {
				$(this)
					.addClass('start');
				e.stopImmediatePropagation();
				$('#panelLewyTrasa')
					.off(e);
				$('#panelLewyTrasa')
					.on('click', 'li', function(e) {
						$(this)
							.addClass('stop');
						e.stopImmediatePropagation();
						$('#panelLewyTrasa')
							.off(e);
						przeliczTrase();
					});
			});
	};

	function przeliczTrase() {
		var start = $('#selectable2')
			.find('.start');
		var stop = $('#selectable2')
			.find('.stop');
		var tmp = start;
		if (start.index() > stop.index()) {
			start = stop;
			stop = tmp;
		}
		var $waypoints = start.nextUntil(stop);
		var waypoints = [];
		waypoints = $waypoints.map(function(ind, val) {
			return $(this)
				.data('id');
		});

		start = start.data('id');
		stop = stop.data('id');

		var waypts = [];
		waypts = waypoints.map(function(ind, el) {
			var result = {};
			result.location = sterownik.id[el].position;
			result.stopover = true;
			return result;
		});

		var req = {
			origin: sterownik.id[start].position,
			destination: sterownik.id[stop].position,
			waypoints: waypts,
			optimizeWaypoints: true,
			travelMode: google.maps.TravelMode.DRIVING
		};
		directionsService.route(req, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
			}
		});

	}

	function Firma(rekord, parent, map) {
		var that = this;
		this.markerOpis = null;
		this.markerEtykieta = null;
		this.markerTrasa = null;
		this.odcinki = {};
		this.rekord = rekord;
		this.rekord.wspN = this.rekord.wspN || 19;
		this.rekord.wspE = this.rekord.wspE || 49;
		this.mvc = new google.maps.MVCObject();
		this.rekord.visible = false;
		for (var x in this.rekord) {
			(function(x, that) {
				that.mvc.set(x, that.rekord[x]);
				var prop = {};
				if ((x !== 'id') && (x.indexOf('wsp'))) {
					prop.set = function(val) {
						that.mvc.set(x, val);
					};
				}
				prop.get = function() {
					return that.mvc.get(x);
				};
				dp(that, x, prop);
			})(x, this);
		}

		this.mvc.set('position', new google.maps.LatLng(this.rekord.wspN, this.rekord.wspE));
		dp(this, 'position', {
			set: function(val) {
				var x = val;
			},
			get: function() {
				return this.mvc.get('position');
			}
		});
		dp(this, 'key', {
			set: function(val) {
				var x = val;
			},
			get: function() {
				var res = this.mvc.get('position');
				return (res.lat()
					.toFixed(6) + ',' + res.lng()
					.toFixed(6));
			}
		});
		var opt = {
			map: impet.map,
			clickable: true,
			title: this.nazwa,
			visible: false
		};
		this.mvc.set('strokeColor', this.strokeColor);
		this.marker = new Markero(opt);
		this.marker.parent = that;
		this.marker.set('icon', this.icon);
		this.marker.parent = this;
		this.marker.set('position', this.mvc.position);
		this.markerNazwa = new Markero(opt); //google.maps.
		this.markerNazwa.set('position', this.mvc.position);
		this.marker.addListener('click', pokazInfoFirmy);



		// 	this.marker.bindTo('position', this.mvc);
		if (this.id < 5185) {
			this.marker.bindTo('visible', this.mvc);
		}
		this.marker.addListener('rightclick', function(e) {
			if (!trasy.trasa)
				return;
			trasy.trasa.dodaj(this.parent);
		});
		if (this.id < 1) {
			this.circle = new google.maps.Circle({
				map: impet.map,
				radius: ((this.ocena + 5) * 16),
				strokeColor: this.strokeColor,
				strokeWeight: this.priorytet / 2 + 4,
				fillColor: this.fillColor,
				fillOpacity: 1,
				strokePosition: google.maps.StrokePosition.OUTSIDE
			})

			this.circle.bindTo('center', this.mvc, 'position');
			this.circle.bindTo('visible', this.mvc);


		}
	}

	function pokazInfoFirmy(e) {
		var content;
		var marker = this;
		var firma = marker.parent;

		$.get('./firma.html')
			.done(
				function(data) {
					console.log(data);
					content = data;
					if (firma.email == null) firma.email = "";
					if (firma.www == null) firma.www = "";
					if (firma.od == null) firma.od = "";
					if (firma.do == null) firma.do = "";

					content = content.replace("{{nazwa}}", firma.nazwa);
					content = content.replace("{{ulica}}", firma.ulica);
					content = content.replace("{{miejscowosc}}", firma.kod + "  " + firma.miejscowosc.nazwa);
					content = content.replace("{{email}}", firma.email);
					content = content.replace("{{email}}", firma.email);
					content = content.replace("{{www}}", firma.www);
					content = content.replace("{{ocena}}", firma.ocena);
					content = content.replace("{{priorytet}}", firma.priorytet);
					content = content.replace("{{od}}", firma.od);
					content = content.replace("{{do}}", firma['do']);
					var ostatnia = "",
						obrot = "",
						spoznienie = "";
					if (firma.kh) {
						if (firma.kh.ostatnia) ostatnia = firma.kh.ostatnia.date.slice(0, 10);
						if (firma.kh.obrot) obrot = firma.kh.obrot.slice(0, -5) + " zl";
						if (firma.kh.spoznienie) spoznienie = firma.kh.spoznienie;
					}

					content = content.replace("{{ostatnia}}", ostatnia);
					content = content.replace("{{obrot}}", obrot);
					content = content.replace("{{spoznienie}}", spoznienie);
					//content = content.replace("{{ulica}}", firma.ulica);
					infoWin.setContent(content);
					infoWin.close();
					infoWin.open(impet.map, marker);
					infoWin.close();
					infoWin.open(impet.map, marker);

					//debugger;
					if (firma.uwagi.length > 0) {

						ib.open(impet.map, marker);
						ib.content_.innerHTML = firma.uwagi;

					}
				})
	}

	dp(Firma.prototype, 'icon', {
		get: function() {
			var size = 0.4,
				color = 'aaaa';
			if (this.ocena > -1) {
				size = Number((this.ocena + 4) / 10)
					.toFixed(2);
				switch (this.priorytet) {
					case 0:
						color = '4444';
						break;
					case 1:
						color = 'ff22';
						break;
					case 2:
						color = 'dd55';
						break;
					case 3:
						color = 'aa88';
						break;
					case 4:
						color = '88aa';
						break;
					case 5:
						color = '55dd';
						break;
					case 6:
						color = '22ff';
						break;
				}
				color += '44';
			}
			else {

				color = 'ffffff';
			}
			var cond = document.getElementById('okragle');
			var scala = (impet.ster.inputs['wielkoscMarkerow'] * 1.0 + 1) / 5;
			if (cond.checked)
				return Markero.iconCircle(12 * size, '#' + color, scala);
			return Markero.icon(size * scala, '#' + color, this.priorytet);
			// 		return 'https://chart.googleapis.com/chart?chst=d_map_spin&chld=' + size + '|0|' + color + '|13|b|' + this.priorytet+"";
		}
	});
	dp(Firma.prototype, 'strokeColor', {
		get: function() {
			var color;
			if (this.priorytet > -1) {
				switch (this.priorytet) {
					case 0:
						color = 'fff';
						break;
					case 1:
						color = 'fdd';
						break;
					case 2:
						color = 'fbb';
						break;
					case 3:
						color = 'f88';
						break;
					case 4:
						color = 'f66';
						break;
					case 5:
						color = 'f33';
						break;
					case 6:
						color = 'f00';
						break;
				}
				color = '#' + color;
			}
			else {
				color = '#888';
			}
			return color;
		}
	});
	dp(Firma.prototype, 'fillColor', {
		get: function() {
			var color;
			if (this.ocena > -1) {
				switch (this.ocena) {
					case 0:
						color = '000';
						break;
					case 1:
						color = '030';
						break;
					case 2:
						color = '060';
						break;
					case 3:
						color = '080';
						break;
					case 4:
						color = '0b0';
						break;
					case 5:
						color = '0d0';
						break;
					case 6:
						color = '0f0';
						break;
				}
				color = '#' + color;
			}
			else {
				color = '#ffffff';
			}
			return color;
		}
	});
	/*Firma.prototype.markerDraw = function () {
		var that = this;
		if (impet.map.zzoom < 11) {
			if (this.marker.visible) {
				this.marker.setVisible(false);
			}
			if (impet.map.zzoom < 9) {
				if (this.circle.vis) {
					this.circle.set('fillOpacity', 0);
					this.circle.set('strokeOpacity', 0);
					this.circle.vis = false;
					//parent.markeryNiewyswietlane.push(this);
					this.eventHandler = function () {
						if (impet.map.zzoom >= 9) {
							that.eventHandler = that.markerDraw.bind(that);
							that.markerDraw();
							console.log('ah')
						}
					};
				}
			} else if (!this.circle.vis) {
				this.circle.set('fillOpacity', 1);
				this.circle.set('strokeOpacity', 1);
				this.circle.vis = true;
			}


		} else if (this.inView && !this.marker.visible) {
			if (impet.map.zzoom >= 11) {
				this.marker.setVisible(true);
			}
			this.circle.set('fillOpacity', 1);
			this.circle.set('strokeOpacity', 1);
			this.visible = true;
			this.marker.bindTo('position', this.mvc)


			if (impet.map.zzoom > 13) {} else {
				if (impet.map.zzoom > 15) {} else {}
			}
		}
	};*/
	dp(Firma.prototype, 'inView', {
		get: function() {
			return impet.map.getBounds()
				.contains(this.position);
		}
	})

	function firmySterownikSetup(map, rekordy) {
		var sterownik = {
			zoom: map.getZoom(),
			zoomChanged: true,
			filtr: {
				ocena: -1,
				priorytet: -1,
				zoom: 8
			},


			czyOkragle: true,
			rysowac: true,
			id: [],
			rekordy: rekordy,
			map: map,
			trybGenerowaniaTabeli: 0,
			markeryOdrzucone: [],
			markeryWyswietlane: [],
			markeryNiewyswietlane: [],
			markeryDoWyswietlenia: [],
			czyWyswietlaWszystkich: false
		};
		var len = rekordy.length;
		for (var x = 0; x < len; x++) {
			sterownik.id[rekordy[x].id] = new Firma(rekordy[x], sterownik, impet.map);
		}


		sterownik.id.forEach(function(el, ind) {
			projekcjaNaSiatke(el);
		});



		$('input:radio[name=generowanieTabeli]')
			.off()
			.on('change', function(e) {
				sterownik.trybGenerowaniaTabeli = parseInt($(this)
					.val(), 10);
			});



		sterownik.MarkeryDraw = function(odswiezyc) {
			if (impet.initialization) return;
			odswiezyc = odswiezyc || false; //domyslnie nie odswiezamy
			if (this.trybGenerowaniaTabeli !== 0) {
				this.tabela = $("<table border=1 id='tabelaFirmy'><thead><tr><th style='width:15%;'>Nazwa</th><th  data-sortinitialorder='desc' style='width:37px;'>Pri</th><th  data-sortinitialorder='desc'  style='width:37px;'>Oce</th><th style='width:13%;'>Ulica</th><th style='width:10%;'>Miasto</th><th>Uwagi</th><th   data-sortinitialorder='desc' class='sorter-intBezKropek' style='width:52px;'>Obt</th><th style='width:32px;'>Sp</th><th style='width:37px;'>Odl</th></tr></thead><tbody><tr><td>t</td></tr></tbody>");
				if (this.trybGenerowaniaTabeli == 2) {
					$('#table-container')
						.empty()
						.append(this.tabela);
				}
				this.tbody = $(this.tabela)
					.find('tbody')
					.empty();
			}
			else {
				if (this.tabela)
					this.tabela.hide();
			}
			if (this.zoom !== impet.map.getZoom())
				this.zoomChanged = true;
			this.markeryOdrzucone = this.markeryWyswietlane.slice(0);
			//        if (this.zoomChanged && ((this.zoom<13) &&( this.zoom< impet.map.getZoom()))||((impet.map.getZoom()>13) &&( this.zoom < impet.map.getZoom()))){
			if (false && impet.map.getZoom() >= 13) {
				var pokazac, pokazacIni = ((impet.map.getZoom() >= 13));
				var firmyWZakresie = zwrocWZakresie(map.getBounds);
				var len = firmyWZakresie.length; // sterownik.rekordy.length;
				for (var x = 0; x < len; x++) {
					el = firmyWZakresie[x];

					pokazac = pokazacIni;
					//var el = sterownik.id[sterownik.rekordy[x].id];
					if (impet.map.getBounds()
						.contains(el.position)) {
						if (pokazac) {
							if (impet.map.getZoom() == 13) {
								el.markerNazwa.setIcon(Markero.iconName(0.7, 'black', el.nazwa));
							}
							else if (impet.map.getZoom() == 14) {
								el.markerNazwa.setIcon(Markero.iconName(1, 'black', el.nazwa));
							}
							else if (impet.map.getZoom() == 12) {
								el.markerNazwa.setIcon(Markero.iconName(0.5, 'black', el.nazwa));
							}
							else if (impet.map.getZoom() > 14) {
								el.markerNazwa.setIcon(Markero.iconName(1.3, 'black', el.nazwa));
							}
						}
						if (el.markerNazwa.getVisible() != pokazac) {
							el.markerNazwa.setVisible(pokazac && el.visible);
						}
						else if (el.visible != el.markerNazwa.getVisible()) {
							el.markerNazwa.setVisible(pokazac && el.visible);
						}


					}
					else {
						el.markerNazwa.setVisible(false);
					}
				}
			}

			this.markeryDoWyswietlenia = [];
			var bounds = impet.map.getBounds();
			if (odswiezyc || (this.zoomChanged) && (this.zoom >= impet.ster.inputs.ogranicznikZoomu) && (impet.map.getZoom() < impet.ster.inputs.ogranicznikZoomu)) {
				for (var x = 0, len = sterownik.rekordy.length; x < len; x++) {
					var el = sterownik.id[sterownik.rekordy[x].id];
					//                     if (bounds.contains(el.position)) {
					if (el.mvc.visible) {

						el.visible = false;
					}

					//                     }
				}
			}
			else {
				sterownik.markeryWyswietlane = [];
				if (impet.map.getZoom() >= impet.ster.inputs.ogranicznikZoomu) {
					for (var x = 0, len = sterownik.rekordy.length; x < len; x++) {
						var el = sterownik.id[sterownik.rekordy[x].id];
						if (bounds.contains(el.position)) {
							if (!el.mvc.visible && (el.ocena >= impet.ster.inputs.ocena) && (el.priorytet >= impet.ster.inputs.priorytet) && (impet.ster.inputs.wszyscy || el.khId)) {
								//visible !!!
								el.visible = true;
							}
							sterownik.markeryWyswietlane.push(el);
							if (sterownik.zoomChanged) {}
						}
						else if (el.mvc.visible) {
							if (sterownik.zoomChanged) {}
							//	el.visible = false;
						}
					}
				}

			}
			sterownik.zoom = impet.map.getZoom();
			sterownik.zoomChanged = false;


		};
		impet.map.addListener('bounds_changed', function(e) {
			sterownik.zoomChanged = true;
			var x = document.getElementById("rysowac");
			if (x.checked) {
				sterownik.MarkeryDraw();
				markeryNazwa.draw();
			}
		});
		impet.map.addListener('zoom_changed', function(e) {
			sterownik.zoomChanged = true;
			impet.map.zzoom = impet.map.getZoom()
			return;
			var x = document.getElementById("rysowac");
			if (!x.checked)
				return;
			impet.map.zzoom = impet.map.getZoom()
			if (impet.map.zzoom > 9) {
				sterownik.markeryWyswietlane.forEach(function(el) {
					if (el['circle'])
						el.circle.setRadius((el.ocena + 5) * (22 - impet.map.zzoom) * 1)
				})
			}
		});
		return sterownik;
	}

	function zapiszStan() {}

	function wczytajZapiszStanLocal(id, co, zapisz) {
		zapisz = zapisz || false;
		if (zapisz) {
			localStorage['imp_' + id] = JSON.stringify(co);
		}
		else {
			return $.parseJSON(localStorage['imp_' + id]);
		}
	}
	var markeryNazwaZoom = 12;

	markeryNazwa = {
		wyswietlone: [],
		odrzucone: [],
		draw: function() {
			var that = this;
			var zoom = map.getZoom();
			if (zoom < markeryNazwaZoom) {
				that.wyswietlone.forEach(function(ele, ind) {
					ele.markerNazwa.set('visible', false);
				});
				that.wyswietlone.length = 0;
				return;

			}

			this.firmyWZakresie = zwrocWZakresie();
			this.odrzucone.length = 0;
			var tempId = that.firmyWZakresie.map(function(el) {
				return el.id
			});
			this.wyswietlone.forEach(function(ele, ind) {
				if (tempId.indexOf(ele.id) == -1) {
					ele.markerNazwa.set('visible', false);
					that.odrzucone.push(ele);

				}
				else {


				}

			})
			that.wyswietlone = [];
			this.firmyWZakresie.forEach(function(ele) {
				if (that.odrzucone.indexOf(ele.id) == -1) {
					ele.markerNazwa.set('visible', true);
					that.wyswietlone.push(ele);
				}
			})
			that.wyswietlone.forEach(function(el) {
				if (impet.map.getZoom() == 13) {
					el.markerNazwa.setIcon(Markero.iconName(0.65, 'black', el.nazwa));
				}
				else if (impet.map.getZoom() == 14) {
					el.markerNazwa.setIcon(Markero.iconName(0.9, 'black', el.nazwa));
				}
				else if (impet.map.getZoom() == 12) {
					el.markerNazwa.setIcon(Markero.iconName(0.5, 'black', el.nazwa));
				}
				else if (impet.map.getZoom() > 14) {
					el.markerNazwa.setIcon(Markero.iconName(1.0, 'black', el.nazwa));
				}

			})
		}

	}
}

function translatePosition(position) {
	var latInd = parseInt((position.lat() - 49) / 0.06);
	var lngInd = parseInt((position.lng() - 14) / 0.1);
	if (latInd < 0)
		latInd = 0;
	if (latInd > 99)
		latInd = 99;
	if (lngInd < 0)
		lngInd = 0;
	if (lngInd > 99)
		lngInd = 99;
	return {
		latInd: latInd,
		lngInd: lngInd
	}
}

var siatka = [100];
for (var x = 0; x < 100; x++) {
	siatka[x] = new Array(100);
	for (var y = 0; y < 100; y++) {
		siatka[x][y] = [];
	}
}

function projekcjaNaSiatke(obj) {
	var indeksy = translatePosition(obj.position);
	siatka[indeksy.latInd][indeksy.lngInd].push(obj);
}

zwrocWZakresie = function(bounds) {
	var bounds = bounds || map.getBounds();
	var latMin, latMax, lngMin, lngMax, sw, ne;
	sw = translatePosition(bounds.getSouthWest());
	ne = translatePosition(bounds.getNorthEast());
	latMin = Math.min(ne.latInd, sw.latInd);
	lngMin = Math.min(ne.lngInd, sw.lngInd);
	latMax = Math.max(ne.latInd, sw.latInd);
	lngMax = Math.max(ne.lngInd, sw.lngInd);
	var res = [];
	for (var latx = latMin; latx <= latMax; latx++) {
		for (var laty = lngMin; laty <= lngMax; laty++) {
			var komorka = siatka[latx][laty];
			if (komorka.length) {
				komorka.forEach(function(el) {
					res.push(el);
				})
			};
		}
	}
	return res;
}

function codeAddress() {
	var address = document.getElementById('address')
		.value;
	geocoder.geocode({
		'address': address
	}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			var loc = results[0].geometry.location;
			impet.map.setCenter(loc);
			markerGeocoder.setPosition(loc);
			markerGeocoder.setVisible(true);
			$('#address')
				.val(loc.lat()
					.toFixed(6) + ', ' + loc.lng()
					.toFixed(6));
			if (results[0]) {
				markerGeocoder.infoWin.setContent('<div><h4>' + results[0].formatted_address + '</h4></div>');
				markerGeocoder.infoWin.open(impet.map, markerGeocoder);
			}
		}
		else {
			alert('Odszukanie nie powiodłow!' + status);
		}
	});
}
google.maps.Polyline.prototype.getBounds = function() {
	var latlngBounds = new google.maps.LatLngBounds();
	for (var x = 0; x < this.latLngs.j.length; x++) {
		var path = this.latLngs.j[x];

		for (var i = 0; i < path.getLength(); i++) {
			latlngBounds.extend(path.getAt(i));
		}
	}
	return latlngBounds;
}

google.impet = {};
google.impet.Trasy = function(opt) {
	if (typeof(opt) === 'undefined') {
		opt = {};
	}
	opt['od'] = opt['od'] || {
		rok: 2013,
		miesiac: 1
	};
	opt['do'] = opt['do'] || {
			rok: (new Date)
				.getYear() + 1900,
			miesiac: (new Date)
				.getMonth()
		}
		//   console.dir(opt);
	var tmp = opt['od'];
	tmp['date'] = new Date(Date.UTC(tmp.rok, tmp.miesiac));
	var tmp = opt['do'];
	tmp['date'] = new Date(Date.UTC(tmp.rok, tmp.miesiac + 1));
	this.od = opt.od;
	this.do = opt.do;



}

google.impet.Trasy.prototype.wczytaj = function() {
	var that = this;
	var con = 'kiedy between CONVERT(DATETIME, \'' + this.od.date.toISOString()
		.slice(0, 10) + ' 00:00:00\', 102) AND  CONVERT(DATETIME, \'' + this.do.
	date.toISOString()
		.slice(0, 10) + ' 00:00:00\', 102) ORDER BY kiedy DESC';
	//console.log(con);
	var obj = {
		action: 'select',
		table: 'Trasy',
		data: 0,
		condition: con
	};
	return $.getScript(serwer + '/ajax/ajaxuniversal2.php?' + $.param(obj), function(script, status, jqXHR) {
		if (status === 'success') {
			that.tblTrasy = dbo.tblTrasy;
		}
	});
};

google.impet.Trasy.prototype.setDisplay = function(display) {
	this.display = display;

}

//T = google.impet.Trasy;
//a = new T;
//a.wczytaj();

var infoWin = new google.maps.InfoWindow({
	map: impet.map
})
google.maps.event.addDomListener(window, 'load', initialize);


/*
 * Extended API for Google Maps v3
 *
 * by José Fernando Calcerrada.
 *
 * Licensed under the GPL licenses:
 * http://www.gnu.org/licenses/gpl.html
 *
 */

// LatLng
/******************************************************************************/
google.maps.LatLng.prototype.distanceFrom = function(latlng) {
		var lat = [this.lat(), latlng.lat()]
		var lng = [this.lng(), latlng.lng()]

		//var R = 6371; // km (change this constant to get miles)
		var R = 6378137; // In meters
		var dLat = (lat[1] - lat[0]) * Math.PI / 180;
		var dLng = (lng[1] - lng[0]) * Math.PI / 180;
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat[0] * Math.PI / 180) * Math.cos(lat[1] * Math.PI / 180) *
			Math.sin(dLng / 2) * Math.sin(dLng / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;

		return Math.round(d);
	}
	// TODO: revisar para 179, -179
google.maps.LatLng.prototype.getMiddle = function(latlng) {
	var lat = (this.lat() + latlng.lat()) / 2;
	var lng = this.lng() - latlng.lng(); // Distance between

	// To control the problem with +-180 degrees.
	if (lng <= 180 && lng >= -180) {
		lng = (this.lng() + latlng.lng()) / 2;
	}
	else {
		lng = (this.lng() + latlng.lng() + 360) / 2;
	}

	return new google.maps.LatLng(lat, lng)
}

// Marker
/******************************************************************************/
Markero.prototype.distanceFrom = function(marker) {
	return this.getPosition()
		.distanceFrom(marker.getPosition());
}
Markero.prototype.getMiddle = function(marker) {
	return this.getPosition()
		.getMiddle(marker.getPosition());
}


// Polyline
/******************************************************************************/
Object.defineProperty(google.maps.Polyline.prototype, 'weight', {
	set: function(x) {
		this.set('strokeWeight', x)
	},
	get: function() {
		return this.get('strokeWeight')
	},
	configurable: true
});
Object.defineProperty(google.maps.Polyline.prototype, 'color', {
	set: function(x) {
		this.set('strokeColor', x);
	},
	get: function() {
		return this.get('strokeColor');
	},
	configurable: true
});
Object.defineProperty(google.maps.Polyline.prototype, 'opacity', {
	set: function(x) {
		this.set('strokeOpacity', x);
	},
	get: function() {
		return this.get('strokeOpacity');
	},
	configurable: true
});
google.maps.Polyline.prototype.deleteVertex = function(i) {
	this.getPath()
		.removeAt(i);
}
google.maps.Polyline.prototype.getBounds = function() {
	var latlngBounds = new google.maps.LatLngBounds();
	for (var x = 0; x < this.latLngs.j.length; x++) {
		var path = this.latLngs.j[x];

		for (var i = 0; i < path.getLength(); i++) {
			latlngBounds.extend(path.getAt(i));
		}
	}
	return latlngBounds;
}
google.maps.Polyline.prototype.storeState = function() {
	this.state = {
		weight: this.weight,
		color: this.color,
		opacity: this.opacity,
		visible: this.visible

	}
}
google.maps.Polyline.prototype.restoreState = function() {
	try {
		this.weight = this.state.weight;
		this.color = this.state.color;
		this.opacity = this.state.opacity;
		this.visible = this.state.visible;
	}
	catch (e) {

	}
}
google.maps.Polyline.prototype.getLength = function() {
	var d = 0;
	var path = this.getPath();
	var latlng;

	for (var i = 0; i < path.getLength() - 1; i++) {
		latlng = [path.getAt(i), path.getAt(i + 1)]
		d += latlng[0].distanceFrom(latlng[1]);
	}

	return d;
}
google.maps.Polyline.prototype.getVertex = function(i) {
	return this.getPath()
		.getAt(i);
}
google.maps.Polyline.prototype.getVertexCount = function() {
	return this.getPath()
		.getLength();
}
google.maps.Polyline.prototype.getVisible = function() {
	return (this.getMap()) ? true : false;
}
google.maps.Polyline.prototype.insertVertex = function(i, latlng) {
	this.getPath()
		.insertAt(i, latlng);
}

google.maps.Polyline.prototype.lastMap = false;

google.maps.Polyline.prototype.setVertex = function(i, latlng) {
	this.getPath()
		.setAt(i, latlng);
}

google.maps.Polyline.prototype.setVisible = function(visible) {
	if (visible === true && !this.getVisible()) {
		this.setMap(this.lastMap);

	}
	else if (visible === false && this.getVisible()) {
		this.lastMap = this.getMap();
		this.setMap(null);
	}
}