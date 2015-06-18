var impet, google, serwer, escape, unescape, znajdzDrogi, $, trasy, Markero, zakreslacz, inter, kolejnyKolor, map, wyswietlDaneFirmy, convertFromAccess;

function TrasaShow(trasa) {
	'use strict';
	var odcinek, 
	that = trasa, 
	paths, 
	x, 
	thisPoint, 
	toPoint, 
	toKey, 
	fromKey, 
	obj;
	that.condition = [];
	that.punkty = trasa.getArray(); //new google.maps.MVCArray(punkty);
	that.odcinki = [];
	that.path = [];
	that.poly = new google.maps.Polyline({
		map: impet.map,
		strokeWeight: (trasa.opacityDiv) * (trasa.opacityDiv - 0.06) * 39 + 2,
		strokeOpacity: 2 * trasa.opacity * trasa.opacity,
		strokeColor: '#' + impet.users[trasa.zdWykonawcaId].kolor.slice(0, 3)
	});
	paths = that.poly.latLngs;
	for (x = 0; x < that.punkty.length - 1; x = x + 1) {
		thisPoint = that.punkty[x];
		toPoint = that.punkty[x + 1];
		toKey = toPoint.pointKey;
		fromKey = thisPoint.pointKey;
		if (!thisPoint.odcinkiOdPunktu[toKey]) {
			odcinek = thisPoint.odcinkiOdPunktu[toKey] = new google.maps.MVCArray();
			odcinek.push(thisPoint.position);
			odcinek.push(toPoint.position);
			that.condition.push(" key1='" + fromKey + "' AND key2='" + toKey + "'");
		} else {
			odcinek = thisPoint.odcinkiOdPunktu[toKey];
		}
		paths.setAt(x, odcinek);
		odcinek.fromKey = fromKey;
		odcinek.toKey = toKey;
	}
	that.path = paths.getArray().slice();
	
	if (that.condition.length < 1) {
		return;
	}
	obj = {
		action: 'select',
		table: 'Odcinki',
		data: 0,
		condition: that.condition.join(" or ")
	};
	$.getJSON(serwer + '/ajax.php', obj, 
	function(odcinki) {
		if (odcinki.length > 0) {
			odcinki.forEach(
			function(ele, ind) {
				var fromPointFirma = that.punkty.filter(function(element, ind) {
					if (element.firma.key === ele.key1 && element.firma.odcinki[ele.key2]) {
						that.index = ind;
						return (element.firma.key === ele.key1 && element.firma.odcinki[ele.key2]);
					}
				}), 
				odcinek;
				if (!fromPointFirma) {
					return;
				}
				fromPointFirma = fromPointFirma[0].firma.odcinki;
				//sessionStorage.setItem(ele.key1 + ';' + ele.key2, ele.data);
				odcinek = google.maps.geometry.encoding.decodePath(unescape(ele.data));
				fromPointFirma[ele.key2].clear();
				fromPointFirma[ele.key2].j = odcinek;
				that.path[that.index] = undefined;
				return;
			}
			);
		}
		var tab = [], 
		x = 0, 
		y, 
		tab2 = [];
		tab.tras = that;
		for (x; x < that.path.length; x) {
			y = 0;
			tab2 = [];
			if (!that.path[x] || that.path[x].j.length !== 2) {
				x = x + 1;
				continue;
			}
			for (y; y < 9; y = y + 1) {
				if (!that.path[x]) {
					break;
				}
				if (y === 0) {
					(tab2.push(that.path[x].j[0]));
				}
				tab2.push(that.path[x].j[1]);
				if (!tab2.index) {
					tab2.index = that.path;
					tab2.x = x;
				}
				x = x + 1;
				if (!(x < that.path.length)) {
					break;
				}
			}
			if (tab2.length > 0) {
				znajdzDrogi(tab2, tab2.index, tab2.x);
			}
		}
		that.poly.setVisible(false);
		that.poly.setVisible(true);
	});
}

function TrasyMake() {
	var newId = -1;
	var punktNewId = -1;
	
	function TrasyClass() {
		var that = this;
		this.trasyId = [];
		this.odKiedy = new Date('2014-03-01');
		this.odKiedy2 = '2014-05-01';
	}
	window.TrasyClass = TrasyClass;
	TrasyClass.prototype = new google.maps.MVCObject();
	TrasyClass.prototype.constructor = TrasyClass;
	
	TrasyClass.prototype.wczytaj = function() {
		var that = this;
		return $.post(serwer + '/ajax/trasy.php', {
			id: '2014-06-01'
		});
	};
	TrasyClass.prototype.wyswietl = function(czySkasowacStare) {
		panel.przelacz(true);
		var that = this;
		if (czySkasowacStare) {
			this.trasyId = [];
		}
		var listaTras = "<ol id='selectable'>";
		for (var x = 0; x < this.tblTrasy.length; x++) {
			var trasa = this.tblTrasy[x];
			if (!that.trasyId[trasa.id]) {
				that.trasyId[trasa.id] = new Trasa(trasa);
				
				if (!(trasa.zdWykonawcaId * 1)) {
					trasa.zdWykonawcaId = impet.user.id;
				}
			}
			listaTras += "<li data-id='" + trasa.id + "'><span style=\'float:right;\'>" + impet.users[trasa.zdWykonawcaId].inicialyKolor + "<br /><span title=\'" + trasa.kiedy.slice(0, 4) + "\'>" + trasa.kiedy.slice(5, 10) + "</span></span>" + trasa.opis + "</li>";
		}
		
		panelTrasy.html(listaTras);
		$("#selectable")
		.off('mouseleave mouseenter')
		.on('mouseenter', 'li', function(e) {
			$(this)
			.addClass('aktywny');
			var trasaId = $(this)
			.data('id');
			if (trasy.trasyId[trasaId].poly) {
				var poly = trasy.trasyId[trasaId].poly;
				poly.storeState();
				poly.color = 'red';
				poly.weight = 6;
			}
		})
		.on('mouseleave', 'li', function(e) {
			$(this)
			.removeClass('aktywny');
			var trasaId = $(this)
			.data('id');
			/*if (!trasy.trasyId[trasaId]) {
						trasy.trasyId[trasaId] = new Trasa();
					}; */
			if (trasy.trasyId[trasaId].poly) {
				var poly = trasy.trasyId[trasaId].poly;
				poly.restoreState();
			}
		})
		.selectable({
			filter: "li"
		})
		.on("selectableselected", function(event, ui) {
			trasy.trasyId[($(ui.selected).data('id'))].show();
			event.stopImmediatePropagation();
		})
		.on("selectableunselected", function(event, ui) {
			var sel = ui.unselected;
			trasy.trasyId[$(sel).data('id')].hide();
		
		})
		.on("selectablestart", function(event, ui) {
			if (!event.ctrlKey) {
				trasy.bounds = new google.maps.LatLngBounds();
			}
		});
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
	TrasyClass.prototype.nowaTrasa = function(opis, kiedy, kto) { // opis bez polskich znakow koniecznie
		//debugger
		var that = this;
		var opis = opis || 'Brak opisu';
		var kiedy = kiedy || '2024-01-01';
		var kto = kto || 4;
		var quer = "kto=" + kto + "&kiedy=" + kiedy + "&opis=%27" + encodeURIComponent(opis) + "%27";
		$.post(serwer + "/ajax/trasyInsert.php/?" + quer).done(function(data) {
			data = data[0];
			var trasaStart = {
				id: data.zdId,
				kiedy: data.zdDataZak,
				zdWykonawcaId: data.zdWykonawcaId,
				kto: impet.users[data.zdWykonawcaId],
				opis: data.zdOpis,
				utworzono: data.zdDataUtw,
				zakonczone: false
			}
			that.tblTrasy.unshift(trasaStart);
			that.wyswietl();
		});
	};
	
	TrasyClass.prototype.wczytajIWyswietl = function() {
		var that = this;
		this.wczytaj()
		.done(function(data) {
			data.forEach(function(ele) {
				ele.opis = convertFromAccess(ele.opis)
			});
			that.tblTrasy = data;
			panelTrasy.dataPrzedzial = $.now() - Date.parse(that.odKiedy);
			that.wyswietl();
		});
	};
// 		TrasyClass.prototype.nowaTrasa = function (opis) {
// 				var trasaStart = {
// 					id: newId--,
// 					kiedy: new Date(),
// 					zdWykonawcaId: impet.settings.lastUserId,
// 					kto: impet.user,
// 					opis: opis,
// 					utworzono: new Date(),
// 					zakonczone: false
// 				};
// 				trasaStart.kiedy.date = trasaStart.kiedy.toJSON();
// 				this.trasa = new Trasa(trasaStart);
// 				this.trasa.aktualnaPozycja = 0;
// 				panel.przelacz(false);
// 				this.trasa.show();
// 				this.trasa.edytuj();
// 			};
	function Trasa(trasa) {
		var that = this;
		this.kolejnosc = 0;
		var opacityDiv = ($.now() - new Date(trasa.kiedy).getTime()) / panelTrasy.dataPrzedzial;
		if (opacityDiv > 1) {
			opacityDiv = 1;
		}
		if (opacityDiv < 0) {
			opacityDiv = 0;
		}
		var opacity = 1 - opacityDiv * 0.85;
		this.opacity = (opacity);
		this.opacityDiv = opacityDiv;
		google.maps.MVCArray.call(this, []);
		this.setValues(trasa);
		this.wczytajPunkty2(true);
		that.changeOrder = false;
	}
	;
	Trasa.prototype = new google.maps.MVCArray();
	Trasa.prototype.constructor = Trasa;
	
	Trasa.prototype.wczytajPunkty2 = function(hide) {
		var that = this;
		$.post(serwer + '/ajax/tblTrasyPunktyShort.php', {
			id: this.get('id')
		}).done(function(data, status, xmljso) {
			that.clear();
			data.forEach(function(ele, ind) {
				that.push(new Punkt(ele, ind, that.opacity, hide, that));
			});
			that.set('loaded', true);
			if (!hide)
				that.show();
		});
	};
	
	Trasa.prototype.hide = function() {
		this.forEach(function(el, ind) {
			if (el.marker) {
				el.marker.setVisible(false);
			}
		});
		if (this.poly) {
			this.poly.setMap(null);
		}
	};
	
	Trasa.prototype.show = function() {
		var that = this;
		if (!this.get('loaded')) {
			that.wczytajPunkty2();
			return;
		}
		this.forEach(function(el, ind) {
			if (that.changeOrder) {
				$.post(serwer + '/ajax/tblPunktyUpdateKolejnosc.php/', {
					id: el.trasaId,
					kolejnosc: (ind + 1)
				});
			}
			el.marker.setIcon(Markero.icon($('#ogranicznikWielkosciOdwiedzin').val(), '#' + el.kto.kolor, ind + 1));
			el.marker.notify('icon');
			el.marker.setVisible(true);
			el.marker.set('map', impet.map);
		});
		this.changeOrder = false;
		
		if (!that.poly || !that.poly.latLngs.length) {
			this.drogaNaMapie = TrasaShow(that);
		} //else {
		this.poly.setMap(map);
		if ($('#przyciagajDoTrasy:checked').length) {
			impet.map.fitBounds(that.poly.getBounds());
		}
	};
	
	Trasa.prototype.dodaj = function(firma, opacity) {
		var that = this;
		var kolejnosc = this.getLength();
		var quer = ["kto=", this.zdWykonawcaId, "&trasaId=", this.id, "&frmId=", firma.id, "&kolejnosc=", kolejnosc, "&opis=brak&kiedy=", encodeURIComponent(this.kiedy.slice(0, 10))].join('');
		$.post(serwer + "/ajax/trasyPunktInsert.php/?" + quer).done(
		function(data) {
			data = data[0];
			var ind = that.getLength();
			var ele = {
				trasaId: data.zdId,
				firmaId: data.zdFirmaId,
				kiedy: data.zdDataZak,
				kolejnosc: data.zdKolejnosc,
				kto: data.zdWykonawcaId,
				zakonczone: data.zdZakonczone,
				zdRodzicNabyty: data.zdRodzicNabyty
			};
			var punkt = new Punkt(ele, ind, that.opacity, false, that);
			var prev, next, min = Infinity, 
			ind;
			if (that.getLength() > 1) {
				for (var count = 0; count < that.getLength() - 1; count++) {
					that.tprev = that.getAt(count);
					that.tnext = that.getAt(count + 1);
					var temp = google.maps.geometry.spherical.computeDistanceBetween(that.tprev.firma.position, punkt.firma.position);
					temp += google.maps.geometry.spherical.computeDistanceBetween(that.tnext.firma.position, punkt.firma.position);
					if (temp < min) {
						min = temp;
						next = that.tnext;
						prev = that.tprev;
						ind = count;
					}
				}
				that.insertAt(ind, punkt);
			} else {
				that.push(punkt);
			}
			;
			that.edytuj();
		});
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
			result += '<li data-trasaid="' + element.id + '" data-id="' + element.firmaId + '" class=\"ui-widget-content\">&nbsp;' + element.kolejnosc + '. <b  class="nazwaNaLiscie" title=\"' + element.kiedy.toJSON().slice(0, 10) + '\">' + element.firma.nazwa + '</b>  <span style=\"float:right;display:inline-block;\"><i title=\"' + element.firma.ulica + '\">' + element.firma.miejscowosc.nazwa + '</span></i></li>';
		});
		result += '</ol>';
		return result;
	};
	Trasa.prototype.zakreslacz = new google.maps.Marker({
		map: impet.map,
		icon: {
			fillOpacity: 0,
			path: google.maps.SymbolPath.CIRCLE,
			scale: 15,
			strokeWeight: 4,
			strokeColor: "red"
		}
	});
	window.zakreslacz = Trasa.prototype.zakreslacz;
	//if (typeof inter !== 'undefined') {}
	console.count('setInterval');
	inter = setInterval(function() {
		zakreslacz.icon.strokeColor = '#' + kolejnyKolor(64).toString(16);
		zakreslacz.notify('icon');
	}, 100);
	kolejnyKolor = (function() {
		var x = 0;
		return function(skok) {
			if (x > 255) {
				x = -255;
			}
			var y = x;
			if (y < 0) {
				y = y * -1;
			}
			var kolor = (((255 << 8) + y) << 8) + y;
			x += skok;
			return kolor;
		};
	})();
	
	Trasa.prototype.edytuj = function() {
		var that = this;
		Trasa.prevIndex = 1;
		panelTrasa.html(this.listaHTML());
		var sort = $('#selectable2')
		.sortable({
			placeholder: "ui-state-highlight",
			revert: true,
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
				.index());
				//that.insertAt(index);
				that.lastIndex = $(ui.placeholder)
				.index();
			},
			stop: function(event, ui) {
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
				.index());
				trasy.trasa.poly.latLngs.clear();
				trasy.trasa.punkty.forEach(function(el) {
					el.marker.set('map', null);
				});
				that.changeOrder = true;
				trasy.trasa.show();
				trasy.trasa.edytuj();
			}
		})
		.disableSelection()
		.on('mouseenter', 'li', function(e) {
			var firmaId = $(this)
			.data('id');
			zakreslacz.setVisible(true);
			var firma = impet.firmy[firmaId];
			if (firma.positionFirmy) {
				zakreslacz.set('position', firma.positionFirmy);
			}
			
			var trasaId = $(this)
			.data('trasaid');
			trasy.trasa.forEach(function(el) {
				if (el.id == trasaId && el) {
					el.marker.set('animation', 1);
				}
			});
		})
		.on('mouseleave', 'li', function(e) {
			zakreslacz.setVisible(false);
			var trasaId = $(this)
			.data('trasaid');
			trasy.trasa.forEach(function(el) {
				if (el.id == trasaId && el) {
					el.marker.set('animation', null);
				}
			});
		})
		.on('dblclick', 'li', function(e) {
			var firmaId = $(this)
			.data('id');
			var firma = impet.firmy[firmaId];
			firma.setDraggable(!firma.getDraggable());
			debugger;
			impet.fb = firma.id;
			wyswietlDaneFirmy();
		})
		.on('click', 'li', function(e) {
			var firmaId = $(this)
			.data('id');
			var firma = impet.firmy[firmaId];
			map.panTo(firma.positionFirmy);
			var zoom = map.getZoom();
		});
	};
	
	function Punkt(element, ind, opacity, hide, trasa) {
		var that = this;
		opacity = opacity || 1;
		element.kiedy = new Date(element.kiedy);
		this.setValues(element);
		this.firma = impet.firmy[this.firmaId];
		this.pointKey = this.firma.key;
		this.position = this.firma.position;
		this.odcinkiOdPunktu = this.firma.odcinki;
		this.kto = impet.users[this.kto];
		var color = '#' + this.kto.kolor;
		this.kto = this.kto || impet.users[4];
		this.kolejnosc = ind + 1;
		this.markerOptions = {
			map: impet.map,
			visible: true,
			zIndex: 20000,
			icon: Markero.icon($('#ogranicznikWielkosciOdwiedzin').val(), '#' + this.kto.kolor.slice(0, 3), ind + 1)
		};
		this.marker = new Markero(this.markerOptions);
		this.marker.addListener('rightclick', impet.markerRightClicked);
		if (hide) {
			this.marker.set('visible', false);
		}
		this.marker.bindTo('position', this.firma.markerNazwa);
		this.marker.setOpacity(opacity);
	}
	Punkt.prototype = new google.maps.MVCObject();
	Punkt.prototype.constructor = Punkt;
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
	});
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
		//trasy.trasa.wczytajPunkty
		(function() {
			$(tmpLi)
			.addClass('ui-effects-transfer')
			.effect("transfer", {
				to: $('#trasaOpis')
				.eq(0)
			}, 1500, function() {
				$('#trasaOpis')
				.addClass('ui-effects-transfer');
				window.setTimeout(function() {
					$('#trasaOpis')
					.removeClass('ui-effects-transfer', 1000, 'easeInQuint');
				}, 1000);
			});
			panel.przelacz(false);
			trasy.trasa.edytuj();
		})();
		e.stopImmediatePropagation();
		e.preventDefault();
	
	});
	panelTrasa.on('contextmenu', function(e) {
		panel.przelacz(true);
		e.stopImmediatePropagation();
		e.preventDefault();
	});
	trasy.panel = panel;
	window.Trasa = Trasa;
}

console.log('Trasy wczytane');
