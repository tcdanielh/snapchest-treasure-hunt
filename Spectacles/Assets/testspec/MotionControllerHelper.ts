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

  @input
  signalObject1: SceneObject;
  @input
  signalObject2: SceneObject;
  @input
  signalObject3: SceneObject;

  private timer;
  private lowInterval;
  private mediumInterval;
  private highInterval;
  private flashBool;

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
    this.childCollider.onOverlapExit.add(this.exitCollision.bind(this));

    this.timer = 0.0;
    this.lowInterval = 2.0;
    this.mediumInterval = 1.0;
    this.highInterval = 0.5;
    this.flashBool = true;
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

            if (this.flashBool){
              this.signalObject3.enabled = true
              this.signalObject2.enabled = true
              this.signalObject1.enabled = true
              this.flashBool = !this.flashBool
            } else {
              this.signalObject3.enabled = false
              this.signalObject2.enabled = false
              this.signalObject1.enabled = false
              this.flashBool = !this.flashBool
            }
            

            request.hapticFeedback = MotionController.HapticFeedback.VibrationHigh
            request.duration = 0.25
            this.controller.invokeHaptic(request)
          }
        } else if (distToBox < 600){
          if (this.timer >= this.mediumInterval) {
            this.beepAudio.play(1)
            this.timer = 0.0

            if (this.flashBool){
              this.signalObject3.enabled = false
              this.signalObject2.enabled = true
              this.signalObject1.enabled = true
              this.flashBool = !this.flashBool
            } else {
              this.signalObject3.enabled = false
              this.signalObject2.enabled = false
              this.signalObject1.enabled = false
              this.flashBool = !this.flashBool
            }

            request.hapticFeedback = MotionController.HapticFeedback.VibrationMedium
            request.duration = 0.25
            this.controller.invokeHaptic(request)
          }
        } else {
          if (this.timer >= this.lowInterval) {
            this.beepAudio.play(1)
            this.timer = 0.0

            if (this.flashBool){
              this.signalObject3.enabled = false
              this.signalObject2.enabled = false
              this.signalObject1.enabled = true
              this.flashBool = !this.flashBool
            } else {
              this.signalObject3.enabled = false
              this.signalObject2.enabled = false
              this.signalObject1.enabled = false
              this.flashBool = !this.flashBool
            }

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

        this.signalObject3.enabled = true
        this.signalObject2.enabled = true
        this.signalObject1.enabled = true

        request.hapticFeedback = MotionController.HapticFeedback.VibrationHigh
        request.duration = 0.25
        this.controller.invokeHaptic(request)    
      
    } else if (distToBox < 600){
        this.beepAudio.play(1)
        this.timer = 0.0

        this.signalObject3.enabled = false
        this.signalObject2.enabled = true
        this.signalObject1.enabled = true

        request.hapticFeedback = MotionController.HapticFeedback.VibrationMedium
        request.duration = 0.5
        this.controller.invokeHaptic(request)
          
    } else {
        this.beepAudio.play(1)
        this.timer = 0.0

        this.signalObject3.enabled = false
        this.signalObject2.enabled = false
        this.signalObject1.enabled = true

        request.hapticFeedback = MotionController.HapticFeedback.VibrationLow
        request.duration = 1.0
        this.controller.invokeHaptic(request)
    } 
  }

  exitCollision(){
    this.signalObject3.enabled = false
    this.signalObject2.enabled = false
    this.signalObject1.enabled = false
  }
}



//   testFunc() {
//     this.controller.isControllerAvailable;
//   }
