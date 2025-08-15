//@input SceneObject saber;
//@input Physics.ColliderComponent saberCollider;
// @input Asset.ObjectPrefab cubePrefab


script.saberCollider.onOverlapEnter.add(function (e) {
  var collideObject = e.overlap.collider.getSceneObject();
  print('OverlapEnter(' + e.overlap.id + '): ' + collideObject.name);
    
  if(collideObject.name == "Box"){
        print("cut!");
        collideObject.getTransform().setLocalScale(new vec3(2.5, 5.0, 5.0));
        collideObject.name = "cutBox";
        print(collideObject.name);
        var originalPos = collideObject.getTransform().getWorldPosition();
        var instance = script.cubePrefab.instantiate(script.getSceneObject());
        var cubeTransform = instance.getTransform();
        cubeTransform.setLocalPosition(originalPos);
        cubeTransform.setLocalScale(new vec3(2.5, 5.0, 5.0));
        
        print(script.cubePrefab.name);
        
        var rigidbody = instance.getComponent("Physics.RigidbodyComponent");
    if (rigidbody) {
        rigidbody.enabled = true;
    }
        
        

    }
    
});