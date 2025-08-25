// DodgingGameStarter.js
// @input SceneObject starterText
// @input SceneObject firstObstacle
// @input SceneObject leftArrow
// @input SceneObject rightArrow

// Enable starter text at the beginning
script.starterText.enabled = true;
script.firstObstacle.enabled = false;

// Initialize arrow UI (hidden at start)
script.leftArrow.enabled = false;
script.rightArrow.enabled = false;

// Flag to track if game has started
var gameStarted = false;

// Listen for tap event using Spectacles Interaction Kit
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(function() {
    // Only start the game if it hasn't started yet
    if (!gameStarted) {
        gameStarted = true;
        
        // Hide starter text and spawn first obstacle
        script.starterText.enabled = false;
        script.firstObstacle.enabled = true;
    }
});