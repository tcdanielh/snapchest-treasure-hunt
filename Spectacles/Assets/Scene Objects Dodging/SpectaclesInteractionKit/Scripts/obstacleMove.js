// @input float speed = 200  // Movement speed in units per second
//@input SceneObject obstacle2;
// @input SceneObject userCamera  // Drag your AR Camera here
// @input Component.Text obstacleNum;
//@input SceneObject leftArrow;
//@input SceneObject rightArrow;
// @input Component.AudioComponent swooshSound;




var direction = null;
var directionLocked = false;
var hasPlayedSwoosh = false;
var obstacleId = Date.now() + Math.random(); // Unique ID based on spawn time
var previousDistance = Infinity; // Track previous distance to determine if moving towards or away
var hasPassedPlayer = false; // Track if obstacle has passed the player
var nextObstacleEnabled = false; // Track if next obstacle has been enabled

// Initialize global arrow management if it doesn't exist
if (!global.arrowManager) {
    global.arrowManager = {
        latestObstacle: null,
        leftArrow: null,
        rightArrow: null
    };
}

// Don't set this as latest obstacle immediately - wait until direction locks
// Actually, set it immediately so arrows can show early
global.arrowManager.latestObstacle = obstacleId;

function onUpdate(eventData) {
    var deltaTime = getDeltaTime();

    var cubePos = script.getTransform().getWorldPosition();
    var userPos = script.userCamera.getTransform().getWorldPosition();
    var distance = cubePos.distance(userPos);

    // Set arrow references in global manager if not set
    if (!global.arrowManager.leftArrow && script.leftArrow) {
        global.arrowManager.leftArrow = script.leftArrow;
        global.arrowManager.rightArrow = script.rightArrow;
    }

    // If direction hasn't been locked and distance >= 20, track the user
    if (!directionLocked) {
        direction = userPos.sub(cubePos).normalize();

        if (distance < 100.0) {
            directionLocked = true;  // Lock direction permanently
            print("Direction locked.");
            // Don't enable next obstacle here - wait until this one passes the player
            global.remainObstacle -= 1;
            script.obstacleNum.text = global.remainObstacle.toString();
            
            // Set this as the latest obstacle when direction locks (not when spawning)
            global.arrowManager.latestObstacle = obstacleId;
        }
    }

    // Keep moving in current direction
    if (direction) {
        var newPos = cubePos.add(direction.uniformScale(script.speed * deltaTime));
        script.getTransform().setWorldPosition(newPos);
        
        // Play swoosh sound when obstacle passes close to player (within 5 units)
        if (!hasPlayedSwoosh && distance < 5.0 && script.swooshSound) {
            script.swooshSound.play(1);
            hasPlayedSwoosh = true;
        }
    }

    
     // ------ Relative direction calculation ------
    var toObstacle = cubePos.sub(userPos).normalize();

    var cameraForward = script.userCamera.getTransform().forward; // Z axis
    var cameraRight = script.userCamera.getTransform().right;     // X axis

    var forwardDot = toObstacle.dot(cameraForward);
    var rightDot = toObstacle.dot(cameraRight);

    // Only show arrows for the latest spawned obstacle (remove directionLocked requirement for early warning)
    if (distance < 1000.0 && global.arrowManager.latestObstacle === obstacleId) {
        // Check if obstacle is moving towards the player (distance decreasing)
        var isMovingTowards = distance < previousDistance;
        
        if (isMovingTowards) {
            // Update arrow display
            if (global.arrowManager.leftArrow && global.arrowManager.rightArrow) {
                if (rightDot > 0.3) {
                    global.arrowManager.rightArrow.enabled = true;
                    global.arrowManager.leftArrow.enabled = false;
                } else if (rightDot < -0.3) {
                    global.arrowManager.leftArrow.enabled = true;
                    global.arrowManager.rightArrow.enabled = false;
                } else {
                    global.arrowManager.leftArrow.enabled = false;
                    global.arrowManager.rightArrow.enabled = false;
                }
            }
        } else {
            // Hide arrows if obstacle is moving away from the player
            if (global.arrowManager.leftArrow && global.arrowManager.rightArrow) {
                global.arrowManager.leftArrow.enabled = false;
                global.arrowManager.rightArrow.enabled = false;
            }
        }
    } else if (global.arrowManager.latestObstacle === obstacleId) {
        // Hide arrows if this is the latest obstacle but out of range
        if (global.arrowManager.leftArrow && global.arrowManager.rightArrow) {
            global.arrowManager.leftArrow.enabled = false;
            global.arrowManager.rightArrow.enabled = false;
        }
    }
    
    // Check if obstacle has passed the player and enable next obstacle
    if (directionLocked && !nextObstacleEnabled) {
        var isMovingAway = distance > previousDistance;
        
        if (isMovingAway && !hasPassedPlayer) {
            hasPassedPlayer = true;
            print("Obstacle has passed the player. Enabling next obstacle.");
            if (script.obstacle2) {
                script.obstacle2.enabled = true;
                nextObstacleEnabled = true;
            }
        }
    }
    
    // Update previous distance for next frame
    previousDistance = distance;

 
}



// Bind the update function to the update event
script.createEvent("UpdateEvent").bind(onUpdate);