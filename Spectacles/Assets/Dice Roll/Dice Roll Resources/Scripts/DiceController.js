// DiceController.js
// Version 0.1.0
// Dice 3d model should have children pointed out from each face 

//@input SceneObject dice
/** @type {SceneObject} */
var dice = script.dice;

//@input SceneObject target {"hint" : "Leave empty to use world vector"}
/** @type {SceneObject} */
var target = script.target;

//@input string direction = "up" {"widget":"combobox", "values":[{"label":"Forward", "value":"forward"}, {"label":"Back", "value":"back"}, {"label":"Up", "value":"up"}, {"label":"Down", "value":"down"}, {"label":"Left", "value":"left"}, {"label":"Right", "value":"right"}]}
/** @type {string} */
var direction = script.direction;

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Response"}

//@input Component component
/** @type {Component} */
var component = script.component;

//@input int type = 0 {"widget":"combobox", "values":[{"label":"Set Property", "value":0}, {"label":"Call Function", "value":1}]}
/** @type {int} */
var type = script.type;

//@input string propName {"showIf" : "type", "showIfValue" : "0"}
/** @type {string} */
var propName = script.propName;

//@input string funcName {"showIf" : "type", "showIfValue" : "1"}
/** @type {string} */
var funcName = script.funcName;

/** @type {UpdateEvent} */
var updateEvent;
/** @type {number} */
const eps = 0.5; //edit if needed
/** @type {BodyComponent} */
var physicsBody;
/** @type {number} */
var faceCount;
/** @type {Transform} */
var transform;
/** @type {Transform[]} */
var childrenTransforms;
/** @type {vec3} */
var targetVector;
/** @type {vec3} */
var startPos;
/** @type {boolean}*/
var wasThrown = false;

function init() {
    faceCount = dice.getChildrenCount();
    childrenTransforms = [];
    for (var i = 0; i < faceCount; i++) {
        childrenTransforms.push(dice.getChild(i).getTransform());
    }
    physicsBody = dice.getComponent("Physics.BodyComponent");
    
    if (isNull(target)) {
        targetVector = vec3[direction]();
    }

    transform = dice.getTransform();
    
    var randomRot = quat.fromEulerAngles(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    transform.setLocalRotation(randomRot);

    startPos = transform.getLocalPosition();
    
    updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(onUpdate);
    
    //throw dice on tap, edit if needed
    
    script.createEvent("TapEvent").bind(onTap);
}

function onUpdate() {
    targetVector = getTargetDirection();

    if (physicsBody.velocity.length < eps) {
        var maxDot = -1000;
        var dirSo = null;

        for (var i = 0; i < faceCount; i++) {
            var dot = childrenTransforms[i].forward.dot(targetVector);
            if (dot > maxDot) {
                maxDot = dot;
                dirSo = dice.getChild(i);
            }
        }
        if(wasThrown){
            performResponse(dirSo.name);
        }
    } else {
        wasThrown = true;
    }
}

function getTargetDirection() {
    if (isNull(target)) {
        return targetVector;
    } else {
        return targetTransform[direction];
    }
}

/**
 * 
 * @param {string} textValue 
 */
function performResponse(textValue) {
    if (isNull(component)) {
        return;
    }
    if (type == 0) {
        if (propName) {
            component[propName] = textValue;
        }
    } else if (type == 1){
        if(funcName){
            component[funcName](textValue);
        }
    }
}

function onTap(){
    var randomRot = quat.fromEulerAngles(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    transform.setLocalRotation(randomRot);
    transform.setLocalPosition(startPos);
}

init();
