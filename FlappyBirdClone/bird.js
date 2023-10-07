const birdElem = document.querySelector("[data-bird]");
const BIRD_SPEED = 0.5;
let timeSinceLastJump = Number.POSITIVE_INFINITY;
const JUMP_DURATION = 110;

export function setUpBird() {
  setTop(window.innerHeight / 2);
  document.removeEventListener("keydown", handleJump);
  document.addEventListener("keydown", handleJump);
}

export function updateBird(delta) {
    if (timeSinceLastJump < JUMP_DURATION) {
        setTop(getTop() - BIRD_SPEED * delta);
    } else {
        setTop(getTop() + BIRD_SPEED * delta);
    }

    timeSinceLastJump += delta;
}

export function getBirdRect() {
    return birdElem.getBoundingClientRect();
}

function setTop(top) {
  birdElem.style.setProperty("--bird-top", top);
}

function getTop() {
  return parseFloat(getComputedStyle(birdElem).getPropertyValue("--bird-top"));
}

function handleJump(e) {
  if (e.code !== "Space") return;
  timeSinceLastJump = 0;
}
