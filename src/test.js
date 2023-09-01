const AsyncQueue = require('./queue');
const { sleep } = require('./lib');

describe('async_queue', () => {
    let queue;

    beforeEach(() => {
        queue = new AsyncQueue();
    });

    afterEach(() => {
        queue.removeAllListeners();
    });

    it('Should have all the methods in the class', () => {
        requiredMethods = ['enqueue', 'getCurrentInterval', 'peek', 'print', 'start', 'pause']
        for(const method of requiredMethods){
            const fn = queue[method];
            expect(fn).toBeDefined();
            expect(typeof fn).toBe('function');
        }
    });

    it('Should enqueue the items to the queue', async () => {
        const onQueueSpy = jest.fn()
        queue.on('enqueued', onQueueSpy);

        queue.enqueue(1);
        queue.enqueue(2);

        expect(onQueueSpy).toHaveBeenCalledTimes(2)
        expect(queue.print()).toStrictEqual([1, 2])
    });

    it('Should return the item at head when peek method is called', async () => {
        expect(queue.peek()).toBe(undefined)

        queue.enqueue(222);
        queue.enqueue(2312);

        expect(queue.peek()).toBe(222)

        const intervalDelay = 10
        queue.setInterval(intervalDelay)
        queue.start();

        await sleep(intervalDelay * 3)

        expect(queue.peek()).toBe(undefined);

        queue.pause();

        queue.enqueue(88)
        queue.enqueue(99)

        expect(queue.peek()).toBe(88);
    });

    it('Should start the dequeue process once start method is called', async () => {
        const intervalDelay = 250
        queue.setInterval(intervalDelay)

        const onDequeueSpy = jest.fn();
        queue.on('dequeued', onDequeueSpy);

        queue.enqueue(1);
        queue.enqueue(2);

        expect(onDequeueSpy).toHaveBeenCalledTimes(0);
        
        queue.start();

        await sleep(intervalDelay * 3)

        expect(onDequeueSpy).toHaveBeenCalledTimes(2);
    });

    it('Should have a default interval of 250ms', () => {
        expect(queue.getCurrentInterval()).toBe(250);
    });

    it('Should update the queue interval with numbers > 0', () => {
        queue.setInterval(250)
        expect(queue.getCurrentInterval()).toBe(250);

        const validIntervals = [1, 10, 100, 1000];
        const invalidIntervals = ['a', 0, -Infinity, [], {}, () => {}]

        for(const valid of validIntervals){
            queue.setInterval(valid)            
            expect(queue.getCurrentInterval()).toBe(valid);
        }

        for(const invalid of invalidIntervals){
            queue.setInterval(invalid)            
            expect(queue.getCurrentInterval()).not.toBe(invalid);
        }
    });

    it('Should pause the dequeue process', async () => {
        const intervalDelay = 10
        queue.setInterval(intervalDelay)

        const onDequeueSpy = jest.fn();
        queue.on('dequeued', onDequeueSpy);

        queue.start();
        queue.pause();

        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);

        expect(onDequeueSpy).toHaveBeenCalledTimes(0);

        queue.resume()
        
        await sleep(intervalDelay * 4)

        expect(onDequeueSpy).toHaveBeenCalledTimes(3);
    });

    it('Should continue to listen for new data even on pausing the dequeue process', async () => {
        const intervalDelay = 250;
        queue.setInterval(intervalDelay);

        const onEnqueueSpy = jest.fn();
        queue.on('enqueued', onEnqueueSpy);

        queue.start();
        queue.pause();

        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);

        expect(onEnqueueSpy).toHaveBeenCalledTimes(3);

        expect(queue.print()).toStrictEqual([2, 3, 4]);
    });
});
 
