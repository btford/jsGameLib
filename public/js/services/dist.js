/**
 * Dist - util for calculating dist between points
 */

angular.module('gameApp').value('dist', function (x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
});
