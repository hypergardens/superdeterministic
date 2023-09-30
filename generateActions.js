
let { lastZone } = require("./gameData");
let { actions } = require("./actions");

function generateActions(gameState) {
  if (gameState.player.hp <= 0 || gameState.zone > lastZone) {
    return [actions.beDead()];
  } else if (gameState.zone === -1) {
    // if debug zone
    return [
      actions.buyWeapon("Debug Sword", 666, 15),
      actions.buyArmour("Debug Shield", 666, 15),
      actions.hpPendant(),
      actions.hpPotion(),
      actions.takeDamage(7),
      actions.getGold(),
      actions.leave()];
  } else if (gameState.zone % 4 === 0) {
    // shops
    switch (gameState.zone) {
      case 0:
        return [
          // actions.travel("Debug Zone", - 1),
          actions.buyWeapon("Wooden Sword", 2, 10),
          actions.buyArmour("Wooden Shield", 1, 10),
          // TODO: remove iridium shield as invalid
          actions.buyArmour("Iridium Shield", 100, 999),
          actions.leave()];
        break;
      case 4:
        return [
          actions.buyWeapon("Copper Sword", 3, 15),
          actions.buyArmour("Copper Shield", 2, 15),
          actions.hpPotion(),
          actions.leave()
        ];
        break;
      case 8:
        return [
          actions.buyWeapon("Iron Sword", 4, 20),
          actions.buyArmour("Iron Shield", 3, 20),
          actions.hpPotion(),
          actions.hpPendant(),
          actions.leave()
        ];

        break;
      case 12:
        return [
          actions.buyWeapon("Silver Sword", 5, 30),
          actions.buyArmour("Silver Shield", 4, 30),
          actions.hpPotion(),
          actions.hpPendant(),
          actions.leave()
        ];

        break;
      case 16:
        return [
          actions.buyWeapon("Gold Sword", 6, 40),
          actions.buyArmour("Gold Shield", 5, 40),
          actions.hpPotion(),
          actions.hpPendant(),
          actions.leave()
        ];

        break;

      case 20:
        return [
          actions.buyWeapon("Diamond Sword", 7, 50),
          actions.buyArmour("Diamond Shield", 6, 50),
          actions.hpPotion(),
          actions.hpPendant(),
          actions.leave()
        ];

        break;

      case 24:
        return [
          actions.buyWeapon("Falchion", 8, 100),
          actions.buyArmour("Diamond Shield", 6, 50),
          actions.hpPotion(),
          actions.hpPendant(),
          actions.leave()
        ];

        break;

      case 28:
        return [
          actions.buyWeapon("Falchion", 8, 100),
          actions.buyArmour("Shield of El Cid", 8, 100),
          actions.hpPotion(),
          actions.hpPendant(),
          actions.leave()
        ];
        break;

      case 32:
        return [
          actions.buyWeapon("Dagger of Time", 10, 180),
          actions.buyArmour("Shield of El Cid", 8, 100),
          actions.hpPotion("Big Potion", 16, 10),
          actions.hpPendant("Big Pendant", 10, 60),
          actions.leave()
        ];
        break;
      case 36:
        return [
          actions.buyWeapon("Dagger of Time", 10, 180),
          actions.buyArmour("Shield of Achilles", 10, 180),
          actions.hpPotion("Big Potion", 16, 10),
          actions.hpPendant("Big Pendant", 10, 60),
          actions.leave()
        ];
        break;

      case 40:
        return [
          actions.buyWeapon("Vorpal Sword", 12, 250),
          actions.buyArmour("Shield of Achilles", 10, 180),
          actions.hpPotion("Big Potion", 16, 10),
          actions.hpPendant("Big Pendant", 10, 60),
          actions.leave()
        ];
        break;
      case 44:
        return [
          actions.buyWeapon("Vorpal Sword", 12, 250),
          actions.buyArmour("Wynebgwrthucher", 12, 250),
          actions.hpPotion("Big Potion", 16, 10),
          actions.hpPendant("Big Pendant", 10, 60),
          actions.leave()
        ];
        break;
      case 48:
        return [
          actions.buyWeapon("Morgul-blade", 14, 400),
          actions.buyArmour("Wynebgwrthucher", 12, 250),
          actions.hpPotion("Mega Potion", 32, 20),
          actions.hpPendant("Mega Pendant", 20, 120),
          actions.leave()
        ];
        break;
      case 52:
        return [
          actions.buyWeapon("Morgul-blade", 14, 400),
          actions.buyArmour("Ancile", 14, 400),
          actions.hpPotion("Mega Potion", 32, 20),
          actions.hpPendant("Mega Pendant", 20, 120),
          actions.leave()
        ];
        break;
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

      case lastZone:

        return [
          actions.win()
        ];
        break;
      default:
        break;
    }
  } else {
    // if monster, only attack
    return [actions.attack()];
  }
  return [];
}

module.exports = { generateActions };