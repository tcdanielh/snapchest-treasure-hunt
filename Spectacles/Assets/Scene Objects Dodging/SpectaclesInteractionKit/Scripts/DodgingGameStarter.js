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

// Listen for tap event using Spectacles Interaction Kit
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(function() {
    // Hide starter text and spawn first obstacle
    script.starterText.enabled = false;
    script.firstObstacle.enabled = true;
});