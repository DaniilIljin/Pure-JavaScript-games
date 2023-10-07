import { updateBird, setUpBird, getBirdRect } from "./bird.js";
import {
  updatePipes,
  setUpPipes,
  getPassedPipesCount,
  getPipeRects,
} from "./pipe.js";

document.addEventListener("keydown", function (event) {
  if (event.key === "b") {
    window.history.back();
  }
});
document.addEventListener("keypress", handleStart, { once: true });
const title = document.querySelector("[data-title]");
const subtitle = document.querySelector("[data-subtitle]");

function handleStart() {
  title.classList.add("hide");
  setUpBird();
  setUpPipes();
  lastTime = null;
  window.requestAnimationFrame(main);
}

let lastTime;
function main(currentTime) {
  if (lastTime == null) {
    lastTime = currentTime;
    window.requestAnimationFrame(main);
    return;
  }
  const delta = currentTime - lastTime;

  updateBird(delta);
  updatePipes(delta);

  if (checkLoose()) return handleLose();
  lastTime = currentTime;
  window.requestAnimationFrame(main);
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}

function checkLoose() {
  const birdRect = getBirdRect();
  const insidePipe = getPipeRects().some((rect) => isCollision(rect, birdRect));
  const outsideWorld = birdRect.top < 0 || birdRect.bottom > window.innerHeight;
  return outsideWorld || insidePipe;
}

function handleLose() {
  setTimeout(() => {
    title.classList.remove("hide");
    subtitle.classList.remove("hide");
    subtitle.textContent = `${getPassedPipesCount()} Pipes`;
    document.addEventListener("keypress", handleStart, { once: true });
  }, 300);
}
