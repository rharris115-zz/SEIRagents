export class GravityContactSampler {
    constructor(population, maxDistance = 0.25, exponent = -2) {

        this.population = population

        let tree = new kdTree(
            Array.from(population.asArray), //The kd tree will sort this list so let's pass a copy.
            (i1, i2) => Math.sqrt((i1.x - i2.x) ** 2 + (i1.y - i2.y) ** 2), //Euclidean
            ['x', 'y']
        )

        // This is a list of lists of objects containing neighbor ids and gravity. Its in the same
        // order as population.asArray.
        let contact_gravity = population.asArray.map((individual) => {
            return tree.nearest(individual, population.asArray.length, maxDistance)
                .filter(link => { //Remove self links.
                    let [neighbor, distance] = link
                    return distance !== 0
                })
                .map(link => {
                    let [neighbor, distance] = link
                    return {id: neighbor.id, gravity: distance ** exponent}
                })
        })

        let neighborIds = contact_gravity
            .map(neighbors => Array.from(neighbors, neighbor => neighbor.id))

        let neighborGravities = contact_gravity
            .map(neighbors => Array.from(neighbors, neighbor => neighbor.gravity))

        this.neighborIdsById = population.asArray
            .map((individual, index) => ({id: individual.id, neighborIds: neighborIds[index]}))
            .reduce((a, b) => ({...a, [b.id]: b.neighborIds}), {})

        this.neighborGravitiesById = population.asArray
            .map((individual, index) => ({id: individual.id, neighborGravities: neighborGravities[index]}))
            .reduce((a, b) => ({...a, [b.id]: b.neighborGravities}), {})

        //Sum up the total gravity for each individual. This will determine probability of initial sampling.
        this.individual_total_gravity = neighborGravities
            .map(neighborGravity => neighborGravity.reduce((a, b) => a + b, 0))

        this.chance = new Chance()

        Object.freeze(this)
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

    sampleIndividual() {
        return this.chance.weighted(this.population.asArray, this.individual_total_gravity)
    }

    sampleNeighbor(id) {
        let neighborId = this.chance.weighted(this.neighborIdsById[id], this.neighborGravitiesById[id])
        return this.population[neighborId]
    }
}