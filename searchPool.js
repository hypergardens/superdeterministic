
class FlatSearchPool {
  constructor() {
    this.pool = [];
    // this.nowPool = [];
    this.idx = 0;
    // this.threshold = 1000;
  }
  allExplored() {
    return this.getStates().length === 0;
  }
  clean() {
    this.pool.splice(0, this.idx);
    this.idx = 0;
  }
  addStates(states) {
    this.pool.push(...states);
  }
  getNextState() {
    return this.pool[this.idx];
  }
  slideIdx(number) {
    this.idx += number;
    if (this.idx >= 1000) {
      this.clean();
    }
  }
  popNextState() {
    let element = this.pool[this.idx];
    this.idx += 1;
    if (this.idx >= 1000) {
      this.clean();
    }
    return element;
  }
  getStates() {
    return this.pool.slice(this.idx);
  }
  bucketAnalysis(func) {
    let bucketAnalysis = {};
    let buckets = [];
    for (let state of this.getStates()) {
      let bucket = func ? func(state) : this.bucketCriterion(state);
      if (!bucketAnalysis[bucket]) {
        buckets.push(bucket);
        bucketAnalysis[bucket] = 1;
      } else {
        bucketAnalysis[bucket] += 1;
      }
    }

    return { bucketAnalysis, buckets };
  }
  bucketCriterion(state) {
    // return -state.zone;
    // return state.zone;
    return state.numberPath.length;
  }
  nextPool() {
    this.clean();
    this.pool.sort((a, b) => a.numberPath.length - b.numberPath.length);
    // this.pool.sort((a, b) => -a.zone + b.zone);
    if (this.getStates().length > 100) {
      let upcoming = this.getStates().slice(0, 100);
      this.slideIdx(100);
      return upcoming;
    } else {
      return [this.popNextState()];
    }
    // sort by next "bucket"
    // let { bucketAnalysis, buckets } = this.bucketAnalysis();
    // console.log(this.bucketAnalysis((elem) => elem.zone).bucketAnalysis);
    // console.log(this.bucketAnalysis((elem) => (elem.player.hp / elem.player.maxHp * 100).toFixed(0)).bucketAnalysis);
    // buckets.sort((a, b) => a - b);
    // let upcoming = this.pool.filter(elem => this.bucketCriterion(elem) === buckets[0]);
    // this.pool = this.pool.filter(elem => this.bucketCriterion(elem) !== buckets[0]);
    // this.slideIdx(upcoming.length);
    return upcoming;
  }
}
module.exports = {
  FlatSearchPool
};