"use strict";

class Weapon {
  constructor(world, x, y, radius, label, amountOfBalls) {
    let options = {
      restitution: 0.09,
      friction: 0.89,
      density: 0.99,
      frictionAir: 0.005,
      label: label,
      collisionFilter: {
        //used with mouse constraints to allow/not allow iteration
        category: interactable,
      },
    };
    this.amountOfBalls = amountOfBalls;
    this.isActivated = false;
    this.body = Matter.Bodies.circle(x, y, radius, options); //matter.js used radius rather than diameter
    Matter.World.add(world, this.body);
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.unitsOfAttack = [];
    this.world = world;
  }

  calculate() {
    if (
      this.isActivated &&
      this.unitsOfAttack.length <= this.amountOfBalls &&
      this.body != null
    ) {
      this.behaviourOfWeapon();
    }
  }

  activate() {
    if (this.body !=null) {
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
  remove() {
    Matter.World.remove(this.world, this.body);
    this.unitsOfAttack.forEach((element) => element.remove());
  }

  //dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
  removeBody() {
    Matter.World.remove(this.world, this.body);
    this.body = null;
  }
  //in milisceonds

  show() {
    this.calculate();    
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





class UnitOfAttack {
  constructor(world, x, y, radius,  options) {
    this.body = Matter.Bodies.circle(x, y, radius, options); //matter.js used radius rather than diameter
    this.velocity = this.body.velocity;

    this.x = x;
    this.y = y;
    this.radius = radius;
    this.world = world;
    Matter.World.add(this.world, this.body);
  }

  body() {
    return this.body;
  }



  applyForce() { //apply the same force to all crates 
    Matter.Body.applyForce( this.body, {
      x: this.body.position.x, 
      y: this.body.position.y
    }, {
      x: 0.05, 
      y:Matter.Common.Random(-100,-50)
    });
  };

  applyVelocity() {
    let velocityOfBody=this.body.velocity;
    //console.log('velocity is:x:'+velocityOfBody.x+" y:"+velocityOfBody.y);
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
      console.log("body of unitOfAttack is null");
      return;
    }
    let pos = this.body.position;
    let angle = this.body.angle;

    push(); //p5 translation
    translate(pos.x, pos.y);
    rotate(angle);
    let fillerColor = this.body.velocity.y < 0 ? "#FF0000" : "#FFFF00";
    let strokeColor= this.body.velocity.y >= 0 ? "#FF0000" : "#FFFF00";
    fill(fillerColor);
    strokeWeight(2);
    stroke(strokeColor);
    ellipseMode(CENTER); //switch centre to be centre rather than left, top
    circle(0, 0, this.radius);
    pop();
  }
}

class Series extends Weapon{
  constructor(world, x, y, radius, label, amountOfBalls) {
    super(world, x, y, radius, label, amountOfBalls);
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
  behaviourOfWeapon() {
  if  (this.body.velocity.y < 0) {
      return;
  }
    let velocityX = 0;
    let velocityY =  this.body.velocity.y*30;
    let velocity = { x: velocityX, y: velocityY };
    let label = "unit  od weapon";
    let newUnit = new UnitOfAttack(
      this.world,
      this.body.position.x,
      this.body.position.y,
      10,
      {
        restitution: 0.09,
        friction: 0.89,
        density: 0.99,
        frictionAir: 0.005,
        label: label,
        velocity:velocity,
        collisionFilter: {
          //used with mouse constraints to allow/not allow iteration
          category: notinteractable,
        },
      }
    );
    if (this.body.velocity.y > 0) {
     
      this.unitsOfAttack.push(newUnit);
      if (this.unitsOfAttack.length == this.amountOfBalls) {
        this.removeBody();

        this.isActivated = false;
      }
    }
  }
}

class ShotOfSeries extends Weapon{
  constructor(world, x, y, radius, label, amountOfBalls) {
    super(world, x, y, radius, label, amountOfBalls);
  }
  show() {
    super.show();
  }
  remove() {
    super.rename();
  }

  //this is in miliseconds
  getActivationTime() {
    return 0;
  }
  behaviourOfWeapon() {
    //velocity is taken from the body of the weapon  player can see at the begining.
    // once the weapon is shot its velocity is copied to   unitsOfWeapon
    let velocityX = this.body.velocity.x;
    let velocityY = this.body.velocity.y;
    let velocity = { x: velocityX, y: velocityY };
    let label = "unit  od weapon";

    let newUnit = new UnitOfAttack(
      this.world,
      this.body.position.x,
      this.body.position.y,
      10,
     
      {
        restitution: 0.09,
        friction: 0.89,
        density: 0.99,
        frictionAir: 0.005,
        label: label,
        velocity:velocity,
        collisionFilter: {
          //used with mouse constraints to allow/not allow iteration
          category: notinteractable,
        },
      }
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
  constructor(world, x, y, radius, label, amountOfBalls) {
    super(world, x, y, radius, label, amountOfBalls);
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
  getActivationTime() {
    return 4500;
  }
  behaviourOfWeapon() {
    //velocity is taken from the body of the weapon  player can see at the begining.
    // once the weapon is shot its velocity is copied to   unitsOfWeapon
    let velocityX = this.body.velocity.x;
    let velocityY = this.body.velocity.y;
    let velocity = { x: velocityX, y: velocityY };
    let label = "Grenade";

    let newUnit = new UnitOfAttack(
      this.world,
      this.body.position.x,
      this.body.position.y,
      10,
     
      {
        restitution: 0.09,
        friction: 0.89,
        density: 0.99,
        frictionAir: 0.005,
        label: label,
        velocity:velocity,
        collisionFilter: {
          //used with mouse constraints to allow/not allow iteration
          category: notinteractable,
        },
      }
    );
    this.unitsOfAttack.push(newUnit);
    if (this.unitsOfAttack.length == this.amountOfBalls) {
      this.removeBody();

      this.isActivated = false;
    }
  }
}
