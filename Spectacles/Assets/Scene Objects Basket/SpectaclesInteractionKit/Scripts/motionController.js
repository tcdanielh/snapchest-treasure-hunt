//@input SceneObject mySceneObj

function debugObject(obj) {
    if (obj === null) return "null";
    if (obj === undefined) return "undefined";
    
    var result = "{\n";
    for (var key in obj) {
        try {
            var value = obj[key];
            // Handle circular references and complex objects
            if (typeof value === "object" && value !== null) {
                value = "[object " + (value.constructor ? value.constructor.name : "Object") + "]";
            }
            result += "  " + key + ": " + value + "\n";
        } catch (e) {
            result += "  " + key + ": [Error accessing property]\n";
        }
    }
    result += "}";
    return result;
}



const MotionControllerModule = require('LensStudio:MotionControllerModule');
let options = MotionController.Options.create();
options.motionType = MotionController.MotionType.SixDoF;
const motionController = MotionControllerModule.getController(options);


const sceneObject = script.getSceneObject();
const transform = sceneObject.getTransform();

var lastPosition = null;
var lastShakeTime = 0;
var shakeThreshold = 5.0; // Adjust this based on sensitivity
var minShakeInterval = 500; // milliseconds between valid shake events
var shakeTime = 0;

function detectShake(currentPosition) {
    var currentTime = getTime() * 1000; // ms

    if (lastPosition) {
        var dx = currentPosition.x - lastPosition.x;
        var dy = currentPosition.y - lastPosition.y;
        var dz = currentPosition.z - lastPosition.z;

        var distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance > shakeThreshold && (currentTime - lastShakeTime > minShakeInterval)) {
            lastShakeTime = currentTime;
            shakeTime += 1;
            print("Shake detected by position change!" + shakeTime);
            // Insert your shake response logic here
           
            var boxTransform = script.mySceneObj.getTransform();
            var crrentScale = boxTransform.getLocalScale();
            print(debugObject(crrentScale));
            boxTransform.setLocalScale(new vec3(crrentScale.x + 1, crrentScale.y, crrentScale.z))
            
            
        }
    }

    lastPosition = currentPosition;
}

motionController.onTransformEvent.add((worldPosition, worldRotation) => {
  transform.setWorldPosition(worldPosition);
  transform.setWorldRotation(worldRotation);
   //print(debugObject(motionController.onTransformEvent));
    //print(worldPosition);
    detectShake(worldPosition);
});







motionController.onTouchEvent.add(eventData => {
//    switch (eventData.phase) {
//        case MotionController.TouchPhase.Began:
//            print("Began touch")
//            break;
//        case MotionController.TouchPhase.Canceled:
//            print("Canceled touch")
//            break;
//        case MotionController.TouchPhase.Moved:
//            print("Touch moved")
//            break;
//        case MotionController.TouchPhase.Ended:
//            print("Touch Ended")
//            break;
//    }
    
    //print(MotionController.onTouchEvent)
})



print("Available props in motionController:\n" + debugObject(motionController));
