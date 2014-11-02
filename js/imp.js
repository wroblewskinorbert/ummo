var impet = {};
var sterownik, google, MiastaKontroler, Miasta;
impet.draw = false;
impet.debug = true;
impet.initialization = true;
var panoramaOptions, map, panorama, geocoder, infoWindow, mapDiv, markerGeocoder, directionsDisplay, directionsService, markeryNazwa;
var nastepny, poprzedni, zapisz;
var trasy;
var firmaBiezaca = {};
var zwrocWZakresie, display;
var serwer = 'http://192.168.2.220/'; //'http://localhost'; // document.location.origin;
//var serwer = 'http://213.92.139.215'; //'http://localhost'; // document.location.origin;
var serwer = 'http://localhost'; // document.location.origin;
var dbo = {};
var markeryNazwaZoom = 12;
window.markeryNazwa = {
	wyswietlone: [],
	odrzucone: {},
	odrzuconeHard: [],
	doWyswietlenia: [],
	draw: function () {
		console.time('draw')
		var that = this;
		var zoom = display.zoom;
		that.firmyWZakresie = zwrocWZakresie();
		that.odrzucone = {};
		that.odrzuconeHard = [];
		that.doWyswietlenia = [];
		var len = that.firmyWZakresie.length;
		for (var x = 0; x < len; x++) {
			var punkt = that.firmyWZakresie.pop();
			delete that.wyswietlone[punkt];
			if (display.settings.ogranicznikZoomu > display.zoom || (!((punkt.ocena >= display.settings.filtrOcena && punkt.priorytet >= display.settings.filtrPriorytet))) || ((!punkt.khId && !display.settings.wszyscy))) {
				that.odrzuconeHard.push(punkt);
				punkt.painted = false;
				if (punkt.marker.getVisible())
					punkt.marker.setVisible(false);
			} else {
				that.wyswietlone.push(punkt);
				if (!punkt.marker.getVisible() || punkt.painted != true) {
					punkt.marker.setVisible(true);
					that.doWyswietlenia.push(punkt);
					if (display.zoom == 13) {
						punkt.markerNazwa.setIcon(Markero.iconName(0.65, 'black', punkt.nazwa));
					} else if (display.zoom == 14) {
						punkt.markerNazwa.setIcon(Markero.iconName(0.9, 'black', punkt.nazwa));
					} else if (display.zoom == 12) {
						punkt.markerNazwa.setIcon(Markero.iconName(0.5, 'black', punkt.nazwa));
					} else if (display.zoom > 14) {
						punkt.markerNazwa.setIcon(Markero.iconName(1.0, 'black', punkt.nazwa));
					}
					punkt.markerNazwa.setVisible(true);
				}
				punkt.painted = true;
			}
			if (display.zoom < 12) {
				if (punkt.markerNazwa.getVisible()) {
					punkt.markerNazwa.setVisible(false);
				}
			} else {
				if (display.zoomChanged) {
					if (display.zoom == 13) {
						punkt.markerNazwa.setIcon(Markero.iconName(0.65, 'black', punkt.nazwa));
					} else if (display.zoom == 14) {
						punkt.markerNazwa.setIcon(Markero.iconName(0.9, 'black', punkt.nazwa));
					} else if (display.zoom == 12) {
						punkt.markerNazwa.setIcon(Markero.iconName(0.5, 'black', punkt.nazwa));
					} else if (display.zoom > 14) {
						punkt.markerNazwa.setIcon(Markero.iconName(1.0, 'black', punkt.nazwa));
					}

				}
				if (punkt.mvc.visible != punkt.markerNazwa.getVisible()) {
					punkt.markerNazwa.setVisible(!punkt.markerNazwa.getVisible());
				}
			}
		}
		console.timeEnd('draw');
	}
};

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
zwrocWZakresie = function (bounds) {
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
				komorka.forEach(function (el) {
					//if(el.ocena>=display.settings.filtrOcena&&el.priorytet>=display.settings.filtrPriorytet){
					//	if(display.settings.wszyscy||el.khId){
					res.push(el);
					//		}
					//		}
				})
			};
		}
	}
	return res;
}

function wyczyscWszystkie() {
	var punkty = zwrocWZakresie();
	punkty.forEach(function (ele) {
		ele.marker.set('visible', false);
		ele.marker.set('visible', false);
	})
}
$.getScript(serwer + '/ajax/ajaxuniversal2.php?table=ImpetPracownicy&action=select&condition=id%3did&data=0', function (data) {
	var kto = $('<select id="wyborPracownika"></select>')
	impet.users = [];
	for (var x in dbo.tblImpetPracownicy) {
		impet.users[dbo.tblImpetPracownicy[x].id] = dbo.tblImpetPracownicy[x];
		impet.users[dbo.tblImpetPracownicy[x].inicjaly.toLowerCase()] = dbo.tblImpetPracownicy[x];
		if (dbo.tblImpetPracownicy[x].aktywny) {
			kto.append($('<option id="' + dbo.tblImpetPracownicy[x].id + '" value="' + dbo.tblImpetPracownicy[x].id + '">' + dbo.tblImpetPracownicy[x].inicjaly + '</option>'));
		}
	}
	$('#panel')
		.append(kto);
	kto.change(function (e) {
		//******************************************************* zmiana uzytkownika
		impet.user = this.value;
		localStorage['impetSettingsLastUser'] = impet.user;
	})
	console.log('Pracwonicny wczytani');
});
display = function () {
	window.lastUser = localStorage['impetSettingsLastUser'];
	impet.user = lastUser ? lastUser : 4;
	$('#wyborPracownika').get(0).value = impet.user;
	display.wczytajIUstawUstawienia();
	//display.odczytajIZapiszUstawienie();
	setTimeout(function () {
		delete impet.initialization;
	}, 15000)
	map.addListener('zoom_changed', function (e) {
		display.prevZoom = display.zoom;
		display.zoom = map.getZoom();
		display.zoomChanged = true;
		$('span#zoomText').html(display.zoom);
		display.settings.zoom = display.zoom;
		display.odczytajIZapiszUstawienie();
	})
	map.addListener('bounds_changed', mapaZmienilaObszar);
}
display.wczytajIUstawUstawienia = function () {
	var settingsLoaded = $.parseJSON(localStorage.getItem('impetSet' + impet.user)) || {};
	$('input[store]').each(function (ind, ele) {
		if (ele.type == 'checkbox') {
			ele.checked = (settingsLoaded[ele.id] == undefined) ? ele.defaultChecked : settingsLoaded[ele.id];
		} else {
			ele.value = settingsLoaded[ele.id] || ele.defaultValue;
			$('#val' + ele.id).html(ele.value);
		}
	});
	display.settings = $.extend({}, display.default, settingsLoaded);
	display.center = new google.maps.LatLng(
		display.settings['centerLat'],
		display.settings['centerLng']
	);
	map.setCenter(display.center);
	display.zoom = display.settings['zoom'];
	map.setZoom(display.zoom);
}
display.odczytajIZapiszUstawienie = function () {
	impet.user = $('#wyborPracownika').get(0).value;
	localStorage['impetSettingsLastUser'] = impet.user;
	var sett = display.settings; // {};
	$('input[store]').each(function (ind, ele) {
		if (ele.type == "checkbox") {
			sett[ele.id] = ele.checked;
		} else {
			sett[ele.id] = ele.value;
		}
	})
	if (impet.initialization) return;
	localStorage['impetSet' + impet.user] = JSON.stringify(sett);
}
display.default = {
	zoom: 7,
	centerLat: 49,
	centerLng: 22
}

function mapaZmienilaObszar() {
	//if(impet.initialization) return;
	display.center = map.getCenter();
	display.settings['centerLat'] = display.center.lat();
	display.settings['centerLng'] = display.center.lng();
	display.bounds = map.getBounds();
	display.odczytajIZapiszUstawienie();
	//	display.wczytajIUstawUstawienia();
	markeryNazwa.draw();
	if (display.zoomChanged) {
		display.zoomChanged = false;
	}
}
$('body').on('change', 'input[store]', function (e) {
	display.odczytajIZapiszUstawienie();
	switch (this.id) {
	case "ogranicznikWielkosci":
	case "wszyscy":
	case "rysowac":
	case "okragle":
		{
			sterownik.id.forEach(function (el) {
				el.marker.set('icon', el.icon);
			})
			//		markeryNazwa.draw();
			break;
		}
	}
	display.wczytajIUstawUstawienia();
	//wyczyscWszystkie();
	markeryNazwa.draw();
})

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
TrasaShow.prototype.wyznaczOdcinkiNew = function () {
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
TrasaShow.prototype.TwoPointsToWay = function (fromPoint, toPoint, reply) {
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
		odcinek.forEach(function (ele) {
			fromPoint.firma.odcinki[toPoint.firma.key].push(ele)
		});
		that.poly.setVisible(false);
		that.poly.setVisible(true);
		return;
	} else {
		var con = " key1='" + fromKey + "' AND key2='" + toKey + "'";
		var that = this;
		var obj = {
			action: 'select',
			table: 'Odcinki',
			data: 0,
			condition: con
		};
		$.getJSON(serwer + '/ajax/ajaxuniversal4.php', obj, function (data) {
			var odcinki = data;
			if (odcinki.length > 0) {
				sessionStorage.setItem(fromKey + ';' + toKey, odcinki[0].data);
				var odcinek = google.maps.geometry.encoding.decodePath(unescape(odcinki[0].data));
				fromPoint.firma.odcinki[toPoint.firma.key].clear();
				odcinek.forEach(function (ele) {
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
			directionsService.route(req, function (response, status) {
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
					odcinek.path.forEach(function (ele) {
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

				} else if (status == "OVER_QUERY_LIMIT") {
					setTimeout(function () {
						that.TwoPointsToWay(fromPoint, toPoint)
					}, directionsService.ile * 1000);
					return;
				}
			})
		});
	}
};

function miastaOpacity(event, ui) {
	impet.miastaSter.changeOptions({
		fillOpacity: ui.value
	});
}
var inKolor, chboxMiasta, Firmy, Markero, Trasy, TrasyClass;

function wczytajPanelDolny() {
	inKolor = $('#colorMiast');
	inKolor.val(impet.miastaSter.options.fillColor);
	inKolor.on('change', ustawionoKolor);
	inKolor.prop('disabled', true);
	$('#opacityMiast')
		.slider({
			min: 0,
			max: 1,
			step: 0.01,
			value: impet.miastaSter.options.fillOpacity,
			disabled: true
		});
	$('#opacityMiast')
		.on('slide', miastaOpacity);
	chboxMiasta = $('#czyMiasta');
	chboxMiasta.on('change', function (e) {
		if (this.checked) {
			impet.miastaSter.wyswietl(true);
			inKolor.prop('disabled', false);
			$('#opacityMiast')
				.slider('enable');
		} else {
			impet.miastaSter.wyswietl(false);
			inKolor.prop('disabled', true);
			$('#opacityMiast')
				.slider('disable');
		}
		google.maps.event.trigger(impet.map, 'bounds_changed');
	});
	$('#uchwytPanelDolny')
		.draggable({
			axis: 'y',
			helper: 'clone',
			opacity: 0.35,
			cursor: 'w-resize'
		});
	$('#uchwytPanelDolny')
		.on("drag", function (event, ui) {
			$('#panelDolny')
				.css('max-height', document.body.clientHeight - event.clientY);
		});
	$('#dodajTrase')
		.click(function (e) {
			var nazwa = prompt("Podaj nazwe trasy");
			trasy.nowaTrasa(nazwa);
			e.preventDefault();
		});
	$('#dodajTraseDoListyIWyswietl')
		.click(function (e) {
			trasy.tblTrasy.unshift(trasy.trasa);
			trasy.panel.przelacz(true);
			e.preventDefault();
			e.stopImmediatePropagation();
			trasy.wyswietl();
		});
	//impet.ster.handleInputs();
	//	sterownik.MarkeryDraw(true);
	//	sterownik.MarkeryDraw();
	google.maps.event.trigger(impet.map, 'bounds_changed');
}

function ustawionoKolor(e) {
	impet.miastaSter.changeOptions({
		fillColor: this.value
	});
}

function wczytajMape() {
	//debugger;
	$.getScript('js/mapa.js', function () {});
}

function Rekordy(zrodlo) {
	this.zrodlo = zrodlo;
	this.biezacyId = 0;
}
Rekordy.prototype.wczytaj = function (offset, ile) {};
Rekordy.prototype.nastepnyRekord = function () {};
Rekordy.prototype.poprzedniRekord = function () {};

function FirmaBiezaca(id, rekordy) {
	this.id = id;
	this.rekordy = rekordy;
	this.firma = Firmy[id];
	this.zaladujFormatke();
}
FirmaBiezaca.prototype.ustaw = function (id) {
	this.id = id;
	this.firma = Firmy[id];
	this.zaladujFormatke();
};
FirmaBiezaca.prototype.zaladujFormatke = function () {
	$('#inputFirma')
		.val(this.firma.nazwa);
	$('#inputMiejscowosc')
		.val(impet.miasta[this.id].nazwa);
};

function ustawInterfejsObslugi() {
	$('#panelLewyHandler')
		.draggable({
			axis: 'x',
			helper: 'clone',
			opacity: 0.35,
			cursor: 'w-resize'
		})
	$('#przeladuMape')
		.click(function () {
			wczytajMape();
		});
	$('#wczytajMiejscowosci')
		.click(function () {
			Trasy = new TrasyClass(trasy, impet.map);
		});
	$('#wczytajPanelDolny')
		.click(function () {
			wczytajPanelDolny();
		});
	nastepny = $('#nastepnaFirma');
	nastepny.click(function (e) {
		if (rekordy.length <= ++firmaBiezaca.id) {
			nastepny.attr('disabled', 'disabled');
		} else {
			if (firmaBiezaca.id === rekordy.length - 2)
				nastepny.removeAttr('disabled');
			firmaBiezaca.ustaw(firmaBiezaca.id);
		}
	});
	poprzedni = $('#poprzedniaFirma');
	poprzedni.click(function (e) {
		if (--firmaBiezaca.id === 0) {
			poprzedni.attr('disabled', 'disabled');
		} else {
			if (firmaBiezaca.id === 1)
				nastepny.removeAttr('disabled');
			firmaBiezaca.ustaw(firmaBiezaca.id);
		}
	});
}

function initialize() {
	mapDiv = document.getElementById('mapCanvas');
	impet.map = new google.maps.Map(mapDiv, {
		disableDoubleClickZoom: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		minZoom: 6,
		maxZoom: 15
	});
	if (impet.debug) {
		map = impet.map;
	}
	infoWindow = new google.maps.InfoWindow();
	geocoder = new google.maps.Geocoder();
	(function () {
		var newId = -1;
		var punktNewId = -1;

		function TrasyClass() {
			var that = this;
			this.trasyId = [];
			this.odKiedy = new Date('2014-03-01');
		}
		TrasyClass.prototype = new google.maps.MVCObject();
		TrasyClass.prototype.constructor = TrasyClass;
		TrasyClass.prototype.wczytaj = function () {
			var that = this;
			var con = ' kiedy >  CONVERT(DATETIME, \'' + this.odKiedy.toISOString()
				.slice(0, 10) + ' 00:00:00\', 102) ORDER BY kiedy DESC';
			var obj = {
				action: 'select',
				table: 'Trasy',
				data: 0,
				condition: con
			};
			return $.getJSON(serwer + '/ajax/ajaxuniversal4.php', obj, function (data) {})
		};
		TrasyClass.prototype.wyswietl = function () {
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
				.on('mouseenter', 'li', function (e) {
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
				.on('mouseleave', 'li', function (e) {
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
				.on("selectableselected", function (event, ui) {
					trasy.pokazTrase($(ui.selected)
						.data('id'), true);
					event.stopImmediatePropagation();
				});
			$("#selectable")
				.on("selectableunselected", function (event, ui) {
					that.pokazTrase($(ui.unselected)
						.data('id'), false);
				});
			$("#selectable")
				.on("selectablestart", function (event, ui) {
					if (!event.ctrlKey) {
						trasy.bounds = new google.maps.LatLngBounds();
					}
				})
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
		TrasyClass.prototype.wczytajIWyswietl = function () {
			var that = this;
			this.wczytaj()
				.done(function (data) {
					that.tblTrasy = data;
					//that.tblTrasy = dbo.tblTrasy;
					that.wyswietl();
					panelTrasy.dataPrzedzial = $.now() - Date.parse((that.trasyId.find(function (el) {
							return el;
						}))
						.kiedy.date);
				});
		};
		TrasyClass.prototype.pokazTrase = function (trasaId, czyPokazac) {
			var thatTrasy = this;
			var trasa = this.trasyId[trasaId];
			if (!trasa.get('loaded')) {
				trasa.wczytajPunkty(function () {
					thatTrasy.pokazTrase(trasaId, czyPokazac);
				});
			} else {
				trasa.pokaz(czyPokazac);
			}
			if (czyPokazac) {
				trasy.bounds.union(trasa.drogaNaMapie.poly.getBounds());
				impet.map.fitBounds(trasy.bounds);
			}
		};
		TrasyClass.prototype.nowaTrasa = function (opis) {
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
		Trasa.prototype.wczytajPunkty = function (callback) {
			var that = this;
			var con = ' trasaId =' + this.get('id') + ' ORDER BY kolejnosc ASC';
			var obj = {
				action: 'select',
				table: 'TrasyPunktyShort',
				data: 0,
				condition: con
			};
			$.get(serwer + '/ajax/ajaxuniversal4.php', obj, function (data) {
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
		Trasa.prototype.pokaz = function (czyPokazac) {
			if (czyPokazac == undefined)
				czyPokazac = true;
			var that = this;
			this.forEach(function (el, ind) {
				if (!el.marker) {
					var iconTemp = el.markerOptions.icon;
					delete el.markerOptions.icon;
					el.marker = new Markero(el.markerOptions);
					// 					el.marker.set('icon', iconTemp);
					el.marker.setIcon(Markero.icon(0.8, '#' + el.kto.kolor.slice(0, 3), ind + 1));
					el.marker.set('map', impet.map);
					el.marker.addListener('rightclick', impet.markerRightClicked)
					that.markery[ind] = el.marker;
					var postemp = el.firma.position;
					el.marker.bindTo('position', el.firma.mvc);
					var opacityDiv = ($.now() - el.kiedy.getTime()) / panelTrasy.dataPrzedzial;
					if (opacityDiv > 1)
						opacityDiv = 1;
					if (opacityDiv < 0)
						opacityDiv = 0;
					var opacity = 1 - opacityDiv * 0.95;
					el.marker.setOpacity(opacity);
				} else {
					el.marker.setIcon(Markero.icon(0.8, '#' + el.kto.kolor.slice(0, 3), ind + 1));
					el.marker.notify('icon');
					el.marker.bindTo('position', el.firma.mvc);
				}
				el.marker.setVisible(czyPokazac);
			});
			if ((this.drogaNaMapie == null) || this.drogaNaMapie.poly.getPath() == undefined || (this.drogaNaMapie.poly.getPath()
				.getLength() == 0)) {
				this.drogaNaMapie = new TrasaShow(this.getArray());
			} else if ((this.drogaNaMapie.poly))
				this.drogaNaMapie.poly.setVisible(czyPokazac);
		};
		Trasa.prototype.dodaj = function (firma, kolej) {
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
			} else {
				this.push(punkt);
			}
			this.drogaNaMapie.wyznaczOdcinkiNew(this.getArray());
			this.edytuj();
		};
		Trasa.prototype.listaHTML = function () {
			var that = this;
			var trasaOpis = this.get('opis');
			$('#trasaOpis')
				.html('<b>' + trasaOpis + '</b>');

			var result = "<ol id='selectable2'>";
			var liczba = this.getLength();
			this.forEach(function (element, index) {
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
		kolejnyKolor = (function () {
			var x = 0;
			return function (skok) {
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
		Trasa.prototype.edytuj = function () {
			var that = this;
			Trasa.prevIndex = 1
			panelTrasa.html(this.listaHTML());
			var sort = $('#selectable2')
				.sortable({
					start: function (event, ui) {
						console.log('start');
						that.prevIndex = $(ui.item)
							.index();
						that.moveItem = that.getAt(that.prevIndex);
					},
					change: function (event, ui) {
						//var index = that.removeAt(Trasa.prevIndex)
						console.log($(ui.item)
							.index());
						console.log($(ui.placeholder)
							.index())
						//that.insertAt(index);
						that.lastIndex = $(ui.placeholder)
							.index();
					},
					stop: function (event, ui) {
						if (that.lastIndex < that.prevIndex) {
							that.removeAt(that.prevIndex);
							that.insertAt(that.lastIndex, that.moveItem);
						} else if (that.lastIndex > that.prevIndex) {
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
				.on('mouseenter', 'li', function (e) {
					var firmaId = $(this)
						.data('id');
					zakreslacz.setVisible(true);
					var firma = sterownik.id[firmaId];
					zakreslacz.bindTo('position', firma.mvc);

					var trasaId = $(this)
						.data('trasaid');
					trasy.trasa.forEach(function (el) {
						if (el.id == trasaId) {
							el.marker.setAnimation(1);
						}
					})
				})
				.on('mouseleave', 'li', function (e) {

					var trasaId = $(this)
						.data('trasaid');
					trasy.trasa.forEach(function (el) {
						if (el.id == trasaId) {
							el.marker.setAnimation(null);
						}
					})
				})
				.on('dblclick', 'li', function (e) {
					var firmaId = $(this)
						.data('id');
					var firma = sterownik.id[firmaId];
					//					map.panTo(firma.position);
					//					var zoom = map.getZoom();
					//					if (zoom < 12) {
					//						map.setZoom(zoom + 2);
					//					}
					firma.marker.setDraggable(!firma.marker.getDraggable());
					impet.fb = firma;
				})
				.on('click', 'li', function (e) {
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

		Punkt.prototype.ustawMarker = function () {
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
		panel.przelacz = function (czyTrasy) {
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
		panel.on('mouseup', function (e) {
			if (e.which == 2) {
				panel.przyciagaj = !panel.przyciagaj;
			}
		})
		panelTrasy.on('contextmenu', 'li', function (e) {
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
			trasy.trasa.wczytajPunkty(function () {
				$(tmpLi)
					.addClass('ui-effects-transfer')
					.effect("transfer", {
						to: $('#trasaOpis')
							.eq(0)
					}, 1500, function () {
						$('#trasaOpis')
							.addClass('ui-effects-transfer');
						setTimeout(function () {
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
		panelTrasa.on('contextmenu', function (e) {
			panel.przelacz(true);
			e.stopImmediatePropagation();
			e.preventDefault();
		});
		trasy.panel = panel;
	})();
	$('#address')
		.keypress(function (e) {
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
	google.maps.event.addListener(markerGeocoder.infoWin, 'closeclick', function (e) {
		markerGeocoder.setVisible(false);
	});
	impet.map.addListener('dblclick', function (e) {
		markerGeocoder.setPosition(e.latLng);
		markerGeocoder.setVisible(true);
		google.maps.event.trigger(markerGeocoder, 'dragend', e);
		e.stop();
	});
	google.maps.event.addListener(markerGeocoder, 'dragend', function (e) {
		geocoder.geocode({
			'latLng': e.latLng,
			region: 'pl'
		}, function (results, status) {
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
	//*****************************************************************************************************************************************
	$(function () { //Iniciacja !!!!!
		$.when(
			$.get(serwer + '/ajax/ajaxuniversal4.php', {
				table: 'PlMiejscowosci',
				condition: 'id=id',
				action: 'select',
				data: 0
			}, function (data) {
				impet = impet || {};
				impet.miasta = data;
				var length = impet.miasta.length;
				impet.miastaSter={};
				impet.miastaSter.options = {
					strokeColor: '#000',
					strokeOpacity: 0.45,
					fillColor: '#ff0000',
					fillOpacity: 0.26,
					visible: false,
					clickable: true,
					map:impet.map
				};impet.miastaId = [];
				impet.miasta.forEach(function (ele, ind, tab) {
					impet.miastaId[ele.id] = ele;
				});
				impet.miastaSter.wyswietl = function (czyWidoczne) {
				impet.miastaSter.options.map = map;
				impet.miastaSter.czyWidoczne = (czyWidoczne === false) ? false : true;
						impet.miasta.forEach(function (ele, ind, tab) {
							ele.cityCircle.setVisible(czyWidoczne);
						});
						return;
					}
					var opt = Object.create(impet.miastaSter.options);
					for (var x = 0; x < length; x++) {
						var miasto = impet.miasta[x];
						opt.radius = Math.pow(miasto.ludnoscSuma, 0.5) * 10;
						opt.center = new google.maps.LatLng(miasto.wspN, miasto.wspE);
						miasto.cityCircle = new google.maps.Circle(opt);
						miasto.cityCircle.opt = opt;
					}
				
				impet.miastaSter.changeOptions = function (optio) {
					if (!optio) {
						optio = impet.miastaSter.options;
					}
					var length = impet.miasta.length;
					for (var x = 0; x < length; x++) {
						impet.miasta[x].cityCircle.setOptions(optio);
					}
				};
			}),
			$.post(serwer + '/ajax/ajaxuniversal4.php', {
				table: 'Firmy',
				condition: 'id=id',
				action: 'select',
				data: 0
			})
			.done(function (data) {
				dbo.tblFirmy = data;
			}),
			$.post(serwer + '/ajax/ajaxuniversal4.php', {
				table: 'FirmyV',
				condition: 'khId=khId',
				action: 'select',
				data: 0
			}, function (data) {
				dbo.tblFirmyV = data;
			})
		)
			.done(function (data) {
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
					FirmyImpet[x].miejscowosc = impet.miastaId[FirmyImpet[x].miejscowoscId];
				}
				Firmy = FirmyImpet;
				sterownik = firmySterownikSetup(impet.map, FirmyImpet);
				// domyslnym uzytkownikiem jestem
			});
		directionsService = new google.maps.DirectionsService();
		directionsService.ile = 0;
		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap(impet.map);
		$('#button-panel-gorny')
			.click(function (e) {
				$(this)
					.parent()
					.prev()
					.slideToggle();
			})
			.click();
		$('#button-panel-gorny2')
			.click(function (e) {
				$(this)
				//.parent()
				.prev()
					.slideToggle();
			})
			.click();
		$.get('obsluga.html', function (data) {
			$('#divObsluga')
				.html(data);
			ustawInterfejsObslugi();

		});
		$('#panelLewyHandler')
			.on("drag", function (event, ui) {
				$('#panelLewy')
					.css('width', ui.position.left);
			});
		trasy.wczytajIWyswietl();
		google.maps.event.trigger(impet.map, 'bounds_changed');
	});
	impet.zacznijZaznaczanie = function () {
		$('#panelLewyTrasa li')
			.removeClass('start stop');
		$('#panelLewyTrasa')
			.on('click', 'li', function (e) {
				$(this)
					.addClass('start');
				e.stopImmediatePropagation();
				$('#panelLewyTrasa')
					.off(e);
				$('#panelLewyTrasa')
					.on('click', 'li', function (e) {
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
		waypoints = $waypoints.map(function (ind, val) {
			return $(this)
				.data('id');
		});
		start = start.data('id');
		stop = stop.data('id');
		var waypts = [];
		waypts = waypoints.map(function (ind, el) {
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
		directionsService.route(req, function (response, status) {
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
			(function (x, that) {
				that.mvc.set(x, that.rekord[x]);
				var prop = {};
				if ((x !== 'id') && (x.indexOf('wsp'))) {
					prop.set = function (val) {
						that.mvc.set(x, val);
					};
				}
				prop.get = function () {
					return that.mvc.get(x);
				};
				dp(that, x, prop);
			})(x, this);
		}
		this.mvc.set('position', new google.maps.LatLng(this.rekord.wspN, this.rekord.wspE));
		dp(this, 'position', {
			set: function (val) {
				var x = val;
			},
			get: function () {
				return this.mvc.get('position');
			}
		});
		dp(this, 'key', {
			set: function (val) {
				var x = val;
			},
			get: function () {
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
		this.marker.set('icon', this.icon);
		this.marker.parent = this;
		this.marker.set('position', this.mvc.position);
		this.markerNazwa = new Markero(opt); //google.maps.
		this.markerNazwa.bindTo('position', this.marker);
		this.marker.addListener('click', pokazInfoFirmy);
		if (this.id < 5185) {
			this.marker.bindTo('visible', this.mvc);
		}
		this.marker.addListener('rightclick', function (e) {
			if (!trasy.trasa)
				return;
			trasy.trasa.dodaj(this.parent);
		});
	}


	function pokazInfoFirmy(e) {
		var content;
		var marker = this;
		var firma = marker.parent;
		$.get('./firma.html')
			.done(
				function (data) {
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
		get: function () {
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
			} else {

				color = 'ffffff';
			}
			var cond = document.getElementById('okragle');
			var scala = (display.settings['ogranicznikWielkosci'] * 1.0 + 1) / 5;
			if (cond.checked)
				return Markero.iconCircle(12 * size, '#' + color, scala);
			return Markero.icon(size * scala, '#' + color, this.priorytet);
		}
	});
	dp(Firma.prototype, 'strokeColor', {
		get: function () {
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
			} else {
				color = '#888';
			}
			return color;
		}
	});
	dp(Firma.prototype, 'fillColor', {
		get: function () {
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
			} else {
				color = '#ffffff';
			}
			return color;
		}
	});
	dp(Firma.prototype, 'inView', {
		get: function () {
			return impet.map.getBounds()
				.contains(this.position);
		}
	})

	function firmySterownikSetup(map, rekordy) {
		var sterownik = {
			id: [],
			rekordy: rekordy,
			map: map,
		};
		var len = rekordy.length;
		console.time('rekordy')
		var progressbar = $("#progressbar"),
			progressLabel = $(".progress-label");

		progressbar.progressbar({
			value: false,
			change: function () {
				progressLabel.text(progressbar.progressbar("value") + "%");
			},
			complete: function () {
				progressLabel.text("Gotowe!");
			}
		});
		var howManyParts = 50;
		var lenPart = Math.floor(len / howManyParts);
		var lenSmallerPart = len - lenPart * howManyParts;
		for (var xx = 0; xx < howManyParts; xx++) {
			(function (ileRazy) {
				return setTimeout(function () {
					console.log('aha');
					progressbar.progressbar("value", (ileRazy + 1) * 100 / howManyParts);
					if (ileRazy == howManyParts - 2) {
						progressbar.fadeOut(1500);
					}
					for (var x = lenPart * ileRazy; x < (ileRazy + 1) * lenPart; x++) {
						sterownik.id[rekordy[x].id] = new Firma(rekordy[x], sterownik, impet.map);
						window.sterownik = sterownik;
					}
				}, 6000 / howManyParts * ileRazy)

			})(xx);
		}
		setTimeout(function () {
			for (var x = howManyParts * lenPart; x < howManyParts * lenPart + lenSmallerPart; x++) {
				window.sterownik.id[rekordy[x].id] = new Firma(rekordy[x], sterownik, impet.map);
				window.sterownik = sterownik;
			}
			dalej();
		}, 6500);

		function dalej() {
			console.timeEnd('rekordy');
			sterownik.id.forEach(function (el, ind) {
				projekcjaNaSiatke(el);
			});
			impet.map.addListener('zoom_changed', function (e) {
				return;
			});
			sterownik.uzytkownik = impet.users[4];
			wczytajPanelDolny();
			return sterownik;
		}
		display();
	}
}

google.impet = {};
google.impet.Trasy = function (opt) {
	if (typeof (opt) === 'undefined') {
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

function codeAddress() {
	var address = document.getElementById('address')
		.value;
	geocoder.geocode({
		'address': address
	}, function (results, status) {
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
		} else {
			alert('Odszukanie nie powiodłow!' + status);
		}
	});
}
google.maps.Polyline.prototype.getBounds = function () {
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
google.impet.Trasy = function (opt) {
	if (typeof (opt) === 'undefined') {
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
google.impet.Trasy.prototype.wczytaj = function () {
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
	return $.getScript(serwer + '/ajax/ajaxuniversal2.php?' + $.param(obj), function (script, status, jqXHR) {
		if (status === 'success') {
			that.tblTrasy = dbo.tblTrasy;
		}
	});
};
google.impet.Trasy.prototype.setDisplay = function (display) {
	this.display = display;
}
//T = google.impet.Trasy;
//a = new T;
//a.wczytaj();
var infoWin = new google.maps.InfoWindow({
	map: impet.map
})
google.maps.event.addDomListener(window, 'load', initialize);
/******************************************************************************/
google.maps.LatLng.prototype.distanceFrom = function (latlng) {
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
google.maps.LatLng.prototype.getMiddle = function (latlng) {
	var lat = (this.lat() + latlng.lat()) / 2;
	var lng = this.lng() - latlng.lng(); // Distance between

	// To control the problem with +-180 degrees.
	if (lng <= 180 && lng >= -180) {
		lng = (this.lng() + latlng.lng()) / 2;
	} else {
		lng = (this.lng() + latlng.lng() + 360) / 2;
	}

	return new google.maps.LatLng(lat, lng)
}

// Marker
/******************************************************************************/
Markero.prototype.distanceFrom = function (marker) {
	return this.getPosition()
		.distanceFrom(marker.getPosition());
}
Markero.prototype.getMiddle = function (marker) {
	return this.getPosition()
		.getMiddle(marker.getPosition());
}
// Polyline
/******************************************************************************/
Object.defineProperty(google.maps.Polyline.prototype, 'weight', {
	set: function (x) {
		this.set('strokeWeight', x)
	},
	get: function () {
		return this.get('strokeWeight')
	},
	configurable: true
});
Object.defineProperty(google.maps.Polyline.prototype, 'color', {
	set: function (x) {
		this.set('strokeColor', x);
	},
	get: function () {
		return this.get('strokeColor');
	},
	configurable: true
});
Object.defineProperty(google.maps.Polyline.prototype, 'opacity', {
	set: function (x) {
		this.set('strokeOpacity', x);
	},
	get: function () {
		return this.get('strokeOpacity');
	},
	configurable: true
});
google.maps.Polyline.prototype.deleteVertex = function (i) {
	this.getPath()
		.removeAt(i);
}
google.maps.Polyline.prototype.getBounds = function () {
	var latlngBounds = new google.maps.LatLngBounds();
	for (var x = 0; x < this.latLngs.j.length; x++) {
		var path = this.latLngs.j[x];

		for (var i = 0; i < path.getLength(); i++) {
			latlngBounds.extend(path.getAt(i));
		}
	}
	return latlngBounds;
}
google.maps.Polyline.prototype.storeState = function () {
	this.state = {
		weight: this.weight,
		color: this.color,
		opacity: this.opacity,
		visible: this.visible
	}
}
google.maps.Polyline.prototype.restoreState = function () {
	try {
		this.weight = this.state.weight;
		this.color = this.state.color;
		this.opacity = this.state.opacity;
		this.visible = this.state.visible;
	} catch (e) {}
}
google.maps.Polyline.prototype.getLength = function () {
	var d = 0;
	var path = this.getPath();
	var latlng;

	for (var i = 0; i < path.getLength() - 1; i++) {
		latlng = [path.getAt(i), path.getAt(i + 1)]
		d += latlng[0].distanceFrom(latlng[1]);
	}
	return d;
}
google.maps.Polyline.prototype.getVertex = function (i) {
	return this.getPath()
		.getAt(i);
}
google.maps.Polyline.prototype.getVertexCount = function () {
	return this.getPath()
		.getLength();
}
google.maps.Polyline.prototype.getVisible = function () {
	return (this.getMap()) ? true : false;
}
google.maps.Polyline.prototype.insertVertex = function (i, latlng) {
	this.getPath()
		.insertAt(i, latlng);
}

google.maps.Polyline.prototype.lastMap = false;

google.maps.Polyline.prototype.setVertex = function (i, latlng) {
	this.getPath()
		.setAt(i, latlng);
}

google.maps.Polyline.prototype.setVisible = function (visible) {
	if (visible === true && !this.getVisible()) {
		this.setMap(this.lastMap);
	} else if (visible === false && this.getVisible()) {
		this.lastMap = this.getMap();
		this.setMap(null);
	}
}