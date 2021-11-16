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
const BACKGROUND_IMAGE="https://adaresource.s3.eu-west-2.amazonaws.com/assets/fuzzballslam/SlamBackground920x690.png";
//in miliseconds. From activation how long uniOFAttack lasts .
//TODO if there is time make it random so 10 sec is max. random number
const UNIT_OF_ATTACK_LIFETIME_MAXIMUM = 10000;
//declare global variables to hold the framework objects
var viewport, world, engine, body, elastic_constraint;
var playerScore = 0;
var backgroundImage;
// define our categories (as bit fields, there are up to 32 available) - we will use them to allow/non allow mouse interaction
// https://brm.io/matter-js/docs/classes/MouseConstraint.html#properties
var notinteractable = 0x0001;
var  interactable = 0x0002;
var livesLeft;
var crates = []; //create an empty array that will be used to hold all the crates instances
var ground;
//var leftwall;
//var rightwall;

//var specials = [];
var game;
var menu= document.getElementById('menu');
//var machineGun, droppingBombs, grenade, game;

 

function start(){ 
  console.log('start pressed');
  menu.style = 'display:none;';
  livesLeft=3;
  setup();
}

function preload() {
  backgroundImage = loadImage(BACKGROUND_IMAGE);
}

function gameProgress(){
  if(game.isTheTurnFinished()){
    lives--;
    if(lives==0){
      score(playerScore,"Game Over");
      menu.style = 'display:none;'
    }
     
    game.setTheNewWeapon();
  }
}





 


function score(points,gameFinished="") {
  let effectspeed = 60;
  let animatespeed = 500;

  $("#scoreboard").finish();
  document.getElementById("points").innerHTML = "+" + points;
  $("#scoreboard").removeAttr("style"); //remove any applied styles
  $("#scoreboard").fadeIn(effectspeed, function () {
    $("#scoreboard").animate(
      {
        top: "+=100px",
        opacity: 0,
      },
      animatespeed
    );
  });

  playerScore += points;
  document.getElementById("status").innerHTML = "Score: " + playerScore+" "+gameFinished;
}

function setup() {
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

  level1();

  //attach some useful events to the matter engine; https://brm.io/matter-js/docs/classes/Engine.html#events
  Matter.Events.on(engine, "collisionEnd", collisionEnds);
  Matter.Events.on(engine, "collisionActive", collisionActive);

  frameRate(60);
  world.gravity.y = 1.0;
}

function level1(replay = false) {
  if (replay == true) {
    //if this is a 'reply' we need to remove all the objects before recrating them
    ground.remove();
    //	leftwall.remove();
    //rightwall.remove();
    game.remove();
    launcher.remove();
    for (let i = 0; i < MAX_SPECIALS; i++) {
      specials[i].remove();
    }

    for (let i = 0; i < MAX_CRATES; i++) {
      crates[i].remove();
    }
  }

  ground = new Ground(VP_WIDTH / 2, VP_HEIGHT + 20, VP_WIDTH, 40, "ground"); //create a ground object using the ground class
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
  game=new Game(grenade, machineGun, droppingBombs);
  for (let i = 0; i < MAX_SPECIALS; i++) {
    //specials[i] = new c_special(get_random(300, 640), get_random(VP_HEIGHT-600, VP_HEIGHT-120), 70, 20, "special");
  }

  //loop through each of the crates indexes
  for (let i = 0; i < MAX_CRATES; i++) {
    //loop for each instance of a crates
    let top = -CRATE_HEIGHT * MAX_CRATES - 100;
    let offset = i * CRATE_HEIGHT * 3;
    crates[i] = new Crate(
      700,
      top + offset,
      CRATE_WIDTH,
      CRATE_HEIGHT,
      "crate"
    );
  }


  //create a launcher object using the fuzzball body
  
}

function collisionEnds(event) {

  event.pairs.forEach((collide) => {
    //event.pairs[0].bodyA.label
    //	console.log("collision:"+collide.bodyB.label+" and "+collide.bodyA.label );

    if (
      collide.bodyB.label == "unitOfWeapon" &&
      collide.bodyA.label == "crate"
    ) {
      console.log("interesting collision");
      Matter.Body.set(collide.bodyA, { isAttacked: false });

      score(1);
    }
  });
}

function collisionActive(event) {

  event.pairs.forEach((collide) => {
    //event.pairs[0].bodyA.label
    //	console.log("collision:"+collide.bodyB.label+" and "+collide.bodyA.label );

    if (
      collide.bodyB.label == "unitOfWeapon" &&
      collide.bodyA.label == "crate"
    ) {
      console.log("interesting collision");
      Matter.Body.set(collide.bodyA, { isAttacked: true });

      score(1);
    }
  });
}
//deltatime build in p5 system  variable, time from the last run of the timeframe. in miliseconds
function update(deltaTime) {
  game.update(deltaTime);
}

function paint_background() {
  //access the game object for the world, use this as a background image for the game
  background(BACKGROUND_IMAGE);
  ground.show(); //execute the show function for the boundary objects
}

function paint_assets() {
  for (let i = 0; i < crates.length; i++) {
    //loop through the crates array and show each
    crates[i].show();
  }
  game.show(); //show the fuzzball
}

function draw() {
  //console.log("deltaTime"+deltaTime);
  //this p5 defined function runs every refresh cycle
  //special.rotate();
  update(deltaTime);
  paint_background(); //paint the default background

  Matter.Engine.update(engine); //run the matter engine update
  if(livesLeft>-1){

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

  //https://brm.io/matter-js/docs/classes/SAT.html#methods
  //if(Matter.SAT.collides(fuzzball.body, ground.body).collided == true) {
  //	console.log("fuzzball to ground");
  //}
}

function mouseReleased() {
  console.log("mouseRealesed");
  if(game==null){
    return;
  }
  setTimeout(() => {
    game.launcherRelease();
  }, 60);
  setTimeout(() => {
    game.activate();
  }, game.getActivationTime());
}

function keyPressed() {
	if (keyCode === ENTER) {
		// console.log("enter key press");
		// fuzzball.remove();
		// fuzzball = new c_fuzzball(FUZZBALL_X, FUZZBALL_Y, FIZZBALL_D, "fuzzball");
		// launcher.attach(fuzzball.body);
	}

	if(keyCode === 32) {
		console.log("space key press");
		launcher.release(); //execute the release method
	}

  if (keyCode === 83) {
		console.log("Start pressed");
    start();
		// fuzzball.remove();
		// fuzzball = new c_fuzzball(FUZZBALL_X, FUZZBALL_Y, FIZZBALL_D, "fuzzball");
		// launcher.attach(fuzzball.body);
	}

}