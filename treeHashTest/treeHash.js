let fs = require("fs");
const { memoryUsage } = require("process");

function format(number) {
  if (number < 1e3)
    return number.toFixed(2);
  else if (number < 1e6)
    return (number / 1000).toFixed(2) + " k";
  else if (number < 1e9)
    return (number / 1000000).toFixed(2) + " M";
  else if (number < 1e12)
    return (number / 1000000000).toFixed(2) + " B";
}

class TreeHash {
  constructor(deepNest = true) {
    this.map = {};
    // this.keys = ["hp", "damage", "defense"];
    this.keys = new Set();
    this.uniques = 0;
    this.duplicates = 0;
    this.deepNest = deepNest;
  }
  registerKeys(state) {
    Object.keys(state).forEach(key => this.keys.add(key));
    // let stateKeys = Object.keys(state);
    // for (let key of stateKeys) {
    //   if (!this.keys.has(key)) {
    //     console.log(`new key: ${key}`);
    //     this.keys.add(key);
    //   }
    // }
  }
  contains(state) {
    // unknown key
    let stateKeys = Object.keys(state);
    for (let key of Object.keys(state)) {
      if (!this.keys.has(key)) {
        return false;
      }
    };

    // return true;
    let indexer = this.map;
    console.log(`known keys: ${[...this.keys]}`);
    for (let key of this.keys) {
      if (this.deepNest) {
        // each key in the records
        console.log(`searching: ${key}`);
        if (indexer[key] === undefined) {
          return false;
        }
        indexer = indexer[key];
        let value = state[key];
        console.log(`searching: ${value}`);
        if (indexer[value] === undefined) {
          return false;
        }
        indexer = indexer[value];
      }
    }
    return true;
  }
  insert(state) {
    // let keys = ["hp", "damage"];
    this.registerKeys(state);

    let indexer = this.map;
    for (let key of this.keys) {
      if (this.deepNest) {
        // pairs of depths
        if (indexer[key] === undefined) {
          indexer[key] = {};
        }
        indexer = indexer[key];
        let value = state[key];
        if (indexer[value] === undefined) {
          indexer[value] = {};
        }
        indexer = indexer[value];

      } else {
        // bucket keys
        let bucket = `${key}_${state[key]}`;
        if (indexer[bucket] === undefined) {
          indexer[bucket] = {};
        }
        indexer = indexer[bucket];
      }
    }
    if (indexer["count"]) {
      indexer["count"] += 1;
      this.duplicates += 1;
    } else {
      indexer["count"] = 1;
      this.uniques += 1;
    }
  }
}

// let stateA = { hp: 10, damage: 5, defense: 5 };
// let stateB = { hp: 10, damage: 5, defense: 5 };
// let stateC = { hp: 10, damage: 8 };
// let stateD = { hp: 2, damage: 6, defense: 5 };

function randInt(n) {
  return Math.floor(Math.random() * n);
}
let values = 4;
console.time("insert");
let treeHash = new TreeHash(true);
for (let idx = 1; idx <= 10; idx++) {
  treeHash.insert({ hp: randInt(values), damage: randInt(values) });
  treeHash.insert({ damage: randInt(values) });
  treeHash.insert({ hp: randInt(values) });

  if (idx % 1 === 0) {
    console.log(`idx: ${idx}, mem: ${format(memoryUsage().rss)}`);
    console.log(`uniques: ${treeHash.uniques}, duplicates: ${treeHash.duplicates}`);
  }
}
console.timeEnd("insert");


for (let idx = 1; idx <= 10; idx++) {
  let newState = ({ damage: randInt(values * 2) });
  console.log(`state contained: ${treeHash.contains(newState)} ${JSON.stringify(newState)}`);
}
// console.time("insert deep");
// let treeHashDeep = new TreeHash();
// for (let idx = 0; idx < 100000; idx++) {
//   treeHashDeep.insert({ hp: randInt(values), damage: randInt(values), defense: randInt(values) }, true);
// }
// console.timeEnd("insert deep");
// treeHash.insert(stateA);
// treeHash.insert(stateB);
// treeHash.insert(stateC);
// treeHash.insert(stateD);
// console.log(JSON.stringify(treeHash.map));


fs.writeFileSync(`./tree.json`, JSON.stringify(treeHash.map));
// let dataC = treeHash["hp"][2]["damage"][6]; // { won: false }
// let rizzC = treeHash["hp_2"]["damage_6"]; // { won: false }