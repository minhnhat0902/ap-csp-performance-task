var CANVAS_SIZE = 320;


var dimension = 12;
var cellSize = CANVAS_SIZE / dimension;


setActiveCanvas("gameCanvas");
setStrokeColor(rgb(0, 0, 0, 0));
setFillColor("#cccccc");
rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
setStrokeColor(rgb(255, 255, 255));


function drawBlankGrid() {
  for (var offset = 0; offset <= CANVAS_SIZE; offset += cellSize) {
    line(offset, 0,      offset,      CANVAS_SIZE);
    line(0,      offset, CANVAS_SIZE, offset);
  }
}


drawBlankGrid();
