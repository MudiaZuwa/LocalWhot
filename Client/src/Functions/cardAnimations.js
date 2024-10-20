export const moveCardTowardsTarget = (card) => {
  if (!card.x) {
    card.x = card.targetPosition.x;
    card.y = card.targetPosition.y;
  } else {
    card.x += (card.targetPosition.x - card.x) * 0.1;
    card.y += (card.targetPosition.y - card.y) * 0.1;
  }
};
