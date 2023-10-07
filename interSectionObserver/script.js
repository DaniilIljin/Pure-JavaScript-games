const cards = document.querySelectorAll(".card");
const cardContainer = document.querySelector(".card-container");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("show", entry.isIntersecting);
      // if (entry.isIntersecting) {
      //     observer.unobserve(entry.target)
      // }
    });
    console.log(entries);
  },
  {
    threshold: 1,
    root: cardContainer
  }
);

cards.forEach((card) => {
  observer.observe(card);
});

const lastCardObserver = new IntersectionObserver((entries) => {
  const lastCard = entries[0];
  if (!lastCard.isIntersecting) return;
  loadNewCards();
  lastCardObserver.unobserve(lastCard.target)
  lastCardObserver.observe(document.querySelector('.card:last-child'))
}, {
    rootMargin: "-100px"
});

lastCardObserver.observe(document.querySelector(".card:last-child"));

function loadNewCards() {
  for (let i = 0; i < 10; i++) {
    const card = document.createElement("div");
    card.innerText = "New Card";
    card.classList.add("card");
    observer.observe(card);
    cardContainer.append(card);
  }
}
