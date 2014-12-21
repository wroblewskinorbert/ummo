

var SpisFaktur = function (khId, ile, callback) {
	var that = this;
	this.rec = [];
	this.tabela = {};
	var obj = {
		action: 'select',
		data: 0,
		condition: 'khId=' + khId,
		table: 'Faktury'
	};
	$.get(serwer + '/ajax.php', obj)
		.done(function (data) {
			data.sort(function (a, b) {
				return b.id - a.id;
			});
			// posortowane od najwyższego 	
			that.rec = data;
			if ($.isFunction(callback)) {
				callback.call(that, ile);
			}
		});
};
SpisFaktur.prototype.callback = function (ile) {
	var that = this;
	this.tabela = ['<table class="tabelaFaktury">'];
	this.tabela.push('<thead><tr><th style="width:76px;">data</th><th style="width:40px;">nr </th><th style="width:38px;">term</th><th style="width:38px;">spoz</th><th>brutto</th></tr></thead>');
	var rows = [],
		rowsSplacone = [];
	this.tabela.push('<tbody>');
	if (this.rec.length) {
		rowsSplacone.push("<tr><td colspan='5'>&nbsp;</td></tr>"); // bo te ponizej sa splacone
		//		rowsSplacone.push("<tr><td colspan='5'>&nbsp;</td></tr>");
	}

	var recLength = ile || this.rec.length;
	recLength = Math.min(recLength, this.rec.length);

	for (var x = 0; x < recLength; x++) {
		var row = [];
		var element = this.rec[x];

		row.push(element.wystawionyData.date.slice(0, 10));
		row.push('<a data-id='+element.id+'" href="http://localhost/faktura.php/?id='+element.id+'" target="_blank">'+element.nr+'</a>');
		row.push(element.termin);
		var tmpLast = row.push(element.splataSpoznienie) - 1;
		if (parseInt(element.pozostalo) > 0) {
			row[tmpLast] = element.spoznienie;
		}
		if (parseInt(row[tmpLast]) < -30) {
			row[tmpLast] = '<b><span style="color:red; font-weight:heaviy;">' + row[tmpLast] + '</span></b>';
		} else if (parseInt(row[tmpLast]) < -14) {
			row[tmpLast] = '<span style="color:red; font-weight:heaviy;">' + row[tmpLast] + '</span>';
		}
		row.push(element.wartosc.slice(0, -2));
		row = '<tr><td>' + row.join('</td><td>') + '</td></tr>';
		if (parseInt(element.pozostalo)) {
			rows.push(row);
		} else {
			rowsSplacone.push(row);
		}
	}
	rows = rows.concat(rowsSplacone);
	this.tabela = this.tabela.concat(rows);
	this.tabela.push('</tbody></table>');
	this.html = this.tabela.join(' ');
	this.html$ = $(this.html);
	$('#firmaFaktury').html(this.html);
    $('#firmaFaktury > table > tbody > tr').on('mouseenter','td a',function(e){
        //debugger;
        var url=e.currentTarget.href;
        $.get(url).done(function(data){
            $('#fakturyPodglad').html(data).show();
        });
    });
    $('#firmaFaktury > table > tbody > tr').on('mouseleave','td a',function(e){
    	$('#fakturyPodglad').hide();
    });
};

impet.podsumowanieFirmy = function (khId) {
	var obj = {
		action: 'select',
		data: 0,
		condition: 'kh_Id=' + khId,
		table: 'Podsumowanie'
	};
	$.get(serwer + '/ajax.php', obj)
		.done(function (data) {
			data.sort(function (a, b) {
				return a.kolejnosc - b.kolejnosc;
			});
			var ile = data.length;
			var table = '<table style="border-collapse:collapse; padding: 5px;" id="tabelaPodsumowanie"><thead><tr><th id="tabelaPodsumowanieClick" style="width:75px;">nazwa</th><th style="width:37px;">ile</th><th style="width:37px;">cena</th><th>rabat</th><th style="width:73px;">data</th></tr></thead><tbody>';
			for (var x = 0; x < ile; x++) {
				table += '<tr><td>' + data[x].skrot.replace("'", "\'") + '</td><td style="text-align:right; padding-left:3px;">' + parseInt(data[x].ilosc) + '</td><td style="text-align:right; padding-left:3px;">' + parseFloat(data[x].cena).toFixed(2) + '</td><td style="text-align:right; padding-left:3px;">' + parseInt(parseFloat(data[x].rabat)) + '</td><td style="text-align:right; padding-left:3px;">' + data[x].data.date.slice(0, 10) + '</td></tr>';
			}
			table += '</tbody></table>';
			impet.podsumowanieFirmy.last.tabelaSzczegolowa = table;
			var kategorie = [];
			data.forEach(function (ele, ind) {
				ele.data = new Date(ele.data.date);
			});
			data.sort(function (a, b) {
				return -a.data.getTime() + b.data.getTime();
			});
			data.forEach(function (ele, ind) {
				if (!Boolean(ele.grupaPriorytet))
					return;
				ele.ilosc = parseInt(ele.ilosc);
				ele.rabat = parseInt(parseFloat(ele.rabat));
				ele.cena = parseFloat(ele.cena).toFixed(2);
				if (!Boolean(kategorie[ele.grupaPriorytet])) {
					kategorie[ele.grupaPriorytet] = ele;
				} else {
					kategorie[ele.grupaPriorytet].ilosc += ele.ilosc;
				}
			});
			ile = kategorie.length;
			table = '<table style="border-collapse:collapse; padding: 5px;" id="tabelaPodsumowanie"><thead><tr><th id="tabelaPodsumowanieClick" style="width:68px;">grupa</th><th style="width:40px;">ile</th><th style="width:40px;">cena</th><th>rabat</th><th style="width:73px;">data</th></tr></thead><tbody>';
			for (x = 0; x < ile; x++) {
				if (!kategorie[x] || !kategorie[x].nazwaGrupy)
					continue;
				table += '<tr><td>' + kategorie[x].nazwaGrupy.replace("'", "\'") + '</td><td style="text-align:right; padding-left:3px;">' + kategorie[x].ilosc + '</td><td style="text-align:right; padding-left:3px;">' + kategorie[x].cena + '</td><td style="text-align:right; padding-left:3px;">' + kategorie[x].rabat + '</td><td style="text-align:right; padding-left:3px;">' + kategorie[x].data.toISOString().slice(0, 10) + '</td></tr>';
			}
			table += '</tbody></table>';
			impet.podsumowanieFirmy.last.tabelaOgolna = table;
			ustawZdarzenieNaOgolna();

			function ustawZdarzenieNaSzczegolowa() {
				$('#firmaPodsumowanie').html(impet.podsumowanieFirmy.last.tabelaSzczegolowa).scrollTop(0);
				$('#tabelaPodsumowanieClick').click(function (e) {
					ustawZdarzenieNaOgolna();
				});
			}

			function ustawZdarzenieNaOgolna() {
				$('#firmaPodsumowanie').html(impet.podsumowanieFirmy.last.tabelaOgolna).scrollTop(0);
				$('#tabelaPodsumowanieClick').click(function (e) {
					ustawZdarzenieNaSzczegolowa();
				});
			}

		});
};
impet.podsumowanieFirmy.last = {};

impet._firmaWypiszPanel = function (firma) {
	if (firma['khId'] !== null) {
		this.tabelaFaktury = new SpisFaktur(firma.khId, 20, SpisFaktur.prototype.callback);
		impet.podsumowanieFirmy(firma.khId);
	} else {
		$('#firmaFaktury').html('&nbsp;');
		$('#firmaPodsumowanie').html('&nbsp;');
	}
	$('#firmaUwagi').html(firma.uwagi).scrollTop(0);
	$('#firmaZdarzenia').scrollTop(0);
	this.zdarzenia = new Zdarzenia(firma.id, 20, Zdarzenia.prototype.callback);
	$('#firmaNazwa').html(firma.nazwa);
	$('#firmaUlica').html(firma.ulica);
	$('#firmaKod').html(firma.kod);
	$('#firmaMiejscowosc').html(firma.miejscowosc.nazwa);
	wypiszTelefony(firma.id);
	wypiszPracownikow(firma.id);
};

function wypiszTelefony(firmaId) {
	var obj = {
		action: 'select',
		data: 0,
		condition: 'firmaId=' + firmaId,
		table: 'FirmyNumeryTelefonow'
	};
	$.get(serwer + '/ajax.php', obj)
		.done(function (data) {
			var telString = "";
			data.forEach(function (ele) {
				var nrWidoczny = ele.numer.trim();
				if (ele['podstawowy'] == 1)
					nrWidoczny = '<b>' + nrWidoczny + '</b>';
				telString += '<a href="callto:+48' + ele.numer + '" title="' + ele.typ + '">' + nrWidoczny + '</a></br>';
			});
			$('#firmaTelefony').html(telString);

		});
}

function wypiszPracownikow(firmaId) {
	var obj = {
		action: 'select',
		data: 0,
		condition: 'firmaId=' + firmaId,
		table: 'FirmyPracownicy'
	};
	$.get(serwer + '/ajax.php', obj)
		.done(function (data) {
			var workString = "";
			var pracownik = '';
			data.forEach(function (ele) {
				pracownik = ele.imie + ' ' + ele.nazwisko;
				if (ele['priorytet'] == 1)
					pracownik = '<b>' + pracownik + '</b>';
				workString += '<span id="' + ele.id + '" clas="firmaPracownik">' + pracownik + '</span><br />';
			});
			$('#firmaPracownicy').html(workString);

		});
}
if(impet.debug) console.log('Tabele wczytane');