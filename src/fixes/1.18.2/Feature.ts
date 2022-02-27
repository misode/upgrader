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
			data.config.features = data.config.features.forEach((f: any) => {
				fixPlacedFeature(f)
			})
			break
		case 'vegetation_patch':
		case 'waterlogged_vegetation_patch':
			fixPlacedFeature(data.config.vegetation_feature)
			break
		case 'geode':
			if (typeof data.config?.blocks === 'object') {
				data.config.blocks.cannot_replace = '#' + data.config.blocks.cannot_replace
				data.config.blocks.invalid_blocks = '#' + data.config.blocks.invalid_blocks
			}
			break
		case 'root_system':
			if (typeof data.config === 'object') {
				data.config.root_replaceable = '#' + data.config.root_replaceable
			}
	}
}
