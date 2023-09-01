const AsyncQueue = require('./queue');
const sinon = require('sinon');

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

    it('Should enqueue the items to the queue', (done) => {
        const onQueueSpy = jest.fn()
        queue.on('enqueued', onQueueSpy);

        queue.enqueue(1);
        queue.enqueue(2);

        setTimeout(() => {
            expect(onQueueSpy).toHaveBeenCalledTimes(2)
            expect(queue.print()).toStrictEqual([1, 2])
            done();
        }, 20);
    });

    it('Should return the item at head when peek method is called', () => {
        queue.enqueue(222);
        queue.enqueue(2312);
        queue.enqueue(223222);
        queue.enqueue(1223);

        expect(queue.peek()).toBe(222)
    });

    it('Should start the dequeue process once start method is called', (done) => {
        const onDequeueSpy = jest.fn();
        queue.on('dequeued', onDequeueSpy);

        queue.enqueue(1);
        queue.enqueue(2);


        setTimeout(() => {
            expect(onDequeueSpy).toHaveBeenCalledTimes(0);
            queue.start();
        }, 260);

        setTimeout(() => {
            expect(onDequeueSpy).toHaveBeenCalledTimes(1);
            done()
        }, 520);
    });

    it('Should dequeue items every 250ms from the queue', (done) => {
        const onDequeueSpy = jest.fn();
        queue.on('dequeued', onDequeueSpy);

        queue.enqueue(1);
        queue.enqueue(2);
        queue.start();
        expect(queue.getCurrentInterval()).toBe(250);


        setTimeout(() => {
            expect(onDequeueSpy).toHaveBeenCalledTimes(1)
            expect(onDequeueSpy).toHaveBeenNthCalledWith(1, 1)
        }, 260);

        setTimeout(() => {
            expect(onDequeueSpy).toHaveBeenCalledTimes(2)
            expect(onDequeueSpy).toHaveBeenNthCalledWith(2, 2)
            done()
        }, 510);
    });

    it('Should update the queue interval', (done) => {
        const onDequeueSpy = jest.fn();
        queue.on('dequeued', onDequeueSpy);

        expect(queue.getCurrentInterval()).toBe(250);
        queue.emit('interval', 20);
        expect(queue.getCurrentInterval()).toBe(20);

        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);


        queue.start();

        expect(queue.peek()).toBe(2);

        setTimeout(() => {
            expect(onDequeueSpy).toHaveBeenCalledTimes(3);
            expect(onDequeueSpy).toHaveBeenNthCalledWith(1, 2);
            expect(onDequeueSpy).toHaveBeenNthCalledWith(2, 3);
            expect(onDequeueSpy).toHaveBeenNthCalledWith(3, 4);
            done();
        }, 100);
    });

    it('Should pause the dequeue process', (done) => {
        const onDequeueSpy = jest.fn();
        queue.on('dequeued', onDequeueSpy);

        queue.start();

        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);

        queue.pause();

        setTimeout(() => {
            expect(onDequeueSpy).toHaveBeenCalledTimes(0);
            queue.start();
            queue.emit('interval', 50);
        }, 260);

        setTimeout(() => {
            expect(onDequeueSpy).toHaveBeenCalledTimes(1);
            done();
        }, 320);
    });

    it.only('Should continue to listen for new data even on pausing the dequeue process', (done) => {
        const onDequeueSpy = jest.fn();
        const onEnqueueSpy = jest.fn();
        queue.on('dequeued', onDequeueSpy);

        queue.start();

        queue.enqueue(2);
        queue.enqueue(3);
        queue.enqueue(4);

        queue.pause();

        setTimeout(() => {
            // NOTE: this test expects 0 b/c the initial delay is 250 and this
            //       timer doesn't fire until 260. This is not a reliable way
            //       to test this b/c settimeout only guarantees a minimum delay.
            expect(onDequeueSpy).toHaveBeenCalledTimes(0);
            queue.start();
            queue.emit('interval', 50);
            queue.on('enqueued', onEnqueueSpy);
            queue.enqueue(95);
            queue.enqueue(110);
        }, 260);

        setTimeout(() => {
            queue.enqueue(221);
            expect(onEnqueueSpy).toHaveBeenCalledTimes(3);
            expect(onDequeueSpy).toHaveBeenCalledTimes(1);
            expect(queue.print()).toStrictEqual([3, 4, 95, 110, 221]);
            done();
        }, 320);

    });
});
 
