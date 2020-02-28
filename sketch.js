function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("mySidebar").style.marginLeft = "0px";
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("mySidebar").style.marginLeft = "-250px";
}

var x1,x2;
var y1,y2;

var x,y;

var field;
var subdiv = 2;

var points;

function setup(){
  createCanvas(windowWidth,windowHeight);
  slider();
  graph();
}

function graph(){
  subdiv = getScale();
  bounds()
  makeField();
  initial();
  grapher();
}

function initial(){
  let initial = document.getElementById("init").value.split(',');
  x = float(initial[0]);
  y = float(initial[1]);
}

function makeField(){
  field = new Array();
  for(var i=floor(x1); i<=ceil(x2); i+=1.0/subdiv){
    var row = new Array();
    for(var j=floor(y1); j<=ceil(y2); j+=1.0/subdiv){
      let base = createVector(i,j);
      let head = createVector(dx(i,j),dy(i,j));
      row.push([base,head]);
    }
    field.push(row)
  }
}

function rk4(x,y,step=0.1){
  let start = createVector(x,y);
  let pred = [createVector(dx(x,y),dy(x,y))]
  let coef = [1,2,2,1];
  for(let i=1; i<4; i++){
    let temp = p5.Vector.lerp(start,pred[pred.length-1],0.5);
    pred.push(createVector(dx(temp.x,temp.y),dy(temp.x,temp.y)).mult(coef[i]));
  }
  let avg = createVector();
  for(let j=0; j<4; j++){
    avg.add(pred[j]);
  }
  return avg.mult(step/6.0);
}

function grapher(){
  points = new Array();
}

function slider(){
  let slide = document.getElementById("scale");
  for(let i=1; i<=5; i++){
    let elm = document.getElementById("label"+i);
    if(i == slide.value){
      elm.classList.add("active");
    } else {
      elm.classList.remove("active");
    }
  }
}

function getScale(){
  let slide = document.getElementById("scale");
  return slide.value;
}

function bounds(){
  domain = document.getElementById("domain").value.split(',');
  range = document.getElementById("range").value.split(',');
  x1 = float(domain[0]);
  x2 = float(domain[1]);
  y1 = float(range[0]);
  y2 = float(range[1]);
}

function graphScreen(vec){
  let out = createVector(
    map(vec.x,x1,x2,0,width),  
    map(vec.y,y1,y2,height,0)
  );
  return out;
}

function screenGraph(vec){
  let out = createVector(
    map(vec.x,0,width,x1,x2),
    map(vec.y,0,height,y2,y1)
  );
  return out;
}



function draw(){
  background("#e5e7e6");
  let dot = graphScreen(createVector(x,y)); 
  arrows();
  grid();
  fill("#7371fc");
  noStroke();
  ellipse(dot.x,dot.y,15,15);
  //noLoop()
}

function cellWid(){  
  return width  / ceil(x2-x1); 
}
function cellHei(){  
  return height  / ceil(y2-y1); 
}

function grid(){
  stroke("#141301");
  for(let i=floor(x1); i<ceil(x2); i+=1.0/subdiv){
    let vec = graphScreen(createVector(i,0));
    if(abs(i)<0.5/subdiv){
      strokeWeight(3);
    } else if(abs(i-int(i))<0.9/subdiv) {
      strokeWeight(2);
    } else {
      strokeWeight(1);
    }
    line(vec.x,0,vec.x,height);
  }
  for(let j=floor(y1); j<ceil(y2); j+=1.0/subdiv){
    let vec = graphScreen(createVector(0,j));
    if(abs(j)<0.5/subdiv){
      strokeWeight(3);
    } else if(abs(j-int(j))<0.9/subdiv) {
      strokeWeight(2);
    } else {
      strokeWeight(1);
    }
    line(0,vec.y,width,vec.y);
  }
}

function dy(x,y){
  return x*y-2*y;
}

function dx(x,y){
  return 2*x - y*x;
}

function arrows(){
  stroke("#f15025");
  fill("#f15025");
  strokeWeight(2)
  for(let i=0; i<field.length; i++){
    for(let j=0; j<field[i].length; j++){
      let base = createVector();
      let head = createVector();
      base.set(field[i][j][0]);
      head.set(field[i][j][1]);
      arrow(base,head);
    }
  }
}

function arrow(v0,v1){
  if(v1.x==0 &&v1.y==0){
    return;
  }
  let base = graphScreen(v0);
  let head = graphScreen(v1.normalize().mult(0.8/subdiv).add(v0));  
  line(base.x,base.y,head.x,head.y);
  push();
  translate(head.x,head.y);
  rotate(head.sub(base).heading());
  let size = head.mag();
  triangle(0, 0, -size/5, -size/10, -size/5, size/10)
  pop();
}

function unit(vec){
  if(vec[0] == 0 && vec[1]==0){
    return [0,0]
  }
  let angle = dir(vec)
  return [0.9*cos(angle),0.9*sin(angle)];
}

function dir(vec){
  return atan2(vec[0],vec[1]);
}