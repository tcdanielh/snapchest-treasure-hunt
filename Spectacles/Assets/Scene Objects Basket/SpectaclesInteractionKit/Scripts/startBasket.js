// @input SceneObject starterText
// @input SceneObject basketGameManager
// @input SceneObject basketController
// @input SceneObject leftArrow
// @input SceneObject rightArrow

// Enable starter text at the beginning
script.starterText.enabled = true;
script.basketGameManager.enabled = false;
script.basketController.enabled = false;

// Initialize arrow UI (hidden at start)
script.leftArrow.enabled = false;
script.rightArrow.enabled = false;

// Listen for tap event using Spectacles Interaction Kit
var tapEvent = script.createEvent("TapEvent");
var startGame = false;

tapEvent.bind(function() {
    if (startGame == false) {
        // Hide starter text and start the game
        script.starterText.enabled = false;
        script.basketGameManager.enabled = true;
        script.basketController.enabled = true;
        startGame = true;
    }

});

// Allow external start (from GameManager)
global.startBasketGame = function () {
    if (!startGame) {
        script.starterText.enabled = false;
        script.basketGameManager.enabled = true;
        script.basketController.enabled = true;
        startGame = true;
    }
};