import type { FixContext } from '../../Fix'
import type { Pack } from '../../Pack'

type FeatureData = {
	id: string,
	biome: string,
	depends: Set<string>,
}

const STEPS = ['raw_generation', 'lakes', 'local_modifications', 'underground_structures', 'surface_structures', 'strongholds', 'underground_ores', 'underground_decoration', 'fluid_springs', 'vegetal_decoration', 'top_layer_modification']

export async function CycleOrder(pack: Pack, ctx: FixContext) {
	const biomes = pack.data['worldgen/biome']

	const biomesWithDuplicates = new Set<string>()
	for (let step = 0; step < STEPS.length; step += 1) {
		const features: FeatureData[] = []
		for (const biome of biomes) {
			const stepFeatures: string[] = biome.data.features[step] ?? []
			for (let index = 0; index < stepFeatures.length; index += 1) {
				const id = stepFeatures[index]
				if (features.some(f => f.biome === biome.name && f.id === id)) {
					biomesWithDuplicates.add(biome.name)
					continue
				}
				const depends = new Set(stepFeatures.slice(0, index))
				features.push({ id, biome: biome.name, depends })
			}
		}

		const sortedFeatures: FeatureData[] = []
		const startFeatures = features.filter(f => features.filter(g => f.id === g.id).every(g => g.depends.size === 0))
		while (startFeatures.length > 0) {
			const node = startFeatures.pop()!
			if (sortedFeatures.some(f => f.id === node.id)) continue
			sortedFeatures.push(node)
			for (const member of features.filter(f => f.depends.has(node.id))) {
				member.depends.delete(node.id)
				if (features.filter(g => member.id === g.id).every(g => g.depends.size === 0)) {
					startFeatures.push(member)
				}
			}
		}

		// There is at least one cycle
		if (features.some(f => f.depends.size > 0)) {
			const visitedBiomes = new Set<string>()
			const visitedFeatures = new Set<string>()
			function findCycle(node: FeatureData, start: FeatureData, depth: number): false | FeatureData[] {
				if (depth <= 0) return false
				visitedBiomes.add(node.biome)
				visitedFeatures.add(node.id)
				for (const dep of node.depends) {
					if (dep === start.id) {
						return [start]
					}
					if (visitedFeatures.has(dep)) continue
					for (const member of features.filter(f => f.id === dep && !visitedBiomes.has(f.biome))) {
						const cycle = findCycle(member, start, depth - 1)
						if (cycle) {
							return [member, ...cycle]
						}
					}
				}
				visitedBiomes.delete(node.biome)
				return false
			}

			let cycle: false | FeatureData[] = false
			const startCandidates = features.filter(f => f.depends.size > 0)
			outer:
			for (let depth = 2; depth < 10; depth += 1) {
				for (const start of startCandidates) {
					visitedBiomes.clear()
					visitedFeatures.clear()
					cycle = findCycle(start, start, depth)
					if (cycle) break outer
				}
			}
			if (cycle) {
				const info = [`Cycle in step ${step} (${STEPS[step]}):`]
				for (let i = cycle.length - 1; i >= 0; i -= 1) {
					const node = cycle[i]
					const nextNode = cycle[(i + 1 + cycle.length) % cycle.length]
					info.push(`• Biome ${node.biome}: '${nextNode.id}' -> '${node.id}'`)
				}
				ctx.warn('!Feature order cycle found. Needs manual fixing.', [], info)
			}
		}
	}

	if (biomesWithDuplicates.size > 0) {
		ctx.warn('!Detected duplicate features. They are no longer allowed.', [...biomesWithDuplicates])
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
