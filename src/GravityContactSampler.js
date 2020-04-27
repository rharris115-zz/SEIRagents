export class GravityContactSampler {
    constructor(population, maxDistance, exponent) {

        this.population = population
        this.chance = new Chance()

        let tree = new kdTree(
            population.individuals,
            (i1, i2) => Math.sqrt((i1.x - i2.x) ** 2 + (i1.y - i2.y) ** 2),
            ['x', 'y']
        )

        let contact_gravity = population.individuals.map((individual) => {
            return tree.nearest(individual, population.individuals.length, maxDistance)
                .filter(link => {
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

        this.neighborIdsById = population.individuals
            .map((individual, index) => ({id: individual.id, neighborIds: neighborIds[index]}))
            .reduce((a, b) => ({...a, [b.id]: b.neighborIds}), {})

        let neighborGravities = contact_gravity
            .map(neighbors => Array.from(neighbors, neighbor => neighbor.gravity))

        this.neighborGravitiesById = population.individuals
            .map((individual, index) => ({id: individual.id, neighborGravities: neighborGravities[index]}))
            .reduce((a, b) => ({...a, [b.id]: b.neighborGravities}), {})

        //Sum up the total gravity for each individual.
        this.individual_total_gravity = neighborGravities
            .map(neighborGravity => neighborGravity.reduce((a, b) => a + b, 0))
    }

    sampleIndividual() {
        return this.chance.weighted(this.population.individuals, this.individual_total_gravity)
    }

    sampleNeighbor(id) {
        return this.chance.weighted(this.neighborIdsById[id], this.neighborGravitiesById[id])
    }
}