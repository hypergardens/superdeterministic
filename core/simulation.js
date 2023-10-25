const { generateActions } = require("./generateActions");
const { isLost } = require("./info");
const { isWon } = require("./info");

function customHash(gameState) {
  // return hash(gameState);
  // return `${gameState.data.zone};` +
  //   `${gameState.data.player.damage};${gameState.data.player.defense};${gameState.data.player.maxHp};${gameState.data.player.hp};${gameState.data.player.gold};` +
  //   (gameState.data.zone % 4 === 0 ? "" : `${gameState.data.enemy.name};${gameState.data.enemy.damage};${gameState.data.enemy.defense};${gameState.data.enemy.hp};${gameState.data.enemy.maxHp};${gameState.data.enemy.gold};`);
  return JSON.stringify(gameState.data);
  // return "test";
}
exports.customHash = customHash;

function cloneState(gameState, full = true) {
  // TODO: clean this up
  let newState = { meta: {}, data: {} };
  full && (newState.meta.numberPath = [...gameState.meta.numberPath]);
  full && (newState.meta.actionPath = [...gameState.meta.actionPath]);
  full && (newState.meta.codePath = [...gameState.meta.codePath]);
  // newState.player = { ...gameState.player };
  newState.data.zone = gameState.data.zone;
  newState.data.player = Object.assign({}, gameState.data.player);
  // newState.enemy = { ...gameState.enemy };
  newState.data.enemy = Object.assign({}, gameState.data.enemy);
  // if (full) {
  //   return structuredClone(gameState);
  // } else {
  //   return {
  //     meta: {
  //       numberPath: [],
  //       actionPath: [],
  //       codePath: [],
  //     },
  //     data: structuredClone(gameState.data)
  //   };
  // }
  return newState;
}
exports.cloneState = cloneState;

function takeAction(gameState, action, idx) {
  if (action.condition(gameState)) {
    // console.log(`action taken: ${idx} ${action.name}`);
    gameState.meta.numberPath.push(idx);
    // mark code path for visualisation
    if (action.code) {
      gameState.meta.codePath.push(action.code);
    }
    action.execute(gameState);

  } else {
    console.error(`action invalid ${idx}`);
  }
}
exports.takeAction = takeAction;

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
exports.getChildStates = getChildStates;

// TODO: handle runstats dependency
function exploreState(gameState, hashRecord, runStats) {
  // mark this state as explored
  // record runs
  if (gameState.meta.won || gameState.meta.dead) {

    // exploredStatesMin[gameState.meta.numberPath.join("")] = minClone;
    if (gameState.meta.won) {
      runStats.won += 1;
    }
    if (gameState.meta.dead) {
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
    // hashRecord[hash] = { count: 1, state: minClone, path: gameState.meta.numberPath };
    hashRecord[hash] = { count: 1 };
    runStats.uniqueHashes++;
    return getChildStates(gameState);
  }
}
exports.exploreState = exploreState;
