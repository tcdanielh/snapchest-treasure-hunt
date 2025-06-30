@component
export class MinigameShapeSpawner extends BaseScriptComponent {
    @input
    shapePrefab: ObjectPrefab[];

    private counter:number;

    onAwake() {
        this.counter = 0;
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    onUpdate() {
        var index = Math.floor(Math.random() * this.shapePrefab.length);
        var counterMod = Math.round(Math.random()*20+ 11);
        if (this.counter % counterMod == 0) {
            var x = Math.random()*200-100;
            var z = Math.random()*200-100;
            var y = 100;
            var obj = this.shapePrefab[index].instantiate(this.getSceneObject());
            obj.getTransform().setWorldPosition(new vec3(x,y,z));
        }
        this.counter += 1;
        
    }
}
