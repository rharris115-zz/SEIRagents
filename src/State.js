export class StateInstance {
    constructor(code) {
        this.code = code
    }

    asFilter() {
        return (agent) => (agent.state === this)
    }

    asSupplier() {
        return () => this
    }
}

export const State = Object.freeze({
    Susceptible: Object.freeze(new StateInstance('s')),
    Exposed: Object.freeze(new StateInstance('e')),
    Infected: Object.freeze(new StateInstance('i')),
    Removed: Object.freeze(new StateInstance('r'))
})


