# 💖 Our Journey Together — Anniversary Mini Web Game

A custom 4-level physics-based interactive web game built with **HTML5 Canvas**, **Matter.js physics**, and a **Web Audio API Chiptune Synthesizer**.

## 🌟 Features & Level Overview

- **Main Character**: **Jana** (portrayed as a small girl with black hair and brown eyes, complete with level-themed outfits, a wearable flower crown in Level 2, and a comic running/sliding-in-place animation when bumping into obstacles).
- **Dual Input Controls**: Smooth inertia-based movement using **WASD** or **Arrow Keys**, plus **Spacebar** to activate 5-second level power-ups once 2 collectibles are gathered (or by touching golden Power-Up tokens directly).
- **4 Playable Story Levels**:
  1. **Level 1: The First Date — Ice Skating Rink**
     - Low-friction ice skating physics, zigzagging wobbly toddlers & kids, floating Snowflake Tokens, and the **Hand-in-Hand Power-Up** (snaps your partner alongside Jana with a heart shield that gently pushes kids aside).
     - **Level Goal**: Reach the **Hot Cocoa Bench**, triggering **Chloe's Mom** to appear and snap photos of you two, followed by a Polaroid photo showcase!
  2. **Level 2: The Outdoor Adventure — Renaissance Faire**
     - Charging knights in armor and mischievous jesters tossing control-confusing juggling pins.
     - Collect **Bard Song Favors** and wearable **Flower Crowns**.
     - **Power-Up**: **Giant Turkey Leg / Royal Mead** summons a **Warlock in a Black Cape** whose arcane spell banishes all obstacles!
     - **Level Goal**: Reach the **Royal Court Stage** to receive the King's blessing.
  3. **Level 3: The Winter Getaway — Ski Trip**
     - Slalom down snowy mountain slopes past spin-out **Icy Patches** and wide-turning **Beginner Skiers**.
     - Collect **Strawberries, Bananas, Marshmallows, and Chocolate** for fondue, and grab a **Hot Cocoa Boost** to glide effortlessly over ice.
     - **Level Goal**: Cross into the warm **Ski Lodge** to make chocolate fondue while **reindeers race on the TV** in the background!
  4. **Level 4: The Grand Celebration — Boston Promenade**
     - Launch down the famous **Boston Cop Slide** at high speed with continuous forward momentum past **Fenway Park**, **Salem Witch Houses**, the **Freedom Trail**, and the **Museum of Fine Arts**.
     - Dodge **Witches from Salem** and **Exploding Sprite Drinks** fueled by **Tatte Lattes** and collecting **Gold Love Hearts & Anniversary Balloons**.
     - **Level Goal**: Reach **Dinner with her friend Julia** to unlock the **Grand Anniversary Message & Interactive Gift Reveal**!

## 🛠️ How to Customize Personal Details & Photos

Open [`js/config.js`](js/config.js) to easily edit:
- Couple names & character appearance colors (`player` and `partner`).
- Real photos from your first date (`level1Photos` — drop `.jpg`/`.png` files into [`assets/photos/`](assets/photos/)).
- The final love letter & **Anniversary Gift Reveal** (`finale.giftReveal`).

## 🚀 Running Locally

Simply open [`index.html`](index.html) in any modern desktop web browser (Chrome, Edge, Safari, Firefox), or serve the folder with any static server:

```bash
npx serve .
```
