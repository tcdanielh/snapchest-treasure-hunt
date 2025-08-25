// -----JS CODE-----

// @input Asset.ObjectPrefab cubePrefab
// @input float spawnRangeX = 5.0
// @input float spawnRangeZ = 5.0
// @input float spawnHeight = 10.0
// @input float cubeScale = 1.0
// @input float fallSpeed = 100.0 // fallback fall speed
// @input int cubeNum = 0;
//@input Component.Text scoreText;
// @input Component.AudioComponent winAudio;
// @input SceneObject passText;
// @input SceneObject failText;

global.boxNum = 0;
// Spawn a cube at a random position
function spawnCube() {
    var instance = script.cubePrefab.instantiate(script.getSceneObject());
    
     script.cubeNum += 1;
    global.boxNum += 1;
    instance.name = "box" + script.cubeNum;


    var posX = getRandomInRange(-script.spawnRangeX, script.spawnRangeX);
    var posZ = getRandomInRange(-70, -50);
    //var posZ = -50;
    var posY = script.spawnHeight;

    var cubeTransform = instance.getTransform();
    cubeTransform.setLocalPosition(new vec3(posX, posY, posZ));
    cubeTransform.setLocalScale(new vec3(script.cubeScale, script.cubeScale, script.cubeScale));

    var rigidbody = instance.getComponent("Physics.RigidbodyComponent");
    if (rigidbody) {
        rigidbody.enabled = true;
    } else {
        //fallWithScript(instance);
    }
    script.scoreText.text = global.score.toString() + " / " + global.boxNum.toString();
}

// Simulate falling if no Rigidbody
function fallWithScript(obj) {
    var transform = obj.getTransform();

    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(function () {
        var pos = transform.getLocalPosition();
        pos.y -= script.fallSpeed * getDeltaTime();
        transform.setLocalPosition(pos);

        if (pos.y < 0) {
            script.removeEvent(updateEvent);
        }
    });
}

// Utility: Random float in range
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Set up a timer to spawn every 2 seconds
var spawnEvent = script.createEvent("UpdateEvent");
var timer = 0.0;
var interval = 2.0;
var gameOver = false;

spawnEvent.bind(function () {
    timer += getDeltaTime();
    if (gameOver == false && timer >= interval && script.cubeNum < 20) {
        spawnCube();
        timer = 0.0;
        //print("generate");
//        script.cubeNum += 1;
//        global.boxNum += 1;
        
    }
    else if (gameOver == false && script.cubeNum == 20) {
        if (global.score > 5) {
            script.passText.enabled = true;
            script.winAudio.play(1);

        }
        else {
            script.failText.enabled = true;
        }
        gameOver = true;
    }
    
});

