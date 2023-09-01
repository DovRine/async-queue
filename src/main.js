const AsyncQueue = require('./queue');
const { sleep } = require('./lib');

const q = new AsyncQueue();
q.setInterval(1000)

function qCallback(item) { console.log('enqueued:', item); }
function dqCallback(item) { 
    console.log('dequeued:', item, ', next item:', q.peek());
}

q.on('enqueued', qCallback)
q.on('dequeued', dqCallback)
q.on('pause', () => console.log('pause'))
q.on('resume', () => console.log('resume'))
q.on('running', () => console.log('running'))
q.on('interval', (interval) => console.log('interval set to', interval))

function load(min, max) {
    console.log('adding', max - min + 1, 'elements to the queue');
    for(let i=min; i<=max; i++){
        q.enqueue(i);
    }
}

async function hangOnASec(secondsToWait) {
    console.log('')
    console.log('')
    for(let i=secondsToWait; i>0; i--){
        console.log('continuing in', i, 'seconds...')
        await sleep(1000)
    }
    console.log('')
    console.log('')
}

async function run(){
    load(1, 20)
    await hangOnASec(10);
    q.start();

    console.log('--- slowing down in 4 seconds ---')
    await hangOnASec(4)
    console.log('')
    q.setInterval(2000);

    load(21, 40);

    console.log('pausing the queue in 3 seconds for 5 seconds')
    await hangOnASec(3)
    q.pause()
    
    console.log('current state:');
    console.log(q.print());

    load(41, 50);
    await hangOnASec(5)

    q.setInterval(10);
    
    q.resume()
}

void run()
