//@input SceneObject basket;
//@input Physics.ColliderComponent basketCollider;
//@input Component.Text scoreText;
//@input Component.AudioComponent catchAudio;


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

//print(debugObject(script.basket));

var countedCubes = new Set();
global.score = -1;

function findCubeRoot(obj) {
    var cur = obj;
    while (cur) {
        if (cur.name && cur.name.indexOf("box") === 0) {
            return cur;
        }
        cur = cur.getParent ? cur.getParent() : null;
    }
    return null;
}


motionController.onTransformEvent.add((worldPosition, worldRotation) => {
  transform.setWorldPosition(worldPosition);
  transform.setWorldRotation(worldRotation);
 
});

script.basketCollider.onOverlapEnter.add(function (e) {
    var otherObj = e.overlap.collider.getSceneObject();
    if (!otherObj) {
        return;
    }

    // Find the cube root object named boxN to avoid disabling basket parts
    var cubeObj = findCubeRoot(otherObj);
    if (!cubeObj) {
        // Not a cube we spawned; ignore
        return;
    }

    var cubeName = cubeObj.name;

    // New cube catch?
    if (!countedCubes.has(cubeName)) {
        countedCubes.add(cubeName);
        global.score += 1;
        if (script.catchAudio) { script.catchAudio.play(1); }
        print("New cube entered: " + cubeName + " | Total score: " + global.score);
    } else {
        print("Cube already counted: " + cubeName);
    }

    if (script.scoreText) {
        script.scoreText.text = global.score.toString() + " / " + global.boxNum.toString();
    }

    // Disable the cube we caught
    cubeObj.enabled = false;
});

//script.basketCollider.onOverlapStay.add(function (e) {
//  var overlapCount = e.currentOverlapCount;
//  if (overlapCount == 0) {
//    return;
//  }
//  var overlaps = e.currentOverlaps;
//  for (var i = 0; i < overlaps.length; ++i) {
//    var overlap = overlaps[i];
//    print(
//      'Overlap[' + i + ']: id=' + overlap.id + ', collider=' + overlap.collider
//    );
//  }
//});

//script.basketCollider.onOverlapExit.add(function (e) {
//  print('OverlapExit(' + e.overlap.id + ')');
//});

//script.basketCollider.onCollisionStay.add(function (e) {
//  var collision = e.collision;
//  print('CollisionStay(' + collision.id + '): ---> ' + collision.collider);
//});
