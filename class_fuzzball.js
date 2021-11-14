"use strict";

class c_fuzzball {
  constructor(x, y, radius, label, amountOfBalls) {
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
    if (this.body == null) {
    } else {
      this.isActivated = true;
      //this.unitsOfAttack.length=0;
    }

    //TODO
    //objects  of array should be destroyed by js garbadge collection mechanism
  }

  body() {
    return this.body;
  }
  remove() {
    Matter.World.remove(world, this.body);
    this.unitsOfAttack.foreach((element) => element.remove());
  }

  //dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
  removeBody() {
    Matter.World.remove(world, this.body);
    this.body = null;
  }
   //in milisceonds


  show() {
    this.calculate();

    this.unitsOfAttack.forEach((element) => element.show());
    console.log("isActivated:" + this.isActivated);
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
  constructor(x, y, radius, label,options) {
     
    this.body = Matter.Bodies.circle(x, y, radius, options); //matter.js used radius rather than diameter
    Matter.World.add(world, this.body);

    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  body() {
    return this.body;
  }

  //dont forget bodies are added to the matter world meaning even if not visible the physics engine still manages it
  remove() {
    Matter.World.remove(world, this.body);
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
    let filler = this.body.velocity.y < 0 ? "#FF0000" : "#FFFF00";
    fill(filler);
    ellipseMode(CENTER); //switch centre to be centre rather than left, top
    circle(0, 0, this.radius);
    pop();
  }
}

class Series extends c_fuzzball {
  constructor(x, y, radius, label, amountOfBalls) {
    super(x, y, radius, label, amountOfBalls);
  }
  show() {
    super.show();
  }

  getActivationTime(){
    return 550;
  }
  remove() {
    super.rename();
  }
  behaviourOfWeapon() {
    if (this.body.velocity.y > 0) {
      this.unitsOfAttack.push(
        new UnitOfAttack(
          this.body.position.x,
          this.body.position.y,
          10,
          "UnitOfAttack",
          {
            restitution: 0.09,
            friction: 0.89,
            density: 0.99,
            frictionAir: 0.005,
            label: label,
            collisionFilter: {
              //used with mouse constraints to allow/not allow iteration
              category: notinteractable,
            }
          }
        )
      );
      if (this.unitsOfAttack.length == this.amountOfBalls) {
        this.removeBody();

        this.isActivated = false;
      }
    }
  }
}

class ShotOfSeries extends c_fuzzball {
  constructor(x, y, radius, label, amountOfBalls) {
    super(x, y, radius, label, amountOfBalls);
  }
  show() {
    super.show();
  }
  remove() {
    super.rename();
  }

  //this is in miliseconds
  getActivationTime(){
    return 0;
  }
  behaviourOfWeapon() {
     let velocityY= this.body.velocity.y*50 ;
     let velocityX= this.body.velocity.x ;
     let angle=this.body.angle;
     let force=this.body.force;
     let label=this.label;
     let speed=this.body.speed;
    let newOptions=this.body.options;
    this.unitsOfAttack.push(
      new UnitOfAttack(
        this.body.position.x,
        this.body.position.y,
        10,
        "UnitOfAttack",
        {
          velocity: {velocityX,velocityY},
          angle:angle,
          force:force,
          speed:speed,
          restitution: 0.09,
          friction: 0.89,
          density: 0.99,
          frictionAir: 0.005,
          label: label,
          collisionFilter: {
            //used with mouse constraints to allow/not allow iteration
            category: notinteractable,
          }
        }
      )
    );
    if (this.unitsOfAttack.length == this.amountOfBalls) {
      this.removeBody();

      this.isActivated = false;
    }
  }
}
