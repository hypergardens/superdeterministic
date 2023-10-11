const fs = require('fs');

const { insertIntoPriorityQueue, format } = require("./library");
const { generateActions } = require("./generateActions");
const { lastZone } = require("./gameData");
const { FlatSearchPool } = require('./searchPool');
// var hash = require('object-hash');

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
  return `${gameState.zone};` +
    `${gameState.player.damage};${gameState.player.defense};${gameState.player.maxHp};${gameState.player.hp};${gameState.player.gold};` +
    (gameState.zone % 4 === 0 ? "" : `${gameState.enemy.name};${gameState.enemy.damage};${gameState.enemy.defense};${gameState.enemy.hp};${gameState.enemy.maxHp};${gameState.enemy.gold};`);
  // return JSON.stringify(gameState);
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

let hashRecord = {};
let runStats = {
  dead: 0,
  won: 0,
  uniqueHashes: 0,
  dupeHashes: 0
};

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


let priorityMode = false;
// let priorityUnexploredStates = [{ value: gameState, priority: scoreState(gameState) }];
let flatUnexploredStates = new FlatSearchPool();
flatUnexploredStates.addStates([gameState]);
let unexploredIdx = 0;

function takeAction(gameState, action, idx) {
  if (action.condition(gameState)) {
    // console.log(`action taken: ${idx} ${action.name}`);
    gameState.numberPath.push(idx);
    // ignore attacks on action path
    // if (action.name !== "Attack") {
    // gameState.actionPath.push(action.name);
    // }
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


function tagRun(gameState) {
  return "\n " + (gameState.won ? "👑" : (gameState.dead ? "💀" : "?")) + gameState.codePath.join("") + ` Zone ${gameState.zone}, ${gameState.player.damage} 🗡️, ${gameState.player.defense} 🛡️, ${gameState.player.hp}/${gameState.player.maxHp} ❤️, ${gameState.player.gold} 🪙`;
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

    // let hash = customHash(childState);
    // if (hashRecord[hash]) {
    //   // duplicate child
    // } else {
    // }
    childStates.push(childState);
  };
  return childStates;
}
function exploreState(gameState, hashRecord, runStats, searchPool) {
  // mark this state as explored
  // let path = gameState.numberPath.toString();
  // let storedState = cloneState(gameState, true);
  // exploredStates[path] = storedState;

  // record runs
  if (gameState.won || gameState.dead) {

    // exploredStatesMin[gameState.numberPath.join("")] = minClone;
    if (gameState.won) {
      runStats.won += 1;
    }
    if (gameState.dead) {
      runStats.dead += 1;
    }
    // TODO: decide where this should go, abort exploring dead/won states
    return;
    // god damn you
    // insertIntoPriorityQueue(allRuns, { value: cloneState(gameState), priority: scoreState(gameState), won: gameState.won });
  }

  let minClone = cloneState(gameState, false);
  // mark with hash
  let hash = customHash(minClone);
  // console.log(hash);
  let bucket = gameState.zone;
  if (!hashRecord[bucket]) {
    hashRecord[bucket] = {};
  }
  if (hashRecord[bucket][hash]) {
    // different states, same hash
    // if (JSON.stringify(hashRecord[hash].state) !== JSON.stringify(minClone)) {
    //   console.warn(`HASH COLLISION`);

    //   fs.writeFileSync(`./ERROR.log`, `HASH COLLISION at ${JSON.stringify(minClone)}`);
    // } else {
    runStats.dupeHashes++;
    hashRecord[bucket][hash].count += 1;
    // }
    return;
  } else {
    // hashRecord[bucket][hash] = { count: 1, state: minClone, path: gameState.numberPath };
    hashRecord[bucket][hash] = { count: 1, path: gameState.numberPath };
    runStats.uniqueHashes++;
  }


  // if (priorityMode) {
  // add child by score
  // let prioritisedChildren = childStates.map(state => ({ value: state, priority: scoreState(state) }));
  // prioritisedChildren.forEach(child => insertIntoPriorityQueue(priorityUnexploredStates, child));
  // TODO: optimise concat?
  searchPool.addStates(getChildStates(gameState));
}

function autoRun(numberPath) {
  console.log("running");

  console.log(numberPath);
  for (let choice of numberPath) {
    takeActionByNumber(choice);
  }
}
/////////////////////////////////////////////////////// async explore

let explored = 0;
let totalExplored = 0;
let totalStartTime = process.hrtime();
let poolsExplored = 0;
let maxPoolsExplored = 150;
function explorePool() {
  // while (explored < 10000) {


  // for (let idx = 0; idx < 100; idx++) {
  // console.log("|----------------------------------|");
  // while (!allExplored(flatUnexploredStates)) {
  // explore shit
  // console.time("Duration");
  let startTime = process.hrtime();
  // exploreNStates(step);
  // explored += step;

  console.log(flatUnexploredStates.bucketAnalysis(state => state.numberPath.length).bucketAnalysis);
  let pool = flatUnexploredStates.nextPool();
  let currentStage = pool[0].numberPath.length;
  console.log(`S: ${currentStage} pool size: ${pool.length}`);
  // TODO: get next unexplored states


  for (let state of pool) {
    gameState = state;
    // flatUnexploredStates.sort((a, b) => (a.zone - b.zone));
    // console.log(`Zone of first element:`, getNextUnexploredState().zone);
    exploreState(gameState, hashRecord, runStats, flatUnexploredStates);
    explored += 1;
  }

  // zone explored
  // fs.writeFileSync(`./exploredHASH.json`, JSON.stringify(hashRecord));
  // fs.writeFileSync(`./exploredHASH ${upcomingTurn() - 1}.json`, JSON.stringify(hashRecord));

  totalExplored += explored;
  poolsExplored += 1;

  // let endTime = process.hrtime(startTime);
  let endTime = process.hrtime(totalStartTime);
  let millis = (endTime[0] * 1e3 + endTime[1] / 1e6);
  let speed = totalExplored / millis * 1000;

  if (poolsExplored % 1 === 0) {
    console.log("-----------------------------------");
    // console.log(displayState(gameState));
    // console.timeEnd("Duration");
    // console.log(`Stage: ${currentStage}, time ${millis.toFixed(0)}, states ${explored}`);
    console.log(`States/second: ${format(speed)}`);
    console.log(`${(format(process.memoryUsage().rss))}B memory used`);
    // console.log(`${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB heapUsed`);
    // console.log(`${(process.memoryUsage().heapTotal / 1000000).toFixed(2)} MB heapTotal`);
    console.log(`${format(totalExplored)} explored, ${format(flatUnexploredStates.getStates().length)} unexplored states.` +
      `Won: ${format(runStats.won)}, Dead: ${format(runStats.dead)}`);
    console.log(`duplicates: ${format(runStats.dupeHashes)}, uniqueHashes: ${format(runStats.uniqueHashes)}, collision%: ${format(runStats.dupeHashes / (runStats.uniqueHashes + runStats.dupeHashes) * 100)}`);
    // turnRecords[currentStage] = {
    //   explored, speed: (explored / millis * 1000).toFixed(1), totalTime: millis / 1000
    // };
    console.log(tagRun(cloneState(flatUnexploredStates.getNextState(), true)));
    // console.log("zones reached:");
    // console.log(cloneState(flatUnexploredStates.getNextState(), false));
  }

  // console.log(`RSize: ${roughSizeOfObject(flatUnexploredStates)}`);
  // console.log(`JSize: ${JSON.stringify(flatUnexploredStates).length}`);
  // console.log(`Len: ${(flatUnexploredStates).length}`);
  // fs.writeFileSync(`./turnRecords.json`, JSON.stringify(turnRecords));
  // delete hashRecord;

  // RAMO: when set to true, it resets the hash records, meaning it uses less memory, but processes
  // exponentially more duplicates
  // when set to false, it avoids duplicates and explores more efficiently, however it burns RAM
  let deleteRecords = false;
  if (deleteRecords) {
    hashRecord = {};
  }

  // display zone distributions:
  // let zoneAnalysed = 0;

  // runStats.uniqueHashes = 0;
  // runStats.dupeHashes = 0;
  explored = 0;
  // runStats.dead = 0;
}


console.time("Exploration");
// explorePool();
console.timeEnd("Exploration");



let manualMode = false;


async function recursiveFunction() {
  // Perform some asynchronous operation
  await someAsyncOperation();

  // Call itself when done
  if (poolsExplored < maxPoolsExplored) {
    recursiveFunction();
  }
}

async function someAsyncOperation() {
  return new Promise((resolve) => {
    // Simulate an asynchronous operation (e.g., fetching data)
    explorePool();
    // setTimeout(() => {
    //   console.log('Async operation complete');
    resolve();
    // }, 2000); // Simulating a 2-second async operation
  });
}

// Start the recursive task
recursiveFunction();
// best run
// autoRun([0, 3, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 2, 3, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);;