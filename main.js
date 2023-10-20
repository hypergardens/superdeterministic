const fs = require('fs');

const { format } = require("./library");
const { generateActions } = require("./generateActions");
const { lastZone } = require("./gameData");
const { FlatSearchPool, bucketAnalysis } = require('./old/searchPool');
var hash = require('object-hash');
const { SimpleSearchPool } = require('./simplePool');

function scoreState(state) {
  // play around, make your own scores!

  return state.zone;
  // return -state.numberPath.length;
  // return state.gold;
  // return state.player.defense * state.player.damage;

  // if (!state.won) {
  //   return state.zone + state.player.damage / 1000;
  // } else {
  //   return 100 + state.player.gold / 10000;
  // }
}

function customHash(gameState) {
  // return hash(gameState);
  // return `${gameState.zone};` +
  //   `${gameState.player.damage};${gameState.player.defense};${gameState.player.maxHp};${gameState.player.hp};${gameState.player.gold};` +
  //   (gameState.zone % 4 === 0 ? "" : `${gameState.enemy.name};${gameState.enemy.damage};${gameState.enemy.defense};${gameState.enemy.hp};${gameState.enemy.maxHp};${gameState.enemy.gold};`);
  return JSON.stringify(gameState);
  // return "test";
}

console.log("hello world");

// there's always friction at first
// nekromantik design
let gameState = {

  numberPath: [],
  actionPath: [],
  codePath: [],
  zone: 0,
  won: false,
  dead: false,
  player: {
    damage: 1,
    defense: 0,
    maxHp: 10,
    hp: 10,
    gold: 20,
    weaponName: 'none',
    armourName: 'none',
  },

  // enemy
  enemy: {},
};

let runStats = {
  dead: 0,
  won: 0,
  uniqueHashes: 0,
  dupeHashes: 0
};

let hashRecord = {};

let explored = 0;
let totalExplored = 0;
let totalStartTime = process.hrtime();
let poolsExplored = 0;
let maxPoolsExplored = 150;
let manualMode = false;

function cloneState(state, full = true) {
  // TODO: clean this up
  let newState = {};
  full && (newState.numberPath = [...state.numberPath]);
  full && (newState.actionPath = [...state.actionPath]);
  full && (newState.codePath = [...state.codePath]);
  newState.zone = state.zone;
  newState.won = state.won;
  newState.dead = state.dead;
  // newState.player = { ...state.player };
  newState.player = Object.assign({}, state.player);
  // newState.enemy = { ...state.enemy };
  newState.enemy = Object.assign({}, state.enemy);
  return newState;
}

function displayState(gameState) {
  return (gameState.won ? "👑" : "💀") + ` Zone ${gameState.zone}, ${gameState.player.damage} 🗡️, ${gameState.player.defense} 🛡️, ${gameState.player.hp}/${gameState.player.maxHp} ❤️, ${gameState.player.gold} 🪙`;
}

function tagRun(gameState) {
  return "\n " + (gameState.won ? "👑" : (gameState.dead ? "💀" : "?")) + gameState.codePath.join("") + ` Zone ${gameState.zone}, ${gameState.player.damage} 🗡️, ${gameState.player.defense} 🛡️, ${gameState.player.hp}/${gameState.player.maxHp} ❤️, ${gameState.player.gold} 🪙`;
}

let flatUnexploredStates = new SimpleSearchPool();
flatUnexploredStates.addStates([gameState]);

function takeAction(gameState, action, idx) {
  if (action.condition(gameState)) {
    // console.log(`action taken: ${idx} ${action.name}`);
    gameState.numberPath.push(idx);
    // mark code path for visualisation
    if (action.code) {
      gameState.codePath.push(action.code);
    }
    action.execute(gameState);

    // TODO: decide if the state is won or dead and where
    gameState.won = gameState.zone > lastZone;
    gameState.dead = gameState.player.hp <= 0;
  } else {
    console.error(`action invalid ${idx}`);
  }
}

function takeActionByNumber(gameState, actions, idx) {
  if (actions.length > idx) {
    takeAction(gameState, actions[idx], idx);
  } else {
    console.error(`action out of range: ${idx}`);
  }
}


function getChildStates(gameState) {
  // get possible actions
  let visibleActions = generateActions(gameState);
  // console.log(visibleActions);
  let childStates = [];
  // if (zone === lastZone) {
  //   console.log("last zone");
  // }
  let possibleActions = visibleActions.filter(action => action.condition(gameState));
  for (let action of possibleActions) {
    // consider the action
    let idx = visibleActions.indexOf(action);
    // clone the state
    let childState = cloneState(gameState);
    // execute new action
    // childState.numberPath.push(idx);
    // action.execute(childState);
    takeAction(childState, action, idx);
    // add to children
    childStates.push(childState);
  };
  return childStates;
}
function exploreState(gameState, hashRecord) {
  // mark this state as explored
  // record runs
  if (gameState.won || gameState.dead) {

    // exploredStatesMin[gameState.numberPath.join("")] = minClone;
    if (gameState.won) {
      runStats.won += 1;
    }
    if (gameState.dead) {
      runStats.dead += 1;
    }
    // return;
  }

  // mark with hash
  let minClone = cloneState(gameState, false);
  let hash = customHash(minClone);
  // console.log(hash);
  if (hashRecord[hash]) {
    // different states, same hash
    // if (JSON.stringify(hashRecord[hash].state) !== JSON.stringify(minClone)) {
    //   console.warn(`HASH COLLISION`);

    //   fs.writeFileSync(`./ERROR.log`, `HASH COLLISION at ${JSON.stringify(minClone)}`);
    // } else {
    runStats.dupeHashes++;
    hashRecord[hash].count += 1;
    // }
    return [];
  } else {
    // hashRecord[hash] = { count: 1, state: minClone, path: gameState.numberPath };
    hashRecord[hash] = { count: 1 };
    runStats.uniqueHashes++;
    return getChildStates(gameState);
  }
}

function autoRun(numberPath) {
  console.log("running");

  console.log(numberPath);
  for (let choice of numberPath) {
    takeActionByNumber(choice);
  }
}
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

async function asyncNextPool() {
  // Simulate an asynchronous operation (e.g., fetching data)

  flatUnexploredStates.sort((state) => state.zone);
  // let nextState = flatUnexploredStates.pool.shift();
  // let upcoming = [nextState];
  let upcoming = flatUnexploredStates.nextPool(customBucket);
  console.log(`Fringe: ${format(upcoming.length)}`);
  console.log(`Explored: ${format(totalExplored)}`);
  console.log(tagRun(upcoming[0]));
  // let analysis = bucketAnalysis(upcoming, (state) => (state.zone)).bucketAnalysis;
  // console.log(analysis);
  for (let state of upcoming) {
    flatUnexploredStates.addStates(exploreState(state, hashRecord));
    // if (state.won) {
    //   throw new Error("Won");
    // }
  }

  totalExplored += upcoming.length;
  let endTime = process.hrtime(totalStartTime);
  let millis = (endTime[0] * 1e3 + endTime[1] / 1e6);
  let speed = totalExplored / millis * 1000;


  console.log("-----------------------------------");
  //   // console.log(displayState(gameState));
  //   // console.timeEnd("Duration");
  //   // console.log(`Stage: ${hashBucket}, time ${millis.toFixed(0)}, states ${explored}`);
  console.log(`States/second: ${format(speed)}`);
  //   console.log(`${(format(process.memoryUsage().rss))}B memory used`);
  //   // console.log(`${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB heapUsed`);
  //   // console.log(`${(process.memoryUsage().heapTotal / 1000000).toFixed(2)} MB heapTotal`);
  console.log(`${format(totalExplored)} explored, ${format(flatUnexploredStates.getStates().length)} unexplored states.` +
    `Won: ${format(runStats.won)}, Dead: ${format(runStats.dead)}`);
  console.log(`duplicates: ${format(runStats.dupeHashes)}, uniqueHashes: ${format(runStats.uniqueHashes)}, collision%: ${format(runStats.dupeHashes / (runStats.uniqueHashes + runStats.dupeHashes) * 100)}`);
  //   // turnRecords[hashBucket] = {
  //   //   explored, speed: (explored / millis * 1000).toFixed(1), totalTime: millis / 1000
  //   // };
  // console.log(tagRun(pool[0], true));
  //   // console.log("zones reached:");
  //   // console.log(cloneState(flatUnexploredStates.getNextState(), false));


}

// Start the recursive task
async function main() {
  while (true) {
    await asyncNextPool();
  }
}

main();
// best run
// autoRun([0, 3, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 2, 3, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);;