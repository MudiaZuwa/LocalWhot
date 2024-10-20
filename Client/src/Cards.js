import { shuffleArray, getNextPlayerTurn } from "./Functions/utils";
import { moveCardTowardsTarget } from "./Functions/cardAnimations";
import { setupMultiplayerListeners } from "./Functions/multiplayerListeners";
import { reshuffleMarketIfEmpty } from "./Functions/marketLogic";
import { cardData, cardImages } from "./Functions/cardsData";

export default class Cards {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.ctx = gameManager.ctx;
    this.cardImages = cardImages;
    this.cardData = cardData;
    this.selectedPiece = null;
    this.isMultiplayer = this.gameManager.isMultiplayer;
    this.roundTurns = [];

    if (!this.isMultiplayer) this.Restart();
    else
      setupMultiplayerListeners(
        gameManager,
        this.Restart.bind(this),
        this.updateStacks.bind(this),
        this.roundTurns
      );
  }

  animate() {
    const gameWidth = this.gameManager.gameDimensions.width;
    const gameHeight = this.gameManager.gameDimensions.height;
    const cardSize = {
      width: (gameHeight - 40) / 5,
      height: (gameHeight - 40) / 3,
    };

    const maxCardsPerRow = 6;
    const stackSpacing = 3;

    Object.keys(this.stacks).forEach((stack) => {
      let topCardInLayer = {};

      this.stacks[stack].cards.forEach((card, index) => {
        let targetX, targetY;
        card.image = this.cardImages[card.name];
        card.width = cardSize.width;
        card.height = cardSize.height;

        // Determine target positions
        [targetX, targetY] = this.calculateCardPosition(
          stack,
          index,
          cardSize,
          gameWidth,
          gameHeight,
          maxCardsPerRow,
          stackSpacing
        );

        card.targetPosition = { x: targetX, y: targetY };
        card.offset = {
          position: {
            x: stack === "market" ? card.image.width / 2 : 0,
            y: 0,
          },
          size: {
            width: card.image.width / 2,
            height: card.image.height,
          },
        };

        moveCardTowardsTarget(card);

        this.ctx.drawImage(
          card.image,
          card.offset.position.x,
          card.offset.position.y,
          card.offset.size.width,
          card.offset.size.height,
          card.x,
          card.y,
          cardSize.width,
          cardSize.height
        );
      });
    });
  }

  calculateCardPosition(
    stack,
    index,
    cardSize,
    gameWidth,
    gameHeight,
    maxCardsPerRow,
    stackSpacing
  ) {
    let row, col;
    let targetX, targetY;
    switch (stack) {
      case "market":
        targetX =
          gameWidth - (cardSize.width + cardSize.width / 2) - 0.3 * index;
        targetY = gameHeight / 2 + (cardSize.height - gameHeight / 2);
        break;

      case "played":
        targetX = (gameWidth - cardSize.width) / 2 - 0.3 * index;
        targetY = (gameHeight - cardSize.height) / 2;
        break;

      case "player1":
      case "player2":
      case this.gameManager.player:
        row = Math.floor(index / maxCardsPerRow);
        col = index % maxCardsPerRow;

        if (
          stack === "player1" ||
          (this.isMultiplayer && this.gameManager.player === stack)
        ) {
          targetX = cardSize.width / 2 + col * (cardSize.width - 10);
          targetY = gameHeight - cardSize.height - 20 - row * stackSpacing;
        } else {
          targetX = cardSize.width / 2 + col * (cardSize.width - 10);
          targetY = 20 + row * stackSpacing;
        }
        break;
    }

    return [targetX, targetY];
  }

  Restart() {
    const shuffledCards = shuffleArray(Object.values(this.cardData));
    this.roundTurns =
      this.roundTurns.length < 2 ? this.gameManager.players : this.roundTurns;
    const players = this.roundTurns;

    if (
      !this.isMultiplayer ||
      (this.isMultiplayer && this.gameManager.player === players[0])
    ) {
      this.stacks = {
        market: { cards: [] },
        played: { cards: shuffledCards },
      };

      players.forEach((player) => {
        this.stacks[player] = { cards: [] };
      });

      if (this.isMultiplayer) {
        this.gameManager.socket.emit(
          "sendStacks",
          this.stacks,
          this.gameManager.playerTurn,
          this.gameManager.room
        );
      }

      setTimeout(() => {
        reshuffleMarketIfEmpty(this.stacks);
        players.forEach((player) => {
          this.getCards(player, 5);
        });

        if (this.isMultiplayer) {
          this.gameManager.socket.emit(
            "sendStacks",
            this.stacks,
            this.gameManager.playerTurn,
            this.gameManager.room
          );
        }
      }, 3000);
    }
  }

  getCards(player, num) {
    const selectedCards = this.stacks.market.cards.slice(0, num);
    console.log();
    this.stacks[player].cards.push(...selectedCards);
    this.stacks.market.cards = this.stacks.market.cards.slice(num);
    reshuffleMarketIfEmpty(this.stacks);
  }

  playCard(player, card) {
    const players = this.roundTurns;
    const playerCards = this.stacks[player].cards;
    const cardIndex = playerCards.findIndex(
      (playerCard) => playerCard === card
    );

    if (cardIndex === -1 || player !== this.gameManager.playerTurn) return;

    const existingPlayedCards = this.stacks.played.cards;
    const lastPlayedCard = existingPlayedCards[existingPlayedCards.length - 1];

    if (lastPlayedCard && !this.isValidMove(lastPlayedCard, card)) return;

    this.stacks.played.cards.push(card);
    this.stacks[player].cards.splice(cardIndex, 1);

    if (this.stacks[player].cards.length < 1) this.playerWins(player);

    const nextOpponent = getNextPlayerTurn(
      this.gameManager.playerTurn,
      players
    );
    this.updateGameStatus(card, nextOpponent);
  }

  updateGameStatus(card, nextOpponent) {
    switch (card.number) {
      case 2:
        this.getCards(nextOpponent, 2);
        break;
      case 14:
        this.getCards(nextOpponent, 1);
        break;
    }

    const skipTurn =
      card.number === 1 ||
      card.number === 8 ||
      card.number === 2 ||
      card.number === 14;
    this.gameManager.playerTurn = getNextPlayerTurn(
      this.gameManager.playerTurn,
      this.roundTurns,
      skipTurn
    );

    if (this.isMultiplayer) {
      this.gameManager.socket.emit(
        "sendStacks",
        this.stacks,
        this.gameManager.playerTurn,
        this.gameManager.room
      );
    } else this.gameManager.player = this.gameManager.playerTurn;
  }

  updateStacks(stacks, playerTurn) {
    this.stacks = stacks;
    this.gameManager.playerTurn = playerTurn;
  }

  isValidMove(lastPlayedCard, currentCard) {
    return (
      lastPlayedCard.shape === currentCard.shape ||
      lastPlayedCard.number === currentCard.number
    );
  }

  playerWins(winPlayer) {
    if (this.roundTurns.length > 2) {
      const totalScores = {};

      this.roundTurns.forEach((player) => {
        totalScores[player] = 0;

        this.stacks[player].cards.forEach((card) => {
          let cardValue = card.number;

          if (card.shape === "star") cardValue *= 2;

          totalScores[player] += cardValue;
        });
      });

      this.remainingCardsCount = totalScores[this.gameManager.player];
      this.gameManager.win = winPlayer;
      if (this.isMultiplayer)
        this.gameManager.socket.emit("userReady", false, this.gameManager.room);

      const maxScorePlayer = Object.keys(totalScores).reduce((prev, curr) => {
        return totalScores[prev] > totalScores[curr] ? prev : curr;
      });

      const filteredPlayers = this.roundTurns.filter(
        (player) => player !== maxScorePlayer
      );
      this.roundTurns = filteredPlayers;
    } else this.roundTurns = this.gameManager.players;

    this.setIsWinner(true);
  }
}
