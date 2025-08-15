// @input float speed = 200  // Movement speed in units per second
//@input SceneObject obstacle2;
// @input SceneObject userCamera  // Drag your AR Camera here
// @input Component.Text obstacleNum;
//@input SceneObject leftArrow;
//@input SceneObject rightArrow;




var direction = null;
var directionLocked = false;

function onUpdate(eventData) {
    var deltaTime = getDeltaTime();

    var cubePos = script.getTransform().getWorldPosition();
    var userPos = script.userCamera.getTransform().getWorldPosition();
    var distance = cubePos.distance(userPos);

    // If direction hasn't been locked and distance >= 20, track the user
    if (!directionLocked) {
        direction = userPos.sub(cubePos).normalize();

        if (distance < 100.0) {
            directionLocked = true;  // Lock direction permanently
            print("Direction locked.");
            script.obstacle2.enabled = true;
            global.remainObstacle -= 1;
            script.obstacleNum.text = global.remainObstacle.toString();
        }
    }

    // Keep moving in current direction
    if (direction) {
        var newPos = cubePos.add(direction.uniformScale(script.speed * deltaTime));
        script.getTransform().setWorldPosition(newPos);
    }

    
     // ------ Relative direction calculation ------
//    var toObstacle = cubePos.sub(userPos).normalize();
//
//    var cameraForward = script.userCamera.getTransform().forward; // Z axis
//    var cameraRight = script.userCamera.getTransform().right;     // X axis
//
//    var forwardDot = vec3.dot(toObstacle, cameraForward);
//    var rightDot = vec3.dot(toObstacle, cameraRight);
//
//
//
//    if (rightDot > 0.7) {
//        print("Obstacle is to the right");
//        script.rightArrow.enabled = true;
//    } else if (rightDot < -0.7) {
//        print("Obstacle is to the left");
//        script.leftArrow.enabled = true;
//    }

 
}



// Bind the update function to the update event
script.createEvent("UpdateEvent").bind(onUpdate);