class StateInstance {
    constructor(code, displayName) {
        this.code = code
        this.displayName = displayName
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
    SUSCEPTIBLE: Object.freeze(new StateInstance('s', 'Susceptible')),
    EXPOSED: Object.freeze(new StateInstance('e', 'Exposed')),
    INFECTED: Object.freeze(new StateInstance('i', 'Infected')),
    REMOVED: Object.freeze(new StateInstance('r', 'Removed'))
}

State.asArray = Object.freeze(Object.values(State))

State.objectWithCodePropertyNames = function (valueFunction = () => []) {
    return Object.freeze(State.asArray.reduce((a, b) => ({...a, [b.code]: valueFunction(b)}), {}))
}

State.groupByCode = function (agents) {
    let grouped = State.objectWithCodePropertyNames()
    for (let agent of agents) {
        grouped[agent.state.code].push(agent)
    }
    return Object.freeze(grouped)
}

Object.freeze(State)