const State = Object.freeze({
    'Susceptible': 0,
    'Exposed': 1,
    'Infected': 2,
    'Symptomatic': 3,
    'Removed': 4
})


export default class Individual {

    constructor() {
        this.state = State.Susceptible;
    }

    state() {
        return this.state
    }
}