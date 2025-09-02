//@input SceneObject radarMinigame
//@input SceneObject dodgingMinigame
//@input SceneObject basketMinigame
//@input Component.ScriptComponent treasureHuntScript
//@input SceneObject dodgingGameOverText {"hint":"Drag the GameOverText from dodging game here"}
//@input SceneObject dodgingVictoryText {"hint":"Drag the VictoryText from dodging game here"}
//@input SceneObject basketPassText {"hint":"Drag the passText from basket game here"}
//@input SceneObject basketFailText {"hint":"Drag the failText from basket game here"}
//@input Component.ScriptComponent basketSpawnScript {"hint":"Drag the spawnCube script component from basket game here"}


//Each minigame is its own Scene Object
//This script will cycle between each game based on completion, enabling the current one and disabling the rest

//The pattern: treasure hunt -> minigame (dodging/basket alternating) -> treasure hunt -> other minigame -> repeat

var gameplayEvent = script.createEvent("UpdateEvent");

// Game state management
var gameStates = {
    TREASURE_HUNT: "treasureHunt",
    DODGING_GAME: "dodgingGame", 
    BASKET_GAME: "basketGame",
    GAME_END_DELAY: "gameEndDelay"
};

var currentState = gameStates.TREASURE_HUNT;
var gameOver = false;
var nextMinigame = "dodging"; // alternates between "dodging" and "basket"

// Track completion states
var treasureFound = false;
var minigameCompleted = false;

// Timer for game end delay
var gameEndTimer = 0.0;
var gameEndDelay = 5.0; // 5 seconds delay

// Initialize game state
function initializeGame() {
    script.radarMinigame.enabled = true;
    script.dodgingMinigame.enabled = false;
    script.basketMinigame.enabled = false;
    currentState = gameStates.TREASURE_HUNT;
    treasureFound = false;
    minigameCompleted = false;
}

// Switch to minigame state
function startMinigame() {
    if (nextMinigame === "dodging") {
        script.radarMinigame.enabled = false;
        script.dodgingMinigame.enabled = true;
        script.basketMinigame.enabled = false;
        currentState = gameStates.DODGING_GAME;
        nextMinigame = "basket"; // alternate for next time
    } else {
        script.radarMinigame.enabled = false;
        script.dodgingMinigame.enabled = false;
        script.basketMinigame.enabled = true;
        currentState = gameStates.BASKET_GAME;
        nextMinigame = "dodging"; // alternate for next time
    }
    minigameCompleted = false;
}

// Switch back to treasure hunt
function startTreasureHunt() {
    script.radarMinigame.enabled = true;
    script.dodgingMinigame.enabled = false;
    script.basketMinigame.enabled = false;
    currentState = gameStates.TREASURE_HUNT;
    treasureFound = false;
    
    // Reset the appropriate minigame state
    resetDodgingGame(); // Reset dodging game state
    resetBasketGame(); // Reset basket game state
    
    // Reset treasure position for new hunt
    if (script.treasureHuntScript && script.treasureHuntScript.chooseTreasurePosition) {
        script.treasureHuntScript.chooseTreasurePosition();
    }
}

// Start the 5-second delay after a minigame ends
function startGameEndDelay() {
    currentState = gameStates.GAME_END_DELAY;
    gameEndTimer = 0.0; // Reset timer
    print("Game ended. Waiting " + gameEndDelay + " seconds before returning to treasure hunt...");
}

// Initialize the game
initializeGame();

gameplayEvent.bind(function () {
    if (gameOver) return;
    
    var deltaTime = getDeltaTime();
    
    // Check current game state and handle transitions
    switch (currentState) {
        case gameStates.TREASURE_HUNT:
            // Check if treasure has been found
            if (script.treasureHuntScript && script.treasureHuntScript.getTaskCompleted) {
                treasureFound = script.treasureHuntScript.getTaskCompleted();
                if (treasureFound) {
                    print("Treasure found! Starting minigame: " + nextMinigame);
                    startMinigame();
                }
            }
            break;
            
        case gameStates.DODGING_GAME:
            // Check if dodging minigame is completed
            if (checkDodgingGameCompleted()) {
                print("Dodging game completed! Starting 5 second delay...");
                startGameEndDelay();
            }
            break;
            
        case gameStates.BASKET_GAME:
            // Check if basket minigame is completed  
            if (checkBasketGameCompleted()) {
                print("Basket game completed! Starting 5 second delay...");
                startGameEndDelay();
            }
            break;
            
        case gameStates.GAME_END_DELAY:
            // Count down the delay timer
            gameEndTimer += deltaTime;
            if (gameEndTimer >= gameEndDelay) {
                print("Delay complete! Back to treasure hunt");
                startTreasureHunt();
            }
            break;
    }
});

// Check if dodging game is completed (win or lose)
function checkDodgingGameCompleted() {
    // Check for win condition (all obstacles dodged)
    if (global.remainObstacle !== undefined && global.remainObstacle <= 0) {
        print("Dodging game won! All obstacles dodged.");
        // Don't reset immediately - let the delay timer handle the transition
        return true;
    }
    
    // Check for lose condition (collision detected - game over text is shown)
    if (script.dodgingGameOverText && script.dodgingGameOverText.enabled) {
        print("Dodging game lost! Collision detected.");
        // Don't reset immediately - let the delay timer handle the transition
        return true;
    }
    
    return false;
}

// Reset dodging game state for next play (called when transitioning back to treasure hunt)
function resetDodgingGame() {
    // Reset obstacle count for next game
    global.remainObstacle = 7;
    
    // Hide game over and victory texts
    if (script.dodgingGameOverText) script.dodgingGameOverText.enabled = false;
    if (script.dodgingVictoryText) script.dodgingVictoryText.enabled = false;
    
    // Hide directional arrows
    if (global.arrowManager && global.arrowManager.leftArrow && global.arrowManager.rightArrow) {
        global.arrowManager.leftArrow.enabled = false;
        global.arrowManager.rightArrow.enabled = false;
    }
    
    // Reset arrow manager state
    if (global.arrowManager) {
        global.arrowManager.latestObstacle = null;
    }
    
    // You may need to disable and re-enable obstacles to reset their positions
    // This depends on your specific obstacle setup in the dodging game scene
}

function checkBasketGameCompleted() {
    // Basket win: passText enabled
    if (script.basketPassText && script.basketPassText.enabled) {
        print("Basket game won!");
        return true;
    }

    // Basket fail: failText enabled
    if (script.basketFailText && script.basketFailText.enabled) {
        print("Basket game lost!");
        return true;
    }

    return false;
}

// Reset basket game state when returning to treasure hunt
function resetBasketGame() {
    // Hide pass/fail UI
    if (script.basketPassText) script.basketPassText.enabled = false;
    if (script.basketFailText) script.basketFailText.enabled = false;

    // Reset spawn counters and globals used by spawnCube.js
    if (script.basketSpawnScript) {
        // try to reset named properties if they exist
        if (typeof script.basketSpawnScript.api !== 'undefined' && script.basketSpawnScript.api.reset) {
            // custom API reset on the component
            script.basketSpawnScript.api.reset();
        }
    }

    // Reset global counters used by basket game
    if (typeof global.boxNum !== 'undefined') global.boxNum = 0;
    if (typeof global.score !== 'undefined') global.score = -1;
    
    // You may also want to reset any spawned boxes or timers in the basket scene depending on setup
}