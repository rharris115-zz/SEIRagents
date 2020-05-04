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

export const State = {
    SUSCEPTIBLE: Object.freeze(new StateInstance('s')),
    EXPOSED: Object.freeze(new StateInstance('e')),
    INFECTED: Object.freeze(new StateInstance('i')),
    REMOVED: Object.freeze(new StateInstance('r'))
}

State.asArray = Object.freeze(Object.values(State))

State.objectWithCodeAttributes = function (valueFunction = () => []) {
    return Object.freeze(State.asArray.reduce((a, b) => ({...a, [b.code]: valueFunction(b)}), {}))
}

State.groupByCode = function (agents) {
    let grouped = State.objectWithCodeAttributes()
    for (let agent of agents) {
        grouped[agent.state.code].push(agent)
    }
    return Object.freeze(grouped)
}

Object.freeze(State)