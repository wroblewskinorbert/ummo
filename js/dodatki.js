
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
// Object.defineProperty(google.maps.Polyline.prototype, 'visible', {
// 	set: function (x) {
// 		this.set('visible', x);
// 	},
// 	get: function () {
// 		return this.get('visible');
// 	},
// 	configurable: true
// });
google.maps.Polyline.prototype.deleteVertex = function (i) {
	this.getPath()
		.removeAt(i);
}
google.maps.Polyline.prototype.getBounds = function () {
	var minLat=90;
	var maxLat=-90;
	var minLng=180;
	var maxLng=-180;
	
	for (var x = 0; x < this.latLngs.j.length; x++) {
		var path = this.latLngs.j[x];
//debugger;
		for (var i = 0; i < path.j.length; i++) {
			var wsp=path.getAt(i);
			minLat=Math.min(minLat,wsp.lat());
			maxLat=Math.max(maxLat, wsp.lat());
			minLng=Math.min(minLng, wsp.lng());
			maxLng=Math.max(maxLng, wsp.lng());
		}
	}
	var latlngBounds = new google.maps.LatLngBounds(new google.maps.LatLng(minLat,minLng), new google.maps.LatLng(maxLat,maxLng));
	return latlngBounds;
}

google.maps.Polyline.prototype.storeState = function () {
	this.state = {
		weight: this.weight,
		color: this.color,
		opacity: this.opacity,
		visible: this.getVisible()
	}
}
google.maps.Polyline.prototype.restoreState = function () {
	try {
		this.weight = this.state.weight;
		this.color = this.state.color;
		this.opacity = this.state.opacity;
		this.setVisible (this.state.visible);
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
// google.maps.Polyline.prototype.getVisible = function () {
// 	return (this.getMap()) ? true : false;
// }
google.maps.Polyline.prototype.insertVertex = function (i, latlng) {
	this.getPath()
		.insertAt(i, latlng);
}

google.maps.Polyline.prototype.lastMap = false;

google.maps.Polyline.prototype.setVertex = function (i, latlng) {
	this.getPath()
		.setAt(i, latlng);
}

// google.maps.Polyline.prototype.setVisible = function (visible) {
// 	if (visible === true && !this.getVisible()) {
// 		this.setMap(this.lastMap);
// 	} else if (visible === false && this.getVisible()) {
// 		this.lastMap = this.getMap();
// 		this.setMap(null);
// 	}
// }


weatherLayer = new google.maps.weather.WeatherLayer({
   temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
});

cloudLayer = new google.maps.weather.CloudLayer();


function mapaStyl() {
	var style = [{
			featureType : 'all',
			elementType : 'all',
			stylers : [{
					saturation : 0
				}
			]
		}, {
			featureType : 'road.highway',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'road.arterial',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'road.local',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'administrative.country',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'administrative.province',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'administrative.locality',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'administrative.neighborhood',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'administrative.land_parcel',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'poi',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}, {
			featureType : 'transit',
			elementType : 'all',
			stylers : [{
					visibility : 'on'
				}
			]
		}
	];
	var styledMapType = new google.maps.StyledMapType(style, {
			map : map,
			name : 'Styled Map'
		});
	map.mapTypes.set('map-style', styledMapType);
	map.setMapTypeId('map-style');
}

function mapaStylWylacz() {
	var style = [{
			featureType : 'all',
			elementType : 'all',
			stylers : [{
					saturation : -50
				}
			]
		}, {
			featureType : 'road.highway',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'road.arterial',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'road.local',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'administrative.country',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'administrative.province',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'administrative.locality',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'administrative.neighborhood',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'administrative.land_parcel',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'poi',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}, {
			featureType : 'transit',
			elementType : 'all',
			stylers : [{
					visibility : 'off'
				}
			]
		}
	];
	var styledMapType = new google.maps.StyledMapType(style, {
			map : map,
			name : 'Styled Map'
		});
	map.mapTypes.set('map-style', styledMapType);
	map.setMapTypeId('map-style');
}

function przelaczPogode() {
	weatherLayer.setMap(weatherLayer.getMap() === map ? null : map);

}

function przelaczChmury() {
	cloudLayer.setMap(cloudLayer.getMap() === map ? null : map);

}


function utworzEtykieteNaMapie(tresc, position) {
	var myOptions = {
		content : tresc || 'etykieta',
		boxStyle : {
			border : "1px solid black",
			textAlign : "center",
			fontSize : "8pt",
			width : "150px",
			backgroundColor : 'rgba(255, 223, 223, 0.48)'
		},
		disableAutoPan : true,
		pixelOffset : new google.maps.Size(-75, 0),
		position : position || map.getCenter(),
		closeBoxURL : "",
		isHidden : false,
		pane : "mapPane",
		enableEventPropagation : true
	};

}


