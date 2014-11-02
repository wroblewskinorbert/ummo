 /*
	ContextMenu v1.0
	
	A context menu for Google Maps API v3
	http://code.martinpearman.co.uk/googlemapsapi/contextmenu/
	
	Copyright Martin Pearman
	Last updated 21st November 2011
	
	developer@martinpearman.co.uk
	
	This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

	You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

function fzapiszEdycje() {
    var tmpId, tabId;
    var elementToSave = {};
    tabId = $('#dialogFirmyEdycja > input').each(function(ind, ele) {
        //	debugger;
        if (ele.id != 'firmaId')
            elementToSave[ele.id] = $(ele).val()
        else
            tmpId = $(ele).val();
    });
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

function edytujJuz(){
	impet.firmaEdycja.dialog('open');impet.firmaEdycja.getFB();
}


    var wiersz = function(x, tekst, typeOfInput) {
        var typeOfInput = typeOfInput || "text";
        return '<label for="' + x + '">' + tekst + '</label><input style="width:100%;" type="' + typeOfInput + '" id="' + x + '" /><br />'
    }
    
    var formularzFirma = '<input id="firmaId" type="hidden" />';
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
    formularzFirma += '<button onclick="impet.firmaEdycja.getFB();" id="anulujEdycje">Anuluj</button> <button onclick="fzapiszEdycje()" id="zapiszEdycje">Zapisz</button>';
    var firmyEdycja = $("<div id='dialogFirmyEdycja'></div>").appendTo(document.body).html(formularzFirma);
    Miasta.forEach(function(ele, ind) {
        $('#miejscowoscIdSelect').append($('<option value="' + ele.id + '">' + ele.nazwa + '</option>'))
		inicjuj();// inicjuje okregi na miastach wzgledem ludnosci
    })
    fb = impet.fb;
    
    firmyEdycja.getFB = function() {
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
    }
    firmyEdycja.dialog({
        minWidth: 400,
        autoOpen: false
    });
    
    impet.firmaEdycja = firmyEdycja;
    
    impet.edytujBiezaca = function() {
        impet.firmaEdycja.dialog('open');
        impet.firmaEdycja.getFB();
    }
    function ContextMenu(map, options) {
        options = options || {};
        
        this.setMap(map);
        
        this.classNames_ = options.classNames || {};
        this.map_ = map;
        this.mapDiv_ = map.getDiv();
        this.menuItems_ = options.menuItems || [];
        this.pixelOffset = options.pixelOffset || new google.maps.Point(10, -5);
    }
    function inicjuj(){
    ContextMenu.prototype = new google.maps.OverlayView();
    
    ContextMenu.prototype.draw = function() {
        if (this.isVisible_) {
            var mapSize = new google.maps.Size(this.mapDiv_.offsetWidth, this.mapDiv_.offsetHeight);
            var menuSize = new google.maps.Size(this.menu_.offsetWidth, this.menu_.offsetHeight);
            var mousePosition = this.getProjection().fromLatLngToDivPixel(this.position_);
            
            var left = mousePosition.x;
            var top = mousePosition.y;
            
            if (mousePosition.x > mapSize.width - menuSize.width - this.pixelOffset.x) {
                left = left - menuSize.width - this.pixelOffset.x;
            } else {
                left += this.pixelOffset.x;
            }
            
            if (mousePosition.y > mapSize.height - menuSize.height - this.pixelOffset.y) {
                top = top - menuSize.height - this.pixelOffset.y;
            } else {
                top += this.pixelOffset.y;
            }
            
            this.menu_.style.left = left + 'px';
            this.menu_.style.top = top + 'px';
        }
    };
    
    ContextMenu.prototype.getVisible = function() {
        return this.isVisible_;
    };
    
    ContextMenu.prototype.hide = function() {
        if (this.isVisible_) {
            this.menu_.style.display = 'none';
            this.isVisible_ = false;
        }
    };
    
    ContextMenu.prototype.onAdd = function() {
        function createMenuItem(values) {
            var menuItem = document.createElement('div');
            menuItem.innerHTML = values.label;
            if (values.className) {
                menuItem.className = values.className;
            }
            if (values.id) {
                menuItem.id = values.id;
            }
            menuItem.style.cssText = 'cursor:pointer; white-space:nowrap';
            menuItem.onclick = function() {
                google.maps.event.trigger($this, 'menu_item_selected', $this.position_, values.eventName);
            };
            return menuItem;
        }
        
        function createMenuSeparator() {
            var menuSeparator = document.createElement('div');
            if ($this.classNames_.menuSeparator) {
                menuSeparator.className = $this.classNames_.menuSeparator;
            }
            return menuSeparator;
        }
        var $this = this; //	used for closures
        
        var menu = document.createElement('div');
        if (this.classNames_.menu) {
            menu.className = this.classNames_.menu;
        }
        menu.style.cssText = 'display:none; position:absolute';
        
        for (var i = 0, j = this.menuItems_.length; i < j; i++) {
            if (this.menuItems_[i].label && this.menuItems_[i].eventName) {
                menu.appendChild(createMenuItem(this.menuItems_[i]));
            } else {
                menu.appendChild(createMenuSeparator());
            }
        }
        
        delete this.classNames_;
        delete this.menuItems_;
        
        this.isVisible_ = false;
        this.menu_ = menu;
        this.position_ = new google.maps.LatLng(0, 0);
        
        google.maps.event.addListener(this.map_, 'click', function(mouseEvent) {
            $this.hide();
        });
        
        this.getPanes().floatPane.appendChild(menu);
    };
    
    ContextMenu.prototype.onRemove = function() {
        this.menu_.parentNode.removeChild(this.menu_);
        delete this.mapDiv_;
        delete this.menu_;
        delete this.position_;
    };
    
    ContextMenu.prototype.show = function(latLng) {
        if (!this.isVisible_) {
            this.menu_.style.display = 'block';
            this.isVisible_ = true;
        }
        this.position_ = latLng;
        this.draw();
    };





    //################################################
    
    
    
    var directionsRendererOptions = {};
    directionsRendererOptions.draggable = false;
    directionsRendererOptions.hideRouteList = true;
    directionsRendererOptions.suppressMarkers = false;
    directionsRendererOptions.preserveViewport = false;
    var directionsRenderer = new google.maps.DirectionsRenderer(directionsRendererOptions);
    var directionsService = new google.maps.DirectionsService();
    
    var contextMenuOptions = {};
    contextMenuOptions.classNames = {
        menu: 'context_menu',
        menuSeparator: 'context_menu_separator'
    };

    //	create an array of ContextMenuItem objects
    //	an 'id' is defined for each of the four directions related items
    var menuItems = [];
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'directions_origin_click',
        id: 'directionsOriginItem',
        label: 'Directions from here'
    });
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'directions_destination_click',
        id: 'directionsDestinationItem',
        label: 'Directions to here'
    });
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'clear_directions_click',
        id: 'clearDirectionsItem',
        label: 'Clear directions'
    });
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'get_directions_click',
        id: 'getDirectionsItem',
        label: 'Get directions'
    });
    //	a menuItem with no properties will be rendered as a separator
    menuItems.push({});
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'zoom_in_click',
        label: 'Zoom in'
    });
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'zoom_out_click',
        label: 'Zoom out'
    });
    menuItems.push({});
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'center_map_click',
        label: 'Center map here'
    });
    contextMenuOptions.menuItems = menuItems;
    
    var contextMenu = new ContextMenu(map, contextMenuOptions);
    
    google.maps.event.addListener(map, 'rightclick', function(mouseEvent) {
        contextMenu.show(mouseEvent.latLng);
    });

    //	create markers to show directions origin and destination
    //	both are not visible by default
    var markerOptions = {};
    markerOptions.icon = 'http://www.google.com/intl/en_ALL/mapfiles/markerA.png';
    markerOptions.map = null;
    markerOptions.position = new google.maps.LatLng(0, 0);
    markerOptions.title = 'Directions origin';
    
    var originMarker = new google.maps.Marker(markerOptions);
    
    markerOptions.icon = 'http://www.google.com/intl/en_ALL/mapfiles/markerB.png';
    markerOptions.title = 'Directions destination';
    var destinationMarker = new google.maps.Marker(markerOptions);

    //	listen for the ContextMenu 'menu_item_selected' event
    google.maps.event.addListener(contextMenu, 'menu_item_selected', function(latLng, eventName) {
        switch (eventName) {
            case 'directions_origin_click':
                originMarker.setPosition(latLng);
                if (!originMarker.getMap()) {
                    originMarker.setMap(map);
                }
                break;
            case 'directions_destination_click':
                destinationMarker.setPosition(latLng);
                if (!destinationMarker.getMap()) {
                    destinationMarker.setMap(map);
                }
                break;
            case 'clear_directions_click':
                directionsRenderer.setMap(null);
                //	set CSS styles to defaults
                document.getElementById('clearDirectionsItem').style.display = '';
                document.getElementById('directionsDestinationItem').style.display = '';
                document.getElementById('directionsOriginItem').style.display = '';
                document.getElementById('getDirectionsItem').style.display = '';
                break;
            case 'get_directions_click':
                var directionsRequest = {};
                directionsRequest.destination = destinationMarker.getPosition();
                directionsRequest.origin = originMarker.getPosition();
                directionsRequest.travelMode = google.maps.TravelMode.DRIVING;
                
                directionsService.route(directionsRequest, function(result, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        //	hide the origin and destination markers as the DirectionsRenderer will render Markers itself
                        originMarker.setMap(null);
                        destinationMarker.setMap(null);
                        directionsRenderer.setDirections(result);
                        directionsRenderer.setMap(map);
                        //	hide all but the 'Clear directions' menu item
                        document.getElementById('clearDirectionsItem').style.display = 'block';
                        document.getElementById('directionsDestinationItem').style.display = 'none';
                        document.getElementById('directionsOriginItem').style.display = 'none';
                        document.getElementById('getDirectionsItem').style.display = 'none';
                    } else {
                        alert('Sorry, the map was unable to obtain directions.\n\nThe request failed with the message: ' + status);
                    }
                });
                break;
            case 'zoom_in_click':
                map.setZoom(map.getZoom() + 1);
                break;
            case 'zoom_out_click':
                map.setZoom(map.getZoom() - 1);
                break;
            case 'center_map_click':
                map.panTo(latLng);
                break;
        }
        if (originMarker.getMap() && destinationMarker.getMap() && document.getElementById('getDirectionsItem').style.display === '') {
            //	display the 'Get directions' menu item if it is not visible and both directions origin and destination have been selected
            document.getElementById('getDirectionsItem').style.display = 'block';
        }
    });
    
    
    var contextMenuOptions = {};
    contextMenuOptions.classNames = {
        menu: 'context_menu',
        menuSeparator: 'context_menu_separator'
    };

    //	create an array of ContextMenuItem objects
    //	an 'id' is defined for each of the four directions related items
    var menuItems = [];
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'change_position_click',
        id: 'setPositionItem',
        label: 'Change position'
    });
    //	menuItems.push({className:'context_menu_item', eventName:'directions_destination_click', id:'directionsDestinationItem', label:'Directions to here'});
    //	menuItems.push({className:'context_menu_item', eventName:'clear_directions_click', id:'clearDirectionsItem', label:'Clear directions'});
    //	menuItems.push({className:'context_menu_item', eventName:'get_directions_click', id:'getDirectionsItem', label:'Get directions'});
    //	a menuItem with no properties will be rendered as a separator
    menuItems.push({});
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'zoom_in_click',
        label: 'Zoom in'
    });
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'zoom_out_click',
        label: 'Zoom out'
    });
    menuItems.push({});
    menuItems.push({
        className: 'context_menu_item',
        eventName: 'center_map_click',
        label: 'Center map here'
    });
    contextMenuOptions.menuItems = menuItems;
    
    var contextMenuMarker = new ContextMenu(map, contextMenuOptions);

    // 	google.maps.event.addListener(map, 'dblclick', function(mouseEvent){
    // 		contextMenuMarker.show(mouseEvent.latLng);
    //		debugger;
    // 		mouseEvent.stop();
    // 	});
    impet.markerRightClicked = function(mouseEvent) {
        contextMenuMarker.show(mouseEvent.latLng);
    
    }


    //	listen for the ContextMenu 'menu_item_selected' event
    google.maps.event.addListener(contextMenuMarker, 'menu_item_selected', function(latLng, eventName) {
        switch (eventName) {
            case 'change_position_click':
                
                break;
            // 			case 'directions_destination_click':
            // 				destinationMarker.setPosition(latLng);
            // 				if(!destinationMarker.getMap()){
            // 					destinationMarker.setMap(map);
            // 				}
            // 				break;
            // 			case 'clear_directions_click':
            // 				directionsRenderer.setMap(null);
            // 				//	set CSS styles to defaults
            // 				document.getElementById('clearDirectionsItem').style.display='';
            // 				document.getElementById('directionsDestinationItem').style.display='';
            // 				document.getElementById('directionsOriginItem').style.display='';
            // 				document.getElementById('getDirectionsItem').style.display='';
            // 				break;
            // 			case 'get_directions_click':
            // 				var directionsRequest={};
            // 				directionsRequest.destination=destinationMarker.getPosition();
            // 				directionsRequest.origin=originMarker.getPosition();
            // 				directionsRequest.travelMode=google.maps.TravelMode.DRIVING;

            // 				directionsService.route(directionsRequest, function(result, status){
            // 					if(status===google.maps.DirectionsStatus.OK){
            // 						//	hide the origin and destination markers as the DirectionsRenderer will render Markers itself
            // 						originMarker.setMap(null);
            // 						destinationMarker.setMap(null);
            // 						directionsRenderer.setDirections(result);
            // 						directionsRenderer.setMap(map);
            // 						//	hide all but the 'Clear directions' menu item
            // 						document.getElementById('clearDirectionsItem').style.display='block';
            // 						document.getElementById('directionsDestinationItem').style.display='none';
            // 						document.getElementById('directionsOriginItem').style.display='none';
            // 						document.getElementById('getDirectionsItem').style.display='none';
            // 					} else {
            // 						alert('Sorry, the map was unable to obtain directions.\n\nThe request failed with the message: '+status);
            // 					}
            // 				});
            // 				break;
            case 'zoom_in_click':
                map.setZoom(map.getZoom() + 1);
                break;
            case 'zoom_out_click':
                map.setZoom(map.getZoom() - 1);
                break;
            case 'center_map_click':
                map.panTo(latLng);
                break;
        }
    // 		if(originMarker.getMap() && destinationMarker.getMap() && document.getElementById('getDirectionsItem').style.display===''){
    // 			//	display the 'Get directions' menu item if it is not visible and both directions origin and destination have been selected
    // 			document.getElementById('getDirectionsItem').style.display='block';
    // 		}
    });

}
