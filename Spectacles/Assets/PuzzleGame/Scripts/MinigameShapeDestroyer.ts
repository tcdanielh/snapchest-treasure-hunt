@component
export class MinigameShapeDestroyer extends BaseScriptComponent {
    onAwake() {
        var collider = this.getSceneObject().createComponent('Physics.ColliderComponent');
        collider.shape = Shape.createBoxShape();
        collider.intangible = true;
        collider.overlapFilter.includeIntangible = true;
        collider.overlapFilter.includeDynamic = true;
        collider.overlapFilter.includeStatic = true;

        collider.onOverlapEnter.add(function (e) {
            e.overlap.collider.getSceneObject().destroy();
        });
    }
}