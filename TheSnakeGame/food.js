import { onSnake, expandSnake } from "./snake.js";
import { randomGridPosition } from "./grid.js";

let food = getRandomFoodPosittion();
const EXPANSION_RATE = 1;

export function update() {
  if (onSnake(food)) {
    expandSnake(EXPANSION_RATE);
    food = getRandomFoodPosittion();
  }
}

export function draw(gameBoard) {
  const foodElem = document.createElement("div");
  foodElem.style.gridRowStart = food.y;
  foodElem.style.gridColumnStart = food.x;
  foodElem.classList.add("food");
  gameBoard.appendChild(foodElem);
}

function getRandomFoodPosittion() {
  let newFoodPosition;
  while (newFoodPosition == null || onSnake(newFoodPosition)) {
    newFoodPosition = randomGridPosition();
  }
  return newFoodPosition;
}
