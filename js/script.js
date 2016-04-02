/*jshint esversion: 6*/
/*global $, document, Image, window, setTimeout, setInterval, clearInterval, alert*/

$(document).ready(function () {
	"use strict";

	/*********************** Globals ********************/

	var snakeSize = parseInt($(".snake").css("width"));
	var boxSize = parseInt($("#box").css("width"));

	var bellyPosArray = [];

	var highscore = 0;
	var bestscore = (function () {
		//get cookie
		var name = "bestscore=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) === 0) {
				return c.substring(name.length, c.length);
			}
		}
		return 0;
	}());

	/******************** Get head/apple positions ******************/

	function GetPositions() {
		this.headTop = parseInt($(".head").css("top"));
		this.headLeft = parseInt($(".head").css("left"));
		this.appleTop = parseInt($(".apple").css("top"));
		this.appleLeft = parseInt($(".apple").css("left"));
		this.tailTop = parseInt($(".snake").last().css("left"));
		this.tailLeft = parseInt($(".snake").last().css("right"));
	}

	/*********************** Moving the head ********************/

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
				case 101:
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
		pushBelly: function () {
			//pushes old head position to the belly before moving
			var position = new GetPositions();
			bellyPosArray.push([position.headTop, position.headLeft]);
			bellyPosArray.shift();
		},

		// Saving the head direction
		init: function () {
			this.pushBelly();

			var $head = $(".head");
			switch (this.headDirection) {
				case "up":
					$head.css({
						"top": `-=${snakeSize}px`
					});
					$head.data("direction", this.headDirection);
					break;
				case "down":
					$head.css({
						"top": `+=${snakeSize}px`
					});
					$head.data("direction", this.headDirection);
					break;
				case "left":
					$head.css({
						"left": `-=${snakeSize}px`
					});
					$head.data("direction", this.headDirection);
					break;
				case "right":
					$head.css({
						"left": `+=${snakeSize}px`
					});
					$head.data("direction", this.headDirection);
					break;
			}
		}
	};

	$(document).keydown(function (key) {
		moveHead.setDirection(key);
	});

	/**************** Moving the belly *******************/
	var moveBelly = {
		moveEachBelly: function () {
			$(".belly").each(function (i, e) {
				var $self = $(e);
				var $prevSnake = $self.prev();
				var newDirection = $prevSnake.data("direction");
				var oldTop = parseInt($prevSnake.css("top"));
				var oldLeft = parseInt($prevSnake.css("left"));
				switch (newDirection) {
					case "up":
						$self.css({
							"top": oldTop + snakeSize,
							"left": oldLeft
						});
						break;
					case "down":
						$self.css({
							"top": oldTop - snakeSize,
							"left": oldLeft
						});
						break;
					case "left":
						$self.css({
							"top": oldTop,
							"left": oldLeft + snakeSize
						});
						break;
					case "right":
						$self.css({
							"top": oldTop,
							"left": oldLeft - snakeSize
						});
						break;
				}
			});
		},

		//reverse array so the loop doesn't trigger ALL of them.
		setNewDirection: function () {
			$($(".belly").get().reverse()).each(function (i, e) {
				var $self = $(e);
				var $prevSnake = $self.prev();
				var prevDirection = $prevSnake.data("direction");
				$self.data("direction", prevDirection);
			});
		},

		init: function () {
			this.moveEachBelly();
			this.setNewDirection();
		}
	};

	/**************** Eating an apple *******************/

	var eatAppleCheck = (function () {
		function pushTail() {
			var position = new GetPositions();
			bellyPosArray.unshift([position.tailTop, position.tailLeft]);
		}

		function addTail() {
			var $oldSnakeTail = $(".snake").last();
			$oldSnakeTail.after("<div class='snake belly'></div>");
			var $newTail = $(".snake").last();

			var tailDirection = $oldSnakeTail.data("direction");
			var oldTop = parseInt($oldSnakeTail.css("top"));
			var oldLeft = parseInt($oldSnakeTail.css("left"));
			switch (tailDirection) {
				case "up":
					$newTail.css({
						"top": oldTop + snakeSize,
						"left": oldLeft
					});
					break;
				case "down":
					$newTail.css({
						"top": oldTop - snakeSize,
						"left": oldLeft
					});
					break;
				case "left":
					$newTail.css({
						"top": oldTop,
						"left": oldLeft + snakeSize
					});
					break;
				case "right":
					$newTail.css({
						"top": oldTop,
						"left": oldLeft - snakeSize
					});
					break;
			}
			pushTail();
		}

		function randomApple() {
			function range() {
				return Math.round((Math.floor(Math.random() * (boxSize - snakeSize)) / 10)) * 10;
			}
			$(".apple").css({
				"top": range(),
				"left": range()
			});
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

	var gameOverCheck = (function () {
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
			$(".snake").remove();
			$("#box").append("<div class='snake head'></div>");
			moveHead.headDirection = "down";
			bellyPosArray = [];
		}

		//check if out of bounds
		function checkBounds() {
			//position();
			var position = new GetPositions();
			if (parseInt(position.headTop) < 0 || parseInt(position.headLeft) < 0 || parseInt(position.headTop) > (boxSize - snakeSize) || parseInt(position.headLeft) > (boxSize - snakeSize)) {
				gameOver("Out of bounds!");
			}
		}

		//check if touching itself
		function checkTouch() {
			var position = new GetPositions();
			var headPos = [position.headTop, position.headLeft];
			for (var i = 0; i < bellyPosArray.length; i++) {
				if (headPos.join() === bellyPosArray[i].join()) {
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

	/********************************************/
	/**************** GAMEPLAY ******************/
	/********************************************/

	function gameplay() {
		moveHead.init();
		moveBelly.init();
		eatAppleCheck.init();
		gameOverCheck.init();
	}
    
    setInterval(gameplay, 100);
	
    $(".bestscore").text(bestscore);
    
});