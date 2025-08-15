//function debugObject(obj) {
//    if (obj === null) return "null";
//    if (obj === undefined) return "undefined";
//    
//    var result = "{\n";
//    for (var key in obj) {
//        try {
//            var value = obj[key];
//            // Handle circular references and complex objects
//            if (typeof value === "object" && value !== null) {
//                value = "[object " + (value.constructor ? value.constructor.name : "Object") + "]";
//            }
//            result += "  " + key + ": " + value + "\n";
//        } catch (e) {
//            result += "  " + key + ": [Error accessing property]\n";
//        }
//    }
//    result += "}";
//    return result;
//}
//print(script.getSceneObject().getComponent("Physics.ColliderComponent"));
//print(debugObject(script.getSceneObject().getComponent("Physics.BodyComponent")));
//
//script.getSceneObject().getComponent("Physics.BodyComponent").addForce(new vec3(100.0, 100.0, 100.0), Physics.ForceMode.Force);
//


//script.boxCollider.addForce(new vec3(100.0, 100.0, 100.0), Physics.ForceMode.Force);
