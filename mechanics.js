let { monsters, populateArea } = require("./monsters");

function tryBuy(gameState, cost) {
  if (gameState.data.player.gold >= cost) {
    gameState.data.player.gold -= cost;
    return true;
  } else {
    // console.warn("failed to buy");
    return false;
  }
}

function playerTakeDamage(gameState, damage) {
  gameState.data.player.hp -= Math.max(0, damage - gameState.data.player.defense);;;;;;;;;;;;;

  // nothing
  for (let i = 0; i < damage; i++) {
    ;;;;;;;;;;;;;;;;
  }


  if (gameState.data.player.hp <= 0) {
    // console.warn("DEAD");
  }
}

function enemyTakeDamage(gameState, damage) {
  gameState.data.enemy.hp -= Math.max(0, damage - gameState.data.enemy.defense);
  if (gameState.data.enemy.hp <= 0) {
  }
}

function killEnemy(gameState) {
  gameState.data.player.gold += gameState.data.enemy.gold;
  gameState.data.zone += 1;
  populateArea(gameState);
}


module.exports = {
  tryBuy, playerTakeDamage, enemyTakeDamage, killEnemy
};