import { shuffleArray } from "./utils";

export const reshuffleMarketIfEmpty = (stacks) => {
  if (stacks.market.cards.length < 3) {
    const playedStack = stacks.played.cards;
    if (playedStack.length > 1) {
      const cardsToShuffle = playedStack.slice(0, -1);
      const topCard = playedStack[playedStack.length - 1];

      const shuffledCards = shuffleArray(cardsToShuffle);
      stacks.market.cards.push(...shuffledCards);

      stacks.played.cards = [topCard];
    }
  }
};
