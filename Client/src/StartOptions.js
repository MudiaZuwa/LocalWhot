import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { setupFullScreenAndRotate } from "./Functions/gameUtils";

const StartOptions = ({
  isMultiplayer,
  usersNumer,
  roomName,
  setRoomName,
  setGameStart,
  isMobile,
  isFullScreen,
  gameRef,
  gameBodyRef,
  setIsLandscape,
  setIsFullScreen,
  setIsMultiplayer,
  gameStart,
}) => {
  const handleMultiplayerSubmit = (e) => {
    e.preventDefault();
    if (roomName) setIsMultiplayer(true);
  };
  const [isWinner, setIWinner] = useState(false);

  const renderWinAndCardsInfo = () => {
    if (!gameRef.current) return null;
    if (isWinner) {
      return (
        <div>
          <h3>{gameRef.current.win} wins!</h3>
          {isMultiplayer && (
            <p>Remaining cards: {gameRef.current.Cards.remainingCardsCount}</p>
          )}
          <Button
            onClick={() => {
              if (isMultiplayer)
                gameRef.current.socket.emit(
                  "userReady",
                  true,
                  gameRef.current.room
                );
              else gameRef.current.Cards.Restart();
            }}
          >
            {gameRef.current.Cards.roundTurns.length > 2
              ? "Next Round"
              : "New Game"}
          </Button>
        </div>
      );
    } else {
      gameRef.current.Cards.setIWinner = setIWinner;
    }
    return null;
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}
    >
      {renderWinAndCardsInfo()}

      {(!isMobile || (isMobile && isFullScreen)) && !gameStart && (
        <>
          {isMultiplayer ? (
            <>
              <p>Users connected to room: {usersNumer}</p>
              <Button onClick={() => setGameStart(true)}>Ready</Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsMultiplayer(false);
                  setGameStart(true);
                }}
              >
                Play Single Player
              </Button>
              <Form
                onSubmit={handleMultiplayerSubmit}
                style={{ marginTop: "10px" }}
              >
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Enter Room Name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit">Play Multiplayer</Button>
              </Form>
            </>
          )}
        </>
      )}

      {!isFullScreen && isMobile && (
        <Button
          onClick={() =>
            setupFullScreenAndRotate(
              gameBodyRef,
              setIsFullScreen,
              setIsLandscape
            )
          }
          style={{
            marginTop: "20px",
          }}
        >
          Enable Fullscreen & Rotate
        </Button>
      )}
    </div>
  );
};

export default StartOptions;
