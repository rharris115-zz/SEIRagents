const State = Object.freeze({
    Susceptible: 0,
    Exposed: 1,
    Infected: 2,
    Symptomatic: 3,
    Removed: 4
})


export let unit_square_distribution = () => {
    return {x: Math.random(), y: Math.random()};
}

export class Population {

    constructor(individuals) {
        this.individuals = Array.from(individuals)
        this.individuals.forEach((individual) => {
            if (individual.hasOwnProperty('id')) {
                this[individual.id] = individual
            }
        })
    }

    static of(count, idfn = (index) => index) {
        return new Population(Array.from({length: count}, (individual, index) => {
            let id = idfn(index)
            return {state: State.Susceptible, id: id}
        }));
    }

    with(fn) {
        this.individuals.forEach((individual, id) => {
            Object.assign(individual, fn(individual, id));
        })
        return this;
    }
}