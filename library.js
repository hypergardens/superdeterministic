
// Function to insert an element into the priority queue
function insertIntoPriorityQueue(priorityQueue, element) {
  // Use binary search to find the correct position to insert the element
  let left = 0;
  let right = priorityQueue.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (element.priority > priorityQueue[mid].priority) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  // Insert the element at the correct position
  priorityQueue.splice(left, 0, element);
}


function roughSizeOfObject(object) {
  var objectList = [];
  var stack = [object];
  var bytes = 0;

  while (stack.length) {
    var value = stack.pop();

    if (typeof value === 'boolean') {
      bytes += 4;
    }
    else if (typeof value === 'string') {
      bytes += value.length * 2;
    }
    else if (typeof value === 'number') {
      bytes += 8;
    }
    else if
      (
      typeof value === 'object'
      && objectList.indexOf(value) === -1
    ) {
      objectList.push(value);

      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}


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

module.exports = {
  insertIntoPriorityQueue, roughSizeOfObject, format
};