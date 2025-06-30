// import required modules
const WorldQueryModule = require('LensStudio:WorldQueryModule');
const SIK = require('SpectaclesInteractionKit/SIK').SIK;
const InteractorTriggerType =
  require('SpectaclesInteractionKit/Core/Interactor/Interactor').InteractorTriggerType;
const InteractorInputType =
  require('SpectaclesInteractionKit/Core/Interactor/Interactor').InteractorInputType;
const EPSILON = 0.01;

@component
export class NewScript extends BaseScriptComponent {
    private spawnPosition;

    @input
    cameraObject: SceneObject;
    @input
    targetObject: SceneObject;

    @input
    filterEnabled: boolean;    

    @input
    treasureBound: SceneObject;
    
    @input
    found: boolean;
    
    onAwake() {
        this.found = false;
        this.chooseTreasurePosition();

        
        
       
        //this.spawnPosition = new vec3(0, 0, -300);
        //this.targetObject.getTransform().setWorldPosition(this.spawnPosition);
        
        // create update event
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }
    
    chooseTreasurePosition() {
        // Randomize the x and z coordinate ()  
        var frontOrBackX;
        if (Math.random() < 0.5) {
            frontOrBackX = -1;
        } else {
            frontOrBackX = 1;
        }
        var frontOrBackZ;
        if (Math.random() < 0.5) {
            frontOrBackZ = -1;
        } else {
            frontOrBackZ = 1;
        }
        const distX = MathUtils.randomRange(200, 600);
        const distZ = MathUtils.randomRange(200, 600);
        const finalPosition = new vec3(distX * frontOrBackX, -50, distZ * frontOrBackZ);
        this.targetObject.getTransform().setWorldPosition(finalPosition);
        this.spawnPosition = finalPosition;
        this.setTreasureBound();
    }

    setTreasureBound() {
        this.treasureBound.getTransform().setWorldPosition(this.spawnPosition);
    }
    
    getTreasurePosition() {
        return this.spawnPosition;
    }
    
    setTreasurePosition(pos) {
        this.targetObject.getTransform().setWorldPosition(pos);
    }
    
    onUpdate() {
        // print(this.cameraObject.getTransform().getWorldPosition().distance(
        //      this.targetObject.getTransform().getWorldPosition()  ));
        var distanceToTreasure = this.cameraObject.getTransform().getWorldPosition().distance(this.targetObject.getTransform().getWorldPosition());
        //print(distanceToTreasure);   
        if (distanceToTreasure < 200) {
            this.targetObject.enabled = true;
            //Added this line for game manager tracking
            this.found = true;
            //Activate the 2nd and 3rd treasure chests
            
        }
    }
    
    getTaskCompleted() {
        return this.found;
    }
}
