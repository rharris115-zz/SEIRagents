import {EventQueue} from "./EventQueue.js"
import {State} from "./State.js"

export class SEIRModel {

    constructor(gravityContactSampler,
                contactsTime = 1,
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
        // Sample the times for each of the subsequent state durations.
        let timeExposed = exposedTime()
        let timeInfected = infectedTime()

        //Schedule when the exposed becomes infected.
        eventQueue.schedule(() => {
            e['state'] = State.Infected
        }, timeExposed)

        //Schedule when the infected is removed.
        eventQueue.schedule(() => {
            e['state'] = State.Removed
        }, timeExposed + timeInfected)
    }

    setupEvents() {
        let eventQueue = this.eventQueue
        let contactsTime = this.contactsTime
        let exposedTime = this.exposedTime
        let infectedTime = this.infectedTime
        let gravityContactSampler = this.gravityContactSampler

        gravityContactSampler.population.withState(State.Exposed).forEach((e) => {
            SEIRModel.diseaseLifeCycle(eventQueue, e, exposedTime, infectedTime)
        })

        function contact() {
            let individual = gravityContactSampler.sampleIndividual()
            let neighbor = gravityContactSampler.sampleNeighbor(individual.id)

            let infected = [individual, neighbor].filter((agent) => (agent.state === State.Infected))
            let susceptible = [individual, neighbor].filter((agent) => (agent.state === State.Susceptible))

            // If anyone is infected, anyone susceptible will now be exposed.
            if (infected.length) {
                susceptible.forEach((s) => {
                    s['state'] = State.Exposed
                    SEIRModel.diseaseLifeCycle(eventQueue, s, exposedTime, infectedTime)
                })
            }

            //Schedule the next contact event.
            eventQueue.schedule(contact, contactsTime())
        }

        contact()
    }
}