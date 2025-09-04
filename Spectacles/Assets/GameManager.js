//@input SceneObject radarMinigame
//@input SceneObject dodgingMinigame
//@input SceneObject basketMinigame
//@input Component.ScriptComponent treasureHuntScript
//@input SceneObject dodgingGameOverText {"hint":"Drag the GameOverText from dodging game here"}
//@input SceneObject dodgingVictoryText {"hint":"Drag the VictoryText from dodging game here"}
//@input SceneObject basketPassText {"hint":"Drag the passText from basket game here"}
//@input SceneObject basketFailText {"hint":"Drag the failText from basket game here"}

// UI and world objects for treasure result flow
//@input SceneObject chestClosed {"hint":"Closed chest object near treasure"}
//@input SceneObject chestOpen {"hint":"Open chest object near treasure"}
//@input SceneObject redPanda {"hint":"Red Panda guard model"}
//@input SceneObject promptTapStartMinigame {"hint":"Prompt shown when treasure found (Tap to start challenge)"}
//@input SceneObject aliensTookItMessage {"hint":"Message to show on fail: aliens took it away"}
//@input SceneObject promptTapReturn {"hint":"Prompt shown after result to tap to return"}
//@input SceneObject treasureSuccessText {"hint":"Shown when player wins a minigame: 'You got the treasure!'"}

// Start screens (4 pages)
//@input SceneObject startScreen1
//@input SceneObject startScreen2
//@input SceneObject startScreen3
//@input SceneObject startScreen4

// Finish UI
//@input SceneObject finishPanel
//@input Component.Text finishTimeText
//@input Component.Text timerText {"hint":"HUD timer text always visible"}
//@input Component.Text treasureCountText {"hint":"HUD progress text: 'Treasure Found X/2'"}


//Each minigame is its own Scene Object
//This script will cycle between each game based on completion, enabling the current one and disabling the rest

//The pattern: treasure hunt -> minigame (dodging/basket alternating) -> treasure hunt -> other minigame -> repeat

var gameplayEvent = script.createEvent("UpdateEvent");
var tapEvent = script.createEvent("TapEvent");

// Game state management
var gameStates = {
    START_SCREENS: "startScreens",
    TREASURE_HUNT: "treasureHunt",
    TREASURE_FOUND_WAIT_TAP: "treasureFoundWaitTap",
    DODGING_GAME: "dodgingGame", 
    BASKET_GAME: "basketGame",
    LOSE_DELAY: "loseDelay",
    SUCCESS_DELAY: "successDelay",
    RESULT_WAIT_TAP: "resultWaitTap",
    FINISHED: "finished"
};

var currentState = gameStates.START_SCREENS;
var gameOver = false;
var nextMinigame = "dodging"; // starts with dodging

// Track completion states
var treasureFound = false;
var minigameCompleted = false;

// Session timer
var sessionTimer = 0.0;
var timerRunning = false;

// Start screen paging
var startPageIndex = 0; // 0..3 for 4 screens

// Success tracking
var dodgingSuccess = false;
var basketSuccess = false;
// Lose delay timer
var loseDelayTimer = 0.0;
var loseDelayDuration = 1.0; // seconds
var pendingLoseSource = null; // "dodging" or "basket"
// Success delay (to allow win audio to play before disabling the minigame)
var successDelayTimer = 0.0;
var successDelayDuration = 2.0; // seconds
var pendingSuccessSource = null; // "dodging" or "basket"

// Initialize game state
function initializeGame() {
    // Hide gameplay objects initially
    setRadarEnabled(false);
    setDodgingEnabled(false);
    setBasketEnabled(false);
    hideTreasureUI();
    hideResultUI();
    showStartScreen(0);
    currentState = gameStates.START_SCREENS;
    treasureFound = false;
    minigameCompleted = false;
    dodgingSuccess = false;
    basketSuccess = false;
    sessionTimer = 0.0;
    timerRunning = false;
    // Reset delay helpers
    loseDelayTimer = 0.0;
    pendingLoseSource = null;
    successDelayTimer = 0.0;
    pendingSuccessSource = null;
    // Initialize timer HUD
    if (script.timerText) {
        script.timerText.text = formatTime(0);
        script.timerText.enabled = true;
    }
    // Initialize treasure progress HUD
    if (script.treasureCountText) {
        script.treasureCountText.text = getTreasureProgressText(0);
        script.treasureCountText.enabled = true;
    }
}

function setRadarEnabled(v) { if (script.radarMinigame) script.radarMinigame.enabled = v; }
function setDodgingEnabled(v) { if (script.dodgingMinigame) script.dodgingMinigame.enabled = v; }
function setBasketEnabled(v) { if (script.basketMinigame) script.basketMinigame.enabled = v; }

function hideTreasureUI() {
    if (script.chestClosed) script.chestClosed.enabled = false;
    if (script.chestOpen) script.chestOpen.enabled = false;
    if (script.redPanda) script.redPanda.enabled = false;
    if (script.promptTapStartMinigame) script.promptTapStartMinigame.enabled = false;
}

function hideResultUI() {
    if (script.aliensTookItMessage) script.aliensTookItMessage.enabled = false;
    if (script.promptTapReturn) script.promptTapReturn.enabled = false;
    if (script.treasureSuccessText) script.treasureSuccessText.enabled = false;
}

function showStartScreen(index) {
    startPageIndex = index;
    var screens = [script.startScreen1, script.startScreen2, script.startScreen3, script.startScreen4];
    for (var i = 0; i < screens.length; i++) {
        if (screens[i]) screens[i].enabled = (i === index);
    }
}

// Switch to minigame state
function startMinigame() {
    hideTreasureUI();
    hideResultUI();
    setRadarEnabled(false);

    // Determine which minigame is next based on success gating
    if (!dodgingSuccess) {
        nextMinigame = "dodging";
        setDodgingEnabled(true);
        setBasketEnabled(false);
        currentState = gameStates.DODGING_GAME;
    } else if (!basketSuccess) {
        nextMinigame = "basket";
        setDodgingEnabled(false);
        setBasketEnabled(true);
        // Auto-start basket game via API if available
        if (global && typeof global.startBasketGame === 'function') {
            global.startBasketGame();
        } else if (script.basketMinigame && script.basketMinigame.getComponent) {
            // optional: if a component exposes api.startGame
            var comps = script.basketMinigame.getComponents("Component.ScriptComponent");
            for (var i = 0; i < comps.length; i++) {
                var comp = comps[i];
                if (comp && comp.api && comp.api.startGame) { comp.api.startGame(); break; }
            }
        }
        currentState = gameStates.BASKET_GAME;
    }
    minigameCompleted = false;
}

// Switch back to treasure hunt
function startTreasureHunt() {
    setRadarEnabled(true);
    setDodgingEnabled(false);
    setBasketEnabled(false);
    currentState = gameStates.TREASURE_HUNT;
    treasureFound = false;
    
    // Reset the appropriate minigame state
    resetDodgingGame(); // Reset dodging game state
    resetBasketGame(); // Reset basket game state
    
    // Reset treasure position for new hunt
    if (script.treasureHuntScript && script.treasureHuntScript.chooseTreasurePosition) {
        script.treasureHuntScript.chooseTreasurePosition();
    }
    hideTreasureUI();
    hideResultUI();
}

// Start the 5-second delay after a minigame ends
// no longer used (tap-driven flow)

// Initialize the game
initializeGame();

gameplayEvent.bind(function () {
    if (gameOver) return;
    
    var deltaTime = getDeltaTime();
    if (timerRunning) {
        sessionTimer += deltaTime;
        if (script.timerText) {
            script.timerText.text = formatTime(sessionTimer);
        }
    }
    
    // Check current game state and handle transitions
    switch (currentState) {
        case gameStates.START_SCREENS:
            // Waiting for taps, nothing per-frame
            break;

        case gameStates.TREASURE_HUNT:
            // Check if treasure has been found
            if (script.treasureHuntScript && script.treasureHuntScript.getTaskCompleted) {
                treasureFound = script.treasureHuntScript.getTaskCompleted();
                if (treasureFound) {
                    print("Treasure found! Show chest & panda, wait for tap to start challenge");
                    // Position chest/panda at treasure
                    if (script.treasureHuntScript.getTreasurePosition) {
                        var pos = script.treasureHuntScript.getTreasurePosition();
                        if (script.chestClosed) script.chestClosed.getTransform().setWorldPosition(pos);
                        if (script.chestOpen) script.chestOpen.getTransform().setWorldPosition(pos);
                        // Place red panda 50 units in front of the chest (using chest forward),
                        // default to world -Z if chest not available
                        if (script.redPanda) {
                            var fwd = new vec3(0, 0, -1);
                            if (script.chestClosed) {
                                fwd = script.chestClosed.getTransform().forward;
                            } else if (script.chestOpen) {
                                fwd = script.chestOpen.getTransform().forward;
                            }
                            // Normalize and offset by 50
                            var dir = fwd.normalize ? fwd.normalize() : fwd;
                            var pandaPos = pos.add(dir.uniformScale(50));
                            script.redPanda.getTransform().setWorldPosition(pandaPos);
                        }
                    }
                    // Ensure proximity target (e.g., open chest from spawn script) is hidden
                    if (script.treasureHuntScript.hideTargetObject) {
                        script.treasureHuntScript.hideTargetObject();
                    }
                    // Show closed chest and panda, prompt to start
                    if (script.chestClosed) script.chestClosed.enabled = true;
                    if (script.chestOpen) script.chestOpen.enabled = false;
                    if (script.redPanda) script.redPanda.enabled = true;
                    if (script.promptTapStartMinigame) script.promptTapStartMinigame.enabled = true;
                    currentState = gameStates.TREASURE_FOUND_WAIT_TAP;
                }
            }
            break;
            
        case gameStates.DODGING_GAME:
            // Check if dodging minigame is completed
            var dodgeResult = getDodgingResult();
        if (dodgeResult) {
                // Show result UI at chest
                if (dodgeResult === "success") {
                    dodgingSuccess = true;
                    updateTreasureCountText();
                    // If this completes both treasures, show Victory immediately but delay disabling
                    if (basketSuccess) {
                        timerRunning = false;
                        if (script.finishPanel) script.finishPanel.enabled = true;
                        if (script.finishTimeText) script.finishTimeText.text = formatTime(sessionTimer);
                        hideTreasureUI();
                        hideResultUI();
                        setRadarEnabled(false);
                        pendingSuccessSource = "dodging";
                        successDelayTimer = 0.0;
                        currentState = gameStates.SUCCESS_DELAY;
                        break;
                    }
                    // First success only: proceed with chest UI and disable minigame
                    setDodgingEnabled(false);
                    if (script.chestOpen) script.chestOpen.enabled = true;
                    if (script.chestClosed) script.chestClosed.enabled = false;
                    if (script.aliensTookItMessage) script.aliensTookItMessage.enabled = false;
                    if (script.treasureSuccessText) script.treasureSuccessText.enabled = true;
                    if (script.promptTapReturn) script.promptTapReturn.enabled = true;
                    currentState = gameStates.RESULT_WAIT_TAP;
                } else {
                    // Start lose delay to allow SFX to play
                    pendingLoseSource = "dodging";
                    loseDelayTimer = 0.0;
                    currentState = gameStates.LOSE_DELAY;
                }
            }
            break;
            
        case gameStates.BASKET_GAME:
            // Check if basket minigame is completed  
            var basketResult = getBasketResult();
        if (basketResult) {
                if (basketResult === "success") {
                    basketSuccess = true;
                    updateTreasureCountText();
                    // If both treasures are completed now, show Victory immediately but delay disabling
                    if (dodgingSuccess) {
                        timerRunning = false;
                        if (script.finishPanel) script.finishPanel.enabled = true;
                        if (script.finishTimeText) script.finishTimeText.text = formatTime(sessionTimer);
                        hideTreasureUI();
                        hideResultUI();
                        setRadarEnabled(false);
                        pendingSuccessSource = "basket";
                        successDelayTimer = 0.0;
                        currentState = gameStates.SUCCESS_DELAY;
                        break;
                    }
                    // First success only: proceed with chest UI and disable minigame
                    setBasketEnabled(false);
                    if (script.chestOpen) script.chestOpen.enabled = true;
                    if (script.chestClosed) script.chestClosed.enabled = false;
                    if (script.aliensTookItMessage) script.aliensTookItMessage.enabled = false;
                    if (script.treasureSuccessText) script.treasureSuccessText.enabled = true;
                    if (script.promptTapReturn) script.promptTapReturn.enabled = true;
                    currentState = gameStates.RESULT_WAIT_TAP;
                } else {
                    pendingLoseSource = "basket";
                    loseDelayTimer = 0.0;
                    currentState = gameStates.LOSE_DELAY;
                }
            }
            break;

        case gameStates.LOSE_DELAY:
            // Wait briefly before showing the fail UI
            loseDelayTimer += deltaTime;
            if (loseDelayTimer >= loseDelayDuration) {
                // Show fail UI now
                if (script.chestOpen) script.chestOpen.enabled = false;
                if (script.chestClosed) script.chestClosed.enabled = true;
                if (script.aliensTookItMessage) script.aliensTookItMessage.enabled = true;
                if (script.treasureSuccessText) script.treasureSuccessText.enabled = false;
                if (script.promptTapReturn) script.promptTapReturn.enabled = true;
                // Now disable the minigame we just failed
                if (pendingLoseSource === "dodging") {
                    setDodgingEnabled(false);
                } else if (pendingLoseSource === "basket") {
                    setBasketEnabled(false);
                }
                currentState = gameStates.RESULT_WAIT_TAP;
                pendingLoseSource = null;
            }
            break;

        case gameStates.SUCCESS_DELAY:
            // Keep the winning minigame enabled briefly so its win audio can finish
            successDelayTimer += deltaTime;
            if (successDelayTimer >= successDelayDuration) {
                if (pendingSuccessSource === "dodging") {
                    setDodgingEnabled(false);
                } else if (pendingSuccessSource === "basket") {
                    setBasketEnabled(false);
                }
                pendingSuccessSource = null;
                currentState = gameStates.FINISHED;
            }
            break;

        case gameStates.RESULT_WAIT_TAP:
            // Waiting for tap handled by tapEvent
            break;

        case gameStates.FINISHED:
            // Nothing to update
            // Keep showing final time on HUD as well
            if (script.timerText) {
                script.timerText.text = formatTime(sessionTimer);
            }
            break;
    }
});

// Check if dodging game is completed (win or lose)
function getDodgingResult() {
    // Win condition (all obstacles dodged)
    if (global.remainObstacle !== undefined && global.remainObstacle <= 0) {
        print("Dodging game won! All obstacles dodged.");
        return "success";
    }
    // Lose condition (collision)
    if (script.dodgingGameOverText && script.dodgingGameOverText.enabled) {
        print("Dodging game lost! Collision detected.");
        return "fail";
    }
    return null;
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

function getBasketResult() {
    if (script.basketPassText && script.basketPassText.enabled) {
        print("Basket game won!");
        return "success";
    }
    if (script.basketFailText && script.basketFailText.enabled) {
        print("Basket game lost!");
        return "fail";
    }
    return null;
}

// Reset basket game state when returning to treasure hunt
function resetBasketGame() {
    // Hide pass/fail UI
    if (script.basketPassText) script.basketPassText.enabled = false;
    if (script.basketFailText) script.basketFailText.enabled = false;

    // Call the global reset function instead of script API to avoid read-only issues
    if (typeof global.resetBasketSpawner === 'function') {
        global.resetBasketSpawner();
    } else {
        // Fallback reset if global function not available
        if (typeof global.boxNum !== 'undefined') global.boxNum = 0;
        if (typeof global.score !== 'undefined') global.score = -1;
    }
}

// Handle taps globally based on state
tapEvent.bind(function () {
    switch (currentState) {
        case gameStates.START_SCREENS:
            if (startPageIndex < 3) {
                showStartScreen(startPageIndex + 1);
            } else {
                // End of start screens: hide them and start treasure hunt + timer
                showStartScreen(-1); // hide all
                var screens = [script.startScreen1, script.startScreen2, script.startScreen3, script.startScreen4];
                for (var i = 0; i < screens.length; i++) { if (screens[i]) screens[i].enabled = false; }
                timerRunning = true;
                startTreasureHunt();
            }
            break;

        case gameStates.TREASURE_FOUND_WAIT_TAP:
            // Tap to enter the appropriate minigame
            startMinigame();
            break;

        case gameStates.RESULT_WAIT_TAP:
            // Tap to return to treasure hunt (unless finished)
            if (dodgingSuccess && basketSuccess) {
                // Completed both: finish session
                timerRunning = false;
                if (script.finishPanel) script.finishPanel.enabled = true;
                if (script.finishTimeText) script.finishTimeText.text = formatTime(sessionTimer);
                if (script.timerText) script.timerText.text = formatTime(sessionTimer);
                hideTreasureUI();
                hideResultUI();
                setRadarEnabled(false);
                currentState = gameStates.FINISHED;
            } else {
                hideResultUI();
                startTreasureHunt();
            }
            break;

        case gameStates.FINISHED:
            // Could reset/restart on tap if desired
            break;
    }
});

function formatTime(t) {
    var totalMs = Math.floor(t * 1000);
    var minutes = Math.floor(totalMs / 60000);
    var seconds = Math.floor((totalMs % 60000) / 1000);
    var ms = totalMs % 1000;
    function pad(n, w) { n = n.toString(); return n.length >= w ? n : new Array(w - n.length + 1).join('0') + n; }
    return pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(Math.floor(ms/10), 2);
}

// HUD: Treasure progress helpers
function getTreasureProgressText(count) {
    return "Treasure Found: " + count + "/2";
}

function updateTreasureCountText() {
    if (!script.treasureCountText) { return; }
    var count = 0;
    if (dodgingSuccess) { count++; }
    if (basketSuccess) { count++; }
    script.treasureCountText.text = getTreasureProgressText(count);
}