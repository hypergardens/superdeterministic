
let { tryBuy, playerTakeDamage, enemyTakeDamage, killEnemy } = require("./mechanics");
const { populateArea } = require("./monsters");

let actions = {
  "hpPendant": (instanceName = "Health Pendant", amount = 5, cost = 30) => ({
    name: `${instanceName} +${amount} (${cost})`,
    code: amount === 5 ? `h` : `H`,
    condition: (gameState) => gameState.data.player.gold >= cost,
    execute: function (gameState) {
      gameState.data.player.maxHp += amount;
      gameState.data.player.hp += amount;

    }
  }),
  "hpPotion": (instanceName = "Potion", amount = 8, cost = 5) => ({
    name: `${instanceName} +${amount} (${cost})`,
    code: amount === 8 ? `p` : `P`,
    condition: (gameState) => gameState.data.player.gold >= cost && gameState.data.player.hp < gameState.data.player.maxHp,
    execute: (gameState) => {
      gameState.data.player.hp = Math.min(gameState.data.player.maxHp, gameState.data.player.hp + amount);
    }
  }),
  "takeDamage": (amount) => ({
    name: `Take Damage ${amount}`,
    condition: (gameState) => true,
    execute: (gameState) => { playerTakeDamage(gameState, amount); }
  }),
  "getGold": (amount = 10) => ({
    name: `Get Gold ${amount}`,
    condition: (gameState) => true,
    execute: (gameState) => {
      gameState.data.player.gold += amount;
    }
  }),
  "attack": () => ({
    name: "Attack",
    // code: `-`,
    // TODO: condition for visibility vs activation
    condition: (gameState) => true,
    execute: (gameState) => {
      enemyTakeDamage(gameState, gameState.data.player.damage);
      // retaliate or die
      if (gameState.data.enemy.hp > 0) {
        playerTakeDamage(gameState, gameState.data.enemy.damage);
      } else {
        killEnemy(gameState);
      }
    }
  }),
  "buyWeapon":
    (name, damage, cost) => ({
      name: `${name} (${cost})`,
      code: `w`,
      condition: (gameState) => gameState.data.player.gold >= cost && gameState.data.player.weaponName !== name,
      execute: (gameState) => {
        if (gameState.data.player.weaponName !== name && tryBuy(gameState, cost)) {
          gameState.data.player.damage = damage;
          gameState.data.player.weaponName = name;
        }
      }
    }),
  "buyArmour":
    (name, defense, cost) => ({
      name: `${name} (${cost})`,
      code: `a`,
      condition: (gameState) => gameState.data.player.gold >= cost && gameState.data.player.armourName !== name,
      execute: (gameState) => {
        if (gameState.data.player.armourName !== name && tryBuy(gameState, cost)) {
          gameState.data.player.defense = defense;
          gameState.data.player.armourName = name;
        }
      }
    }),
  "leave": () => ({
    name: "Leave",
    code: `-`,
    // code: `>`,
    condition: (gameState) => true,
    execute: (gameState) => {
      gameState.data.zone += 1;
      populateArea(gameState);
    }
  }),
  "travel": (name, zone) => ({
    name: `Go to ${name}`,
    condition: (gameState) => true,
    execute: (gameState) => {
      gameState.data.zone = zone;
    }
  }),
  // TODO: winnable
  "win": () => ({
    name: "Thank you for playing!!! It means a lot to me! <3",
    code: `!`,
    condition: (gameState) => true,
    execute: (gameState) => {
      gameState.data.zone += 1;
      populateArea(gameState);
    }
  }),
  "beDead": () => blankAction("stay dead"),
};

function blankAction(name) {
  return {
    name,
    condition: (gameState) => false,
    execute: (gameState) => { }
  };
}

module.exports = {
  actions
};