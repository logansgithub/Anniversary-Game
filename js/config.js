/**
 * ============================================================================
 * OUR JOURNEY TOGETHER - CUSTOMIZATION & CONFIGURATION FILE
 * ============================================================================
 * Edit this file to personalize names, outfits, real photo paths, memory
 * captions, and the final anniversary message & gift reveal!
 *
 * NOTE: Level titles, goals, and future chapters are intentionally kept
 * hidden during gameplay so every stage & ending is a surprise for the player!
 */

window.GAME_CONFIG = {
  title: "Our Journey Together",
  subtitle: "A Mystery Interactive Adventure",
  coupleNames: "Jana & Logan",

  // Main Player Profile (Jana: small girl with black hair and brown eyes)
  player: {
    name: "Jana",
    hairColor: "#18141c",       // Black hair
    hairHighlight: "#332b3d",
    eyeColor: "#5c3824",        // Brown eyes
    skinTone: "#fad7c0",
    blushColor: "#f4979c",
    scale: 0.92                 // Petite / small stature
  },

  // Partner Profile (Appears in Level 1 Hand-in-Hand, Level 2 Warlock, Cutscenes)
  partner: {
    name: "Logan",
    hairColor: "#3b2718",
    eyeColor: "#3d5a45",
    skinTone: "#f5cdb4",
    jacketColor: "#3b82f6",
    warlockCapeColor: "#14101f",
    warlockTrimColor: "#a855f7"
  },

  // Universal Power-Up Lifecycle Settings
  powerUp: {
    collectiblesRequired: 2,    // Gather 2 collectibles to charge Spacebar Power-Up
    durationSeconds: 5.0        // 5-second active aura + HUD countdown dial
  },

  // Optional external sprite overrides (drop PNGs into /assets/sprites/ to override procedural art)
  assetPaths: {
    sprites: {
      jana_player: "assets/sprites/jana_player.png",
      partner_skater: "assets/sprites/partner_skater.png",
      kids_obstacle: "assets/sprites/kids_obstacle.png",
      knights_jesters_obstacle: "assets/sprites/knights_jesters_obstacle.png",
      skiers_ice_obstacle: "assets/sprites/skiers_ice_obstacle.png",
      witches_sprite_obstacle: "assets/sprites/witches_sprite_obstacle.png",
      powerup_holding_hands: "assets/sprites/powerup_holding_hands.png",
      powerup_turkey_leg_mead: "assets/sprites/powerup_turkey_leg_mead.png",
      powerup_hot_cocoa: "assets/sprites/powerup_hot_cocoa.png",
      powerup_tatte_latte: "assets/sprites/powerup_tatte_latte.png",
      bg_ice_rink: "assets/sprites/bg_ice_rink.png",
      bg_ren_faire: "assets/sprites/bg_ren_faire.png",
      bg_ski_slopes: "assets/sprites/bg_ski_slopes.png",
      bg_boston_promenade: "assets/sprites/bg_boston_promenade.png"
    },
    audio: {
      bgm: "assets/audio/chiptune_romantic_bgm.mp3",
      powerup: "assets/audio/powerup_pickup.wav",
      levelComplete: "assets/audio/level_complete.wav"
    }
  },

  // Level 1 Polaroid Photos (Taken by Chloe's Mom when Jana reaches the bench!)
  // Drop your real photos into assets/photos/ and set imageSrc below.
  // If an image file is missing, the game automatically renders a keepsake illustration!
  level1Photos: [
    {
      imageSrc: "assets/photos/first_date_1.jpg",
      caption: "Skating hand-in-hand under the twinkling lights",
      dateTag: "Memory I",
      sceneType: "rink_hug"
    },
    {
      imageSrc: "assets/photos/first_date_2.jpg",
      caption: "Warming up with hot cocoa (Photo credit: Chloe's Mom!)",
      dateTag: "Memory II",
      sceneType: "cocoa_bench"
    },
    {
      imageSrc: "assets/photos/first_date_3.jpg",
      caption: "Big smiles, rosy cheeks, and the beginning of our adventure",
      dateTag: "Memory III",
      sceneType: "snowy_selfie"
    }
  ],

  // 4-Level Physics & Post-Level Reveal Definitions (Hidden until completed!)
  levels: [
    {
      id: 1,
      number: "Stage I",
      powerUpIcon: "✨",
      collectibleIcon: "❄️",
      physics: {
        frictionAir: 0.016,     // Low ice friction for authentic skating inertia
        accel: 0.42,
        maxSpeed: 5.6,
        continuousForward: 0
      },
      completionHeadline: "Surprise! Chloe's Mom Snapped Our Photos! 📸",
      completionStory: "You made it across the ice rink to the Hot Cocoa Bench—and right on cue, Chloe's mom popped out with her camera to capture the sweetest moments!",
      nextButtonText: "Continue to Next Stage ➡️"
    },
    {
      id: 2,
      number: "Stage II",
      powerUpIcon: "✨",
      collectibleIcon: "🌸",
      physics: {
        frictionAir: 0.055,     // Earthy festival footing
        accel: 0.56,
        maxSpeed: 5.4,
        continuousForward: 0
      },
      completionHeadline: "The King's Royal Blessing! 👑",
      completionStory: "With flower crowns braided, bard lutes strumming, and a black-caped warlock clearing the way with arcane magic, you reached the Royal Court and received the King's blessing!",
      nextButtonText: "Continue to Next Stage ➡️"
    },
    {
      id: 3,
      number: "Stage III",
      powerUpIcon: "✨",
      collectibleIcon: "🍓",
      physics: {
        frictionAir: 0.024,     // Carving down fresh alpine powder
        accel: 0.48,
        maxSpeed: 6.2,
        continuousForward: 0.11 // Gentle downhill slope pull
      },
      completionHeadline: "Fondue Night & Reindeer Racing! 🍫🦌",
      completionStory: "You carved down the mountain into the warm Ski Lodge! Inside, the strawberries, bananas, and marshmallows are dipping into bubbling melted chocolate while the reindeers race neck-and-neck on the lodge TV!",
      nextButtonText: "Continue to Final Stage ➡️"
    },
    {
      id: 4,
      number: "Stage IV",
      powerUpIcon: "✨",
      collectibleIcon: "💛",
      physics: {
        frictionAir: 0.022,
        accel: 0.52,
        maxSpeed: 7.0,
        continuousForward: 0.23 // High-speed Cop Slide continuous forward momentum!
      },
      completionHeadline: "Dinner with Julia in Boston! 🥂✨",
      completionStory: "After flying down the Cop Slide and dodging Salem witches and fizzing Sprite explosions past Fenway Park and the MFA, you made it to dinner with Julia!",
      nextButtonText: "See What's Waiting... 💝"
    }
  ],

  // Final Victory Screen & Gift Reveal Customization (Only shown after beating all 4 stages)
  finale: {
    headline: "Happy Anniversary, Jana! 💖",
    subheadline: "Every level of life is better because I get to play it hand-in-hand with you.",
    letterParagraphs: [
      "From wobbling across the ice rink on our first date (and Chloe's mom making sure we had photos to prove it!), to wandering the Renaissance Faire with flower crowns and warlock spells, carving down snowy ski slopes for cozy fondue nights watching reindeer races, and flying down the Boston Cop Slide with Tatte lattes in hand—every single memory with you is my favorite adventure.",
      "Thank you for your laughter, your warmth, your kindness, and for making every day feel like magic. Here is to so many more levels, trips, laughs, and memories together."
    ],
    signature: "With all my love, always ❤️",
    giftReveal: {
      buttonPrompt: "🎁 Click to Unwrap Your Surprise",
      title: "Your Anniversary Surprise Awaits!",
      subtitle: "Pack your bags & get ready for our next chapter together...",
      details: "✨ Special Anniversary Dinner & Weekend Getaway Pass ✨\nRedeemable anytime for cozy hot cocoa, Tatte lattes, fondue for two, and a brand new adventure of your choice!",
      footerNote: "(Tip: You can customize this gift card text and add photos anytime in js/config.js!)"
    }
  }
};
