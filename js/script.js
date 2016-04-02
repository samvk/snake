/*jslint vars: true plusplus: true */
/*jshint esversion: 6*/
/*global $, document, Image, window, setTimeout, setInterval, clearInterval, alert*/

/*********************** Globals ********************/

var bellySize = parseInt($(".belly").css("width"));
var boxSize = parseInt($("#box").css("width"));

var tailPosArray = [];

var highscore = 0;

var bestscore = (function () {
	//get cookie
	var name = "bestscore=";
	var ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return 0;
}());

/******************** Get snake positions ******************/

function GetPositions() {
	this.headTop = parseInt($(".head").css("top"));
	this.headLeft = parseInt($(".head").css("left"));
	this.appleTop = parseInt($(".apple").css("top"));
	this.appleLeft = parseInt($(".apple").css("left"));
}

/*********************** Moving the head ********************/

$(document).keydown(function (key) {
	moveHead.setDirection(key);
});

var moveHead = {
	headDirection: "down",
	setDirection: function (inputKey) {
		switch (parseInt(inputKey.which, 10)) {
			case 38: //"up"
			case 104:
				this.headDirection = "up";
				break;
			case 40: //"down"
			case 98:
				this.headDirection = "down";
				break;
			case 37: //"left"
			case 100:
				this.headDirection = "left";
				break;
			case 39: //"right"
			case 102:
				this.headDirection = "right";
				break;
		}
	},

	// Saving the head turn direction
	init: function () {
		var $head = $(".head");
		var oldHeadTop = $head.css("top");
		var oldHeadLeft = $head.css("left");
		switch (this.headDirection) {
			case "up":
				$head.css({
					"top": `-=${bellySize}px`
				});
				$head.data("turn", this.headDirection);
				break;
			case "down":
				$head.css({
					"top": `+=${bellySize}px`
				});
				$head.data("turn", this.headDirection);
				break;
			case "left":
				$head.css({
					"left": `-=${bellySize}px`
				});
				$head.data("turn", this.headDirection);
				break;
			case "right":
				$head.css({
					"left": `+=${bellySize}px`
				});
				$head.data("turn", this.headDirection);
				break;
		}
		tailPosArray.push(oldHeadTop + oldHeadLeft);
		tailPosArray.shift();
	}
};

/**************** Moving the tail *******************/
var moveTail = {
	setTail: function () {
		$(".tail").each(function (i, e) {
			var $self = $(e);
			var $prevBelly = $self.prev();
			var newDirection = $prevBelly.data("turn");
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
	},

	//reverse array so the loop doesn't trigger ALL of them.
	setTurn: function () {
		$($(".tail").get().reverse()).each(function (i, e) {
			var $self = $(e);
			var $prevBelly = $self.prev();
			var prevTurn = $prevBelly.data("turn");
			$self.data("turn", prevTurn);
		});
	},
	
	init: function(){
		this.setTail();
		this.setTurn();
	}
};

/**************** Eating an apple *******************/

var appleChecker = (function () {
	function randomApple() {
		function range() {
			return Math.round((Math.floor(Math.random() * (boxSize - bellySize)) / 10)) * 10;
		}
		$(".apple").css({
			"top": range(),
			"left": range()
		});
	}

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
		$(".highscore").text(highscore);
	}

	return {
		init: function () {
			var position = new GetPositions();
			if (position.headTop === position.appleTop && position.headLeft === position.appleLeft) {
				eatApple();
			}
		}
	};
}());

/********************* Game over ********************/

var GameOverCheck = (function () {
	function setBestscoreCookie(cname, cvalue) {
		var d = new Date();
		d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	}

	function setScores() {
		$(".highscore").text(highscore);
		$(".bestscore").text(bestscore);
	}

	function gameOver(message) {
		//set new highscore
		if (highscore > bestscore) {
			bestscore = highscore;
			setBestscoreCookie("bestscore", highscore);
		}
		alert("You lose. " + message + "\nYour score: " + highscore);
		highscore = 0;
		setScores();
		$(".belly").remove();
		$("#box").append("<div class='belly head'></div>");
		moveHead.headDirection = "down";
		tailPosArray = [];
	}

	//check if out of bounds
	function checkBounds() {
		//position();
		var position = new GetPositions();
		if (position.headTop < 0 || position.headLeft < 0 || position.headTop > (boxSize - bellySize) || position.headLeft > (boxSize - bellySize)) {
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
	moveHead.init();
	appleChecker.init();
	moveTail.init();
	GameOverCheck.init();
}

$(document).ready(function () {
	$(".bestscore").text(bestscore);
	setInterval(gameplay, 100);
});