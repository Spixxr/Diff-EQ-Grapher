var back
var purple
var blue
var green
var orange
function setup() {
  createCanvas(windowWidth, windowHeight);
  back    = color("#031927")
  purple  = color("#5F0F40")
  blue    = color("#4DCCBD")
  green   = color("#00BA31")
  orange  = color("#FF7B16")
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
  
function draw() {
  background(back);
}
