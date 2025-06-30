const MotionControllerModule = require('LensStudio:MotionControllerModule');

declare global {
  var catchPoints: number;
}

@component
export class MotionControllerHelper3 extends BaseScriptComponent {
  private transform;
  public controller;

  @input
  childObject: SceneObject;

  @input 
  childCollider: ColliderComponent;

  @input
  catchingGame : SceneObject;

    @input 
    trailEffectPrefab: ObjectPrefab;
    
        @input
  detector: SceneObject;

    @input
    audio: AudioComponent;

    @input
    textUI: Text;

    private completed: boolean;

  onAwake() {

        this.detector.enabled = false;
    this.completed = false;
    globalThis.completed3 = false;
    globalThis.catchPoints = 0;
    var options = MotionController.Options.create();
    options.motionType = MotionController.MotionType.SixDoF;
    this.controller = MotionControllerModule.getController(options);

    this.transform = this.sceneObject.getTransform();
    this.controller.onTransformEvent.add(this.updateTransform.bind(this));

    this.childCollider.onOverlapEnter.add(function (e) {
      print("hello")
      print(globalThis.catchPoints)
      globalThis.catchPoints += 1;
  });

    this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
  }

  getTaskCompleted3() {
    return this.completed;
}

  updateTransform(position, rotation) {
    this.transform.setWorldPosition(position);
    this.transform.setWorldRotation(rotation);
  }

  createObjectsFromPrefab( trailEffectPrefab:ObjectPrefab) {
    if (trailEffectPrefab) {
        var trailEffect = trailEffectPrefab.instantiate(this.getSceneObject());
        print("we did it.")
    }
}

  onUpdate() {
    this.textUI.text = "Points: " + globalThis.catchPoints.toString();
    if (globalThis.catchPoints >= 10 && !globalThis.completed3) {
      globalThis.completed3 = true;
      this.childObject.enabled = false;
      this.catchingGame.enabled = false;
      this.createObjectsFromPrefab(this.trailEffectPrefab);
      this.audio.play(1);
    }
  }
    

}

//   testFunc() {
//     this.controller.isControllerAvailable;
//   }
