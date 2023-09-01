const EventEmitter = require('events');
const { sleep } = require('./lib');

const VALID_ITEM_TYPES = ['number', 'string', 'object']


class AsyncQueue extends EventEmitter {
    constructor() {
        super();
        this.queue = [];
        this.isPaused = false;
        this.interval = 250;
    }
    
    dequeue() { 
        const item = this.queue.shift();
        if(item){
            this.emit('dequeued', item);
        }
    }

    enqueue(item) {
        if (!VALID_ITEM_TYPES.includes(typeof (item))) { return }

        this.queue.push(item)
        this.emit('enqueued', item);
    }

    getCurrentInterval() { return this.interval; }

    pause() { 
        this.isPaused = true;
        this.emit('pause')
    }

    peek() { return this.queue[0]; }

    print() { return this.queue }

    resume() { 
        this.isPaused = false;
        this.emit('resume')
    }

    setInterval(milliseconds) {
        if(typeof(milliseconds) !== 'number' || milliseconds <= 0) { return }
        this.interval = milliseconds;
        this.emit('interval', milliseconds);
    }
    
    async start() {
        this.emit('running')
        this.isPaused = false;
        while(true) {
            if(this.isPaused) { 
                // WARNING: failing to sleep here locks up the cpu
                await sleep(10);
                continue 
            }
            this.dequeue()
            await sleep(this.interval);
        }
    }
}

module.exports = AsyncQueue;
