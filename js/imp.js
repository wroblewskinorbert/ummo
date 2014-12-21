// Początek
var impet = {
	'firmy': [],
	map: {},
	users: [],
	user: {},
	settings: {}
};
impet.firmy.khId = [];
impet.settings = {
	center: '52.530217, 17.606964',
	zoom: 10,
	prevZoom: 11,
	ostatniaFirma: 1,
	lastUserId: 4
};
impet.settings = Object.create(impet.settings);
var google = google || {};

impet.draw = false;
impet.debug = true;
var panoramaOptions, map, panorama, geocoder, mapDiv, markerGeocoder, directionsDisplay, directionsService, markeryNazwa, Markero, $, window, document, nicEditor, alert, myNicEditor, myNicInstancePanel, zakreslacz, console, ib;
var nastepny, poprzedni, zapisz, localStorage, TrasyClass, Trasy, colorTab, kolejnyKolor, inter, history;
var trasy;
var zwrocWZakresie, display = {};
var serwer = 'http://192.168.2.220/'; //'http://localhost'; // document.location.origin;
//var serwer = 'http://213.92.139.215'; //'http://localhost'; // document.location.origin;
var serwer = 'http://localhost'; // document.location.origin;

impet.settings.lastUserId = localStorage.lastUserId || 4;
var loadedSett = JSON.parse(localStorage['impet' + impet.settings.lastUserId] || "{}");
$.extend(impet.settings, loadedSett);

impet._mapCreate = function () {
	var mapDiv = document.getElementById('mapCanvas'),
		lat = parseFloat(impet.settings.center.slice(0, impet.settings.center.indexOf(','))),
		lng = parseFloat(impet.settings.center.slice(impet.settings.center.indexOf(',') + 1));
	impet.map = new google.maps.Map(mapDiv, {
		disableDoubleClickZoom: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		minZoom: 6,
		maxZoom: 16,
		center: new google.maps.LatLng(lat, lng),
		zoom: impet.settings.zoom
	});
	if (impet.debug) {
		map = impet.map;
	}
	//		impet.deferredMap.resolve();
	$.get('obsluga.html', function (data) {
		$('#divObsluga')
			.html(data);
		$('#wczytajMiejscowosci')
			.click(function () {
				Trasy = new TrasyClass(trasy, impet.map);
			});

	}).done(function () {
		impet._ustawieniaWczytaj();
		impet._daneWczytaj();
	});
};

impet._daneWczytaj = function () {
	$.getJSON(serwer + '/ajax.php', {
		table: 'ImpetPracownicy'
	}).done(function (data) {
		var kto = $('<select id="wyborPracownika"></select>');
		data.forEach(function (ele) {
			impet.users[ele.id] = ele;
			if (ele.aktywny) {
				kto.append($('<option id="' + ele.id + '" value="' + ele.id + '">' + ele.inicjaly + '</option>'));
			}
		});
		$('#panel').append(kto);
		kto.on('change', function (e) {
			localStorage.impetSettingsLastUserId = e.currentTarget.value;
			var loadedSett = JSON.parse(localStorage['impet' + impet.settings.lastUserId] || "{}");
			$.extend(impet.settings, loadedSett);
			impet._ustawieniaWczytaj();
		});
		console.log('Pracwonicny wczytani');
		impet.user = impet.users[impet.settings.lastUserId];

		$.when(
			$.post(serwer + '/ajax.php', {
				table: 'PlMiejscowosci',
				condition: 'id=id',
				action: 'select',
				data: 0
			}, function (data) {
				impet.miejscowosc = data;
				impet.miejscowoscId = [];
				impet.miejscowosc.forEach(function (ele, ind, tab) {
					impet.miejscowoscId[ele.id] = ele;
				});
			}),
			$.post(serwer + '/ajax.php', {
				table: 'Firmy',
				condition: 'id=id',
				action: 'select',
				data: 0
			})
			.done(
				function (data) {
					impet.firmy.records = data;
				}
			),
			$.post(serwer + '/ajax.php', {
				table: 'FirmyV',
				condition: 'khId=khId',
				action: 'select',
				data: 0
			}, function (data) {
				data.forEach(function (ele, ind) {
					impet.firmy.khId[ele.khId] = ele;
				});
			})
		)
			.done(function (data) {
				var len = impet.firmy.records.length,
					firma;
				for (x = 0, len; x < len; x++) {
					firma = impet.firmy[impet.firmy.records[x].id] = new _Firma(impet.firmy.records[x]);
					firma.miejscowosc = impet.miejscowoscId[firma.miejscowoscId];
					if (firma.khId) {
						firma.kh = impet.firmy.khId[firma.khId];
					}
					firma.odcinki = {};
					projekcjaNaSiatke(firma);
				}
				impet.fb = impet.settings.ostatniaFirma;
				google.maps.event.trigger(impet.map, 'resize');
				window.markeryNazwa.draw();
				initialize();
			});
	});
};

impet._ustawieniaWczytaj = function () {
	$('input[store]').each(function (ind, ele) {
		if (ele.type === 'checkbox') {
			impet.settings[ele.id] = ele.checked = impet.settings[ele.id] || ele.defaultChecked;
		} else {
			impet.settings[ele.id] = ele.value = impet.settings[ele.id] || ele.defaultValue;
			$('#val' + ele.id).html(ele.value);
		}
	});
};
impet._ustawieniaZapisz = function () {
	impet.user = impet.users[$('#wyborPracownika').val()];
	localStorage['lastUserId'] = impet.settings.lastUserId;
	var sett = impet.settings; // {};
	$('input[store]').each(function (ind, ele) {
		if (ele.type == "checkbox") {
			sett[ele.id] = ele.checked;
		} else {
			sett[ele.id] = ele.value;
		}
	});
	localStorage['impet' + impet.settings.lastUserId] = JSON.stringify(sett);
};

$.getScript('./js/tabele.js');

window.markeryNazwa = {
	draw: function () {
		var that = this;
		if (impet.map.stopDraw)
			return;
		that.firmyWZakresie = zwrocWZakresie();
		var len = that.firmyWZakresie.length,
			x = 0;
		var rejected = zwrocWZakresie.rejected;
		var newPoints = zwrocWZakresie.new;
		$('#rejectedPoints').html("Odrzucone punkty: " + Object.getOwnPropertyNames(rejected).length);
		$('#newPoints').html("Dodane swiezo: " + newPoints.length);
		$('#allPoints').html("Wszystkich: " + len);
		for (x; x < len; x++) {
			var punkt = that.firmyWZakresie.pop();
			if (impet.settings.ogranicznikZoomu > impet.zoom || (!((punkt.ocena >= impet.settings.filtrOcena && punkt.priorytet >= impet.settings.filtrPriorytet))) || ((!punkt.khId && !impet.settings.wszyscy))) {
				//				that.odrzuconeHard.push(punkt);
				punkt.painted = false;
				if (punkt.getVisible())
					punkt.setVisible(false);
			} else {
				if (!punkt.getVisible() || punkt.painted != true) {
					punkt.setVisible(true);
					if (punkt.ocena * punkt.priorytet > 0)
						punkt.markerNazwa.setVisible(true);
				}
				punkt.painted = true;
			}
			if ((punkt.ocena + punkt.priorytet < 2) || impet.zoom < 12) {
				if (punkt.markerNazwa.getVisible()) {
					punkt.markerNazwa.setVisible(false);
				}
			} else {
				if ((punkt.ocena + punkt.priorytet > 0) && punkt.visible && impet.zoomChanged) {

					if (impet.zoom == 13) {
						if (Markero.iconName(0.65, 'black', punkt.nazwa).url != punkt.markerNazwa.icon.url)
							punkt.markerNazwa.setIcon(Markero.iconName(0.65, 'black', punkt.nazwa));
					} else if (impet.zoom == 14) {
						if (Markero.iconName(0.9, 'black', punkt.nazwa).url != punkt.markerNazwa.icon.url)
							punkt.markerNazwa.setIcon(Markero.iconName(0.9, 'black', punkt.nazwa));
					} else if (impet.zoom == 12) {
						if (Markero.iconName(0.5, 'black', punkt.nazwa).url != punkt.markerNazwa.icon.url)
							punkt.markerNazwa.setIcon(Markero.iconName(0.5, 'black', punkt.nazwa));
					} else if (impet.zoom > 14) {
						if (Markero.iconName(1.0, 'black', punkt.nazwa).url != punkt.markerNazwa.icon.url)
							punkt.markerNazwa.setIcon(Markero.iconName(1.0, 'black', punkt.nazwa));
					}
					//impet.zoomChanged=false;
				} else {

				}
				if (punkt.visible != punkt.markerNazwa.getVisible()) {
					punkt.markerNazwa.setVisible(punkt.visible);
				}
			}
		}
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
	};
}
var siatka = [100];
for (var x = 0; x < 100; x++) {
	siatka[x] = new Array(100);
	for (var y = 0; y < 100; y++) {
		siatka[x][y] = [];
	}
}

window.projekcjaNaSiatke = function projekcjaNaSiatke(obj) {
	var indeksy = translatePosition(obj.position);
	siatka[indeksy.latInd][indeksy.lngInd].push(obj);
};
window.zwrocWZakresie = function (bounds) {
	var bounds = bounds || map.getBounds();
	var latMin, latMax, lngMin, lngMax, sw, ne;
	sw = translatePosition(bounds.getSouthWest());
	ne = translatePosition(bounds.getNorthEast());
	latMin = Math.min(ne.latInd, sw.latInd);
	lngMin = Math.min(ne.lngInd, sw.lngInd);
	latMax = Math.max(ne.latInd, sw.latInd);
	lngMax = Math.max(ne.lngInd, sw.lngInd);
	var res = [];
	zwrocWZakresie.new = [];
	for (var latx = latMin; latx <= latMax; latx++) {
		for (var laty = lngMin; laty <= lngMax; laty++) {
			var komorka = siatka[latx][laty];
			if (komorka.length) {
				if (latx >= zwrocWZakresie.prevLatMin && latx <= zwrocWZakresie.prevLatMax && laty >= zwrocWZakresie.prevLngMin && laty <= zwrocWZakresie.prevLngMax) {
					komorka.forEach(function (el) {
						delete zwrocWZakresie.prevResult[el.id];
						res.push(el);
					});
				} else {
					komorka.forEach(function (el) {
						zwrocWZakresie.new.push(el);
						res.push(el);
					});
				}
			}
		}
	}
	zwrocWZakresie.rejected = zwrocWZakresie.prevResult;
	zwrocWZakresie.prevResult = {};
	res.forEach(function (el) {
		zwrocWZakresie.prevResult[el.id] = el;
	});

	zwrocWZakresie.prevLatMin = latMin;
	zwrocWZakresie.prevLatMax = latMax;
	zwrocWZakresie.prevLngMin = lngMin;
	zwrocWZakresie.prevLngMax = lngMax;
	return res;
};
zwrocWZakresie.prevLatMin = 0;
zwrocWZakresie.prevLatMax = 0;
zwrocWZakresie.prevLngMin = 0;
zwrocWZakresie.prevLngMax = 0;
zwrocWZakresie.rejected = {};
zwrocWZakresie.new = [];
zwrocWZakresie.prevResult = {};

function mapaZmienilaObszar() {

	impet.settings.center = impet.center = impet.map.getCenter().toUrlValue();
	impet.bounds = impet.map.getBounds();
	impet._ustawieniaZapisz();
	//	history.replaceState(impet.settings, 'zmiana', impet.fb.nazwa);
	markeryNazwa.draw();
}
$('body').on('change', 'input[store]', function (e) {
	impet._ustawieniaZapisz();
	switch (this.id) {
	case "ogranicznikWielkosci":
	case "wszyscy":
	case "rysowac":
	case "okragle":
		{
			impet.firmy.forEach(function (el) {
				if (el.myIcon.url != el.icon.url)
					el.set('icon', el.myIcon);
			});
			//markeryNazwa.draw();
			break;
		}
	}
	impet._ustawieniaWczytaj();
	markeryNazwa.draw();
});

function initialize() {
	impet._ustawieniaWczytaj();
	$('#wyborPracownika').val(impet.settings.lastUserId);

	map.addListener('zoom_changed', function (e) {
		impet.prevZoom = impet.settings.prevZoom = impet.settings.zoom;
		impet.zoom = impet.settings.zoom = impet.map.getZoom();
		impet.zoomChanged = true;
		$('span#zoomText').html(impet.zoom);
		impet._ustawieniaZapisz();
	});
	google.maps.event.trigger(map, 'zoom_changed');
	map.addListener('idle', mapaZmienilaObszar);

	$.getScript('./js/funkcje.js');
	//	debugger;
	ustawZdarzeniaObslugi();

	$.get('./js/TrasyClass.js').fail(function () {
		console.log('No niestety nie wczytało tras.')

	}).done(function (scri) {
		TrasyMake();
		trasy.wczytajIWyswietl();
	})

	myNicEditor = new nicEditor();
	var myNicInstance = myNicEditor.addInstance('firmaUwagi');
	myNicInstancePanel = myNicEditor.setPanel('firmaUwagiEditor');
	$('#firmaUwagi').blur(function () {
		$('.nicEdit-panelContain').hide();
	});
	$('#firmaUwagi').focus(function () {
		$('.nicEdit-panelContain').show();
	});
	$('.nicEdit-panelContain').hide();
	//	var myNicInstance = myNicEditor.addInstance('uwagi');
	//myPanel = myNicInstance.floatingPanel();
	//myNicInstance.floating.style.zIndex = 333;
	//*****************************************************************************************************************************************
}

function _Firma(record) {
	if (record.ocena === null)
		record.ocena = -1;
	if (record.priorytet === null)
		record.priorytet = -1;
	if (!record.wspN)
		record.wspN = 49.0000;
	if (!record.wspE)
		record.wspE = 19.5000;
	record.position = new google.maps.LatLng(record.wspN, record.wspE);
	this.setValues(record);
	this.set('visible', false);
	this.set('icon', this.myIcon);
	this.set('title', this.nazwa);
	var opt = {
		map: impet.map,
		clickable: true,
		title: this.nazwa,
		visible: false
	};
	Markero.call(this, opt);
	opt.clickable = false;
	this.markerNazwa = new Markero(opt); //google.maps.
	this.markerNazwa.bindTo('position', this);
	this.addListener('click', this.pokazInfoFirmy);
	this.addListener('rightclick', function (e) {
		if (!trasy.trasa)
			return;
		trasy.trasa.dodaj(this, trasy.trasa.opacity);
	});
}
_Firma.prototype = Object.create(Markero.prototype, {
	'key': {
		set: function (val) {
			var x = val;
		},
		get: function () {
			var res = this.get('position').toUrlValue();
			var comma = res.indexOf(',');
			res = (res.slice(0, comma) + '000000').slice(0, 9) + ',' + (res.slice(comma + 1) + '000000').slice(0, 9);
			return res;
		}
	},
	'positionFirmy': {
		set: function (val) {
			this.x = val;
			this.set('position', val);
		},
		get: function () {
			return this.get('position');
		}
	},
	'myIcon': {
		get: function () {
			var size;
			colorTab = ['4444', 'ff22', 'dd55', 'aa88', '88aa', '55dd', '22ff'],
			size = Number((this.ocena + 4) / 10).toFixed(2);
			if (this.ocena == -1) size = 0.7;
			colorTab[-1] = 'ffffff';
			var color = colorTab[this.priorytet] + '44';
			if (this.priorytet == -1) color = 'bababa';
			var scala = (impet.settings['ogranicznikWielkosci'] * 1.0 + 1) / 5;

			if (impet.settings.okragle) {
				return Markero.iconCircle(12 * size, '#' + color, scala);
			} else {
				return Markero.icon(size * scala, '#' + color, "");
			}
		}
	},
	'strokeColor': {
		get: function () {
			var colorTab = ['fff', 'fdd', 'fbb', 'f88', 'f66', 'f33', 'f00'];
			colorTab['-1'] = '#888';
			var color = colorTab[this.priorytet];
			return color;
		}
	},
	'fillColor': {
		get: function () {
			var colorTab = ['000', '030', '060', '080', '0b0', '0d0', '0f0'];
			colorTab['-1'] = 'ffffff';
			var color = '#' + colorTab[this.ocena];
			return color;
		}
	},
	'inView': {
		get: function () {
			return impet.map.getBounds().contains(this.position);
		}
	}
});

_Firma.prototype.pokazInfoFirmy = function (e) {
	if (!_Firma.infoWin) {
		_Firma.infoWin = new google.maps.InfoWindow({
			map: impet.map
		});
		_Firma.infoWin.addListener('closeclick', function () {
			ib.close();
		});
		impet.map.addListener('click', function () {
			if (_Firma.infoWin) {
				_Firma.infoWin.close();
				ib.close();
			}
		});
	}

	var content;
	var firma = this;
	impet.fb = firma.id;
	$.get('./firma.html')
		.done(function (content) {
			if (firma.email == null)
				firma.email = "";
			if (firma.www == null)
			;
			firma.www = "";
			if (firma.od == null)
			;
			firma.od = "";
			if (firma.do == null)
				firma.do = "";
			if (firma.email.indexOf('#')) {
				firma.email = firma.email.slice(0, firma.email.indexOf('#'));
			}
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
				if (firma.kh.ostatnia)
					ostatnia = firma.kh.ostatnia.date.slice(0, 10);
				if (firma.kh.obrot)
					obrot = firma.kh.obrot.slice(0, -5).replace(/(\d{3})$/g, '\.$1').replace(/(\d)(\d{3})\./g, '$1.$2.') + " zł";
				if (firma.kh.spoznienie) {
					spoznienie = firma.kh.spoznienie;
					if (spoznienie < -14) {
						var tmpSpozninie = spoznienie;
						spoznienie = '<span style="color:red;">' + spoznienie + '</span>';

						if (tmpSpozninie < -30) {
							spoznienie = '<b>' + spoznienie + '</b>';
						}
					}
				}
			}
			content = content.replace("{{ostatnia}}", ostatnia);
			content = content.replace("{{obrot}}", obrot);
			content = content.replace("{{spoznienie}}", spoznienie);
			_Firma.infoWin.set('content', content);
			_Firma.infoWin.close();
			_Firma.infoWin.open(impet.map, firma);
			_Firma.infoWin.close();
			_Firma.infoWin.open(impet.map, firma);
			if (Boolean(firma.uwagi) != false) {
				ib.open(impet.map, firma);
				ib.content_.innerHTML = firma.uwagi;
			} else {
				ib.content_.innerHTML = "";
				ib.close();
			}
		});
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////
Object.defineProperty(impet, 'fb', { ////////////////////////////////////    FB
	get: function () {
		return this.firmy[this._firmaId];
	},
	set: function (firmaId) {
		history.pushState(impet.settings, 'tak', '#' + impet.firmy[firmaId].nazwa.replace(' ', '_'));
		impet.setFb(firmaId);
		var firmaW = impet.firmy[firmaId];
	},
	enumerable: true,
	configurable: true
});

impet.setFb = function (firmaId) {
	impet.podsumowanieFirmy.last = {};
	this._firmaId = firmaId;
	impet.settings.ostatniaFirma = firmaId;
	impet._ustawieniaZapisz();
	var firmaW = impet.firmy[firmaId];
	impet._firmaWypiszPanel(firmaW);
	if (firmaW.ocena > -1) {
		$("#firmaOcenyDiv input:radio")[firmaW.ocena].checked = true;
	} else {
		if ($("#firmaOcenyDiv input:radio:checked").length) {
			$("#firmaOcenyDiv input:radio:checked")[0].checked = false;
		}
	}
	if (firmaW.priorytet > -1) {
		$("#firmaPriorytetDiv input:radio")[firmaW.priorytet].checked = true;
	} else {
		if ($("#firmaPriorytetDiv input:radio:checked").length) {
			$("#firmaPriorytetDiv input:radio:checked")[0].checked = false;
		}
	}
	try {
		$("#firmaOcenyDiv").buttonset("refresh");
		$("#firmaPriorytetDiv").buttonset("refresh");
	} catch (e) {

	};

};
var Zdarzenia = function (id, ile, callback) {
	var that = this;
	this.rec = [];
	this.html = "";
	var obj = {
		action: 'select',
		data: 0,
		condition: 'zdFirmaId=' + id + ' order by zdDataZak desc',
		table: 'zdarzenia'
	};
	$.get(serwer + '/ajax.php', obj)
		.done(function (data) {
			that.rec = data;
			if ($.isFunction(callback)) {
				callback.call(that, ile);
			}
		});

};
Zdarzenia.prototype.callback = function (ile) {
	var that = this;
	var zdarzeniaDiv = $('<div style="width: 90%; position:relative;"></div>');
	var recLength = ile || this.rec.length;
	recLength = Math.min(recLength, this.rec.length);
	$('#firmaZdarzenia').empty();

	for (var x = 0; x < recLength; x++) {
		var thatDiv = '<div id="zdarzenieOpis" style="border:solid black 0px ; box-shadow: 0px 0px 24px -12px rgba(211,211,211,0.3);border-radius:5px; background-color: rgba(222,222,222,0.3); margin:6px; min-height:30px; padding:4px;">' +
			'<div id="dataAndWhat" style="float:left;width:95px;"></div>' +
			'<div id="whoAndFinishd" style="float:right; width:50px;"></div>' +
			'<table><td><div id="opisZdarzenia" style=" ">&nbsp;</div></td></table></div>';
		thatDiv = $(thatDiv);
		var element = that.rec[x];
		switch (element.zdTyp) {
		case 1:

		case 0:
			element.typ = tablicaZnakow.telefon;
			break;
		case 10:
			element.typ = tablicaZnakow.wyjazd + tablicaZnakow.klepsydra;
			break;
		case 11:
			element.typ = tablicaZnakow.wyjazd + tablicaZnakow.zaliczone;
			break;
		case 12:
			element.typ = tablicaZnakow.wyjazd + tablicaZnakow.nieZaliczone;
			break;
		case 13:
			element.typ = tablicaZnakow.wyjazd + tablicaZnakow.niewiadomo;
			break;
		case 14:
			element.typ = tablicaZnakow.niewiadomo;
		}
		thatDiv.attr('title', element.zdDataZak.date.slice(0, 4));
		thatDiv.find('#dataAndWhat').append((element.zdDataZak.date.slice(5, 10)) + ' ' + element.typ);
		if (element.zdZakonczone) {
			element.zdZakonczone = tablicaZnakow.finished;
		} else {
			element.zdZakonczone = "";
		}
		thatDiv.find('#whoAndFinishd').append($(impet.users[element.zdWykonawcaId].inicialyKolor + ' ' + element.zdZakonczone));
		thatDiv.find('#opisZdarzenia').html(element.zdOpis);
		that.html = thatDiv.html();
		thatDiv.appendTo('#firmaZdarzenia');
	}
};

window.onpopstate = function (e) {
	impet.settings = (e.state);
	impet.map.setZoom(impet.settings.zoom);
	var lat = parseFloat(impet.settings.center.slice(0, impet.settings.center.indexOf(',')));
	var lng = parseFloat(impet.settings.center.slice(impet.settings.center.indexOf(',') + 1));
	impet.map.setCenter(new google.maps.LatLng(lat, lng));
	impet._ustawieniaWczytaj();
	impet._ustawieniaZapisz();
	impet.setFb(impet.settings.ostatniaFirma);
}; //zdarzenie zwiazane z historia
function spanData(dane) {
	var id = dane.id;
	//delete dane.id;
	var uwagi = dane.uwagi;
	delete dane.uwagi;
	var formularz = [];
	formularz.push('<form id=>');
	for (var x in dane) {
		formularz.push('<span name="' + x + '">' +
			x + ': ' + dane[x] + '</span>');
	}
	dane.uwagi = uwagi;
	$('#firmaUwagi').html(uwagi);
	formularz.push('</form>');
	var $formularz = $((formularz).join(""));
	return $formularz;
}

function wyswietlDaneFirmy() {
	$('#firmaDane').html(spanData(impet.fb.rekord));
}

function stworzFormularz(dane) {
	var formularz = [];
	formularz.push('<form>');
	for (var x in dane) {
		formularz.push('<input type="text" name="' + x + '" value="' + dane[x] + '">');
	}
	formularz.push('</form>');
	var $formularz = $((formularz).join(""));
	return $formularz;
}

function uzupelnijFormularz(formularz, dane) {}

function createFormForCompany() {
	var wiersz = function (x, tekst, typeOfInput) {
		var typeOfInput = typeOfInput || "text";
		return '<label for="' + x + '">' + tekst + '</label><input style="width:100%;" type="' + typeOfInput + '" id="' + x + '" /><br />'
	}
	var formularzFirma = '<form name="formularzFirma" style="width: 370px; float: left"><input id="firmaId" type="hidden" />';
	formularzFirma += wiersz("nazwa", "Nazwa firmy:");
	formularzFirma += wiersz("ulica", "Ulica:");
	formularzFirma += wiersz("kod", "Kod:");
	formularzFirma += '<label for="miejscowoscIdSelect">Miejscowosc</label><br /><select id="miejscowoscIdSelect"></select><br />';
	formularzFirma += wiersz("email", "E-mail");
	formularzFirma += wiersz("www", "WWW");
	formularzFirma += wiersz("ocena", "Ocena");
	formularzFirma += wiersz("priorytet", "Priorytet");
	formularzFirma += wiersz("wspN", "Wspolrzedna N: ");
	formularzFirma += wiersz("wspE", "Wspolrzedna E: ");
	formularzFirma += '</form><div id="uwagi" style="float: right; border: black 1px solid; margin: 10px 0px; max-width: 370px; font-size: 70%; width:45%;">' +
		'</div><div style="clear: both;margin: 10px;">' +
		'<p style="padding: 15px;"><button onclick="impet.firmaEdycja.getFB();" id="anulujEdycje">Anuluj</button> ' +
		'<button onclick="fzapiszEdycje()" id="zapiszEdycje">Zapisz</button></div></p>';
	window.firmyEdycja = $("<div id='dialogFirmyEdycja'></div>").appendTo(document.body).html(formularzFirma);
	impet.miejscowosc.forEach(function (ele, ind) {
		$('#miejscowoscIdSelect').append($('<option value="' + ele.id + '">' + ele.nazwa + '</option>'))
	});
	window.firmyEdycja.getFB = function () {
		$('#firmaId').val(impet.fb.id);
		$('#nazwa').val(impet.fb.nazwa);
		$('#ulica').val(impet.fb.ulica);
		$('#kod').val(impet.fb.kod);
		$('#miejscowoscIdSelect').val(impet.fb.miejscowoscId);
		$('#email').val(impet.fb.email);
		$('#www').val(impet.fb.www);
		$('#ocena').val(impet.fb.ocena);
		$('#priorytet').val(impet.fb.priorytet);
		$('#wspN').val(impet.fb.wspN);
		$('#wspE').val(impet.fb.wspE);
		$('#uwagi').html(impet.fb.uwagi);
		$('#address').val(impet.miejscowoscId[impet.fb.miejscowoscId].nazwa + ' ' + impet.fb.ulica);
	}
	window.firmyEdycja.dialog({
		minWidth: 400,
		maxWidth: 900,
		width: 800,
		autoOpen: false
	});

	function fzapiszEdycje() {
		var tmpId, tabId;
		var elementToSave = {};
		tabId = $('#dialogFirmyEdycja form > input').each(function (ind, ele) {
			//	debugger;
			if (ele.id != 'firmaId')
				elementToSave[ele.id] = $(ele).val();
			else
				tmpId = $(ele).val();
		});
		elementToSave['uwagi'] = $('#dialogFirmyEdycja #uwagi').html();
		var plain = {
			action: 'update',
			table: 'firmy',
			data: JSON.stringify(
				elementToSave
			),
			condition: 'id =' + tmpId
		};
		$.get(serwer + '/ajax/ajaxuniversal.php', plain);
	}
	impet.firmaEdycja = window.firmyEdycja;

	function edytujJuz() {
		window.firmyEdycja.dialog('open');
		window.firmyEdycja.getFB();
	}
	window.edytujJuz = edytujJuz;
}


var tablicaZnakow = {
	telefon: '<span style="font-size:1.6em;">☎</span>',
	telefonBialy: '<span style="font-size:1.6em;">☏</span>',
	zaliczone: '<span style="font-size:1.6em;color:green;">✔</span>',
	nieZaliczone: '<span style="font-size:1.6em;color:red;">✖</span>',
	niewiadomo: '<span style="font-size:1.6em;color:blue;">?</span>',
	list: '<span style="font-size:1.6em;">✉</span>',
	klepsydra: '<span style="font-size:1.6em;">⌛</span>',
	zegarek: '<span style="font-size:1.6em;">⌚</span>',
	olowek: '<span style="font-size:1.6em;">✏</span>',
	pioro: '<span style="font-size:1.6em;">✒</span>',
	wyjazd: "<img width='24' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAGLH901AAAABnRSTlMA/wD/AP83WBt9AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAC7klEQVR4nKVWTUhUURQ+waxa9UdEyEwoJRUoZbWosIKiAiOFINRdBCatwoTUokKnRSjVwnKiFi20TWAxUgsJzGhTKwfaFEZBGESREkS76bvv3Ll/77437+XHY97MPffc8/edcydTLpepggy/Bhvpa6ny48pcIOlaIfcUypTx6EAuJGRA6mB5esTW4f2dY9TcZauwxvi5QMBHjhykD6+sHRm1kU/XAseG6yPjwmr6syj1LAFWgR+faF2tLWDM3KVTw7YAhzy5KFbFUePddLSXBuq0GGELwewY4WGcL1JDixEHY21Orkp3o+JgPOig1iHhpD8+B1zMd48pP6914hQUlr7FKpSmaPSEtXJzv/isaRCckcVHWLvb6e9vUcP3L/x24J7OBk7F7twuyjXRng4rLRRk9PmQLJR2CWebFAFUrEd6xDNbEJyyYkDKj/UJmoWhuFWlDmHEpRW8enqZzk4kU0CgYBaApN36lUBhR5tUWJNNYAHOKKIi/eAIt3mkArIJ6nK9ucBVLMAZpj9VCqw61aPQv4l+fnEXocPt4lG48dmyU7DrJMmHymd3ChqXii5BVI21S3wGulg1awz0DNpyQNoBW02AyG8nRN9pBYZi68NO8blylSwwAsUDgvC5iVrUdSkMDCe4Z0KVxVJAlzrcZJh1TN0PaZE6ZgZS/WxAsIwCcp7Mu2NjuQY2bov7uSwD6MR7bdJ3Br6jNxFH96Q15FMbCB9tIspMCgNQwyDAcJ28JGeyCRC7fdTtihQG4P6jM27fmoBJtBAeVPv0nZSXGwXu98xYK4rsaBm+1b34TxYlh5xfZnGqZsMB4lB96zHAL3AAdxJfs0425t/oifz9o7iTgcUFWloIFOc8BfcYADAB1RD0AjypaaT6Q7T1MNXti9w2dZ1e3tZWU9QAOjxzi9fiCttyldZvlkM5nQEGLoLWfFwEwOv7+nt1A8jM9uOiNuEmCkP9Y/AbwP+d2r20oZ6yTZHT0QsM1+lhP/H+AYvTHj4n1sS+AAAAAElFTkSuQmCC'>",
	finished: '<span style="font-size:1.6em;color:blue;">☑</span>'
}

google.maps.event.addDomListener(window, 'load', impet._mapCreate); ///////////////// tu ustawienie punktu inicjalizacji