const canvas = document.querySelector("#canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;

class InputHndler {
  constructor(game) {
    this.game = game;

    window.addEventListener("keydown", (event) => {
      if (
        (event.key === "ArrowUp" || event.key === "ArrowDown") &&
        !this.game.keys.includes(event.key)
      ) {
        this.game.keys.push(event.key);
      } else if (event.key === " ") {
        this.game.player.shootTop();
      } else if (event.key === "d") {
        this.game.debug = !this.game.debug;
      }
    });
    window.addEventListener("keyup", (event) => {
      const index = this.game.keys.indexOf(event.key);
      if (index > -1) {
        this.game.keys.splice(index, 1);
      }
    });
  }
}

class Projectile {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 3;
    this.speed = 3;
    this.markedForDeletion = false;
    this.image = document.querySelector("#projectile");
  }
  update() {
    this.x += this.speed;
    if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
  }
  draw(context) {
    context.drawImage(this.image, this.x, this.y);
  }
}

class Particle {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.image = document.querySelector("#gears");
    this.frameX = Math.floor(Math.random() * 3);
    this.frameY = Math.floor(Math.random() * 3);
    this.spriteSize = 50;
    this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
    this.size = this.spriteSize * this.sizeModifier;
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * -15;
    this.gravity = 0.5;
    this.markedForDeletion = false;
    this.angle = 0;
    this.va = Math.random() * 0.2 - 0.1;
    this.bounced = 0;
    this.bottomBounceBoundary = Math.random() * 80 + 60;
  }
  update() {
    this.angle += this.va;
    this.speedY += this.gravity;
    this.x -= this.speedX + this.game.speed;
    this.y += this.speedY;
    if (this.y > this.game.height + this.size || this.x < 0 - this.size) {
      this.markedForDeletion = true;
    }
    if (
      this.y > this.game.height - this.bottomBounceBoundary &&
      this.bounced < 2
    ) {
      this.bounced++;
      this.speedY *= -0.5;
    }
  }
  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.drawImage(
      this.image,
      this.frameX * this.spriteSize,
      this.frameY * this.spriteSize,
      this.spriteSize,
      this.spriteSize,
      this.size * -0.5,
      this.size * -0.5,
      this.size,
      this.size
    );
    context.restore();
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.width = 120;
    this.height = 190;
    this.x = 20;
    this.y = 110;
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame = 37;
    this.speedY = 0;
    this.maxSpeed = 5;
    this.projectiles = [];
    this.image = document.querySelector("#player");
    this.powerUp = false;
    this.powerUpTimer = 0;
    this.powerUpLimit = 10000;
  }
  update(delta) {
    if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
    else if (this.game.keys.includes("ArrowDown")) this.speedY = this.maxSpeed;
    else this.speedY = 0;
    this.y += this.speedY;
    //vertical bounderies
    if (this.y > this.game.height - this.height * 0.5) {
      this.y = this.game.height - this.height * 0.5;
    } else if (this.y < -this.height * 0.5) {
      this.y = -this.height * 0.5;
    }
    //handle projectiles
    this.projectiles.forEach((projectile) => {
      projectile.update();
    });

    this.projectiles = this.projectiles.filter(
      (projectile) => !projectile.markedForDeletion
    );
    if (this.frameX < this.maxFrame) {
      this.frameX++;
    } else {
      this.frameX = 0;
    }
    //power up
    if (this.powerUp) {
      if (this.powerUpTimer > this.powerUpLimit) {
        this.powerUpTimer = 0;
        this.powerUp = false;
        this.frameY = 0;
      } else {
        this.powerUpTimer += delta;
        this.frameY = 1;
        this.game.ammo += 0.1;
      }
    }
  }
  draw(context) {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
    this.projectiles.forEach((p) => {
      p.draw(context);
    });
    context.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  shootTop() {
    if (this.game.ammo > 0) {
      this.projectiles.push(
        new Projectile(this.game, this.x + 80, this.y + 30)
      );
      this.game.ammo--;
    }
    if (this.powerUp) {
      this.shootBottom();
    }
  }
  shootBottom() {
    if (this.game.ammo > 0) {
      this.projectiles.push(
        new Projectile(this.game, this.x + 80, this.y + 175)
      );
      this.game.ammo--;
    }
  }
  enterPowerUp() {
    this.powerUpTimer = 0;
    this.powerUp = true;
    if (this.game.ammo < this.game.maxAmmo) {
      this.game.ammo = this.game.maxAmmo;
    }
  }
}

class Enemy {
  constructor(game) {
    this.game = game;
    this.x = this.game.width;
    this.speedX = Math.random() * -1.5 - 0.5;
    this.markedForDeletion = false;
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame = 37;
  }
  update() {
    this.x += this.speedX - this.game.speed;
    if (this.x + this.width < 0) {
      this.markedForDeletion = true;
    }
    // sprite animatiin
    if (this.frameX < this.maxFrame) {
      this.frameX++;
    } else {
      this.frameX = 0;
    }
  }
  draw(context) {
    if (this.game.debug) {
      context.strokeRect(this.x, this.y, this.width, this.height);
    }
    context.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (this.game.debug) {
      context.font = "20px Helvetica";
      context.fillText(this.lives, this.x, this.y);
    }
  }
}

class Angler1 extends Enemy {
  constructor(game) {
    super(game);
    this.width = 228;
    this.height = 169;
    this.lives = 2;
    this.score = this.lives;
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.image = document.querySelector("#angler1");
    this.frameY = Math.floor(Math.random() * 3);
  }
}

class Angler2 extends Enemy {
  constructor(game) {
    super(game);
    this.width = 213;
    this.height = 165;
    this.lives = 3;
    this.score = this.lives;
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.image = document.querySelector("#angler2");
    this.frameY = Math.floor(Math.random() * 2);
  }
}

class LuckyFish extends Enemy {
  constructor(game) {
    super(game);
    this.width = 99;
    this.height = 95;
    this.lives = 3;
    this.score = 15;
    this.type = "lucky";
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.image = document.querySelector("#lucky");
    this.frameY = Math.floor(Math.random() * 2);
  }
}

class HiveWhale extends Enemy {
  constructor(game) {
    super(game);
    this.width = 400;
    this.height = 227;
    this.lives = 15;
    this.score = this.lives;
    this.y = Math.random() * (this.game.height * 0.95 - this.height);
    this.image = document.querySelector("#hivewhale");
    this.frameY = 0;
    this.type = "hive";
    this.speedX = Math.random() * -1.2 - 0.2;
  }
}

class Drone extends Enemy {
  constructor(game, x, y) {
    super(game);
    this.width = 115;
    this.height = 95;
    this.lives = 3;
    this.score = this.lives;
    this.x = x;
    this.y = y;
    this.type = "drone";
    this.image = document.querySelector("#drone");
    this.frameY = Math.floor(Math.random() * 2);
    this.speedX = Math.random() * -1.2 - 0.2;
  }
}

class Layer {
  constructor(game, image, speedModifier) {
    this.game = game;
    this.image = image;
    this.speedModifier = speedModifier;
    this.width = 1768;
    this.height = 500;
    this.x = 0;
    this.y = 0;
  }
  update() {
    if (this.x <= -this.width) {
      this.x = 0;
    }
    this.x -= this.game.speed * this.speedModifier;
  }
  draw(context) {
    context.drawImage(this.image, this.x, this.y);
    context.drawImage(this.image, this.x + this.width, this.y);
  }
}

class Background {
  constructor(game) {
    this.game = game;
    this.image1 = document.querySelector("#layer1");
    this.image2 = document.querySelector("#layer2");
    this.image3 = document.querySelector("#layer3");
    this.image4 = document.querySelector("#layer4");
    this.layer1 = new Layer(this.game, this.image1, 0.2);
    this.layer2 = new Layer(this.game, this.image2, 0.4);
    this.layer3 = new Layer(this.game, this.image3, 1);
    this.layer4 = new Layer(this.game, this.image4, 1.5);
    this.layers = [this.layer1, this.layer2, this.layer3];
  }
  update() {
    this.layers.forEach((l) => l.update());
  }
  draw(context) {
    this.layers.forEach((l) => l.draw(context));
  }
}

class Explosion {
  constructor(game, x, y) {
    this.game = game;
    this.frameX = 0;
    this.maxframe = 8;
    this.spriteHeight = 200;
    this.spriteWidth = 200;   
    this.width = this.spriteWidth;
    this.height = this.spriteHeight;
    this.x = x - this.width * 0.5;
    this.y = y - this.height * 0.5;
    this.fps = 30;
    this.timer = 0;
    this.interval = 1000 / this.fps;
    this.markedForDeletion = false;
  }
  update(delta) {
    this.x -= this.game.speed;
    if (this.timer > this.interval) {
      this.frameX++;
      this.timer = 0;
    } else {
      this.timer += delta;
    }
    if (this.frameX > this.maxframe) {
      this.markedForDeletion = true;
    }
  }
  draw(context) {
    context.drawImage(
      this.image,
      this.frameX * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

class SmokeExplosion extends Explosion {
  constructor(game, x, y) {
    super(game, x, y);
    this.image = document.querySelector("#smokeExplosion");
  }
}

class FireExplosion extends Explosion {
  constructor(game, x, y) {
    super(game, x, y);
    this.image = document.querySelector("#fireExplosion");
  }
}

class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 25;
    this.fontFamily = "Bangers";
    this.color = "white";
  }

  draw(context) {
    context.save();
    context.fillStyle = this.color;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = "black";
    context.font = this.fontSize + "px " + this.fontFamily;
    //score
    context.fillText("Score: " + this.game.score, 20, 40);

    //timer
    const formatedTime = (this.game.gameTime * 0.001).toFixed(1);
    context.fillText("Timer: " + formatedTime, 20, 100);

    // game over messages
    if (this.game.gameOver) {
      context.textAlign = "center";
      let message1;
      let message2;
      if (this.game.score > this.game.winningScore) {
        message1 = "Most Wondrous!";
        message2 = "Well done explorer!";
      } else {
        message1 = "Blazes!";
        message2 = "Get my repair kit and try again!";
      }
      context.font = "70px " + this.fontFamily;
      context.fillText(
        message1,
        this.game.width * 0.5,
        this.game.height * 0.5 - 20
      );
      context.font = "25px " + this.fontFamily;
      context.fillText(
        message2,
        this.game.width * 0.5,
        this.game.height * 0.5 + 20
      );
    }
    // ammo
    if (this.game.player.powerUp) {
      context.fillStyle = "#ffffbd";
    }
    for (let i = 0; i < this.game.ammo; i++) {
      context.fillRect(20 + 5 * i, 50, 3, 20);
    }
    context.restore();
  }
}

class Game {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.ui = new UI(this);
    this.background = new Background(this);
    this.player = new Player(this);
    this.input = new InputHndler(this);
    this.keys = [];
    this.enemies = [];
    this.particles = [];
    this.explosions = [];
    this.enemyTimer = 0;
    this.enemyInterval = 1000;
    this.ammo = 20;
    this.maxAmmo = 50;
    this.ammoTimer = 0;
    this.ammoInterval = 500;
    this.gameOver = false;
    this.score = 0;
    this.winningScore = 80;
    this.gameTime = 0;
    this.timeLimit = 30000;
    this.speed = 1;
    this.debug = false;
  }
  update(delta) {
    if (!this.gameOver) this.gameTime += delta;
    if (this.gameTime > this.timeLimit) this.gameOver = true;
    this.background.update();
    this.background.layer4.update();
    this.player.update(delta);
    //ammo update
    if (this.ammoTimer > this.ammoInterval) {
      if (this.ammo < this.maxAmmo) {
        this.ammo++;
      }
      this.ammoTimer = 0;
    } else {
      this.ammoTimer += delta;
    }
    //projectiles update
    this.particles.forEach((p) => p.update());
    this.particles = this.particles.filter((p) => !p.markedForDeletion);
    //explosions update
    this.explosions.forEach((ex) => ex.update(delta));
    this.explosions = this.explosions.filter((ex) => !ex.markedForDeletion);
    //enemy update and collision detection
    this.enemies.forEach((e) => {
      e.update();
      if (this.checkCollision(this.player, e)) {
        e.markedForDeletion = true;
        this.addExplosion(e);
        for (let i = 0; i < 3; i++) {
          this.particles.push(
            new Particle(this, e.x + e.width * 0.5, e.y + e.height * 0.5)
          );
        }
        if (e.type === "lucky") {
          this.player.enterPowerUp();
        } else {
          if (!this.gameOver) {
            this.score--;
          }
        }
      }
      this.player.projectiles.forEach((p) => {
        if (this.checkCollision(p, e)) {
          e.lives--;
          p.markedForDeletion = true;
          this.particles.push(
            new Particle(this, e.x + e.width * 0.5, e.y + e.height * 0.5)
          );
          if (e.lives <= 0) {
            e.markedForDeletion = true;
            this.addExplosion(e);
            for (let i = 0; i < 3; i++) {
              this.particles.push(
                new Particle(this, e.x + e.width * 0.5, e.y + e.height * 0.5)
              );
            }
            if (e.type === "hive") {
              for (let i = 0; i < 5; i++) {
                this.enemies.push(
                  new Drone(
                    this,
                    e.x + Math.random() * e.width,
                    e.y + Math.random() * e.height * 0.5
                  )
                );
              }
            }
            if (!this.gameOver) {
              this.score += e.score;
            }
            /*if (this.score > this.winningScore) {
            //  this.gameOver = true;
            }*/
          }
        }
      });
    });
    //deleting enemies if they left screen
    this.enemies = this.enemies.filter((e) => !e.markedForDeletion);
    if (this.enemyTimer > this.enemyInterval) {
      this.addEnemy();
      this.enemyTimer = 0;
    } else {
      this.enemyTimer += delta;
    }
  }

  draw(context) {
    this.background.draw(context);
    this.ui.draw(context);
    this.player.draw(context);
    this.particles.forEach((p) => p.draw(context));
    this.enemies.forEach((e) => {
      e.draw(context);
    });
    this.explosions.forEach((ex) => ex.draw(context));
    this.background.layer4.draw(context);
  }

  addEnemy() {
    const randomize = Math.random();
    if (randomize < 0.5) {
      this.enemies.push(new Angler1(this));
    } else if (randomize < 0.6) {
      this.enemies.push(new Angler2(this));
    } else if (randomize < 0.7) {
      this.enemies.push(new HiveWhale(this));
    } else {
      this.enemies.push(new LuckyFish(this));
    }
  }
  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.width &&
      rect1.y + rect1.height > rect2.y
    );
  }
  addExplosion(enemy) {
    const randomize = Math.random();
    if (randomize < 0.5) {
      this.explosions.push(
        new SmokeExplosion(
          this,
          enemy.x + enemy.width * 0.5,
          enemy.y + enemy.height * 0.5
        )
      );
    } else {
      this.explosions.push(
        new FireExplosion(
          this,
          enemy.x + enemy.width * 0.5,
          enemy.y + enemy.height * 0.5
        )
      );
    }
  }
}

const game = new Game(canvas.width, canvas.height);

//game loop
let lasttime = 0;
function animate(timeStamp) {
  const delta = timeStamp - lasttime;
  lasttime = timeStamp;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.draw(ctx);
  game.update(delta);
  window.requestAnimationFrame(animate);
}

animate(0);
