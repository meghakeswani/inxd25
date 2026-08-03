function setup() {
  createCanvas(800, 800);
  // background(100-mouseX,mouseX/2,mouseX/3)
}

function draw() {
  background(100-mouseX,mouseX/2,mouseX/3,5);
  
  noFill()
  stroke(300-mouseX,mouseX/2,mouseX/3)
  strokeWeight(2)

  
  triangle(0,0, 200,200, mouseX,mouseY)
  
  fill("lightblue")
  ellipse(mouseX+10,mouseY+10,5)
}