const fs = require('fs');

var hash = require('object-hash');
const { SimpleSearchPool } = require('../simplePool');
const { cloneState } = require('../core/simulation');
const { lastZone } = require('../core/gameData');
const { isWon, } = require('../core/info');
const { MonteCarloSimulation } = require('./MonteCarloSimulation');
const { Node } = require('./Node');
console.log("hello world");

// there's always friction at first
// nekromantik design
let gameState = {
  meta: {
    numberPath: [],
    actionPath: [],
    codePath: [],
    won: false,
    dead: false,
  },
  data: {
    zone: 0,
    player: {
      damage: 1,
      defense: 0,
      maxHp: 10,
      hp: 10,
      gold: 20,
      weaponName: 'none',
      armourName: 'none',
    },
    enemy: {},
  }
};


let explored = 0;
let totalExplored = 0;
let totalStartTime = process.hrtime();
let manualMode = false;

function displayState(gameState) {
  return (isWon(gameState) ? "👑" : "💀") + ` Zone ${gameState.data.zone}, ${gameState.data.player.damage} 🗡️, ${gameState.data.player.defense} 🛡️, ${gameState.data.player.hp}/${gameState.data.player.maxHp} ❤️, ${gameState.data.player.gold} 🪙`;
}

function tagRun(gameState) {
  return "\n " + (isWon(gameState) ? "👑" : (gameState.meta.dead ? "💀" : "?")) + gameState.meta.codePath.join("") + ` Zone ${gameState.data.zone}, ${gameState.data.player.damage} 🗡️, ${gameState.data.player.defense} 🛡️, ${gameState.data.player.hp}/${gameState.data.player.maxHp} ❤️, ${gameState.data.player.gold} 🪙`;
}

let flatUnexploredStates = new SimpleSearchPool();
flatUnexploredStates.addStates([gameState]);

/////////////////////////////////////////////////////// async explore




function customBucket(state) {
  // return Math.floor((state.player.damage + state.player.defense) / 5);
  // return state.player.maxHp;
  // return state.enemy && state.enemy.hp !== undefined ? -state.enemy.hp : x;
  return -state.zone;
  // return Math.floor(state.zone / 5);
  // return `${state.zone}: ${state.player.hp}h`;
  // return `${state.zone}: ${state.player.hp}h ${state.player.damage}a ${state.player.defense}d ${state.player.gold}g`;
}


////////////////////////////////////// MCTS

function confidence(node, child) {
  let priorScore = Math.sqrt(node.visitCount / (child.visitCount + 1));
  // let exploitation = node.reward / node.visitCount;
  let valueScore = (child.visitCount > 0) ? child.reward / child.visitCount : 0;
  let exploitConstant = 50;
  return priorScore * child.prior + exploitConstant * valueScore;
}
exports.confidence = confidence;
exports.Node = Node;

////////////////////////////// MCTS
async function main() {
  // while (true) {
  // await asyncNextPool();
  console.time("simulation");
  let simulation = new MonteCarloSimulation(gameState);
  simulation.runSim();
  console.timeEnd("simulation");

  console.log(simulation.runStats);
  // }
}

main();
// best run
// autoRun([0, 3, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 2, 3, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);;