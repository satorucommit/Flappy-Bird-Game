
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Bird, Pipe, GameDimensions } from '../types';
import {
  GRAVITY,
  JUMP_STRENGTH,
  PIPE_SPEED,
  PIPE_WIDTH,
  PIPE_GAP,
  PIPE_SPAWN_RATE,
  BIRD_X_POSITION,
  BIRD_RADIUS,
  COLORS,
  GROUND_HEIGHT
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  score: number;
  highScore: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  setScore,
  score,
  highScore
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  
  // Game State Refs (mutable for performance in loop)
  const birdRef = useRef<Bird>({
    x: BIRD_X_POSITION,
    y: 0,
    velocity: 0,
    radius: BIRD_RADIUS,
    rotation: 0
  });
  const pipesRef = useRef<Pipe[]>([]);
  const dimensionsRef = useRef<GameDimensions>({ width: 0, height: 0 });
  const groundOffsetRef = useRef<number>(0);

  // Initialize game entities
  const resetGame = useCallback(() => {
    if (!canvasRef.current) return;
    const height = canvasRef.current.height;
    
    birdRef.current = {
      x: BIRD_X_POSITION,
      y: height / 2,
      velocity: 0,
      radius: BIRD_RADIUS,
      rotation: 0
    };
    pipesRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
  }, [setScore]);

  // Handle User Input (Flap)
  const flap = useCallback(() => {
    if (gameState === GameState.START) {
      setGameState(GameState.PLAYING);
      // First flap
      birdRef.current.velocity = JUMP_STRENGTH;
    } else if (gameState === GameState.PLAYING) {
      birdRef.current.velocity = JUMP_STRENGTH;
    } else if (gameState === GameState.GAME_OVER) {
      // Handled by UI overlay usually, but as a fallback
    }
  }, [gameState, setGameState]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        flap();
      }
    };

    const handleTouchOrClick = (e: Event) => {
      // Prevent default to stop double firing on some touch devices if they emit mouse events too
      // e.preventDefault(); 
      flap();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Bind to canvas for click/touch to avoid UI interference, or window if we want full screen tap
    window.addEventListener('mousedown', handleTouchOrClick);
    window.addEventListener('touchstart', handleTouchOrClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleTouchOrClick);
      window.removeEventListener('touchstart', handleTouchOrClick);
    };
  }, [flap]);

  // Main Game Loop
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // --- UPDATE ---

    if (gameState === GameState.PLAYING) {
      // Bird Physics
      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;
      
      // Calculate rotation based on velocity
      // Clamp rotation between -25 degrees and +90 degrees
      birdRef.current.rotation = Math.min(
        Math.PI / 2,
        Math.max(-Math.PI / 6, (birdRef.current.velocity * 0.1))
      );

      // Ground Collision
      if (birdRef.current.y + birdRef.current.radius >= height - GROUND_HEIGHT) {
        setGameState(GameState.GAME_OVER);
      }

      // Ceiling Collision (Optional, prevents flying over pipes)
      if (birdRef.current.y - birdRef.current.radius <= 0) {
         birdRef.current.y = birdRef.current.radius;
         birdRef.current.velocity = 0;
      }

      // Pipes Logic
      frameCountRef.current++;
      
      // Spawn Pipe
      if (frameCountRef.current % PIPE_SPAWN_RATE === 0) {
        const minPipeHeight = 50;
        const maxPipeHeight = height - GROUND_HEIGHT - PIPE_GAP - minPipeHeight;
        const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
        
        pipesRef.current.push({
          x: width,
          topHeight: randomHeight,
          passed: false
        });
      }

      // Move & Remove Pipes
      pipesRef.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
      });

      // Filter out off-screen pipes
      if (pipesRef.current.length > 0 && pipesRef.current[0].x + PIPE_WIDTH < 0) {
        pipesRef.current.shift();
      }

      // Pipe Collision & Score
      pipesRef.current.forEach(pipe => {
        // Collision Detection - AABB (Axis-Aligned Bounding Box) mostly, circle vs rect check simplified
        const birdLeft = birdRef.current.x - birdRef.current.radius + 4; // Padding for forgiveness
        const birdRight = birdRef.current.x + birdRef.current.radius - 4;
        const birdTop = birdRef.current.y - birdRef.current.radius + 4;
        const birdBottom = birdRef.current.y + birdRef.current.radius - 4;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        const topPipeBottom = pipe.topHeight;
        const bottomPipeTop = pipe.topHeight + PIPE_GAP;

        // Check if bird is within pipe horizontal area
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          // Check vertical collision (hit top pipe OR hit bottom pipe)
          if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
            setGameState(GameState.GAME_OVER);
          }
        }

        // Score Update
        if (!pipe.passed && birdLeft > pipeRight) {
          pipe.passed = true;
          setScore(score + 1); // This uses the prop updater, better might be a ref if state lag issues, but here update loop is fast enough
        }
      });
      
      // Moving Ground
      groundOffsetRef.current = (groundOffsetRef.current + PIPE_SPEED) % 20;

    } else if (gameState === GameState.START) {
       // Floating effect
       const time = Date.now() / 300;
       birdRef.current.y = (height / 2) + Math.sin(time) * 10;
       birdRef.current.rotation = 0;
       groundOffsetRef.current = (groundOffsetRef.current + PIPE_SPEED) % 20;
    }

    // --- DRAW ---

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    // Draw Background (Sky)
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, width, height);

    // Draw Clouds (Simple decor)
    ctx.fillStyle = COLORS.cloud;
    // Static clouds for now
    ctx.beginPath();
    ctx.arc(100, 100, 30, 0, Math.PI * 2);
    ctx.arc(140, 100, 40, 0, Math.PI * 2);
    ctx.arc(180, 100, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width - 100, 150, 40, 0, Math.PI * 2);
    ctx.arc(width - 60, 160, 30, 0, Math.PI * 2);
    ctx.fill();

    // Draw Pipes
    pipesRef.current.forEach(pipe => {
      // Top Pipe
      ctx.fillStyle = COLORS.pipe;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.strokeStyle = COLORS.pipeBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x, -2, PIPE_WIDTH, pipe.topHeight + 2); // -2 to hide top border
      
      // Top Pipe Cap
      ctx.fillStyle = COLORS.pipe;
      ctx.fillRect(pipe.x - 2, pipe.topHeight - 20, PIPE_WIDTH + 4, 20);
      ctx.strokeRect(pipe.x - 2, pipe.topHeight - 20, PIPE_WIDTH + 4, 20);


      // Bottom Pipe
      const bottomPipeY = pipe.topHeight + PIPE_GAP;
      const bottomPipeHeight = height - GROUND_HEIGHT - bottomPipeY;
      ctx.fillStyle = COLORS.pipe;
      ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, bottomPipeHeight);
      ctx.strokeStyle = COLORS.pipeBorder;
      ctx.strokeRect(pipe.x, bottomPipeY, PIPE_WIDTH, bottomPipeHeight + 2);

      // Bottom Pipe Cap
      ctx.fillStyle = COLORS.pipe;
      ctx.fillRect(pipe.x - 2, bottomPipeY, PIPE_WIDTH + 4, 20);
      ctx.strokeRect(pipe.x - 2, bottomPipeY, PIPE_WIDTH + 4, 20);
    });

    // Draw Ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, height - GROUND_HEIGHT, width, GROUND_HEIGHT);
    // Ground moving pattern
    ctx.strokeStyle = COLORS.groundBorder;
    ctx.beginPath();
    for(let i = -20; i < width + 20; i+= 20) {
      const x = i - groundOffsetRef.current;
      ctx.moveTo(x, height - GROUND_HEIGHT);
      ctx.lineTo(x + 10, height);
    }
    ctx.stroke();

    // Draw Border on top of ground
    ctx.beginPath();
    ctx.moveTo(0, height - GROUND_HEIGHT);
    ctx.lineTo(width, height - GROUND_HEIGHT);
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Bird
    ctx.save();
    ctx.translate(birdRef.current.x, birdRef.current.y);
    ctx.rotate(birdRef.current.rotation);
    
    const r = birdRef.current.radius;

    // Tail
    ctx.fillStyle = COLORS.bird;
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, 0);
    ctx.lineTo(-r * 1.3, -r * 0.4);
    ctx.lineTo(-r * 1.3, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.fillStyle = COLORS.bird;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.birdBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wing
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, r * 0.1, r * 0.5, r * 0.35, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Beak
    ctx.fillStyle = COLORS.birdBeak;
    ctx.beginPath();
    // Lower part
    ctx.moveTo(r * 0.5, r * 0.1);
    ctx.lineTo(r * 1.2, r * 0.1);
    ctx.lineTo(r * 0.5, r * 0.35);
    ctx.fill();
    ctx.stroke();
    // Upper part
    ctx.beginPath();
    ctx.moveTo(r * 0.5, r * 0.1);
    ctx.lineTo(r * 1.2, r * 0.1);
    ctx.lineTo(r * 0.5, -r * 0.2);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.4, -r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.35, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, score, setScore, setGameState]);

  // Initial Setup & Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Set dimensions to window size
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        dimensionsRef.current = {
          width: window.innerWidth,
          height: window.innerHeight
        };
        // Reset bird Y to center if just starting
        if (gameState === GameState.START) {
          birdRef.current.y = window.innerHeight / 2;
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameState]);

  // Start/Stop Loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  // Reset Trigger
  useEffect(() => {
    if (gameState === GameState.START) {
      resetGame();
    }
  }, [gameState, resetGame]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full cursor-pointer touch-manipulation"
    />
  );
};

export default GameCanvas;
