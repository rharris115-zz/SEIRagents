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

State.groupByCode = function (agents) {
    let grouped = Object.values(State)
        .reduce((a, b) => {
            return {...a, [b.code]: []}
        }, {})
    for (let agent of agents) {
        let code = agent.state.code
        grouped[code].push(agent)
    }
    return Object.freeze(grouped)
}


Object.freeze(State)