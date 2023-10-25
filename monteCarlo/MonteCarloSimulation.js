const { getChildStates, customHash } = require('../core/simulation');
const { isWon, isLost } = require('../core/info');
const { Node } = require('./Node');

class MonteCarloSimulation {
  constructor(gameState) {
    this.root = new Node(gameState, 1);
    this.hashes = {};
    this.nodes = [];
    this.runStats = {
      uniqDead: 0,
      uniqWon: 0,
      dupeDead: 0,
      dupeWon: 0,
      uniqueHashes: 0,
      dupeHashes: 0
    };
  }

  registerState(gameState) {
    // let minClone = cloneState(gameState, false);
    let hash = customHash(gameState);
    if (this.hashes[hash]) {
      // different states, same hash
      // if (JSON.stringify(hashes[hash].state) !== JSON.stringify(minClone)) {
      //   console.warn(`HASH COLLISION`);
      //   fs.writeFileSync(`./ERROR.log`, `HASH COLLISION at ${JSON.stringify(minClone)}`);
      // } else {
      this.runStats.dupeHashes++;
      this.hashes[hash].count += 1;
      if (isWon(gameState)) {
        this.runStats.dupeWon += 1;
      }
      if (isLost(gameState)) {
        this.runStats.dupeDead += 1;
      }
      // }
      return [];
    } else {
      // hashes[hash] = { count: 1, state: minClone, path: gameState.meta.numberPath };
      this.hashes[hash] = { count: 1 };
      this.runStats.uniqueHashes++;

      if (isWon(gameState)) {
        this.runStats.uniqWon += 1;
      }
      if (isLost(gameState)) {
        this.runStats.uniqDead += 1;
      }
      return getChildStates(gameState);
    }
  }

  runSim() {
    let rootNode = this.root;
    rootNode.expand();

    let startTime = process.hrtime();
    let elapsed = 0;
    while (elapsed < 5000) {
      for (let i = 0; i < 1000; i++) {

        let node = rootNode;
        let searchPath = [rootNode];
        // select leaf
        while (node.expanded()) {
          // node = node.selectChild();
          node = node.selectChildRandom();
          // node.expand();
          searchPath.push(node);
        }
        // expand and simulate
        let parent = searchPath[searchPath.length - 2];
        // decide if depth progresses
        node.expand();
        let { reward, finalState } = node.simulate();
        this.registerState(finalState);



        for (let node of searchPath) {
          node.visitCount += 1;
          node.reward += reward;
        }

        // console.log(`parent: ${parent.display()}`);
        // console.log(`node: ${node.display()}`);
      }

      let endTime = process.hrtime(startTime);
      elapsed = (endTime[0] * 1000 + endTime[1] / 1000000);
      console.log("------------------------------------");
      console.log(`after ${elapsed} ms`);
      // console.log(rootNode.display());
      rootNode.displayTree(0, 1);
      // console.log(rootNode.displayTree(0, 10));
    }
  }

}
exports.MonteCarloSimulation = MonteCarloSimulation;
