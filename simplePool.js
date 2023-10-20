
class SimpleSearchPool {
  constructor() {
    this.pool = [];
    // this.nowPool = [];
    this.idx = 0;
    // this.threshold = 1000;
  }
  allExplored() {
    return this.getStates().length === 0;
  }
  addStates(states) {
    this.pool.push(...states);
  }
  getStates() {
    return this.pool;
  }
  sort(scoreFunc) {

    this.pool.sort((item0, item1) => {
      if (scoreFunc(item0) > scoreFunc(item1))
        return -1;
      if (scoreFunc(item0) < scoreFunc(item1))
        return 1;
      return 0;
    });
  }
  nextPool() {
    let upcoming = [...this.pool];
    this.pool = [];
    return upcoming;
  }
}


function bucketAnalysis(pool, func) {
  let bucketAnalysis = {};
  let buckets = [];
  for (let state of pool) {
    let bucket = func(state);
    if (!bucketAnalysis[bucket]) {
      buckets.push(bucket);
      bucketAnalysis[bucket] = 1;
    } else {
      bucketAnalysis[bucket] += 1;
    }
  }

  return { bucketAnalysis, buckets };
}

module.exports = {
  SimpleSearchPool, bucketAnalysis
};