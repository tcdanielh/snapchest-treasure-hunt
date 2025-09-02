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

  @input
  beepAudio: AudioComponent;

  private timer;
  private lowInterval;
  private mediumInterval;
  private highInterval;

  onAwake() {
    var options = MotionController.Options.create();
    options.motionType = MotionController.MotionType.SixDoF;
    this.controller = MotionControllerModule.getController(options);

    this.transform = this.sceneObject.getTransform();
    this.controller.onTransformEvent.add(this.updateTransform.bind(this));

    // this.controller.onTouchEvent.add(this.onTouchEvent.bind(this));

    // make sure its only detected for "layer 1" objects
    this.childCollider.onOverlapStay.add(this.detectCollision.bind(this));

    //this.childCollider.onOverlapExit.add(this.leaveCollision.bind(this));

    this.childCollider.onOverlapEnter.add(this.enterCollision.bind(this));

    this.timer = 0.0;
    this.lowInterval = 2.0;
    this.mediumInterval = 1.0;
    this.highInterval = 0.5;
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
        //this.controller.invokeHaptic(request)
    }

    }

  detectCollision(){
    if (this.childObject.enabled) {
        this.timer += getDeltaTime()

        var distToBox = this.transform.getWorldPosition().distance(this.treasureBound.getTransform().getWorldPosition());

        var request = MotionController.HapticRequest.create()

        if (distToBox < 300) { 
          if (this.timer >= this.highInterval) {
            this.beepAudio.play(1)
            this.timer = 0.0

            request.hapticFeedback = MotionController.HapticFeedback.VibrationHigh
            request.duration = 0.25
            this.controller.invokeHaptic(request)
          }
        } else if (distToBox < 600){
          if (this.timer >= this.mediumInterval) {
            this.beepAudio.play(1)
            this.timer = 0.0

            request.hapticFeedback = MotionController.HapticFeedback.VibrationMedium
            request.duration = 0.25
            this.controller.invokeHaptic(request)
          }
        } else {
          if (this.timer >= this.lowInterval) {
            this.beepAudio.play(1)
            this.timer = 0.0

            request.hapticFeedback = MotionController.HapticFeedback.VibrationLow
            request.duration = 0.25
            this.controller.invokeHaptic(request)
          }
        } 

        // request.hapticFeedback = MotionController.HapticFeedback.VibrationLow
        
        // request.duration = 0.1
        // this.controller.invokeHaptic(request)
    }
  }

  enterCollision(){
    var distToBox = this.transform.getWorldPosition().distance(this.treasureBound.getTransform().getWorldPosition());

    var request = MotionController.HapticRequest.create()

    if (distToBox < 300) { 
        this.beepAudio.play(1)
        this.timer = 0.0

        request.hapticFeedback = MotionController.HapticFeedback.VibrationHigh
        request.duration = 0.25
        this.controller.invokeHaptic(request)    
      
    } else if (distToBox < 600){
        this.beepAudio.play(1)
        this.timer = 0.0

        request.hapticFeedback = MotionController.HapticFeedback.VibrationMedium
        request.duration = 0.5
        this.controller.invokeHaptic(request)
          
    } else {
        this.beepAudio.play(1)
        this.timer = 0.0

        request.hapticFeedback = MotionController.HapticFeedback.VibrationLow
        request.duration = 1.0
        this.controller.invokeHaptic(request)
    } 
  }

}

//   testFunc() {
//     this.controller.isControllerAvailable;
//   }
