var google, map, impet;
// JavaScript Document
Object.defineProperty(Array.prototype, 'dlaWszystkich', {
	value: function (obj) {
		var keys = Object.getOwnPropertyNames(obj);
		for (var x = 0; x < this.length; x++) {
			try {
				this[x][keys[0]].apply(this[x], Array.prototype.slice.call((obj[keys[0]]), 0)); //(obj[keys[0]])); //Array.prototype.slice.call((obj[keys[0]]),0));
				//		this[x][keys[0]](obj[keys[0]])
			} catch (e) {
				console.log('nie udało się ukonać operacji na indexie: ' + x);
			}
		}
	},
	enumerable: false

});

function Markero(options) {
	debugger;

	Markero.markery.push(this);
	this.id = Markero.id++;
	this.__proto__.__proto__.constructor.call(this, options);
}

Markero.id = 0;
Markero.markery = [];

Markero.prototype = Object.create(google.maps.Marker.prototype, {
	
	setVisible1: {
		value: function (setTo, all) {

			if (all) {
				Markero.markery.forEach(function (ele) {
					if (typeof setTo === "undefined") {
						var setTo = !ele.__proto__.__proto__.getVisible.call(that);
					}
					ele.__proto__.__proto__.setVisible.call(this, setTo);
				});
			} else {
				if (typeof setTo === "undefined") {
					var setTo = !this.__proto__.__proto__.getVisible.call(this);
				}
				this.__proto__.__proto__.setVisible.call(this, setTo);
			}

		},
		enumerable: false
	}
});

Markero.prototype.constructor = Markero;

Markero.show = function () {
	Markero.markery.dlaWszystkich({
		set: ['visible', true]
	});
}
Markero.hide = function () {
	Markero.markery.dlaWszystkich({
		set: ['visible', false]
	});
}

Markero.toggle = (function () {
	var tog = true;
	return function () {
		Markero.markery.dlaWszystkich({
			set: ['visible', tog]
		});
		tog = !tog;
	}
})();

Markero.icon = function (skala, kolor, tekst) {
	var options = {
		skala: skala,
		kolor: kolor,
		tekst: tekst
	}
	return Markero.prototype.icon(options);
}

var optionsDefault = {
	skala: 1,
	kolor: 'red',
	tekst: '!'
}

Markero.prototype.icon = function (options) {
	var options = $.extend({}, optionsDefault, options);
	var skala, kolor, tekst
	skala = options.skala;
	kolor = options.kolor;
	tekst = options.tekst;
	var key = skala + '' + kolor + tekst;
	if (Markero.old[key]) {
		return Markero.old[key];
	} else if (localStorage.getItem('marker' + key)) {
		Markero.old[key] = JSON.parse(localStorage.getItem('marker' + key));
		return Markero.old[key];
	}
	var tsize = 14;
	var mojTekst = tekst || ' ';
	var kolor = kolor || 'red';
	var skala = skala || 1;
	var strokeColour = colourNameToHex(kolor) || kolor;
	strokeColour = '#' + ('000000' + (1 + 0xffffff - parseInt(strokeColour.slice(1), 16)).toString(16)).slice(-6); // a prosze negatyw

	skala *= 1;
	var szerokosc = Math.ceil(22 * skala);
	var wysokosc = Math.ceil(37 * skala);

	var can = $('<canvas width="400" height="400"></canvas>')
	can.translateCanvas({
		translateX: 200,
		translateY: 200
	})
		.scaleCanvas({
			x: 0,
			y: 0,
			scaleX: skala,
			scaleY: skala
		})
		.drawPath({
			strokeStyle: '#000',
			strokeWidth: 0.2,
			fillStyle: kolor,
			p1: {
				type: 'bezier',
				x1: 0,
				y1: 0, // Start point
				cx1: 0,
				cy1: -10, // Control point
				cx2: -10,
				cy2: -18, // Control point
				x2: -10,
				y2: -26, // Start/end point
			},
			p2: {
				type: 'arc',
				x: 0,
				y: -26,
				start: -90,
				end: 90,
				radius: 10
			},
			p3: {
				type: 'bezier',
				x2: 0,
				y2: 0, // Start point
				cx2: 0,
				cy2: -10, // Control point
				cx1: 10,
				cy1: -18, // Control point
				x1: 10,
				y1: -26, // Start/end point
			},

		})
		.drawText({
			name: 'text1',
			layer: true,
			strokeStyle: 'rgba(255,1,1,1)', //'#fff',
			fillStyle: strokeColour, //'#000', //
			strokeWidth: 0.1,
			x: 0,
			y: -25,
			baseline: 'middle',
			fontSize: tsize,
			fontFamily: 'Verdana',
			text: mojTekst,
			scale: 1,
			align: 'center',
			maxWidth: 18
		})
		.restoreCanvas()
	var ncan = $('<canvas width ="' + szerokosc + '" height = "' + wysokosc + '">');

	ncan.drawImage({
		layer: true,
		source: can[0],
		x: szerokosc / 2,
		y: wysokosc,

	});
	var iconTemp = {
		url: ncan.getCanvasImage()
	};

	Markero.marker.setIcon(iconTemp);
	var mvcObj = Markero.marker.getIcon();
	Markero.old[key] = mvcObj;
	try {
		localStorage['marker' + key] = JSON.stringify(mvcObj);
	} catch (e) {};
	return Markero.old[key];
}

Markero.iconName = function (skala, kolor, tekst) {
	var options = {
		skala: skala,
		kolor: kolor,
		tekst: tekst
	}
	return Markero.prototype.iconName(options);
}



Markero.prototype.iconName = function (options) {

	var options = $.extend({}, optionsDefault, options);
	var skala, kolor, tekst
	skala = options.skala;
	kolor = options.kolor;
	tekst = options.tekst;
	var key = skala + '' + kolor + tekst;
	if (Markero.old[key]) {
		return Markero.old[key];
	} else if (localStorage.getItem('marker' + key)) {
		Markero.old[key] = JSON.parse(localStorage.getItem('marker' + key));
		return Markero.old[key];
	}
	var tsize = 14;
	var mojTekst = tekst || ' ';
	var kolor = kolor || 'red';
	var skala = skala || 1;
	skala *= 1;


	var can = $('<canvas width="400" height="400"></canvas>')
	can.translateCanvas({
		translateX: 200,
		translateY: 200
	})
		.scaleCanvas({
			x: 0,
			y: 0,
			scaleX: skala,
			scaleY: skala
		})
		.drawText({
			name: 'text2',
			layer: true,
			strokeStyle: 'rgba(255,1,1,1)', //'#fff',
			fillStyle: '#000', //
			strokeWidth: 0,
			x: 0,
			y: 0,
			baseline: 'middle',
			fontSize: tsize,
			fontStyle: 'bold',
			fontFamily: 'Arial',
			text: mojTekst,
			scale: 1,
			align: 'center',
			maxWidth: 270 / skala
		});
	var width = can.measureText('text2')
		.width * skala;
	var height = can.measureText('text2')
		.height * skala;
	var ncan = $('<canvas width ="' + (width + 4) + '" height = "' + (height + 5) + '">');
	can.restoreCanvas();
	ncan.drawImage({
		layer: true,
		source: can[0],
		x: width / 2 + 4,
		y: height / 2,

	});
	var iconTemp = {
		url: ncan.getCanvasImage(),
		size: new google.maps.Size(Math.round((width + 4), 0), Math.round((height + 5), 0)),
		anchor: new google.maps.Point(Math.round((width + 4) / 2, 0), (-1) * Math.round((height + 5), 0))
	};
	Markero.marker.setIcon(iconTemp);
	var mvcObj = Markero.marker.getIcon();
	Markero.old[key] = mvcObj;
	if (impet.map.zoom == 12) {
		localStorage['marker' + key] = JSON.stringify(mvcObj);
	}
	return Markero.old[key];
}

Markero.iconCircle = function (promien, kolor, skala) {
	var options = {
		skala: skala,
		kolor: kolor,
		promien: promien
	}
	return Markero.prototype.iconCircle(options);
}
Markero.prototype.iconCircle = function (options) {
	var options = $.extend({}, optionsDefault, options);
	var skala, kolor, promien
	skala = options.skala;
	kolor = options.kolor;
	promien = options.promien;
	var key = promien + '' + kolor + skala;

	if (Markero.old[key]) {
		return Markero.old[key];
	} else if (localStorage.getItem('marker' + key)) {
		Markero.old[key] = JSON.parse(localStorage.getItem('marker' + key));
		return Markero.old[key];
	}
	var can = $('<canvas width="400" height="400"></canvas>')
	can.translateCanvas({
		translateX: 200,
		translateY: 200
	})
		.drawArc({
			strokeStyle: '#000',
			strokeWidth: 1 * skala,
			fillStyle: kolor,
			radius: promien * skala,
			start: 0,
			end: 360,
			//scale:skala
		});
	var szerokosc = 2 * promien * skala + 2 * skala + 1;
	var ncan = $('<canvas width ="' + szerokosc + '" height = "' + szerokosc + '">');
	can.restoreCanvas();
	ncan.drawImage({
		layer: true,
		source: can[0],
		x: szerokosc / 2,
		y: szerokosc / 2,
	});
	var iconTemp = {
		url: ncan.getCanvasImage(),
		size: new google.maps.Size(szerokosc, szerokosc),
		anchor: new google.maps.Point(Math.round(szerokosc / 2, 0), (1) * Math.round(szerokosc / 2, 0))
	};
	Markero.marker.setIcon(iconTemp);
	var mvcObj = Markero.marker.getIcon();
	Markero.old[key] = mvcObj;
	localStorage['marker' + key] = JSON.stringify(mvcObj);
	return Markero.old[key];
}

Markero.old = {};
Markero.marker = new Markero({
	map: map,
	position: {
		lat: 0.0001,
		lng: 0.001
	}
});

Markero.random = function (ile) {
	ile = ile || 100;
	var tab = [];
	while (ile--) {
		tab.push(new Markero({
			map: map,
			position: {
				lat: 49 + Math.random() * 5,
				lng: 15 + Math.random() * 8
			}
		}));
	}
	return tab;
}

// var boxText = document.createElement("div");
// boxText.style.cssText = "position:absolute; border: 1px solid black; margin-top: 8px; padding: 5px;";
var boxText = document.createElement("div");
boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: white; padding: 6px;";
boxText.innerHTML = "<div style=''>&nbsp;</div>";
InfoBox.myOptions = {
	content: boxText,
	disableAutoPan: false,
	maxWidth: 0,
	pixelOffset: new google.maps.Size(-140, 10),
	zIndex: null,
	boxStyle: {
		//background: "url('data:image/gif;base64,R0lGODlhkwAIAIABAAAAAAAAACH5BAUKAAEALAAAAACTAAgAAAIxjI+py+0Po5wUgYqz3rwnAHriSJYRiJrqymbo28byHLw2jeedzev+D+EJgcSiQcgrAAA7') no-repeat",
		//background:'white',
		opacity: 1,
		width: "280px",
	},
	closeBoxMargin: "10px 2px 2px 2px",
	closeBoxUrl: "data:image/gif;base64,R0lGODlhDgANAIAAAP///6CgpCH5BAAAAAAALAAAAAAOAA0AAAIfjI8Jy73mIoAzNErrs/se72Qdg4BjhnGnKo3tlsRGAQA7",
	infoBoxClearance: new google.maps.Size(1, 1),
	isHidden: false,
	pane: "floatPane",
	enableEventPropagation: false
};
var ib = new InfoBox(InfoBox.myOptions)
	//  ib.open(map, markerGeocoder);

Markero.prototype.CreateLabel = function (options) { //{map, content, position, hidden=false,}
	var options = options || {};
	options.content = options.content || 'Etykieta';
	options.position = options.position || map.getCenter();
	options.isHidden = options.hidden || false;
	options.boxStyle = {
		border: "1px solid black",
		textAlign: "center",
		fontSize: "8pt",
		width: "50px"
	}
	options.disableAutoPan = true;
	options.pixelOffset = new google.maps.Size(-25, 0);
	options.closeBoxURL = "";
	options.pane = "mapPane";
	options.enableEventPropagation = true;
	this.label = new InfoBox(options);
	Markero.prototype.CreateLabel.labels.push(this.label);
	this.label.id = Markero.prototype.CreateLabel.id++;
	return this.label.open(map);
}
Markero.prototype.CreateLabel.id = 0;
Markero.prototype.CreateLabel.labels = [];









function colourNameToHex(colour) {
	var colours = {
		"aliceblue": "#f0f8ff",
		"antiquewhite": "#faebd7",
		"aqua": "#00ffff",
		"aquamarine": "#7fffd4",
		"azure": "#f0ffff",
		"beige": "#f5f5dc",
		"bisque": "#ffe4c4",
		"black": "#000000",
		"blanchedalmond": "#ffebcd",
		"blue": "#0000ff",
		"blueviolet": "#8a2be2",
		"brown": "#a52a2a",
		"burlywood": "#deb887",
		"cadetblue": "#5f9ea0",
		"chartreuse": "#7fff00",
		"chocolate": "#d2691e",
		"coral": "#ff7f50",
		"cornflowerblue": "#6495ed",
		"cornsilk": "#fff8dc",
		"crimson": "#dc143c",
		"cyan": "#00ffff",
		"darkblue": "#00008b",
		"darkcyan": "#008b8b",
		"darkgoldenrod": "#b8860b",
		"darkgray": "#a9a9a9",
		"darkgreen": "#006400",
		"darkkhaki": "#bdb76b",
		"darkmagenta": "#8b008b",
		"darkolivegreen": "#556b2f",
		"darkorange": "#ff8c00",
		"darkorchid": "#9932cc",
		"darkred": "#8b0000",
		"darksalmon": "#e9967a",
		"darkseagreen": "#8fbc8f",
		"darkslateblue": "#483d8b",
		"darkslategray": "#2f4f4f",
		"darkturquoise": "#00ced1",
		"darkviolet": "#9400d3",
		"deeppink": "#ff1493",
		"deepskyblue": "#00bfff",
		"dimgray": "#696969",
		"dodgerblue": "#1e90ff",
		"firebrick": "#b22222",
		"floralwhite": "#fffaf0",
		"forestgreen": "#228b22",
		"fuchsia": "#ff00ff",
		"gainsboro": "#dcdcdc",
		"ghostwhite": "#f8f8ff",
		"gold": "#ffd700",
		"goldenrod": "#daa520",
		"gray": "#808080",
		"green": "#008000",
		"greenyellow": "#adff2f",
		"honeydew": "#f0fff0",
		"hotpink": "#ff69b4",
		"indianred ": "#cd5c5c",
		"indigo": "#4b0082",
		"ivory": "#fffff0",
		"khaki": "#f0e68c",
		"lavender": "#e6e6fa",
		"lavenderblush": "#fff0f5",
		"lawngreen": "#7cfc00",
		"lemonchiffon": "#fffacd",
		"lightblue": "#add8e6",
		"lightcoral": "#f08080",
		"lightcyan": "#e0ffff",
		"lightgoldenrodyellow": "#fafad2",
		"lightgrey": "#d3d3d3",
		"lightgreen": "#90ee90",
		"lightpink": "#ffb6c1",
		"lightsalmon": "#ffa07a",
		"lightseagreen": "#20b2aa",
		"lightskyblue": "#87cefa",
		"lightslategray": "#778899",
		"lightsteelblue": "#b0c4de",
		"lightyellow": "#ffffe0",
		"lime": "#00ff00",
		"limegreen": "#32cd32",
		"linen": "#faf0e6",
		"magenta": "#ff00ff",
		"maroon": "#800000",
		"mediumaquamarine": "#66cdaa",
		"mediumblue": "#0000cd",
		"mediumorchid": "#ba55d3",
		"mediumpurple": "#9370d8",
		"mediumseagreen": "#3cb371",
		"mediumslateblue": "#7b68ee",
		"mediumspringgreen": "#00fa9a",
		"mediumturquoise": "#48d1cc",
		"mediumvioletred": "#c71585",
		"midnightblue": "#191970",
		"mintcream": "#f5fffa",
		"mistyrose": "#ffe4e1",
		"moccasin": "#ffe4b5",
		"navajowhite": "#ffdead",
		"navy": "#000080",
		"oldlace": "#fdf5e6",
		"olive": "#808000",
		"olivedrab": "#6b8e23",
		"orange": "#ffa500",
		"orangered": "#ff4500",
		"orchid": "#da70d6",
		"palegoldenrod": "#eee8aa",
		"palegreen": "#98fb98",
		"paleturquoise": "#afeeee",
		"palevioletred": "#d87093",
		"papayawhip": "#ffefd5",
		"peachpuff": "#ffdab9",
		"peru": "#cd853f",
		"pink": "#ffc0cb",
		"plum": "#dda0dd",
		"powderblue": "#b0e0e6",
		"purple": "#800080",
		"red": "#ff0000",
		"rosybrown": "#bc8f8f",
		"royalblue": "#4169e1",
		"saddlebrown": "#8b4513",
		"salmon": "#fa8072",
		"sandybrown": "#f4a460",
		"seagreen": "#2e8b57",
		"seashell": "#fff5ee",
		"sienna": "#a0522d",
		"silver": "#c0c0c0",
		"skyblue": "#87ceeb",
		"slateblue": "#6a5acd",
		"slategray": "#708090",
		"snow": "#fffafa",
		"springgreen": "#00ff7f",
		"steelblue": "#4682b4",
		"tan": "#d2b48c",
		"teal": "#008080",
		"thistle": "#d8bfd8",
		"tomato": "#ff6347",
		"turquoise": "#40e0d0",
		"violet": "#ee82ee",
		"wheat": "#f5deb3",
		"white": "#ffffff",
		"whitesmoke": "#f5f5f5",
		"yellow": "#ffff00",
		"yellowgreen": "#9acd32"
	};

	if (typeof colours[colour.toLowerCase()] != 'undefined')
		return colours[colour.toLowerCase()];

	return false;
}