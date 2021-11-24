import type { FixContext } from '../../Fix';
import { Fix } from '../../Fix';
import type { PackFile } from '../../Pack';

export const Feature = Fix.all(
	Fix.onFile('worldgen/configured_feature', fixRootFeature),

	// Remove or rename vanilla configured features and carvers
	Fix.onFile('worldgen/biome', ({ data }, ctx) => {
		data.player_spawn_friendly = undefined

		;['air', 'liquid'].forEach(step => {
			if (Array.isArray(data.carvers[step])) {
				data.carvers[step] = data.carvers[step].filter((c: any) => !CarverRemovals.has(c.replace(/^minecraft:/, '')))
			}
		})

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
	if (FeatureReplacements.has(id)) {
		return FeatureReplacements.get(id)!.map(e => `minecraft:${e}`)
	} else if (FeatureRenames.has(id) || FeatureRenamesPlacement.has(id)) {
		return [`minecraft:${FeatureRenames.get(id) ?? FeatureRenamesPlacement.get(id)}`]
	} else if (FeatureOnlyConfig.has(id) && ctx.read('worldgen/placed_feature', id) === undefined) {
		return []
	} else if (FeatureFullyRemoved.has(id)) {
		return []
	} else {
		return [str]
	}
}

function fixRootFeature(file: PackFile, ctx: FixContext) {
	if (typeof file.data !== 'object') return

	const f = fixFeature(file.data, ctx)
	if (typeof f.feature === 'string') {
		file.data = redirect(fixPlacedFeatureId(f.feature, ctx))
	} else {
		file.data = {
			type: f?.feature.type,
			config: f?.feature.config,
		}
		f.feature = file.name
	}
	ctx.create('worldgen/placed_feature', file.name, {
		feature: f.feature,
		placement: f?.placement,
	})
}

// Wraps a placed feature in a configured feature
function redirect(placedFeature: unknown) {
	return {
		type: 'minecraft:random_selector',
		config: {
			features: [],
			default: placedFeature,
		},
	}
}

/**
 * Fixes a configured feature into a placed feature
 */
function fixFeature(data: any, ctx: FixContext) {
	if (typeof data === 'string') {
		const id = data.replace(/^minecraft:/, '')
		if (FeatureFullyRemoved.has(id)) {
			data = { type: 'minecraft:no_op', config: {} }
		} else if (FeatureOnlyPlacement.has(id)) {
			data = redirect(data)
		} else if (FeatureRenames.has(id) || FeatureRenamesConfig.has(id)) {
			const configuredFeature = FeatureRenamesConfig.get(id) ?? FeatureRenames.get(id)
			console.log(`Rename ${id} -> configured: ${configuredFeature}`)
			data = `minecraft:${configuredFeature}`
		} else if (FeatureRenamesPlacement.has(id)) {
			const placedFeature = FeatureRenamesPlacement.get(id)
			console.log(`Redirect ${id} -> placed: ${placedFeature}`)
			data = redirect(placedFeature)
		}
		return {
			feature: data,
			placement: [],
		}
	}

	if (typeof data !== 'object') throw new Error('Feature is not an object nor a string')

	const type = data.type.replace(/^minecraft:/, '')
	const placement: any[] = []
	switch (type) {
		case 'decorated':
			const feature = collectDecorators(data, placement, ctx)
			data = fixToConfiguredFeature(feature, ctx)
			break
		case 'glow_lichen':
			data.config.can_be_placed_on = [...new Set(
				data.config.can_be_placed_on.map((b: any) => b.Name)
			)]
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
			data.config.feature_false = fixToPlacedFeature(data.config.feature_false, ctx)
			data.config.feature_true = fixToPlacedFeature(data.config.feature_true, ctx)
			break
		case 'root_system':
			data.config.allowed_tree_position = { type: 'minecraft:true' }
		// eslint-disable-next-line no-fallthrough
		case 'random_patch':
		case 'flower':
		case 'no_bonemeal_flower':
			data.config.feature = fixToPlacedFeature(data.config.feature, ctx)
			break
		case 'random_selector':
			data.config.features.forEach((e: any) => {
				e.feature = fixToPlacedFeature(e.feature, ctx)
			})
			data.config.default = fixToPlacedFeature(data.config.default, ctx)
			break
		case 'simple_random_selector':
			data.config.features = data.config.features.map((f: any) => {
				return fixToPlacedFeature(f, ctx)
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
			data.config.vegetation_feature = fixToPlacedFeature(data.config.vegetation_feature, ctx)
	}
	return {
		feature: data,
		placement,
	}
}

/**
 * Fixes a configured feature and then returns it as a reference to a placed feature
 */
function fixToPlacedFeature(data: any, ctx: FixContext) {
	const f = fixFeature(data, ctx)
	if (typeof f.feature === 'string' && f.placement.length === 0) {
		return fixPlacedFeatureId(f.feature, ctx)
	}
	return f
}

function fixPlacedFeatureId(feature: string, ctx: FixContext) {
	const id = feature.replace(/^minecraft:/, '')
	if (FeatureRenames.has(id) || FeatureRenamesPlacement.has(id)) {
		const placedFeature = FeatureRenamesPlacement.get(id) ?? FeatureRenames.get(id)
		console.log(`Rename placement: ${id} -> ${placedFeature}`)
		return `minecraft:${placedFeature}`
	}
	if (!FeatureOnlyConfig.has(id) && ctx.read('worldgen/configured_feature', id) === undefined) {
		console.log(`No placement: ${id}`)
		return feature
	}
	return {
		feature,
		placement: [],
	}
}

/**
 * Fixes a configured feature and then returns it as a reference to a configured feature
 */
function fixToConfiguredFeature(data: any, ctx: FixContext) {
	const f = fixFeature(data, ctx)
	if (typeof f.feature === 'string' && f.placement.length === 0) {
		const id = f.feature.replace(/^minecraft:/, '')
		if (FeatureRenames.has(id) || FeatureRenamesConfig.has(id)) {
			const configuredFeature = FeatureRenamesConfig.get(id) ?? FeatureRenames.get(id)
			console.log(`Rename config: ${id} -> ${configuredFeature}`)
			return `minecraft:${configuredFeature}`
		}
		if (FeatureOnlyPlacement.has(id)) {
			return redirect(f.feature)
		}
	}
	return f.feature
}

/**
 * Converts a configured decorator to a list of placement modifiers
 */
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
			let max = data.config.count + data.config.extra_count
			if (max > 256) {
				let factors = [max]
				max -= 1
				while (factors.some(f => f > 256)) {
					max += 1
					factors = primeFactors(max)
				}

				for (let n = 2; n <= 5; n += 1) {
					const counts: number[] = Array(n).fill(1)
					const factorsToUse = [...factors]
					outer:
					while (factorsToUse.length > 0) {
						const f = factorsToUse.pop()
						for (let i = 0; i < n; i += 1) {
							if (counts[i] * f <= 256) {
								counts[i] *= f
								continue outer
							}
						}
						break
					}
					if (factorsToUse.length === 0 && counts.every(p => p <= 256)) {
						return counts.map(count => ({ type: 'minecraft:count', count }))
					}
				}
				throw new Error(`Extremely high count: ${data.config.count + data.config.extra_count}`)
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

function primeFactors(n: number) {
	const factors = []
	let divisor = 2
	while (n >= 2) {
		if (n % divisor == 0) {
			factors.push(divisor)
			n = n / divisor
		} else {
			divisor += 1
		}
	}
	return factors
}

// Configured features in 1.17 that were replaced with multiple placed features
const FeatureReplacements = new Map(Object.entries({
	birch_other: ['forest_flowers', 'trees_birch_and_oak'],
	fossil: ['fossil_upper', 'fossil_lower'],
	lake_lava: ['lake_lava_surface', 'lake_lava_underground'],
	monster_room: ['monster_room', 'monster_room_deep'],
	ore_granite: ['ore_granite_upper', 'ore_granite_lower'],
	ore_diorite: ['ore_diorite_upper', 'ore_diorite_lower'],
	ore_andesite: ['ore_andesite_upper', 'ore_andesite_lower'],
	ore_coal: ['ore_coal_upper', 'ore_coal_lower'],
	ore_iron: ['ore_iron_upper', 'ore_iron_middle', 'ore_iron_small'],
	ore_gold: ['ore_gold', 'ore_gold_lower'],
	ore_redstone: ['ore_redstone', 'ore_redstone_lower'],
	ore_diamond: ['ore_diamond', 'ore_diamond_large', 'ore_diamond_buried'],
	ore_lapis: ['ore_lapis', 'ore_lapis_buried'],
}))

// Configured features in 1.17 that were fully removed
const FeatureFullyRemoved = new Set(['lake_water', 'rare_dripstone_cluster', 'rare_small_dripstone', 'ore_deepslate'])

// Configured features in 1.17 that have no corresponding placed feature in 1.18
const FeatureOnlyConfig = new Set(['azalea_tree', 'birch_bees_005', 'bonus_chest', 'cave_vine_in_moss', 'clay_pool_with_dripleaves', 'clay_with_dripleaves', 'dripleaf', 'end_gateway_delayed', 'huge_brown_mushroom', 'huge_red_mushroom', 'jungle_tree_no_vine', 'moss_patch', 'moss_patch_bonemeal', 'moss_patch_ceiling', 'moss_vegetation', 'oak_bees_005', 'patch_brown_mushroom', 'patch_red_mushroom', 'spring_lava_double', 'swamp_oak'])

// Configured features in 1.17 that have a corresponding placed feature, but their configured feature was removed.
const FeatureOnlyPlacement = new Set(['patch_dead_bush_2'])

// Configured features in 1.17 that got a new name as placed feature and configured feature in 1.18
const FeatureRenames = new Map(Object.entries({
	birch_other: 'trees_birch_and_oak',
	end_gateway: 'end_gateway_return',
	fancy_oak_bees_005: 'fancy_oak_bees',
	flower_forest: 'flower_flower_forest',
	forest_flower_trees: 'trees_flower_forest',
	forest_flower_vegetation: 'forest_flowers',
	forest_flower_vegetation_common: 'flower_forest_flowers',
	grove_vegetation: 'trees_grove',
	mushroom_field_vegetation: 'mushroom_island_vegetation',
	ore_debris_large: 'ore_ancient_debris_large',
	patch_waterlilly: 'patch_waterlily',
	pine: 'pine_checked',
	plain_vegetation: 'trees_plains',
	rooted_azalea_trees: 'rooted_azalea_tree',
	taiga_vegetation: 'trees_taiga',
	trees_giant: 'trees_old_growth_pine_taiga',
	trees_giant_spruce: 'trees_old_growth_spruce_taiga',
	trees_jungle_edge: 'trees_sparse_jungle',
	trees_mountain: 'trees_windswept_hills',
}))

// Configured features in 1.17 that got a new name as placed feature in 1.18 but have no configured feature with this new name
const FeatureRenamesPlacement = new Map(Object.entries({
	acacia: 'acacia_checked',
	birch: 'birch_checked',
	brown_mushroom_giant: 'brown_mushroom_old_growth',
	cave_vine: 'cave_vines',
	dark_oak: 'dark_oak_checked',
	end_island: 'end_island_decorated',
	fancy_oak: 'fancy_oak_checked',
	flower_plain_decorated: 'flower_plains',
	meadow_trees: 'trees_meadow',
	mega_jungle_tree: 'mega_jungle_tree_checked',
	mega_pine: 'mega_pine_checked',
	red_mushroom_giant: 'red_mushroom_old_growth',
	patch_cactus: 'patch_cactus_decorated',
	mega_spruce: 'mega_spruce_checked',
	spruce: 'spruce_checked',
	trees_mountain_edge: 'trees_windswept_forest',
	trees_shattered_savanna: 'trees_windswept_savanna',
}))

// Configured features in 1.17 that got a new name as configured feature in 1.18 but have no placed feature with this new name
const FeatureRenamesConfig = new Map(Object.entries({
	mega_spruce: 'mega_spruce',
	cave_vine: 'cave_vine', // entry is included because the placed feature was renamed
	crimson_fungi_planted: 'crimson_fungus_planted',
	warped_fungi_planted: 'warped_fungus_planted',
}))

const CarverRemovals = new Set(['ocean_cave', 'prototype_canyon', 'prototype_cave', 'prototype_crevice', 'underwater_canyon', 'underwater_cave'])
