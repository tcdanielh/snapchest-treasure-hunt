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


motionController.onTransformEvent.add((worldPosition, worldRotation) => {
  transform.setWorldPosition(worldPosition);
  transform.setWorldRotation(worldRotation);
 
});

script.basketCollider.onOverlapEnter.add(function (e) {
    var otherObj = e.overlap.collider.getSceneObject();
    if (!otherObj) {
        return;
    }

    var cubeName = otherObj.name;

    // 检查是否是新 cube
    if (!countedCubes.has(cubeName)) {
        countedCubes.add(cubeName);
        score += 1;
        script.catchAudio.play(1);
        print("New cube entered: " + cubeName + " | Total score: " + score);
    } else {
        print("Cube already counted: " + cubeName);
    }
  //print('OverlapEnter(' + e.overlap.id + '): ' + e.overlap.collider.getSceneObject().name);
   script.scoreText.text = global.score.toString() + " / " + global.boxNum.toString();
    //print(global.boxNum);
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
