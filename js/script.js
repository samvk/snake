/*jslint vars: true plusplus: true */
/*jshint esversion: 6*/
/*global $, document, Image, window, setTimeout, setInterval, clearInterval, console*/

/*********************** Moving the snake ********************/
var headDirection = "down";

$(document).keydown(function (key) {
	switch (parseInt(key.which, 10)) {
		case 38: //"up"
		case 104:
			headDirection = "up";
			break;
		case 40: //"down"
		case 98:
			headDirection = "down";
			break;
		case 37: //"left"
		case 100:
			headDirection = "left";
			break;
		case 39: //"right"
		case 102:
			headDirection = "right";
			break;
	}
});

function headMove() {
	//var direction = headDirection;
	switch (headDirection) {
		case "up":
			$("#head").css({
				"top": "-=10px"
			});
			break;
		case "down":
			$("#head").css({
				"top": "+=10px"
			});
			break;
		case "left":
			$("#head").css({
				"left": "-=10px"
			});
			break;
		case "right":
			$("#head").css({
				"left": "+=10px"
			});
			break;
	}
}

setInterval(headMove, 200);

/**************** Eating an apple and growing *******************/

function appleEat() {
	
}



$(document).click(function () {
	appleEat();
});