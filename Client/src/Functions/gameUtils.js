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
  gameBodyRef,
  setGameWidth,
  setGameHeight,
  isMobile
) => {
  let width = gameBodyRef.current.clientWidth;
  let height = gameBodyRef.current.clientHeight;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const cardWidth = (height - 40) / 5;
  if (width < cardWidth * 7 + 40 && !isMobile)
    height = ((width - 40) / 7) * 5 + 40;

  setGameWidth(width);
  setGameHeight(height);
  if (gameRef.current) {
    gameRef.current.gameDimensions = {
      width: !isMobile ? width : height,
      height: !isMobile ? height : width,
    };
  }
  if (canvasRef.current) {
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    if (isMobile) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.rotate(Math.PI / 2);
      if (gameRef.current) gameRef.current.isLandScape = true;
    } else {
      ctx.restore();
      if (gameRef.current) gameRef.current.isLandScape = false;
    }
  }
};

export const setupSocketListeners = (socket, setGameStart) => {
  socket.on("userReady", (userData) => {
    setGameStart(userData.gameStart);
  });
};
