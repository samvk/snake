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
	var position = {
		headTop: function () {
			return parseInt($(".head").css("top"));
		},
		headLeft: function () {
			return parseInt($(".head").css("left"));
		},
		appleTop: function () {
			return parseInt($(".apple").css("top"));
		},
		appleLeft: function () {
			return parseInt($(".apple").css("left"));
		},
		tailTop: function () {
			return parseInt($(".snake").last().css("left"));
		},
		tailLeft: function () {
			return parseInt($(".snake").last().css("right"));
		}
	};

	/*********************** Moving the head ********************/
	var moveHead = (function () {
		function pushBelly() {
			//pushes old head position to the belly before moving
			bellyPosArray.push([position.headTop(), position.headLeft()]);
			bellyPosArray.shift();
		}

		return {
			headDirection: "down",
			newHeadPos: function () {
				this.headDirection = "down";
				var $head = $(".head");
				$head.css({
					"top": "+=" + snakeSize
				});
			},
			setDirection: function (inputKey) {
				var $head = $(".head");
				switch (parseInt(inputKey.which, 10)) {
					case 38: //"up"
					case 104:
						this.newHeadPos = function () {
							this.headDirection = "up";
							$head.css({
								"top": "-=" + snakeSize
							});
						};
						break;
					case 40: //"down"
					case 98:
					case 101:
						this.newHeadPos = function () {
							this.headDirection = "down";
							$head.css({
								"top": "+=" + snakeSize
							});
						};
						break;
					case 37: //"left"
					case 100:
						this.newHeadPos = function () {
							this.headDirection = "left";
							$head.css({
								"left": "-=" + snakeSize
							});
						};
						break;
					case 39: //"right"
					case 102:
						this.newHeadPos = function () {
							this.headDirection = "right";
							$head.css({
								"left": "+=" + snakeSize
							});
						};
						break;
				}
			},
			init: function () {
				pushBelly();
				var $head = $(".head");
				this.newHeadPos();
				$head.data("direction", this.headDirection);
			}
		};
	}());

	$(document).keydown(function (key) {
		moveHead.setDirection(key);
	});

	/**************** Moving the belly *******************/
	var moveBelly = function () {
		//reverse loop so changes don't cascade.
		var $bellyReverse = $($(".belly").get().reverse());
		$bellyReverse.each(function (i, e) {
			var $self = $(e);
			var $prevSnake = $self.prev();

			//set each belly to its previous' position.
			$self.css({
				"top": $prevSnake.css("top"),
				"left": $prevSnake.css("left")
			});

			//set each belly to its previous' data-direction.
			var prevDirection = $prevSnake.data("direction");
			$self.data("direction", prevDirection);
		});
	};

	/**************** Eating an apple *******************/
	var eatAppleCheck = (function () {
		function pushTail() {
			bellyPosArray.unshift([position.tailTop(), position.tailLeft()]);
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
			var appleTop = range();
			var appleLeft = range();
			$(".apple").css({
				"top": appleTop,
				"left": appleLeft
			});
			//prevent apple from falling under snake belly
			var applePos = [appleTop, appleLeft];
			for (var i = 0; i < bellyPosArray.length; i++) {
				if (applePos.join() === bellyPosArray[i].join()) {
					randomApple();
					return;
				}
			}

		}

		return {
			init: function () {
				if (position.headTop() === position.appleTop() && position.headLeft() === position.appleLeft()) {
					randomApple();
					addTail();
					highscore += 10;
					$(".highscore").text(highscore);
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

		function resetHeadDir() {
			moveHead.newHeadPos = function () {
				moveHead.headDirection = "down";
				var $head = $(".head");
				$head.css({
					"top": "+=" + snakeSize
				});
			};
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
			$("#snake-box").append("<div class='snake head'></div>");
			resetHeadDir();
			bellyPosArray = [];
		}

		//check if out of bounds
		function checkBounds() {
			if (position.headTop() < 0 || position.headLeft() < 0 || position.headTop() > (boxSize - snakeSize) || position.headLeft() > (boxSize - snakeSize)) {
				gameOver("Out of bounds!");
			}
		}

		//check if touching itself
		function checkTouch() {
			var headPos = [position.headTop(), position.headLeft()];
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
		moveBelly();
		moveHead.init();
		eatAppleCheck.init();
		gameOverCheck.init();
	}
	setInterval(gameplay, 100);

	$(".bestscore").text(bestscore);

});