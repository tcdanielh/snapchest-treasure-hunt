declare global {
    var catchPoints: number;
}

@component
export class MinigameCatcher extends BaseScriptComponent {
    @input
    textUI:Text;

    onAwake() {
        globalThis.catchPoints = 0;
        var collider = this.getSceneObject().createComponent('Physics.ColliderComponent');
        collider.shape = Shape.createBoxShape();
        collider.intangible = true;
        collider.overlapFilter.includeIntangible = true;
        collider.overlapFilter.includeDynamic = true;
        collider.overlapFilter.includeStatic = true;


        collider.onOverlapEnter.add(function (e) {
            print("hello")
            print(globalThis.catchPoints)
            globalThis.catchPoints += 1;
        });

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    onUpdate() {
        this.textUI.text = "Points: " + globalThis.catchPoints.toString();
    }
}
