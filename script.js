"use strict";
//declare variables to hold the viewport size
const VP_WIDTH = 920;
const VP_HEIGHT = 690;
const MAX_CRATES = 18; //declare a variable to hold the max number of crates
const MAX_SPECIALS = 1;
const CRATE_WIDTH = 30;
const CRATE_HEIGHT = 35;
const FUZZBALL_X = 150;
const FUZZBALL_Y = 590; //declare a starting point for the fuzzball
const FUZZBALL_RADIUS = 40; //declare a radius for the fuzzball
const BACKGROUND_IMAGE =
  "https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/SlamBackground920x690.png";
  const SHELF_WIDTH=333;
//in miliseconds. From activation how long uniOFAttack lasts .
//TODO if there is time make it random so 10 sec is max. random number
const UNIT_OF_ATTACK_LIFETIME_MAXIMUM = 10000;
//declare global variables to hold the framework objects
var viewport, world, engine, body, elastic_constraint;
var backgroundImage;
var playerScore = 0;
// define our categories (as bit fields, there are up to 32 available) - we will use them to allow/non allow mouse interaction
// https://brm.io/matter-js/docs/classes/MouseConstraint.html#properties
var notinteractable = 0x0001;
var interactable = 0x0002;
var livesLeft = -1;
var crates = []; //create an empty array that will be used to hold all the crates instances
var ground;
var launcher;
//var leftwall;
//var rightwall;

//var specials = [];
var game;
//var menu = document.getElementById("menu");
//var machineGun, droppingBombs, grenade, game;

function start() {
  console.log("start pressed");
  livesLeft = 3;
  level1();
}

function preload() {
  console.log("function preload()");
  backgroundImage = loadImage(BACKGROUND_IMAGE);
}
 function updateLives(text=""){
   if(text!=""){
    document.getElementById("lives").innerHTML=text;
    return;
   }
  
   if(livesLeft<0){
      return;
   }
  document.getElementById("lives").innerHTML="Lives:"+livesLeft;
 }

function score(points,weapon="" ) {
  playerScore += points;
  document.getElementById("points").innerHTML =
    displayWeapon(weapon) + "Score: " + playerScore + " " ;
}

function displayWeapon(weapon) {
  let toDisplay = "";
  switch (weapon) {
    case 0:
      toDisplay = "Grenade ";
      break;
    case 1:
      toDisplay = "Machine Gun ";
      break;
    case 2:
      toDisplay = "Flying Bombs";
      break;
    default:
      toDisplay = "Press s To Start";
  }

  return toDisplay;
}

function setup() {
  console.log("function setup()");
  //this p5 defined function runs automatically once the preload function is done
  viewport = createCanvas(VP_WIDTH, VP_HEIGHT); //set the viewport (canvas) size
  viewport.parent("viewport_container"); //attach the created canvas to the target div

  //enable the matter engine
  engine = Matter.Engine.create();
  world = engine.world;

  //enable the 'matter' mouse controller and attach it to the viewport object using P5s elt property
  let vp_mouse = Matter.Mouse.create(viewport.elt); //the 'elt' is essentially a pointer the the underlying HTML element
  vp_mouse.pixelRatio = pixelDensity(); //update the pixel ratio with the p5 density value; this supports retina screens, etc
  let options = {
    mouse: vp_mouse,
    collisionFilter: {
      mask: interactable, //specify the collision catagory (multiples can be OR'd using '|' )
    },
  };
  elastic_constraint = Matter.MouseConstraint.create(engine, options); //see docs on https://brm.io/matter-js/docs/classes/Constraint.html#properties
  Matter.World.add(world, elastic_constraint); //add the elastic constraint object to the world

  //level1();

  //attach some useful events to the matter engine; https://brm.io/matter-js/docs/classes/Engine.html#events
  Matter.Events.on(engine, "collisionEnd", collisionEnds);
  Matter.Events.on(engine, "collisionActive", collisionActive);

  frameRate(60);
  world.gravity.y = 1.0;
  ground = new Ground(VP_WIDTH / 2, VP_HEIGHT + 20, VP_WIDTH, 40, "ground"); //create a ground object using the ground class
}

function  remove(){
   creates.remove();
  game.remove();
  game=null;
  launcher.remove();
   crates.remove();
  for (let i = 0; i < MAX_SPECIALS; i++) {
    specials[i].remove();
  }

 
}

function level1(replay = false) {
  console.log("function level1()");
  if (livesLeft<0) {
    updateLives("Press s  to start");
    remove();
    //if this is a 'reply' we need to remove all the objects before recrating them
   
  }

  //	leftwall = new c_ground(0, VP_HEIGHT/2, 20, VP_HEIGHT, "leftwall"); //create a left wall object using the ground class
  //	rightwall = new c_ground(VP_WIDTH, VP_HEIGHT/2, 20, VP_HEIGHT, "rightwall"); //create a right wall object using the ground class
  var grenade = new Grenade(
    world,
    FUZZBALL_X,
    FUZZBALL_Y,
    FUZZBALL_RADIUS,
    "weapon",
    15,
    UNIT_OF_ATTACK_LIFETIME_MAXIMUM
  ); //create a fuzzball object
  var droppingBombs = new DroppingBombs(
    world,
    FUZZBALL_X,
    FUZZBALL_Y,
    FUZZBALL_RADIUS,
    "weapon",
    7,
    UNIT_OF_ATTACK_LIFETIME_MAXIMUM
  );
  var machineGun = new MachineGun(
    world,
    FUZZBALL_X,
    FUZZBALL_Y,
    FUZZBALL_RADIUS,
    "weapon",
    10,
    UNIT_OF_ATTACK_LIFETIME_MAXIMUM
  );
  game = new Game(grenade, machineGun, droppingBombs);
  launcher = new Launcher(FUZZBALL_X, FUZZBALL_Y - 100, game.getBody());
  //loop through each of the crates indexes
  crates=new Crates(MAX_CRATES);
  
 
  updateLives();
  //livesToDisplay(livesLeft);
  //create a launcher object using the fuzzball body
}

function collisionEnds(event) {
  event.pairs.forEach((collide) => {
    if (
      collide.bodyB.label == "unitOfWeapon" &&
      collide.bodyA.label == "crate"
    ) {
      console.log("interesting collision");
      Matter.Body.set(collide.bodyA, { isAttacked: false });
      score(1,game.getLuckyNumber());
    }
  });
}

function collisionActive(event) {
  event.pairs.forEach((collide) => {
     if (
      collide.bodyB.label == "unitOfWeapon" &&
      collide.bodyA.label == "crate"
    ) {
      console.log("interesting collision");
      Matter.Body.set(collide.bodyA, { isAttacked: true });
      score(1,game.getLuckyNumber());
    }
  });
}
//deltatime build in p5 system  variable, time from the last run of the timeframe. in miliseconds
function update(deltaTime) {
  if(game.isTheTurnFinished()){

 crates.setStatic();

 livesLeft--;
   level1();
  }
 
  game.update(deltaTime);
  // gameProgress();
}

 

function paint_background() {
  //access the game object for the world, use this as a background image for the game
  background(backgroundImage);
  ground.show(); //execute the show function for the boundary objects
}

function paint_assets() {
  update(deltaTime);
  if(crates!=null){
    crates.show();
  }
 
  launcher.show();
  game.show(); //show the fuzzball
}

function draw() {
 paint_background(); //paint the default background
  Matter.Engine.update(engine); //run the matter engine update
  if (game != null) {
    paint_assets();
  }

  //paint the assets

  if (elastic_constraint.body !== null) {
    let pos = elastic_constraint.body.position; //create an shortcut alias to the position (makes a short statement)
    fill("#ff0000"); //set a fill colour
    ellipse(pos.x, pos.y, 20, 20); //indicate the body that has been selected

    let mouse = elastic_constraint.mouse.position;
    stroke("#00ff00");
    line(pos.x, pos.y, mouse.x, mouse.y);
  }

  //https://brm.io/matter-js/docs/classes/SAT.html#methodssssss
  //if(Matter.SAT.collides(fuzzball.body, ground.body).collided == true) {
  //	console.log("fuzzball to ground");
  //}
}

function mouseReleased() {
 
  console.log("mouseRealesed");
  if (livesLeft<0) {
    return;
  }
  if(launcher.launch.bodyB==null ){
     return;
  }
  setTimeout(() => {
    console.log(" setTimeout");
    launcher.release();
  }, 60);

  //main  condition to spawn unitsOfAttack
  setTimeout(() => {
    console.log(" setTimeout");
    game.activate();
  }, game.getActivationTime()+60);
}

function keyPressed() {
  if (keyCode === ENTER) {
    // console.log("enter key press");
    // fuzzball.remove();
    // fuzzball = new c_fuzzball(FUZZBALL_X, FUZZBALL_Y, FIZZBALL_D, "fuzzball");
    // launcher.attach(fuzzball.body);
  }

  if (keyCode === 32) {
    console.log("space key press");
   //execute the release method
  }

  if (keyCode === 83) {
    if(livesLeft==-1){
      start();
    }
    //console.log("Start pressed");
   
    // fuzzball.remove();
    // fuzzball = new c_fuzzball(FUZZBALL_X, FUZZBALL_Y, FIZZBALL_D, "fuzzball");
    // launcher.attach(fuzzball.body);
  }
}
