< script src = "http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"
type = "text/javascript" > < /script>
<style>
	#containerForData {
		display: inline-block;
		width: 280px;
		box-shadow: rgba(148, 148, 148, 0.4) 3px 3px 22px -2px;
		overflow: visible;
		background: linear-gradient(124deg, #FEFEFE 10%, rgba(216, 255, 229, 0.81) 65%, #FFFFFF 100%, #FFFFFF 72%, #FFFFFF 100%);
		/ * W3C * /
	}
	#ulica,
	#email,
	#ocena,
	#oddo,
	#obrot {
		float: left;
		width: 49%;
	}
	#miejscowosc,
	#www,
	#priorytet,
	#ostatnia,
	#spoznienie {
		float: right;
		width: 49%;
	}
	#ocena,
	#priorytet {
		text-align: center;
	}
	#spoznienie,
	#obrot,
	#miejscowosc,
	#ostatnia {
		text-align: right;
	}
	#nazwa {
		padding: 5px;
		margin: 5px;
		font-family: courier new;
		font-size: 1.3em;
		text-shadow: -3px 3px 5px rgba(69, 11, 21, 0.2);
		/ * FF3.5 + , Opera 9 + , Saf1 + , Chrome, IE10 * /
	}
	#infoUwagi {
		position: absolute;
		bottom: 2px;
		left: 2px;
	}
</style >

< div id = "containerForData" >
	< form id = "formularzFirmy" >
	< div name = "nazwa" > < b > {
		{
			nazwa
		}
} < /b>
		</div >
	< div name = "ulica" > {
		{
			ulica
		}
} < /div>
		<div name="miejscowosc">{{miejscowosc}}</div >
	< div name = "email" > < a href = "mailto:{{email}}"
target = "_blank" > {
	{
		email
	}
} < /a>
		</div >
	< div name = "www" > {
		{
			www
		}
} < /div>
		<div name="ocena">Ocena: {{ocena}}</div >
	< div name = "priorytet" > Priorytet: {
		{
			priorytet
		}
} < /div>
		<span name="od">{{od}}</span > < span name = "do" > & nbsp; & nbsp; {
	{
		do
	}
} < /span>
		<div name="ostatnia">{{ostatnia}}</div >
	< div name = "obrot" > {
		{
			obrot
		}
} < /div>
		<div name="spoznienie">{{spoznienie}}</div >
	< div name = "infoUwagi" >
<!--	<input type="checkbox" id="czyUwagiWyswietlac" />-->
< /div>

</div >
	< script >
var impet;
impet = impet || {};
var serwer = 'http://localhost';
var dbo = [];
$.when(
	$.get(serwer + '/ajax/ajaxuniversal4.php', {
		table: 'PlMiejscowosci',
		condition: 'id=id',
		action: 'select',
		data: 0
	}, function (data) {
		impet = impet || {};
		impet.miejscowosc = data;
		impet.miejscowoscId = [];
		impet.miejscowosc.forEach(function (ele, ind, tab) {
			impet.miejscowoscId[ele.id] = ele;
			ele.toString = function () {
				return this.nazwa;
			}

		});
	}),
	$.post(serwer + '/ajax/ajaxuniversal4.php', {
		table: 'Firmy',
		condition: 'id=id',
		action: 'select',
		data: 0
	})
	.done(function (data) {
		dbo.tblFirmy = data;
	}),
	$.post(serwer + '/ajax/ajaxuniversal4.php', {
		table: 'FirmyV',
		condition: 'khId=khId',
		action: 'select',
		data: 0
	}, function (data) {
		dbo.tblFirmyV = data;
	})
)
	.done(function (data) {
		FirmyImpet = dbo.tblFirmy;
		FirmyKh = [];
		myFirmyId = [];
		var Data = dbo.tblFirmyV;
		for (var x in Data) {
			FirmyKh[Data[x].khId] = Data[x];
		}
		for (x = 0, len = FirmyImpet.length; x < len; x++) {
			if (FirmyKh[FirmyImpet[x].khId]) {
				FirmyImpet[x].kh = FirmyKh[FirmyImpet[x].khId];
			}
			if (FirmyImpet[x].wspN === null)
				FirmyImpet[x].wspN = '49.000000';
			if (FirmyImpet[x].wspE === null)
				FirmyImpet[x].wspE = '19.000000';
			if (FirmyImpet[x].ocena === null)
				FirmyImpet[x].ocena = -1;
			if (FirmyImpet[x].priorytet === null)
				FirmyImpet[x].priorytet = -1;
			FirmyImpet[x].miejscowosc = impet.miejscowoscId[FirmyImpet[x].miejscowoscId];
			impet.firmyId = FirmyImpet[x];
		}
		impet.firmy = FirmyImpet;
		impet.miejscowosc
		// domyslnym uzytkownikiem jestem
	});

function wypelnij(nr) {
	formularz = document.forms['formularzFirmy'];
	obj = impet.firmy[nr];
	var temp = {
			"id": null,
			"khId": null,
			"nazwa": "",
			"ulica": "",
			"uwagi": "",
			"email": "",
			"www ": "www ",
			"ocena ": -1,
			"priorytet ": -1,
			"wspN ": 52,
			"wspE ": 19,
			"od ": "od ",
			"do ": "do ",
			"kh: "
			brak handlu ",
		"
			miejscowosc ","
			"
	};
	temp.map(function (ele, ind) {
		var result = "
			";
		switch (ele) {
		case 'ocena',
			'priorytet' ":
			{
				if (ele == null) {
					return -1;
				}
			}
			case 'ostatnia',
			'obrot',
			'spoznienie':
			if (kh) {
				return kh.ele;
			}
		case 'miejscowosc':
			if(miejscowosc!=""){
				this.toString = function () {
					return "";
				}
				return this
				
			};

			return this;

		
			break;
			khId: nazwa: ulica: miejscowosc: return ele;
		case "
			od ", "
			do ":
			{
				return ele;
			}
			break;
		case "
			www ", "
			email ", "
			khid ":
			return null;
			break;
		case "
			ocena ", "
			priorytet ":
			if (!ele[ind])
				return -1;
		default:
			return ele[ind];
			break;
		}
	})
	var temp = Object.getOwnPropertyNames(obj);
	//temp = temp.slice(0);
	temp.forEach(function (ele, ind) {
		{
			console.log(temp);
			console.log(ele);
			if (formularz.children[ele])
				formularz.children[ele].innerHTML = obj[ele];
		}
	})
}


< /script>