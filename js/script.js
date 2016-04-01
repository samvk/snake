/*jslint vars: true plusplus: true */
/*jshint esversion: 6*/
/*global $, document, Image, window, setTimeout, setInterval, clearInterval, alert*/

/*************** High Score cookies **************/

function setCookie(cname, cvalue, exdays) {
	exdays = exdays || 365;
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	const expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	const name = cname + "=";
	const ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

/*********************** Globals ********************/
var bellySize = parseInt($(".belly").css("width"));
var boxSize = parseInt($("#box").css("width"));
var tailPosArray = [];

var highscore = 0;
var bestscore = getCookie("bestscore") || 0;

function setScores() {
	$(".highscore").text("Highscore: " + highscore);
	$(".bestscore").text("Best score: " + bestscore);
}

/*********************** Moving the head ********************/

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

/************************* Saving the head current and turn direction ******************/
function headMove() {
	var $head = $(".head");

	var oldHeadTop = $head.css("top");
	var oldHeadLeft = $head.css("left");
	switch (headDirection) {
		case "up":
			$head.css({
				"top": `-=${bellySize}px`
			});
			$head.data("turn", headDirection);
			break;
		case "down":
			$head.css({
				"top": `+=${bellySize}px`
			});
			$head.data("turn", headDirection);
			break;
		case "left":
			$head.css({
				"left": `-=${bellySize}px`
			});
			$head.data("turn", headDirection);
			break;
		case "right":
			$head.css({
				"left": `+=${bellySize}px`
			});
			$head.data("turn", headDirection);
			break;
	}


	tailPosArray.push(oldHeadTop + oldHeadLeft);
	tailPosArray.shift();

}

/**************** Moving the tail *******************/

function setTail() {
	var $tail = $(".tail");
	$tail.each(function (i, e) {
		var $self = $(e);
		var $prevBelly = $self.prev();
		var newDirection = $prevBelly.data("turn") || $self.data("direction");
		var oldTop = parseInt($prevBelly.css("top"));
		var oldLeft = parseInt($prevBelly.css("left"));
		switch (newDirection) {
			case "up":
				$self.css({
					"top": oldTop + bellySize,
					"left": oldLeft
				});
				break;
			case "down":
				$self.css({
					"top": oldTop - bellySize,
					"left": oldLeft
				});
				break;
			case "left":
				$self.css({
					"top": oldTop,
					"left": oldLeft + bellySize
				});
				break;
			case "right":
				$self.css({
					"top": oldTop,
					"left": oldLeft - bellySize
				});
				break;
		}
	});
}

//reverse array so the loop doesn't trigger ALL of them.
function setTurn() {
	$($(".tail").get().reverse()).each(function (i, e) {
		var $self = $(e);
		var $prevBelly = $self.prev();
		var prevTurn = $prevBelly.data("turn");
		$self.data("turn", prevTurn);
	});
}

/**************** Eating an apple *******************/

/****************** Move apple *********************/

function randomApple() {
	function range() {
		return Math.round((Math.floor(Math.random() * (boxSize - bellySize)) / 10)) * 10;
	}
	$(".apple").css({
		"top": range(),
		"left": range()
	});
}

/**************** Add Tail *******************/
function addTail() {
	var $oldLastBelly = $(".belly").last();
	$oldLastBelly.after("<div class='belly tail'></div>");
	var $newTail = $(".belly").last();

	var oldDirection = $oldLastBelly.data("turn");
	var oldTop = parseInt($oldLastBelly.css("top"));
	var oldLeft = parseInt($oldLastBelly.css("left"));
	switch (oldDirection) {
		case "up":
			$newTail.css({
				"top": oldTop + bellySize,
				"left": oldLeft
			});
			break;
		case "down":
			$newTail.css({
				"top": oldTop - bellySize,
				"left": oldLeft
			});
			break;
		case "left":
			$newTail.css({
				"top": oldTop,
				"left": oldLeft + bellySize
			});
			break;
		case "right":
			$newTail.css({
				"top": oldTop,
				"left": oldLeft - bellySize
			});
			break;
	}
	var tailTop = $newTail.css("top");
	var tailLeft = $newTail.css("left");
	tailPosArray.unshift(tailTop + tailLeft);
}

function eatApple() {
	randomApple();
	addTail();
	highscore += 10;
	$(".highscore").text("Highscore: " + highscore);
}

/**************** Check if on an apple **************/

var headPosTop;
var headPosLeft;
var applePosTop;
var applePosLeft;

function getPositions() {
	headPosTop = parseInt($(".head").css("top"));
	headPosLeft = parseInt($(".head").css("left"));
	applePosTop = parseInt($(".apple").css("top"));
	applePosLeft = parseInt($(".apple").css("left"));
}

function appleChecker() {
	if (headPosTop === applePosTop && headPosLeft === applePosLeft) {
		eatApple();
	}
}

/********************* Game over ********************/

var GameOverCheck = (function () {
	function gameOver(message) {
		//set new highscore
		if (highscore > bestscore) {
			bestscore = highscore;
			setCookie("bestscore", highscore);
		}
		console.log(bestscore);
		alert("You lose. " + message + "\nYour score: " + highscore);
		highscore = 0;
		setScores();
		$(".belly").remove();
		$("#box").append("<div class='belly head'></div>");
		headDirection = "down";
		tailPosArray = [];
	}

	//check if out of bounds
	function checkBounds() {
		if (headPosTop < 0 || headPosLeft < 0 || headPosTop > (boxSize - bellySize) || headPosLeft > (boxSize - bellySize)) {
			gameOver("Out of bounds!");
		}
	}

	//check if touching itself
	function checkTouch() {
		var headTop = $(".head").css("top");
		var headLeft = $(".head").css("left");
		var headPos = headTop + headLeft;
		for (var i = 0; i < tailPosArray.length; i++) {
			if (headPos === tailPosArray[i]) {
				gameOver("Stop hitting yourself!");
				return;
			}
		}

	}

	return {
		init: function () {
			checkBounds();
			checkTouch();
		}
	};
}());


/**************** init ******************/

function gameplay() {
	headMove();
	getPositions();
	appleChecker();
	setTail();
	setTurn();
	GameOverCheck.init();
}



$(document).ready(function () {
	//randomApple();
	//eatApple();
	//eatApple();
	setScores();
	console.log(bestscore);
	setInterval(gameplay, 100);
});



//temporary tester
$(document).dblclick(function () {
	eatApple();
});