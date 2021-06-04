import type { FixContext } from '../Fix'
import { Fix } from '../Fix'

export const Feature = Fix.all([
	Fix.onFile('worldgen/configured_feature', fixFeature),
	Fix.onFile('worldgen/biome', (data) => {
		if (Array.isArray(data.starts)) {
			data.starts.forEach(fixFeature)
		}
	}),
])

function fixFeature(data: any, ctx: FixContext) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'basalt_columns':
			fixUniformInt(data.config, 'reach')
			fixUniformInt(data.config, 'height')
			break
		case 'decorated':
			fixDecorator(data.config.decorator, ctx)
			fixFeature(data.config.feature, ctx)
			break
		case 'delta_feature':
			fixUniformInt(data.config, 'size')
			fixUniformInt(data.config, 'rim_size')
			break
		case 'disk':
		case 'ice_patch':
			fixUniformInt(data.config, 'radius')
			break
		case 'flower':
		case 'no_bonemeal_flower':
		case 'random_patch':
			const placer = data.config.block_placer
			if (placer.type.replace(/^minecraft:/, '') === 'column_placer') {
				placer.size = {
					type: 'minecraft:uniform',
					value: {
						min_inclusive: placer.min_size,
						max_inclusive: placer.min_size + placer.extra_size,
					},
				}
				delete placer.min_size
				delete placer.extra_size
			}
			break
		case 'netherrack_replace_blobs':
			let min = data.config.radius.base
			let max = data.config.radius.base + data.config.radius.spread
			if (max > 12) {
				ctx.warn(`Feature "netherrack_replace_blobs" radius ${max} is greater than 12 and could not be perfectly upgraded. Consider increasing the count of this feature.`)
				min = Math.min(12, min)
				max = Math.min(12, max)
			}
			if (min === max) {
				data.config.radius = min
				break
			}
			data.config.radius = {
				type: 'minecraft:uniform',
				value: {
					min_inclusive: min,
					max_inclusive: max,
				},
			}
			break
		case 'no_surface_ore':
			fixOre(data)
			data.config.discard_chance_on_air_exposure = 1
			break
		case 'ore':
			fixOre(data)
			break
		case 'sea_pickle':
			fixUniformInt(data.config, 'count')
			break
		case 'simple_block':
			data.config.to_place = {
				type: 'minecraft:simple_state_provider',
				state: data.config.to_place,
			}
			break
		case 'tree':
			['radius', 'offset', 'crown_height', 'height', 'trunk_height']
				.forEach(k => fixUniformInt(data.config.foliage_placer, k))
			data.config.foliage_provider = data.config.leaves_provider
			delete data.config.leaves_provider
			data.config.force_dirt = false
			data.config.dirt_provider = {
				type: 'minecraft:simple_state_provider',
				state: {
					Name: 'minecraft:dirt',
				},
			}
			data.config.sapling_provider = {
				type: 'minecraft:simple_state_provider',
				state: {
					Name: getSapling(data.config.foliage_provider),
				},
			}
			data.type = 'minecraft:decorated'
			data.config = {
				decorator: {
					type: 'decorated',
					config: combinedDecorators(
						{ type: 'minecraft:water_depth_threshold', config: {
							max_water_depth: data.config.max_water_depth,
						} },
						{ type: 'minecraft:heightmap', config: {
							heightmap: data.config.heightmap,
						} }
					),
				},
				feature: {
					type: 'minecraft:tree',
					config: data.config,
				},
			}
			delete data.config.feature.config.max_water_depth
			delete data.config.feature.config.heightmap
			break
	}
}

function fixUniformInt(data: any, key: string) {
	if (typeof data?.[key] === 'object') {
		data[key] = {
			type: 'minecraft:uniform',
			value: {
				min_inclusive: data[key].base,
				max_inclusive: data[key].base + data[key].spread,
			},
		}
	}
}

function fixOre(data: any) {
	data.config.discard_chance_on_air_exposure = 0
	data.config.targets = [{
		target: data.config.target,
		state: data.config.state,
	}]
	delete data.config.target
	delete data.config.state
}

function getSapling(foliage: any) {
	if (foliage.type.replace(/^minecraft:/, '') === 'simple_state_provider') {
		const match = foliage.state.Name.match(/^(?:minecraft:)?()_leaves/)
		if (match) {
			return `minecraft:${match[1]}_sapling`
		}
	}
	return 'minecraft:oak_sapling'
}

function fixDecorator(data: any, _ctx: FixContext) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'carving_mask':
			if (data.config.probability === 0) {
				data.type = 'minecraft:nope'
				data.config = {}
				break
			}
			let chance = 1 / data.config.probability
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				{ type: 'minecraft:carving_mask', config: { step: data.config.step } },
				...Number.isInteger(chance) ? [
					{ type: 'minecraft:chance', config: { chance: chance } },
				] : [
					{ type: 'minecraft:count_extra', config: {
						count: 0,
						extra_count: 1,
						extra_chance: data.config.probability,
					} },
				]
			)
			delete data.config.probability
			break
		case 'heightmap_world_surface':
			data.type = 'minecraft:heightmap'
			data.config = { heightmap: 'WORLD_SURFACE_WG' }
			break
		case 'top_solid_heightmap':
			data.type = 'minecraft:heightmap'
			data.config = { heightmap: 'OCEAN_FLOOR_WG' }
			break
		case 'heightmap':
		case 'heightmap_spread_double':
			data.config = { heightmap: 'MOTION_BLOCKING' }
			break
		case 'water_lake':
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				{ type: 'minecraft:chance', config: { chance: data.config.chance } },
				{ type: 'minecraft:square', config: {} },
				{ type: 'minecraft:range', config: { height: {
					type: 'minecraft:biased_to_bottom',
					min_inclusive: { absolute: 0 },
					max_inclusive: { absolute: 256 },
					inner: 8,
				} } }
			)
			break
		case 'lava_lake':
			chance = data.config.chance / 10
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				...Number.isInteger(chance) ? [
					{ type: 'minecraft:chance', config: { chance: chance } },
				] : [
					{ type: 'minecraft:count_extra', config: {
						count: 0,
						extra_count: 1,
						extra_chance: 1 / chance,
					} },
				],
				{ type: 'minecraft:square', config: {} },
				{ type: 'minecraft:range', config: { height: {
					type: 'minecraft:biased_to_bottom',
					min_inclusive: { absolute: 0 },
					max_inclusive: { absolute: 256 },
					inner: 8,
				} } },
				{ type: 'minecraft:lava_lake', config: { chance: 10 } },
			)
			break
		case 'fire':
			let count = typeof data.config.count === 'number' ? data.config.count : data.config.count.base + data.config.count.spread / 2
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				{ type: 'minecraft:count', config: { count: {
					type: 'minecraft:biased_to_bottom', value: {
						min_inclusive: 0,
						max_inclusive: Math.ceil(count / 2),
					},
				} } },
				{ type: 'minecraft:square', config: {} },
				{ type: 'minecraft:range', config: { height: {
					type: 'minecraft:uniform',
					min_inclusive: { absolute: 4 },
					max_inclusive: { absolute: 252 },
				} } },
			)
			break
		case 'glowstone':
			count = typeof data.config.count === 'number' ? data.config.count : data.config.count.base + data.config.count.spread / 2
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				{ type: 'minecraft:count', config: { count: {
					type: 'minecraft:biased_to_bottom', value: {
						min_inclusive: 0,
						max_inclusive: Math.ceil(count - 1),
					},
				} } },
				{ type: 'minecraft:square', config: {} },
				{ type: 'minecraft:range', config: { height: {
					type: 'minecraft:uniform',
					min_inclusive: { absolute: 4 },
					max_inclusive: { absolute: 252 },
				} } },
			)
			break
		case 'range':
			let min = data.config.bottom_offset
			let max = data.config.bottom_offset + data.config.maximum - data.config.top_offset - 1
			if (min === max) {
				data.config = {
					height: min,
				}
				break
			}
			data.config = {
				height: {
					type: 'minecraft:uniform',
					min_inclusive: { absolute: min },
					max_inclusive: { absolute: max },
				},
			}
			break
		case 'range_biased':
			min = data.config.bottom_offset
			max = data.config.bottom_offset + data.config.maximum - data.config.top_offset - 1
			data.config = {
				height: {
					type: 'minecraft:biased_to_bottom',
					min_inclusive: { absolute: min },
					max_inclusive: { absolute: max },
					cutoff: min,
				},
			}
			break
		case 'range_very_biased':
			min = data.config.bottom_offset
			max = data.config.bottom_offset + data.config.maximum - data.config.top_offset - 1
			data.config = {
				height: {
					type: 'minecraft:very_biased_to_bottom',
					min_inclusive: { absolute: min },
					max_inclusive: { absolute: max },
					cutoff: min,
				},
			}
			break
		case 'depth_average':
			data.type = 'minecraft:range'
			data.config = {
				height: {
					type: 'minecraft:trapezoid',
					min_inclusive: { absolute: data.config.baseline },
					max_inclusive: { absolute: data.config.baseline + data.config.spread },
				},
			}
			break
	}
}

function combinedDecorators(...decorators: any[]): any {
	return {
		outer: decorators[0],
		inner: decorators.length === 2 ? decorators[1] : {
			type: 'minecraft:decorated',
			config: combinedDecorators(...decorators.slice(1)),
		},
	}
}
