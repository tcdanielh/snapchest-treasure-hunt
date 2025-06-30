const MotionControllerModule = require('LensStudio:MotionControllerModule');

@component
export class MotionControllerHelper extends BaseScriptComponent {
  private transform;
  public controller;

  @input
  childObject: SceneObject;

  @input 
  childCollider: ColliderComponent;

  @input
  treasureBound: SceneObject;

  onAwake() {
    var options = MotionController.Options.create();
    options.motionType = MotionController.MotionType.SixDoF;
    this.controller = MotionControllerModule.getController(options);

    this.transform = this.sceneObject.getTransform();
    this.controller.onTransformEvent.add(this.updateTransform.bind(this));

    // this.controller.onTouchEvent.add(this.onTouchEvent.bind(this));

    // make sure its only detected for "layer 1" objects
    this.childCollider.onOverlapStay.add(this.detectCollision.bind(this));
  }

  updateTransform(position, rotation) {
    this.transform.setWorldPosition(position);
    this.transform.setWorldRotation(rotation);
  }

  onTouchEvent(normalizedPosition, touchId, timestampMs, phase) {
    if (phase != MotionController.TouchPhase.Began) {
        return
    }
    this.childObject.enabled = !this.childObject.enabled;
    if (this.childObject.enabled) {
        var request = MotionController.HapticRequest.create()
        request.hapticFeedback = MotionController.HapticFeedback.VibrationHigh
        
        request.duration = 1.0
        this.controller.invokeHaptic(request)
    }

    }

  detectCollision(){
    if (this.childObject.enabled) {
        var distToBox = this.transform.getWorldPosition().distance(this.treasureBound.getTransform().getWorldPosition());

        var request = MotionController.HapticRequest.create()

        if (distToBox < 300) { 
          request.hapticFeedback = MotionController.HapticFeedback.VibrationHigh
          request.duration = 0.1
          this.controller.invokeHaptic(request)
        } else if (distToBox < 600){
          request.hapticFeedback = MotionController.HapticFeedback.VibrationMedium
          request.duration = 0.1
          this.controller.invokeHaptic(request)
        } else {
          request.hapticFeedback = MotionController.HapticFeedback.VibrationLow
          request.duration = 0.1
          this.controller.invokeHaptic(request)
        } 

        // request.hapticFeedback = MotionController.HapticFeedback.VibrationLow
        
        // request.duration = 0.1
        // this.controller.invokeHaptic(request)
    }
  }
}

//   testFunc() {
//     this.controller.isControllerAvailable;
//   }
