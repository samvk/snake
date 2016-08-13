/*jshint esversion: 6*/
/*global $, document, Image, window, setTimeout, setInterval, clearInterval, alert*/

$(document).ready(function () {
    "use strict";
    
    /********************** Globals *********************/
	let isGameOver = false;
	
    const snakeSize = parseInt($(".snake").css("width"));
    const boxSize = parseInt($("#game-box").css("width"));

    let bellyPosArray = [];

    let highscore = 0;
    let bestscore = (function () {
        //get cookie
        const name = "bestscore=";
        const ca = document.cookie.split(";");
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

    
    
    /************** Get snake/apple positions ************/
    
    const position = (function () {
        function getPos(el, pos) {
            return function() {
                return parseInt($("." + el).last().css(pos));
            };
        }

        return {
            headTop: getPos("head", "top"),
            headLeft: getPos("head", "left"),
            appleTop: getPos("apple", "top"),
            appleLeft: getPos("apple", "left"),
            tailTop: getPos("snake", "top"),
            tailLeft: getPos("snake", "left")
        };
    }());

    /**************** Moving the belly (automatically) *******************/
    const moveBelly = function () {
        //reverse loop so changes don't cascade.
        const $bellyReverse = $($(".belly").get().reverse());
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

    /******************* Moving the head (manually) ****************/
    const moveHead = (function () {
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
            setDirection: function (input) {
                var $head = $(".head");
				
				//convert input to number if keypress
				input = parseInt(input.which, 10) || input;
				
                switch (input) {
				case "up":
                case 87:
                case 38:
                    this.newHeadPos = function () {
                        this.headDirection = "up";
                        $head.css({
                            "top": "-=" + snakeSize
                        });
                    };
                    break;
				case "down":
                case 83:
                case 40:
                    this.newHeadPos = function () {
                        this.headDirection = "down";
                        $head.css({
                            "top": "+=" + snakeSize
                        });
                    };
                    break;
				case "left":
                case 65:
                case 37:
                    this.newHeadPos = function () {
                        this.headDirection = "left";
                        $head.css({
                            "left": "-=" + snakeSize
                        });
                    };
                    break;
				case "right":
                case 68:
                case 39:
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
                this.newHeadPos();
				$(".head").data("direction", this.headDirection);
            }
        };
    }());

	//move snake on keypress
    $(document).keydown(function (key) {
        moveHead.setDirection(key);
    });
	
	//move snake on arrow click (mobile only)
	$(".arrow").click(function () {
		const direction = $(this).data("direction");
		moveHead.setDirection(direction);
	});

    /**************** Eating an apple *******************/
    const eatAppleCheck = (function () {
        function pushTail() {
            bellyPosArray.unshift([position.tailTop(), position.tailLeft()]);
        }

        function addTail() {
            const $oldSnakeTail = $(".snake").last();
            $oldSnakeTail.after('<div class="snake belly"></div>');
            const $newTail = $(".snake").last();

            const tailDirection = $oldSnakeTail.data("direction");
            const oldTop = parseInt($oldSnakeTail.css("top"));
            const oldLeft = parseInt($oldSnakeTail.css("left"));
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
            const appleTop = range();
            const appleLeft = range();
            $(".apple").css({
                "top": appleTop,
                "left": appleLeft
            });
            //prevent apple from falling under snake belly
            var applePos = [appleTop, appleLeft];
            for (let i = 0; i < bellyPosArray.length; i++) {
                if (applePos.join() === bellyPosArray[i].join()) {
                    randomApple();
                    return;
                }
            }

        }

        return function () {
            if (position.headTop() === position.appleTop() && position.headLeft() === position.appleLeft()) {
                randomApple();
                addTail();
                highscore += 10;
                $(".highscore").text(highscore);
            }
        };
    }());

    /********************* Game over ********************/
    const gameOverCheck = (function () {
        function setBestscoreCookie(cname, cvalue) {
            const d = new Date();
            d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
            const expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + "; " + expires;
        }

        function gameOver(message) {
            //set new highscore
            if (highscore > bestscore) {
                bestscore = highscore;
                setBestscoreCookie("bestscore", highscore);
            }
			
			$(".play-again__message").text(message);
            $("#play-again__screen").fadeIn(150);
            $("#arrow__screen").fadeOut(150);

            $(".play-again__button").focus(); //"enter" starts new game
			
			isGameOver = true;
        }

        //check if out of bounds
        function checkBounds() {
            if (position.headTop() < 0 || position.headLeft() < 0 || position.headTop() > (boxSize - snakeSize) || position.headLeft() > (boxSize - snakeSize)) {
                gameOver("Out of bounds!");
            }
        }

        //check if touching itself
        function checkTouch() {
            const headPos = [position.headTop(), position.headLeft()];
            for (let i = 0; i < bellyPosArray.length; i++) {
                if (headPos.join() === bellyPosArray[i].join()) {
                    gameOver("Stop hitting yourself!");
                    return;
                }
            }

        }

        return function () {
            checkBounds();
            checkTouch();
        };
    }());
    
    /******************* Build new snake *****************/
    function newSnake() {
        //remove old snake
        $("#snake-container").empty();
        
        //build new snake
        $('<div class="snake head">').appendTo("#snake-container");

        //build bellies and add to array
        const firstBellyTop = position.headTop() - snakeSize;
        const secondBellyTop = position.headTop() - 2 * snakeSize;
        $('<div class="snake belly">').appendTo("#snake-container").css({"top": firstBellyTop, "left": position.headLeft});
        $('<div class="snake belly">').appendTo("#snake-container").css({"top": secondBellyTop, "left": position.headLeft});

        bellyPosArray = [];
        bellyPosArray.push([firstBellyTop, position.headLeft()]);
        bellyPosArray.push([secondBellyTop, position.headLeft()]);
        
        //(re)set head direction
        moveHead.newHeadPos = function () {
            moveHead.headDirection = "down";
            const $head = $(".head");
            $head.css({
                "top": "+=" + snakeSize
            });
        };
    }   

    /********************************************/
    /**************** GAMEPLAY ******************/
    /********************************************/
    
    /************** Gameplay mechanics *************/
    function gameplay() {
        moveBelly();
        moveHead.init();
        eatAppleCheck();
        gameOverCheck();
    }
    
    /**************** Start new game ***************/	
	function newGame () {
		isGameOver = false;
        $("#play-again__screen").fadeOut(150);
		$("#arrow__screen").fadeIn(150);
		
        //(re)set highscores
		highscore = 0;
        $(".highscore").text(highscore);
        $(".bestscore").text(bestscore);
		
		newSnake();

        //run gameplay on interval (if not gameover)
		(function runGameplay() {
			gameplay();
			if (!isGameOver) {
				setTimeout(runGameplay, 100);
			}
		}());
	}
    
	newGame();
	
    /***** Play Again? screen (starting new game) *****/
    $(".play-again__button").click(function(){
        if (isGameOver) { //double-check that game really is over
			newGame();
		}
	});
});