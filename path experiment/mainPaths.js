const fs = require('fs');

const { insertIntoPriorityQueue } = require("../library");
const { generateActions } = require("../generateActions");
const { lastZone } = require("../gameData");
// var hash = require('object-hash');

let manualMode = false;
// when not in manual mode, press 7, 8 and 9 to simulate more states

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
  return `${gameState.data.zone};` +
    `${gameState.player.damage};${gameState.player.defense};${gameState.player.maxHp};${gameState.player.hp};${gameState.player.gold};` +
    (gameState.data.zone % 4 === 0 ? "" : `${gameState.data.enemy.name};${gameState.data.enemy.damage};${gameState.data.enemy.defense};${gameState.data.enemy.hp};${gameState.data.enemy.maxHp};${gameState.data.enemy.gold};`);
  // return JSON.stringify(gameState);
  // return "test";
}

console.log("hello world");

// there's always friction at first
// nekromantik design
let baseState = {
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


let gameState = cloneState(baseState, true);

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
  return (gameState.meta.won ? "👑" : "💀") + ` Zone ${gameState.data.zone}, ${gameState.player.damage} 🗡️, ${gameState.player.defense} 🛡️, ${gameState.player.hp}/${gameState.player.maxHp} ❤️, ${gameState.player.gold} 🪙`;
}


// let exploredStates = {

// };
// let exploredStatesMin = {

// };
let priorityMode = false;
let priorityUnexploredStates = [{ value: gameState, priority: scoreState(gameState) }];
let flatUnexploredStates = [[]];
let unexploredIdx = 0;

function takeAction(gameState, action, idx) {
  if (action.condition(gameState)) {
    // console.log(`action taken: ${idx} ${action.name}`);
    gameState.meta.numberPath.push(idx);
    // mark code path for visualisation
    if (action.code) {
      gameState.meta.codePath.push(action.code);
    }
    action.execute(gameState);

    // TODO: decide if the state is won or dead and where
    gameState.meta.won = gameState.data.zone > lastZone;
    gameState.meta.dead = gameState.player.hp <= 0;
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
  return "\n " + (gameState.meta.won ? "👑" : "💀") + gameState.meta.codePath.join("") + ` Zone ${gameState.data.zone}, ${gameState.player.damage} 🗡️, ${gameState.player.defense} 🛡️, ${gameState.player.hp}/${gameState.player.maxHp} ❤️, ${gameState.player.gold} 🪙`;
}


function getChildPaths(gameState) {
  // get possible actions
  let visibleActions = generateActions(gameState);
  // console.log(visibleActions);
  let childPaths = [];
  // if (zone === lastZone) {
  //   console.log("last zone");
  // }
  let possibleActions = visibleActions.filter(action => action.condition(gameState));
  for (let action of possibleActions) {
    // consider the action
    let idx = visibleActions.indexOf(action);
    childPaths.push(gameState.meta.numberPath.concat(idx));
  };
  return childPaths;
}

function runPath(gameState, path) {
  for (const idx of path) {
    let action = generateActions(gameState)[idx];
    takeAction(gameState, action, idx);
  }
  return gameState;
}

// function getChildStates(gameState) {

//   // get possible actions
//   let visibleActions = generateActions(gameState);
//   // console.log(visibleActions);
//   let childStates = [];
//   // if (zone === lastZone) {
//   //   console.log("last zone");
//   // }
//   let possibleActions = visibleActions.filter(action => action.condition(gameState));
//   for (let action of possibleActions) {
//     // consider the action
//     let idx = visibleActions.indexOf(action);
//     // clone the state
//     let childState = cloneState(gameState);
//     // execute new action
//     // childState.numberPath.push(idx);
//     // action.execute(childState);
//     takeAction(childState, action, idx);
//     // add to children
//     childStates.push(childState);
//   };
//   return childStates;
// }
function exploreState(gameState, hashRecord, runStats, flatUnexploredStates) {
  // mark this state as explored
  // let path = gameState.meta.numberPath.toString();
  // let storedState = cloneState(gameState, true);
  // exploredStates[path] = storedState;

  let minClone = cloneState(gameState, false);
  // mark with hash
  let hash = customHash(minClone);
  // console.log(hash);
  let bucket = gameState.data.zone;
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
    // hashRecord[bucket][hash] = { count: 1, state: minClone, path: gameState.meta.numberPath };
    hashRecord[bucket][hash] = { count: 1, path: gameState.meta.numberPath };
    runStats.uniqueHashes++;
  }

  // record runs
  if (gameState.meta.won || gameState.meta.dead) {

    // exploredStatesMin[gameState.meta.numberPath.join("")] = minClone;
    if (gameState.meta.won) {
      runStats.won += 1;
    }
    if (gameState.meta.dead) {
      runStats.dead += 1;
    }
    // god damn you
    // insertIntoPriorityQueue(allRuns, { value: cloneState(gameState), priority: scoreState(gameState), won: gameState.meta.won });
  }

  let childPaths = getChildPaths(gameState);
  if (priorityMode) {

    // add child by score
    let prioritisedChildren = childPaths.map(state => ({ value: state, priority: scoreState(state) }));
    prioritisedChildren.forEach(child => insertIntoPriorityQueue(priorityUnexploredStates, child));
  } else {
    // TODO: optimise concat?
    flatUnexploredStates.push(...childPaths);
  }
}

function autoRun(numberPath) {
  console.log("running");

  console.log(numberPath);
  for (let choice of numberPath) {
    takeActionByNumber(choice);
  }
}

function getNextUnexploredPath() {
  if (priorityMode) {
    return priorityUnexploredStates[0].value;
  } else {
    return flatUnexploredStates[unexploredIdx];
  }
}
function getRemainingUnexploredStates() {
  if (priorityMode) {
    return priorityUnexploredStates.length;
  } else {
    return flatUnexploredStates.length;
  }
}
function shiftUnexploredStates() {
  if (priorityMode) {
    // priorityUnexploredStates = priorityUnexploredStates.slice(1);
    priorityUnexploredStates.shift();
  } else {
    // flatUnexploredStates = flatUnexploredStates.slice(1);
    // flatUnexploredStates.shift();
  }
}
/////////////////////////////////////////////////////// async explore

function currentTurn() { return gameState.meta.numberPath.length; }
function upcomingTurn() { return getNextUnexploredPath().length; }
function allExplored() { return getRemainingUnexploredStates() === 0; }

function linearExploreAll() {
  let explored = 0;
  let totalExplored = 0;
  let step = 1;
  let writeStep = 100000;
  let targetZone = 1;
  let limitedTargetTurn = 50;
  let targetTurn = 1;

  let turnRecords = {};
  // while (explored < 10000) {


  while (!allExplored()) {
    // explore shit
    console.time("Duration");
    let startTime = process.hrtime();
    while (upcomingTurn() < targetTurn) {

      // exploreNStates(step);
      // explored += step;

      let path = getNextUnexploredPath();

      gameState = runPath(cloneState(baseState), path);
      unexploredIdx += 1;
      if (unexploredIdx >= 10000) {
        flatUnexploredStates.splice(0, unexploredIdx);
        unexploredIdx = 0;
      }

      exploreState(gameState, hashRecord, runStats, flatUnexploredStates);
      explored += 1;

    }
    // zone explored
    // fs.writeFileSync(`./exploredHASH.json`, JSON.stringify(hashRecord));
    // fs.writeFileSync(`./exploredHASH ${upcomingTurn() - 1}.json`, JSON.stringify(hashRecord));

    totalExplored += explored;

    let endTime = process.hrtime(startTime);
    let millis = (endTime[0] * 1e3 + endTime[1] / 1e6);
    console.log("-----------------------------------");
    // console.log(displayState(gameState));
    console.timeEnd("Duration");
    console.log(`Turn: ${currentTurn()}, time ${millis.toFixed(0)}, states ${explored}`);
    console.log(`States/second: ${explored / millis * 1000}`);
    console.log(`${(process.memoryUsage().rss / 1000000).toFixed(2)} MB rss`);
    // console.log(`${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB heapUsed`);
    // console.log(`${(process.memoryUsage().heapTotal / 1000000).toFixed(2)} MB heapTotal`);
    console.log(`${totalExplored} explored, ${getRemainingUnexploredStates()} unexplored states.` +
      `Won: ${runStats.won}, Dead: ${runStats.dead}`);
    console.log(`duplicates: ${runStats.dupeHashes}, uniqueHashes: ${runStats.uniqueHashes}, collision%: ${runStats.dupeHashes / (runStats.uniqueHashes + runStats.dupeHashes) * 100}`);
    turnRecords[currentTurn()] = {
      explored, speed: (explored / millis * 1000).toFixed(1), totalTime: millis / 1000
    };

    console.log(`Size: ${JSON.stringify(flatUnexploredStates).length}`);
    console.log(`Len: ${(flatUnexploredStates).length}`);
    fs.writeFileSync(`./turnRecords.json`, JSON.stringify(turnRecords));
    // delete hashRecord;
    hashRecord = {};
    // runStats.uniqueHashes = 0;
    // runStats.dupeHashes = 0;
    explored = 0;
    runStats.dead = 0;

    if (!allExplored()) {
      targetTurn += 1;
    }

    if (upcomingTurn() > limitedTargetTurn) {
      break;
    }
  }
}

console.time("Exploration");
linearExploreAll();
console.timeEnd("Exploration");



// best run
// runPath(gameState, [0, 3, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 2, 3, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

// console.log(tagRun(gameState));