
let monsters = {
  // origin: damage, defense, coins, hp
  // name, damage, defense, hp, coins
  // 0: wood shop
  1: makeMonster("Blob", 2, 0, 3, 0),
  2: makeMonster("Blob", 2, 0, 3, 0),
  3: makeMonster("Blob", 2, 0, 3, 20),
  // 4: copper shop
  5: makeMonster("Blob", 2, 0, 3, 0),
  6: makeMonster("Blob", 2, 0, 3, 0),
  7: makeMonster("Angy Blob", 3, 0, 3, 22),
  // 8: iron shop
  9: makeMonster("Goblin", 4, 1, 5, 0),
  10: makeMonster("Goblin", 4, 1, 5, 0),
  11: makeMonster("Angy Goblin", 5, 2, 5, 70),
  // 12: silver shop
  // 13: makeMonster("Angy Goblin", 5, 2, 5, 20),
  // 14: makeMonster("Skeleton", 6, 1, 7, 25),
  // 15: makeMonster("Skeleton", 6, 1, 7, 25),
  13: makeMonster("Goblin", 4, 1, 5, 0),
  14: makeMonster("Goblin", 4, 1, 5, 0),
  15: makeMonster("Angy Goblin", 5, 3, 5, 85),
  // 16: gold shop
  17: makeMonster("Angy Goblin", 5, 3, 5, 0),
  18: makeMonster("Skeleton", 6, 1, 7, 0),
  19: makeMonster("Skeleton", 6, 1, 7, 45),
  // 20: diamond shop
  21: makeMonster("Skeleton", 6, 1, 7, 25),
  22: makeMonster("Skeleton", 6, 1, 7, 25),
  23: makeMonster("Angy Skeleton", 8, 1, 10, 40),
  // 24: falch, dshield
  25: makeMonster("Angy Skeleton", 8, 1, 10, 0),
  26: makeMonster("Angy Skeleton", 8, 1, 10, 0),
  27: makeMonster("Angy Skeleton", 8, 1, 10, 135),
  // 28: falch, el cid
  // TODO: rebalance spiders
  29: makeMonster("Swarm of Spiders", 9, 2, 15, 0),
  30: makeMonster("Swarm of Spiders", 9, 2, 15, 0),
  31: makeMonster("Spider", 10, 5, 25, 125),
  // 32 dtime, el cid
  33: makeMonster("Piske Vampire", 10, 2, 30, 0),
  34: makeMonster("Piske Vampire", 10, 2, 30, 0),
  35: makeMonster("Piske Vampire", 10, 2, 30, 30),
  // 36: dtime, achilles
  37: makeMonster("Swarm of Spiders", 9, 2, 15, 0),
  38: makeMonster("Spider", 10, 5, 25, 0),
  39: makeMonster("Spider", 10, 5, 25, 285),
  // 40: vorpal, achilles
  41: makeMonster("Thing???", 20, 3, 10, 0),
  42: makeMonster("Thing???", 20, 3, 10, 0),
  43: makeMonster("Thing???", 20, 3, 10, 360),
  // 44: vorpal, wynne
  45: makeMonster("Spider", 10, 5, 25, 0),
  46: makeMonster("Spider", 10, 5, 25, 0),
  47: makeMonster("Spider", 10, 5, 25, 450),
  // 48: morgul, wynne
  // TODO: 50% chest/bombs
  49: makeMonster("Bomb", 99, 0, 12, 0),
  50: makeMonster("Bomb", 99, 0, 12, 0),
  51: makeMonster("Chest", 0, 0, 10, 150),
  // 52: morgul, ancile
  53: makeMonster("Burned Corpse", 0, 0, 1, 0),
  54: makeMonster("Scorched Corpse", 0, 0, 1, 0),
  // TODO: rebalance dragon
  55: makeMonster("Dragon", 28, 7, 45, 1300),
  // 56: ???

};

function makeMonster(name, damage, defense, hp, gold) {
  return {
    name, damage, defense, hp, maxHp: hp, gold
  };
}


function populateArea(gameState) {
  // determine what gets placed
  // get a blob
  // TODO: content lists
  gameState.data.enemy = monsters[gameState.data.zone];
}

module.exports = {
  monsters, populateArea
};