function deepFreeze(object) {
    for (let name of Object.getOwnPropertyNames(object)) {
        let value = object[name]
        if (value && typeof value === "object") {
            deepFreeze(value)
        }
    }
    return Object.freeze(object);
}

export class GravityContactSampler {

    constructor(population, maxDistance = 0.25, exponent = -2) {
        let tree = new kdTree(
            Array.from(population.asArray), //The kd tree will sort this list so let's pass a copy.
            (i1, i2) => Math.sqrt((i1.x - i2.x) ** 2 + (i1.y - i2.y) ** 2), //Euclidean
            ['x', 'y']
        )

        // This is a list of lists of objects containing neighbor ids and gravity. Its in the same
        // order as population.asArray.
        let contact_gravity = population.asArray.map(agent => (
            tree.nearest(agent, population.asArray.length, maxDistance)
                .filter(([neighbor, distance]) => ((neighbor !== agent) && distance !== 0))
                .map(([neighbor, distance]) => ({id: neighbor.id, gravity: distance ** exponent}))
        ))

        // In the same order as population.asArray.
        let neighborIds = contact_gravity
            .map(neighbors => Array.from(neighbors, neighbor => neighbor.id))

        // In the same order as population.asArray.
        let neighborGravities = contact_gravity
            .map(neighbors => Array.from(neighbors, neighbor => neighbor.gravity))

        // An object with individual.id as attributes.
        let neighborIdsById = population.asArray
            .map((agent, index) => ({id: agent.id, neighborIds: neighborIds[index]}))
            .reduce((a, b) => ({...a, [b.id]: b.neighborIds}), {})


        // An object with individual.id as attributes.
        let neighborGravitiesById = population.asArray
            .map((individual, index) => ({id: individual.id, neighborGravities: neighborGravities[index]}))
            .reduce((a, b) => ({...a, [b.id]: b.neighborGravities}), {})

        //Sum up the total gravity for each individual. This will determine their probability of initial sampling.
        let agent_total_gravity = neighborGravities
            .map(neighborGravity => neighborGravity.reduce((a, b) => a + b, 0))

        this.chance = new Chance()
        this.population = population

        this.neighborIdsById = deepFreeze(neighborIdsById)
        this.neighborGravitiesById = deepFreeze(neighborGravitiesById)
        this.individual_total_gravity = deepFreeze(agent_total_gravity)
        Object.freeze(this) //We only want to shallow freeze this instance. We don't want to freeze this.population.
    }


    static builder(population) {
        class Builder {
            constructor(population) {
                this.population = population
            }

            withMaxDistance(maxDistance) {
                this.maxDistance = maxDistance
                return this
            }

            withExponent(exponent) {
                this.exponent = exponent
                return this
            }

            build() {
                return new GravityContactSampler(this.population, this.maxDistance, this.exponent);
            }
        }

        return new Builder(population);
    }

    sampleAgent() {
        return this.chance.weighted(this.population.asArray, this.individual_total_gravity)
    }

    sampleNeighbor(id) {
        let neighborId = this.chance.weighted(this.neighborIdsById[id], this.neighborGravitiesById[id])
        return this.population[neighborId]
    }
}