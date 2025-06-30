const MotionControllerModule = require('LensStudio:MotionControllerModule');

@component
export class NewScript extends BaseScriptComponent {

    private controller;

  @input
  childObject: SceneObject;

  @input 
  childCollider: ColliderComponent;

  private health;

    onAwake() {
        var options = MotionController.Options.create();
        options.motionType = MotionController.MotionType.SixDoF;
        this.controller = MotionControllerModule.getController(options);

        // this.controller = MotionControllerHelper.controller;
        this.health = 100;
        // this.childCollider.onCollisionEnter.add(this.handleCollision.bind(this));
        this.childCollider.onOverlapStay.add(this.handleCollision.bind(this));
    }

    handleCollision() {
        var request = MotionController.HapticRequest.create()
        request.hapticFeedback = MotionController.HapticFeedback.VibrationHigh
        request.duration = 1.0
        this.controller.invokeHaptic(request)

        print(this.health);
        this.health -= 20;
        if (this.health <= 0) { 
            this.childObject.enabled = false;
        }

    }
}
