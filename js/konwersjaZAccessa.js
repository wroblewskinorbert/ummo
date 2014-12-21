function convertFromAccess(strToConvert) {
	return strToConvert.replace(/["\u0000"]/g, ['']).replace(/(\u0005\u0001)/g, "\u0105").replace(/(\u0007\u0001)/g, "ć").replace(/(\u0019\u0001)/g, "ę").replace(/(\u0042\u0001)/g, "ł").replace(/(\u0044\u0001)/g, "ń").replace(/(\u005b\u0001)/g, "ś").replace(/(\u007c\u0001)/g, "ż").replace(/(\u007a\u0001)/g, "ź").replace(/(\u0004\u0001)/g, "Ą").replace(/(\u0006\u0001)/g, "Ć").replace(/(\u0018\u0001)/g, "Ę").replace(/(\u0041\u0001)/g, "Ł").replace(/(\u0043\u0001)/g, "Ń").replace(/(\u005a\u0001)/g, "Ś").replace(/(\u007b\u0001)/g, "Ż").replace(/(\u0079\u0001)/g, "Ź");
}
$.post('access%20goood.php').done(function (data) {
	data.forEach(function (ele) {
		ele.nazwa = convertFromAccess(ele.nazwa);
		if (ele.uwagi != null) ele.uwagi = convertFromAccess(ele.uwagi);
	});
	console.log(data);
	a = data;
});