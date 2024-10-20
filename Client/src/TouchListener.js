import { getNextPlayerTurn } from "./Functions/utils";

export default class TouchListener {
  constructor(gameManager) {
    this.canvas = gameManager.canvas;
    this.gameManager = gameManager;
    this.touchX = 0;
    this.touchY = 0;
    this.cardSelected = null;

    // Touch start event for selecting cards
    this.canvas.addEventListener("touchstart", (e) => {
      const { Cards } = this.gameManager;
      if (Cards) {
        const touch = e.touches[0];
        const clientX = touch.clientX;
        const clientY = touch.clientY;
        this.touchX = clientX;
        this.touchY = clientY;

        if (!Cards.stacks) return;

        Object.keys(Cards.stacks).forEach((stack) => {
          let topmostCard = null;

          Cards.stacks[stack].cards.forEach((card) => {
            if (
              clientX >= card.x &&
              clientX <= card.x + card.width &&
              clientY >= card.y &&
              clientY <= card.y + card.height
            ) {
              topmostCard = card;
            }
          });

          if (topmostCard) {
            topmostCard.selected = true;
            topmostCard.dragOffset = {
              x: clientX - topmostCard.x,
              y: clientY - topmostCard.y,
            };
            this.cardSelected = topmostCard;
          }
        });
      }
    });

    // Touch move event for dragging and handling actions
    this.canvas.addEventListener("touchmove", (e) => {
      if (
        this.gameManager.player !== this.gameManager.playerTurn ||
        !this.cardSelected
      )
        return;

      const { Cards } = this.gameManager;
      const card = this.cardSelected;
      const touch = e.touches[0];
      const clientX = touch.clientX;
      const clientY = touch.clientY;
      const deltaX = clientX - this.touchX;
      const deltaY = clientY - this.touchY;

      const stack = this.getCardStack(card);

      if (stack === "market" && deltaX < 0) {
        Cards.getCards(this.gameManager.playerTurn, 1);
        this.deselectCard();
        const nextTurn = getNextPlayerTurn(
          this.gameManager.playerTurn,
          this.gameManager.Cards.roundTurns
        );
        this.gameManager.playerTurn = nextTurn;

        if (!this.gameManager.isMultiplayer) {
          this.gameManager.player = nextTurn;
        } else {
          this.gameManager.socket.emit(
            "sendStacks",
            Cards.stacks,
            this.gameManager.playerTurn,
            this.gameManager.room
          );
        }
        return;
      } else if (stack === "player2" && deltaY > 0) {
        Cards.playCard(stack, card);
        this.deselectCard();
      } else if (
        (stack === "player1" || this.gameManager.player === stack) &&
        deltaY < 0
      ) {
        Cards.playCard(stack, card);
        this.deselectCard();
      }

      // Update touch position for dragging
      this.touchX = clientX;
      this.touchY = clientY;
    });

    // Touch end event to finalize card action
    this.canvas.addEventListener("touchend", () => {
      if (this.gameManager.Cards && this.cardSelected) {
        const cardStack = this.getCardStack(this.cardSelected);

        // Handle special actions after dragging the card
        if (cardStack !== "market" && cardStack !== "played") {
          this.rearrangeCardsInStack(cardStack);
        }

        // Deselect the card
        this.deselectCard();
      }
    });
  }

  getCardStack(card) {
    return Object.keys(this.gameManager.Cards.stacks).find((stack) =>
      this.gameManager.Cards.stacks[stack].cards.includes(card)
    );
  }

  // Deselect the currently selected card
  deselectCard() {
    if (this.cardSelected) {
      this.cardSelected.selected = false;
      this.cardSelected = null;
    }
  }

  // Rearrange cards in a stack after a move
  rearrangeCardsInStack(cardStack) {
    const stackCards = this.gameManager.Cards.stacks[cardStack].cards;
    const selectedCardIndex = stackCards.findIndex(
      (card) => card === this.cardSelected
    );

    if (selectedCardIndex !== -1) {
      const cardsPerRow = 6;
      const stackNumber = Math.floor(selectedCardIndex / cardsPerRow);
      const newIndex = selectedCardIndex - stackNumber * cardsPerRow;
      const selectedCard = stackCards[selectedCardIndex];

      // Rearrange cards in the stack
      for (let i = selectedCardIndex; i > newIndex; i -= cardsPerRow) {
        stackCards[i] = stackCards[i - cardsPerRow];
      }
      stackCards[newIndex] = selectedCard;
    }
  }
}
