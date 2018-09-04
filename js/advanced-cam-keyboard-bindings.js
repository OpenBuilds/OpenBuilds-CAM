$(document).keydown(function(e) {
  if (e.which == 46) { // Press delete to delete whatever is already selected
    // console.log('del');
    if (mouseState != "scale") {
      storeUndo(true);
      deleteSelectedObjects();
      return false;
    }
  } else if (e.which === 90 && e.ctrlKey && e.shiftKey) { // Press ctrl+shift+z to Redo after undo
    // console.log('control + shift + z');
    redo();
    return false;
  } else if (e.which === 90 && e.ctrlKey) { // Press ctrl+z to undo
    // console.log('control + z');
    undo()
    return false;
  } else if (e.which === 89 && e.ctrlKey) { // Press ctrl+y to Redo after undo (same as ctrl+shift+i)
    // console.log('control + y');
    redo()
    return false;
  } else if (e.which === 65 && e.ctrlKey && e.shiftKey) { // Press ctrl+shift+a Unselect All
    // console.log('control + shift + a');
    if (mouseState != "scale") {
      selectNone();
      return false;
    };
  } else if (e.which === 65 && e.ctrlKey) { // Press ctrl+a to Select All
    // console.log('control + a');
    if (mouseState != "scale") {
      selectAll();
      return false;
    };
  };
});