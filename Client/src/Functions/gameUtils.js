// Utility function to handle full screen and orientation
export const setupFullScreenAndRotate = async (
  gameBodyRef,
  setIsFullScreen,
  setIsLandscape
) => {
  const gameBody = gameBodyRef.current;
  try {
    if (gameBody.requestFullscreen) {
      await gameBody.requestFullscreen();
    } else if (gameBody.mozRequestFullScreen) {
      await gameBody.mozRequestFullScreen();
    } else if (gameBody.webkitRequestFullscreen) {
      await gameBody.webkitRequestFullscreen();
    } else if (gameBody.msRequestFullscreen) {
      await gameBody.msRequestFullscreen();
    }

    if (window.screen && window.screen.orientation.lock) {
      await window.screen.orientation.lock("landscape");
    }

    setIsFullScreen(true);
    setIsLandscape(true);
  } catch (err) {
    console.error("Error enabling fullscreen or locking orientation:", err);
  }
};

export const handleResize = (
  gameRef,
  canvasRef,
  setGameWidth,
  setGameHeight
) => {
  setGameWidth(window.innerWidth);
  setGameHeight(window.innerHeight);
  if (gameRef.current) {
    gameRef.current.gameDimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }
  if (canvasRef.current) {
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
  }
};

export const setupSocketListeners = (socket, setGameStart) => {
  socket.on("userReady", (userData) => {
    setGameStart(userData.gameStart);
  });
};
