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
            e.state = State.Infected
        }, timeExposed)

        //Schedule when the infected is removed.
        eventQueue.schedule(() => {
            e.state = State.Removed
        }, timeExposed + timeInfected)
    }

    setupEvents() {
        let eventQueue = this.eventQueue
        let contactsTime = this.contactsTime
        let exposedTime = this.exposedTime
        let infectedTime = this.infectedTime
        let gravityContactSampler = this.gravityContactSampler

        for (let e of gravityContactSampler.population.withState(State.Exposed)) {
            SEIRModel.diseaseLifeCycle(eventQueue, e, exposedTime, infectedTime)
        }

        function contact() {
            let individual = gravityContactSampler.sampleIndividual()
            let neighbor = gravityContactSampler.sampleNeighbor(individual.id)

            let infected = [individual, neighbor].filter((agent) => (agent.state === State.Infected))
            let susceptible = [individual, neighbor].filter((agent) => (agent.state === State.Susceptible))

            // If anyone is infected, the susceptible will now be exposed.
            if (infected.length) {
                for (let s of susceptible) {
                    s.state = State.Exposed
                    SEIRModel.diseaseLifeCycle(eventQueue, s, exposedTime, infectedTime)
                }
            }

            //Schedule the next contact event.
            eventQueue.schedule(contact, contactsTime())
        }

        contact()
    }
}