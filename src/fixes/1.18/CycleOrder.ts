import type { FixContext } from '../../Fix'
import type { Pack } from '../../Pack'

type FeatureData = {
	step: number,
	index: number,
	feature: string,
}

export async function CycleOrder(pack: Pack, ctx: FixContext) {
	const biomes = pack.data['worldgen/biome']
	await new Promise(res => setTimeout(res, 500))

	// const comparator = (a: FeatureData, b: FeatureData) => {
	// 	return a.step - b.step || a.index - b.index
	// }

	const featureData: FeatureData[] = []

	for (const biome of biomes) {
		const features = biome.data.features
		if (!Array.isArray(features)) throw Error('Expected features to be an array')
		
		for (let i = 0; i < features.length; i += 1) {
			const step = features[i]
			for (let j = 0; j < step.length; j += 1) {
				featureData.push({ step: i, index: j, feature: step[j] })
			}
		}
	}

	const choice = await ctx.prompt('Feature order cycle found: foo -> bar -> baz -> foo', 'Which feature should be first?', ['foo', 'bar', 'baz'])

	console.log(choice, featureData)

}
