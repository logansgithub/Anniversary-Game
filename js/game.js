/**
 * ============================================================================
 * OUR JOURNEY TOGETHER - CORE MATTER.JS PHYSICS & GAMEPLAY ENGINE
 * ============================================================================
 */

class AnniversaryGame {
  constructor() {
    this.config = window.GAME_CONFIG;
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.sprites = new window.SpriteRenderer(this.config);

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Game State
    this.state = "TITLE"; // TITLE, PLAYING, CUTSCENE, TRANSITION, VICTORY
    this.currentLevelIndex = 0; // 0..3 -> Levels 1..4
    this.score = 0;
    this.time = 0;
    this.lastFrameTime = performance.now();

    // Universal Power-Up Lifecycle State
    this.powerCharges = 0;
    this.maxPowerCharges = this.config.powerUp.collectiblesRequired || 2;
    this.powerUpTimer = 0;
    this.powerUpDuration = this.config.powerUp.durationSeconds || 5.0;
    this.isInvincible = false;

    // Warlock Magic Shockwave Effect (Level 2)
    this.warlockShockwave = 0;

    // Cutscene / Camera Flash State (Level 1 Chloe's Mom photo shoot)
    this.cutsceneTimer = 0;
    this.cameraFlash = 0;
    this.shutterCount = 0;

    // Fondue Ingredient Tracker (Level 3)
    this.fondueCollected = {
      strawberry: false,
      banana: false,
      marshmallow: false,
      chocolate: false
    };

    // Player Entity (backed by Matter.js body when Matter is available)
    this.player = {
      x: 82,
      y: 280,
      vx: 0,
      vy: 0,
      radius: 17,
      facing: 1,
      slipTimer: 0,      // Running/sliding in place animation timer
      confuseTimer: 0,   // Jester juggling pin confusion timer
      spinTimer: 0,      // Ice patch spin-out timer
      spinAngle: 0,
      hasFlowerCrown: false,
      copSlideLaunchTimer: 0
    };

    this.matterEngine = null;
    this.matterPlayerBody = null;

    // Active Level Entities
    this.obstacles = [];
    this.collectibles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.goalZone = { x: 868, y: 290, radius: 52 };

    // Dual Input Handler State (WASD + Arrow Keys + Spacebar)
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.initMatterPhysics();
    this.bindEvents();
    this.updateHUD();
    requestAnimationFrame(ts => this.gameLoop(ts));
  }

  initMatterPhysics() {
    if (window.Matter) {
      const { Engine, Bodies, Composite } = window.Matter;
      this.matterEngine = Engine.create();
      this.matterEngine.gravity.x = 0;
      this.matterEngine.gravity.y = 0;

      this.matterPlayerBody = Bodies.circle(this.player.x, this.player.y, this.player.radius, {
        frictionAir: 0.018,
        restitution: 0.7,
        label: "JanaPlayer"
      });
      Composite.add(this.matterEngine.world, [this.matterPlayerBody]);
    }
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
        }
      }
    });

    window.addEventListener("keyup", e => {
      const code = e.code;
      if (["ArrowUp", "KeyW"].includes(code)) this.keys.up = false;
      if (["ArrowDown", "KeyS"].includes(code)) this.keys.down = false;
      if (["ArrowLeft", "KeyA"].includes(code)) this.keys.left = false;
      if (["ArrowRight", "KeyD"].includes(code)) this.keys.right = false;
    });

    // UI Buttons
    const startBtn = document.getElementById("startGameBtn");
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        window.soundManager.init();
        this.startLevel(0);
      });
    }

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

    const replayBtn = document.getElementById("replayGameBtn");
    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        this.score = 0;
        this.player.hasFlowerCrown = false;
        this.startLevel(0);
      });
    }

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

    const powerUpHudBtn = document.getElementById("powerUpTriggerBtn");
    if (powerUpHudBtn) {
      powerUpHudBtn.addEventListener("click", () => {
        if (this.state === "PLAYING") {
          this.tryActivatePowerUp();
        }
      });
    }

    const muteBtn = document.getElementById("muteBtn");
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        const isMuted = window.soundManager.toggleMute();
        muteBtn.textContent = isMuted ? "🔇 Muted" : "🔊 Audio";
      });
    }
  }

  startLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    const levelCfg = this.config.levels[levelIndex];
    const built = window.LevelBuilder.build(levelCfg.id, this.width, this.height);

    this.obstacles = built.obstacles;
    this.collectibles = built.collectibles;
    this.goalZone = built.goalZone;
    this.particles = [];
    this.floatingTexts = [];

    this.player.x = built.startPos.x;
    this.player.y = built.startPos.y;
    this.player.vx = levelCfg.id === 4 ? 6.2 : 0; // Level 4 launches right off the Cop Slide!
    this.player.vy = 0;
    this.player.facing = 1;
    this.player.slipTimer = 0;
    this.player.confuseTimer = 0;
    this.player.spinTimer = 0;
    this.player.spinAngle = 0;
    this.player.copSlideLaunchTimer = levelCfg.id === 4 ? 2.4 : 0;

    if (this.matterPlayerBody && window.Matter) {
      window.Matter.Body.setPosition(this.matterPlayerBody, { x: this.player.x, y: this.player.y });
      window.Matter.Body.setVelocity(this.matterPlayerBody, { x: this.player.vx, y: this.player.vy });
      this.matterPlayerBody.frictionAir = levelCfg.physics.frictionAir;
    }

    this.powerCharges = 0;
    this.powerUpTimer = 0;
    this.isInvincible = false;
    this.warlockShockwave = 0;
    this.cutsceneTimer = 0;
    this.cameraFlash = 0;

    if (levelCfg.id === 3) {
      this.fondueCollected = {
        strawberry: false,
        banana: false,
        marshmallow: false,
        chocolate: false
      };
    }

    if (levelCfg.id === 4) {
      this.addFloatingText(this.player.x + 70, this.player.y - 35, "🛝 WEEEE!", "#fde047");
    }

    // Hide overlays
    document.getElementById("titleOverlay").classList.add("hidden");
    document.getElementById("transitionOverlay").classList.add("hidden");
    document.getElementById("victoryOverlay").classList.add("hidden");

    this.state = "PLAYING";
    window.soundManager.startBGM(levelCfg.id);
    this.updateHUD();
  }

  /**
   * Universal Power-Up Lifecycle Activation (Spacebar or touching Partner/Power Token)
   */
  tryActivatePowerUp(forcedByToken = false) {
    if (!forcedByToken && this.powerCharges < this.maxPowerCharges) {
      this.addFloatingText(
        this.player.x,
        this.player.y - 30,
        `Need ${this.maxPowerCharges - this.powerCharges} more collectible(s)!`,
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
      this.addFloatingText(this.player.x, this.player.y - 36, "🧙‍♂️ WARLOCK OBSTACLE BANISH SPELL!", "#c084fc");
      this.warlockShockwave = 1.0;
      this.castWarlockObstacleBanish();
    } else if (levelCfg.id === 3) {
      this.addFloatingText(this.player.x, this.player.y - 32, "☕ HOT COCOA THERMAL BOOST!", "#fb923c");
    } else {
      this.addFloatingText(this.player.x, this.player.y - 32, "🧋 TATTE LATTE ESPRESSO RUSH!", "#fde047");
    }

    // Spawn celebratory hearts & sparkles
    for (let i = 0; i < 18; i++) {
      this.spawnParticle(this.player.x, this.player.y, "💖");
    }

    this.updateHUD();
  }

  /**
   * Level 2 Special Power-Up: Summons the Warlock in a black cape who uses
   * a magic spell to remove obstacles!
   */
  castWarlockObstacleBanish() {
    this.obstacles.forEach(obs => {
      for (let i = 0; i < 6; i++) {
        this.spawnParticle(obs.x, obs.y, "✨");
      }
      this.addFloatingText(obs.x, obs.y, "⚡ Poof!", "#c084fc");
    });
    // Remove all current obstacles with magic spell!
    this.obstacles = [];
  }

  update(dt) {
    this.time += dt;
    const levelCfg = this.config.levels[this.currentLevelIndex];

    if (this.state === "CUTSCENE") {
      this.updateCutscene(dt);
      return;
    }

    if (this.state !== "PLAYING") return;

    // Update Power-Up Countdown Timer
    if (this.powerUpTimer > 0) {
      this.powerUpTimer = Math.max(0, this.powerUpTimer - dt);
      this.isInvincible = this.powerUpTimer > 0;

      // Continuous heart particle emitter while Power-Up is active
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
        this.addFloatingText(this.player.x, this.player.y - 26, "Power-Up Ended", "#e2e8f0");
      }
    }

    if (this.warlockShockwave > 0) {
      this.warlockShockwave = Math.max(0, this.warlockShockwave - dt * 1.4);
    }

    // Update status timers on Jana
    if (this.player.slipTimer > 0) {
      this.player.slipTimer = Math.max(0, this.player.slipTimer - dt);
    }
    if (this.player.confuseTimer > 0) {
      this.player.confuseTimer = Math.max(0, this.player.confuseTimer - dt);
    }
    if (this.player.spinTimer > 0) {
      this.player.spinTimer = Math.max(0, this.player.spinTimer - dt);
      this.player.spinAngle += dt * 18;
      if (this.player.spinTimer === 0) this.player.spinAngle = 0;
    }
    if (this.player.copSlideLaunchTimer > 0) {
      this.player.copSlideLaunchTimer = Math.max(0, this.player.copSlideLaunchTimer - dt);
    }

    // Calculate Input Acceleration (Dual WASD + Arrow Keys)
    const phys = levelCfg.physics;
    const speedMult = this.isInvincible && (levelCfg.id === 3 || levelCfg.id === 4) ? 1.32 : 1.0;
    const controlSign = this.player.confuseTimer > 0 ? -1 : 1; // Inverted when confused by Jester pin!

    let ax = 0;
    let ay = 0;

    // While slipping/running in place, movement acceleration is reduced
    const slipPenalty = this.player.slipTimer > 0 ? 0.25 : 1.0;

    if (this.keys.up) ay -= phys.accel * controlSign * slipPenalty;
    if (this.keys.down) ay += phys.accel * controlSign * slipPenalty;
    if (this.keys.left) ax -= phys.accel * controlSign * slipPenalty;
    if (this.keys.right) ax += phys.accel * controlSign * slipPenalty;

    // Continuous downhill / Cop Slide momentum (Levels 3 & 4)
    if (phys.continuousForward > 0) {
      ax += phys.continuousForward;
    }

    this.player.vx += ax;
    this.player.vy += ay;

    // Apply surface friction (low on Level 1 ice rink for authentic inertia!)
    const damping = 1 - phys.frictionAir;
    this.player.vx *= damping;
    this.player.vy *= damping;

    // Level 4 Cop Slide minimum forward glide momentum so she keeps sliding!
    if (levelCfg.id === 4 && this.player.slipTimer <= 0 && this.player.vx < 1.55) {
      this.player.vx = 1.55;
    }

    // Cap max speed
    const maxSpd = phys.maxSpeed * speedMult;
    const curSpd = Math.hypot(this.player.vx, this.player.vy);
    if (curSpd > maxSpd) {
      this.player.vx = (this.player.vx / curSpd) * maxSpd;
      this.player.vy = (this.player.vy / curSpd) * maxSpd;
    }

    if (Math.abs(this.player.vx) > 0.15) {
      this.player.facing = this.player.vx >= 0 ? 1 : -1;
    }

    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // World bounds collision
    const minX = 48;
    const maxX = this.width - 48;
    const minY = 132;
    const maxY = this.height - 46;

    if (this.player.x < minX) {
      this.player.x = minX;
      this.player.vx *= -0.5;
    }
    if (this.player.x > maxX) {
      this.player.x = maxX;
      this.player.vx *= -0.5;
    }
    if (this.player.y < minY) {
      this.player.y = minY;
      this.player.vy *= -0.5;
    }
    if (this.player.y > maxY) {
      this.player.y = maxY;
      this.player.vy *= -0.5;
    }

    // Step Matter.js physics engine in sync
    if (this.matterEngine && this.matterPlayerBody && window.Matter) {
      window.Matter.Body.setPosition(this.matterPlayerBody, { x: this.player.x, y: this.player.y });
      window.Matter.Engine.update(this.matterEngine, dt * 1000);
    }

    // Update Obstacles & Check Collisions
    this.updateObstacles(dt, levelCfg.id, { minX, maxX, minY, maxY });

    // Check Collectible & Power-Up Token Pickups
    this.updateCollectibles(levelCfg.id);

    // Update Floating Particles & Text
    this.updateParticles(dt);

    // Check Level Goal Completion!
    const distToGoal = Math.hypot(this.player.x - this.goalZone.x, this.player.y - this.goalZone.y);
    if (distToGoal < this.goalZone.radius + this.player.radius - 6) {
      this.handleGoalReached(levelCfg.id);
    }

    this.updateHUD();
  }

  updateObstacles(dt, levelId, bounds) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Movement patterns by level
      if (obs.type === "wobbly_kid") {
        // Unpredictable zigzag across the ice rink
        obs.zigzagTimer += dt;
        if (obs.zigzagTimer > 1.15) {
          obs.zigzagTimer = 0;
          obs.vx = -obs.vx + (Math.random() - 0.5) * 0.8;
        }
        obs.x += obs.vx;
        obs.y += obs.vy;
      } else if (obs.type === "ren_faire") {
        obs.x += obs.vx;
        obs.y += obs.vy;

        // Mischievous Jesters periodically toss juggling pins toward Jana!
        if (obs.subType === "jester") {
          obs.pinCooldown -= dt;
          if (obs.pinCooldown <= 0) {
            obs.pinCooldown = 3.2;
            const angle = Math.atan2(this.player.y - obs.y, this.player.x - obs.x);
            this.obstacles.push({
              id: `pin_${ Math.random() }`,
              type: "ren_faire",
              subType: "juggling_pin",
              x: obs.x,
              y: obs.y,
              vx: Math.cos(angle) * 3.1,
              vy: Math.sin(angle) * 3.1,
              radius: 10,
              seed: Math.random() * 10,
              ttl: 3.5
            });
          }
        }
        if (obs.subType === "juggling_pin") {
          obs.ttl -= dt;
          if (obs.ttl <= 0) {
            this.obstacles.splice(i, 1);
            continue;
          }
        }
      } else if (obs.type === "ski_obstacle") {
        if (obs.subType === "skier") {
          // Beginner skiers making wide S-turns across the slope
          obs.x += Math.sin(this.time * 2.5 + obs.seed) * 1.6;
          obs.y += obs.vy;
        }
      } else if (obs.type === "boston_obstacle") {
        obs.x += obs.vx;
        obs.y += obs.vy;

        // Exploding Sprite drinks fizz and pop periodically!
        if (obs.subType === "sprite_can") {
          obs.fizzPhase += dt * 0.45;
          if (obs.fizzPhase >= 1.0) {
            obs.popping = true;
            obs.popRadius = 42;
            if (obs.fizzPhase >= 1.35) {
              obs.fizzPhase = 0;
              obs.popping = false;
              obs.popRadius = 20;
            }
          }
        }
      }

      // Bounce moving obstacles within arena bounds
      if (obs.subType !== "juggling_pin" && obs.subType !== "ice_patch") {
        if (obs.x < bounds.minX + 70 || obs.x > bounds.maxX - 95) obs.vx *= -1;
        if (obs.y < bounds.minY + 18 || obs.y > bounds.maxY - 18) obs.vy *= -1;
        obs.x = Math.max(bounds.minX + 65, Math.min(bounds.maxX - 90, obs.x));
        obs.y = Math.max(bounds.minY + 16, Math.min(bounds.maxY - 16, obs.y));
      }

      // Check Collision with Jana
      const effectiveRadius = obs.popping ? obs.popRadius : obs.radius;
      const dx = this.player.x - obs.x;
      const dy = this.player.y - obs.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.player.radius + effectiveRadius) {
        const nx = (dx / (dist || 1));
        const ny = (dy / (dist || 1));

        if (this.isInvincible) {
          // Invincible Power-Up Active: Gently push kids/obstacles aside without losing speed!
          if (obs.subType !== "ice_patch") {
            obs.x -= nx * 24;
            obs.y -= ny * 24;
            obs.vx = -nx * 2.6;
            obs.vy = -ny * 2.6;
            this.spawnParticle(obs.x, obs.y, "💖");
          }
        } else {
          // Standard Obstacle Hit Behavior by Level
          if (levelId === 1) {
            // Wobbly Toddlers & Kids: Brief slide back, loss of momentum & running-in-place animation!
            if (this.player.slipTimer <= 0) {
              window.soundManager.playBump();
              this.player.slipTimer = 0.85;
              this.player.vx = nx * 3.8 - 2.2;
              this.player.vy = ny * 3.2;
              this.player.x += nx * 12;
              this.player.y += ny * 12;
              this.addFloatingText(this.player.x, this.player.y - 28, "⛸️ Whoa! Sliding in place!", "#38bdf8");
            }
          } else if (levelId === 2) {
            if (obs.subType === "juggling_pin") {
              window.soundManager.playConfuse();
              this.player.confuseTimer = 2.4;
              this.obstacles.splice(i, 1);
              this.addFloatingText(this.player.x, this.player.y - 28, "🤹 Confused Controls!", "#facc15");
              continue;
            } else {
              window.soundManager.playBump();
              this.player.slipTimer = 0.65;
              this.player.vx = nx * 4.2 - 2.0;
              this.player.vy = ny * 3.5;
              if (obs.subType === "jester") {
                this.player.confuseTimer = 1.8;
                this.addFloatingText(this.player.x, this.player.y - 28, "🃏 Jester Trick! Controls Flipped!", "#c084fc");
              } else {
                this.addFloatingText(this.player.x, this.player.y - 28, "🛡️ Knight Charge Bump!", "#f87171");
              }
            }
          } else if (levelId === 3) {
            if (obs.subType === "ice_patch") {
              if (this.player.spinTimer <= 0) {
                window.soundManager.playBump();
                this.player.spinTimer = 0.75;
                this.player.vx *= 0.45;
                this.addFloatingText(this.player.x, this.player.y - 28, "🧊 Icy Spin-Out!", "#7dd3fc");
              }
            } else {
              window.soundManager.playBump();
              this.player.slipTimer = 0.65;
              this.player.vx = nx * 3.8 - 1.8;
              this.player.vy = ny * 3.5;
              this.addFloatingText(this.player.x, this.player.y - 28, "⛷️ Oops! Beginner Skier!", "#fb923c");
            }
          } else if (levelId === 4) {
            if (obs.subType === "sprite_can") {
              window.soundManager.playFizzPop();
              obs.popping = true;
              obs.popRadius = 45;
              this.player.slipTimer = 0.65;
              this.player.vx = nx * 4.4 - 2.0;
              this.player.vy = ny * 4.0;
              this.addFloatingText(this.player.x, this.player.y - 28, "🥫 FIZZ BOOM! Exploding Sprite!", "#4ade80");
            } else {
              window.soundManager.playBump();
              this.player.slipTimer = 0.65;
              this.player.vx = nx * 4.0 - 2.0;
              this.player.vy = ny * 3.8;
              this.addFloatingText(this.player.x, this.player.y - 28, "🧹 Salem Witch Sweep!", "#c084fc");
            }
          }
        }
      }
    }
  }

  updateCollectibles(levelId) {
    this.collectibles.forEach(item => {
      if (item.collected) return;
      const dist = Math.hypot(this.player.x - item.x, this.player.y - item.y);
      if (dist < this.player.radius + item.radius + 4) {
        item.collected = true;
        this.score += item.points || 100;

        if (item.isCrown) {
          this.player.hasFlowerCrown = true;
        }
        if (item.fondueKey && this.fondueCollected) {
          this.fondueCollected[item.fondueKey] = true;
        }

        for (let i = 0; i < 8; i++) {
          this.spawnParticle(item.x, item.y, item.icon);
        }

        if (item.isPowerToken) {
          // Direct Power-Up Token touched! Activate immediately!
          this.tryActivatePowerUp(true);
        } else {
          // Standard Collectible gathered (+1 charge toward Spacebar Power-Up)
          this.powerCharges = Math.min(this.maxPowerCharges, this.powerCharges + 1);
          if (this.powerCharges >= this.maxPowerCharges) {
            window.soundManager.playPowerUpReady();
            this.addFloatingText(item.x, item.y - 18, "⚡ PRESS SPACE!", "#fde047");
          } else {
            window.soundManager.playCollectible();
            this.addFloatingText(item.x, item.y - 14, `+${item.points || 100}`, "#fef08a");
          }
        }
      }
    });
  }

  handleGoalReached(levelId) {
    if (levelId === 1) {
      // Level 1 Special Ending: Chloe's Mom snaps several photos of us at the Hot Cocoa Bench!
      this.state = "CUTSCENE";
      this.cutsceneTimer = 2.6;
      this.shutterCount = 0;
      this.player.x = this.goalZone.x - 16;
      this.player.y = this.goalZone.y + 4;
      this.player.vx = 0;
      this.player.vy = 0;
      window.soundManager.playCameraShutter();
      this.cameraFlash = 1.0;
      this.addFloatingText(this.goalZone.x, this.goalZone.y - 68, "📸 Chloe's Mom: 'Smile, you two!'", "#fef08a");
    } else {
      this.openLevelTransitionModal();
    }
  }

  updateCutscene(dt) {
    this.cutsceneTimer -= dt;
    this.cameraFlash = Math.max(0, this.cameraFlash - dt * 2.8);

    // Snap 3 photos with camera shutter flash
    if (this.cutsceneTimer < 1.8 && this.shutterCount === 0) {
      this.shutterCount = 1;
      this.cameraFlash = 1.0;
      window.soundManager.playCameraShutter();
      this.addFloatingText(this.goalZone.x - 10, this.goalZone.y - 55, "📸 *CLICK!* 'One more by the cocoa!'", "#f472b6");
    }
    if (this.cutsceneTimer < 0.9 && this.shutterCount === 1) {
      this.shutterCount = 2;
      this.cameraFlash = 1.0;
      window.soundManager.playCameraShutter();
      this.addFloatingText(this.goalZone.x + 10, this.goalZone.y - 55, "📸 *FLASH!* 'So cute!!'", "#fde047");
    }

    this.updateParticles(dt);

    if (this.cutsceneTimer <= 0) {
      this.openLevelTransitionModal();
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

    // Level-specific showcase inside the transition modal:
    const photoShowcase = document.getElementById("level1PhotoShowcase");
    const sceneBanner = document.getElementById("levelSceneBanner");

    if (levelCfg.id === 1) {
      // Display real photos (or keepsake polaroid illustrations) snapped by Chloe's Mom!
      photoShowcase.classList.remove("hidden");
      sceneBanner.classList.add("hidden");
      this.populatePolaroidGallery("polaroidGrid");
    } else {
      photoShowcase.classList.add("hidden");
      sceneBanner.classList.remove("hidden");
      if (levelCfg.id === 2) {
        sceneBanner.innerHTML = `
          <div class="scene-vignette">
            <div class="vignette-icons">👑 ⚔️ 🧙‍♂️ 🌸 🪕</div>
            <p class="vignette-caption">"By royal decree of the Renaissance Court, Lady Jana & her Black-Caped Warlock are granted safe passage and eternal merriment!"</p>
          </div>`;
      } else if (levelCfg.id === 3) {
        sceneBanner.innerHTML = `
          <div class="scene-vignette">
            <div class="vignette-icons">🍓 🍌 🍡 🍫 ➡️ 🫕 &nbsp;|&nbsp; 📺 🦌💨🦌💨</div>
            <p class="vignette-caption">Inside the warm Ski Lodge: Strawberries, bananas, and marshmallows swirl into warm melted chocolate fondue while the reindeers race across the TV screen!</p>
          </div>`;
      } else {
        sceneBanner.innerHTML = `
          <div class="scene-vignette">
            <div class="vignette-icons">🛝 ⚾ 🧙‍♀️ 🧋 🕯️🥂</div>
            <p class="vignette-caption">From flying down the Boston Cop Slide to clinking glasses at dinner with Julia—all 4 levels complete!</p>
          </div>`;
      }
    }

    document.getElementById("transitionOverlay").classList.remove("hidden");
  }

  populatePolaroidGallery(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    const photos = this.config.level1Photos || [];
    photos.forEach((photo, idx) => {
      const card = document.createElement("div");
      card.className = "polaroid-card";
      card.style.transform = `rotate(${(idx % 2 === 0 ? -2.2 : 2.2)}deg)`;

      const mediaWrap = document.createElement("div");
      mediaWrap.className = "polaroid-media";

      // Create fallback illustrated canvas first, and replace with real <img> if file exists
      const fallbackCanvas = document.createElement("canvas");
      fallbackCanvas.width = 240;
      fallbackCanvas.height = 175;
      this.sprites.renderPolaroidIllustration(fallbackCanvas, photo.sceneType, idx + 1);
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
      tag.textContent = photo.dateTag || `Memory #${idx + 1}`;

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
    document.getElementById("victoryScore").textContent = `Final Journey Score: ${this.score} pts`;

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

    // Highlight mystery stage progress dots
    document.querySelectorAll(".stage-dot").forEach((dot, idx) => {
      dot.classList.toggle("active", idx === this.currentLevelIndex);
      dot.classList.toggle("completed", idx < this.currentLevelIndex);
    });

    // Update Power-Up Charge Meter & Button (No spoilers!)
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

    // Level 3 Subtle Ingredient Icons (no text spoilers)
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

    // 1. Draw Themed Environment & Goal Landmark
    this.sprites.drawEnvironment(ctx, this.width, this.height, levelId, this.time, {
      cameraFlash: this.cameraFlash,
      isCutscene: this.state === "CUTSCENE"
    });

    // 2. Draw Collectibles & Power-Up Tokens
    this.collectibles.forEach(item => {
      if (!item.collected) {
        this.sprites.drawCollectible(ctx, item, this.time);
      }
    });

    // 3. Draw Level Obstacles
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

    // 4. Draw Warlock Magic Spell Shockwave Ring (Level 2)
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

    // 5. Draw Partner Sprite when Holding Hands (Level 1 Power-Up / Cutscene) or Warlock (Level 2 Power-Up)
    if (
      (levelId === 1 && (this.isInvincible || this.state === "CUTSCENE")) ||
      (levelId === 2 && this.isInvincible)
    ) {
      const isWarlock = levelId === 2;
      const partnerX = this.player.x - 24;
      const partnerY = this.player.y - 2;
      this.sprites.drawPartner(ctx, partnerX, partnerY, this.time, isWarlock);

      // Draw linked hands & floating heart when holding hands in Level 1
      if (levelId === 1) {
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💗", this.player.x - 12, this.player.y - 24);
      }
    }

    // 6. Draw Main Player Character: Jana (small girl with black hair and brown eyes)
    this.sprites.drawJana(ctx, this.player.x, this.player.y, {
      levelId,
      vx: this.player.vx,
      vy: this.player.vy,
      time: this.time,
      slipTimer: this.player.slipTimer,
      confuseTimer: this.player.confuseTimer,
      spinAngle: this.player.spinAngle,
      powerUpTimer: this.powerUpTimer,
      hasFlowerCrown: this.player.hasFlowerCrown,
      facing: this.player.facing
    });

    // 7. Draw Active HUD Countdown Dial right above Jana when Power-Up is active
    if (this.powerUpTimer > 0) {
      const ratio = this.powerUpTimer / this.powerUpDuration;
      ctx.save();
      ctx.translate(this.player.x, this.player.y - 38);
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

    // 9. Camera Flash Overlay during Chloe's Mom photo shoot in Level 1
    if (this.cameraFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.cameraFlash * 0.75})`;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }
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
