function pobierzSpisFaktur(idFirmy){
var obj={
		action:'select',
		data:0,
		condition: 'id='+idFirmy,
		table:'Faktury'
	}
	$.get(serwer+'ajax.php',obj).done(function(data){
		var tab=[];
		data.forEach(function(ele,ind){
		var wiersz;
		for (var x in ele) wiersz[x]=ele; ele.ind=ind;
		tab.push(wiersz);
		})
	})
}