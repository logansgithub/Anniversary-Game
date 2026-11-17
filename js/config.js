/**
 * ============================================================================
 * OUR JOURNEY TOGETHER - CUSTOMIZATION & CONFIGURATION FILE
 * ============================================================================
 * Edit this file to personalize names, outfits, real photo paths, memory
 * captions, and the final anniversary message & gift reveal!
 */

window.GAME_CONFIG = {
  title: "Our Journey Together",
  subtitle: "A 4-Level Interactive Anniversary Adventure",
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

  // Level 1 Polaroid Photos (Taken by Chloe's Mom at the Hot Cocoa Bench!)
  // Drop your real photos into assets/photos/ and set imageSrc below.
  // If an image file is missing, the game automatically renders a keepsake illustration!
  level1Photos: [
    {
      imageSrc: "assets/photos/first_date_1.jpg",
      caption: "Skating hand-in-hand under the twinkling rink lights",
      dateTag: "The First Date",
      sceneType: "rink_hug"
    },
    {
      imageSrc: "assets/photos/first_date_2.jpg",
      caption: "Warming up at the Hot Cocoa Bench (Photo credit: Chloe's Mom!)",
      dateTag: "Hot Cocoa Break",
      sceneType: "cocoa_bench"
    },
    {
      imageSrc: "assets/photos/first_date_3.jpg",
      caption: "Big smiles, rosy cheeks, and the beginning of our adventure",
      dateTag: "Where It All Began",
      sceneType: "snowy_selfie"
    }
  ],

  // 4-Level Definitions & Story Moments
  levels: [
    {
      id: 1,
      number: "Level 1",
      title: "The First Date — Ice Skating Rink",
      subtitle: "Navigate the crowded rink to reach the cozy Hot Cocoa Bench!",
      badge: "Winter Wonderland",
      powerUpName: "Hand-in-Hand Shield",
      powerUpIcon: "🤝",
      powerUpHint: "Collect 2 Snowflakes + Press SPACE (or touch your Partner Token) to hold hands & glide past wobbly skaters!",
      collectibleName: "Snowflake Tokens",
      collectibleIcon: "❄️",
      goalName: "Hot Cocoa Bench",
      physics: {
        frictionAir: 0.016,     // Low ice friction for authentic skating inertia
        accel: 0.42,
        maxSpeed: 5.6,
        continuousForward: 0
      },
      completionHeadline: "Chloe's Mom Snapped Our Photos! 📸",
      completionStory: "You made it across the ice rink to the cozy Hot Cocoa Bench! Right on cue, Chloe's mom appeared with her camera to capture the sweetest moments from our very first chapter.",
      nextButtonText: "Travel to Level 2: Renaissance Faire 🏰"
    },
    {
      id: 2,
      number: "Level 2",
      title: "The Outdoor Adventure — Renaissance Faire",
      subtitle: "Journey through the medieval festival to reach the Royal Court Stage!",
      badge: "Huzzah! Medieval Festival",
      powerUpName: "Warlock's Knightly Valor",
      powerUpIcon: "🍗",
      powerUpHint: "Collect 2 Faire Favors + Press SPACE (or grab a Turkey Leg / Royal Mead) to summon the Black-Caped Warlock's obstacle-banishing spell!",
      collectibleName: "Bard Favors & Flower Crowns",
      collectibleIcon: "🌸",
      goalName: "Royal Court Stage",
      physics: {
        frictionAir: 0.055,     // Earthy cobblestone & meadow footing
        accel: 0.56,
        maxSpeed: 5.4,
        continuousForward: 0
      },
      completionHeadline: "The King's Royal Blessing! 👑",
      completionStory: "With flower crowns braided, bard lutes strumming, and a black-caped warlock clearing the way with arcane magic, you stood before the Royal Court and received the King's blessing!",
      nextButtonText: "Head to Level 3: Winter Ski Trip ⛷️"
    },
    {
      id: 3,
      number: "Level 3",
      title: "The Winter Getaway — Ski Trip",
      subtitle: "Slalom down the snowy mountain & gather fondue ingredients before the Ski Lodge!",
      badge: "Alpine Slalom",
      powerUpName: "Hot Cocoa Thermal Boost",
      powerUpIcon: "☕",
      powerUpHint: "Collect 2 Fondue Treats + Press SPACE (or grab a Hot Cocoa Mug) for a warming speed burst that glides right over icy spin-out patches!",
      collectibleName: "Fondue Ingredients",
      collectibleIcon: "🍓",
      goalName: "Warm Ski Lodge",
      physics: {
        frictionAir: 0.024,     // Carving down fresh alpine powder
        accel: 0.48,
        maxSpeed: 6.2,
        continuousForward: 0.11 // Gentle downhill gravity slope pull
      },
      completionHeadline: "Fondue Night & Reindeer Racing! 🍫🦌",
      completionStory: "You carved down the mountain into the warm Ski Lodge! Inside, the strawberries, bananas, and marshmallows are dipping into bubbling melted chocolate while the reindeers race neck-and-neck on the lodge TV!",
      nextButtonText: "Launch into Level 4: Boston Promenade 🛝"
    },
    {
      id: 4,
      number: "Level 4",
      title: "The Grand Celebration — Boston Promenade",
      subtitle: "Launch down the Cop Slide and keep your momentum past Fenway, Salem & the Freedom Trail to meet Julia for dinner!",
      badge: "Boston High-Speed Run",
      powerUpName: "Tatte Latte Espresso Rush",
      powerUpIcon: "🧋",
      powerUpHint: "Continuous Cop Slide momentum active! Collect 2 Hearts/Balloons + Press SPACE (or grab a Tatte Latte) to zoom past Salem Witches & exploding Sprites!",
      collectibleName: "Gold Hearts & Balloons",
      collectibleIcon: "🎈",
      goalName: "Dinner with Julia",
      physics: {
        frictionAir: 0.022,
        accel: 0.52,
        maxSpeed: 7.0,
        continuousForward: 0.23 // High-speed Cop Slide continuous forward momentum!
      },
      completionHeadline: "Dinner with Julia in Boston! 🥂✨",
      completionStory: "After flying down the iconic Cop Slide, dodging Salem witches and fizzing Sprite explosions past Fenway Park and the MFA, you made it to dinner with Julia to celebrate!",
      nextButtonText: "Unlock Your Anniversary Surprise 💝"
    }
  ],

  // Final Victory Screen & Gift Reveal Customization
  finale: {
    headline: "Happy Anniversary, Jana! 💖",
    subheadline: "Every level of life is better because I get to play it hand-in-hand with you.",
    letterParagraphs: [
      "From wobbling across the ice rink on our first date (and Chloe's mom making sure we had photos to prove it!), to wandering the Renaissance Faire with flower crowns and warlock spells, carving down snowy ski slopes for cozy fondue nights watching reindeer races, and flying down the Boston Cop Slide with Tatte lattes in hand—every single memory with you is my favorite adventure.",
      "Thank you for your laughter, your warmth, your kindness, and for making every day feel like magic. Here is to so many more levels, trips, laughs, and memories together."
    ],
    signature: "With all my love, always ❤️",
    giftReveal: {
      buttonPrompt: "🎁 Click to Unwrap Your Anniversary Gift Reveal",
      title: "Your Anniversary Surprise Awaits!",
      subtitle: "Pack your bags & get ready for our next chapter together...",
      details: "✨ Special Anniversary Dinner & Weekend Getaway Pass ✨\nRedeemable anytime for cozy hot cocoa, Tatte lattes, fondue for two, and a brand new adventure of your choice!",
      footerNote: "(Tip: You can customize this gift card text and add photos anytime in js/config.js!)"
    }
  }
};
