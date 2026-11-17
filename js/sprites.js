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
    this.bgTiles = {};
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
   * Draws Jana (small girl with black hair and brown eyes) at ~2x size with
   * rich layered hair, detailed eyes, level-specific outfits, and animations.
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
      facing = 1,
      customScale = null
    } = state;

    ctx.save();
    ctx.translate(x, y);

    const scale = customScale !== null
      ? customScale
      : ((this.config.player && this.config.player.scale) || 1.85);

    // Power-up active glowing aura (scaled to fit 2x sprite)
    if (powerUpTimer > 0) {
      const pulse = 1 + Math.sin(time * 10) * 0.08;
      const auraR = 44 * scale * pulse;
      const grad = ctx.createRadialGradient(0, 0, 12, 0, 0, auraR);
      if (levelId === 2) {
        grad.addColorStop(0, "rgba(168, 85, 247, 0.5)");
        grad.addColorStop(0.6, "rgba(236, 72, 153, 0.28)");
        grad.addColorStop(1, "rgba(168, 85, 247, 0)");
      } else {
        grad.addColorStop(0, "rgba(244, 114, 182, 0.52)");
        grad.addColorStop(0.6, "rgba(251, 191, 36, 0.3)");
        grad.addColorStop(1, "rgba(244, 114, 182, 0)");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, auraR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = levelId === 2 ? "rgba(192, 132, 252, 0.9)" : "rgba(251, 113, 133, 0.9)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, 31 * scale * pulse, time * 3, time * 3 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Spin-out or wobbly slip rotation
    if (spinAngle !== 0) {
      ctx.rotate(spinAngle);
    } else if (slipTimer > 0) {
      ctx.rotate(Math.sin(time * 38) * 0.22);
    } else {
      ctx.rotate(vx * 0.025);
    }

    ctx.scale(scale, scale);

    // Soft ground shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 23, 16, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stage 3 Twin Carving Skis & Poles underneath boots
    if (levelId === 3) {
      ctx.save();
      ctx.fillStyle = "#ec4899";
      ctx.strokeStyle = "#fdf2f8";
      ctx.lineWidth = 1.4;
      // Left & right skis with upturned tips
      this.roundRect(ctx, -14, 15, 32, 4.5, 2.2);
      ctx.fill();
      ctx.stroke();
      this.roundRect(ctx, -12, 20.5, 32, 4.5, 2.2);
      ctx.fill();
      ctx.stroke();
      // Ski bindings
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-3, 15.5, 6, 3.5);
      ctx.fillRect(-1, 21, 6, 3.5);
      ctx.restore();
    }

    // LEGS, TIGHTS & BOOTS/SKATES
    const isRunningInPlace = slipTimer > 0;
    const speed = Math.hypot(vx, vy);
    const legFreq = isRunningInPlace ? 45 : 14;
    const legAmp = isRunningInPlace ? 8.5 : Math.min(4.5, speed * 0.9 + 1.2);
    const legOffsetLeft = Math.sin(time * legFreq) * legAmp;
    const legOffsetRight = Math.sin(time * legFreq + Math.PI) * legAmp;

    if (isRunningInPlace) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 19, 16, 6, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Comic sweat drops
      ctx.fillStyle = "#38bdf8";
      const dropShift = (time * 20) % 1;
      ctx.beginPath();
      ctx.arc(-19 - dropShift * 6, -16 - dropShift * 4, 2.8, 0, Math.PI * 2);
      ctx.arc(20 + dropShift * 6, -14 - dropShift * 4, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Leggings / Tights
    ctx.fillStyle = "#1e293b";
    this.roundRect(ctx, -6.5 + legOffsetLeft * 0.35, 11, 4.2, 7, 2);
    this.roundRect(ctx, 2.3 + legOffsetRight * 0.35, 11, 4.2, 7, 2);
    ctx.fill();

    // Detailed Boots / Ice Skates
    const lx = -5 + legOffsetLeft * 0.45;
    const ly = 17.5 + Math.abs(legOffsetLeft) * 0.18;
    const rx = 5 + legOffsetRight * 0.45;
    const ry = 17.5 + Math.abs(legOffsetRight) * 0.18;

    ctx.fillStyle = levelId === 1 ? "#ffffff" : "#334155";
    ctx.strokeStyle = levelId === 1 ? "#cbd5e1" : "#0f172a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 5.2, 3.6, 0, 0, Math.PI * 2);
    ctx.ellipse(rx, ry, 5.2, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Skate blades & laces on Stage 1
    if (levelId === 1) {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx - 4.5, ly + 3.6);
      ctx.lineTo(lx + 5.5, ly + 3.6);
      ctx.moveTo(rx - 4.5, ry + 3.6);
      ctx.lineTo(rx + 5.5, ry + 3.6);
      ctx.stroke();
    }

    // Back Layer of Long Flowing Black Hair (with sculpted wave tips)
    ctx.fillStyle = this.config.player.hairColor || "#18141c";
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 17.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Flowing lower hair locks behind shoulders
    ctx.beginPath();
    ctx.ellipse(-11, 8, 5, 9, 0.2, 0, Math.PI * 2);
    ctx.ellipse(11, 8, 5, 9, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // DETAILED OUTFITS BY STAGE
    if (levelId === 1) {
      // Stage 1: Quilted Rose-Berry Winter Puffer Coat with Fur Trim & Gold Buttons
      const coatGrad = ctx.createLinearGradient(-11, 0, 11, 16);
      coatGrad.addColorStop(0, "#f43f5e");
      coatGrad.addColorStop(1, "#be123c");
      ctx.fillStyle = coatGrad;
      this.roundRect(ctx, -11.5, 0.5, 23, 15, 6);
      ctx.fill();

      // Quilted stitching lines
      ctx.strokeStyle = "rgba(136, 19, 55, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10, 5.5);
      ctx.lineTo(10, 5.5);
      ctx.moveTo(-10.5, 10);
      ctx.lineTo(10.5, 10);
      ctx.stroke();

      // Double gold buttons
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(-2.2, 4, 1.2, 0, Math.PI * 2);
      ctx.arc(2.2, 4, 1.2, 0, Math.PI * 2);
      ctx.arc(-2.2, 8, 1.2, 0, Math.PI * 2);
      ctx.arc(2.2, 8, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy cream faux-fur hem trim
      ctx.fillStyle = "#fff1f2";
      this.roundRect(ctx, -12, 12.8, 24, 3.8, 2);
      ctx.fill();
    } else if (levelId === 2) {
      // Stage 2: Velvet Emerald & Gold Renaissance Bodice Dress
      const dressGrad = ctx.createLinearGradient(0, 0, 0, 17);
      dressGrad.addColorStop(0, "#10b981");
      dressGrad.addColorStop(1, "#047857");
      ctx.fillStyle = dressGrad;
      ctx.beginPath();
      ctx.moveTo(-9.5, 1);
      ctx.lineTo(9.5, 1);
      ctx.lineTo(14, 16.5);
      ctx.lineTo(-14, 16.5);
      ctx.closePath();
      ctx.fill();

      // Cream chemise neckline & gold skirt border
      ctx.fillStyle = "#fefce8";
      this.roundRect(ctx, -6, 0.5, 12, 3, 1.5);
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(-13.5, 14.5, 27, 2);

      // Gold crisis-cross corset lacing
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-3.2, 3.5);
      ctx.lineTo(3.2, 6.8);
      ctx.moveTo(3.2, 3.5);
      ctx.lineTo(-3.2, 6.8);
      ctx.moveTo(-3.2, 7.2);
      ctx.lineTo(3.2, 10.5);
      ctx.moveTo(3.2, 7.2);
      ctx.lineTo(-3.2, 10.5);
      ctx.stroke();
    } else if (levelId === 3) {
      // Stage 3: Two-Tone Alpine Ski Parka with Chevron Stripe & Zipper
      ctx.fillStyle = "#7e22ce";
      this.roundRect(ctx, -12, 0.5, 24, 15.5, 6);
      ctx.fill();

      // Pink & cyan retro ski chevron
      ctx.fillStyle = "#f472b6";
      ctx.beginPath();
      ctx.moveTo(-11.5, 5);
      ctx.lineTo(0, 8.5);
      ctx.lineTo(11.5, 5);
      ctx.lineTo(11.5, 9);
      ctx.lineTo(0, 12.5);
      ctx.lineTo(-11.5, 9);
      ctx.closePath();
      ctx.fill();

      // Center zipper line
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.lineTo(0, 15.5);
      ctx.stroke();
    } else {
      // Stage 4: Boston Tailored Cranberry Wool Coat & Crossbody Bag
      ctx.fillStyle = "#be185d";
      this.roundRect(ctx, -11.5, 0.5, 23, 15.5, 6);
      ctx.fill();

      // Warm golden scarf & lapels
      ctx.fillStyle = "#fde047";
      this.roundRect(ctx, -3.5, 1.5, 7, 13.5, 2);
      ctx.fill();

      // Crossbody handbag strap
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-8, 2);
      ctx.lineTo(8, 14);
      ctx.stroke();
    }

    // Sleeves & Mittens/Hands
    const armAngle = isRunningInPlace ? Math.sin(time * 40) * 0.9 : Math.sin(time * 10) * 0.16;
    ctx.save();
    ctx.fillStyle = levelId === 2 ? "#fefce8" : (levelId === 3 ? "#7e22ce" : "#e11d48");
    ctx.translate(-11.5, 4.5);
    ctx.rotate(armAngle);
    this.roundRect(ctx, -4, -1.5, 5.2, 9.5, 2.5);
    ctx.fill();
    // Mitten / Hand
    ctx.fillStyle = (levelId === 1 || levelId === 3) ? "#facc15" : (this.config.player.skinTone || "#fad7c0");
    ctx.beginPath();
    ctx.arc(-1.4, 8.2, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = levelId === 2 ? "#fefce8" : (levelId === 3 ? "#7e22ce" : "#e11d48");
    ctx.translate(11.5, 4.5);
    ctx.rotate(-armAngle);
    this.roundRect(ctx, -1.2, -1.5, 5.2, 9.5, 2.5);
    ctx.fill();
    ctx.fillStyle = (levelId === 1 || levelId === 3) ? "#facc15" : (this.config.player.skinTone || "#fad7c0");
    ctx.beginPath();
    ctx.arc(1.4, 8.2, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Knitted Fringed Winter Scarf on Stages 1 & 3
    if (levelId === 1 || levelId === 3) {
      ctx.fillStyle = "#fef08a";
      this.roundRect(ctx, -10.5, -1.2, 21, 4.5, 2.2);
      ctx.fill();
      // Red scarf stripes
      ctx.fillStyle = "#fb7185";
      ctx.fillRect(-6, -1, 2, 4.2);
      ctx.fillRect(2, -1, 2, 4.2);
      // Hanging scarf tail
      ctx.fillStyle = "#fef08a";
      this.roundRect(ctx, 4.2, 1.2, 4.8, 9.5, 1.8);
      ctx.fill();
      ctx.fillStyle = "#fb7185";
      ctx.fillRect(4.2, 7.5, 4.8, 1.6);
    }

    // Head & Delicate Chin Contour
    ctx.fillStyle = this.config.player.skinTone || "#fad7c0";
    ctx.beginPath();
    ctx.arc(0, -8.2, 11.8, 0, Math.PI * 2);
    ctx.fill();

    // Layered Black Hair Bangs & Framing Side Locks
    ctx.fillStyle = this.config.player.hairColor || "#18141c";
    ctx.beginPath();
    ctx.arc(0, -10.8, 12.6, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Sculpted front bangs
    ctx.beginPath();
    ctx.moveTo(-11, -11);
    ctx.quadraticCurveTo(-6, -6.5, -2, -10.5);
    ctx.quadraticCurveTo(2, -6.2, 6, -10.5);
    ctx.quadraticCurveTo(9, -7, 11.5, -11);
    ctx.lineTo(11.5, -16);
    ctx.lineTo(-11, -16);
    ctx.closePath();
    ctx.fill();

    // Framing side locks with tapered tips
    ctx.beginPath();
    ctx.ellipse(-11.4, -4.5, 3.8, 9.5, 0.1, 0, Math.PI * 2);
    ctx.ellipse(11.4, -4.5, 3.8, 9.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Multi-tone silky hair shine highlights
    ctx.strokeStyle = this.config.player.hairHighlight || "#3d334c";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, -11.5, 9.8, Math.PI * 1.12, Math.PI * 1.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -11.5, 9.8, Math.PI * 1.58, Math.PI * 1.88);
    ctx.stroke();

    // Cute hair clip on left bang
    ctx.fillStyle = "#fb7185";
    this.roundRect(ctx, -9.8, -12.5, 4.2, 2.2, 1);
    ctx.fill();

    // Stage 3 Ski Goggles resting on forehead
    if (levelId === 3) {
      ctx.fillStyle = "#1e293b";
      this.roundRect(ctx, -9.5, -16.8, 19, 5.8, 2.8);
      ctx.fill();
      const goggleGrad = ctx.createLinearGradient(-8, -16, 8, -11);
      goggleGrad.addColorStop(0, "#38bdf8");
      goggleGrad.addColorStop(0.5, "#f472b6");
      goggleGrad.addColorStop(1, "#facc15");
      ctx.fillStyle = goggleGrad;
      this.roundRect(ctx, -8.2, -16, 7.5, 4.2, 1.8);
      this.roundRect(ctx, 0.7, -16, 7.5, 4.2, 1.8);
      ctx.fill();
    }

    // Soft Rosy Blush Cheeks
    ctx.fillStyle = "rgba(244, 114, 182, 0.58)";
    ctx.beginPath();
    ctx.ellipse(-6.5, -5.0, 2.8, 1.6, 0, 0, Math.PI * 2);
    ctx.ellipse(6.5, -5.0, 2.8, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Delicate Eyebrows
    const lookX = facing >= 0 ? 0.8 : -0.8;
    ctx.strokeStyle = "#18141c";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(-4.2 + lookX * 0.5, -9.8, 2.8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.arc(4.2 + lookX * 0.5, -9.8, 2.8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Detailed Warm Brown Eyes (Outer dark ring + warm amber-brown lower iris + eyelashes + dual catchlights)
    [-4.3 + lookX, 4.3 + lookX].forEach(ex => {
      // Sclera base
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ex, -7.6, 2.7, 3.0, 0, 0, Math.PI * 2);
      ctx.fill();

      // Deep brown iris
      ctx.fillStyle = "#3b2110";
      ctx.beginPath();
      ctx.ellipse(ex, -7.5, 2.2, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Warm chestnut lower iris crescent
      ctx.fillStyle = "#854d27";
      ctx.beginPath();
      ctx.arc(ex, -6.9, 1.6, 0, Math.PI);
      ctx.fill();

      // Upper eyelash line
      ctx.strokeStyle = "#18141c";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(ex, -7.7, 2.6, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      // Primary & secondary eye sparkles
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex - 0.75, -8.5, 0.95, 0, Math.PI * 2);
      ctx.arc(ex + 0.85, -6.7, 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Expression: Surprised "O" when slipping, warm happy smile otherwise
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 1.3;
    if (isRunningInPlace) {
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.arc(0, -3.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, -4.6, 2.8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    // Detailed Wearable Botanical Flower Crown (Stage 2 or once collected)
    if (levelId === 2 || hasFlowerCrown) {
      // Green vine band
      ctx.strokeStyle = "#15803d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -11.5, 11.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      const colors = ["#f472b6", "#facc15", "#60a5fa", "#fb7185", "#c084fc"];
      for (let i = -2; i <= 2; i++) {
        const fx = i * 4.3;
        const fy = -18.8 + Math.abs(i) * 0.75;
        ctx.fillStyle = colors[i + 2];
        ctx.beginPath();
        ctx.arc(fx, fy, 2.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(fx, fy, 1.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Confusion dizzy stars
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
   * Draws Partner Character (Skating Hand-in-Hand in Stage 1, Warlock in Stage 2, or Cutscenes)
   * Scaled to match Jana (~2x) unless overridden for polaroid thumbnails.
   */
  drawPartner(ctx, x, y, time = 0, isWarlock = false, customScale = null) {
    ctx.save();
    ctx.translate(x, y);

    const scale = customScale !== null
      ? customScale
      : ((this.config.player && this.config.player.scale) || 1.85);
    ctx.scale(scale, scale);

    // Shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 23, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isWarlock) {
      // Black-Caped Warlock Aura (Stage 2 Power-Up!)
      const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 44);
      auraGrad.addColorStop(0, "rgba(168, 85, 247, 0.65)");
      auraGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();

      // Flowing Black Warlock Cape with Mystical Gold/Violet Runes
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
      // Winter Jacket, Jeans & Ice Skates
      ctx.fillStyle = "#1e293b";
      this.roundRect(ctx, -7, 13, 5.5, 8, 2);
      this.roundRect(ctx, 1.5, 13, 5.5, 8, 2);
      ctx.fill();

      ctx.fillStyle = this.config.partner.jacketColor || "#2563eb";
      this.roundRect(ctx, -11.5, 0, 23, 15, 6);
      ctx.fill();

      // Jacket zipper & pockets
      ctx.strokeStyle = "#93c5fd";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 1);
      ctx.lineTo(0, 14.5);
      ctx.stroke();

      // Striped winter scarf
      ctx.fillStyle = "#38bdf8";
      this.roundRect(ctx, -10.5, -2, 21, 4.2, 2);
      ctx.fill();
    }

    // Head
    ctx.fillStyle = this.config.partner.skinTone || "#f5cdb4";
    ctx.beginPath();
    ctx.arc(0, -10, 11.5, 0, Math.PI * 2);
    ctx.fill();

    // Styled Hair
    ctx.fillStyle = this.config.partner.hairColor || "#3b2718";
    ctx.beginPath();
    ctx.arc(0, -13, 12.2, Math.PI * 0.92, Math.PI * 2.08);
    ctx.fill();

    // Eyes with catchlights & warm smile
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(-4.2, -9.5, 2.1, 0, Math.PI * 2);
    ctx.arc(4.2, -9.5, 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-4.7, -10.2, 0.75, 0, Math.PI * 2);
    ctx.arc(3.7, -10.2, 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -6.5, 3, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Stage 1 Obstacle: Wobbly Toddlers & Kids on ice skates (1.5x larger & detailed)
   */
  drawWobblyKid(ctx, obs, time) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    const wobble = Math.sin(time * 9 + obs.seed) * 0.25;
    ctx.rotate(wobble);
    ctx.scale(1.5, 1.5);

    // Shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
    ctx.beginPath();
    ctx.ellipse(0, 17, 13, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiny Ice Skates & Blades
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.ellipse(-4.5, 14.5, 4, 2.8, 0, 0, Math.PI * 2);
    ctx.ellipse(4.5, 14.5, 4, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-8, 17.2);
    ctx.lineTo(-1, 17.2);
    ctx.moveTo(1, 17.2);
    ctx.lineTo(8, 17.2);
    ctx.stroke();

    // Quilted Puffy Toddler Snowsuit
    ctx.fillStyle = obs.color || "#fb923c";
    this.roundRect(ctx, -10, -1, 20, 14, 6);
    ctx.fill();

    // Snowsuit zipper & quilting seams
    ctx.strokeStyle = "rgba(15, 23, 42, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(0, 13);
    ctx.moveTo(-9, 4);
    ctx.lineTo(9, 4);
    ctx.moveTo(-9, 8.5);
    ctx.lineTo(9, 8.5);
    ctx.stroke();

    // Outstretched Wobbly Arms with Contrasting Mittens
    const armWave = Math.sin(time * 14 + obs.seed) * 4;
    ctx.strokeStyle = obs.color || "#fb923c";
    ctx.lineWidth = 4.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-9, 3);
    ctx.lineTo(-15.5, -1 + armWave);
    ctx.moveTo(9, 3);
    ctx.lineTo(15.5, -1 - armWave);
    ctx.stroke();

    ctx.fillStyle = obs.hatColor || "#38bdf8";
    ctx.beginPath();
    ctx.arc(-16, -1 + armWave, 2.8, 0, Math.PI * 2);
    ctx.arc(16, -1 - armWave, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Cozy Scarf
    ctx.fillStyle = "#fef08a";
    this.roundRect(ctx, -8.5, -2.2, 17, 3.5, 1.5);
    ctx.fill();

    // Head & Rosy Cheeks
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(0, -7.5, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(244, 63, 94, 0.45)";
    ctx.beginPath();
    ctx.arc(-5, -5.5, 2, 0, Math.PI * 2);
    ctx.arc(5, -5.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Ribbed Knit Pom-Pom Beanie Hat
    ctx.fillStyle = obs.hatColor || "#38bdf8";
    ctx.beginPath();
    ctx.arc(0, -9.5, 9.4, Math.PI, Math.PI * 2);
    ctx.fill();
    // Ribbed hat cuff
    ctx.fillStyle = "#f8fafc";
    this.roundRect(ctx, -9.5, -11, 19, 3.2, 1.5);
    ctx.fill();
    // Fluffy Pom-Pom on top
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, -19.5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Expressive Wide Eyes & Wobbly "O" Mouth
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(-3.2, -7, 1.7, 0, Math.PI * 2);
    ctx.arc(3.2, -7, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-3.6, -7.5, 0.6, 0, Math.PI * 2);
    ctx.arc(2.8, -7.5, 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.arc(0, -4, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Stage 2 Obstacle: Charging Knight or Mischievous Jester (1.5x larger & detailed)
   */
  drawRenFaireObstacle(ctx, obs, time) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    ctx.scale(1.5, 1.5);

    if (obs.subType === "juggling_pin") {
      ctx.rotate(time * 12 + obs.seed);
      ctx.fillStyle = "#ef4444";
      this.roundRect(ctx, -4.5, -12, 9, 24, 4);
      ctx.fill();
      ctx.fillStyle = "#facc15";
      ctx.fillRect(-4.5, -3, 9, 5);
      ctx.restore();
      return;
    }

    // Shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.26)";
    ctx.beginPath();
    ctx.ellipse(0, 20, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (obs.subType === "knight") {
      // Charging Knight in Detailed Plate Armor
      const bob = Math.sin(time * 14 + obs.seed) * 1.8;
      ctx.translate(0, bob);

      // Fluttering Crimson Cloak
      ctx.fillStyle = "#dc2626";
      this.roundRect(ctx, -12.5, -2, 25, 18.5, 5);
      ctx.fill();

      // Steel Greaves / Boots
      ctx.fillStyle = "#64748b";
      this.roundRect(ctx, -7, 14, 5, 6, 2);
      this.roundRect(ctx, 2, 14, 5, 6, 2);
      ctx.fill();

      // Steel Breastplate with Gold Trim & Lion Shield Emblem
      const armorGrad = ctx.createLinearGradient(-10, 0, 10, 15);
      armorGrad.addColorStop(0, "#e2e8f0");
      armorGrad.addColorStop(0.5, "#94a3b8");
      armorGrad.addColorStop(1, "#64748b");
      ctx.fillStyle = armorGrad;
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 1.4;
      this.roundRect(ctx, -10.5, 0, 21, 15.5, 5);
      ctx.fill();
      ctx.stroke();

      // Shoulder Pauldrons
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.ellipse(-11.5, 3, 4.2, 5.5, 0.2, 0, Math.PI * 2);
      ctx.ellipse(11.5, 3, 4.2, 5.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden Heraldic Crest on Chest
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(0, 3);
      ctx.lineTo(4.5, 5.5);
      ctx.lineTo(0, 11.5);
      ctx.lineTo(-4.5, 5.5);
      ctx.closePath();
      ctx.fill();

      // Visored Bascinet Helmet
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.arc(0, -9, 10.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Brass visor trim & breathing slits
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-7, -11, 14, 4.5);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-5.5, -9.8, 4.5, 2);
      ctx.fillRect(1, -9.8, 4.5, 2);

      // Flowing Royal Plume Feather
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.ellipse(2, -21.5, 7.5, 4, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.ellipse(1, -19.5, 4, 2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Striped Tournament Jousting Lance (pointing left toward player!)
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(-10, 6.5);
      ctx.lineTo(-30, 4);
      ctx.lineTo(-10, 1.5);
      ctx.closePath();
      ctx.fill();
      // Vamplate (lance handguard cone)
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.ellipse(-10, 4, 2.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Mischievous Jester in Harlequin Tunic
      ctx.rotate(Math.sin(time * 8 + obs.seed) * 0.18);

      // Two-tone Harlequin Tunic
      ctx.fillStyle = "#7c3aed";
      this.roundRect(ctx, -10.5, 0, 10.5, 15.5, 3);
      ctx.fill();
      ctx.fillStyle = "#eab308";
      this.roundRect(ctx, 0, 0, 10.5, 15.5, 3);
      ctx.fill();

      // Diamond pattern & jagged collar
      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.moveTo(-5, 4);
      ctx.lineTo(-2, 7.5);
      ctx.lineTo(-5, 11);
      ctx.lineTo(-8, 7.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-5, 4);
      ctx.lineTo(0, 0);
      ctx.lineTo(5, 4);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();

      // Face & Cheeky Grin
      ctx.fillStyle = "#fde68a";
      ctx.beginPath();
      ctx.arc(0, -8, 9.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(-3.2, -8.5, 1.6, 0, Math.PI * 2);
      ctx.arc(3.2, -8.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#991b1b";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, -6.2, 3.2, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Two-Horned Jester Hat with Jingling Bells
      ctx.fillStyle = "#ec4899";
      ctx.beginPath();
      ctx.moveTo(-9, -12);
      ctx.quadraticCurveTo(-18, -25, -4, -16);
      ctx.fill();

      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.moveTo(9, -12);
      ctx.quadraticCurveTo(18, -25, 4, -16);
      ctx.fill();

      ctx.fillStyle = "#fef08a";
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(-14, -21.5, 3.2, 0, Math.PI * 2);
      ctx.arc(14, -21.5, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Stage 3 Obstacle: Icy Patch or Beginner Skier (1.5x larger & detailed)
   */
  drawSkiObstacle(ctx, obs, time) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    ctx.scale(1.5, 1.5);

    if (obs.subType === "ice_patch") {
      // Shimmering Crystalline Slippery Ice Patch
      const r = obs.radius || 22;
      const iceGrad = ctx.createRadialGradient(-4, -3, 2, 0, 0, r * 1.15);
      iceGrad.addColorStop(0, "rgba(224, 242, 254, 0.8)");
      iceGrad.addColorStop(0.55, "rgba(56, 189, 248, 0.5)");
      iceGrad.addColorStop(1, "rgba(14, 165, 233, 0.25)");
      ctx.fillStyle = iceGrad;
      ctx.strokeStyle = "rgba(186, 230, 253, 0.95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.15, r * 0.72, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner crystal facet & glint lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-11, -3);
      ctx.lineTo(5, -8);
      ctx.moveTo(-5, 5);
      ctx.lineTo(12, 1);
      ctx.moveTo(-2, -1);
      ctx.lineTo(4, -3);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Slower Beginner Skier in Pizza-Wedge Stance with Poles & Goggles
    ctx.rotate(Math.sin(time * 4 + obs.seed) * 0.22);

    // Shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.2)";
    ctx.beginPath();
    ctx.ellipse(0, 17, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Snowplow ("Pizza Wedge") Skis
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-15, 18);
    ctx.lineTo(-3, -4);
    ctx.moveTo(15, 18);
    ctx.lineTo(3, -4);
    ctx.stroke();

    // Outstretched Ski Poles with Baskets
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-9, 3);
    ctx.lineTo(-18, 12);
    ctx.moveTo(9, 3);
    ctx.lineTo(18, 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-18, 12, 2.5, 0, Math.PI * 2);
    ctx.arc(18, 12, 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // Retro Ski Suit with Chevron Stripe
    ctx.fillStyle = obs.color || "#10b981";
    this.roundRect(ctx, -9.5, -1, 19, 14.5, 5);
    ctx.fill();
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(-9, 4, 18, 3.2);

    // Head, Helmet & Reflective Ski Goggles
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    ctx.arc(0, -8, 8.8, 0, Math.PI * 2);
    ctx.fill();

    // Ski Helmet
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(0, -9.8, 9.2, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();

    // Tinted Goggles with Glint
    ctx.fillStyle = "#f97316";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    this.roundRect(ctx, -7.5, -11, 15, 5.2, 2.2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Stage 4 Obstacle: Witch from Salem or Exploding Sprite Drink (1.5x larger & detailed)
   */
  drawBostonObstacle(ctx, obs, time) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    ctx.scale(1.5, 1.5);

    if (obs.subType === "witch") {
      // Witch from Salem flying on a detailed wooden broomstick
      const hover = Math.sin(time * 7 + obs.seed) * 3.0;
      ctx.translate(0, hover);

      // Crooked Wooden Broomstick shaft
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 3.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-20, 7);
      ctx.quadraticCurveTo(0, 9, 22, 10);
      ctx.stroke();

      // Bundled Birch Twig Bristles on back (right side)
      ctx.fillStyle = "#d97706";
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, 10);
      ctx.lineTo(31, 4);
      ctx.lineTo(33, 10);
      ctx.lineTo(30, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Gold binding twine on broom
      ctx.fillStyle = "#facc15";
      ctx.fillRect(17, 7.5, 2.5, 5);

      // Flowing Midnight-Purple Witch Cloak
      ctx.fillStyle = "#3b0764";
      ctx.strokeStyle = "#7e22ce";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-8.5, -2);
      ctx.lineTo(8.5, -2);
      ctx.lineTo(14, 14.5);
      ctx.lineTo(-13, 14.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Emerald-tinted Witch Face & Expressive Eyes
      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.arc(0, -8, 8.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.arc(-3, -8, 1.5, 0, Math.PI * 2);
      ctx.arc(2.5, -8, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Pointed Salem Witch Hat with Gold Buckle
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.ellipse(0, -13, 14.5, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-8.5, -13);
      ctx.lineTo(3, -29);
      ctx.lineTo(8.5, -13);
      ctx.closePath();
      ctx.fill();

      // Hat ribbon & gold buckle
      ctx.fillStyle = "#7e22ce";
      ctx.fillRect(-7.2, -16, 14.4, 3);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-2.5, -16.5, 5, 3.8);
    } else {
      // Exploding Sprite Drink Can (1.5x Detailed Lemon-Lime Soda Can)
      const shake = obs.fizzPhase > 0.55 ? Math.sin(time * 55) * 2.5 : 0;
      ctx.translate(shake, 0);

      // Multi-ring fizzy splash when popping
      if (obs.popping) {
        ctx.strokeStyle = "rgba(134, 239, 172, 0.9)";
        ctx.fillStyle = "rgba(74, 222, 128, 0.28)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, obs.popRadius || 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Metallic Green Can Body with Specular Highlight
      const canGrad = ctx.createLinearGradient(-10, 0, 10, 0);
      canGrad.addColorStop(0, "#15803d");
      canGrad.addColorStop(0.35, "#22c55e");
      canGrad.addColorStop(1, "#166534");
      ctx.fillStyle = canGrad;
      ctx.strokeStyle = "#dcfce7";
      ctx.lineWidth = 1.4;
      this.roundRect(ctx, -10.5, -14, 21, 28, 4);
      ctx.fill();
      ctx.stroke();

      // Lemon-Lime Yellow & White Splash Emblem
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-2, -1.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Silver Top & Bottom Can Rims
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.ellipse(0, -14, 9.8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.ellipse(0, -14, 4, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising Fizz Bubbles
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 4; i++) {
        const by = -18 - ((time * 24 + i * 6 + obs.seed) % 15);
        const bx = (i - 1.5) * 4.2;
        ctx.beginPath();
        ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Draws Level Collectibles & Special Power-Up Tokens (~1.7x larger & more detailed)
   */
  drawCollectible(ctx, item, time) {
    ctx.save();
    const bob = Math.sin(time * 5 + item.seed) * 5.5;
    ctx.translate(item.x, item.y + bob);

    const isPowerToken = item.isPowerToken;
    const glowRadius = isPowerToken ? 42 : 32;
    const badgeRadius = isPowerToken ? 24 : 18;

    // Outer radiant glow
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, glowRadius);
    if (isPowerToken) {
      grad.addColorStop(0, "rgba(250, 204, 21, 0.88)");
      grad.addColorStop(0.55, "rgba(244, 114, 182, 0.45)");
      grad.addColorStop(1, "rgba(250, 204, 21, 0)");
    } else {
      grad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
      grad.addColorStop(0.6, "rgba(186, 230, 253, 0.38)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner medallion backing so collectible pops against any background
    ctx.fillStyle = isPowerToken
      ? "rgba(254, 240, 138, 0.28)"
      : "rgba(255, 255, 255, 0.26)";
    ctx.strokeStyle = isPowerToken ? "#facc15" : "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = isPowerToken ? 2.8 : 2;
    ctx.beginPath();
    ctx.arc(0, 0, badgeRadius + Math.sin(time * 7 + item.seed) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rotating dashed halo on Power-Up Tokens
    if (isPowerToken) {
      ctx.save();
      ctx.rotate(time * 2.5);
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, badgeRadius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Large, crisp Collectible Icon (~1.7x bigger)
    ctx.font = isPowerToken ? "38px sans-serif" : "32px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.icon || "❄️", 0, 2);

    ctx.restore();
  }

  /**
   * Builds and caches a seamlessly tileable 960x540 horizontal side-view
   * background image for the given level so left & right edges match seamlessly.
   */
  getLoopingBackgroundTile(levelId, width, height) {
    const bgKeys = {
      1: "bg_ice_rink",
      2: "bg_ren_faire",
      3: "bg_ski_slopes",
      4: "bg_boston_promenade"
    };
    const extImg = this.images[bgKeys[levelId]];
    if (extImg && extImg.complete && extImg.naturalWidth > 0) {
      return extImg;
    }

    if (this.bgTiles[levelId]) {
      return this.bgTiles[levelId];
    }

    const tile = document.createElement("canvas");
    tile.width = width;
    tile.height = height;
    const tctx = tile.getContext("2d");

    if (levelId === 1) {
      // STAGE 1: Seamless Side-Scrolling INDOOR ICE SKATING RINK ARENA
      // 1. Indoor Arena Ceiling & Upper Wall Backdrop
      const wallGrad = tctx.createLinearGradient(0, 0, 0, 118);
      wallGrad.addColorStop(0, "#1e293b");
      wallGrad.addColorStop(0.45, "#334155");
      wallGrad.addColorStop(1, "#475569");
      tctx.fillStyle = wallGrad;
      tctx.fillRect(0, 0, width, 118);

      // Overhead Steel Arena Roof Trusses & Crossbeams (seamless 160px repeat)
      tctx.strokeStyle = "#0f172a";
      tctx.lineWidth = 3;
      tctx.beginPath();
      tctx.moveTo(0, 24);
      tctx.lineTo(width, 24);
      for (let x = 0; x < width; x += 160) {
        tctx.moveTo(x, 0);
        tctx.lineTo(x + 80, 24);
        tctx.lineTo(x + 160, 0);
      }
      tctx.stroke();

      // Indoor Bleacher Seating Tiers & Warm Arched Arena Windows
      tctx.fillStyle = "#1e3a5f";
      tctx.fillRect(0, 56, width, 42);
      tctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
      tctx.lineWidth = 2;
      for (let r = 0; r < 3; r++) {
        tctx.beginPath();
        tctx.moveTo(0, 64 + r * 11);
        tctx.lineTo(width, 64 + r * 11);
        tctx.stroke();
      }

      // Warm Glowing Indoor Arch Windows & Cocoa Concession Booth
      for (let x = 80; x < width; x += 240) {
        tctx.fillStyle = "rgba(254, 240, 138, 0.25)";
        tctx.strokeStyle = "#94a3b8";
        tctx.lineWidth = 2;
        this.roundRect(tctx, x - 36, 32, 72, 48, 12);
        tctx.fill();
        tctx.stroke();
      }
      this.drawHotCocoaCabin(tctx, 420, 26);

      // Hanging Indoor Arena Can Lights & Warm Spotlight Cones
      for (let x = 120; x < width; x += 240) {
        tctx.fillStyle = "#0f172a";
        tctx.fillRect(x - 10, 24, 20, 8);
        tctx.fillStyle = "#fef08a";
        tctx.beginPath();
        tctx.arc(x, 33, 6, 0, Math.PI * 2);
        tctx.fill();
      }

      // 2. Smooth Indoor Resurfaced Ice Sheet
      const iceGrad = tctx.createLinearGradient(0, 114, 0, height - 28);
      iceGrad.addColorStop(0, "#dbeafe");
      iceGrad.addColorStop(0.5, "#eff6ff");
      iceGrad.addColorStop(1, "#dbeafe");
      tctx.fillStyle = iceGrad;
      tctx.fillRect(0, 114, width, height - 142);

      // Subtle Indoor Rink Blue/Red Lines & Faceoff Circles (seamless repeat)
      tctx.strokeStyle = "rgba(59, 130, 246, 0.22)";
      tctx.lineWidth = 6;
      for (let x = 240; x < width; x += 480) {
        tctx.beginPath();
        tctx.moveTo(x, 114);
        tctx.lineTo(x, height - 28);
        tctx.stroke();
      }
      tctx.strokeStyle = "rgba(239, 68, 68, 0.22)";
      tctx.lineWidth = 4;
      for (let x = 480; x <= width; x += 480) {
        tctx.beginPath();
        tctx.arc(x, height * 0.54, 68, 0, Math.PI * 2);
        tctx.stroke();
      }

      // Glossy Overhead Spotlight Reflections & Skate Carvings on Ice
      tctx.fillStyle = "rgba(255, 255, 255, 0.42)";
      for (let x = 120; x < width; x += 240) {
        tctx.beginPath();
        tctx.ellipse(x, height * 0.52, 55, 110, 0.15, 0, Math.PI * 2);
        tctx.fill();
      }

      tctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
      tctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        tctx.beginPath();
        tctx.arc(80 + i * 160, 250 + (i % 2) * 90, 60, 0.2, 2.2);
        tctx.stroke();
      }

      // 3. Classic Indoor Rink Dasher Boards (White Boards + Red Cap Rail + Yellow Kickplate)
      // Top Dasher Board
      tctx.fillStyle = "#f8fafc";
      tctx.fillRect(0, 94, width, 20);
      tctx.fillStyle = "#dc2626";
      tctx.fillRect(0, 91, width, 4);
      tctx.fillStyle = "#facc15";
      tctx.fillRect(0, 111, width, 4);

      // Bottom Dasher Board
      tctx.fillStyle = "#f8fafc";
      tctx.fillRect(0, height - 28, width, 20);
      tctx.fillStyle = "#facc15";
      tctx.fillRect(0, height - 31, width, 4);
      tctx.fillStyle = "#dc2626";
      tctx.fillRect(0, height - 10, width, 4);

      // Twinkling Indoor Fairy Lights strung along the upper rink glass
      const fairyColors = ["#fde047", "#f472b6", "#38bdf8", "#4ade80"];
      for (let x = 16; x < width; x += 32) {
        tctx.fillStyle = fairyColors[Math.floor(x / 32) % fairyColors.length];
        tctx.beginPath();
        tctx.arc(x, 92, 4, 0, Math.PI * 2);
        tctx.fill();
      }

    } else if (levelId === 2) {
      // STAGE 2: Seamless Side-Scrolling Renaissance Faire Grounds
      const grassGrad = tctx.createLinearGradient(0, 0, 0, height);
      grassGrad.addColorStop(0, "#fef3c7");
      grassGrad.addColorStop(0.21, "#fde68a");
      grassGrad.addColorStop(0.22, "#15803d");
      grassGrad.addColorStop(1, "#166534");
      tctx.fillStyle = grassGrad;
      tctx.fillRect(0, 0, width, height);

      // Continuous dirt festival jousting lane
      tctx.fillStyle = "rgba(217, 119, 6, 0.34)";
      tctx.fillRect(0, 155, width, height - 200);

      // Wooden jousting fence rails along top and bottom
      tctx.strokeStyle = "#78350f";
      tctx.lineWidth = 5;
      tctx.beginPath();
      tctx.moveTo(0, 120);
      tctx.lineTo(width, 120);
      tctx.moveTo(0, height - 26);
      tctx.lineTo(width, height - 26);
      tctx.stroke();

      // Medieval Festival Tents spaced evenly every 240px (960 / 4 = 240 -> seamless!)
      const tentColors = [
        ["#dc2626", "#fef08a"],
        ["#2563eb", "#f8fafc"],
        ["#9333ea", "#fde047"],
        ["#059669", "#fef9c3"]
      ];
      for (let i = 0; i < 4; i++) {
        const tx = 120 + i * 240;
        const [c1, c2] = tentColors[i];
        tctx.fillStyle = c1;
        tctx.beginPath();
        tctx.moveTo(tx - 45, 115);
        tctx.lineTo(tx, 52);
        tctx.lineTo(tx + 45, 115);
        tctx.closePath();
        tctx.fill();

        tctx.fillStyle = c2;
        tctx.beginPath();
        tctx.moveTo(tx - 18, 115);
        tctx.lineTo(tx, 52);
        tctx.lineTo(tx + 18, 115);
        tctx.closePath();
        tctx.fill();

        tctx.fillStyle = c1;
        tctx.fillRect(tx, 36, 18, 10);
      }

    } else if (levelId === 3) {
      // STAGE 3: Seamless Side-Scrolling Snowy Ski Mountain
      const slopeGrad = tctx.createLinearGradient(0, 0, 0, height);
      slopeGrad.addColorStop(0, "#bae6fd");
      slopeGrad.addColorStop(0.22, "#e0f2fe");
      slopeGrad.addColorStop(1, "#f8fafc");
      tctx.fillStyle = slopeGrad;
      tctx.fillRect(0, 0, width, height);

      // Seamless Mountain Range (starts and ends at y = 112 at x = 0 and x = 960!)
      tctx.fillStyle = "#64748b";
      tctx.beginPath();
      tctx.moveTo(0, 112);
      tctx.lineTo(160, 30);
      tctx.lineTo(320, 112);
      tctx.lineTo(480, 20);
      tctx.lineTo(640, 112);
      tctx.lineTo(800, 34);
      tctx.lineTo(width, 112);
      tctx.closePath();
      tctx.fill();

      // Continuous Horizontal Ski Lift Cable
      tctx.strokeStyle = "#334155";
      tctx.lineWidth = 2;
      tctx.beginPath();
      tctx.moveTo(0, 62);
      tctx.lineTo(width, 62);
      tctx.stroke();

      for (let x = 120; x < width; x += 240) {
        tctx.strokeStyle = "#1e293b";
        tctx.beginPath();
        tctx.moveTo(x, 62);
        tctx.lineTo(x, 78);
        tctx.stroke();
        tctx.fillStyle = "#ef4444";
        tctx.fillRect(x - 8, 78, 16, 6);
      }

      // Pine trees spaced every 120px along top & bottom edges
      for (let x = 60; x < width; x += 120) {
        this.drawPineTree(tctx, x, 122);
        this.drawPineTree(tctx, x, height - 18);
      }

    } else {
      // STAGE 4: Seamless Side-Scrolling Boston Promenade
      const cityGrad = tctx.createLinearGradient(0, 0, 0, height);
      cityGrad.addColorStop(0, "#1e1b4b");
      cityGrad.addColorStop(0.23, "#312e81");
      cityGrad.addColorStop(0.24, "#334155");
      cityGrad.addColorStop(1, "#1e293b");
      tctx.fillStyle = cityGrad;
      tctx.fillRect(0, 0, width, height);

      // Seamless Red-Brick Freedom Trail running horizontally (same Y at x=0 and x=960)
      tctx.strokeStyle = "#dc2626";
      tctx.lineWidth = 10;
      tctx.setLineDash([18, 6]);
      tctx.beginPath();
      tctx.moveTo(0, height * 0.56);
      tctx.bezierCurveTo(width * 0.33, height * 0.38, width * 0.66, height * 0.74, width, height * 0.56);
      tctx.stroke();
      tctx.setLineDash([]);

      // Boston Skyline Landmarks repeating across the scrolling backdrop:
      // Fenway Green Monster wall
      tctx.fillStyle = "#14532d";
      tctx.strokeStyle = "#dcfce7";
      tctx.lineWidth = 2;
      tctx.fillRect(140, 32, 165, 78);
      tctx.strokeRect(140, 32, 165, 78);
      tctx.fillStyle = "#fde047";
      tctx.font = "bold 11px monospace";
      tctx.textAlign = "center";
      tctx.fillText("BOS  9  |  NY  2", 222, 74);

      // Salem Timber Gables
      tctx.fillStyle = "#27272a";
      tctx.beginPath();
      tctx.moveTo(410, 110);
      tctx.lineTo(410, 62);
      tctx.lineTo(445, 28);
      tctx.lineTo(480, 62);
      tctx.lineTo(515, 32);
      tctx.lineTo(550, 62);
      tctx.lineTo(550, 110);
      tctx.closePath();
      tctx.fill();

      // Museum of Fine Arts Classical Columns
      tctx.fillStyle = "#e2e8f0";
      tctx.fillRect(670, 42, 145, 68);
      tctx.fillStyle = "#94a3b8";
      for (let c = 0; c < 4; c++) {
        tctx.fillRect(685 + c * 34, 58, 10, 52);
      }
    }

    this.bgTiles[levelId] = tile;
    return tile;
  }

  /**
   * Renders the seamlessly looping right-to-left scrolling background
   * and (when nearing the end of the stage) the scrolling finish landmark.
   */
  drawEnvironment(ctx, width, height, levelId, time, state) {
    ctx.save();

    const tile = this.getLoopingBackgroundTile(levelId, width, height);
    const rawOffset = (state && typeof state.scrollOffset === "number") ? state.scrollOffset : 0;
    const offset = ((rawOffset % width) + width) % width;

    // Draw two copies side-by-side for a 100% seamless right-to-left horizontal loop
    ctx.drawImage(tile, -offset, 0, width, height);
    ctx.drawImage(tile, width - offset, 0, width, height);

    // On Stage 4, draw the Cop Slide on the left during the opening launch
    if (levelId === 4 && state && state.stageDistance < 260) {
      this.drawCopSlide(ctx, 68 - state.stageDistance * 0.4, height * 0.52);
    }

    // Draw the Vertical Finish Line when it enters from the right side
    if (state && state.finishLineActive && typeof state.finishLineX === "number") {
      this.drawVerticalFinishLine(ctx, state.finishLineX, 114, height - 28, levelId, time, state);
    }

    ctx.restore();
  }

  /**
   * Draws a full-height vertical finish line spanning the playable corridor,
   * plus the stage's destination scene right behind the line.
   */
  drawVerticalFinishLine(ctx, x, topY, bottomY, levelId, time, state) {
    ctx.save();

    const lineHeight = bottomY - topY;
    const stripWidth = 16;
    const tileSize = 8;

    // Soft golden glow along the vertical finish line
    const glow = ctx.createLinearGradient(x - 24, 0, x + 24, 0);
    glow.addColorStop(0, "rgba(250, 204, 21, 0)");
    glow.addColorStop(0.5, "rgba(250, 204, 21, 0.35)");
    glow.addColorStop(1, "rgba(250, 204, 21, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 24, topY, 48, lineHeight);

    // Checkered Vertical Finish Line Banner
    const rows = Math.floor(lineHeight / tileSize);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 2; c++) {
        const isDark = (r + c) % 2 === 0;
        ctx.fillStyle = isDark ? "#0f172a" : "#ffffff";
        ctx.fillRect(
          x - stripWidth * 0.5 + c * tileSize,
          topY + r * tileSize,
          tileSize,
          tileSize
        );
      }
    }

    // Gold border lines on left & right of the checkered strip
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(x - stripWidth * 0.5, topY, stripWidth, lineHeight);

    // Top and Bottom Finish Posts with Golden Finials
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(x, topY, 9, 0, Math.PI * 2);
    ctx.arc(x, bottomY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Destination prop resting just past the finish line (no circle aura)
    const propX = x + 62;
    const propY = (topY + bottomY) * 0.5;
    if (levelId === 1) {
      // Cozy Wooden Bench with 2 Hot Cocoas
      ctx.fillStyle = "#92400e";
      this.roundRect(ctx, propX - 28, propY - 18, 56, 36, 6);
      ctx.fill();
      ctx.fillStyle = "#b45309";
      this.roundRect(ctx, propX - 24, propY - 13, 48, 26, 4);
      ctx.fill();
      ctx.font = "22px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("☕☕", propX, propY + 6);

      // Level 1 Finish Cutscene: Chloe's Mom appears and snaps photos of Jana & Partner!
      if (state && state.isCutscene) {
        this.drawChloesMomCutscene(ctx, propX + 12, propY - 88, time, state);
      }
    } else if (levelId === 2) {
      ctx.font = "34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("👑", propX, propY + 8);
    } else if (levelId === 3) {
      ctx.font = "32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🫕", propX, propY + 8);
    } else {
      ctx.font = "28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🕯️🥂", propX, propY + 8);
    }

    ctx.restore();
  }

  /**
   * Renders Chloe's Mom stepping out with her camera to snap photos of Jana
   * and her partner right after crossing the Level 1 finish line.
   */
  drawChloesMomCutscene(ctx, x, y, time, state) {
    ctx.save();
    ctx.translate(x, y);

    // Subtle excited bounce as she snaps photos
    const bounce = Math.abs(Math.sin(time * 10)) * -4;
    ctx.translate(0, bounce);
    ctx.scale(1.75, 1.75);

    // Shadow
    ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, 20, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stylish Lavender-Plum Winter Coat & Scarf
    ctx.fillStyle = "#9333ea";
    this.roundRect(ctx, -10.5, 0, 21, 15.5, 5.5);
    ctx.fill();
    ctx.fillStyle = "#f5d0fe";
    this.roundRect(ctx, -9.5, -1.8, 19, 3.8, 1.8);
    ctx.fill();

    // Head & Warm Smile
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    ctx.arc(0, -8.5, 9.5, 0, Math.PI * 2);
    ctx.fill();

    // Chestnut Bob Hair
    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.arc(0, -10.5, 10.2, Math.PI * 0.88, Math.PI * 2.12);
    ctx.fill();

    // Happy Eyes & Smile
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(-3.5, -8.5, 1.6, 0, Math.PI * 2);
    ctx.arc(3.5, -8.5, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, -5.8, 2.8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Hands holding DSLR Camera aimed toward Jana & Partner on the left
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.2;
    this.roundRect(ctx, -18, -5, 12, 9, 2);
    ctx.fill();
    ctx.stroke();

    // Camera Lens barrel pointing left-downward
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(-18, -0.5, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Bright Starburst Camera Flash when shutter fires!
    if (state.cameraFlash > 0.05) {
      ctx.save();
      ctx.translate(-21, -0.5);
      const flashRadius = 36 * state.cameraFlash;
      const flashGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, flashRadius);
      flashGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
      flashGrad.addColorStop(0.45, "rgba(254, 240, 138, 0.9)");
      flashGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(0, 0, flashRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

    // Subtle warm goal aura
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

    // Chloe's Mom appears when Jana reaches the bench!
    if (state && state.isCutscene) {
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

      if (state.cameraFlash > 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath();
        ctx.arc(14, -2, 22, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

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
    ctx.fillText("👑", 0, 6);
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

    // Warm glowing lodge window
    ctx.fillStyle = "#0ea5e9";
    ctx.fillRect(-24, -18, 48, 22);
    const deerOffset = (time * 18) % 26;
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🦌🦌", -8 + deerOffset * 0.5, -3);

    ctx.font = "18px sans-serif";
    ctx.fillText("🫕", 0, 20);
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
    ctx.translate(w * 0.41, h * 0.68);
    this.drawPartner(ctx, 0, 0, time, false, 1.35);
    ctx.restore();

    ctx.save();
    ctx.translate(w * 0.59, h * 0.70);
    this.drawJana(ctx, 0, 0, {
      levelId: 1,
      time,
      hasFlowerCrown: false,
      facing: -1,
      customScale: 1.35
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
