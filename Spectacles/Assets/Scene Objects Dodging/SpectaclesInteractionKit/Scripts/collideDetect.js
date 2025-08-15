
//var obj = scene.createSceneObject('MyCollider');
//var collider = obj.createComponent('Physics.ColliderComponent');

// @input SceneObject gameOverText;

global.remainObstacle = 7;
var collider = script.getSceneObject().getComponent("Physics.ColliderComponent");

// Set it to intangible so nothing collides with it.
collider.intangible = true;

// Adjust the overlap filter. For this example, we want to detect all non-intangible colliders and bodies.
// Note, these match the defaults, but are included for demonstration.
collider.overlapFilter.includeIntangible = false;
collider.overlapFilter.includeDynamic = true;
collider.overlapFilter.includeStatic = true;

function showGameOverText() {
    
    script.gameOverText.enabled = true;
}

// Print overlap events.
collider.onOverlapEnter.add(function (e) {
    showGameOverText();
  print('OverlapEnter(' + e.overlap.id + '): ' + e.overlap.collider);
});
collider.onOverlapStay.add(function (e) {
  var overlapCount = e.currentOverlapCount;
  if (overlapCount == 0) {
    return;
  }
  var overlaps = e.currentOverlaps;
  for (var i = 0; i < overlaps.length; ++i) {
    var overlap = overlaps[i];
    print(
      'Overlap[' + i + ']: id=' + overlap.id + ', collider=' + overlap.collider
    );
  }
});
collider.onOverlapExit.add(function (e) {
  print('OverlapExit(' + e.overlap.id + ')');
});