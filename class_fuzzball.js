"use strict";

class Game {
  constructor(grenade, machineGun, droppingBombs) {
    this.weapons = [grenade, machineGun, droppingBombs];
    this.luckyNumber = this.getRandomInt(0, this.weapons.length - 1);
  }
  getLuckyNumber() {
    return this.luckyNumber;
  }

  // random integer number between min and max including
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  isTheTurnFinished() {
    // console.log('is finished?'+this.weapons[this.luckyNumber].isThatTurnFinished());
    return this.weapons[this.luckyNumber].isThatTurnFinished();
  }
  show() {
    this.weapons[this.luckyNumber].show();
  }
  getBody() {
    return this.weapons[this.luckyNumber].body;
  }
  getActivationTime() {
    console.log(
      "getactivationtime() result:" +
        this.weapons[this.luckyNumber].getActivationTime()
    );
    return this.weapons[this.luckyNumber].getActivationTime();
  }
  activate() {
    console.log("activate()");
    this.weapons[this.luckyNumber].activate();
  }
  remove() {
    this.weapons[0].remove();
    this.weapons[1].remove();
    this.weapons[2].remove();
  }
  update(deltaTime) {
    this.weapons[this.luckyNumber].update(deltaTime);
  }
  reset() {
    //to implement
  }
}

class Launcher {
  constructor(x, y, body) {
    //see docs on https://brm.io/matter-js/docs/classes/Constraint.html#properties
    let options = {
      pointA: {
        x: x,
        y: y,
      },
      bodyB: body,
      stiffness: 0.1,
      length: 20,
    };
    //create the contraint
    this.launch = Matter.Constraint.create(options);
    Matter.World.add(world, this.launch); //add to the matter world
  }

  release() {
    //release the constrained body by setting it to null
    this.launch.bodyB = null;
  }

  //dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
  remove() {
    Matter.World.remove(world, this.launch);
  }

  attach(body) {
    //attach the specified object as a constrained body
    this.launch.bodyB = body;
  }

  show() {
    //check to see if there is an active body
    if (this.launch.bodyB) {
      let posA = this.launch.pointA; //create an shortcut alias
      let posB = this.launch.bodyB.position;
      stroke("#00ff00"); //set a colour
      line(posA.x, posA.y, posB.x, posB.y); //draw a line between the two points
    }
  }
}

class Crate {
  constructor(x, y, width, height, label, element) {
    let options = {
      restitution: 0.99,
      friction: 0.93,
      density: 0.97,
      frictionAir: 0.02,
      label: label,
      collisionFilter: {
        //used with mouse constraints to allow/not allow iteration
        category: notinteractable,
      },
    };
    //create the body
    this.body = Matter.Bodies.rectangle(x, y, width, height, options);
    //setting a property on boddy. Then when collsion is active I can easly change the variable on body
    Matter.Body.set(this.body, { isAttacked: false });
    Matter.World.add(world, this.body); //add to the matter world

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.alive = true;
    this.element = element;

    this.redStroke = "#FF0000";
    this.redFill = "#FFB3B3";
  }

  setIsAttacked(isAttacked) {
    let settings = { isAttacked: isAttacked };
    Matter.Body.set(this.body, settings);
  }
  getIsAttacked() {
    return this.body.isAttacked;
  }

  body() {
    return this.body; //return the created body
  }

  //dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
  remove() {
    Matter.World.remove(world, this.body);
    this.body = null;
  }

  show() {
    //console.log("Is attacked?"+this.getIsAttacked());
    let strokeColor = this.redStroke;
    let fillColor = this.redFill;
    //	if(this.alive) {
    let pos = this.body.position; //create an shortcut alias
    let angle = this.body.angle;

    push(); //p5 translation
    if (this.getIsAttacked()) {
      strokeColor = this.redStroke;
      fillColor = this.redFill;
    } else {
      strokeColor = "#3D3D3D";
      fillColor = "#D3D3D3";
    }
    stroke(strokeColor);
    fill(fillColor);
    rectMode(CENTER); //switch centre to be centre rather than left, top
    translate(pos.x, pos.y);
    rotate(angle);
    rect(0, 0, this.width, this.height);
    pop();
    //	}
  }
}

class Ground {
  constructor(x, y, width, height, label) {
    let options = {
      isStatic: true,
      restitution: 0.99,
      friction: 0.2,
      density: 0.9,
      label: label,
    };
    //create the body
    this.body = Matter.Bodies.rectangle(x, y, width, height, options);
    Matter.World.add(world, this.body); //add to the matter world

    this.x = x; //store the passed variables in the object
    this.y = y;
    this.width = width;
    this.height = height;
  }

  body() {
    return this.body; //return the created body
  }

  show() {
    let pos = this.body.position; //create an shortcut alias
    rectMode(CENTER); //switch centre to be centre rather than left, top

    fill("#ffffff"); //set the fill colour
    rect(pos.x, pos.y, this.width, this.height); //draw the rectangle
  }
}














//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
class Weapon {
  constructor(
    world,
    x,
    y,
    radius,
    label,
    amountOfBalls,
    liveTimeOfUnitOfAttack
  ) {
    let options = {
      restitution: 0.09,
      friction: 0.89,
      density: 0.89,
      frictionAir: 0.04,
      label: label,
      collisionFilter: {
        //used with mouse constraints to allow/not allow iteration
        category: interactable,
      },
    };
    this.amountOfUnitsOfAttack = amountOfBalls;
    this.body = Matter.Bodies.circle(x, y, radius, options); //matter.js used radius rather than diameter
    Matter.World.add(world, this.body);
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.unitsOfAttack = [];
    this.world = world;
    //each unit of attack has up to  this.liveTimeOfUnitOfAttack  miliseconds of time  to cause damage
    this.liveTimeOfUnitOfAttack = liveTimeOfUnitOfAttack;
    this.isTurnFinished = false;
    //if launcher starts we start timer to to count 60 mls to activate creation of unitsOfAtack
    this.isActivated=false;
    //flag to create unitsOfAttack only once
    this.isUnitsOfAttackCreated=false;
  }

// each unitOfAttack is updated with a tick of the system only after activation of the launcher
  update(deltaTime) {
    if(this.isActivated==false){
        return;
    }
    this.createUnitsOfAttack();

    //to update unitsOfAttack they must be created first
    if(this.isUnitsOfAttackCreated==false){
        return;
    }
    this.unitsOfAttack.forEach((element) =>
      element.update(deltaTime)
    );
    this.removeExpiredUnitOfAttack();
  }

 createUnitsOfAttack(){
  if(this.isActivated==false){
    return;
}
   console.log('abstract method');
 }

  isThatTurnFinished() {
    return this.isTurnFinished;
  }


  
  removeExpiredUnitOfAttack() {
    if(this.isActivated==false){
      return;
  }

    for (let i = this.unitsOfAttack.length - 1; i >= 0; i--) {
      if (this.unitsOfAttack[i].isUnitOfAttackReadyToRemove() == true) {
        //removing the element from world
        this.unitsOfAttack[i].remove();
        //removing the element from array as well
        this.unitsOfAttack.splice(i, 1);
      }
    }
    //if nothing left in array it means the turn has finished
    if (this.unitsOfAttack.length == 0) {
      this.isTurnFinished = true;
    }
  }

  activate() {
    if (this.body != null) {
      this.isActivated = true;
    }

    //TODO
    //objects  of array should be destroyed by js garbadge collection mechanism
  }
  applyVelocityToUnitsOfAttack() {
    this.unitsOfAttack.forEach((element) => element.applyVelocity());
  }

  applyForceToUnitsOfAttack() {
    this.unitsOfAttack.forEach((element) => element.applyForce());
  }

  body() {
    return this.body;
  }
  //for removing  from Matter engine
  removeUnitsOfAttack() {
    Matter.World.remove(this.world, this.body);
    this.unitsOfAttack.forEach((element) => element.remove());
    this.body = null;
  }

  //dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
  removeBody() {
    Matter.World.remove(this.world, this.body);
    this.body = null;
  }
  //in milisceonds

  show() {
    this.unitsOfAttack.forEach((element) => element.show());

    // console.log("isActivated:" + this.isActivated);
    //when unitsOfWeapon are shot The body is removed so I dont want to render it anymore
    if (this.body == null || this.unitsOfAttack.length > 0) {
      return;
    }
    let pos = this.body.position;
    let angle = this.body.angle;

    push(); //p5 translation
    translate(pos.x, pos.y);
    rotate(angle);
    fill("#00aa00");
    ellipseMode(CENTER); //switch centre to be centre rather than left, top
    circle(0, 0, this.radius);
    pop();
  }
}

//once we launch and the ball activates we create unitsOfAttack 
//they cause damage for certain time only
class UnitOfAttack {
  constructor(world, x, y, radius, options, liveTime) {
    this.body = Matter.Bodies.circle(x, y, radius, options); //matter.js used radius rather than diameter
    this.velocity = this.body.velocity;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.world = world;
    //when object is created this is set to 10sec. here i randomize time foreach unitOfAttack
    this.liveTime = Matter.Common.random(2, liveTime);
    this.isReadyToRemove = false;
    Matter.World.add(this.world, this.body);
  }

  body() {
    return this.body;
  }

  isUnitOfAttackReadyToRemove() {
    return this.isReadyToRemove;
  }

  applyForce() {
    Matter.Body.applyForce(
      this.body,
      {
        x: this.body.position.x,
        y: this.body.position.y,
      },
      {
        x: 0.05,
        y: Matter.Common.Random(-100, -50),
      }
    );
  }

  //this will be aproximately   once per system tick.
  update(timeFromLastUpadate) {
    this.liveTime -= timeFromLastUpadate;
    this.checkForExpired();
  }

  checkForExpired() {
    if (this.liveTime <= 0) {
      this.isReadyToRemove = true;
    }
  }

  applyVelocity() {
    let random = Matter.Common.random(1.2, 1.6);
    let velocityX = random * this.velocity.x;
    let velocityY = random * this.velocity.y;
    Matter.Body.setVelocity(this.body, { x: velocityX, y: velocityY });
  }

  //dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
  remove() {
    Matter.World.remove(this.world, this.body);
    this.body = null;
  }

  show() {
    if (this.body == null) {
      return;
    }
    let pos = this.body.position;
    let angle = this.body.angle;

    push(); //p5 translation
    translate(pos.x, pos.y);
    rotate(angle);
    let fillerColor = this.body.velocity.y < 0 ? "#FF0000" : "#FFFF00";
    let strokeColor = this.body.velocity.y >= 0 ? "#FF0000" : "#FFFF00";
    fill(fillerColor);
    strokeWeight(2);
    stroke(strokeColor);
    ellipseMode(CENTER); //switch centre to be centre rather than left, top
    circle(0, 0, this.radius);
    pop();
  }
}

class MachineGun extends Weapon {
  constructor(
    world,
    x,
    y,
    radius,
    label,
    amountOfBalls,
    liveTimeOfUnitOfAttack
  ) {
    super(world, x, y, radius, label, amountOfBalls, liveTimeOfUnitOfAttack);
  }
  show() {
    super.show();
  }

  getActivationTime() {
    return 550;
  }
  remove() {
    super.rename();
  }
  createUnitsOfAttack() {
    super.createUnitsOfAttack()
    if (this.body.velocity.y < 0) {
      return;
    }
    let velocityX = 0;
    let velocityY = this.body.velocity.y * 30;
    let velocity = { x: velocityX, y: velocityY };
    let label = "unitOfWeapon";
    let newUnit = new UnitOfAttack(
      this.world,
      this.body.position.x,
      this.body.position.y,
      20,
      {
        restitution: 0.09,
        friction: 0.79,
        density: 0.89,
        frictionAir: 0.005,
        label: label,
        velocity: velocity,
        collisionFilter: {
          //used with mouse constraints to allow/not allow iteration
          category: notinteractable,
        },
      },
      this.liveTimeOfUnitOfAttack
    );
    if (this.body.velocity.y > 0) {
      this.unitsOfAttack.push(newUnit);
      if (this.unitsOfAttack.length == this.amountOfBalls) {
        this.isUnitsOfAttackCreated=true;

       
      }
    }
     
  }
}

class DroppingBombs extends Weapon {
  constructor(
    world,
    x,
    y,
    radius,
    label,
    amountOfBalls,
    liveTimeOfUnitOfAttack
  ) {
    super(world, x, y, radius, label, amountOfBalls, liveTimeOfUnitOfAttack);
    this.activationTimeForTimer = 0;
  }
  show() {
    super.show();
  }
  remove() {
    super.rename();
  }

  createUnitsOfAttack() {
    super.createUnitsOfAttack()
    //velocity is taken from the body of the weapon  player can see at the begining.
    // once the weapon is shot its velocity is copied to   unitsOfWeapon
    let velocityX = this.body.velocity.x;
    let velocityY = this.body.velocity.y;
    let velocity = { x: velocityX, y: velocityY };
    let label = "unitOfWeapon";

    let newUnit = new UnitOfAttack(
      this.world,
      this.body.position.x,
      this.body.position.y,
      10,

      {
        restitution: 0.09,
        friction: 0.79,
        density: 0.89,
        frictionAir: 0.005,
        label: label,
        velocity: velocity,
        collisionFilter: {
          //used with mouse constraints to allow/not allow iteration
          category: notinteractable,
        },
      },
      this.liveTimeOfUnitOfAttack
    );
    newUnit.applyVelocity();
    this.unitsOfAttack.push(newUnit);
    if (this.unitsOfAttack.length == this.amountOfBalls) {
      this.removeBody();

      this.isActivated = false;
    }
     
  }
}

class Grenade extends Weapon {
  constructor(
    world,
    x,
    y,
    radius,
    label,
    amountOfBalls,
    liveTimeOfUnitOfAttack
  ) {
    super(world, x, y, radius, label, amountOfBalls, liveTimeOfUnitOfAttack);
    this.activationTimeForTimer = 4500;
  }
  show() {
    super.show();
  }
  remove() {
    super.rename();
  }

  // applyForce(){
  //   this.unitsOfAttack.forEach((element)=>element.applyForce());

  // }

  //this is in miliseconds

  createUnitsOfAttack() {
    super.createUnitsOfAttack()
    //velocity is taken from the body of the weapon  player can see at the begining.
    // once the weapon is shot its velocity is copied to   unitsOfWeapon
    let velocityX = this.body.velocity.x;
    let velocityY = this.body.velocity.y;
    let velocity = { x: velocityX, y: velocityY };
    let label = "unitOfWeapon";

    let newUnit = new UnitOfAttack(
      this.world,
      this.body.position.x,
      this.body.position.y,
      10,

      {
        restitution: 0.2,
        friction: 0.49,
        density: 0.79,
        frictionAir: 0.005,
        label: label,
        velocity: velocity,
        collisionFilter: {
          //used with mouse constraints to allow/not allow iteration
          category: notinteractable,
        },
      },
      this.liveTimeOfUnitOfAttack
    );
    this.unitsOfAttack.push(newUnit);
    if (this.unitsOfAttack.length == this.amountOfBalls) {
      this.removeBody();

      this.isActivated = false;
    }
    
  }
}
