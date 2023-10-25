const { format } = require("../library");
const { getChildStates } = require('../core/simulation');
const { isWon, isLost } = require('../core/info');
const { confidence } = require('./main');

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
    return isWon(this.gameState) || isLost(this.gameState);
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
  selectChildAdversarial() {
  }

  selectChildRandom() {
    let children = Object.values(this.children);
    return children[Math.floor(Math.random() * children.length)];
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

  randomFinalState() {
    let tipState = this.gameState;

    while (!isWon(tipState) && !isLost(tipState)) {
      let children = getChildStates(tipState);
      tipState = children[Math.floor(Math.random() * children.length)];
    }

    return tipState;
  }

  simulate(simulations = 1) {
    let won = 0;
    let dead = 0;
    // for (let i = 0; i < simulations; i++) {
    let tipState = this.randomFinalState();
    if (isWon(tipState)) {
      won += 1;
    }
    if (isLost(tipState)) {
      dead += 1;
    }
    // }
    // console.log(`won: ${won}, dead: ${dead}, steps ${steps / simulations}`);
    // console.log(`won%: ${won / dead}`);
    return { reward: won, finalState: tipState };
  }
}
exports.Node = Node;