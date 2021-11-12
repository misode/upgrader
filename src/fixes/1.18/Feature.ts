import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'
import type { PackFile } from '../../Pack'

export const Feature = Fix.all(
	Fix.onFile('worldgen/configured_feature', fixRootFeature),

	// Remove or rename vanilla configured features
	Fix.onFile('worldgen/biome', ({ data }, ctx) => {
		if (!Array.isArray(data.features)) return
		data.features = data.features.map((d: any) => {
			if (!Array.isArray(d)) return d
			return d.flatMap(e => {
				if (typeof e !== 'string') return e
				const replacement = fixFeatureId(e, ctx)
				replacement.forEach(r => {
					const file = ctx.read('worldgen/placed_feature', r)
					if (!file) return
					if (file.data.placement.find((p: any) => p.type === 'minecraft:biome')) return
					file.data.placement.push({ type: 'minecraft:biome' })
				})
				return replacement
			})
		})
	}),
)

function fixFeatureId(str: string, ctx: FixContext) {
	const id = str.replace(/^minecraft:/, '')
	if (id === 'meadow_trees') {
		return ['minecraft:trees_meadow']
	} else if (id === 'lake_lava') {
		return ['minecraft:lake_lava_surface', 'minecraft:lake_lava_underground']
	} else if (FeatureRemovals.has(id) && ctx.read('worldgen/placed_feature', id) === undefined) {
		return []
	} else {
		return [str]
	}
}

function fixRootFeature(file: PackFile, ctx: FixContext) {
	if (typeof file.data !== 'object') return

	const f = fixFeature(file.data, ctx)
	if (typeof f.feature === 'string') {
		file.data = {
			type: 'minecraft:random_selector',
			config: {
				features: [],
				default: f.feature,
			},
		}
	} else {
		file.data = {
			type: f?.feature.type,
			config: f?.feature.config,
		}
	}
	ctx.create('worldgen/placed_feature', file.name, {
		feature: typeof f.feature === 'string' ? f.feature : file.name,
		placement: f?.placement,
	})
}

function fixFeature(data: any, ctx: FixContext) {
	if (typeof data !== 'object') {
		return {
			feature: data,
			placement: [],
		}
	}

	const type = data.type.replace(/^minecraft:/, '')
	const placement: any[] = []
	switch (type) {
		case 'decorated':
			const feature = collectDecorators(data, placement, ctx)
			data = fixFeature(feature, ctx)?.feature
			break
		case 'lake':
			data.config = {
				fluid: {
					type: 'minecraft:simple_state_provider',
					state: data.config.state,
				},
				barrier: {
					type: 'minecraft:simple_state_provider',
					state: {
						Name: 'minecraft:stone',
					},
				},
			}
			break
		case 'nether_forest_vegetation':
			data.config.spread_width = 8
			data.config.spread_height = 4
			break
		case 'random_boolean_selector':
			data.config.feature_false = fromPlacedFeature(fixFeature(data.config.feature_false, ctx))
			data.config.feature_true = fromPlacedFeature(fixFeature(data.config.feature_true, ctx))
			break
		case 'root_system':
		case 'random_patch':
		case 'flower':
		case 'no_bonemeal_flower':
			data.config.feature = refPlacedFeature(fixFeature(data.config.feature, ctx))
			break
		case 'random_selector':
			data.config.features.forEach((e: any) => {
				e.feature = refPlacedFeature(fixFeature(e.feature, ctx))
			})
			data.config.default = refPlacedFeature(fixFeature(data.config.default, ctx))
			break
		case 'simple_random_selector':
			data.config.features = data.config.features.map((f: any) => {
				return refPlacedFeature(fixFeature(f, ctx))
			})
			break
		case 'twisting_vines':
			data.config = {
				spread_width: 8,
				spread_height: 4,
				max_height: 8,
			}
			break
		case 'vegetation_patch':
		case 'waterlogged_vegetation_patch':
			data = fromPlacedFeature(fixFeature(data.config.vegetation_feature, ctx))
	}
	return {
		feature: data,
		placement,
	}
}

function fromPlacedFeature(data: any) {
	if (data.placement.length > 0) {
		return data.feature
	} else {
		return {
			type: 'minecraft:random_selector',
			config: {
				features: [],
				default: data,
			},
		}
	}
}

function refPlacedFeature(data: { feature: unknown, placement: unknown[] }) {
	if (typeof data.feature === 'string' && data.placement.length === 0) {
		return data.feature
	}
	return data
}

function fixDecorator(data: any, ctx: FixContext): any[] {
	if (typeof data !== 'object') return []

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'block_filter':
			return [{ type: 'minecraft:block_predicate_filter', ...data.config }]
		case 'cave_surface':
			const steps = data.config.floor_to_ceiling_search_range
			if (steps > 32) {
				ctx.warn('Converting cave_surface decorator into environment_scan: "max_steps" is limited to 32.')
			}
			const config = {
				direction_of_search: data.config.surface === 'ceiling' ? 'up' : 'down',
				target_condition: {
					type: 'minecraft:solid',
				},
				allowed_search_condition: {
					type: 'minecraft:matching_blocks',
					blocks: [
						'minecraft:air',
						...data.config.allow_water ? ['minecraft:water'] : [],
					],
				},
				max_steps: Math.min(32, steps),
			}
			return [{ type: 'minecraft:environment_scan', ...config }]
		case 'count_multilayer':
			return [{ type: 'minecraft:count_on_every_layer', ...data.config }]
		case 'chance':
			return [{ type: 'minecraft:rarity_filter', ...data.config }]
		case 'count_extra':
			const max = data.config.count + data.config.extra_count
			if (max > 256) {
				ctx.warn('Converting count_extra decorator into count: Count is limited to 256.')
			}
			const count = {
				type: 'minecraft:weighted_list',
				distribution: [
					{
						weight: Math.round(100 * (1 - data.config.extra_chance)),
						data: Math.min(256, data.config.count),
					},
					{
						weight: Math.round(100 * data.config.extra_chance),
						data: Math.min(256, max),
					},
				],
			}
			return [{ type: 'minecraft:count', count }]
		case 'count_noise':
			return [{ type: 'minecraft:noise_threshold_count', ...data.config }]
		case 'count_noise_biased':
			return [{ type: 'minecraft:noise_based_count', ...data.config }]
		case 'dark_oak_tree':
			return [{ type: 'minecraft:count', count: 16 }, { type: 'minecraft:in_square' }]
		case 'decorated':
			const outer = fixDecorator(data.config.outer, ctx)
			const inner = fixDecorator(data.config.inner, ctx)
			return [...outer, ...inner]
		case 'end_gateway':
			const y_spread = {
				type: 'minecraft:uniform',
				value: {
					min_inclusive: 3,
					max_inclusive: 9,
				},
			}
			return [{ type: 'minecraft:random_offset', xz_spread: 0, y_spread }]
		case 'iceberg':
			return [{ type: 'minecraft:in_square' }]
		case 'lava_lake':
			return [{ type: 'minecraft:rarity_filter', chance: 10 }]
		case 'nope':
			return []
		case 'range':
			return [{ type: 'minecraft:height_range', ...data.config }]
		case 'scatter':
			return [{ type: 'minecraft:random_offset', ...data.config }]
		case 'square':
			return [{ type: 'minecraft:in_square', ...data.config }]
		case 'surface_relative_threshold':
			return [{ type: 'minecraft:surface_relative_threshold_filter', ...data.config }]
		case 'water_depth_threshold':
			return [{ type: 'minecraft:surface_water_depth_filter', ...data.config }]
		default:
			return [{ type, ...data.config }]
	}
}

function collectDecorators(data: any, placement: any[], ctx: FixContext): any {
	if (typeof data !== 'object') return data

	const type = data.type.replace(/^minecraft:/, '')
	if (type === 'decorated') {
		placement.push(...fixDecorator(data.config.decorator, ctx))
		return collectDecorators(data.config.feature, placement, ctx)
	}
	return data
}

const FeatureRemovals = new Set(JSON.parse('["acacia","azalea_tree","birch","birch_bees_005","birch_other","bonus_chest","brown_mushroom_giant","cave_vine","cave_vine_in_moss","clay_pool_with_dripleaves","clay_with_dripleaves","crimson_fungi_planted","dark_oak","dripleaf","end_gateway","end_gateway_delayed","end_island","fancy_oak","fancy_oak_bees_005","flower_forest","flower_plain_decorated","forest_flower_trees","forest_flower_vegetation","forest_flower_vegetation_common","grove_vegetation","huge_brown_mushroom","huge_red_mushroom","jungle_tree_no_vine","lake_lava","meadow_trees","mega_jungle_tree","mega_pine","mega_spruce","moss_patch","moss_patch_bonemeal","moss_patch_ceiling","moss_vegetation","mushroom_field_vegetation","oak","oak_bees_005","ore_debris_large","patch_berry_bush","patch_brown_mushroom","patch_cactus","patch_red_mushroom","patch_taiga_grass","patch_waterlilly","pile_hay","pile_ice","pile_melon","pile_pumpkin","pile_snow","pine","plain_vegetation","red_mushroom_giant","rooted_azalea_trees","spring_lava_double","spruce","swamp_oak","taiga_vegetation","trees_giant","trees_giant_spruce","trees_jungle_edge","trees_mountain","trees_mountain_edge","trees_shattered_savanna","warped_fungi_planted"]'))
