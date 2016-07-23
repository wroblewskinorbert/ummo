var google, escape, impet, serwer, x, $, console, window, document;

function znajdzDrogi(tablicaPunktow, index, mojX) {
	'use strict';
	// nie wieksza niż 10
	if (tablicaPunktow.length > 10) {
		throw new Error("Za długa tablica - max 10");
		//return tablicaPunktow;
	}

	var iloscPunktow = tablicaPunktow.length,
		waypoints = [],
		x,
		directionRequestObject,
		ostatnie5,
		odpowiedzOdDirSer,
		when5secFrom,
		delay;
	for (x = 1; x < tablicaPunktow.length - 1; x = x + 1) {
		waypoints.push({
			location: tablicaPunktow[x]
		});
	}
	directionRequestObject = {
		origin: tablicaPunktow[0],
		destination: tablicaPunktow.pop(),
		optimizeWaypoints: false,
		region: 'pl',
		travelMode: 'DRIVING'
	};
	directionRequestObject.waypoints = waypoints;
	znajdzDrogi.myDirSer = znajdzDrogi.myDirSer || new google.maps.DirectionsService();
	ostatnie5 = znajdzDrogi.ostatnie5 = znajdzDrogi.ostatnie5 || [$.now() - 4990, $.now() - 4990, $.now() - 4990, $.now() - 4990, $.now() - 4990];

	odpowiedzOdDirSer = function (dirResult, status) {
		console.log(status);
		if (status === 'OK') {
			var drogi = new Array(iloscPunktow - 1),
				legs = dirResult.routes[0].legs,
				encodeOdcinek,
				plain;
			legs.forEach(function (ele, ind) {
				var odcinek = index[mojX + ind];
				drogi[ind] = ele.steps.reduce(function (a, b) {
					return a.concat(b.path);
				}, []);
				encodeOdcinek = escape(google.maps.geometry.encoding.encodePath(drogi[ind]));
				if (odcinek.j.length === 2) {
					odcinek.clear();
					odcinek.j = drogi[ind];
					plain = {
						action: 'insert',
						table: 'odcinki',
						data: JSON.stringify({
							key1: odcinek.fromKey,
							key2: odcinek.toKey,
							data: encodeOdcinek
						}),
						condition: '1=1'
					};
					$.post(serwer + '/ajax/ajaxuniversal.php', plain);
				}
			});

		}
	};
	when5secFrom = Math.max(ostatnie5.shift(), $.now()) + 5100;
	ostatnie5.push(when5secFrom);
	delay = when5secFrom - 5100 - $.now();
	console.log(delay);
	window.setTimeout(function () {
		znajdzDrogi.myDirSer.route(directionRequestObject, odpowiedzOdDirSer);
	}, delay);
}

function przeliczTrase() {
	'use strict';
	var start = $('#selectable2').find('.start'),
		stop = $('#selectable2').find('.stop'),
		tmp = start,
		$waypoints,
		waypoints,
		waypts,
		result,
		req;
	if (start.index() > stop.index()) {
		start = stop;
		stop = tmp;
	}
	$waypoints = start.nextUntil(stop);
	waypoints = [];
	waypoints = $waypoints.map(function (ind, val) {
		return $(this)
			.data('id');
	});
	start = start.data('id');
	stop = stop.data('id');
	waypts = [];
	waypts = waypoints.map(function (ind, el) {
		result = {};
		result.location = impet.firmy[el].position;
		result.stopover = true;
		return result;
	});
	req = {
		origin: impet.firmy[start].position,
		destination: impet.firmy[stop].position,
		waypoints: waypts,
		optimizeWaypoints: true,
		travelMode: google.maps.TravelMode.DRIVING
	};
	window.directionsService.route(req, function (response, status) {
		if (status === google.maps.DirectionsStatus.OK) {
			window.directionsDisplay.setDirections(response);
		}
	});
}

function codeAddress() {
	'use strict';
	var address = document.getElementById('address').value,
		loc;
	window.geocoder.geocode({
		'address': address
	}, function (results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			loc = results[0].geometry.location;
			impet.map.setCenter(loc);
			window.markerGeocoder.setPosition(loc);
			window.markerGeocoder.setVisible(true);
			$('#address')
				.val(loc.lat()
					.toFixed(6) + ', ' + loc.lng()
					.toFixed(6));
			if (results[0]) {
				window.markerGeocoder.infoWin.setContent('<div><h4>' + results[0].formatted_address + '</h4></div>');
				window.markerGeocoder.infoWin.open(impet.map, window.markerGeocoder);
			}
		} else {
			window.alert('Odszukanie nie powiodło się!' + status);
		}
	});
}

function convertFromAccess(strToConvert) {
	'use strict';
	if (strToConvert) {
		return strToConvert.replace(/["\u0000"]/g, ['']).replace(/(\u0005\u0001)/g, "\u0105").replace(/(\u0007\u0001)/g, "ć").replace(/(\u0019\u0001)/g, "ę").replace(/(\u0042\u0001)/g, "ł").replace(/(\u0044\u0001)/g, "ń").replace(/(\u005b\u0001)/g, "ś").replace(/(\u007c\u0001)/g, "ż").replace(/(\u007a\u0001)/g, "ź").replace(/(\u0004\u0001)/g, "Ą").replace(/(\u0006\u0001)/g, "Ć").replace(/(\u0018\u0001)/g, "Ę").replace(/(\u0041\u0001)/g, "Ł").replace(/(\u0043\u0001)/g, "Ń").replace(/(\u005a\u0001)/g, "Ś").replace(/(\u007b\u0001)/g, "Ż").replace(/(\u0079\u0001)/g, "Ź").replace(/(\?)/g, "ó");
	}
}

impet.map.ustawSrodekPolska = function () {
	'use strict';
	impet.map.setCenter({
		lat: 52.09642,
		lng: 20.194868
	});
	impet.map.setZoom(7);
};

function wyczyscWszystkie() {
	'use strict';
	var punkty = window.zwrocWZakresie();
	punkty.forEach(function (ele) {
		ele.set('visible', false);
		ele.markerNazwa.set('visible', false);
	});
}



if (impet.debug) {
	console.log('Funkcje wczytane');
}