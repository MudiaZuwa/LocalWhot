export const setupMultiplayerListeners = (
  gameManager,
  Restart,
  updateStacks,
  roundTurns
) => {
  gameManager.socket.on("recieveUserReady", (playersReady) => {
    if (roundTurns.length === 0 || !roundTurns)
      roundTurns = gameManager.players;
    const allReady = roundTurns.every((player) => playersReady[player]);
    console.log(roundTurns, playersReady);
    console.log(allReady);
    if (allReady && gameManager.players.length > 1) Restart();
  });

  gameManager.socket.on("recieveStacks", (stacks, playerTurn) => {
    updateStacks(stacks, playerTurn);
  });
};
