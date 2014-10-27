var wiersz = function (x, tekst, typeOfInput) {
	var typeOfInput=typeOfInput||"text";
	return '<label for="' + x + '">' + tekst + '</label><input style="width:100%;" type="'+ typeOfInput+'" id="' + x + '" /><br />'
}

var formularzFirma = <input id="firmaId" type="hidden" />;
formularzFirma+= wiersz("nazwa","Nazwa firmy:");
formularzFirma+=wiersz("ulica","Ulica:");
formularzFirma+=wiersz("kod","Kod:");
formularzFirma+='<label for="miejscowoscIdSelect">Miejscowosc</label><br /><select id="miejscowoscIdSelect"></select><br />';
formularzFirma+=wiersz("email","E-mail");
formularzFirma+=wiersz("www","WWW");
formularzFirma+=wiersz("ocena","Ocena");
formularzFirma+=wiersz("priorytet","Priorytet");
formularzFirma+=wiersz("wspN","Wspolrzedna N: ");
formularzFirma+=wiersz("wspE","Wspolrzedna E: ");
var firmyEdycja=$("<div id='dialogFirmyEdycja'></div>").appendTo(document.body).html(formularzFirma);
Miasta.forEach(function(ele,ind){$('#miejscowoscIdSelect').append($('<option value="'+ele.id+'">'+ele.nazwa+'</option>'))})
firmyEdycja.dialog();

firmyEdycja.getFB(){
	$(firmyEdycja).find('#firmaId')=impet.fb.id;
	$('#nazwa').val(impet.fb.nazwa)
	$('#ulica').val(impet.fb.ulica)
	$('#kod').val(impet.fb.kod)
	$('#miejscowoscId').val(impet.fb.miejscowoscId)
	$('#email').val(impet.fb.email)
	$('#www').val(impet.fb.www)
	$('#ocena').val(impet.fb.ocena)
	$('#priorytet').val(impet.fb.priorytet)
	$('#wspN').val(impet.fb.wspN)
	$('#wspE').val(impet.fb.wspE)
}