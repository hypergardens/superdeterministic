const fs = require('fs');

const { format } = require("./library");
const { generateActions } = require("./generateActions");
const { lastZone } = require("./gameData");
const { FlatSearchPool, bucketAnalysis } = require('./old/searchPool');
var hash = require('object-hash');
const { SimpleSearchPool } = require('./simplePool');

function customHash(gameState) {
  // return hash(gameState);
  // return `${gameState.data.zone};` +
  //   `${gameState.data.player.damage};${gameState.data.player.defense};${gameState.data.player.maxHp};${gameState.data.player.hp};${gameState.data.player.gold};` +
  //   (gameState.data.zone % 4 === 0 ? "" : `${gameState.data.enemy.name};${gameState.data.enemy.damage};${gameState.data.enemy.defense};${gameState.data.enemy.hp};${gameState.data.enemy.maxHp};${gameState.data.enemy.gold};`);
  return JSON.stringify(gameState);
  // return "test";
}

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

function cloneState(gameState, full = true) {
  // TODO: clean this up
  let newState = { meta: {}, data: {} };
  full && (newState.meta.numberPath = [...gameState.meta.numberPath]);
  full && (newState.meta.actionPath = [...gameState.meta.actionPath]);
  full && (newState.meta.codePath = [...gameState.meta.codePath]);
  full && (newState.meta.won = gameState.meta.won);
  full && (newState.meta.dead = gameState.meta.dead);
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

function displayState(gameState) {
  return (gameState.meta.won ? "👑" : "💀") + ` Zone ${gameState.data.zone}, ${gameState.data.player.damage} 🗡️, ${gameState.data.player.defense} 🛡️, ${gameState.data.player.hp}/${gameState.data.player.maxHp} ❤️, ${gameState.data.player.gold} 🪙`;
}

function tagRun(gameState) {
  return "\n " + (gameState.meta.won ? "👑" : (gameState.meta.dead ? "💀" : "?")) + gameState.meta.codePath.join("") + ` Zone ${gameState.data.zone}, ${gameState.data.player.damage} 🗡️, ${gameState.data.player.defense} 🛡️, ${gameState.data.player.hp}/${gameState.data.player.maxHp} ❤️, ${gameState.data.player.gold} 🪙`;
}

let flatUnexploredStates = new SimpleSearchPool();
flatUnexploredStates.addStates([gameState]);

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
    gameState.meta.dead = gameState.data.player.hp <= 0;
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

  // flatUnexploredStates.sort((state) => state.data.zone);
  // let nextState = flatUnexploredStates.pool.shift();
  // let upcoming = [nextState];
  let upcoming = flatUnexploredStates.nextPool();
  // console.log(upcoming);
  console.log(`Fringe: ${format(upcoming.length)}`);
  console.log(`Explored: ${format(totalExplored)}`);
  console.log(tagRun(upcoming[0]));
  // let analysis = bucketAnalysis(upcoming, (state) => (state.zone)).bucketAnalysis;
  // console.log(analysis);
  for (let gameState of upcoming) {
    flatUnexploredStates.addStates(exploreState(gameState, hashRecord));
    if (gameState.meta.won) {
      throw new Error("Won");
    }
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

////////////////////////////////////// MCTS

function confidence(node, child) {
  let priorScore = Math.sqrt(node.visitCount / (child.visitCount + 1));
  // let exploitation = node.reward / node.visitCount;
  let valueScore = (child.visitCount > 0) ? child.reward / child.visitCount : 0;
  let exploitConstant = 50;
  return priorScore * child.prior + exploitConstant * valueScore;
}

class Node {
  constructor(gameState, prior) {
    this.gameState = gameState;
    this.prior = prior;
    this.children = {};
    this.visitCount = 0;
    this.reward = 0;
  }
  display(depth = 0) {
    return `${" ".repeat(depth)}${this.gameState.meta.codePath.slice(depth - 1).join("")} -> ${format(this.reward)}/${format(this.visitCount)}, ${(this.reward / this.visitCount * 100).toFixed(2)}%`;
  }
  displayTree(depth = 0, maxDepth = 1) {
    if (depth > maxDepth) {
      return;
    }
    // if (this.gameState.meta.codePath[this.gameState.meta.codePath.length - 1] !== "a") {
    console.log(this.display(depth));
    // }
    for (let childNode of Object.values(this.children)) {
      // if (childNode.reward > 0) {
      childNode.displayTree(depth + 1, maxDepth);
      // }
    }
  }
  isTerminal() {
    return this.gameState.meta.won || this.gameState.meta.dead;
  }
  expand() {
    // console.log(`Expanded: ${this.display()}`);
    let children = getChildStates(this.gameState);
    for (let childState of children) {
      let childNode = new Node(childState, 1 / children.length);
      let lastAction = childState.meta.numberPath[childState.meta.numberPath.length - 1];
      this.children[lastAction] = childNode;
    }
  }
  expanded() {
    return Object.keys(this.children).length !== 0;
  }
  selectChildUCB() {
    let children = Object.values(this.children);
    let totalUCB = children.reduce((acc, child) => (acc + confidence(this, child)), 0);
    let pickIdx = Math.random() * totalUCB;
    // console.log(this.display());
    // console.log(`totalUCB ${totalUCB}, pickIdx ${pickIdx}`);
    for (let child of children) {
      pickIdx -= confidence(this, child);
      if (pickIdx <= 0) {
        return child;
      }
    }

  }
  selectChild() {
    let pickIdx = Math.random();
    let children = Object.values(this.children);
    for (let child of children) {
      pickIdx -= child.prior;
      if (pickIdx <= 0) {
        return child;
      }
    }
  }

  simulate(simulations = 1) {
    let won = 0;
    let dead = 0;
    let steps = 0;
    // for (let i = 0; i < simulations; i++) {
    let tipState = this.gameState;
    while (!tipState.meta.won && !tipState.meta.dead) {
      steps += 1;
      let children = getChildStates(tipState);
      tipState = children[Math.floor(Math.random() * children.length)];
    }
    if (tipState.meta.won) {
      won += 1;
    }
    if (tipState.meta.dead) {
      dead += 1;
    }
    // }
    // console.log(`won: ${won}, dead: ${dead}, steps ${steps / simulations}`);
    // console.log(`won%: ${won / dead}`);
    return won;
  }
}

function runSim(gameState) {
  let root = gameState;
  let rootNode = new Node(root, 1);
  rootNode.expand();

  let startTime = process.hrtime();
  let elapsed = 0;
  while (elapsed < 5000) {
    for (let i = 0; i < 1000; i++) {

      let node = rootNode;
      let searchPath = [rootNode];
      // select leaf
      while (node.expanded()) {
        node = node.selectChildUCB();
        // node.expand();
        searchPath.push(node);
      }
      // expand and simulate
      let parent = searchPath[searchPath.length - 2];
      node.expand();
      let reward = node.simulate();
      // backprop

      for (let node of searchPath) {
        node.visitCount += 1;
        node.reward += reward;
      }

      // console.log(`parent: ${parent.display()}`);
      // console.log(`node: ${node.display()}`);
    }

    let endTime = process.hrtime(startTime);
    elapsed = (endTime[0] * 1e3 + endTime[1] / 1e6);
    console.log("------------------------------------");
    console.log(`after ${elapsed} ms`);
    // console.log(rootNode.display());
    rootNode.displayTree(0, 1);
    // console.log(rootNode.displayTree(0, 10));
  }
}

////////////////////////////// MCTS
// Start the recursive task
async function main() {
  // while (true) {
  // await asyncNextPool();
  console.time("simulation");
  runSim(gameState);
  console.timeEnd("simulation");
  // }
}

main();
// best run
// autoRun([0, 3, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 0, 0, 0, 2, 3, 4, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 0, 0, 0, 0, 0, 0, 1, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 2, 3, 3, 3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);;