const { lastZone } = require("./gameData");


function isWon(gameState) {
  return gameState.data.zone > lastZone;
}
exports.isWon = isWon;

function isLost(gameState) {
  return gameState.data.player.hp <= 0;
}
exports.isLost = isLost;
