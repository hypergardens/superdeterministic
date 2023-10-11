
let { lastZone } = require("./gameData");
let { actions } = require("./actions");

let pregenActions = {
  "attack": [actions.attack()],
  "dead": [],
  "win": [actions.win()],
  // if debug zone
  "debug": [
    actions.buyWeapon("Debug Sword", 666, 15),
    actions.buyArmour("Debug Shield", 666, 15),
    actions.hpPendant(),
    actions.hpPotion(),
    actions.takeDamage(7),
    actions.getGold(),
    actions.leave()],
  // shops
  0:
    [
      // actions.travel("Debug Zone", - 1),
      actions.buyWeapon("Wooden Sword", 2, 10),
      actions.buyArmour("Wooden Shield", 1, 10),
      actions.buyArmour("Iridium Shield", 100, 999),
      actions.leave()],
  4:
    [
      actions.buyWeapon("Copper Sword", 3, 15),
      actions.buyArmour("Copper Shield", 2, 15),
      actions.hpPotion(),
      actions.leave()
    ],
  8:
    [
      actions.buyWeapon("Iron Sword", 4, 20),
      actions.buyArmour("Iron Shield", 3, 20),
      actions.hpPotion(),
      actions.hpPendant(),
      actions.leave()
    ],

  12:
    [
      actions.buyWeapon("Silver Sword", 5, 30),
      actions.buyArmour("Silver Shield", 4, 30),
      actions.hpPotion(),
      actions.hpPendant(),
      actions.leave()
    ],
  16:
    [
      actions.buyWeapon("Gold Sword", 6, 40),
      actions.buyArmour("Gold Shield", 5, 40),
      actions.hpPotion(),
      actions.hpPendant(),
      actions.leave()
    ],

  20:
    [
      actions.buyWeapon("Diamond Sword", 7, 50),
      actions.buyArmour("Diamond Shield", 6, 50),
      actions.hpPotion(),
      actions.hpPendant(),
      actions.leave()
    ],

  24:
    [
      actions.buyWeapon("Falchion", 8, 100),
      actions.buyArmour("Diamond Shield", 6, 50),
      actions.hpPotion(),
      actions.hpPendant(),
      actions.leave()
    ],

  28:
    [
      actions.buyWeapon("Falchion", 8, 100),
      actions.buyArmour("Shield of El Cid", 8, 100),
      actions.hpPotion(),
      actions.hpPendant(),
      actions.leave()
    ],

  32:
    [
      actions.buyWeapon("Dagger of Time", 10, 180),
      actions.buyArmour("Shield of El Cid", 8, 100),
      actions.hpPotion("Big Potion", 16, 10),
      actions.hpPendant("Big Pendant", 10, 60),
      actions.leave()
    ],
  36:
    [
      actions.buyWeapon("Dagger of Time", 10, 180),
      actions.buyArmour("Shield of Achilles", 10, 180),
      actions.hpPotion("Big Potion", 16, 10),
      actions.hpPendant("Big Pendant", 10, 60),
      actions.leave()
    ],

  40:
    [
      actions.buyWeapon("Vorpal Sword", 12, 250),
      actions.buyArmour("Shield of Achilles", 10, 180),
      actions.hpPotion("Big Potion", 16, 10),
      actions.hpPendant("Big Pendant", 10, 60),
      actions.leave()
    ],
  44:
    [
      actions.buyWeapon("Vorpal Sword", 12, 250),
      actions.buyArmour("Wynebgwrthucher", 12, 250),
      actions.hpPotion("Big Potion", 16, 10),
      actions.hpPendant("Big Pendant", 10, 60),
      actions.leave()
    ],
  48:
    [
      actions.buyWeapon("Morgul-blade", 14, 400),
      actions.buyArmour("Wynebgwrthucher", 12, 250),
      actions.hpPotion("Mega Potion", 32, 20),
      actions.hpPendant("Mega Pendant", 20, 120),
      actions.leave()
    ],
  52:
    [
      actions.buyWeapon("Morgul-blade", 14, 400),
      actions.buyArmour("Ancile", 14, 400),
      actions.hpPotion("Mega Potion", 32, 20),
      actions.hpPendant("Mega Pendant", 20, 120),
      actions.leave()
    ],
  // post-dragon
  // case 56:
  //   return [
  //     actions.buyWeapon("Excalibur", 16, 600),
  //     actions.buyArmour("Wynebgwrthucher", 12, 250),
  //     actions.hpPotion(),
  //     actions.hpPendant(),
  //     actions.leave()
  //   ];
  //   break;

};

function generateActions(gameState) {
  if (gameState.dead || gameState.won /* || gameState.zone > lastZone */) {
    return pregenActions["dead"];
  } else if (gameState.zone === lastZone) {
    return pregenActions["win"];
  } else if (gameState.zone % 4 === 0) {
    // return shop actions
    return pregenActions[gameState.zone];
  } else {
    // if monster, only attack
    return pregenActions["attack"];
  }
}

module.exports = { generateActions };