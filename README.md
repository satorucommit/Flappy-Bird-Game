<div align="center">
  <h1>🕊️ Flappy React — The Tiny Bird With Big Dreams</h1>
  <p>Tap, click, or slam the <code>Space</code> bar and watch the chaos unfold. Built with React + TypeScript + Vite.</p>
</div>

---

🎮 What is this?

Flappy React is a cozy, tiny remake of the classic <em>Flappy Bird</em> built with modern tools. The game is intentionally simple — physics, pipes, and the sweet sting of near-misses.

It’s the perfect little playground to tweak physics, practice canvas rendering in React, or just rage at a hard-to-beat high score.

---

✨ Features

- Fast single-file canvas-based gameplay in <code>components/GameCanvas.tsx</code>
- Smooth physics (gravity, jump strength, rotation)
- Procedural pipes and scoring
- LocalStorage-backed high score
- TypeScript + Vite for a fast developer loop

---

🚀 Quick Start

Prerequisites: Node.js (>= 16) and npm (or your package manager of choice)

1. Install dependencies:

```bash
npm install
```

2. Run the app in development mode (fast refresh):

```bash
npm run dev
```

Open your browser to the Vite dev server URL (usually http://localhost:5173) and flap away.

Build for production and preview the build:

```bash
npm run build
npm run preview
```

---

🕹️ How to Play

- Press <code>Space</code>, click the screen, or tap to “flap”.
- Navigate between pipes; each pipe you safely pass gives you +1 score.
- Don’t touch the ground or the pipes — that’s Game Over.
- Your high score is saved to your browser’s localStorage.

---

🛠 Project Structure & Key Files

- <code>App.tsx</code>: Main app & UI overlay (start, score, game over, high score).
- <code>components/GameCanvas.tsx</code>: The canvas game loop, drawing, physics, and input handling.
- <code>constants.ts</code>: Tweak gravity, pipe speed, gap, and more.
- <code>types.ts</code>: Game types and enums (GameState, Bird, Pipe, etc).
- <code>index.tsx</code>: App bootstrap.

Pro tip: Change <code>GRAVITY</code>, <code>JUMP_STRENGTH</code>, or <code>PIPE_GAP</code> in <code>constants.ts</code> for instant chaos.

---

🔧 Dev Tips & Tricks

- Utility-like class names are used for the overlay UI, but the game still uses a canvas for rendering.
- Move the bird spawn with <code>BIRD_X_POSITION</code> in <code>constants.ts</code>.
- Pipes spawn based on <code>PIPE_SPAWN_RATE</code> (frames) in <code>constants.ts</code>.
- Score increments when a pipe’s right-edge passes the bird, with a small forgiveness margin.
- The high score is saved in localStorage under the key <code>flappyHighScore</code>.

---

💡 Want to extend the game?

- Add levels: set different speeds or pipe gaps per level.
- Add power-ups: temporary slow motion, shields, or double points.
- Add audio: flap, score, and fail SFX with the Web Audio API or Howler.js.
- Add physics: increase realism by using a physics engine or more accurate collision detection.

---

⚖️ License & Credits

This project doesn’t currently enforce a license. If you plan to reuse or redistribute it, add an appropriate license (MIT is a popular, permissive choice).

The UI uses the icons from <code>lucide-react</code>. Big thanks to the creators of the libraries that power this tiny bird!

---

🙌 Contributing

Contributions, bug fixes, and ideas are welcome! Fork it, tweak it, and open a PR. Whether you’re tuning the jump strength or adding a rocket pack, I’d love to see what you build.

---

🕊️ Final Note

This little project is meant to be fun, educational, and modifiable. Tweak the values, add new features, and try not to break the bird.

Happy flapping!

