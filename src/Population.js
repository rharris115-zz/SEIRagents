import {State} from "./State.js";


export let unit_square_distribution = () => ({x: Math.random(), y: Math.random()})


export class Population {

    constructor(individuals) {
        this.asArray = Object.freeze(Array.from(individuals)) //Shallow freeze ... individuals are still mutable.
        for (let agent of this.asArray) {
            if (agent.hasOwnProperty('id')) {
                let id = agent.id
                if (id === "asArray") {
                    throw "\"asArray\" is a reserved attribute and cannot be used as an individual id."
                } else {
                    this[id] = agent
                }
            }
        }

        this.chance = Chance()

        Object.freeze(this) //Shallow freeze ... individuals are still mutable.
    }

    static of(count, idfn = index => index) {
        return new Population(Array.from({length: count},
            (agent, index) => ({state: State.Susceptible, id: idfn(index)})
        ))
    }

    assignAttributes(fn) {
        for (let agent of this.asArray) {
            Object.assign(agent, fn(agent)) //Individuals are mutable. References to them are not.
        }
        return this
    }

    sample(n) {
        return this.chance.pickset(this.asArray, n)
    }

    withState(state) {
        return this.asArray.filter((agent) => (agent.state === state))
    }
}