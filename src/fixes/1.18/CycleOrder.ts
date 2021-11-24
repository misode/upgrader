import type { FixContext } from '../../Fix'
import type { Pack } from '../../Pack'

type FeatureData = {
	id: string,
	biome: string,
	depends: Set<string>,

}

export async function CycleOrder(pack: Pack, ctx: FixContext) {
	const biomes = pack.data['worldgen/biome']

	for (let step = 0; step < 11; step += 1) {
		console.warn(`Step ${step}`)
		const features: FeatureData[] = []
		for (const biome of biomes) {
			const stepFeatures: string[] = biome.data.features[step] ?? []
			const lastFeature: string = ''
			for (let index = 0; index < stepFeatures.length; index += 1) {
				const id = stepFeatures[index]
				if (id === lastFeature) continue
				const depends = new Set(stepFeatures.slice(0, index))
				features.push({ id, biome: biome.name, depends })
			}
		}
		const featureCount = new Set(features.map(f => f.id)).size
		const sortedFeatures: FeatureData[] = []
		console.log(featureCount, sortedFeatures.length)

		while (sortedFeatures.length < featureCount) {
			await new Promise(res => setTimeout(res, 500))

			const startFeatures = features.filter(f => features.filter(g => f.id === g.id).every(g => g.depends.size === 0))
			while (startFeatures.length > 0) {
				const node = startFeatures.pop()!
				sortedFeatures.push(node)
				for (const member of features.filter(f => f.depends.has(node.id))) {
					member.depends.delete(node.id)
					if (features.filter(g => member.id === g.id).every(g => g.depends.size === 0)) {
						startFeatures.push(member)
					}
				}
			}

			console.log('All:', features)
			console.log('Sorted:', sortedFeatures)
			if (features.some(f => f.depends.size > 0)) {
				console.log('There is at least one cycle')
				const start = features.find(f => f.depends.size > 0)!
				function findCycle(node: FeatureData): false | FeatureData[] {
					console.log(`${node.id}: [${[...node.depends]}]`)
					for (const dep of node.depends) {
						if (dep === start.id) {
							return [start]
						}
						for (const member of features.filter(f => f.id === dep)) {
							const cycle = findCycle(member)
							if (cycle) {
								return [member, ...cycle]
							}
						}
					}
					return false
				}

				const cycle = findCycle(start)
				if (!cycle) {
					throw new Error('Cound not find cycle when there is one')
				}
				const info = cycle.map(f => `Biome ${f.biome}: ${[...f.depends]} -> ${f.id}`)
				const choice = await ctx.prompt(
					'Feature order cycle found',
					'Which feature should go first?',
					cycle.map(f => f.id),
					[`Cycle in step ${step}:`, ...info]
				)

				// Update features to match the choice
				features.filter(f => f.id === choice)
					.forEach(f => cycle.forEach(c => f.depends.delete(c.id)))
			}
		}

		console.log('All features sorted!', sortedFeatures)
		for (const biome of biomes) {
			const stepFeatures: string[] = biome.data.features[step] ?? []
			for (let index = 0; index < stepFeatures.length; index += 1) {
				// TODO
			}
		}
	}
}

// Code to check if features are in different steps
/*

	const features: FeatureData[] = []
	for (const biome of biomes) {
		const biomeFeatures = biome.data.features as string[][]
		for (let step = 0; step < biomeFeatures.length; step += 1) {
			const stepFeatures = biomeFeatures[step] as string[]
			for (let index = 0; index < stepFeatures.length; index += 1) {
				const feature = stepFeatures[index]
				const before = new Set(stepFeatures.slice(0, index))
				const after = new Set(stepFeatures.slice(index + 1))
				features.push({ feature, step, biomes: new Set([biome.name]), before, after })
			}
		}
	}

	// Detect when a feature appears in multiple steps
	const featureSteps = new Map<string, Set<number>>()
	for (const data of features) {
		const steps = featureSteps.get(data.feature)
		if (steps === undefined) {
			featureSteps.set(data.feature, new Set([data.step]))
		} else {
			steps.add(data.step)
		}
	}
	for (const [feature, steps] of featureSteps) {
		if (steps.size > 1) {
			const choice = parseInt(await ctx.prompt(
				`Feature order cycle found: Conflicting steps for feature "${feature}"`,
				'Which step should it be in?',
				[...steps].map(s => s.toFixed())
			))
			// Correct the features which were in a different step
			features.filter(f => f.feature === feature && f.step !== choice).forEach(f => {
				f.step = choice
				f.before.clear()
				f.after.clear()
			})
		}
	}
	*/
