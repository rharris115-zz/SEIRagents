const State = Object.freeze({
    'Susceptible': 0,
    'Exposed': 1,
    'Infected': 2,
    'Symptomatic': 3,
    'Removed': 4
})

export let index_as_id = (individual, index) => {
    return {id: index};
}

export let unit_square_distribution = () => {
    return {x: Math.random(), y: Math.random()};
}

export class Population {

    constructor(population = []) {
        this.population = Array.from(population)
    }

    static of(count) {
        return new Population(Array.from({length: count}, () => {
                return {state: State.Susceptible};
            }
        ));
    }

    with(fn) {
        this.population.forEach((individual, index) => {
            Object.assign(individual, fn(individual, index));
        })
        return this;
    }
}