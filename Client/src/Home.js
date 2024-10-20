import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import "./GameCanvas.module.css";
import GameManager from "./Game";
import StartOptions from "./StartOptions";
import { handleResize, setupSocketListeners } from "./Functions/gameUtils";

const Home = () => {
  const canvasRef = useRef(null);
  const gameBodyRef = useRef(null);
  const gameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const [gameWidth, setGameWidth] = useState(window.innerWidth);
  const [gameHeight, setGameHeight] = useState(window.innerHeight);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [gameStart, setGameStart] = useState(null);
  const [usersNumer, setUsersNumber] = useState(0);
  const [isMultiplayer, setIsMultiplayer] = useState(null);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    window.addEventListener("resize", () =>
      handleResize(gameRef, canvasRef, setGameWidth, setGameHeight)
    );
    handleResize(gameRef, canvasRef, setGameWidth, setGameHeight);
    return () => {
      window.removeEventListener("resize", () =>
        handleResize(gameRef, canvasRef, setGameWidth, setGameHeight)
      );
    };
  }, []);

  useEffect(() => {
    if (
      ((isMultiplayer && roomName !== "") || !isMultiplayer) &&
      isMultiplayer !== null &&
      (!isMobile || (isMobile && isFullScreen && isLandscape))
    ) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const gameDimensions = { width: gameWidth, height: gameHeight };

      if (!gameRef.current) {
        gameRef.current = new GameManager(
          ctx,
          canvas,
          gameDimensions,
          isMultiplayer,
          roomName,
          setUsersNumber
        );

        const animate = (timestamp) => {
          const deltaTime = timestamp - lastTimeRef.current;
          lastTimeRef.current = timestamp;

          ctx.clearRect(0, 0, gameWidth, gameHeight);
          gameRef.current.animate(deltaTime);

          requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);

        if (isMultiplayer) {
          setupSocketListeners(gameRef.current.socket, setGameStart);
        }

        return () => cancelAnimationFrame(animate);
      }
    }
  }, [
    gameWidth,
    gameHeight,
    isFullScreen,
    isLandscape,
    isMobile,
    isMultiplayer,
    roomName,
  ]);

  useEffect(() => {
    if (!isMultiplayer || !gameStart || !gameRef) return;
    gameRef.current.socket.emit("userReady", gameStart, gameRef.current.room);
  }, [gameStart]);

  return (
    <Container fluid className="p-0" ref={gameBodyRef}>
      <div id="game-body" style={{ position: "relative", height: "100vh" }}>
        <StartOptions
          isMultiplayer={isMultiplayer}
          usersNumer={usersNumer}
          roomName={roomName}
          setRoomName={setRoomName}
          setGameStart={setGameStart}
          isMobile={isMobile}
          isFullScreen={isFullScreen}
          gameRef={gameRef}
          gameBodyRef={gameBodyRef}
          gameStart={gameStart}
          setIsLandscape={setIsLandscape}
          setIsFullScreen={setIsFullScreen}
          setIsMultiplayer={setIsMultiplayer}
        />

        {(isFullScreen || !isMobile || isMultiplayer !== null) && (
          <canvas id="gameScreen" ref={canvasRef} />
        )}
      </div>
    </Container>
  );
};

export default Home;
