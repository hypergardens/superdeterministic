let { monsters } = require("./monsters");

let lastZone = Math.max(...Object.keys(monsters).map(key => Number(key))) + 1;

module.exports = {
  lastZone
};