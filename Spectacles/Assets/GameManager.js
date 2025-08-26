//@input SceneObject radarMinigame
//@input SceneObject dodgingMinigame
//@input SceneObject basketMinigame


//Each minigame is its own Scene Object
//This script will cycle between each game in sequence, enabling the current one and disabling the rest

//The current pattern of minigames is treasure hunt with radar, minigame, treasure hunt, minigame and so on.

var gameplayEvent = script.createEvent("UpdateEvent");
var timer = 0.0;
var interval = 2.0;


var gameOver = false;
var treasurePlay1 = false;
var dodgingPlay = false;
var treasurePlay2 = false;
var basketPlay = false;

script.radarMinigame.enabled = false;
script.dodgingMinigame.enabled = false;
script.basketMinigame.enabled = false;

gameplayEvent.bind(function () {
    timer += getDeltaTime();

    //Change the timer conditions to when the gameplay condition is met
    if (gameOver == false && timer >= 2.0 && treasurePlay1 == false) {
        script.radarMinigame.enabled = true;
        script.dodgingMinigame.enabled = false;
        script.basketMinigame.enabled = false;
        treasurePlay1 = true;
    }
    else if (gameOver == false && timer >= 7.0 && dodgingPlay == false) {
        script.radarMinigame.enabled = false;
        script.dodgingMinigame.enabled = true;
        script.basketMinigame.enabled = false;
        dodgingPlay = true;
    }
    else if (gameOver == false && timer >= 12.0 && treasurePlay2 == false) {
        script.radarMinigame.enabled = true;
        script.dodgingMinigame.enabled = false;
        script.basketMinigame.enabled = false;
        treasurePlay2 = true;
    }
    else if (gameOver == false && timer >= 17.0 && basketPlay == false) {
        script.radarMinigame.enabled = false;
        script.dodgingMinigame.enabled = false;
        script.basketMinigame.enabled = true;
        basketPlay = true;
    }
    
    
});