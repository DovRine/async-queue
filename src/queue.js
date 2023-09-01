var EventEmitter = require('events');

class AsyncQueue extends EventEmitter {
  constructor(){
    super();
    this.queue = {};
    this.head = 0;
    this.tail = 0;
    //this.isPaused = false;
    this.intervalID = null;
    this.interval = 250;
    this.on('interval', (newInterval) => {
        if (typeof(newInterval) === 'number' && newInterval > 0){
            this.interval = newInterval;
        }
    });
  }

  enqueue(item){
    if (typeof(item) === 'number'
        || typeof(item) === 'string' 
        || typeof(item) === 'object') {
            this.queue[this.tail] = item;
            this.tail++;
            this.emit('enqueued', item);
    }
  }
  pause(){
    this.isPaused = true;
  }

  peek() {
    return this.queue[this.head];
  }

  print() {
    return Object.values(this.queue)
  }

  getCurrentInterval(){
    return this.interval;
  }

  start() {
    // this.isPaused = false;
    this.intervalID = setInterval(() => {
      if (this.head < this.tail /*!this.isPaused && */) {
        let item = this.queue[this.head]
        delete this.queue[this.head];
        this.head++;
        this.emit('dequeued', item);
        return item;
      }
    },
    this.interval);
  }
}

module.exports = AsyncQueue;