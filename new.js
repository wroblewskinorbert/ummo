function asyncEvent() {
	'use strict';
	var dfd = new jQuery.deferred();
	setTimeout(function () {
		dfd.resolve("hurray");
	}, Math.floor(400 + Math.random() * 2000));

	setTimeout(function () {
		dfd.reject("sorry");
	}, Math.floor(400 + Math.random() * 2000));
	setTimeout(function working() {
		if (dfd.state() === "pending") {
			dfd.notify("working(()")
		}
	}, 1);
	return dfd.promise();

	$.when(asyncEvent())
}