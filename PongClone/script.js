import Ball from "./Ball.js";
import Paddle from "./Paddle.js";

const ball = new Ball(document.querySelector("#ball"));
const playerPaddle = new Paddle(document.querySelector("#player-paddle"));
const computerPaddle = new Paddle(document.querySelector("#computer-paddle"));
const playerScroreElem = document.querySelector("#player-score");
const computerScroreElem = document.querySelector("#computer-score");

document.addEventListener("keydown", function (event) {
  if (event.key === "b") {
    window.history.back();
  }
});

let lastTime;
function update(time) {
  if (lastTime) {
    const delta = time - lastTime;
    ball.update(delta, [playerPaddle.rect(), computerPaddle.rect()]);
    computerPaddle.update(delta, ball.y);
    const hue = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--hue")
    );

    document.documentElement.style.setProperty("--hue", hue + delta * 0.01);

    if (isLose()) handleLose();
  }
  lastTime = time;
  window.requestAnimationFrame(update);
}

function handleLose() {
  const rect = ball.rect();
  if (rect.right >= window.innerWidth) {
    playerScroreElem.textContent = parseInt(playerScroreElem.textContent) + 1;
  } else {
    computerScroreElem.textContent =
      parseInt(computerScroreElem.textContent) + 1;
  }
  ball.reset();
  computerPaddle.reset();
}

function isLose() {
  const rect = ball.rect();
  return rect.right >= window.innerWidth || rect.left <= 0;
}

document.addEventListener("mousemove", (e) => {
  playerPaddle.position = (e.y / window.innerHeight) * 100;
});

window.requestAnimationFrame(update);
