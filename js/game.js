/**
 * ============================================================================
 * 2D HORIZONTAL SIDE-SCROLLING EVASION ENGINE
 * ============================================================================
 * - Flat 2D side-view perspective with seamlessly looping right-to-left background.
 * - Player starts on the left side and moves seamlessly Up, Down, Left, Right
 *   via Arrow Keys or WASD, constrained within the visible canvas area.
 * - Obstacles spawn along the right edge at varied Y positions, move steadily
 *   left, increase in speed/spawn-rate over time, and are destroyed off-screen.
 * - Tight AABB bounding-box collision triggers a 'Game Over' screen with 'Restart'.
 */

class AnniversaryGame {
  constructor() {
    this.config = window.GAME_CONFIG;
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.sprites = new window.SpriteRenderer(this.config);

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Game States: TITLE, PLAYING, GAMEOVER, CUTSCENE, TRANSITION, VICTORY
    this.state = "TITLE";
    this.currentLevelIndex = 0; // 0..3 -> Stages I..IV
    this.score = 0;
    this.stageStartScore = 0;
    this.time = 0;
    this.lastFrameTime = performance.now();

    // Horizontal Side-Scrolling State
    this.scrollOffset = 0;
    this.stageDistance = 0;
    this.stageElapsed = 0;
    this.stageDurationSec = 28;
    this.baseScrollSpeed = 210;
    this.baseSpawnInterval = 1.15;
    this.minSpawnInterval = 0.52;
    this.obstacleSpawnTimer = 0.6;
    this.collectibleSpawnTimer = 1.4;
    this.powerTokenSpawnTimer = 7.5;
    this.lastObstacleY = null;

    // Universal Power-Up Lifecycle State
    this.powerCharges = 0;
    this.maxPowerCharges = this.config.powerUp.collectiblesRequired || 2;
    this.powerUpTimer = 0;
    this.powerUpDuration = this.config.powerUp.durationSeconds || 5.0;
    this.isInvincible = false;
    this.warlockShockwave = 0;

    // Cutscene / Camera Flash State (Stage 1 Chloe's Mom photo shoot & Stage 4 Cop Slide Intro)
    this.cutsceneTimer = 0;
    this.cameraFlash = 0;
    this.spriteExplosion = null;
    this.shutterCount = 0;
    this.introSlideTimer = 0;
    this.introSlideDuration = 5.0;
    this.spriteExplosion = null;

    // Fondue Ingredient Tracker (Stage 3)
    this.fondueCollected = {
      strawberry: false,
      banana: false,
      marshmallow: false,
      chocolate: false
    };

    // Player Entity (Positioned on the left side of the screen, with tight AABB hitbox for ~2x sprite)
    this.player = {
      x: 120,
      y: 270,
      vx: 0,
      vy: 0,
      radius: 28,
      hitboxW: 36, // Tight bounding-box width for 2x sprite
      hitboxH: 52, // Tight bounding-box height for 2x sprite
      facing: 1,
      slipTimer: 0,
      confuseTimer: 0,
      spinTimer: 0,
      spinAngle: 0,
      hasFlowerCrown: false
    };

    // Active Side-Scrolling Entities
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Vertical Finish Line (Spawns on the right edge when win condition is reached)
    this.finishLine = {
      active: false,
      x: this.width + 30,
      targetX: this.width - 140,
      entrySpeed: 280
    };

    // Dual Input Handler State (WASD + Arrow Keys)
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // Settings & God Mode Debug State
    this.godMode = false;
    this.godInvincible = true;
    this.stateBeforeSettings = null;

    this.bindEvents();
    this.updateHUD();
    requestAnimationFrame(ts => this.gameLoop(ts));
  }

  bindEvents() {
    window.addEventListener("keydown", e => {
      const code = e.code;
      if (["ArrowUp", "KeyW"].includes(code)) {
        this.keys.up = true;
        e.preventDefault();
      }
      if (["ArrowDown", "KeyS"].includes(code)) {
        this.keys.down = true;
        e.preventDefault();
      }
      if (["ArrowLeft", "KeyA"].includes(code)) {
        this.keys.left = true;
        e.preventDefault();
      }
      if (["ArrowRight", "KeyD"].includes(code)) {
        this.keys.right = true;
        e.preventDefault();
      }
      if (code === "Space") {
        e.preventDefault();
        if (this.state === "PLAYING") {
          this.tryActivatePowerUp();
        } else if (this.state === "GAMEOVER") {
          this.restartCurrentStage();
        }
      }
      if (code === "Enter" && this.state === "GAMEOVER") {
        e.preventDefault();
        this.restartCurrentStage();
      }
    });

    window.addEventListener("keyup", e => {
      const code = e.code;
      if (["ArrowUp", "KeyW"].includes(code)) this.keys.up = false;
      if (["ArrowDown", "KeyS"].includes(code)) this.keys.down = false;
      if (["ArrowLeft", "KeyA"].includes(code)) this.keys.left = false;
      if (["ArrowRight", "KeyD"].includes(code)) this.keys.right = false;
    });

    // Start Button
    const startBtn = document.getElementById("startGameBtn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        window.soundManager.init();
        this.startLevel(0);
      });
    }

    // Game Over -> Restart Button
    const restartBtn = document.getElementById("restartBtn");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        this.restartCurrentStage();
      });
    }

    // Next Stage Button
    const nextLevelBtn = document.getElementById("nextLevelBtn");
    if (nextLevelBtn) {
      nextLevelBtn.addEventListener("click", () => {
        if (this.currentLevelIndex < this.config.levels.length - 1) {
          this.startLevel(this.currentLevelIndex + 1);
        } else {
          this.showVictoryScreen();
        }
      });
    }

    // Play Again Button (from Victory screen)
    const replayBtn = document.getElementById("replayGameBtn");
    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        this.score = 0;
        this.player.hasFlowerCrown = false;
        this.startLevel(0);
      });
    }

    // Gift Reveal Unwrap Button
    const unwrapGiftBtn = document.getElementById("unwrapGiftBtn");
    if (unwrapGiftBtn) {
      unwrapGiftBtn.addEventListener("click", () => {
        const giftCard = document.getElementById("giftRevealCard");
        if (giftCard) {
          giftCard.classList.remove("hidden");
          unwrapGiftBtn.classList.add("hidden");
          window.soundManager.playLevelComplete();
          this.burstDomConfetti();
        }
      });
    }

    // HUD Power-Up Button
    const powerUpHudBtn = document.getElementById("powerUpTriggerBtn");
    if (powerUpHudBtn) {
      powerUpHudBtn.addEventListener("click", () => {
        if (this.state === "PLAYING") {
          this.tryActivatePowerUp();
        }
      });
    }

    // Audio Mute Toggle
    const muteBtn = document.getElementById("muteBtn");
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        const isMuted = window.soundManager.toggleMute();
        muteBtn.textContent = isMuted ? "🔇 Muted" : "🔊 Audio";
      });
    }

    // Settings & God Mode Menu Handlers
    const settingsBtn = document.getElementById("settingsBtn");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        this.toggleSettingsModal();
      });
    }

    const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener("click", () => {
        this.closeSettingsModal();
      });
    }

    const godModeCheckbox = document.getElementById("godModeCheckbox");
    if (godModeCheckbox) {
      godModeCheckbox.addEventListener("change", e => {
        this.godMode = e.target.checked;
        const panel = document.getElementById("godModePanel");
        if (panel) panel.classList.toggle("hidden", !this.godMode);
        this.updateHUD();
      });
    }

    const godInvincibleCheckbox = document.getElementById("godInvincibleCheckbox");
    if (godInvincibleCheckbox) {
      godInvincibleCheckbox.addEventListener("change", e => {
        this.godInvincible = e.target.checked;
      });
    }

    // Direct Stage Jump Buttons inside God Mode
    document.querySelectorAll("[data-jump-stage]").forEach(btn => {
      btn.addEventListener("click", () => {
        const stageIdx = parseInt(btn.getAttribute("data-jump-stage"), 10);
        window.soundManager.init();
        this.closeSettingsModal();
        this.startLevel(stageIdx);
      });
    });

    // Also allow clicking the top progress dots directly when God Mode is enabled
    document.querySelectorAll(".stage-dot").forEach(dot => {
      dot.addEventListener("click", () => {
        if (!this.godMode) return;
        const stageIdx = parseInt(dot.getAttribute("data-stage-dot"), 10);
        window.soundManager.init();
        this.closeSettingsModal();
        this.startLevel(stageIdx);
      });
    });

    // Quick Debug Action Buttons
    const debugSpawnFinishBtn = document.getElementById("debugSpawnFinishBtn");
    if (debugSpawnFinishBtn) {
      debugSpawnFinishBtn.addEventListener("click", () => {
        this.closeSettingsModal();
        if (this.state === "TITLE" || this.state === "GAMEOVER" || this.state === "TRANSITION" || this.state === "VICTORY") {
          this.startLevel(this.currentLevelIndex);
        }
        if (this.state === "INTRO_SLIDE") {
          this.introSlideTimer = 0;
          this.player.x = 120;
          this.player.y = this.height * 0.54;
          this.player.spinAngle = 0;
          this.state = "PLAYING";
        }
        this.stageElapsed = this.stageDurationSec;
      });
    }

    const debugTriggerPowerBtn = document.getElementById("debugTriggerPowerBtn");
    if (debugTriggerPowerBtn) {
      debugTriggerPowerBtn.addEventListener("click", () => {
        this.closeSettingsModal();
        if (this.state === "PLAYING") {
          this.tryActivatePowerUp(true);
        }
      });
    }

    const debugShowFinaleBtn = document.getElementById("debugShowFinaleBtn");
    if (debugShowFinaleBtn) {
      debugShowFinaleBtn.addEventListener("click", () => {
        this.closeSettingsModal();
        this.showVictoryScreen();
      });
    }
  }

  toggleSettingsModal() {
    const overlay = document.getElementById("settingsOverlay");
    if (!overlay) return;
    if (overlay.classList.contains("hidden")) {
      this.stateBeforeSettings = this.state;
      this.state = "PAUSED_SETTINGS";
      overlay.classList.remove("hidden");
      this.updateHUD();
    } else {
      this.closeSettingsModal();
    }
  }

  closeSettingsModal() {
    const overlay = document.getElementById("settingsOverlay");
    if (!overlay || overlay.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
    if (this.state === "PAUSED_SETTINGS" && this.stateBeforeSettings) {
      this.state = this.stateBeforeSettings;
    }
  }

  startLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    this.stageStartScore = this.score;
    const levelCfg = this.config.levels[levelIndex];
    const stageSettings = window.LevelBuilder.getStageSettings(levelCfg.id, this.width, this.height);

    // Clear active arrays
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Position player on the left side of the screen
    this.player.x = stageSettings.startPos.x;
    this.player.y = stageSettings.startPos.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 1;
    this.player.slipTimer = 0;
    this.player.confuseTimer = 0;
    this.player.spinTimer = 0;
    this.player.spinAngle = 0;

    // Reset side-scrolling parameters
    this.scrollOffset = 0;
    this.stageDistance = 0;
    this.stageElapsed = 0;
    this.stageDurationSec = stageSettings.stageDurationSec;
    this.baseScrollSpeed = stageSettings.baseScrollSpeed;
    this.baseSpawnInterval = stageSettings.baseSpawnInterval;
    this.minSpawnInterval = stageSettings.minSpawnInterval;
    this.obstacleSpawnTimer = 0.75;
    this.collectibleSpawnTimer = 1.2;
    this.powerTokenSpawnTimer = 6.5;
    this.lastObstacleY = null;

    this.finishLine = {
      active: false,
      x: this.width + 30,
      targetX: this.width - 140,
      entrySpeed: 280
    };

    this.powerCharges = 0;
    this.powerUpTimer = 0;
    this.isInvincible = false;
    this.warlockShockwave = 0;
    this.cutsceneTimer = 0;
    this.cameraFlash = 0;
    this.spriteExplosion = null;

    if (levelCfg.id === 3) {
      this.fondueCollected = {
        strawberry: false,
        banana: false,
        marshmallow: false,
        chocolate: false
      };
    }

    // Hide all modal overlays
    document.getElementById("titleOverlay").classList.add("hidden");
    document.getElementById("gameOverOverlay").classList.add("hidden");
    document.getElementById("settingsOverlay").classList.add("hidden");
    document.getElementById("transitionOverlay").classList.add("hidden");
    document.getElementById("victoryOverlay").classList.add("hidden");

    if (levelCfg.id === 4) {
      // Start Level 4 with a 5-second animation of going down the Giant Cop Slide!
      this.state = "INTRO_SLIDE";
      this.introSlideDuration = 5.0;
      this.introSlideTimer = 5.0;
      const topPt = this.sprites.getCopSlidePoint(0, this.height);
      this.player.x = topPt.x;
      this.player.y = topPt.y;
      this.addFloatingText(topPt.x + 85, topPt.y - 25, "🛝 Here we go!!", "#fde047");
    } else {
      this.state = "PLAYING";
    }

    window.soundManager.startBGM(levelCfg.id);
    this.updateHUD();
  }

  restartCurrentStage() {
    this.score = this.stageStartScore;
    this.startLevel(this.currentLevelIndex);
  }

  triggerGameOver() {
    this.state = "GAMEOVER";
    window.soundManager.playBump();
    this.player.slipTimer = 0.9; // Show running/sliding animation frame on impact
    const overlay = document.getElementById("gameOverOverlay");
    if (overlay) {
      overlay.classList.remove("hidden");
    }
  }

  /**
   * Triggers a 1.45-second pressurized Sprite Can explosion animation on Level 4
   * before showing the Game Over screen!
   */
  triggerSpriteCanExplosion(x, y) {
    this.state = "SPRITE_EXPLODING";
    window.soundManager.playFizzPop();
    this.player.slipTimer = 1.45;
    this.player.vx = 0;
    this.player.vy = 0;

    // Generate radial fizzy soda droplets & spinning green/silver aluminum can shards
    const droplets = [];
    const colors = ["#4ade80", "#facc15", "#ffffff", "#22c55e", "#fef08a", "#bbf7d0"];
    for (let i = 0; i < 34; i++) {
      const angle = (i / 34) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const spd = 0.45 + Math.random() * 0.85;
      droplets.push({
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 0.25,
        r: 3.5 + Math.random() * 5,
        color: colors[i % colors.length],
        isShard: i % 5 === 0,
        rotSpeed: (Math.random() - 0.5) * 18
      });
    }

    this.spriteExplosion = {
      x,
      y,
      timer: 1.45,
      duration: 1.45,
      progress: 0,
      burstTriggered: false,
      droplets
    };

    this.addFloatingText(x, y - 36, "🥫⚠️ FIZZZZ...", "#fde047");
  }

  updateSpriteExplosion(dt) {
    if (!this.spriteExplosion) {
      this.triggerGameOver();
      return;
    }

    this.spriteExplosion.timer -= dt;
    const elapsed = this.spriteExplosion.duration - Math.max(0, this.spriteExplosion.timer);
    this.spriteExplosion.progress = Math.min(1, elapsed / this.spriteExplosion.duration);

    // At 0.22 progress, the bulging Sprite can bursts open!
    if (this.spriteExplosion.progress >= 0.22 && !this.spriteExplosion.burstTriggered) {
      this.spriteExplosion.burstTriggered = true;
      this.addFloatingText(
        this.spriteExplosion.x,
        this.spriteExplosion.y - 48,
        "💥 FIZZ BOOOOOM!!",
        "#4ade80"
      );
      const icons = ["💥", "🫧", "🍋", "💦"];
      for (let i = 0; i < 16; i++) {
        this.spawnParticle(
          this.spriteExplosion.x + (Math.random() - 0.5) * 30,
          this.spriteExplosion.y + (Math.random() - 0.5) * 30,
          icons[i % icons.length]
        );
      }
    }

    // Knock Jana back slightly during the blast wave
    if (this.spriteExplosion.progress >= 0.22 && this.spriteExplosion.progress < 0.65) {
      const dirX = this.player.x <= this.spriteExplosion.x ? -1 : 1;
      this.player.x = Math.max(40, Math.min(this.width - 40, this.player.x + dirX * 95 * dt));
      this.player.spinAngle += dt * 14;
    }

    this.updateParticles(dt);

    if (this.spriteExplosion.timer <= 0) {
      this.player.spinAngle = 0;
      this.triggerGameOver();
    }
  }

  /**
   * Tight Axis-Aligned Bounding-Box (AABB) Collision Detection
   */
  checkTightAABB(ax, ay, aw, ah, bx, by, bw, bh) {
    const aLeft = ax - aw * 0.5;
    const aRight = ax + aw * 0.5;
    const aTop = ay - ah * 0.5;
    const aBottom = ay + ah * 0.5;

    const bLeft = bx - bw * 0.5;
    const bRight = bx + bw * 0.5;
    const bTop = by - bh * 0.5;
    const bBottom = by + bh * 0.5;

    return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
  }

  /**
   * Universal Power-Up Activation (Spacebar with 2 charges or touching golden Power Token)
   */
  tryActivatePowerUp(forcedByToken = false) {
    if (!forcedByToken && this.powerCharges < this.maxPowerCharges) {
      this.addFloatingText(
        this.player.x,
        this.player.y - 30,
        `Need ${this.maxPowerCharges - this.powerCharges} more!`,
        "#cbd5e1"
      );
      return;
    }

    const levelCfg = this.config.levels[this.currentLevelIndex];
    this.powerCharges = 0;
    this.powerUpTimer = this.powerUpDuration;
    this.isInvincible = true;
    this.player.slipTimer = 0;
    this.player.confuseTimer = 0;
    this.player.spinTimer = 0;
    this.player.spinAngle = 0;

    window.soundManager.playPowerUpActivate(levelCfg.id);

    if (levelCfg.id === 1) {
      this.addFloatingText(this.player.x, this.player.y - 32, "🤝 HAND-IN-HAND SHIELD!", "#f472b6");
    } else if (levelCfg.id === 2) {
      this.addFloatingText(this.player.x, this.player.y - 36, "🧙‍♂️ WARLOCK SPELL!", "#c084fc");
      this.warlockShockwave = 1.0;
      this.castWarlockObstacleBanish();
    } else if (levelCfg.id === 3) {
      this.addFloatingText(this.player.x, this.player.y - 32, "☕ HOT COCOA BOOST!", "#fb923c");
    } else {
      this.addFloatingText(this.player.x, this.player.y - 32, "🧋 TATTE LATTE RUSH!", "#fde047");
    }

    for (let i = 0; i < 16; i++) {
      this.spawnParticle(this.player.x, this.player.y, "💖");
    }

    this.updateHUD();
  }

  castWarlockObstacleBanish() {
    this.obstacles.forEach(obs => {
      for (let i = 0; i < 6; i++) {
        this.spawnParticle(obs.x, obs.y, "✨");
      }
      this.addFloatingText(obs.x, obs.y, "⚡ Poof!", "#c084fc");
    });
    this.obstacles = [];
  }

  update(dt) {
    this.time += dt;
    const levelCfg = this.config.levels[this.currentLevelIndex];

    if (this.state === "INTRO_SLIDE") {
      this.updateIntroSlide(dt);
      return;
    }

    if (this.state === "SPRITE_EXPLODING") {
      this.updateSpriteExplosion(dt);
      return;
    }

    if (this.state === "CUTSCENE") {
      this.updateCutscene(dt);
      return;
    }

    if (this.state !== "PLAYING") return;

    this.stageElapsed += dt;
    const winConditionReached = this.stageElapsed >= this.stageDurationSec;

    // Progressive Difficulty Scaling: Over time, increase speed & spawn rate!
    const progressRatio = Math.min(1, this.stageElapsed / this.stageDurationSec);
    const difficultyMultiplier = 1.0 + progressRatio * 0.45; // Up to 1.45x faster over the stage
    const boostSpeedBonus = this.isInvincible ? 1.25 : 1.0;

    // 1. STOP THE ENVIRONMENT when win condition is reached:
    // Immediately set scroll speed to 0 so the background stops scrolling!
    const currentScrollSpeed = winConditionReached
      ? 0
      : this.baseScrollSpeed * difficultyMultiplier * boostSpeedBonus;

    // Scroll seamlessly looping background from right to left (frozen when currentScrollSpeed === 0)
    this.scrollOffset = (this.scrollOffset + currentScrollSpeed * dt) % this.width;
    this.stageDistance += currentScrollSpeed * dt;

    // Update Power-Up Countdown Timer
    if (this.powerUpTimer > 0) {
      this.powerUpTimer = Math.max(0, this.powerUpTimer - dt);
      this.isInvincible = this.powerUpTimer > 0;

      if (Math.random() < 0.35) {
        const icon = levelCfg.id === 2 ? "✨" : "💗";
        this.spawnParticle(
          this.player.x + (Math.random() - 0.5) * 28,
          this.player.y + (Math.random() - 0.5) * 20,
          icon
        );
      }

      if (this.powerUpTimer === 0) {
        this.isInvincible = false;
      }
    }

    if (this.warlockShockwave > 0) {
      this.warlockShockwave = Math.max(0, this.warlockShockwave - dt * 1.4);
    }

    // Seamless 4-Way Player Movement (Up, Down, Left, Right via Arrow Keys or WASD)
    const moveSpeed = 310 * (this.isInvincible ? 1.18 : 1.0);
    let targetVx = 0;
    let targetVy = 0;

    if (this.keys.up) targetVy -= moveSpeed;
    if (this.keys.down) targetVy += moveSpeed;
    if (this.keys.left) targetVx -= moveSpeed;
    if (this.keys.right) targetVx += moveSpeed;

    // Normalize diagonal movement so diagonal speed matches cardinal speed
    if (targetVx !== 0 && targetVy !== 0) {
      const invSqrt2 = 0.70710678;
      targetVx *= invSqrt2;
      targetVy *= invSqrt2;
    }

    // Smooth inertia blend (extra responsive while maintaining natural ice/surface feel)
    const responsiveness = levelCfg.id === 1 ? 10.0 : 14.0;
    this.player.vx += (targetVx - this.player.vx) * Math.min(1, responsiveness * dt);
    this.player.vy += (targetVy - this.player.vy) * Math.min(1, responsiveness * dt);

    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;
    this.player.facing = 1; // Always facing forward (right) in side-scrolling view

    // Constrain player movement strictly within the visible canvas area
    const halfW = this.player.hitboxW * 0.5 + 8;
    const halfH = this.player.hitboxH * 0.5 + 8;
    const minX = halfW + 10;
    const maxX = this.width - halfW - 10;
    const minY = 128 + halfH;
    const maxY = this.height - 34 - halfH;

    if (this.player.x < minX) {
      this.player.x = minX;
      this.player.vx = 0;
    }
    if (this.player.x > maxX) {
      this.player.x = maxX;
      this.player.vx = 0;
    }
    if (this.player.y < minY) {
      this.player.y = minY;
      this.player.vy = 0;
    }
    if (this.player.y > maxY) {
      this.player.y = maxY;
      this.player.vy = 0;
    }

    // Spawn Obstacles & Collectibles along the right edge ONLY before win condition is reached
    if (!winConditionReached) {
      this.obstacleSpawnTimer -= dt;
      if (this.obstacleSpawnTimer <= 0) {
        // Decrease spawn interval over time to increase difficulty
        const currentInterval = Math.max(
          this.minSpawnInterval,
          this.baseSpawnInterval - progressRatio * 0.52
        );
        this.obstacleSpawnTimer = currentInterval * (0.82 + Math.random() * 0.36);

        const newObs = window.LevelBuilder.spawnObstacle(
          levelCfg.id,
          this.width,
          this.height,
          difficultyMultiplier,
          this.lastObstacleY
        );
        this.lastObstacleY = newObs.y;
        this.obstacles.push(newObs);
      }

      // Spawn Collectibles along right edge
      this.collectibleSpawnTimer -= dt;
      if (this.collectibleSpawnTimer <= 0) {
        this.collectibleSpawnTimer = 2.1 + Math.random() * 1.2;
        this.collectibles.push(
          window.LevelBuilder.spawnCollectible(levelCfg.id, this.width, this.height, currentScrollSpeed, false)
        );
      }

      // Spawn Direct Power-Up Token periodically
      this.powerTokenSpawnTimer -= dt;
      if (this.powerTokenSpawnTimer <= 0) {
        this.powerTokenSpawnTimer = 9.5 + Math.random() * 3.0;
        this.collectibles.push(
          window.LevelBuilder.spawnCollectible(levelCfg.id, this.width, this.height, currentScrollSpeed, true)
        );
      }
    } else {
      // 2. THE FINISH LINE: Spawn vertical finish line on the right side of the screen,
      // move it left into the frame, and stop at targetX waiting for the player to cross it.
      this.finishLine.active = true;
      if (this.finishLine.x > this.finishLine.targetX) {
        this.finishLine.x = Math.max(
          this.finishLine.targetX,
          this.finishLine.x - this.finishLine.entrySpeed * dt
        );
      }
    }

    // Update existing Obstacles (continue moving left off-screen and get destroyed)
    this.updateObstacles(dt, levelCfg.id, { minY: 132, maxY: this.height - 36 });

    // Update existing Collectibles (continue moving left off-screen and get destroyed)
    this.updateCollectibles(dt);

    // Update Particles & Floating Texts
    this.updateParticles(dt);

    // 3. PLAYER CROSSING & 4. CELEBRATION SCREEN:
    // Once the player's bounding box crosses the vertical finish line, freeze movement
    // and transition to the static 'Level Complete' celebration screen!
    if (this.finishLine.active) {
      const playerRightEdge = this.player.x + this.player.hitboxW * 0.5;
      if (playerRightEdge >= this.finishLine.x) {
        this.handleFinishLineCrossed();
      }
    }

    this.updateHUD();
  }

  updateObstacles(dt, levelId, verticalBounds) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Move steadily to the left (plus slight vertical weaving for active sprites)
      obs.x += obs.vx * dt;
      obs.y += (obs.vy || 0) * dt;

      // Bounce vertical weaving within the playable lane
      if (obs.y < verticalBounds.minY || obs.y > verticalBounds.maxY) {
        obs.vy = -(obs.vy || 0);
        obs.y = Math.max(verticalBounds.minY, Math.min(verticalBounds.maxY, obs.y));
      }

      // Stage 4 Sprite cans fizz while moving left
      if (obs.subType === "sprite_can") {
        obs.fizzPhase = (obs.fizzPhase || 0) + dt * 0.6;
        obs.popping = obs.fizzPhase >= 0.85;
      }

      // MEMORY CLEANUP: Destroy obstacle once it goes off the left side of the screen
      if (obs.x + (obs.hitboxW || 30) < -30) {
        this.obstacles.splice(i, 1);
        continue;
      }

      // Tight Bounding-Box (AABB) Collision Detection with Player
      const hit = this.checkTightAABB(
        this.player.x,
        this.player.y,
        this.player.hitboxW,
        this.player.hitboxH,
        obs.x,
        obs.y,
        obs.hitboxW || 24,
        obs.hitboxH || 28
      );

      if (hit) {
        if (this.isInvincible || (this.godMode && this.godInvincible)) {
          // Power-Up Shield or God Mode Invincibility Active: Safely knock obstacle away!
          this.score += 50;
          for (let p = 0; p < 6; p++) {
            this.spawnParticle(obs.x, obs.y, "💖");
          }
          this.obstacles.splice(i, 1);
          continue;
        } else {
          // If hit a Sprite Can on Level 4, play the exploding Sprite animation before Game Over!
          if (obs.subType === "sprite_can") {
            const exX = obs.x;
            const exY = obs.y;
            this.obstacles.splice(i, 1);
            this.triggerSpriteCanExplosion(exX, exY);
            return;
          }
          // Standard obstacle collision -> Trigger 'Game Over' screen with 'Restart' button!
          this.triggerGameOver();
          return;
        }
      }
    }
  }

  updateCollectibles(dt) {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const item = this.collectibles[i];

      // Move steadily from right to left with the scrolling world
      item.x += (item.vx || -200) * dt;

      // Destroy collectible if it scrolls off the left edge of the screen
      if (item.x + 30 < -20) {
        this.collectibles.splice(i, 1);
        continue;
      }

      // Tight AABB pickup check
      const pickedUp = this.checkTightAABB(
        this.player.x,
        this.player.y,
        this.player.hitboxW + 6,
        this.player.hitboxH + 6,
        item.x,
        item.y,
        item.hitboxW || 26,
        item.hitboxH || 26
      );

      if (pickedUp) {
        this.score += item.points || 100;

        if (item.isCrown) {
          this.player.hasFlowerCrown = true;
        }
        if (item.fondueKey && this.fondueCollected) {
          this.fondueCollected[item.fondueKey] = true;
        }

        for (let p = 0; p < 8; p++) {
          this.spawnParticle(item.x, item.y, item.icon);
        }

        if (item.isPowerToken) {
          this.tryActivatePowerUp(true);
        } else {
          this.powerCharges = Math.min(this.maxPowerCharges, this.powerCharges + 1);
          if (this.powerCharges >= this.maxPowerCharges) {
            window.soundManager.playPowerUpReady();
            this.addFloatingText(item.x, item.y - 18, "⚡ PRESS SPACE!", "#fde047");
          } else {
            window.soundManager.playCollectible();
            this.addFloatingText(item.x, item.y - 14, `+${item.points || 100}`, "#fef08a");
          }
        }

        this.collectibles.splice(i, 1);
      }
    }
  }

  handleFinishLineCrossed() {
    // Freeze all player movement immediately
    this.player.vx = 0;
    this.player.vy = 0;
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;

    const levelCfg = this.config.levels[this.currentLevelIndex];
    if (levelCfg && levelCfg.id === 1) {
      // Level 1 Finish Animation: Chloe's Mom steps out and snaps several photos of us!
      this.state = "CUTSCENE";
      this.cutsceneTimer = 3.2;
      this.shutterCount = 0;
      this.obstacles = [];
      this.collectibles = [];

      // Pose Jana & Partner right past the finish line next to the Hot Cocoa Bench
      this.player.x = this.finishLine.x + 28;
      this.player.y = (114 + (this.height - 28)) * 0.5 + 16;

      window.soundManager.playCameraShutter();
      this.cameraFlash = 1.0;
      this.spawnParticle(this.player.x - 10, this.player.y - 30, "📸");
      this.spawnParticle(this.player.x + 12, this.player.y - 36, "💖");
      this.addFloatingText(this.finishLine.x + 40, this.player.y - 115, "📸 Chloe's Mom: 'Wait—smile, you two!'", "#fef08a");
    } else {
      // Transition directly to the static 'Level Complete' celebration screen
      this.openLevelTransitionModal();
    }
  }

  updateCutscene(dt) {
    this.cutsceneTimer -= dt;
    this.cameraFlash = Math.max(0, this.cameraFlash - dt * 2.6);

    // Snap Photo #2
    if (this.cutsceneTimer < 2.15 && this.shutterCount === 0) {
      this.shutterCount = 1;
      this.cameraFlash = 1.0;
      window.soundManager.playCameraShutter();
      this.spawnParticle(this.player.x - 18, this.player.y - 34, "🖼️");
      this.spawnParticle(this.player.x + 8, this.player.y - 40, "✨");
      this.addFloatingText(this.finishLine.x + 30, this.player.y - 98, "📸 *CLICK!* 'One more by the hot cocoa!'", "#f472b6");
    }

    // Snap Photo #3
    if (this.cutsceneTimer < 1.05 && this.shutterCount === 1) {
      this.shutterCount = 2;
      this.cameraFlash = 1.0;
      window.soundManager.playCameraShutter();
      this.spawnParticle(this.player.x, this.player.y - 38, "🖼️");
      this.spawnParticle(this.player.x - 22, this.player.y - 44, "💖");
      this.addFloatingText(this.finishLine.x + 45, this.player.y - 98, "📸 *FLASH!* 'Got it! So cute!!'", "#fde047");
    }

    this.updateParticles(dt);

    if (this.cutsceneTimer <= 0) {
      this.openLevelTransitionModal();
    }
  }

  /**
   * 5-second opening animation at the beginning of Level 4 where Jana slides
   * down the gleaming Boston Cop Slide before normal gameplay begins.
   */
  updateIntroSlide(dt) {
    this.introSlideTimer = Math.max(0, this.introSlideTimer - dt);
    const elapsed = this.introSlideDuration - this.introSlideTimer; // 0.0 -> 5.0s
    const norm = elapsed / this.introSlideDuration; // 0.0 -> 1.0

    if (norm < 0.14) {
      // Phase 1 (0.0s - 0.7s): Poised at the top tunnel entrance of the Cop Slide
      const pt = this.sprites.getCopSlidePoint(0, this.height);
      this.player.x = pt.x;
      this.player.y = pt.y + Math.sin(elapsed * 14) * 2;
      this.player.spinAngle = 0.08;
    } else if (norm < 0.86) {
      // Phase 2 (0.7s - 4.3s): Zooming down the winding metallic Cop Slide chute!
      const slideNorm = (norm - 0.14) / 0.72;
      // Ease-in-out curve for realistic slide acceleration
      const eased = slideNorm < 0.5
        ? 2 * slideNorm * slideNorm
        : 1 - Math.pow(-2 * slideNorm + 2, 2) / 2;

      const pt = this.sprites.getCopSlidePoint(eased, this.height);
      this.player.x = pt.x;
      this.player.y = pt.y;
      this.player.spinAngle = pt.angle;

      if (Math.random() < 0.45) {
        this.spawnParticle(this.player.x - 18, this.player.y + 8, "✨");
      }
      if (Math.abs(elapsed - 1.6) < dt * 0.6) {
        this.addFloatingText(this.player.x + 55, this.player.y - 38, "🛝 WEEEEEEE!!", "#fde047");
      }
      if (Math.abs(elapsed - 3.1) < dt * 0.6) {
        this.addFloatingText(this.player.x + 65, this.player.y - 38, "💨 SO FAST!!", "#38bdf8");
      }
    } else {
      // Phase 3 (4.3s - 5.0s): Shoot out the bottom of the slide and settle at startPos (x = 120)
      const settleNorm = (norm - 0.86) / 0.14;
      const endPt = this.sprites.getCopSlidePoint(1, this.height);
      this.player.x = endPt.x + (120 - endPt.x) * settleNorm;
      this.player.y = endPt.y;
      this.player.spinAngle = endPt.angle * (1 - settleNorm);
    }

    this.updateParticles(dt);

    if (this.introSlideTimer <= 0) {
      this.player.x = 120;
      this.player.y = this.height * 0.54;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.spinAngle = 0;
      this.state = "PLAYING";
      this.addFloatingText(this.player.x + 50, this.player.y - 42, "✨ GO!", "#4ade80");
    }
  }

  openLevelTransitionModal() {
    this.state = "TRANSITION";
    window.soundManager.playLevelComplete();

    const levelCfg = this.config.levels[this.currentLevelIndex];
    document.getElementById("transitionBadge").textContent = `${levelCfg.number} Complete`;
    document.getElementById("transitionTitle").textContent = levelCfg.completionHeadline;
    document.getElementById("transitionStory").textContent = levelCfg.completionStory;
    document.getElementById("nextLevelBtn").textContent = levelCfg.nextButtonText;

    // Display the 3 personal photo Polaroid cards on EVERY level's celebration screen!
    const photoShowcase = document.getElementById("level1PhotoShowcase");
    const sceneBanner = document.getElementById("levelSceneBanner");

    photoShowcase.classList.remove("hidden");
    sceneBanner.classList.add("hidden");
    this.populatePolaroidGallery("polaroidGrid", levelCfg.photos || this.config.level1Photos, levelCfg.id);

    document.getElementById("transitionOverlay").classList.remove("hidden");
  }

  populatePolaroidGallery(containerId, photosList = null, defaultLevelId = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const photos = photosList || this.config.level1Photos || [];
    photos.forEach((photo, idx) => {
      const card = document.createElement("div");
      card.className = "polaroid-card";
      card.style.transform = `rotate(${(idx % 2 === 0 ? -2.2 : 2.2)}deg)`;

      const mediaWrap = document.createElement("div");
      mediaWrap.className = "polaroid-media";

      const fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.width = 240;
      fallbackCanvas.height = 175;
      this.sprites.renderPolaroidIllustration(
        fallbackCanvas,
        photo.sceneType,
        idx + 1,
        photo.levelId || defaultLevelId
      );
      mediaWrap.appendChild(fallbackCanvas);

      if (photo.imageSrc) {
        const img = new Image();
        img.src = photo.imageSrc;
        img.alt = photo.caption;
        img.onload = () => {
          mediaWrap.innerHTML = "";
          mediaWrap.appendChild(img);
        };
      }

      const tag = document.createElement("span");
      tag.className = "polaroid-tag";
      tag.textContent = photo.dateTag || `Photo #${idx + 1}`;

      const cap = document.createElement("p");
      cap.className = "polaroid-caption";
      cap.textContent = photo.caption;

      card.appendChild(mediaWrap);
      card.appendChild(tag);
      card.appendChild(cap);
      container.appendChild(card);
    });
  }

  showVictoryScreen() {
    this.state = "VICTORY";
    window.soundManager.playLevelComplete();

    document.getElementById("transitionOverlay").classList.add("hidden");
    const victoryOverlay = document.getElementById("victoryOverlay");
    victoryOverlay.classList.remove("hidden");

    const finale = this.config.finale;
    document.getElementById("victoryHeadline").textContent = finale.headline;
    document.getElementById("victorySubheadline").textContent = finale.subheadline;
    document.getElementById("victoryScore").textContent = `Final Score: ${this.score} pts`;

    const letterEl = document.getElementById("victoryLetter");
    letterEl.innerHTML = finale.letterParagraphs.map(p => `<p>${p}</p>`).join("") +
      `<p class="letter-signature">${finale.signature}</p>`;

    const unwrapBtn = document.getElementById("unwrapGiftBtn");
    const giftCard = document.getElementById("giftRevealCard");
    unwrapBtn.textContent = finale.giftReveal.buttonPrompt;
    unwrapBtn.classList.remove("hidden");
    giftCard.classList.add("hidden");

    document.getElementById("giftTitle").textContent = finale.giftReveal.title;
    document.getElementById("giftSubtitle").textContent = finale.giftReveal.subtitle;
    document.getElementById("giftDetails").textContent = finale.giftReveal.details;
    document.getElementById("giftFooterNote").textContent = finale.giftReveal.footerNote;

    this.populatePolaroidGallery("victoryPolaroidGrid");
    this.burstDomConfetti();
  }

  burstDomConfetti() {
    const container = document.getElementById("confettiContainer");
    if (!container) return;
    container.innerHTML = "";
    const colors = ["#f472b6", "#facc15", "#38bdf8", "#a855f7", "#4ade80", "#fb7185"];
    for (let i = 0; i < 48; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 1.5}s`;
      piece.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
      container.appendChild(piece);
    }
  }

  spawnParticle(x, y, icon) {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3.2,
      vy: -1.2 - Math.random() * 2.2,
      icon,
      alpha: 1,
      life: 0.75 + Math.random() * 0.45
    });
  }

  addFloatingText(x, y, text, color = "#ffffff") {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      life: 1.35
    });
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      p.alpha = Math.max(0, p.life);
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 28 * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life);
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  updateHUD() {
    const levelCfg = this.config.levels[this.currentLevelIndex];
    if (!levelCfg) return;

    const stageBadge = document.getElementById("hudStageBadge");
    if (stageBadge) stageBadge.textContent = levelCfg.number;

    const scoreEl = document.getElementById("hudScore");
    if (scoreEl) scoreEl.textContent = this.score;

    const progressBar = document.getElementById("hudProgressBar");
    if (progressBar) {
      const pct = Math.min(100, (this.stageElapsed / this.stageDurationSec) * 100);
      progressBar.style.width = `${pct}%`;
    }

    document.querySelectorAll(".stage-dot").forEach((dot, idx) => {
      dot.classList.toggle("active", idx === this.currentLevelIndex);
      dot.classList.toggle("completed", idx < this.currentLevelIndex);
      dot.classList.toggle("god-clickable", this.godMode);
      dot.title = this.godMode ? `Jump to Stage ${idx + 1}` : "";
    });

    document.querySelectorAll("[data-jump-stage]").forEach((btn, idx) => {
      btn.classList.toggle("active", idx === this.currentLevelIndex);
    });

    const powerBtn = document.getElementById("powerUpTriggerBtn");
    if (powerBtn) {
      if (this.powerUpTimer > 0) {
        powerBtn.classList.add("active-aura");
        powerBtn.classList.remove("ready-pulse");
        powerBtn.textContent = `✨ ${this.powerUpTimer.toFixed(1)}s`;
      } else if (this.powerCharges >= this.maxPowerCharges) {
        powerBtn.classList.remove("active-aura");
        powerBtn.classList.add("ready-pulse");
        powerBtn.textContent = `⚡ READY [SPACE]`;
      } else {
        powerBtn.classList.remove("active-aura", "ready-pulse");
        powerBtn.textContent = `⚡ ${this.powerCharges} / ${this.maxPowerCharges}`;
      }
    }

    const fondueBadge = document.getElementById("fondueHudTracker");
    if (fondueBadge) {
      if (levelCfg.id === 3) {
        fondueBadge.classList.remove("hidden");
        fondueBadge.innerHTML = `
          <span class="${this.fondueCollected.strawberry ? "got" : "need"}">🍓</span>
          <span class="${this.fondueCollected.banana ? "got" : "need"}">🍌</span>
          <span class="${this.fondueCollected.marshmallow ? "got" : "need"}">🍡</span>
          <span class="${this.fondueCollected.chocolate ? "got" : "need"}">🍫</span>
        `;
      } else {
        fondueBadge.classList.add("hidden");
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const levelCfg = this.config.levels[this.currentLevelIndex];
    const levelId = levelCfg.id;

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Apply screen shake during the Sprite Can explosion blast wave!
    if (
      this.state === "SPRITE_EXPLODING" &&
      this.spriteExplosion &&
      this.spriteExplosion.progress >= 0.22 &&
      this.spriteExplosion.progress < 0.75
    ) {
      const shakeMag = (1 - this.spriteExplosion.progress) * 12;
      ctx.translate(
        (Math.random() - 0.5) * shakeMag * 2,
        (Math.random() - 0.5) * shakeMag * 2
      );
    }

    // 1. Draw Seamlessly Looping Horizontal Scrolling Environment & Static Finish Line
    this.sprites.drawEnvironment(ctx, this.width, this.height, levelId, this.time, {
      scrollOffset: this.scrollOffset,
      stageDistance: this.stageDistance,
      finishLineActive: this.finishLine.active,
      finishLineX: this.finishLine.x,
      cameraFlash: this.cameraFlash,
      isCutscene: this.state === "CUTSCENE",
      isIntroSlide: this.state === "INTRO_SLIDE"
    });

    // 2. Draw Collectibles & Power-Up Tokens scrolling right-to-left
    this.collectibles.forEach(item => {
      this.sprites.drawCollectible(ctx, item, this.time);
    });

    // 3. Draw Obstacles scrolling right-to-left
    this.obstacles.forEach(obs => {
      if (obs.type === "wobbly_kid") {
        this.sprites.drawWobblyKid(ctx, obs, this.time);
      } else if (obs.type === "ren_faire") {
        this.sprites.drawRenFaireObstacle(ctx, obs, this.time);
      } else if (obs.type === "ski_obstacle") {
        this.sprites.drawSkiObstacle(ctx, obs, this.time);
      } else if (obs.type === "boston_obstacle") {
        this.sprites.drawBostonObstacle(ctx, obs, this.time);
      }
    });

    // 3b. Draw Sprite Can Explosion Animation if active
    if (this.state === "SPRITE_EXPLODING" && this.spriteExplosion) {
      this.sprites.drawSpriteCanExplosion(ctx, this.spriteExplosion, this.time);
    }

    // 4. Draw Warlock Magic Spell Shockwave Ring (Stage 2)
    if (this.warlockShockwave > 0) {
      const r = (1 - this.warlockShockwave) * 420 + 30;
      ctx.save();
      ctx.strokeStyle = `rgba(192, 132, 252, ${this.warlockShockwave})`;
      ctx.fillStyle = `rgba(168, 85, 247, ${this.warlockShockwave * 0.22})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 5. Draw Partner Sprite when Holding Hands (Stage 1) or Warlock (Stage 2)
    if (
      (levelId === 1 && (this.isInvincible || this.state === "CUTSCENE")) ||
      (levelId === 2 && this.isInvincible)
    ) {
      const isWarlock = levelId === 2;
      const partnerX = this.player.x - 46;
      const partnerY = this.player.y - 2;
      this.sprites.drawPartner(ctx, partnerX, partnerY, this.time, isWarlock);

      if (levelId === 1) {
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💗", this.player.x - 23, this.player.y - 42);
      }
    }

    // 6. Draw Main Player Character: Jana
    this.sprites.drawJana(ctx, this.player.x, this.player.y, {
      levelId,
      vx: this.player.vx * 0.02,
      vy: this.player.vy * 0.02,
      time: this.time,
      slipTimer: this.player.slipTimer,
      confuseTimer: this.player.confuseTimer,
      spinAngle: this.player.spinAngle,
      powerUpTimer: this.powerUpTimer,
      hasFlowerCrown: this.player.hasFlowerCrown,
      facing: 1
    });

    // 7. Draw Active HUD Countdown Dial right above Jana when Power-Up is active
    if (this.powerUpTimer > 0) {
      const ratio = this.powerUpTimer / this.powerUpDuration;
      ctx.save();
      ctx.translate(this.player.x, this.player.y - 62);
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#f472b6";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 9.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(Math.ceil(this.powerUpTimer), 0, 0.5);
      ctx.restore();
    }

    // 8. Draw Particles & Floating Action Texts
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.icon, p.x, p.y);
      ctx.restore();
    });

    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = "bold 13px 'Nunito', sans-serif";
      ctx.textAlign = "center";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3.5;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // 9. Camera Viewfinder Focus Frame & Flash Overlay during Chloe's Mom photo shoot in Stage 1
    if (this.state === "CUTSCENE" && levelId === 1) {
      ctx.save();
      const fx = this.player.x - 74;
      const fy = this.player.y - 56;
      const fw = 112;
      const fh = 104;
      const corner = 16;

      ctx.strokeStyle = this.cameraFlash > 0.2 ? "#fef08a" : "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Top-left bracket
      ctx.moveTo(fx, fy + corner);
      ctx.lineTo(fx, fy);
      ctx.lineTo(fx + corner, fy);
      // Top-right bracket
      ctx.moveTo(fx + fw - corner, fy);
      ctx.lineTo(fx + fw, fy);
      ctx.lineTo(fx + fw, fy + corner);
      // Bottom-left bracket
      ctx.moveTo(fx, fy + fh - corner);
      ctx.lineTo(fx, fy + fh);
      ctx.lineTo(fx + corner, fy + fh);
      // Bottom-right bracket
      ctx.moveTo(fx + fw - corner, fy + fh);
      ctx.lineTo(fx + fw, fy + fh);
      ctx.lineTo(fx + fw, fy + fh - corner);
      ctx.stroke();

      // Viewfinder REC / Photo Counter badge
      ctx.fillStyle = "#fde047";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`📸 PHOTO ${Math.min(3, this.shutterCount + 1)}/3`, fx + 8, fy - 8);
      ctx.restore();
    }

    if (this.cameraFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.cameraFlash * 0.78})`;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    ctx.restore();
  }

  gameLoop(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(ts => this.gameLoop(ts));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.game = new AnniversaryGame();
});
