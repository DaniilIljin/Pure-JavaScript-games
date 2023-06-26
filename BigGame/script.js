const canvas = document.querySelector("#canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 500;
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
  }
  update() {
    this.x += this.speed;
    if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
  }
  draw(context) {
    context.fillStyle = "yellow";
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.width = 120;
    this.height = 190;
    this.x = 20;
    this.y = 110;
    this.speedY = 0;
    this.maxSpeed = 3;
    this.projectiles = [];
  }
  update() {
    if (this.game.keys.includes("ArrowUp")) this.speedY = -this.maxSpeed;
    else if (this.game.keys.includes("ArrowDown")) this.speedY = this.maxSpeed;
    else this.speedY = 0;
    this.y += this.speedY;
    //handle projectiles

    this.projectiles.forEach((projectile) => {
      projectile.update();
    });

    this.projectiles = this.projectiles.filter(
      (projectile) => !projectile.markedForDeletion
    );
  }
  draw(context) {
    context.fillStyle = "black";
    context.fillRect(this.x, this.y, this.width, this.height);
    this.projectiles.forEach((p) => {
      p.draw(context);
    });
  }
  shootTop() {
    if (this.game.ammo > 0) {
      this.projectiles.push(
        new Projectile(this.game, this.x + 80, this.y + 30)
      );
      this.game.ammo--;
    }
  }
}

class Enemy {
  constructor(game) {
    this.game = game;
    this.x = this.game.width;
    this.speedX = Math.random() * -1.5 - 0.5;
    this.markedForDeletion = false;
    this.lives = 5;
    this.score = this.lives;
  }
  update() {
    this.x += this.speedX;
    if (this.x + this.width < 0) {
      this.markedForDeletion = true;
    }
  }
  draw(context) {
    context.fillStyle = "red";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillStyle = "black";
    context.font = "20px Helvetica";
    context.fillText(this.lives, this.x, this.y);
  }
}

class Angler1 extends Enemy {
  constructor(game) {
    super(game);
    this.width = 228 * 0.2;
    this.height = 169 * 0.2;
    this.y = Math.random() * (this.game.height * 0.9 - this.height);
  }
}

class Layer {}

class Background {}

class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 25;
    this.fontFamily = "Halvetica";
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
    // ammo
    for (let i = 0; i < this.game.ammo; i++) {
      context.fillRect(20 + 5 * i, 50, 3, 20);
    }

    //timer
    const formatedTime = (this.game.gameTime * 0.001).toFixed(1);
    context.fillText("Timer: " + formatedTime, 20, 100);

    // game over messages
    if (this.game.gameOver) {
      context.textAlign = "center";
      let message1;
      let message2;
      if (this.game.score > this.game.winningScore) {
        message1 = "You win!";
        message2 = "Well done!";
      } else {
        message1 = "You lose :(";
        message2 = "Try again next time...";
      }
      context.font = "50px " + this.fontFamily;
      context.fillText(
        message1,
        this.game.width * 0.5,
        this.game.height * 0.5 - 40
      );
      context.font = "25px " + this.fontFamily;
      context.fillText(
        message2,
        this.game.width * 0.5,
        this.game.height * 0.5 + 40
      );
    }
    context.restore();
  }
}

class Game {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.ui = new UI(this);
    this.player = new Player(this);
    this.input = new InputHndler(this);
    this.keys = [];
    this.enemies = [];
    this.enemyTimer = 0;
    this.enemyInterval = 1000;
    this.ammo = 20;
    this.maxAmmo = 50;
    this.ammoTimer = 0;
    this.ammoInterval = 500;
    this.gameOver = false;
    this.score = 0;
    this.winningScore = 10;
    this.gameTime = 0;
    this.timeLimit = 5000;
  }
  update(delta) {
    if (!this.gameOver) this.gameTime += delta;
    if (this.gameTime > this.timeLimit) this.gameOver = true;
    this.player.update();
    //ammo update
    if (this.ammoTimer > this.ammoInterval) {
      if (this.ammo < this.maxAmmo) {
        this.ammo++;
      }
      this.ammoTimer = 0;
    } else {
      this.ammoTimer += delta;
    }
    //enemy update and collision detection
    this.enemies.forEach((e) => {
      e.update();
      if (this.checkCollision(this.player, e)) {
        e.markedForDeletion = true;
      }
      this.player.projectiles.forEach((p) => {
        if (this.checkCollision(p, e)) {
          e.lives--;
          p.markedForDeletion = true;
          if (e.lives <= 0) {
            e.markedForDeletion = true;
            if (!this.gameOver) {
              this.score += e.score;
            }
            if (this.score > this.winningScore) {
              this.gameOver = true;
            }
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
    this.player.draw(context);
    this.ui.draw(context);
    this.enemies.forEach((e) => {
      e.draw(context);
    });
  }

  addEnemy() {
    this.enemies.push(new Angler1(this));
  }
  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.width &&
      rect1.y + rect1.height > rect2.y
    );
  }
}

const game = new Game(canvas.width, canvas.height);

//game loop
let lasttime = 0;
function animate(timeStamp) {
  const delta = timeStamp - lasttime;
  lasttime = timeStamp;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  game.update(delta);
  game.draw(ctx);
  window.requestAnimationFrame(animate);
}

animate(0);
