const MotionControllerModule = require('LensStudio:MotionControllerModule');

@component
export class NewScript extends BaseScriptComponent {
  private transform;
  private controller;
  @input
  pandaObj: SceneObject;
  @input
  frameObj: SceneObject;
  onAwake() {
    var options = MotionController.Options.create();
    options.motionType = MotionController.MotionType.SixDoF;
    this.controller = MotionControllerModule.getController(options);

    this.transform = this.sceneObject.getTransform();
    this.controller.onTransformEvent.add(this.updateTransform.bind(this));
  }

  updateTransform(position, rotation) {
    this.transform.setWorldPosition(position);
    this.transform.setWorldRotation(rotation);
    if (this.transform.up.y > 0.95) {
      this.pandaObj.enabled = true;
      this.frameObj.enabled = true;
    } else {
      this.pandaObj.enabled = false;
      this.frameObj.enabled = false;
    }
  }
}
