class StateInstance {
    constructor(code) {
        this.code = code
    }

    asFilter() {
        return (agent) => (agent.state === this)
    }

    apply(agents) {
        for (let agent of agents) {
            agent.state = this
        }
    }
}

export const State = Object.freeze({
    SUSCEPTIBLE: Object.freeze(new StateInstance('s')),
    EXPOSED: Object.freeze(new StateInstance('e')),
    INFECTED: Object.freeze(new StateInstance('i')),
    REMOVED: Object.freeze(new StateInstance('r'))
})