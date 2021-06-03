import { Fix } from '../Fix'

/**
 * Adds the new config properties to configured carvers
 */
export const Carver = Fix.all([
	Fix.onFile('worldgen/configured_carver', fixCarver),
	Fix.onFile('worldgen/biome', (data) => {
		if (typeof data.carvers === 'object') {
			data.carvers.air?.forEach(fixCarver)
			data.carvers.liquid?.forEach(fixCarver)
		}
	}),
])

function fixCarver(data: any) {
	if (typeof data !== 'object') return
	const type = data.type.replace(/^minecraft:/, '')

	data.config.lava_level = { above_bottom: 10 }
	data.config.aquifers_enabled = false
	if (type === 'cave' || type === 'underwater_cave' || type === 'nether_cave') {
		if (type === 'nether_cave') {
			data.config.y = {
				type: 'minecraft:uniform',
				min_inclusive: { absolute: 0 },
				max_inclusive: { below_top: 1 },
			}
		} else {
			data.config.y = {
				type: 'minecraft:biased_to_bottom',
				min_inclusive: { absolute: 0 },
				max_inclusive: { absolute: 127 },
				inner: 8,
			}
		}
		data.config.yScale = 0.5
		data.config.horizontal_radius_multiplier = 1
		data.config.vertical_radius_multiplier = 1
		data.config.floor_level = -0.7
	} else {
		data.config.y = {
			type: 'minecraft:biased_to_bottom',
			min_inclusive: { absolute: 20 },
			max_inclusive: { absolute: 67 },
			inner: 8,
		}
		data.config.yScale = 3
		if (type === 'canyon') {
			data.config.vertical_rotation = {
				type: 'minecraft:uniform',
				value: { min_inclusive: -0.125, max_exclusive: 0.125 },
			}
			data.config.shape = {
				distance_factor: {
					type: 'minecraft:uniform',
					value: { min_inclusive: 0.75, max_exclusive: 1 },
				},
				thickness: {
					type: 'minecraft:trapezoid',
					value: { min: 0, max: 6, plateau: 2 },
				},
				width_smoothness: 3,
				horizontal_radius_factor: {
					type: 'minecraft:uniform',
					value: { min_inclusive: 0.75, max_exclusive: 1 },
				},
				vertical_radius_default_factor: 1,
				vertical_radius_center_factor: 0,
			}
		}
	}
}
