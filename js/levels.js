/**
 * ============================================================================
 * 2D HORIZONTAL SIDE-SCROLLING SPAWNER & STAGE ARCHITECT (STAGES 1 - 4)
 * ============================================================================
 * Spawns obstacles and collectibles along the right edge of the canvas with
 * varied Y-axis positions and tight bounding boxes, moving steadily right-to-left.
 */

class LevelBuilder {
  static getStageSettings(levelId, width, height) {
    // Player always starts on the left side of the screen
    const startPos = { x: 120, y: height * 0.54 };

    // Base scroll speed & obstacle spawn settings (ramps up over time!)
    const settingsByLevel = {
      1: {
        baseScrollSpeed: 210,      // px per second
        baseObstacleSpeed: 245,    // px per second moving left
        baseSpawnInterval: 1.35,   // seconds between obstacle spawns
        minSpawnInterval: 0.72,
        stageDurationSec: 28       // seconds of scrolling before finish line appears
      },
      2: {
        baseScrollSpeed: 235,
        baseObstacleSpeed: 275,
        baseSpawnInterval: 1.25,
        minSpawnInterval: 0.68,
        stageDurationSec: 30
      },
      3: {
        baseScrollSpeed: 265,
        baseObstacleSpeed: 305,
        baseSpawnInterval: 1.18,
        minSpawnInterval: 0.64,
        stageDurationSec: 32
      },
      4: {
        baseScrollSpeed: 310,      // High-speed Cop Slide momentum!
        baseObstacleSpeed: 345,
        baseSpawnInterval: 1.08,
        minSpawnInterval: 0.58,
        stageDurationSec: 34
      }
    };

    return {
      startPos,
      ...(settingsByLevel[levelId] || settingsByLevel[1])
    };
  }

  /**
   * Spawns a single obstacle along the right edge of the canvas with a varied
   * Y-axis position and a tight bounding box (width & height) for AABB collision.
   */
  static spawnObstacle(levelId, width, height, speedMultiplier = 1.0, lastSpawnY = null) {
    const minY = 148;
    const maxY = height - 54;

    // Pick a varied Y position so the player has to weave Up, Down, Left, and Right
    let y = minY + Math.random() * (maxY - minY);
    if (lastSpawnY !== null && Math.abs(y - lastSpawnY) < 82) {
      y = minY + ((y - minY + 145) % (maxY - minY));
    }

    const spawnX = width + 48;
    const seed = Math.random() * 100;

    if (levelId === 1) {
      // Stage 1: Wobbly Toddlers & Kids skating right-to-left (1.5x size)
      const suitColors = ["#fb923c", "#38bdf8", "#a855f7", "#4ade80", "#f43f5e", "#facc15"];
      const hatColors = ["#f472b6", "#fef08a", "#60a5fa", "#34d399", "#fbbf24", "#c084fc"];
      const idx = Math.floor(Math.random() * suitColors.length);

      return {
        id: `kid_${Date.now()}_${Math.random()}`,
        type: "wobbly_kid",
        x: spawnX,
        y,
        vx: -(235 + Math.random() * 65) * speedMultiplier,
        vy: (Math.random() - 0.5) * 95,
        radius: 24,
        hitboxW: 34,
        hitboxH: 42,
        seed,
        color: suitColors[idx],
        hatColor: hatColors[idx]
      };
    } else if (levelId === 2) {
      // Stage 2: Charging Knights & Mischievous Jesters (1.5x size)
      const isKnight = Math.random() < 0.58;
      return {
        id: `ren_${Date.now()}_${Math.random()}`,
        type: "ren_faire",
        subType: isKnight ? "knight" : "jester",
        x: spawnX,
        y,
        vx: -(isKnight ? 290 : 235) * speedMultiplier,
        vy: isKnight ? 0 : (Math.random() - 0.5) * 110,
        radius: 25,
        hitboxW: 36,
        hitboxH: 45,
        seed
      };
    } else if (levelId === 3) {
      // Stage 3: Slippery Ice Patches & Beginner Skiers (1.5x size)
      const isIce = Math.random() < 0.42;
      return {
        id: `ski_${Date.now()}_${Math.random()}`,
        type: "ski_obstacle",
        subType: isIce ? "ice_patch" : "skier",
        x: spawnX,
        y,
        vx: -(isIce ? 265 : 295) * speedMultiplier,
        vy: isIce ? 0 : Math.sin(seed) * 85,
        radius: isIce ? 22 : 24,
        hitboxW: isIce ? 48 : 34,
        hitboxH: isIce ? 32 : 42,
        color: ["#10b981", "#f97316", "#3b82f6", "#ec4899"][Math.floor(Math.random() * 4)],
        seed
      };
    } else {
      // Stage 4: Witches from Salem & Exploding Sprite Drinks (1.5x size)
      const isWitch = Math.random() < 0.55;
      return {
        id: `bos_${Date.now()}_${Math.random()}`,
        type: "boston_obstacle",
        subType: isWitch ? "witch" : "sprite_can",
        x: spawnX,
        y,
        vx: -(isWitch ? 330 : 285) * speedMultiplier,
        vy: isWitch ? (Math.random() - 0.5) * 115 : (Math.random() - 0.5) * 45,
        radius: 25,
        hitboxW: isWitch ? 42 : 32,
        hitboxH: isWitch ? 40 : 40,
        seed,
        fizzPhase: Math.random() * 0.6,
        popping: false,
        popRadius: 28
      };
    }
  }

  /**
   * Spawns a collectible or golden power-up token along the right edge of the canvas.
   */
  static spawnCollectible(levelId, width, height, scrollSpeed, isPowerToken = false) {
    const minY = 152;
    const maxY = height - 58;
    const y = minY + Math.random() * (maxY - minY);
    const x = width + 30;
    const seed = Math.random() * 10;

    if (isPowerToken) {
      const powerIcons = { 1: "🤝", 2: "🍗", 3: "☕", 4: "🧋" };
      return {
        id: `pwr_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: -scrollSpeed,
        radius: 32,
        hitboxW: 48,
        hitboxH: 48,
        icon: powerIcons[levelId] || "✨",
        points: 200,
        isPowerToken: true,
        collected: false,
        seed
      };
    }

    if (levelId === 1) {
      return {
        id: `col_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: -scrollSpeed,
        radius: 26,
        hitboxW: 40,
        hitboxH: 40,
        icon: "❄️",
        points: 100,
        isPowerToken: false,
        collected: false,
        seed
      };
    } else if (levelId === 2) {
      const isCrown = Math.random() < 0.45;
      return {
        id: `col_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: -scrollSpeed,
        radius: 26,
        hitboxW: 40,
        hitboxH: 40,
        icon: isCrown ? "🌸" : "🎵",
        isCrown,
        points: 125,
        isPowerToken: false,
        collected: false,
        seed
      };
    } else if (levelId === 3) {
      const fonduePool = [
        { icon: "🍓", fondueKey: "strawberry" },
        { icon: "🍌", fondueKey: "banana" },
        { icon: "🍡", fondueKey: "marshmallow" },
        { icon: "🍫", fondueKey: "chocolate" }
      ];
      const pick = fonduePool[Math.floor(Math.random() * fonduePool.length)];
      return {
        id: `col_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: -scrollSpeed,
        radius: 26,
        hitboxW: 40,
        hitboxH: 40,
        icon: pick.icon,
        fondueKey: pick.fondueKey,
        points: 150,
        isPowerToken: false,
        collected: false,
        seed
      };
    } else {
      const icon = Math.random() < 0.5 ? "💛" : "🎈";
      return {
        id: `col_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: -scrollSpeed,
        radius: 26,
        hitboxW: 40,
        hitboxH: 40,
        icon,
        points: 150,
        isPowerToken: false,
        collected: false,
        seed
      };
    }
  }
}

window.LevelBuilder = LevelBuilder;
