function repairClipperPath(clipperPath) {
  var newClipperPath = []
  for (i = 0; i < clipperPath.length; i++) {
    for (j = 0; j < clipperPath[i].length; j++) {
      newClipperPath.push(clipperPath[i][j])
    }
  }
  // newClipperPath.push(clipperPath[0][0])
  return [newClipperPath];
}