import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Game.css';

const Game = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dinoPosition, setDinoPosition] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [isJumping, setIsJumping] = useState(false);

  const gameLoopRef = useRef(null);

  // Use dimensions that match your CSS:
  const dinoWidth = 30;
  const dinoHeight = 30;
  const dinoLeft = 50;
  const dinoRight = dinoLeft + dinoWidth;

  // Jump function with smoother up & down movement.
  const jump = useCallback(() => {
    if (!isJumping) {
      setIsJumping(true);
      let height = 0;
      // Jump up
      const jumpUp = setInterval(() => {
        height += 6;
        setDinoPosition(height);
        if (height >= 120) {
          clearInterval(jumpUp);
          // Fall down
          const fallDown = setInterval(() => {
            height -= 6;
            setDinoPosition(height);
            if (height <= 0) {
              clearInterval(fallDown);
              setDinoPosition(0);
              setIsJumping(false);
            }
          }, 20);
        }
      }, 20);
    }
  }, [isJumping]);

  // Handle key down events to start the game and trigger jumps
  const handleKeyDown = useCallback((e) => {
    if ((e.code === 'Space' || e.key === 'ArrowUp') && !gameOver) {
      if (!gameStarted) {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setObstacles([]);
      }
      jump();
    }
  }, [gameStarted, gameOver, jump]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!gameStarted) return;

    gameLoopRef.current = setInterval(() => {
      // Update score continuously.
      setScore(prev => prev + 1);

      // Move obstacles and check for collision.
      setObstacles(prev => {
        // Update obstacle positions.
        const updated = prev
          .map(obs => ({ ...obs, position: obs.position - 8 }))
          .filter(obs => obs.position > -40); // Remove off-screen obstacles.

        // Define dino vertical position based on dinoPosition.
        // In this system, dinoPosition equals the distance (in px) from the bottom.
        const dinoBottom = dinoPosition;
        const dinoTop = dinoPosition + dinoHeight;

        // Dimensions for the cactus.
        const cactusWidth = 20;
        const cactusHeight = 30;
        const cactusBottom = 0;
        const cactusTop = cactusBottom + cactusHeight;

        // Check collision with each cactus.
        for (const obs of updated) {
          const cactusLeft = obs.position;
          const cactusRight = obs.position + cactusWidth;

          const isCollision =
            dinoRight > cactusLeft && // Dino's right edge is past cactus's left
            dinoLeft < cactusRight && // Dino's left edge is before cactus's right
            dinoTop > cactusBottom && // Dino's top is above cactus's bottom
            dinoBottom < cactusTop;   // Dino's bottom is below cactus's top

          if (isCollision) {
            // Stop game loop and mark game over.
            clearInterval(gameLoopRef.current);
            setGameOver(true);
            setGameStarted(false);
            setHighScore(prevScore => Math.max(prevScore, score));
            return []; // Remove remaining obstacles.
          }
        }
        return updated;
      });

      // Randomly create new obstacles (cacti).
      if (Math.random() < 0.01) {
        setObstacles(prev => [
          ...prev,
          { id: Date.now(), position: window.innerWidth }
        ]);
      }
    }, 40);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, dinoPosition, score, dinoRight, dinoLeft, dinoHeight]);

  return (
    <div className={`game-container ${gameStarted ? 'running' : ''}`}>
      <div className="score">Score: {score}</div>
      <div className="high-score">High Score: {highScore}</div>

      <div className="ground">
        <div
          className={`dino ${isJumping ? 'jumping' : ''}`}
          style={{ bottom: `${dinoPosition}px` }}
        />

        {obstacles.map(obstacle => (
          <div
            key={obstacle.id}
            className="cactus"
            style={{ left: `${obstacle.position}px` }}
          />
        ))}
      </div>

      {!gameStarted && (
        <div className="start-screen">
          {gameOver ? 'Game Over! ' : ''}
          Press Space or Up Arrow to {gameOver ? 'Restart' : 'Start'}
        </div>
      )}
    </div>
  );
};

export default Game;
