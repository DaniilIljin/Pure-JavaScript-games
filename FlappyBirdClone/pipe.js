const HOLE_HIGHT = 220;
const PIPE_WIDTH = 100;
const PIPE_INTERVAL = 1500;
const PIPE_SPEED = 0.3;
let pipes = [];
let timeSinceLastPipe = 0;
let passedPipesCount = 0;

export function setUpPipes() {
  document.documentElement.style.setProperty("--pipe-width", PIPE_WIDTH);
  document.documentElement.style.setProperty("--hole-height", HOLE_HIGHT);
  pipes.forEach((pipe) => pipe.remove())
  timeSinceLastPipe = PIPE_INTERVAL;
  passedPipesCount = 0
}

export function updatePipes(delta) {
  timeSinceLastPipe += delta;

  if (timeSinceLastPipe > PIPE_INTERVAL) {
    timeSinceLastPipe -= PIPE_INTERVAL;
    createPipe();
  }

  pipes.forEach((pipe) => {
    if (pipe.left + PIPE_WIDTH < 0) {
      passedPipesCount++;
      return pipe.remove();
    }
    pipe.left = pipe.left - delta * PIPE_SPEED;
  });
}

export function getPipeRects() {
    return pipes.flatMap(pipe => pipe.rects())
}

function createPipe() {
  const pipeElem = document.createElement("div");
  const topElem = createPipeSegment("top");
  const bottomElem = createPipeSegment("bottom");

  pipeElem.append(topElem);
  pipeElem.append(bottomElem);
  pipeElem.classList.add("pipe");
  pipeElem.style.setProperty(
    "--hole-top",
    randomNumberBetween(HOLE_HIGHT * 1.5, window.innerHeight - HOLE_HIGHT * 1)
  );

  const pipe = {
    get left() {
      return parseFloat(
        getComputedStyle(pipeElem).getPropertyValue("--pipe-left")
      );
    },
    set left(value) {
      pipeElem.style.setProperty("--pipe-left", value);
    },
    remove() {
      pipes = pipes.filter((p) => p !== pipe);
      pipeElem.remove();
    },
    rects() {
        return [
            topElem.getBoundingClientRect(),
            bottomElem.getBoundingClientRect(),
        ];
    }
  };

  pipe.left = window.innerWidth;
  document.body.append(pipeElem);
  pipes.push(pipe);
}

export function getPassedPipesCount() {
  return passedPipesCount;
}

function createPipeSegment(position) {
  const segment = document.createElement("div");
  segment.classList.add("segment", position);
  return segment;
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
