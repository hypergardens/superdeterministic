
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

module.exports = {
  insertIntoPriorityQueue
};