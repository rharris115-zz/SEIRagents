class Event {
    constructor(eventTask, time) {
        this.eventTask = eventTask
        this.time = time
        Object.freeze(this)
    }
}


export class EventQueue {

    constructor(currentTime = 0) {
        this.queue = new TinyQueue([], (a, b) => (a.time - b.time))
        this.currentTime = currentTime
    }

    schedule(eventTask, elapsedTime) {
        this.queue.push(new Event(eventTask, this.currentTime + elapsedTime))
    }


    runOne() {
        let event = this.queue.pop()
        this.currentTime = event.time;
        event.eventTask()
        return this.currentTime
    }

    runUntil(time) {
        let event = this.queue.peek()
        while (event.time <= time) {
            this.runOne()
            event = this.queue.peek()
        }
        return this.currentTime
    }
}