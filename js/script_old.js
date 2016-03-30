/*jslint vars: true plusplus: true */
/*jshint esversion: 6*/
/*global $, document, Image, window, setTimeout, setInterval, clearInterval, console*/

var canKey = true;

var newBelly = function (direction) {
	var posY = $(".belly").first().css("top");
	var posX = $(".belly").first().css("left");

	$(".belly").each(function (i, e) {
		var adder = 90;
		var oldWait = $(e).data("wait");
		var newWait = (adder * (i + 1)).toString();
		$(e).data("wait", newWait);
	});

	$(".belly").first().before("<div class='belly' data-wait='0'></div>");

	switch (direction) {
		case "up":
			$(".belly").first().css("top", (parseInt(posY) - 10) + "px");
			$(".belly").first().css("left", posX);
			$(".belly").first().stop().animate({
				"top": "-=" + boxSize
			}, 5000, "linear");
			break;

		case "down":
			$(".belly").first().css("top", (parseInt(posY) + 10) + "px");
			$(".belly").first().css("left", posX);
			$(".belly").first().stop().animate({
				"top": "+=" + boxSize
			}, 5000, "linear");
			break;

		case "left":
			$(".belly").first().css("top", posY);
			$(".belly").first().css("left", (parseInt(posX) - 10) + "px");
			$(".belly").first().stop().animate({
				"left": "-=" + boxSize
			}, 5000, "linear");
			break;

		case "right":
			$(".belly").first().css("top", posY);
			$(".belly").first().css("left", (parseInt(posX) + 10) + "px");
			$(".belly").first().stop().animate({
				"left": "+=" + boxSize
			}, 5000, "linear");
			break;
	}

};

var boxSize = "500px";

var currentDirection = "";

randomApple();

function appleEat() {
	randomApple();
	switch (currentDirection) {
		case "up":
			newBelly("up");
			break;
		case "down":
			newBelly("down");
			break;

		case "left":
			newBelly("left");
			break;
		case "right":
			newBelly("right");
			break;
	}

}

function bellyUp() {
	currentDirection = "up";
	$(".belly").stop().animate({
		"top": "-=" + boxSize
	}, 5000, "linear");
}

function bellyDown() {
	currentDirection = "down";
	$(".belly").each(function () {
		$(this).stop().animate({
			"top": "+=" + boxSize
		}, 5000, "linear");
	});
}

function bellyLeft() {
	currentDirection = "left";
	$(".belly").each(function () {
		$(this).stop().animate({
			"left": "-=" + boxSize
		}, 5000, "linear");
	});
}

function bellyRight() {
	currentDirection = "right";
	$(".belly").each(function () {
		$(this).stop().animate({
			"left": "+=" + boxSize
		}, 5000, "linear");
	});
}

$(document).keydown(function (key) {
	if (canKey) {
		switch (parseInt(key.which, 10)) {
			case 38: //"up"
			case 104:
				currentDirection = "up";
				$(".belly").each(function (i, e) {
					setTimeout(function () {

						console.log(e);

						$(e).stop().animate({
							"top": "-=" + boxSize
						}, 5000, "linear");
					}, $(e).data("wait"));
				});
				canKey = false;
				setTimeout(function () {
					canKey = true;
				}, 100);
				break;
			case 40: //"down"
			case 98:
				currentDirection = "down";
				$(".belly").each(function (i, e) {
					setTimeout(function () {

						console.log(e);

						$(e).stop().animate({
							"top": "+=" + boxSize
						}, 5000, "linear");
					}, $(e).data("wait"));
				});
				canKey = false;
				setTimeout(function () {
					canKey = true;
				}, 100);
				break;
			case 37: //"left"
			case 100:
				currentDirection = "left";
				$(".belly").each(function (i, e) {
					setTimeout(function () {

						console.log(e);

						$(e).stop().animate({
							"left": "-=" + boxSize
						}, 5000, "linear");
					}, $(e).data("wait"));
				});
				canKey = false;
				setTimeout(function () {
					canKey = true;
				}, 100);
				break;
			case 39: //"right"
			case 102:
				currentDirection = "right";
				$(".belly").each(function (i, e) {
					setTimeout(function () {

						console.log(e);

						$(e).stop().animate({
							"left": "+=" + boxSize
						}, 5000, "linear");
					}, $(e).data("wait"));
				});
				canKey = false;
				setTimeout(function () {
					canKey = true;
				}, 100);
				break;
		}
	}
});

function randomApple() {
	var range = Math.floor(Math.random() * parseInt(boxSize));
	$(".apple").css({
		"top": range,
		"left": range
	});
}

function snakeChecker() {
	var bellyPosY = $(".belly").first().css("top");
	var bellyPosX = $(".belly").first().css("left");
	var applePosY = $(".apple").first().css("top");
	var applePosX = $(".apple").first().css("left");
	var bellyPosYRound = Math.round(parseInt(bellyPosY) / 10) * 10;
	var applePosYRound = Math.round(parseInt(applePosY) / 10) * 10;
	var bellyPosXRound = Math.round(parseInt(bellyPosX) / 10) * 10;
	var applePosXRound = Math.round(parseInt(applePosX) / 10) * 10;
	/*
	var bellyTopArray = [];
	var bellyLeftArray = [];
	
	$(".belly").each(function (index, e) {
		var bellySpotTop = $(e).css("top");
		var bellySpotLeft = $(e).css("top");
		var bellySpotTopRound = Math.round(parseInt(bellySpotTop) / 10) * 10;
		var bellySpotLeftRound = Math.round(parseInt(bellySpotLeft) / 10) * 10;
		bellyTopArray.push(bellySpotTopRound);
		bellyLeftArray.push(bellySpotLeftRound);
	});
	
	//var firstTop = bellyTopArray.shift();
	//var firstLeft = bellyLeftArray.shift();
	var overlap = false;
	var sameTop = false;
	var sameLeft = false;
	
	for(var i = 1; i <bellyTopArray.length; i++){
		
		if (bellyTopArray[0] == bellyTopArray[i]){
			sameTop = true;
		}
		
		if (bellyLeftArray[0] == bellyLeftArray[i]) {
			sameLeft = true;
		}
		
		if (sameTop && sameLeft) {
			overlap = true;
		}
	}
	
	function duplicate(array1, array2) {
		return (new Set(array1)).size !== array1.length && (new Set(array1)).size !== array1.length;
	}
	
	var repeat = duplicate(bellyTopArray, bellyLeftArray);
	
	console.log(bellyTopArray);
	console.log(bellyLeftArray);
	*/
	if (bellyPosYRound === applePosYRound && bellyPosXRound === applePosXRound) {
		appleEat();
	}

	if (bellyPosYRound < 0 || bellyPosXRound < 0 || bellyPosYRound > parseInt(boxSize) - 10 || bellyPosXRound > parseInt(boxSize) - 10) {
		alert("You lose!");
		$(".belly").remove();
		$("#box").append("<div class='belly' data-wait='0'></div>");
		$(".belly").css({
			"left": "0px",
			"right": "0px"
		});
		randomApple();
	}
}

setInterval(snakeChecker, 100);

//for testing
$(document).click(function () {
	//appleEat();
});