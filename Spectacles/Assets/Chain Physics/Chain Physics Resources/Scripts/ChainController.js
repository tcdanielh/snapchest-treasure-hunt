// ChainController.js
// Version: 1.2
// Event: Lens Initialized
// Description: A controller script that allows you to create a chain like movement of an array of sceneObjects attached by the fist link 

//@input SceneObject[] joints

//@ui {"widget" : "separator"}
//@input int anchorCount = 1 {"widget":"combobox", "values" : [{"label" : "First", "value" : "1"}, {"label" : "First And Last", "value" : "2"}], "label":"Anchors"}
//@ui {"widget" : "separator"}

//@input float stiffness = 1.0 {"widget":"slider","min":"0.01","max":"1.0", "step": " 0.1"}
//@input int type = 0 {"widget":"combobox", "values" : [{"label" : "Rigid", "value" : "0"}, {"label" : "Elastic", "value" : "1"}]}
//@input int iterations = 1 {"widget":"slider","min":"1","max":"30", "step": "1"}
//@input float timeSpeed = 1.0

//@ui {"widget" : "separator"}

//@input vec3 force = {0.0, -1.0, 0.0}
//@input bool isRelative = false
//@input SceneObject relativeTo {"showIf" : "isRelative"}

//@ui {"widget" : "separator"}

//@input bool addRotation = false

//@ui {"widget" : "separator"}
//@input bool useCollider = false
//@input SceneObject collider {"showIf" : "useCollider"}
//@input float colliderForce {"showIf" : "useCollider"}
//@input float sizeMutiplier = 6.0  {"showIf" : "useCollider"} // this is a radius of a built in sphere 

const PBD = require("./PositionBasedDynamicsModule");
const MathLib = require("./JSMathLibraryModule").MathLib;

var points = [];
var constraints = [];
var links = [];

var timeSpeed = 33.0 * script.timeSpeed;
var deltaTime = 0.033;

var relativeToTransform;
var colliderTransform;
var acc;

var firstIndex = 0;
var lastIndex = script.joints.length - 1;

if (checkValid()) {
    initialize();
}

function checkValid() {
    if (script.isRelative) {
        if (!script.relativeTo) {
            print("Warning, please set the RelativeTo sceneobject force is relative to");
            return false;
        }
        relativeToTransform = script.relativeTo.getTransform();
    }

    if (script.iterations <= 0) {
        print("Warning, iteration count should be > 0");
        return false;
    }

    if (script.iterations <= 0) {
        print("Warning, iteration count should be > 0");
        return false;
    }
    for (var i = 0; i < script.joints.length; i++) {
        if (!script.joints[i]) {
            print("Warning, some of the chain joints are not set, simulation will not run. Set a joint or delete empty field");
            return false;
        }
    }
    if (script.useCollider) {
        if (script.collider) {
            colliderTransform = script.collider.getTransform();
        }
        else {
            print("Warning, Please set collider sphere Scene Object");
            return false;
        }
    }
    return true;
}

function initialize() {
    for (var i = 0; i < script.joints.length; i++) {
        var transform = script.joints[i].getTransform();
        links.push({
            transform: transform,
            startRot: MathLib.quat.fromEngine(transform.getWorldRotation()),
            startDir: null
        })
        var pos = MathLib.vec3.fromEngine(transform.getWorldPosition());
        var p;
        if (i == 0 || i == script.joints.length - 1 && script.anchorCount == 2) {
            p = new PBD.Point(0.0, pos);//creating static particle for both start and end
            points.push(p);
        } else {
            p = new PBD.Point(1.0, pos);
            points.push(p);
        }
    }

    for (var i = 0; i < script.joints.length; i++) {
        if (i > 0) {
            var c = new PBD.Constraint(points[i - 1], points[i], script.stiffness, script.type == 0);
            constraints.push(c);// forward constraints
            links[i - 1].startDir = points[i].getPosition().sub(points[i - 1].getPosition());
        }
        if (i < lastIndex && script.anchorCount == 2) {
            var c = new PBD.Constraint(points[i + 1], points[i], script.stiffness, script.type == 0);
            constraints.push(c); //adding back constraints
        }

    }

    acc = MathLib.vec3.fromEngine(script.force);

    if (points.length > 0 && script.iterations > 0) {
        script.createEvent("UpdateEvent").bind(onUpdate);
    }
}


function onUpdate(eventData) {
    updatePhysics(deltaTime, script.iterations);//calculate point positions
    if (script.addRotation) {
        applyRotations();
    }
    applyPositions();
}

function updatePhysics(dt, iteration) {

    points[firstIndex].setPosition(MathLib.vec3.fromEngine(links[0].transform.getWorldPosition()))
    if (script.anchorCount == 2) {
        points[lastIndex].setPosition(MathLib.vec3.fromEngine(links[lastIndex].transform.getWorldPosition()))
    }
    if (script.isRelative) {
        acc = MathLib.vec3.fromEngine(relativeToTransform.getWorldTransform().multiplyDirection(script.force))
    }
    if (script.useCollider) {
        var colliderPos = MathLib.vec3.fromEngine(script.collider.getTransform().getWorldPosition());
        var colliderRadius = colliderTransform.getWorldScale().x * script.sizeMutiplier;
    }

    for (var i = 1; i < points.length; i++) {
        if (script.useCollider) {
            var colliderAcc = vec3.zero()
            var dir = points[i].getPosition().sub(colliderPos);
            var dist = dir.length - colliderRadius;
            if (dist < 0) {
                colliderAcc = dir.normalize().uniformScale(script.colliderForce * (-dist));
            }
            points[i].update(dt * timeSpeed, acc.add(colliderAcc));

        } else {
            points[i].update(dt * timeSpeed, acc);
        }
    }
    for (var i = 0; i < iteration; i++) {
        for (var c in constraints) {
            constraints[c].solve(dt * timeSpeed);
        }
    }
}


function applyRotations() {
    for (var i = 1; i < points.length; i++) {
        var direction = points[i].getPosition().sub(points[i - 1].getPosition());
        var q = MathLib.quat.rotationFromTo(links[i - 1].startDir, direction);
        var newRot = q.multiply(links[i - 1].startRot);
        links[i - 1].transform.setWorldRotation(MathLib.quat.toEngine(newRot))
    }
}

function applyPositions() {
    for (var i = 0; i < points.length; i++) {
        var worldPos = MathLib.vec3.toEngine(points[i].getPosition());
        links[i].transform.setWorldPosition(worldPos);
    }
}

