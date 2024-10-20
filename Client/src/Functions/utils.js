export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getNextPlayerTurn = (currentTurn, players, skip = false) => {
  const currentIndex = players.indexOf(currentTurn);
  const increment = skip ? 2 : 1; 
  const nextIndex = (currentIndex + increment) % players.length; 
  return players[nextIndex];
};
