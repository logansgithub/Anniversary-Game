/**
 * ============================================================================
 * PROCEDURAL SPRITE, LANDMARK & ENVIRONMENT RENDERER
 * ============================================================================
 * Renders Jana (small girl with black hair & brown eyes), her partner,
 * level obstacles, collectibles, power-ups, backgrounds, and cutscenes on
 * HTML5 Canvas, with automatic support for custom PNG overrides in /assets/.
 */

class SpriteRenderer {
  constructor(config) {
    this.config = config;
    this.images = {};
    this.preloadExternalImages();
  }

  preloadExternalImages() {
    const sprites = (this.config.assetPaths && this.config.assetPaths.sprites) || {};
    Object.keys(sprites).forEach(key => {
      const img = new Image();
      img.src = sprites[key];
      img.onload = () => {
        this.images[key] = img;
      };
      // Silently fallback to procedural canvas art if external image doesn't exist yet
      img.onerror = () => {};
    });
  }

  /**
   * Draws Jana (small girl with black hair and brown eyes)
   * Includes level-specific outfits, flower crown, and the signature
   * "running/sliding in place" animation when bumping into obstacles!
   */
  drawJana(ctx, x, y, state) {
    const {
      levelId = 1,
      vx = 0,
      vy = 0,
      time = 0,
      slipTimer = 0,
      confuseTimer = 0,
      spinAngle = 0,
      powerUpTimer = 0,
      hasFlowerCrown = false,
      facing = 1
    } = state;

    ctx.save();
    ctx.translate(x, y);

    // Power-up active glowing aura
    if (powerUpTimer > 0) {
      const pulse = 1 + Math.sin(time * 10) * 0.08;
      const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, 48 * pulse);
      if (levelId === 2) {
        grad.addColorStop(0, "rgba(168, 85, 247, 0.45)");
        grad.addColorStop(0.6, "rgba(236, 72, 153, 0.25)");
        grad.addColorStop(1, "rgba(168, 85, 247, 0)");
      } else {
        grad.addColorStop(0, "rgba(244, 114, 182, 0.5)");
        grad.addColorStop(0.6, "rgba(251, 191, 36, 0.28)");
        grad.addColorStop(1, "rgba(244, 114, 182, 0)");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 50 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = levelId === 2 ? "rgba(192, 132, 252, 0.85)" : "rgba(251, 113, 133, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 34 * pulse, time * 3, time * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Spin-out rotation (Level 3 ice patch or slip)
    if (spinAngle !== 0) {
      ctx.rotate(spinAngle);
    } else if (slipTimer > 0) {
      // Wobbly tilt during running-in-place animation
      ctx.rotate(Math.sin(time * 38) * 0.22);
    } else {
      // Gentle lean in movement direction
      ctx.rotate(vx * 0.035);
    }

    const scale = (this.config.player && this.config.player.scale) || 0.92;
    ctx.scale(scale, scale);

    // Shadow under Jana
    ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 22, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Level 3 Skis underneath boots
    if (levelId === 3) {
      ctx.save();
      ctx.fillStyle = "#ec4899";
      ctx.strokeStyle = "#fbcfe8";
      ctx.lineWidth = 1.5;
      // Left & right skis
      this.roundRect(ctx, -12, 14, 28, 4.5, 2);
      ctx.fill();
      ctx.stroke();
      this.roundRect(ctx, -10, 20, 28, 4.5, 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // LEGS & FEET: Check for "running/sliding in place" animation!
    const isRunningInPlace = slipTimer > 0;
    const speed = Math.hypot(vx, vy);
    const legFreq = isRunningInPlace ? 45 : 14;
    const legAmp = isRunningInPlace ? 8.5 : Math.min(5, speed * 1.1);
    const legOffsetLeft = Math.sin(time * legFreq) * legAmp;
    const legOffsetRight = Math.sin(time * legFreq + Math.PI) * legAmp;

    // Motion blur ovals when running/sliding frantically in place
    if (isRunningInPlace) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 19, 16, 6, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Flying comic sweat drops
      ctx.fillStyle = "#38bdf8";
      const dropShift = (time * 20) % 1;
      ctx.beginPath();
      ctx.arc(-18 - dropShift * 6, -16 - dropShift * 4, 3, 0, Math.PI * 2);
      ctx.arc(19 + dropShift * 6, -14 - dropShift * 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boots / Skates
    ctx.fillStyle = levelId === 1 ? "#f8fafc" : "#334155";
    ctx.beginPath();
    ctx.ellipse(-5 + legOffsetLeft * 0.5, 17 + Math.abs(legOffsetLeft) * 0.2, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(5 + legOffsetRight * 0.5, 17 + Math.abs(legOffsetRight) * 0.2, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ice skate blades on Level 1
    if (levelId === 1) {
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-9 + legOffsetLeft * 0.5, 20.5);
      ctx.lineTo(0 + legOffsetLeft * 0.5, 20.5);
      ctx.moveTo(1 + legOffsetRight * 0.5, 20.5);
      ctx.lineTo(10 + legOffsetRight * 0.5, 20.5);
      ctx.stroke();
    }

    // Back Layer of Long Black Hair
    ctx.fillStyle = this.config.player.hairColor || "#18141c";
    ctx.beginPath();
    ctx.ellipse(0, -1, 15.5, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outfit / Torso by Level
    if (levelId === 1) {
      // Cozy rose-berry winter coat
      ctx.fillStyle = "#e11d48";
      this.roundRect(ctx, -11, 1, 22, 15, 6);
      ctx.fill();
      // White fluffy coat trim
      ctx.fillStyle = "#fff1f2";
      this.roundRect(ctx, -11.5, 13, 23, 3.5, 2);
      ctx.fill();
    } else if (levelId === 2) {
      // Renaissance Faire emerald & gold corset dress
      ctx.fillStyle = "#059669";
      ctx.beginPath();
      ctx.moveTo(-9, 1);
      ctx.lineTo(9, 1);
      ctx.lineTo(13, 16);
      ctx.lineTo(-13, 16);
      ctx.closePath();
      ctx.fill();
      // Gold lacing
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-3, 3);
      ctx.lineTo(3, 7);
      ctx.lineTo(-3, 11);
      ctx.lineTo(3, 14);
      ctx.stroke();
    } else if (levelId === 3) {
      // Snowy Alpine Puffer Jacket (Berry & Lavender)
      ctx.fillStyle = "#9333ea";
      this.roundRect(ctx, -11.5, 1, 23, 15, 6);
      ctx.fill();
      ctx.fillStyle = "#f472b6";
      ctx.fillRect(-11, 6, 22, 4);
    } else {
      // Level 4 Boston Chic Coat & Scarf
      ctx.fillStyle = "#be185d";
      this.roundRect(ctx, -11, 1, 22, 15, 6);
      ctx.fill();
      ctx.fillStyle = "#fde047";
      ctx.fillRect(-3, 2, 6, 13);
    }

    // Arms (windmill wildly when slipping in place!)
    const armAngle = isRunningInPlace ? Math.sin(time * 40) * 0.9 : Math.sin(time * 10) * 0.15;
    ctx.save();
    ctx.fillStyle = levelId === 2 ? "#f8fafc" : "#e11d48";
    ctx.translate(-11, 5);
    ctx.rotate(armAngle);
    this.roundRect(ctx, -4, -2, 5, 10, 2.5);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = levelId === 2 ? "#f8fafc" : "#e11d48";
    ctx.translate(11, 5);
    ctx.rotate(-armAngle);
    this.roundRect(ctx, -1, -2, 5, 10, 2.5);
    ctx.fill();
    ctx.restore();

    // Cozy Scarf on winter levels (Level 1 & 3)
    if (levelId === 1 || levelId === 3) {
      ctx.fillStyle = "#fef08a";
      this.roundRect(ctx, -10, -1, 20, 4.5, 2);
      ctx.fill();
      ctx.fillRect(4, 1, 4.5, 9);
    }

    // Head / Face
    ctx.fillStyle = this.config.player.skinTone || "#fad7c0";
    ctx.beginPath();
    ctx.arc(0, -8, 11.5, 0, Math.PI * 2);
    ctx.fill();

    // Black Hair Bangs & Side Framing Locks
    ctx.fillStyle = this.config.player.hairColor || "#18141c";
    ctx.beginPath();
    ctx.arc(0, -10.5, 12.2, Math.PI * 0.92, Math.PI * 2.08);
    ctx.fill();

    // Side locks framing face
    ctx.beginPath();
    ctx.ellipse(-11, -5, 3.5, 8.5, 0.12, 0, Math.PI * 2);
    ctx.ellipse(11, -5, 3.5, 8.5, -0.12, 0, Math.PI * 2);
    ctx.fill();

    // Silky Hair Highlight
    ctx.strokeStyle = this.config.player.hairHighlight || "#3b314a";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -11, 9.5, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Rosy Blush Cheeks
    ctx.fillStyle = "rgba(244, 114, 182, 0.55)";
    ctx.beginPath();
    ctx.ellipse(-6.2, -5.2, 2.6, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(6.2, -5.2, 2.6, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Warm Brown Eyes (with bright anime/pixel sparkle!)
    const lookX = facing >= 0 ? 0.8 : -0.8;
    ctx.fillStyle = this.config.player.eyeColor || "#5c3824";
    ctx.beginPath();
    ctx.ellipse(-4.2 + lookX, -7.8, 2.3, 2.7, 0, 0, Math.PI * 2);
    ctx.ellipse(4.2 + lookX, -7.8, 2.3, 2.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // White eye catchlights
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-4.8 + lookX, -8.7, 0.95, 0, Math.PI * 2);
    ctx.arc(3.6 + lookX, -8.7, 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Expression: Surprised "O" when slipping, happy smile otherwise!
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 1.4;
    if (isRunningInPlace) {
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(0, -3.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, -4.8, 2.8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    // Wearable Flower Crown in Level 2 (or if collected)
    if (levelId === 2 || hasFlowerCrown) {
      const colors = ["#f472b6", "#facc15", "#60a5fa", "#fb7185", "#a78bfa"];
      for (let i = -2; i <= 2; i++) {
        ctx.fillStyle = colors[i + 2];
        ctx.beginPath();
        ctx.arc(i * 4.2, -18.5 + Math.abs(i) * 0.7, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Confusion dizzy stars (when hit by Jester's juggling pin in Level 2)
    if (confuseTimer > 0) {
      for (let i = 0; i < 3; i++) {
        const a = time * 6 + (i * Math.PI * 2) / 3;
        const sx = Math.cos(a) * 14;
        const sy = -24 + Math.sin(a) * 4;
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Draws Partner Character (Skating Hand-in-Hand in Level 1, or Cutscenes)
   */
  drawPartner(ctx, x, y, time = 0, isWarlock = false) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 23, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isWarlock) {
      // Black-Caped Warlock Aura (Level 2 Power-Up!)
      const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 44);
      auraGrad.addColorStop(0, "rgba(168, 85, 247, 0.65)");
      auraGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();

      // Flowing Black Warlock Cape
      ctx.fillStyle = "#110c1d";
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(10, -4);
      ctx.lineTo(18 + Math.sin(time * 8) * 3, 21);
      ctx.lineTo(-18 + Math.cos(time * 8) * 3, 21);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Arcane Staff with glowing crystal orb
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, -18);
      ctx.lineTo(14, 18);
      ctx.stroke();

      ctx.fillStyle = "#c084fc";
      ctx.beginPath();
      ctx.arc(14, -20, 5.5 + Math.sin(time * 12) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Winter Jacket & Jeans
      ctx.fillStyle = "#1e293b";
      this.roundRect(ctx, -7, 13, 6, 8, 2);
      this.roundRect(ctx, 1, 13, 6, 8, 2);
      ctx.fill();

      ctx.fillStyle = this.config.partner.jacketColor || "#2563eb";
      this.roundRect(ctx, -11, 0, 22, 15, 6);
      ctx.fill();

      // Striped winter scarf
      ctx.fillStyle = "#38bdf8";
      this.roundRect(ctx, -10, -2, 20, 4, 2);
      ctx.fill();
    }

    // Head
    ctx.fillStyle = this.config.partner.skinTone || "#f5cdb4";
    ctx.beginPath();
    ctx.arc(0, -10, 11.5, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = this.config.partner.hairColor || "#3b2718";
    ctx.beginPath();
    ctx.arc(0, -13, 12, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();

    // Eyes & warm smile
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(-4, -9.5, 2, 0, Math.PI * 2);
    ctx.arc(4, -9.5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -6.5, 3, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Level 1 Obstacle: Wobbly Toddlers & Kids on ice skates
   */
  drawWobblyKid(ctx, obs, time) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    const wobble = Math.sin(time * 9 + obs.seed) * 0.25;
    ctx.rotate(wobble);

    // Shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 16, 12, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Puffy toddler snowsuit
    ctx.fillStyle = obs.color || "#fb923c";
    this.roundRect(ctx, -9, -1, 18, 13, 6);
    ctx.fill();

    // Outstretched wobbly mitten arms
    ctx.strokeStyle = obs.color || "#fb923c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-9, 3);
    ctx.lineTo(-15, -1 + Math.sin(time * 14 + obs.seed) * 4);
    ctx.moveTo(9, 3);
    ctx.lineTo(15, -1 - Math.sin(time * 14 + obs.seed) * 4);
    ctx.stroke();

    // Head
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(0, -7, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Cute pom-pom beanie hat
    ctx.fillStyle = obs.hatColor || "#38bdf8";
    ctx.beginPath();
    ctx.arc(0, -9, 8.8, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, -18, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(-3, -6.5, 1.5, 0, Math.PI * 2);
    ctx.arc(3, -6.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Level 2 Obstacle: Charging Knight or Mischievous Jester
   */
  drawRenFaireObstacle(ctx, obs, time) {
    ctx.save();
    ctx.translate(obs.x, obs.y);

    if (obs.subType === "juggling_pin") {
      ctx.rotate(time * 12 + obs.seed);
      ctx.fillStyle = "#ef4444";
      this.roundRect(ctx, -4, -11, 8, 22, 4);
      ctx.fill();
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-4, -3, 8, 5);
      ctx.restore();
      return;
    }

    // Shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 20, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (obs.subType === "knight") {
      // Charging Knight in shining steel armor
      const bob = Math.sin(time * 14 + obs.seed) * 2;
      ctx.translate(0, bob);

      // Crimson cape
      ctx.fillStyle = "#dc2626";
      this.roundRect(ctx, -12, -2, 24, 18, 5);
      ctx.fill();

      // Steel Breastplate
      ctx.fillStyle = "#94a3b8";
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, -10, 0, 20, 15, 5);
      ctx.fill();
      ctx.stroke();

      // Visor Helmet
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(0, -9, 10.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Helmet slits
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-6, -10, 12, 3);

      // Red Plume feather
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.ellipse(0, -21, 6, 3.5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Jousting Lance
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(11, 6);
      ctx.lineTo(28, 3);
      ctx.lineTo(11, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Mischievous Jester
      ctx.rotate(Math.sin(time * 8 + obs.seed) * 0.18);
      // Diamond tunic
      ctx.fillStyle = "#7c3aed";
      this.roundRect(ctx, -10, 0, 10, 15, 3);
      ctx.fill();
      ctx.fillStyle = "#facc15";
      this.roundRect(ctx, 0, 0, 10, 15, 3);
      ctx.fill();

      // Face
      ctx.fillStyle = "#fde68a";
      ctx.beginPath();
      ctx.arc(0, -8, 9, 0, Math.PI * 2);
      ctx.fill();

      // Two-horned Jester Hat with bells
      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.moveTo(-9, -12);
      ctx.quadraticCurveTo(-16, -24, -4, -16);
      ctx.fill();

      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.moveTo(9, -12);
      ctx.quadraticCurveTo(16, -24, 4, -16);
      ctx.fill();

      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(-13, -21, 3, 0, Math.PI * 2);
      ctx.arc(13, -21, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Level 3 Obstacle: Icy Patch or Beginner Skier
   */
  drawSkiObstacle(ctx, obs, time) {
    ctx.save();
    ctx.translate(obs.x, obs.y);

    if (obs.subType === "ice_patch") {
      // Shimmering slippery ice patch
      ctx.fillStyle = "rgba(56, 189, 248, 0.38)";
      ctx.strokeStyle = "rgba(186, 230, 253, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, obs.radius * 1.35, obs.radius * 0.85, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glint lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-12, -4);
      ctx.lineTo(6, -9);
      ctx.moveTo(-6, 6);
      ctx.lineTo(14, 1);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Slower Beginner Skier making wide pizza turns
    ctx.rotate(Math.sin(time * 4 + obs.seed) * 0.25);
    // Pizza-wedge skis
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-14, 18);
    ctx.lineTo(-3, -4);
    ctx.moveTo(14, 18);
    ctx.lineTo(3, -4);
    ctx.stroke();

    // Neon ski suit
    ctx.fillStyle = obs.color || "#10b981";
    this.roundRect(ctx, -9, -1, 18, 14, 5);
    ctx.fill();

    // Head & Goggles
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    ctx.arc(0, -8, 8.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f97316";
    this.roundRect(ctx, -7, -11, 14, 5, 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Level 4 Obstacle: Witch from Salem or Exploding Sprite Drink
   */
  drawBostonObstacle(ctx, obs, time) {
    ctx.save();
    ctx.translate(obs.x, obs.y);

    if (obs.subType === "witch") {
      // Witch from Salem flying on a wooden broomstick
      const hover = Math.sin(time * 7 + obs.seed) * 3.5;
      ctx.translate(0, hover);

      // Broomstick
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-22, 10);
      ctx.lineTo(18, 6);
      ctx.stroke();

      // Bristles
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.moveTo(-20, 10);
      ctx.lineTo(-30, 4);
      ctx.lineTo(-29, 16);
      ctx.closePath();
      ctx.fill();

      // Purple/Black Witch Cloak
      ctx.fillStyle = "#3b0764";
      ctx.beginPath();
      ctx.moveTo(-8, -2);
      ctx.lineTo(8, -2);
      ctx.lineTo(13, 14);
      ctx.lineTo(-13, 14);
      ctx.closePath();
      ctx.fill();

      // Green-tinted face
      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.arc(0, -8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Pointed Salem Witch Hat
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.ellipse(0, -13, 14, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8, -13);
      ctx.lineTo(2, -28);
      ctx.lineTo(8, -13);
      ctx.closePath();
      ctx.fill();
    } else {
      // Exploding Sprite Drink Can (Fizzing lemon-lime soda!)
      const shake = obs.fizzPhase > 0.6 ? Math.sin(time * 55) * 3 : 0;
      ctx.translate(shake, 0);

      // Fizz splash ring when popping!
      if (obs.popping) {
        ctx.strokeStyle = "rgba(134, 239, 172, 0.85)";
        ctx.fillStyle = "rgba(74, 222, 128, 0.25)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, obs.popRadius || 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Bright green Sprite can
      ctx.fillStyle = "#16a34a";
      ctx.strokeStyle = "#dcfce7";
      ctx.lineWidth = 1.5;
      this.roundRect(ctx, -10, -14, 20, 28, 4);
      ctx.fill();
      ctx.stroke();

      // Yellow lemon-lime burst logo
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Silver top tab
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.ellipse(0, -14, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising fizz bubbles
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 3; i++) {
        const by = -18 - ((time * 24 + i * 7 + obs.seed) % 14);
        const bx = (i - 1) * 5;
        ctx.beginPath();
        ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Draws Level Collectibles & Special Power-Up Tokens
   */
  drawCollectible(ctx, item, time) {
    ctx.save();
    const bob = Math.sin(time * 5 + item.seed) * 4;
    ctx.translate(item.x, item.y + bob);

    // Soft glow behind item
    const isPowerToken = item.isPowerToken;
    const glowRadius = isPowerToken ? 28 : 20;
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, glowRadius);
    if (isPowerToken) {
      grad.addColorStop(0, "rgba(250, 204, 21, 0.75)");
      grad.addColorStop(1, "rgba(250, 204, 21, 0)");
    } else {
      grad.addColorStop(0, "rgba(255, 255, 255, 0.65)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    if (isPowerToken) {
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 19 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.font = isPowerToken ? "24px sans-serif" : "20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.icon || "❄️", 0, 1);

    if (isPowerToken) {
      ctx.font = "bold 10px 'Nunito', sans-serif";
      ctx.fillStyle = "#fef08a";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.5;
      ctx.strokeText("POWER-UP", 0, 24);
      ctx.fillText("POWER-UP", 0, 24);
    }

    ctx.restore();
  }

  /**
   * Renders the rich themed background and finish-line landmarks for each level
   */
  drawEnvironment(ctx, width, height, levelId, time, state) {
    ctx.save();

    if (levelId === 1) {
      // LEVEL 1: ICE SKATING RINK
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#0f172a");
      skyGrad.addColorStop(0.22, "#1e3a5f");
      skyGrad.addColorStop(0.23, "#dbeafe");
      skyGrad.addColorStop(1, "#eff6ff");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant snowy pine trees & stars above the rink
      ctx.fillStyle = "#fef9c3";
      for (let i = 0; i < 24; i++) {
        const sx = (i * 47) % width;
        const sy = 12 + ((i * 23) % 75);
        const r = 1 + (Math.sin(time * 4 + i) + 1) * 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cozy Hot Cocoa Cabin in the background
      this.drawHotCocoaCabin(ctx, width - 190, 32);

      // Ice Rink surface with subtle sheen arcs
      ctx.fillStyle = "#e0f2fe";
      this.roundRect(ctx, 26, 110, width - 52, height - 136, 28);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(160 + i * 165, 290 + (i % 2) * 60, 65, 0.2, 2.2);
        ctx.stroke();
      }

      // Rink wooden barrier & twinkling fairy lights
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 7;
      this.roundRect(ctx, 26, 110, width - 52, height - 136, 28);
      ctx.stroke();

      const fairyColors = ["#fde047", "#f472b6", "#38bdf8", "#4ade80"];
      for (let x = 45; x < width - 45; x += 36) {
        const c = fairyColors[Math.floor(x / 36) % fairyColors.length];
        const glow = 0.5 + 0.5 * Math.sin(time * 6 + x);
        ctx.fillStyle = c;
        ctx.globalAlpha = 0.55 + glow * 0.45;
        ctx.beginPath();
        ctx.arc(x, 110, 4.2, 0, Math.PI * 2);
        ctx.arc(x, height - 26, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Goal: Hot Cocoa Bench & Chloe's Mom on the far right!
      this.drawHotCocoaBenchGoal(ctx, width - 92, height * 0.54, time, state);

    } else if (levelId === 2) {
      // LEVEL 2: RENAISSANCE FAIRE
      const grassGrad = ctx.createLinearGradient(0, 0, 0, height);
      grassGrad.addColorStop(0, "#fef3c7");
      grassGrad.addColorStop(0.2, "#fde68a");
      grassGrad.addColorStop(0.21, "#15803d");
      grassGrad.addColorStop(1, "#166534");
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, 0, width, height);

      // Golden dirt festival path
      ctx.fillStyle = "#d97706";
      ctx.globalAlpha = 0.32;
      this.roundRect(ctx, 30, 165, width - 60, height - 220, 40);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Medieval Festival Tents & Banners along top
      const tentColors = [
        ["#dc2626", "#fef08a"],
        ["#2563eb", "#f8fafc"],
        ["#9333ea", "#fde047"],
        ["#059669", "#fef9c3"]
      ];
      for (let i = 0; i < 4; i++) {
        const tx = 110 + i * 210;
        const [c1, c2] = tentColors[i];
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(tx - 45, 110);
        ctx.lineTo(tx, 52);
        ctx.lineTo(tx + 45, 110);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(tx - 18, 110);
        ctx.lineTo(tx, 52);
        ctx.lineTo(tx + 18, 110);
        ctx.closePath();
        ctx.fill();

        // Pennant flag
        ctx.fillStyle = c1;
        ctx.fillRect(tx, 34, 18, 10);
      }

      // Wandering Bard strumming lute on the sideline
      ctx.font = "22px sans-serif";
      ctx.fillText("🧝‍♂️🪕", 85, 138);
      ctx.fillText("🎪", 310, 138);
      ctx.fillText("🛡️⚔️", 540, 138);

      // Goal: Royal Court Stage on the far right
      this.drawRoyalCourtGoal(ctx, width - 92, height * 0.54, time);

    } else if (levelId === 3) {
      // LEVEL 3: WINTER GETAWAY — SKI TRIP
      const slopeGrad = ctx.createLinearGradient(0, 0, width, height);
      slopeGrad.addColorStop(0, "#bae6fd");
      slopeGrad.addColorStop(0.2, "#e0f2fe");
      slopeGrad.addColorStop(1, "#f8fafc");
      ctx.fillStyle = slopeGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant Alpine Mountain Peaks
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.moveTo(0, 110);
      ctx.lineTo(140, 28);
      ctx.lineTo(290, 110);
      ctx.lineTo(460, 18);
      ctx.lineTo(650, 110);
      ctx.lineTo(820, 35);
      ctx.lineTo(width, 110);
      ctx.closePath();
      ctx.fill();

      // Overhead Ski Lift Cable & Moving Chairs
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 75);
      ctx.lineTo(width, 45);
      ctx.stroke();

      for (let i = 0; i < 4; i++) {
        const cx = ((i * 250 + time * 45) % (width + 60)) - 30;
        const cy = 75 - (cx / width) * 30;
        ctx.strokeStyle = "#1e293b";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy + 16);
        ctx.stroke();
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(cx - 8, cy + 16, 16, 6);
      }

      // Pine trees lining top & bottom of slope
      for (let x = 50; x < width - 130; x += 110) {
        this.drawPineTree(ctx, x, 122);
        this.drawPineTree(ctx, x + 45, height - 24);
      }

      // Goal: Warm Ski Lodge with Fondue & Reindeer Racing TV!
      this.drawSkiLodgeGoal(ctx, width - 95, height * 0.54, time);

    } else {
      // LEVEL 4: BOSTON PROMENADE (Cop Slide -> Fenway -> Salem -> Freedom Trail -> MFA -> Dinner with Julia)
      const cityGrad = ctx.createLinearGradient(0, 0, 0, height);
      cityGrad.addColorStop(0, "#1e1b4b");
      cityGrad.addColorStop(0.24, "#312e81");
      cityGrad.addColorStop(0.25, "#334155");
      cityGrad.addColorStop(1, "#1e293b");
      ctx.fillStyle = cityGrad;
      ctx.fillRect(0, 0, width, height);

      // Iconic Red-Brick FREEDOM TRAIL winding across the promenade!
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 10;
      ctx.setLineDash([18, 6]);
      ctx.beginPath();
      ctx.moveTo(60, height * 0.55);
      ctx.bezierCurveTo(320, height * 0.35, 580, height * 0.75, width - 90, height * 0.54);
      ctx.stroke();
      ctx.setLineDash([]);

      // Boston Landmarks along the skyline backdrop:
      // 1. Famous Metallic Cop Slide on the left start!
      this.drawCopSlide(ctx, 68, height * 0.52);

      // 2. Fenway Park "Green Monster" Wall
      ctx.fillStyle = "#14532d";
      ctx.strokeStyle = "#dcfce7";
      ctx.lineWidth = 2;
      ctx.fillRect(210, 32, 165, 78);
      ctx.strokeRect(210, 32, 165, 78);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("FENWAY PARK", 292, 54);
      ctx.font = "10px monospace";
      ctx.fillStyle = "#fde047";
      ctx.fillText("BOS  9  |  NY  2", 292, 74);
      ctx.fillText("GREEN MONSTER", 292, 95);

      // 3. Salem Witch House (Dark Timber Gables)
      ctx.fillStyle = "#27272a";
      ctx.beginPath();
      ctx.moveTo(430, 110);
      ctx.lineTo(430, 62);
      ctx.lineTo(465, 28);
      ctx.lineTo(500, 62);
      ctx.lineTo(535, 32);
      ctx.lineTo(570, 62);
      ctx.lineTo(570, 110);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("SALEM 1692", 500, 98);

      // 4. Museum of Fine Arts (MFA Classical Columns)
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(625, 42, 145, 68);
      ctx.fillStyle = "#94a3b8";
      for (let c = 0; c < 4; c++) {
        ctx.fillRect(640 + c * 34, 58, 10, 52);
      }
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 10px serif";
      ctx.fillText("MUSEUM OF FINE ARTS", 697, 53);

      // Goal: Candlelit Dinner Table with her friend Julia!
      this.drawDinnerWithJuliaGoal(ctx, width - 92, height * 0.54, time);
    }

    ctx.restore();
  }

  drawHotCocoaCabin(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#78350f";
    ctx.fillRect(0, 26, 120, 52);
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(-12, 28);
    ctx.lineTo(60, 0);
    ctx.lineTo(132, 28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(20, 42, 26, 22);
    ctx.fillStyle = "#fde047";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HOT COCOA", 60, 22);
    ctx.restore();
  }

  drawHotCocoaBenchGoal(ctx, x, y, time, state) {
    ctx.save();
    ctx.translate(x, y);

    // Goal zone aura
    const pulse = 1 + Math.sin(time * 5) * 0.06;
    ctx.fillStyle = "rgba(251, 191, 36, 0.22)";
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 52 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cozy Wooden Bench
    ctx.fillStyle = "#92400e";
    this.roundRect(ctx, -26, -18, 52, 36, 6);
    ctx.fill();
    ctx.fillStyle = "#b45309";
    this.roundRect(ctx, -22, -12, 44, 24, 4);
    ctx.fill();

    // Two steaming mugs of Hot Cocoa waiting on the bench
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("☕☕", 0, 5);

    // Chloe's Mom standing nearby ready with her camera!
    ctx.save();
    ctx.translate(8, -58);
    ctx.fillStyle = "#a855f7";
    this.roundRect(ctx, -10, 0, 20, 14, 5);
    ctx.fill();
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    ctx.arc(0, -8, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.arc(0, -10, 9, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.font = "16px sans-serif";
    ctx.fillText("📸", 14, 2);

    // Camera Flash burst during cutscene or periodically
    if ((state && state.cameraFlash > 0) || Math.sin(time * 4) > 0.92) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(14, -2, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = "bold 10px 'Nunito', sans-serif";
    ctx.fillStyle = "#fef08a";
    ctx.fillText("Chloe's Mom", 0, -24);
    ctx.restore();

    ctx.font = "bold 11px 'Nunito', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("HOT COCOA BENCH", 0, 36);
    ctx.restore();
  }

  drawRoyalCourtGoal(ctx, x, y, time) {
    ctx.save();
    ctx.translate(x, y);

    const pulse = 1 + Math.sin(time * 5) * 0.06;
    ctx.fillStyle = "rgba(250, 204, 21, 0.28)";
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 54 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Royal Red Carpet & Throne Stage
    ctx.fillStyle = "#991b1b";
    this.roundRect(ctx, -32, -32, 64, 64, 10);
    ctx.fill();
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-28, -28, 56, 56);

    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("👑", 0, -2);
    ctx.font = "bold 10px 'Nunito', sans-serif";
    ctx.fillStyle = "#fef08a";
    ctx.fillText("ROYAL COURT", 0, 20);
    ctx.restore();
  }

  drawSkiLodgeGoal(ctx, x, y, time) {
    ctx.save();
    ctx.translate(x, y);

    const pulse = 1 + Math.sin(time * 5) * 0.06;
    ctx.fillStyle = "rgba(249, 115, 22, 0.25)";
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 56 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Warm Timber Ski Lodge
    ctx.fillStyle = "#7c2d12";
    this.roundRect(ctx, -34, -30, 68, 60, 8);
    ctx.fill();

    // Snow roof
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(-40, -26);
    ctx.lineTo(0, -50);
    ctx.lineTo(40, -26);
    ctx.closePath();
    ctx.fill();

    // TV inside showing Reindeer Racing + Fondue Pot!
    ctx.fillStyle = "#0ea5e9";
    ctx.fillRect(-24, -18, 48, 22);
    const deerOffset = (time * 18) % 26;
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🦌🦌", -8 + deerOffset * 0.5, -3);

    ctx.font = "18px sans-serif";
    ctx.fillText("🫕🍓", 0, 20);

    ctx.font = "bold 10px 'Nunito', sans-serif";
    ctx.fillStyle = "#7c2d12";
    ctx.fillText("SKI LODGE FONDUE", 0, 44);
    ctx.restore();
  }

  drawCopSlide(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    // Iconic shiny metallic Boston Cop Slide at the start of Level 4
    const grad = ctx.createLinearGradient(-40, -60, 30, 40);
    grad.addColorStop(0, "#e2e8f0");
    grad.addColorStop(0.5, "#94a3b8");
    grad.addColorStop(1, "#cbd5e1");
    ctx.fillStyle = grad;
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-45, -55);
    ctx.quadraticCurveTo(-10, 0, 35, 20);
    ctx.lineTo(35, 42);
    ctx.quadraticCurveTo(-15, 25, -45, -30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fde047";
    ctx.font = "bold 10px 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("COP SLIDE", -8, -62);
    ctx.restore();
  }

  drawDinnerWithJuliaGoal(ctx, x, y, time) {
    ctx.save();
    ctx.translate(x, y);

    const pulse = 1 + Math.sin(time * 5) * 0.06;
    ctx.fillStyle = "rgba(244, 114, 182, 0.28)";
    ctx.strokeStyle = "#f472b6";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 56 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cozy Bistro Table with white tablecloth & candle
    ctx.fillStyle = "#fff1f2";
    ctx.beginPath();
    ctx.arc(0, 4, 26, 0, Math.PI * 2);
    ctx.fill();

    // Friend Julia waving happily at the dinner table!
    ctx.fillStyle = "#ec4899";
    this.roundRect(ctx, -10, -28, 20, 14, 5);
    ctx.fill();
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    ctx.arc(0, -36, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#92400e";
    ctx.beginPath();
    ctx.arc(0, -38, 9, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🕯️🍝🥂", 0, 10);

    ctx.font = "bold 11px 'Nunito', sans-serif";
    ctx.fillStyle = "#fef08a";
    ctx.fillText("DINNER W/ JULIA", 0, 44);
    ctx.restore();
  }

  drawPineTree(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#065f46";
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.lineTo(14, 0);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#047857";
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(11, -14);
    ctx.lineTo(-11, -14);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Renders a charming illustrated Polaroid photo onto a <canvas>
   * for Level 1 ("Chloe's mom snaps several photos of us") if a real photo
   * file hasn't been placed in assets/photos/ yet.
   */
  renderPolaroidIllustration(canvas, sceneType = "rink_hug", time = 1) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (sceneType === "rink_hug") {
      grad.addColorStop(0, "#1e3a8a");
      grad.addColorStop(0.55, "#3b82f6");
      grad.addColorStop(0.56, "#dbeafe");
      grad.addColorStop(1, "#eff6ff");
    } else if (sceneType === "cocoa_bench") {
      grad.addColorStop(0, "#451a03");
      grad.addColorStop(0.6, "#78350f");
      grad.addColorStop(1, "#fef3c7");
    } else {
      grad.addColorStop(0, "#311042");
      grad.addColorStop(0.55, "#701a75");
      grad.addColorStop(1, "#fce7f3");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Twinkling bokeh lights in background
    const colors = ["#fde047", "#f472b6", "#38bdf8", "#ffffff"];
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc((i * 37) % w, 16 + ((i * 19) % (h * 0.48)), 4 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw Partner & Jana side-by-side smiling for Chloe's Mom's camera!
    ctx.save();
    ctx.translate(w * 0.42, h * 0.68);
    ctx.scale(1.45, 1.45);
    this.drawPartner(ctx, 0, 0, time, false);
    ctx.restore();

    ctx.save();
    ctx.translate(w * 0.59, h * 0.70);
    ctx.scale(1.45, 1.45);
    this.drawJana(ctx, 0, 0, {
      levelId: 1,
      time,
      hasFlowerCrown: false,
      facing: -1
    });
    ctx.restore();

    // Floating heart & cocoa icons
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("💖", w * 0.5, h * 0.34);
    if (sceneType === "cocoa_bench") {
      ctx.fillText("☕", w * 0.35, h * 0.78);
      ctx.fillText("☕", w * 0.66, h * 0.78);
    }
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

window.SpriteRenderer = SpriteRenderer;
