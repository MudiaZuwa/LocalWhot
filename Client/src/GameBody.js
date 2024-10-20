export default class GameBody {
  constructor(GameManager) {
    this.GameManager = GameManager;
    this.ctx = GameManager.ctx;
    this.background = new Image();
    this.background.src = "/Resources/TableBackground.jpeg";
  }

  animate() {
    const gameDimensions = this.GameManager.gameDimensions;

    //Aninimate Background/ |Bottom Frame
    this.ctx.fillStyle = "#eee";
    this.ctx.fillRect(0, 0, gameDimensions.width, gameDimensions.height);
    this.ctx.drawImage(
      this.background,
      0,
      0,
      gameDimensions.width,
      gameDimensions.height
    );
  }
}
