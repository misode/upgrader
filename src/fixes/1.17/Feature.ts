import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'

export const Feature = Fix.all(
	Fix.onFile('worldgen/configured_feature', fixFeature),
	Fix.onFile('worldgen/biome', (data) => {
		if (Array.isArray(data.starts)) {
			data.starts.forEach(fixFeature)
		}
	}),
)

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
		case 'emerald_ore':
			data.type = 'minecraft:replace_single_block',
			data.config = { targets: [ {
				target: {
					predicate_type: 'minecraft:blockstate_match',
					block_state: data.config.target,
				},
				state: data.config.state,
			} ] }
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
		case 'fossil':
			data.config = {
				max_empty_corners_allowed: 4,
				fossil_processors: 'minecraft:fossil_rot',
				overlay_processors: 'minecraft:fossil_coal',
				fossil_structures: [
					'minecraft:fossil/spine_1',
					'minecraft:fossil/spine_2',
					'minecraft:fossil/spine_3',
					'minecraft:fossil/spine_4',
					'minecraft:fossil/skull_1',
					'minecraft:fossil/skull_2',
					'minecraft:fossil/skull_3',
					'minecraft:fossil/skull_4',
				],
				overlay_structures: [
					'minecraft:fossil/spine_1_coal',
					'minecraft:fossil/spine_2_coal',
					'minecraft:fossil/spine_3_coal',
					'minecraft:fossil/spine_4_coal',
					'minecraft:fossil/skull_1_coal',
					'minecraft:fossil/skull_2_coal',
					'minecraft:fossil/skull_3_coal',
					'minecraft:fossil/skull_4_coal',
				],
			}
			break
		case 'netherrack_replace_blobs':
			const r = data.config.radius
			let min = typeof r === 'number' ? r : r.base
			let max = typeof r === 'number' ? r : r.base + r.spread
			if (max > 12) {
				ctx.warn('Feature "netherrack_replace_blobs" no longer allows values above 12. Consider increasing the count of this feature.')
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
			data.type = 'minecraft:ore'
			data.config.discard_chance_on_air_exposure = 1
			break
		case 'ore':
			fixOre(data)
			break
		case 'random_boolean_selector':
			fixFeature(data.config.feature_false, ctx)
			fixFeature(data.config.feature_true, ctx)
			break
		case 'random_selector':
			data.config.features.forEach((e: any) => fixFeature(e.feature, ctx))
			fixFeature(data.config.default, ctx)
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
		case 'simple_random_selector':
			data.config.features.forEach((feature: any) => fixFeature(feature, ctx))
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
					Properties: {
						stage: '0',
					},
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
		const match = foliage.state.Name.match(/^(?:minecraft:)?([a-z_]+)_leaves/)
		if (match) {
			return `minecraft:${match[1]}_sapling`
		}
	}
	return 'minecraft:oak_sapling'
}

function fixDecorator(data: any, ctx: FixContext) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'carving_mask':
			if (data.config.probability === 0) {
				data.type = 'minecraft:nope'
				data.config = {}
				break
			}
			const chance = 1 / data.config.probability
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
		case 'count':
		case 'count_multilayer':
			const c = data.config.count
			let min0 = typeof c === 'number' ? c : c.base
			let max0 = typeof c === 'number' ? c : c.base + c.spread
			if (min0 < 0) {
				ctx.warn(`Decorator "${type}" no longer allows negative values.`)
				min0 = Math.max(0, min0)
				max0 = Math.max(0, max0)
			}
			if (min0 === max0) {
				data.config.count = min0
				break
			}
			data.config.count = {
				type: 'minecraft:uniform',
				value: {
					min_inclusive: min0,
					max_inclusive: max0,
				},
			}
			break
		case 'decorated':
			fixDecorator(data.config.outer, ctx)
			fixDecorator(data.config.inner, ctx)
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
			const chance2 = data.config.chance / 10
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				...Number.isInteger(chance2) ? [
					{ type: 'minecraft:chance', config: { chance: chance2 } },
				] : [
					{ type: 'minecraft:count_extra', config: {
						count: 0,
						extra_count: 1,
						extra_chance: 1 / chance2,
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
			const count = typeof data.config.count === 'number' ? data.config.count : data.config.count.base + data.config.count.spread / 2
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
			const count2 = typeof data.config.count === 'number' ? data.config.count : data.config.count.base + data.config.count.spread / 2
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				{ type: 'minecraft:count', config: { count: {
					type: 'minecraft:biased_to_bottom', value: {
						min_inclusive: 0,
						max_inclusive: Math.ceil(count2 - 1),
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
			const min = data.config.bottom_offset
			const max = data.config.bottom_offset + data.config.maximum - data.config.top_offset - 1
			if (min === max) {
				data.config = {
					height: { absolute: min },
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
			const min2 = data.config.bottom_offset
			const max2 = data.config.bottom_offset + data.config.maximum - data.config.top_offset - 1
			data.type = 'minecraft:range'
			data.config = {
				height: {
					type: 'minecraft:biased_to_bottom',
					min_inclusive: { absolute: min2 },
					max_inclusive: { absolute: max2 },
					cutoff: min2,
				},
			}
			break
		case 'range_very_biased':
			const min3 = data.config.bottom_offset
			const max3 = data.config.bottom_offset + data.config.maximum - data.config.top_offset - 1
			data.type = 'minecraft:range'
			data.config = {
				height: {
					type: 'minecraft:very_biased_to_bottom',
					min_inclusive: { absolute: min3 },
					max_inclusive: { absolute: max3 },
					cutoff: min3,
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
		case 'emerald_ore':
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				{ type: 'minecraft:count', config: { count: {
					type: 'minecraft:uniform',
					value: { min_inclusive: 3, max_inclusive: 8 },
				} } },
				{ type: 'minecraft:square', config: {} },
				{ type: 'minecraft:range', config: { height: {
					type: 'minecraft:uniform',
					min_inclusive: { absolute: 4 },
					max_inclusive: { absolute: 31 },
				} } }
			)
			break
		case 'end_island':
			data.type = 'minecraft:decorated'
			data.config = combinedDecorators(
				{ type: 'minecraft:chance', config: { chance: 14 } },
				{ type: 'minecraft:count_extra', config: {
					count: 1,
					extra_count: 1,
					extra_chance: 0.25,
				} },
				{ type: 'minecraft:square', config: {} },
				{ type: 'minecraft:range', config: { height: {
					type: 'minecraft:uniform',
					min_inclusive: { absolute: 55 },
					max_inclusive: { absolute: 70 },
				} } }
			)
			break
		case 'magma':
			ctx.warn('Removed decorator "magma" previously used the sea level. Assumed sea level is 32 and replaced with a range decorator between 27 and 36.')
			data.type = 'minecraft:range'
			data.config = { height: {
				type: 'minecraft:uniform',
				min_inclusive: { absolute: 27 },
				max_inclusive: { absolute: 36 },
			} }
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
