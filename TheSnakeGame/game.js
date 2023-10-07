import {
  SNAKE_SPEED,
  update as updateSnake,
  draw as drawSnake,
  getSnakeHead,
  snakeIntersection,
} from "./snake.js";

import { outsideGrid } from "./grid.js";

import { update as updateFood, draw as drawFood } from "./food.js";

let lastTime = 0;
const gameBoard = document.querySelector("#game-board");
let gameover = false;

document.addEventListener("keydown", function (event) {
  if (event.key === "b") {
    window.history.back();
  }
});

function main(currentTime) {
  if (gameover) {
    if (confirm("You lost :(\nPress ok to restart.")) {
      window.location = "/TheSnakeGame";
    }
    return
  }

  window.requestAnimationFrame(main);
  const delta = (currentTime - lastTime) / 1000;
  if (delta < 1 / SNAKE_SPEED) return;

  lastTime = currentTime;

  update();
  draw();
}

window.requestAnimationFrame(main);

function update() {
  updateSnake();
  updateFood();
  checkDeath();
}

function draw() {
  gameBoard.innerHTML = "";
  drawSnake(gameBoard);
  drawFood(gameBoard);
}

function checkDeath() {
  gameover = outsideGrid(getSnakeHead()) || snakeIntersection();
}
