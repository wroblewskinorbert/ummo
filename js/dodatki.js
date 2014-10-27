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

layer = new google.maps.FusionTablesLayer({
		//map: map,
		heatmap : {
			enabled : false
		},
		query : {
			select : "col11>>0",
			from : "1zhJDgZ1lzvTyG7D1uHvi0_LMfrzCVx0-rvAW9h8",
			where : ""
		},
		options : {
			styleId : 3,
			templateId : 3
		},
		suppressInfoWindows : true
	});
layer_1 = new google.maps.FusionTablesLayer({
		query : {
			select : "col11>>1",
			from : "1zhJDgZ1lzvTyG7D1uHvi0_LMfrzCVx0-rvAW9h8"
		},
		// map: map,
		styleId : 2,
		templateId : 2
	});


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
	var ibLabel = new InfoBox(myOptions);
	ibLabel.open(map);
	return ibLabel;
}