import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState } from './types';
import { Trophy, Play, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem('flappyHighScore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Save High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyHighScore', score.toString());
    }
  }, [score, highScore]);

  const handleRestart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setGameState(GameState.START);
    setScore(0);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      
      {/* Game Layer */}
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        score={score}
        setScore={setScore}
        highScore={highScore}
      />

      {/* UI Overlay: Score (Always Visible while playing/start) */}
      {gameState !== GameState.GAME_OVER && (
        <div className="absolute top-10 left-0 w-full flex justify-center pointer-events-none">
          <div className="text-6xl text-white font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] pixel-font stroke-text">
            {score}
          </div>
        </div>
      )}

      {/* UI Overlay: Start Screen */}
      {gameState === GameState.START && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 pointer-events-none">
          <div className="bg-white/90 p-8 rounded-2xl shadow-xl backdrop-blur-sm text-center transform transition-all animate-bounce-slow">
            <h1 className="text-4xl md:text-6xl font-black text-sky-500 mb-4 tracking-wider" style={{ fontFamily: 'Fredoka' }}>
              FLAPPY REACT
            </h1>
            <p className="text-gray-600 text-lg mb-6 flex items-center justify-center gap-2">
              Tap, Click, or Press Space to Flap
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-full font-bold shadow-lg">
              <Play size={24} fill="currentColor" />
              <span>Get Ready!</span>
            </div>
          </div>
        </div>
      )}

      {/* UI Overlay: Game Over Screen */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center border-4 border-sky-200 transform scale-100 transition-transform">
            <h2 className="text-4xl font-black text-slate-800 mb-2">GAME OVER</h2>
            
            <div className="flex justify-center my-6">
              <div className="bg-sky-100 rounded-xl p-6 w-full relative overflow-hidden">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-sky-600 text-sm font-bold uppercase tracking-widest">Score</span>
                    <div className="text-5xl font-black text-slate-800">{score}</div>
                  </div>
                  
                  <div className="w-full h-px bg-sky-200"></div>
                  
                  <div className="flex items-center justify-center gap-3">
                    <Trophy className="text-yellow-500" size={32} fill="currentColor" />
                    <div className="text-left">
                      <span className="text-sky-600 text-xs font-bold uppercase block">Best</span>
                      <span className="text-2xl font-bold text-slate-800">{highScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handleRestart}
              className="w-full group relative flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-white text-xl font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
            >
              <RotateCcw className="group-hover:rotate-180 transition-transform duration-500" />
              PLAY AGAIN
            </button>
            
            <p className="mt-4 text-slate-400 text-sm">Press Space to Restart</p>
          </div>
        </div>
      )}
      
      {/* High Score Overlay (during game) */}
      {gameState !== GameState.GAME_OVER && (
          <div className="absolute top-4 right-4 pointer-events-none opacity-80">
             <div className="flex items-center gap-2 bg-black/20 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                <Trophy size={16} className="text-yellow-300" />
                <span className="font-bold">{highScore}</span>
             </div>
          </div>
      )}
    </div>
  );
};

export default App;
