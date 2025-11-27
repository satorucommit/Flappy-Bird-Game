export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Bird {
  x: number;
  y: number;
  velocity: number;
  radius: number;
  rotation: number;
}

export interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface GameDimensions {
  width: number;
  height: number;
}
