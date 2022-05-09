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
			data.type = 'minecraft:random_selector',
			data.config = {
				features: [],
				default: {
					feature: {
						type: 'minecraft:disk',
						config: {
							half_height: data.config.half_height,
							radius: data.config.radius,
							state_provider: {
								fallback: {
									type: 'minecraft:simple_state_provider',
									state: data.config.state,
								},
								rules: [],
				
							},
							target: {
								type: 'minecraft:matching_blocks',
								blocks: getBlockIds(data.config.targets),
							},
						},
					},
					placement: [
						...type === 'disk' ? [] : [{
							type: 'minecraft:random_offset',
							xz_spread: 0,
							y_spread: -1,
						}],
						{
							type: 'minecraft:block_predicate_filter',
							predicate: type === 'disk' ? {
								type: 'minecraft:matching_fluids',
								fluids: 'minecraft:water',
							} : type === 'ice_patch' ? {
								type: 'minecraft:matching_blocks',
								blocks: 'minecraft:snow',
							} : {
								type: 'minecraft:matching_blocks',
								blocks: data.config?.can_origin_replace?.filter((id: string) => id?.replace(/^minecraft:/, '') !== 'water') ?? [],
							},
						},
					],
				},
			}
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
