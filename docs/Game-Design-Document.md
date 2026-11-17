# **Anniversary Mini Web Game: Game Design Document**

## **A 4-Level Physics-Based Interactive Journey**

### **Character Profile Note: The main player character is Jana, portrayed as a small girl with black hair and brown eyes.**

# **Executive Overview**

This Game Design Document outlines the technical architecture, level design, and visual asset requirements for a custom romantic web game built for your anniversary. Powered by Google Antigravity physics (Matter.js canvas engine), the game features a top-down/isometric 2D perspective with smooth movement mechanics and interactive environmental objects.

| Category | Specification Details |
| :---- | :---- |
| **Game Title** | *Our Journey Together* (Working Title) |
| **Target Engine** | Google Antigravity / HTML5 Canvas (Matter.js) |
| **Control Scheme** | Dual Input: WASD Keys or Arrow Keys |
| **Target Platforms** | Desktop Browsers (Chrome, Safari, Firefox) |
| **Target Playtime** | 5–8 Minutes Total |
| **Victory Condition** | Complete all 4 levels to unlock a custom anniversary message & gift reveal |

# **Core Mechanics & Input Architecture**

## **1. Player Movement & Physics Dynamics**

* **Dual Control Mapping:**  
  * **Up / W:** Move Forward / Upward acceleration  
  * **Down / S:** Reverse / Downward acceleration  
  * **Left / A:** Steer / Slide Left  
  * **Right / D:** Steer / Slide Right  
* **Ice/Surface Friction:** Configured using low linear friction values to give character movement a natural inertia and momentum.  
* **Collision Detection:** Circle-to-circle and box-to-polygon hitboxes for smooth interaction with obstacles and collectible power-ups.

## **2. Universal Power-Up Lifecycle**

* **Activation Action:** Pressing the Spacebar once enough level-specific collectibles (2) have been gathered.  
* **Active State Indicator:** Visual glowing aura around the player sprite, floating hearts particle emitter, and a dynamic HUD countdown timer (e.g., 5 seconds).  
* **Expiration Behavior:** Soft fade-out of the aura and return to normal collision/speed rules.

---

# **Detailed Level Architecture**

## **Level 1: The First Date — Ice Skating Rink**

* **Theme & Atmosphere:** A winter wonderland rink surrounded by twinkling fairy lights, snow drifts, and a cozy hot cocoa cabin in the background.  
* **Objective:** Navigate across the crowded ice rink to reach the Hot Cocoa Bench.

| Element | Description & Gameplay Role |
| :---- | :---- |
| **Obstacles** | **Wobbly Toddlers & Kids:** Small sprites skating unpredictably across the ice in zigzag patterns. Bumping into them causes a brief slide back and loss of momentum. The character sprite should do a running/sliding in place animation when this happens. |
| **Power-Up** | **Hand-in-Hand Holding:** Touching the partner token snaps your partner sprite alongside you. While holding hands, an invincibility shield activates—gently pushing kids aside without losing speed or health. |
| **Collectibles** | Floating Snowflake Tokens (+100 pts each). |
| **Level Goal** | Reach the Hot Cocoa Bench at the far right of the rink. Chloe’s mom appears and snaps several photos of us. The game then displays a few real photos of us from this time period. |

---

## **Level 2: The Outdoor Adventure — Renaissance Faire**

* **Theme & Atmosphere:** A vibrant medieval festival filled with colorful banners, jousting arenas, wandering bards, and artisan market stalls.  
* **Objective:** Navigate through the bustling festival grounds to gain an audience with the Royal Court.

| Element | Description & Gameplay Role |
| :---- | :---- |
| **Obstacles** | **Charging Knights & Mischievous Jesters:** Knights in armor charging through choke-points and jesters tossing juggling pins that temporarily confuse controls. |
| **Power-Up** | **Giant Turkey Leg / Royal Mead:** Grants a 5-second **Knightly Valor Boost** that summons a warlock in a black cape who uses a magic spell to remove all obstacles. |
| **Collectibles** | Bard Song Favor Tokens & Flower Crowns. |
| **Level Goal** | Reach the Royal Court Stage at the far end of the festival to receive the King’s blessing. |

## **Level 3: The Winter Getaway — Ski Trip**

* **Theme & Atmosphere:** A snowy mountain slope surrounded by pine trees, ski lifts, and scenic mountain peaks under a crisp winter sky.  
* **Objective:** Slalom down the snowy slopes and reach the warm Ski Lodge at the bottom of the mountain.

| Element | Description & Gameplay Role |
| :---- | :---- |
| **Obstacles** | **Icy Patches & Slower Skiers:** Slippery ice patches that cause spin-outs and beginner skiers making unpredictable wide turns across the slope.  |
| **Power-Up** | **Hot Cocoa Boost:** A steaming mug of hot cocoa providing a speed burst and warming shield to glide over ice patches effortlessly. |
| **Collectibles** | Strawberries, bananas, marshmallows, and chocolate for fondue |
| **Level Goal** | Cross the finish line into the Ski Lodge to combine all the fondue ingredients and make fondue. Reindeers are racing on the TV in the background. |

---

## **Level 4: The Grand Celebration — Boston Promenade**

* **Theme & Atmosphere:** A Boston-inspired journey featuring backgrounds of Fenway Park, Salem witch houses, the Freedom Trail, and an art museum.  
* **Core Mechanic:** The level begins with sliding down the famous Cop Slide at high speed, continuing with continuous sliding momentum until the end line. 

| Element | Description & Gameplay Role |
| :---- | :---- |
| **Obstacles** | Witches from Salem and exploding Sprite drinks |
| **Power-Up** | Tatte lattes to fuel your run |
| **Collectibles** | Gold Love Hearts & Anniversary Balloons. |
| **Level Goal** | Reach dinner with her friend Julia. |
