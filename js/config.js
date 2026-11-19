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
      imageSrc: "assets/photos/level1_photo2.jpg",
      caption: "Where it began!",
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
        frictionAir: 0.001,     // Low ice friction for authentic skating inertia
        accel: 0.2,
        maxSpeed: 5.6,
        continuousForward: 0
      },
      completionHeadline: "Level Complete! Chloe's Mom Snapped Our Photos! 📸",
      completionStory: "You crossed the finish line across the indoor ice rink to the Hot Cocoa Bench—and right on cue, Chloe's mom popped out with her camera to capture the sweetest moments!",
      nextButtonText: "Next Level ➡️",
      photos: [
        {
          imageSrc: "assets/photos/level1_photo1.jpg",
          caption: "Our first holiday party together! <3",
          dateTag: "Stage I • Photo 1",
          sceneType: "rink_hug",
          levelId: 1
        },
        {
          imageSrc: "assets/photos/level1_photo2.jpg",
          caption: "Our first flirt-iversary",
          dateTag: "Stage I • Photo 2",
          sceneType: "cocoa_bench",
          levelId: 1
        },
        {
          imageSrc: "assets/photos/level1_photo3.jpg",
          caption: "Smiles from the early pickleball days",
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
          caption: "Wandering the Renaissance Faire grounds together with the OG Squad",
          dateTag: "Stage II • Photo 1",
          sceneType: "ren_crown",
          levelId: 2
        },
        {
          imageSrc: "assets/photos/level2_photo2.jpg",
          caption: "Festival magic, 2026",
          dateTag: "Stage II • Photo 2",
          sceneType: "ren_warlock",
          levelId: 2
        },
        {
          imageSrc: "assets/photos/level2_photo3.jpg",
          caption: "Royal Court returns, this time with a KBBQ Feast afterwards",
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
          caption: "Carving down the snowy mountain runs. Narrowly avoiding the rain",
          dateTag: "Stage III • Photo 1",
          sceneType: "ski_slope",
          levelId: 3
        },
        {
          imageSrc: "assets/photos/level3_photo2.jpg",
          caption: "Best Skiers on the Bunny slope",
          dateTag: "Stage III • Photo 2",
          sceneType: "ski_fondue",
          levelId: 3
        },
        {
          imageSrc: "assets/photos/level3_photo3.jpg",
          caption: "The group getting ready to leave the cabin abode",
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
      completionHeadline: "Level Complete! You made it to dinner with Julia in Boston! 🥂✨",
      completionStory: "After flying down the Cop Slide and dodging Salem witches and fizzing Sprite explosions past Fenway Park and the T, you crossed the finish line for dinner with Julia!",
      nextButtonText: "Next Level ➡️",
      photos: [
        {
          imageSrc: "assets/photos/level4_photo1.jpg",
          caption: "Moments before I teleported from San Diego to Boston",
          dateTag: "Stage IV • Photo 1",
          sceneType: "boston_slide",
          levelId: 4
        },
        {
          imageSrc: "assets/photos/level4_photo2.jpg",
          caption: "Fueled by Tatte lattes to stay awake for our night tour",
          dateTag: "Stage IV • Photo 2",
          sceneType: "boston_tatte",
          levelId: 4
        },
        {
          imageSrc: "assets/photos/level4_photo3.jpg",
          caption: "A cute little hat as the perfect final Boston outfit",
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
      "From wobbling across the ice rink on our first date (and Chloe's mom making sure we had photos to prove it!), to wandering the Renaissance Faire, carving down snowy ski slopes for cozy fondue nights watching reindeer races, and flying down the Boston Cop Slide with Tatte lattes in hand—every single memory with you is my favorite adventure.",
      "Thank you for your laughter, your warmth, your kindness, and for making every day feel like magic. Here is to so many more levels, trips, laughs, and memories together."
    ],
    signature: "With all my love, always ❤️",
    giftReveal: {
      buttonPrompt: "🎁 Click to Unwrap Your Surprise",
      title: "Enjoy this special advent calendar!",
      //subtitle: "Inside I've gathered just a few of your favorite things.",
      details: "✨ Inside I've gathered just a few of your favorite things. ✨\n Open just one gift per day. I hope this energizes you to make it past your current difficult stretch of work! I'm looking forward to spending winter break together, this year and forever. ",
      //footerNote: "(Tip: You can customize this gift card text and add photos anytime in js/config.js!)"
    }
  }
};
