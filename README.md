# Career Catcher

A small arcade game about climbing the career ladder. Catch the good moves (mentors, referrals, raises), dodge the red flags (unpaid internships, "we're like a family", surprise layoffs), and grab power-ups on the way from **Still in college** to **Dream job**.

**Play it:** [career-catcher.vercel.app](https://career-catcher.vercel.app)

## How to play

- Move the mouse over the game (or drag a finger on mobile, or use ← →) to steer.
- Green cards add points. Red cards cost points and a life.
- Let a green card fall past you and you also lose a life. Three lives in total.
- Bonuses: 🛡️ shield blocks one hit, 🐢 slows everything down, 🧲 pulls good cards toward you, 💎 doubles points.
- Reach 150 points to land the dream job.

## How it's built

- **React 19 + Vite**, plain JavaScript.
- Game loop on **HTML Canvas** with `requestAnimationFrame`. Game state lives in refs so the loop runs without re-rendering React on every frame; only the score and level are pushed to React state for the header.
- Collision detection, a lane check that keeps falling cards from overlapping, particles and floating score text are all hand-written, no game engine.
- Difficulty ramps up over time: fall speed increases and cards spawn more often.
- Mouse, touch and keyboard input, with coordinates scaled so the canvas works at any width.
- Typography scale defined as tokens with a 12px minimum for readability.

## Run it locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build
```

The production files go to `dist/`.

## Author

Daria Saproshyna, UX/UI & Product Designer · [LinkedIn](https://linkedin.com/in/daria-saproshyna-219515257)
