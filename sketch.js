//CSS user interation

function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("mySidebar").style.marginLeft = "0px";
}
//Open Sidebar

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("mySidebar").style.marginLeft = "-250px";
}
//Close Sidebar

//Parser

function castNum(input){
  if(typeof input=="number"){
    return input;
  }
  return parseFloat(input);
} 
//Convert a string to a number
//return number if is already one;

function unary(opp,a){
  switch(opp){
    case "sin":
      return sin(a);
    case "cos":
      return cos(a);
    case "tan":
      return tan(a);
    case "ln":
      return log(a);
    case "abs":
      return abs(a);
    case "_":
      return -a;
    default:
      return a;
  }
}
//computes the unary opperation of a value (a)

function dyadic(opp,a,b){
  switch(opp){
    case "^":
      return pow(a,b);
    case "*":
      return (a*b);
    case "/":
      return (a/b);
    case "+":
      return (a+b);
    case "-":
      return (a-b);
    default:
      return a;
  }
}
//computes the binnary opperation of values (a,b);

class Node {
  //Calculation Tree for parse
  
  constructor(val){
    if(typeof val == "object"){
      this.val =  val.val;
    } else {
      this.val = val.trim();
    }
    this.left = null;
    this.right = null;
  }
  //Constructor reads in a value and creates a Node/tree with its value
  
  add(val){
    if(this.left){
      this.right = val;
      return;
    }
    this.left = val; 
  }
  //Adds a new node to the parent node in left to right order
  
  toString(){
    let subs = this.children();
    if(subs==0){
      return this.val;
    }
    if(subs==1){
      return this.val + "(" + this.left.toString() + ")";
    }
    return "(" + this.left.toString() + this.val + this.right.toString()+ ")";
  }
  //Creates a string from a tree
  
  children(){
    if(this.right){
      return 2;
    }
    if(this.left){
      return 1;
    }
    return 0;
  }
  //Returns the number of children this node has
  
  calc(dict){
    let subs = this.children();
    if(subs==0){
      if(this.val in dict){
        //checks if it is a keyword variable
        return dict[this.val]
      }
      return castNum(this.val);
    }
    if(subs==1){
      return unary(this.val,this.left.calc(dict));
    }
    return dyadic(this.val,this.left.calc(dict),this.right.calc(dict));
  }
  //returns the value from calculating the tree
}

function seperate(arr, target){
  let out = [];
  for(let i=0; i<arr.length; i++){
    if(typeof arr[i] == "string"){
      //checks to make sure the type is a string to prevent split error
      cut = arr[i].split(target);
      for(let j=0; j<cut.length; j++){
        out.push(cut[j]);
        if(j!=cut.length-1){
          //prevents the operator from being added to the end of the array;
          out.push(target);
        }
      }
    } else {
      //If the element was not a string it is left alone
      out.push(arr[i]);
    }
  }
  return out;
}
//splits each element input by a target string and then adds to array seperated by the target
//used to convert ["1+2"] -> ["1","+","2"] 

function pull(arr, target) {
  let out = [];
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] == "string") {
      //checks if an element is a string
      let index = arr[i].indexOf(target);
      let last = 0;
      while (index >= 0) {
        out.push(arr[i].slice(last, index));
        out.push(target);
        last = index + target.length;
        index = arr[i].indexOf(target, last);
      }
      //while there is an opperator if remove one by one
      out.push(arr[i].slice(last, arr[i].length));
      //adds the last part of the string which comes after the opperators
    } else {
      //not a string and is left alone
      out.push(arr[i]);
    }
  }
  return out.filter(value => value!="");
  //filters out empty elements
}
//Pulls the unary opperators out of a string but will maintain their order
//["sin2"] -> ["sin","2"] 

function balance(equation,start){
  let count = 0;
  //used to track if the parentheses are balanced if zero yes
  let first = 0;
  //tracks the position of the first parenthese seen
  for(let i=start; i<equation.length; i++){
    if(equation[i] == '('){
      if(count == 0){
        first = i;
      }
      count++;
    }
    if(equation[i] == ')'){
      count--;
      if(count == 0){
        return [first,i];
        //returns the at the first balanced closed parenthese
      }
    }
  }
  return null;
  //if either no parentheses or unbalanced
}
// returns the placement of the first balanced parentheses in the equation after start
// "1+(2)" -> [2,4] 

function parse(equation){
  let unary = ["sin","cos","tan","ln","abs","_"];
  let dyadic = ["^","*","/","+","-"];
  let arr = [equation];
  //intialiazes the array of the equation as the whole string
  
  if(equation.includes("(")){
    arr = [];
    let prev = 0;
    let point = balance(equation,prev);
    while(point){
      arr.push(equation.substring(prev,point[0]));
      //adds section before parentheses
      arr.push(parse(equation.substring(point[0]+1,point[1])));
      //adds tree for parentheses contained section
      prev = point[1] + 1;
      point = balance(equation,prev);
    }
    //while there are parentheses contune to check the next part of the equation
    arr.push(equation.substring(prev));
    //adds section after all parentheses
    arr = arr.filter(value => value != "");
    //removes all empty elements
  }
  //pre-computes all terms in parentheses
  
  for(let i=0; i<dyadic.length; i++){
    arr = seperate(arr,dyadic[i]);
  }
  //seperates all element by the binary opperators
  //["1+2"] -> ["1","+","2"]
  for(let i=0; i<arr.length; i++){
    for(let j=0; j<unary.length; j++){
      arr = pull(arr,unary[j]);
    }
  }
  //seperates all elements by the unary opperators
  //["1", "+", "sin(2)"] -> //["1", "+", "sin", "(2)"]
  
  for(let i=0; i<arr.length; i++){
    if(typeof arr[i] == "string"){
      //prevents a group of parentheses from become a node of a node
      arr[i] = new Node(arr[i]);
    }
  }
  //converts all elements to a calculation node to be combined into one tree
  
  for(let i=arr.length-1; i>=0; i--){
    if(unary.includes(arr[i].val) && !arr[i].children()){
      arr[i].add(arr[i+1]);
      arr.splice(i+1,1);
    }
  }
  //pushes all elements into their unary opperators form right to left to preserve order
  //["1","+","sin","2"] -> ["1","+","sin(2)"] 
  //"" represent trees not strings here
  
  for(let i=0; i<arr.length; i++){
    if(arr[i].val == "^"&& !arr[i].children()){
      //checks if power and that it has no children to prevent () from being broken
      arr[i].add(arr[i-1]);
      //adds left
      arr[i].add(arr[i+1]);
      //adds right
      arr.splice(i+1,1);
      //deletes left from array
      arr.splice(i-1,1);
      //deletes right from array
      i--;
    }
  }
  //puts power nodes in their trees, done first bc order of opperations
  //["2","^","3"] -> ["2^3"]
  //"" represent trees not strings here
  
  for(let i=0; i<arr.length; i++){
    if((arr[i].val == "*" || arr[i].val == "/")&& !arr[i].children()){
      arr[i].add(arr[i-1]);
      arr[i].add(arr[i+1]);
      arr.splice(i+1,1);
      arr.splice(i-1,1);
      i--;
    }
  }
  //puts multiplication and division nodes in their tree
  //["2","*","3"] -> ["2*3"]
  //"" represent trees not strings here
  //see power for commented inner section above
  
  for(let i=0; i<arr.length; i++){
    if((arr[i].val == "+" || arr[i].val == "-")&& !arr[i].children()){
      arr[i].add(arr[i-1]);
      arr[i].add(arr[i+1]);
      arr.splice(i+1,1);
      arr.splice(i-1,1);
      i--;
    }
  }
  //puts addition and subtraction nodes in their tree
  //["2","-","3"] -> ["2-3"]
  //"" represent trees not strings here
  //see power for commented inner section above
  
  return arr[0];
  //returns first element because all nodes should be reduced into this tree
}
//converts a string equation into a tree representation

// Grapher 

var x1,x2;
//x bounds for screen
var y1,y2;
//y bounds for screen
var x,y;
//x,y for the intial conditons

var field;
//2d array holding the slope field
var subdiv = 2;
//how many subdivsions to draw/ how many lines per unit of 1

var points;
//list of all points of curve

var dxTree,dyTree;
//trees for dx/dt and dy/dt

function setup(){
  createCanvas(windowWidth,windowHeight);
  //makes canvas
  slider();
  //makes the correct slider selcetion glow
  graph();
  //generates the graph
}
//setup fuction

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
  //fits screen to window
}

function graph(){
  subdiv = getScale();
  //sets subdivisons
  bounds()
  //calculates bounds of the screen

  dxTree = parse(document.getElementById("dx").value);
  dyTree = parse(document.getElementById("dy").value);

  makeField();
  //calculates the slope at the slope field's points
  initial();
  //intial value

  points = path(x,y,0.01,50);
  //generates the path
}

function initial(){
  let initial = document.getElementById("init").value.split(',');
  x = float(initial[0]);
  y = float(initial[1]);
}
//gets the intial point

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
//makes the slope field

function rk4(x,y,step){
  let pX = dx(x,y) * step;
  let pY = dy(x,y) * step;
  let mX = x + pX/2.0;
  let mY = y + pY/2.0;
  let aX = pX;
  let aY = pY;
  //calculated p1
  pX = dx(mX,mY) * step;
  pY = dy(mX,mY) * step;
  aX += 2*pX;
  aY += 2*pY;
  mX = x + pX/2
  mY = y + pY/2
  //calculates p2

  pX = dx(mX,mY) * step;
  pY = dy(mX,mY) * step;
  aX += 2*pX;
  aY += 2*pY;
  mX = x + pX/2
  mY = y + pY/2
  //calculates p3

  pX = dx(mX,mY) * step;
  pY = dy(mX,mY) * step;
  aX += pX;
  aY += pY;
  //calculates p4

  return createVector(aX,aY).mult(1.0/6.0);
  //returns average of predictions
}
//rk4 method


function path(x,y,step,length){
  let arr = new Array();
  arr.push(createVector(x,y));
  for(var i=0; i<length/2; i+=step){
      var current = arr[arr.length-1];
      arr.push(p5.Vector.add(current,rk4(current.x,current.y,step)));
  }
  for(var i=0; i<length/2; i+=step){
      var current = arr[0];
      arr.unshift(p5.Vector.sub(current,rk4(current.x,current.y,step)));
  }
  return arr;
}
//generates a path of points given starting position, step size, and length

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
//sets the correct selection for the slider

function getScale(){
  let slide = document.getElementById("scale");
  return slide.value;
}
//returns the value of the slider

function bounds(){
  domain = document.getElementById("domain").value.split(',');
  range = document.getElementById("range").value.split(',');
  x1 = float(domain[0]);
  x2 = float(domain[1]);
  y1 = float(range[0]);
  y2 = float(range[1]);
}
//calculates the bounds

function graphScreen(vec){
  let out = createVector(
    map(vec.x,x1,x2,0,width),  
    map(vec.y,y1,y2,height,0)
  );
  return out;
}
//converts a point in graph space and returns point in screen space

function screenGraph(vec){
  let out = createVector(
    map(vec.x,0,width,x1,x2),
    map(vec.y,0,height,y2,y1)
  );
  return out;
}
//converts a point from screen space to grpah space

function draw(){
  background("#FAFFFD");
  let dot = graphScreen(createVector(x,y)); 
  arrows();
  grid();
  for(var i=1; i<points.length; i++){
      var p1 = graphScreen(points[i-1]);
      var p2 = graphScreen(points[i]);
      stroke("#4CA0A3");
      strokeWeight(5);
      line(p1.x,p1.y,p2.x,p2.y)
  }
  fill("#4B7F52");
  noStroke();
  ellipse(dot.x,dot.y,15,15);
}
//update loop
//draws grid, arrows, points, and intial value dot


function grid(){
  stroke("#14080E");
  fill("#14080E")
  for(let i=floor(x1); i<ceil(x2); i+=1.0/subdiv){
    let vec = graphScreen(createVector(i,0));
    if(abs(i)<0.5/subdiv){
      strokeWeight(3);
      strokeWeight(2);
      text(int(i),vec.x+5,height-10)
    } else if(abs(i-int(i))<0.9/subdiv) {
      strokeWeight(2);
      text(int(i),vec.x+5,height-10)
    } else {
      strokeWeight(1);
    }
    line(vec.x,0,vec.x,height);
  }
  for(let j=floor(y1); j<ceil(y2); j+=1.0/subdiv){
    let vec = graphScreen(createVector(0,j));
    if(abs(j)<0.5/subdiv){
      strokeWeight(3);
      strokeWeight(2);
      text(int(j),10,vec.y-5)
    } else if(abs(j-int(j))<0.9/subdiv) {
      strokeWeight(2);
      text(int(j),10,vec.y-5)
    } else {
      strokeWeight(1);
    }
    line(0,vec.y,width,vec.y);
  }
}
//draws the grid lines

function dy(x,y){
  return dyTree.calc({"x":x,"y":y,"e":Math.E,"pi":Math.PI});
}
//returns dy/dt

function dx(x,y){
  return dxTree.calc({"x":x,"y":y,"e":Math.E,"pi":Math.PI});
}
//returns dx/dt

function arrows(){
  stroke("#FA824C");
  fill("#FA824C");
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
//draws an arrows of slope field

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
//draws an arrow from v0 to v1
