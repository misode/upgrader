import { Fix } from '../../Fix'

export const Feature = Fix.all(
	Fix.onFile('worldgen/configured_feature', ({ data }) => fixConfiguredFeature(data)),
	Fix.onFile('worldgen/placed_feature', ({ data }) => fixPlacedFeature(data)),
)

function fixPlacedFeature(data: any) {
	if (typeof data !== 'object') return

	fixConfiguredFeature(data.feature)
}

function fixConfiguredFeature(data: any) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'random_boolean_selector':
			fixPlacedFeature(data.config.feature_false)
			fixPlacedFeature(data.config.feature_true)
			break
		case 'random_patch':
		case 'flower':
		case 'no_bonemeal_flower':
			fixPlacedFeature(data.config.feature)
			break
		case 'random_selector':
			data.config.features.forEach((e: any) => {
				fixPlacedFeature(e.feature)
			})
			fixPlacedFeature(data.config.default)
			break
		case 'simple_random_selector':
			data.config.features.forEach((f: any) => {
				fixPlacedFeature(f)
			})
			break
		case 'vegetation_patch':
		case 'waterlogged_vegetation_patch':
			fixPlacedFeature(data.config.vegetation_feature)
			break
		case 'disk':
		case 'ice_patch':
		case 'surface_disk':
			data.type = 'minecraft:disk'
			data.config.state_provider = {
				fallback: {
					type: 'minecraft:simple_state_provider',
					state: data.config.state,
				},
				rules: [],
			}
			delete data.config.state
			data.config.target = {
				type: 'minecraft:matching_blocks',
				blocks: getBlockIds(data.config.targets),
			}
			delete data.config.targets
			break
		case 'glow_lichen':
			data.type = 'minecraft:multiface_growth'
			break
		case 'tree':
			data.config.decorators?.forEach((decorator: any) => {
				if (decorator?.type?.replace(/^minecraft:/, '') === 'leave_vine') {
					decorator.probability = 0.25
				}
			})
			break
	}
}

function getBlockIds(states: any[]) {
	return [...new Set(states.map((state: any) => state.Name))]
}
