const fs = require('fs');

let { insertIntoPriorityQueue } = require("./library");
let { generateActions } = require("./generateActions");
let { lastZone } = require("./gameData");
const { writeHeapSnapshot } = require('v8');
var hash = require('object-hash');

let manualMode = false;
// when not in manual mode, press 7, 8 and 9 to simulate more states

function scoreState(state) {
  // play around, make your own scores!

  // return -state.zone;
  return -state.numberPath.length;
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

let hashRecord = {};
let bestRun = gameState;
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
  newState.player = { ...state.player };
  newState.enemy = { ...state.enemy };
  return newState;
}


// let exploredStates = {

// };
// let exploredStatesMin = {

// };

let unexploredStates = [{ value: gameState, priority: scoreState(gameState) }];

function takeActionByNumber(gameState, actions, idx) {
  if (actions.length > idx) {
    if (actions[idx].condition(gameState)) {
      // console.log(`action taken: ${idx} ${actions[idx].name}`);
      gameState.numberPath.push(idx);
      // ignore attacks on action path
      // if (actions[idx].name !== "Attack") {
      // gameState.actionPath.push(actions[idx].name);
      // }
      // mark code path for visualisation
      if (actions[idx].code) {
        gameState.codePath.push(actions[idx].code);
      }
      actions[idx].execute(gameState);

      // TODO: decide if the state is won or dead and where
      gameState.won = gameState.zone > lastZone;
      gameState.dead = gameState.player.hp <= 0;
    } else {
      console.error(`action invalid ${idx}`);
    }
  } else {
    // console.error(`action out of range: ${idx}`);
  }
}



function tagRun(gameState) {
  return "\n " + (gameState.won ? "👑" : "💀") + gameState.codePath.join("") + ` Zone ${gameState.zone}, ${gameState.player.damage} 🗡️, ${gameState.player.defense} 🛡️, ${gameState.player.hp}/${gameState.player.maxHp} ❤️, ${gameState.player.gold} 🪙`;
}
function exploreState(gameState) {
  // mark this state as explored
  let path = gameState.numberPath.toString();
  // let storedState = cloneState(gameState, true);
  // exploredStates[path] = storedState;

  // $("#exploredStates").html(`${Object.keys(exploredStates).length} explored, ${unexploredStates.length} unexplored states.` +
  //   `Won: ${runStats.won}, Dead: ${runStats.dead}`);

  let minClone = cloneState(gameState, false);
  // mark with hash
  let hash = customHash(minClone);
  // console.log(hash);
  let zone = gameState.zone;
  if (!hashRecord[zone]) {
    hashRecord[zone] = {};
  }
  if (hashRecord[zone][hash]) {
    // different states, same hash
    // if (JSON.stringify(hashRecord[hash].state) !== JSON.stringify(minClone)) {
    //   console.warn(`HASH COLLISION`);

    //   fs.writeFileSync(`./ERROR.log`, `HASH COLLISION at ${JSON.stringify(minClone)}`);
    // } else {
    runStats.dupeHashes++;
    hashRecord[zone][hash].count += 1;
    // }
    return;
  } else {
    hashRecord[zone][hash] = { count: 1, state: minClone };
    runStats.uniqueHashes++;
  }

  // record runs
  if (gameState.won || gameState.dead) {

    // exploredStatesMin[gameState.numberPath.join("")] = minClone;
    if (gameState.won) {
      runStats.won += 1;
    }
    if (gameState.dead) {
      runStats.dead += 1;
    }
    // god damn you
    // insertIntoPriorityQueue(allRuns, { value: cloneState(gameState), priority: scoreState(gameState), won: gameState.won });
  }
  // get possible actions
  let visibleActions = generateActions(gameState);
  // console.log(visibleActions);
  let childStates = [];
  let possibleActions = visibleActions.filter(action => action.condition(gameState));
  for (let action of possibleActions) {
    // consider the action
    let idx = visibleActions.indexOf(action);
    // clone the state
    let childState = cloneState(gameState);
    // execute new action
    takeActionByNumber(childState, visibleActions, idx);
    // add to children

    // let hash = customHash(childState);
    // if (hashRecord[hash]) {
    //   // duplicate child
    // } else {
    // }
    childStates.push(childState);
  };

  // add child by score
  let prioritisedChildren = childStates.map(state => ({ value: state, priority: scoreState(state) }));
  prioritisedChildren.forEach(child => insertIntoPriorityQueue(unexploredStates, child));
}

function autoRun(numberPath) {
  console.log("running");

  console.log(numberPath);
  for (let choice of numberPath) {
    takeActionByNumber(choice);
  }
}

/////////////////////////////////////////////////////// async explore
function linearExploreAll() {

  let explored = 0;
  let step = 1;
  let writeStep = 100000;
  let targetZone = 1;
  let targetTurn = 1;
  let zoneReached = () => unexploredStates[0].value.zone;
  let currentTurn = () => unexploredStates[0].value.numberPath.length;

  let turnRecords = {};
  // while (explored < 10000) {

  // this is a function that sees if there's any explored states, whenever called()
  let allExplored = () => unexploredStates.length === 0;

  while (!allExplored()) {
    // explore shit
    while (currentTurn() < targetTurn) {

      exploreNStates(step);
      explored += step;
      // Check your custom condition here
      if (explored % 10000 === 0 || allExplored() || currentTurn() >= targetTurn) {

      }

      // if (explored % writeStep === 0 || allExplored) {
      // }
    }
    // zone explored
    // fs.writeFileSync(`./exploredHASH ${currentTurn() - 1}.json`, JSON.stringify(hashRecord));

    console.log("-----------------------------------");
    console.log(`${(process.memoryUsage().rss / 1000000).toFixed(2)} MB rss`);
    console.log(`${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB heapUsed`);
    console.log(`${(process.memoryUsage().heapTotal / 1000000).toFixed(2)} MB heapTotal`);
    console.log(`Turn: ${currentTurn() - 1}`);
    console.log(`${explored} explored, ${unexploredStates.length} unexplored states.` +
      `Won: ${runStats.won}, Dead: ${runStats.dead}`);
    console.log(`duplicates: ${runStats.dupeHashes}, uniqueHashes: ${runStats.uniqueHashes}, collision%: ${runStats.dupeHashes / (runStats.uniqueHashes + runStats.dupeHashes) * 100}`);
    turnRecords[currentTurn()] = explored;

    fs.writeFileSync(`./turnRecords.json`, JSON.stringify(turnRecords));
    hashRecord = {};
    runStats.uniqueHashes = 0;
    runStats.dupeHashes = 0;
    explored = 0;
    runStats.dead = 0;

    if (!allExplored()) {
      targetTurn += 1;
    }
  }
}

console.time("exploration");
linearExploreAll();
console.timeEnd("exploration");

function exploreNStates(number) {
  for (let i = 0; i < number; i++) {
    if (unexploredStates.length > 0) {
      gameState = unexploredStates[0].value;
      // gameState = unexploredStates.shift().value;
      unexploredStates = unexploredStates.slice(1);
      exploreState(gameState);
    }
  }
}


// best run
// autoRun([0, 3, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 2, 3, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);;