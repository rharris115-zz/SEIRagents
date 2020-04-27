export class GravityContactSampler {
    constructor(population, maxDistance, exponent) {

        this.population = population

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
                .reduce((a, x) => ({...a, [x.id]: x.gravity}), {})
        })


        let individual_total_gravity = contact_gravity.map(gs => Object.values(gs).reduce((a, b) => a + b, 0))

        let total_gravity = individual_total_gravity.reduce((a, b) => a + b, 0)

        this.individual_probs = individual_total_gravity.map(itg => itg / total_gravity)

        this.individual_contact_probs = contact_gravity
            .map((gs, index) => {
                return Object.entries(gs)
                    .map((entry) => {
                        let [id, g] = entry
                        return {id: id, p: g / individual_total_gravity[index]}
                    })
                    .reduce((a, x) => ({...a, [x.id]: x.p}), {})
            })

        this.chance = new Chance()
    }

    sample() {
        let individual = this.chance.weighted(this.population.individuals, this.individual_probs)
        return individual
    }
}