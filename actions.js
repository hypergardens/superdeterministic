
let { tryBuy, playerTakeDamage, enemyTakeDamage, killEnemy } = require("./mechanics");
const { populateArea } = require("./monsters");

let actions = {
  "hpPendant": (instanceName = "Health Pendant", amount = 5, cost = 30) => ({
    name: `${instanceName} +${amount} (${cost})`,
    code: amount === 5 ? `h` : `H`,
    condition: (gameState) => gameState.player.gold >= cost,
    execute: function (gameState) {
      if (tryBuy(gameState, cost)) {
        gameState.player.maxHp += amount;
        gameState.player.hp += amount;
      }
    }
  }),
  "hpPotion": (instanceName = "Potion", amount = 8, cost = 5) => ({
    name: `${instanceName} +${amount} (${cost})`,
    code: amount === 8 ? `p` : `P`,
    condition: (gameState) => gameState.player.gold >= cost && gameState.player.hp < gameState.player.maxHp,
    execute: (gameState) => {
      if (gameState.player.hp < gameState.player.maxHp && tryBuy(gameState, cost)) {
        gameState.player.hp = Math.min(gameState.player.maxHp, gameState.player.hp + amount);
      }
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
      gameState.player.gold += amount;
    }
  }),
  "attack": () => ({
    name: "Attack",
    // code: `-`,
    // TODO: condition for visibility vs activation
    condition: (gameState) => true,
    execute: (gameState) => {
      enemyTakeDamage(gameState, gameState.player.damage);
      // retaliate or die
      if (gameState.enemy.hp > 0) {
        playerTakeDamage(gameState, gameState.enemy.damage);
      } else {
        killEnemy(gameState);
      }
    }
  }),
  "buyWeapon":
    (name, damage, cost) => ({
      name: `${name} (${cost})`,
      code: `w`,
      condition: (gameState) => gameState.player.gold >= cost && gameState.player.weaponName !== name,
      execute: (gameState) => {
        if (gameState.player.weaponName !== name && tryBuy(gameState, cost)) {
          gameState.player.damage = damage;
          gameState.player.weaponName = name;
        }
      }
    }),
  "buyArmour":
    (name, defense, cost) => ({
      name: `${name} (${cost})`,
      code: `a`,
      condition: (gameState) => gameState.player.gold >= cost && gameState.player.armourName !== name,
      execute: (gameState) => {
        if (gameState.player.armourName !== name && tryBuy(gameState, cost)) {
          gameState.player.defense = defense;
          gameState.player.armourName = name;
        }
      }
    }),
  "leave": () => ({
    name: "Leave",
    code: `-`,
    // code: `>`,
    condition: (gameState) => true,
    execute: (gameState) => {
      gameState.zone += 1;
      populateArea(gameState);
    }
  }),
  "travel": (name, zone) => ({
    name: `Go to ${name}`,
    condition: (gameState) => true,
    execute: (gameState) => {
      gameState.zone = zone;
    }
  }),
  // TODO: winnable
  "win": () => ({
    name: "Thank you for playing!!! It means a lot to me! <3",
    code: `!`,
    condition: (gameState) => true,
    execute: (gameState) => {
      gameState.zone += 1;
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