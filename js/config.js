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
    scale: 1.85                 // ~2x larger detailed player sprite
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

  // Finale Photo Highlights (Displayed on the final Victory screen)
  level1Photos: [
    {
      imageSrc: "assets/photos/level1_photo1.jpg",
      caption: "Skating hand-in-hand on our first date",
      dateTag: "Stage I",
      sceneType: "rink_hug",
      levelId: 1
    },
    {
      imageSrc: "assets/photos/level2_photo1.jpg",
      caption: "Renaissance Faire adventures together",
      dateTag: "Stage II",
      sceneType: "ren_crown",
      levelId: 2
    },
    {
      imageSrc: "assets/photos/level3_photo1.jpg",
      caption: "Winter ski trip & cozy fondue night",
      dateTag: "Stage III",
      sceneType: "ski_slope",
      levelId: 3
    },
    {
      imageSrc: "assets/photos/level4_photo1.jpg",
      caption: "Celebrating together in Boston",
      dateTag: "Stage IV",
      sceneType: "boston_slide",
      levelId: 4
    }
  ],

  // 4-Level Physics & Post-Level Reveal Definitions (Hidden until completed!)
  // Drop your 3 personal photos for each level into assets/photos/ (e.g. level1_photo1.jpg .. level4_photo3.jpg)
  // or edit the imageSrc paths below!
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
      completionHeadline: "Level Complete! Chloe's Mom Snapped Our Photos! 📸",
      completionStory: "You crossed the finish line across the indoor ice rink to the Hot Cocoa Bench—and right on cue, Chloe's mom popped out with her camera to capture the sweetest moments!",
      nextButtonText: "Next Level ➡️",
      photos: [
        {
          imageSrc: "assets/photos/level1_photo1.jpg",
          caption: "Skating hand-in-hand at the indoor ice rink",
          dateTag: "Stage I • Photo 1",
          sceneType: "rink_hug",
          levelId: 1
        },
        {
          imageSrc: "assets/photos/level1_photo2.jpg",
          caption: "Warming up at the Hot Cocoa Bench (Photo by Chloe's Mom!)",
          dateTag: "Stage I • Photo 2",
          sceneType: "cocoa_bench",
          levelId: 1
        },
        {
          imageSrc: "assets/photos/level1_photo3.jpg",
          caption: "Big smiles and the beginning of our adventure",
          dateTag: "Stage I • Photo 3",
          sceneType: "snowy_selfie",
          levelId: 1
        }
      ]
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
      completionHeadline: "Level Complete! The King's Royal Blessing! 👑",
      completionStory: "With flower crowns braided, bard lutes strumming, and a black-caped warlock clearing the way with arcane magic, you crossed the finish line into the Royal Court and received the King's blessing!",
      nextButtonText: "Next Level ➡️",
      photos: [
        {
          imageSrc: "assets/photos/level2_photo1.jpg",
          caption: "Wandering the Renaissance Faire grounds together",
          dateTag: "Stage II • Photo 1",
          sceneType: "ren_crown",
          levelId: 2
        },
        {
          imageSrc: "assets/photos/level2_photo2.jpg",
          caption: "Flower crowns, turkey legs, and festival magic",
          dateTag: "Stage II • Photo 2",
          sceneType: "ren_warlock",
          levelId: 2
        },
        {
          imageSrc: "assets/photos/level2_photo3.jpg",
          caption: "Cheering at the Royal Court stage",
          dateTag: "Stage II • Photo 3",
          sceneType: "ren_court",
          levelId: 2
        }
      ]
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
      completionHeadline: "Level Complete! Fondue Night & Reindeer Racing! 🍫🦌",
      completionStory: "You crossed the finish line into the warm Ski Lodge! Inside, the strawberries, bananas, and marshmallows are dipping into bubbling melted chocolate while the reindeers race neck-and-neck on the lodge TV!",
      nextButtonText: "Next Level ➡️",
      photos: [
        {
          imageSrc: "assets/photos/level3_photo1.jpg",
          caption: "Carving down the snowy mountain slopes",
          dateTag: "Stage III • Photo 1",
          sceneType: "ski_slope",
          levelId: 3
        },
        {
          imageSrc: "assets/photos/level3_photo2.jpg",
          caption: "Cozy chocolate fondue with strawberries, bananas & marshmallows",
          dateTag: "Stage III • Photo 2",
          sceneType: "ski_fondue",
          levelId: 3
        },
        {
          imageSrc: "assets/photos/level3_photo3.jpg",
          caption: "Warming up in the Ski Lodge watching reindeer races",
          dateTag: "Stage III • Photo 3",
          sceneType: "ski_lodge",
          levelId: 3
        }
      ]
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
      completionHeadline: "Level Complete! Dinner with Julia in Boston! 🥂✨",
      completionStory: "After flying down the Cop Slide and dodging Salem witches and fizzing Sprite explosions past Fenway Park and the MFA, you crossed the finish line for dinner with Julia!",
      nextButtonText: "Next Level ➡️",
      photos: [
        {
          imageSrc: "assets/photos/level4_photo1.jpg",
          caption: "Exploring Boston, Fenway, Salem & the Cop Slide",
          dateTag: "Stage IV • Photo 1",
          sceneType: "boston_slide",
          levelId: 4
        },
        {
          imageSrc: "assets/photos/level4_photo2.jpg",
          caption: "Fueled by Tatte lattes along the Freedom Trail",
          dateTag: "Stage IV • Photo 2",
          sceneType: "boston_tatte",
          levelId: 4
        },
        {
          imageSrc: "assets/photos/level4_photo3.jpg",
          caption: "Celebrating over dinner in Boston with Julia",
          dateTag: "Stage IV • Photo 3",
          sceneType: "boston_dinner",
          levelId: 4
        }
      ]
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
