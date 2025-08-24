// DodgingGameStarter.js
// @input SceneObject starterText
// @input SceneObject firstObstacle

// Enable starter text at the beginning
script.starterText.enabled = true;
script.firstObstacle.enabled = false;

// Listen for tap event using Spectacles Interaction Kit
var tapEvent = script.createEvent("TapEvent");
tapEvent.bind(function() {
    // Hide starter text and spawn first obstacle
    script.starterText.enabled = false;
    script.firstObstacle.enabled = true;
});