import GameBody from "./GameBody";
import MouseListener from "./MouseListener";
import Cards from "./Cards";
import TouchListener from "./TouchListener";
import { io } from "socket.io-client";

export default class GameManager {
  constructor(
    ctx,
    gameCanvas,
    gameDimensions,
    isMultiplayer,
    roomName,
    setUsersNumber
  ) {
    this.ctx = ctx;
    this.canvas = gameCanvas;
    this.gameDimensions = gameDimensions;
    this.players = [];
    this.playerTurn = "player1";
    this.player = "player1";
    this.room = null;
    this.mode = null;
    this.socket = null;
    this.isMultiplayer = isMultiplayer;
    this.win = null;

    if (isMultiplayer && this.player === "player1") {
      this.room = roomName;

      const socketUrl =
        process.env.REACT_APP_SOCKET_URL || "http://localhost:8080";

      this.socket = io(socketUrl);
      this.socket.on("connect", () => {
        this.player = this.socket.id;
      });
      this.socket.emit("join-room", this.room);

      this.socket.on("update-room-users", (players) => {
        if (!this.win) {
          this.players = players;
          this.Cards.roundTurns = players;
          setUsersNumber(this.players.length);
          this.playerTurn = this.players[0];
        }
      });
    } else {
      this.players = ["player1", "player2"];
    }

    this.GameBody = new GameBody(this);
    this.Cards = new Cards(this);
    this.touchListener = new TouchListener(this);
    this.mouseListener = new MouseListener(this);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.gameDimensions, this.gameDimensions);
    this.GameBody.animate();
    if (this.Cards.stacks) this.Cards.animate();
  }
}
