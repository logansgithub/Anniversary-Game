/**
 * ============================================================================
 * LEVEL ARCHITECT & ENTITY SPAWNER (LEVELS 1 - 4)
 * ============================================================================
 * Creates level-specific obstacles, collectibles, power-up tokens, and goal
 * zones matching the Game Design Document specifications.
 */

class LevelBuilder {
  static build(levelId, width, height) {
    const obstacles = [];
    const collectibles = [];
    const startPos = { x: 82, y: height * 0.54 };
    const goalZone = { x: width - 92, y: height * 0.54, radius: 52 };

    if (levelId === 1) {
      // ======================================================================
      // LEVEL 1: THE FIRST DATE — ICE SKATING RINK
      // ======================================================================
      const suitColors = ["#fb923c", "#38bdf8", "#a855f7", "#4ade80", "#f43f5e", "#facc15"];
      const hatColors = ["#f472b6", "#fef08a", "#60a5fa", "#34d399", "#fbbf24", "#c084fc"];

      // Wobbly Toddlers & Kids skating in unpredictable zigzag patterns
      const kidColumns = [220, 330, 445, 560, 675, 775];
      kidColumns.forEach((colX, idx) => {
        obstacles.push({
          id: `kid_${idx}`,
          type: "wobbly_kid",
          x: colX,
          y: 165 + ((idx * 95) % (height - 250)),
          vx: (idx % 2 === 0 ? 1 : -1) * (1.1 + (idx % 3) * 0.35),
          vy: (idx % 2 === 0 ? 1.85 : -1.85),
          radius: 17,
          seed: idx * 1.7,
          zigzagTimer: 0,
          color: suitColors[idx % suitColors.length],
          hatColor: hatColors[idx % hatColors.length]
        });
      });

      // Floating Snowflake Tokens (+100 pts each, 2 charges = Spacebar Power-Up)
      const snowflakeSpots = [
        { x: 185, y: 210 },
        { x: 285, y: 410 },
        { x: 395, y: 195 },
        { x: 505, y: 430 },
        { x: 615, y: 230 },
        { x: 730, y: 390 },
        { x: 810, y: 265 }
      ];
      snowflakeSpots.forEach((pos, i) => {
        collectibles.push({
          id: `snow_${i}`,
          x: pos.x,
          y: pos.y,
          radius: 16,
          icon: "❄️",
          label: "+100 Snowflake",
          points: 100,
          isPowerToken: false,
          collected: false,
          seed: i * 1.1
        });
      });

      // Direct Partner Hand-in-Hand Token on the ice
      collectibles.push({
        id: "partner_token_1",
        x: 350,
        y: height * 0.52,
        radius: 21,
        icon: "🤝",
        label: "Hand-in-Hand!",
        points: 200,
        isPowerToken: true,
        collected: false,
        seed: 9.9
      });
      collectibles.push({
        id: "partner_token_2",
        x: 635,
        y: height * 0.56,
        radius: 21,
        icon: "🤝",
        label: "Hand-in-Hand!",
        points: 200,
        isPowerToken: true,
        collected: false,
        seed: 4.4
      });

    } else if (levelId === 2) {
      // ======================================================================
      // LEVEL 2: THE OUTDOOR ADVENTURE — RENAISSANCE FAIRE
      // ======================================================================
      // Charging Knights in choke-points & Mischievous Jesters tossing juggling pins
      const fairePositions = [
        { x: 235, y: 220, subType: "knight", vx: 0, vy: 2.7 },
        { x: 365, y: 380, subType: "jester", vx: 0.9, vy: -1.6 },
        { x: 495, y: 210, subType: "knight", vx: 0, vy: 3.0 },
        { x: 625, y: 390, subType: "jester", vx: -0.9, vy: 1.7 },
        { x: 755, y: 260, subType: "knight", vx: 0, vy: -2.8 }
      ];
      fairePositions.forEach((p, idx) => {
        obstacles.push({
          id: `ren_${idx}`,
          type: "ren_faire",
          subType: p.subType,
          x: p.x,
          y: p.y,
          vx: p.vx,
          vy: p.vy,
          radius: 18,
          seed: idx * 2.1,
          pinCooldown: 1.5 + idx * 0.6
        });
      });

      // Bard Song Favor Tokens & Flower Crowns
      const faireCollectibles = [
        { x: 185, y: 360, icon: "🌸", label: "Flower Crown!", isCrown: true },
        { x: 295, y: 200, icon: "🪕", label: "Bard Lute Favor" },
        { x: 430, y: 420, icon: "🎵", label: "Bard Song Favor" },
        { x: 555, y: 195, icon: "🌸", label: "Flower Crown!", isCrown: true },
        { x: 690, y: 400, icon: "🎵", label: "Bard Song Favor" },
        { x: 805, y: 235, icon: "🪕", label: "Royal Ballad" }
      ];
      faireCollectibles.forEach((c, i) => {
        collectibles.push({
          id: `faire_col_${i}`,
          x: c.x,
          y: c.y,
          radius: 16,
          icon: c.icon,
          label: c.label,
          isCrown: !!c.isCrown,
          points: 125,
          isPowerToken: false,
          collected: false,
          seed: i * 1.4
        });
      });

      // Giant Turkey Leg & Royal Mead Power-Up Tokens (Summons the Black-Caped Warlock!)
      collectibles.push({
        id: "turkey_leg_token",
        x: 330,
        y: 300,
        radius: 21,
        icon: "🍗",
        label: "Warlock Spell!",
        points: 200,
        isPowerToken: true,
        collected: false,
        seed: 2.5
      });
      collectibles.push({
        id: "royal_mead_token",
        x: 615,
        y: 290,
        radius: 21,
        icon: "🍺",
        label: "Royal Mead Valor!",
        points: 200,
        isPowerToken: true,
        collected: false,
        seed: 6.2
      });

    } else if (levelId === 3) {
      // ======================================================================
      // LEVEL 3: THE WINTER GETAWAY — SKI TRIP
      // ======================================================================
      // Slippery Icy Patches (cause spin-outs)
      const icePatches = [
        { x: 250, y: 290, r: 28 },
        { x: 440, y: 215, r: 30 },
        { x: 530, y: 410, r: 28 },
        { x: 705, y: 315, r: 32 }
      ];
      icePatches.forEach((ip, idx) => {
        obstacles.push({
          id: `ice_${idx}`,
          type: "ski_obstacle",
          subType: "ice_patch",
          x: ip.x,
          y: ip.y,
          vx: 0,
          vy: 0,
          radius: ip.r,
          seed: idx
        });
      });

      // Slower Beginner Skiers carving wide unpredictable turns across the slope
      const skiers = [
        { x: 310, y: 190, color: "#10b981" },
        { x: 480, y: 340, color: "#f97316" },
        { x: 630, y: 220, color: "#3b82f6" },
        { x: 775, y: 395, color: "#ec4899" }
      ];
      skiers.forEach((sk, idx) => {
        obstacles.push({
          id: `skier_${idx}`,
          type: "ski_obstacle",
          subType: "skier",
          x: sk.x,
          y: sk.y,
          vx: -0.6,
          vy: (idx % 2 === 0 ? 1 : -1) * 2.1,
          radius: 17,
          color: sk.color,
          seed: idx * 1.9
        });
      });

      // Collectibles: Strawberries, Bananas, Marshmallows, and Chocolate for Fondue!
      const fondueItems = [
        { x: 195, y: 200, icon: "🍓", label: "Fresh Strawberry", fondueKey: "strawberry" },
        { x: 350, y: 415, icon: "🍌", label: "Sliced Banana", fondueKey: "banana" },
        { x: 500, y: 185, icon: "🍡", label: "Fluffy Marshmallow", fondueKey: "marshmallow" },
        { x: 660, y: 420, icon: "🍫", label: "Swiss Chocolate", fondueKey: "chocolate" },
        { x: 760, y: 215, icon: "🍓", label: "Sweet Strawberry", fondueKey: "strawberry" },
        { x: 825, y: 355, icon: "🍫", label: "Fondue Chocolate", fondueKey: "chocolate" }
      ];
      fondueItems.forEach((f, i) => {
        collectibles.push({
          id: `fondue_${i}`,
          x: f.x,
          y: f.y,
          radius: 16,
          icon: f.icon,
          label: f.label,
          fondueKey: f.fondueKey,
          points: 150,
          isPowerToken: false,
          collected: false,
          seed: i * 1.2
        });
      });

      // Hot Cocoa Boost Mugs
      collectibles.push({
        id: "cocoa_mug_1",
        x: 295,
        y: 310,
        radius: 21,
        icon: "☕",
        label: "Hot Cocoa Boost!",
        points: 200,
        isPowerToken: true,
        collected: false,
        seed: 3.1
      });
      collectibles.push({
        id: "cocoa_mug_2",
        x: 595,
        y: 300,
        radius: 21,
        icon: "☕",
        label: "Hot Cocoa Boost!",
        points: 200,
        isPowerToken: true,
        collected: false,
        seed: 7.4
      });

    } else {
      // ======================================================================
      // LEVEL 4: THE GRAND CELEBRATION — BOSTON PROMENADE
      // ======================================================================
      // Witches from Salem & Exploding Sprite Drinks
      const bostonObs = [
        { x: 255, y: 225, subType: "witch", vx: -1.1, vy: 2.3 },
        { x: 365, y: 375, subType: "sprite_can", vx: 0, vy: 1.2 },
        { x: 485, y: 240, subType: "witch", vx: 1.0, vy: -2.5 },
        { x: 605, y: 335, subType: "sprite_can", vx: 0, vy: -1.3 },
        { x: 725, y: 215, subType: "witch", vx: -1.2, vy: 2.4 },
        { x: 790, y: 395, subType: "sprite_can", vx: 0, vy: 1.1 }
      ];
      bostonObs.forEach((bo, idx) => {
        obstacles.push({
          id: `bos_${idx}`,
          type: "boston_obstacle",
          subType: bo.subType,
          x: bo.x,
          y: bo.y,
          vx: bo.vx,
          vy: bo.vy,
          radius: bo.subType === "sprite_can" ? 17 : 18,
          seed: idx * 1.6,
          fizzPhase: (idx * 0.3) % 1,
          popping: false,
          popRadius: 20
        });
      });

      // Gold Love Hearts & Anniversary Balloons
      const bostonCollectibles = [
        { x: 195, y: 365, icon: "💛", label: "Gold Love Heart" },
        { x: 315, y: 195, icon: "🎈", label: "Anniversary Balloon" },
        { x: 435, y: 420, icon: "💛", label: "Gold Love Heart" },
        { x: 550, y: 195, icon: "🎈", label: "Anniversary Balloon" },
        { x: 675, y: 415, icon: "💛", label: "Gold Love Heart" },
        { x: 810, y: 255, icon: "🎈", label: "Celebration Balloon" }
      ];
      bostonCollectibles.forEach((bc, i) => {
        collectibles.push({
          id: `bos_col_${i}`,
          x: bc.x,
          y: bc.y,
          radius: 16,
          icon: bc.icon,
          label: bc.label,
          points: 150,
          isPowerToken: false,
          collected: false,
          seed: i * 1.5
        });
      });

      // Tatte Lattes to fuel the high-speed Cop Slide run!
      collectibles.push({
        id: "tatte_latte_1",
        x: 295,
        y: 295,
        radius: 21,
        icon: "🧋",
        label: "Tatte Latte Fuel!",
        points: 250,
        isPowerToken: true,
        collected: false,
        seed: 1.8
      });
      collectibles.push({
        id: "tatte_latte_2",
        x: 625,
        y: 285,
        radius: 21,
        icon: "🧋",
        label: "Tatte Latte Fuel!",
        points: 250,
        isPowerToken: true,
        collected: false,
        seed: 5.5
      });
    }

    return {
      obstacles,
      collectibles,
      startPos,
      goalZone
    };
  }
}

window.LevelBuilder = LevelBuilder;
