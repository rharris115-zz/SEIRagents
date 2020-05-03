import {EventQueue} from "./EventQueue.js"
import {State} from "./State.js"

export class SEIRModel {

    constructor(gravityContactSampler,
                contactsTime = () => (Math.random()),
                exposedTime = () => (Math.random()),
                infectedTime = () => (Math.random())) {

        this.gravityContactSampler = gravityContactSampler
        this.contactsTime = contactsTime
        this.exposedTime = exposedTime
        this.infectedTime = infectedTime

        this.eventQueue = new EventQueue()
        Object.freeze(this)
    }

    static builder(gravityContactSampler) {
        class Builder {
            constructor(gravityContactSampler) {
                this.gravityContactSampler = gravityContactSampler
            }

            withContactsTime(contactsTime) {
                this.contactsTime = contactsTime
                return this
            }

            withExposedTime(exposedTime) {
                this.exposedTime = exposedTime
                return this
            }

            withInfectedTime(infectedTime) {
                this.infectedTime = infectedTime
                return this
            }

            build() {
                return new SEIRModel(this.gravityContactSampler, this.contactsTime, this.exposedTime, this.infectedTime)
            }
        }

        return new Builder(gravityContactSampler);
    }

    static diseaseLifeCycle(eventQueue, e, exposedTime, infectedTime) {
        // Sample the durations for each of subsequent state.
        let timeExposed = exposedTime()
        let timeInfected = infectedTime()

        //Schedule when the exposed becomes infected.
        eventQueue.schedule(() => {
            e.state = State.INFECTED
        }, timeExposed)

        //Schedule when the infected is removed.
        eventQueue.schedule(() => {
            e.state = State.REMOVED
        }, timeExposed + timeInfected)
    }

    setupEvents() {
        let eventQueue = this.eventQueue
        let contactsTime = this.contactsTime
        let exposedTime = this.exposedTime
        let infectedTime = this.infectedTime
        let gravityContactSampler = this.gravityContactSampler

        for (let e of gravityContactSampler.population.asArray.filter(State.EXPOSED.asFilter())) {
            SEIRModel.diseaseLifeCycle(eventQueue, e, exposedTime, infectedTime)
        }

        function contact() {
            let agent = gravityContactSampler.sampleAgent()
            let neighbor = gravityContactSampler.sampleNeighbor(agent.id)

            let infected = [agent, neighbor].filter(State.INFECTED.asFilter())
            let susceptible = [agent, neighbor].filter(State.SUSCEPTIBLE.asFilter())

            // If anyone is infected, the susceptible will now be exposed.
            if (infected.length) {
                for (let s of susceptible) {
                    s.state = State.EXPOSED
                    SEIRModel.diseaseLifeCycle(eventQueue, s, exposedTime, infectedTime)
                }
            }

            //Schedule the next contact event.
            eventQueue.schedule(contact, contactsTime())
        }

        contact()
    }
}