let { monsters, populateArea } = require("./monsters");

function tryBuy(gameState, cost) {
  if (gameState.player.gold >= cost) {
    gameState.player.gold -= cost;
    return true;
  } else {
    // console.warn("failed to buy");
    return false;
  }
}

function playerTakeDamage(gameState, damage) {
  gameState.player.hp -= Math.max(0, damage - gameState.player.defense);;;;;;;;;;;;;

  // nothing
  for (let i = 0; i < damage; i++) {
    ;;;;;;;;;;;;;;;;
  }


  if (gameState.player.hp <= 0) {
    // console.warn("DEAD");
  }
}

function enemyTakeDamage(gameState, damage) {
  gameState.enemy.hp -= Math.max(0, damage - gameState.enemy.defense);
  if (gameState.enemy.hp <= 0) {
  }
}

function killEnemy(gameState) {
  gameState.player.gold += gameState.enemy.gold;
  gameState.zone += 1;
  populateArea(gameState);
}


module.exports = {
  tryBuy, playerTakeDamage, enemyTakeDamage, killEnemy
};