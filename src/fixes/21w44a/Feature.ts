import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'

export const Feature = Fix.all(
	Fix.onFile('worldgen/configured_feature', ({ data }, ctx) => fixFeature(data, ctx)),
)

function fixFeature(data: any, ctx: FixContext) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'decorated':
			fixDecorator(data.config.decorator, ctx)
			fixFeature(data.config.feature, ctx)
			break
		case 'random_boolean_selector':
			fixFeature(data.config.feature_false, ctx)
			fixFeature(data.config.feature_true, ctx)
			break
		case 'random_selector':
			data.config.features.forEach((e: any) => fixFeature(e.feature, ctx))
			fixFeature(data.config.default, ctx)
			break
		case 'simple_random_selector':
			data.config.features.forEach((feature: any) => fixFeature(feature, ctx))
			break
		case 'flower':
		case 'no_bonemeal_flower':
		case 'random_patch':
			if (data.config.xspread !== data.config.zspread) {
				ctx.warn('Random patch xspread and zspread can no longer be different. Using xspread.')
			}
			const filters: any[] = []
			if (data.config.can_replace !== true) {
				filters.push({
					type: 'minecraft:matching_blocks',
					blocks: ['minecraft:air'],
				})
			}
			if (isNonEmptyList(data.config.whitelist)) {
				filters.push({
					type: 'minecraft:matching_blocks',
					blocks: getBlockIds(data.config.whitelist),
				})
			}
			if (isNonEmptyList(data.config.blacklist)) {
				filters.push({
					type: 'minecraft:not',
					predicate: {
						type: 'minecraft:matching_blocks',
						blocks: getBlockIds(data.config.blacklist),
					},
				})
			}
			const placer = data.config.block_placer.type.replace(/^minecraft:/, '')
			const feature = placer === 'column_placer' ? {
				type: 'minecraft:block_column',
				config: {
					direction: 'up',
					allowed_placement: data.config.can_replace !== true ? {
						type: 'minecraft:matching_blocks',
						blocks: ['minecraft:air'],
					} : { type: 'minecraft:true' },
					prioritize_tip: false,
					layers: [
						{
							height: data.config.block_placer.size,
							provider: data.config.state_provider,
						},
					],
				},
			} : {
				type: 'minecraft:simple_block',
				config: {
					to_place: data.config.state_provider,
				},
			}
			data.config = {
				tries: data.config.tries,
				xz_spread: data.config.xspread,
				y_spread: data.config.yspread,
				feature: decorated(feature, [
					{
						type: 'minecraft:block_filter',
						config: {
							predicate: {
								type: 'minecraft:all_of',
								predicates: filters,
							},
						},
					},
				]),
			}
			if (data.config.project === true) {
				data.config = {
					decorator: {
						type: 'heightmap',
						config: {
							heightmap: 'OCEAN_FLOOR',
						},
					},
					feature: {
						type: data.type,
						config: data.config,
					},
				}
				data.type = 'minecraft:decorated'
			}
			break
		case 'growing_plant':
			data.type = 'minecraft:block_column'
			data.config = {
				direction: data.config.direction,
				allowed_placement: data.config.allow_water !== true ? {
					type: 'minecraft:matching_blocks',
					blocks: ['minecraft:air'],
				} : { type: 'minecraft:true' },
				prioritize_tip: true,
				layers: [
					{
						height: {
							type: 'minecraft:weighted_list',
							distribution: data.config.height_distribution.map((e: any) => ({
								weight: e.weight,
								data: deltaIntProvider(e.data, -1),
							})),
						},
						provider: data.config.body_provider,
					},
					{
						height: 1,
						provider: data.config.head_provider,
					},
				],
			}
			break
		case 'root_system':
			fixFeature(data.config.feature, ctx)
			break
		case 'simple_block':
			const filters2 = []
			if (isNonEmptyList(data.config.place_on)) {
				filters2.push({
					type: 'minecraft:matching_blocks',
					offset: [0, -1, 0],
					blocks: getBlockIds(data.config.place_on),
				})
			}
			if (isNonEmptyList(data.config.place_in)) {
				filters2.push({
					type: 'minecraft:matching_blocks',
					blocks: getBlockIds(data.config.place_in),
				})
			}
			if (isNonEmptyList(data.config.place_under)) {
				filters2.push({
					type: 'minecraft:matching_blocks',
					offset: [0, 1, 0],
					blocks: getBlockIds(data.config.place_under),
				})
			}
			data.config.place_on = undefined
			data.config.place_in = undefined
			data.config.place_under = undefined
			if (filters2.length > 0) {
				data.type = 'minecraft:decorated',
				data.config = {
					decorator: {
						type: 'minecraft:block_filter',
						config: {
							predicate: filters2.length == 1 ? filters2[0] : {
								type: 'minecraft:all_of',
								predicates: filters2,
							},
						},
					},
					feature: {
						type: 'minecraft:simple_block',
						config: data.config,
					},
				}
			}
			break
		case 'small_dripstone':
			const pointed_dripstone = (surface: string) => decorated({
				type: 'minecraft:pointed_dripstone',
				config: {
					chance_of_taller_dripstone: data.config.chance_of_taller_dripstone,
					chance_of_directional_spread: 0.7,
					chance_of_spread_radius2: 0.5,
					chance_of_spread_radius3: 0.5,
				},
			}, [{
				type: 'minecraft:cave_surface',
				config: {
					surface,
					floor_to_ceiling_search_range: 12,
					allow_water: true,
				},
			}])
			data.type = 'minecraft:decorated'
			data.config = decorated({
				type: 'minecraft:simple_random_selector',
				config: {
					features: [
						pointed_dripstone('floor'),
						pointed_dripstone('ceiling'),
					],
				},
			}, [
				{
					type: 'count',
					config: {
						count: {
							type: 'minecraft:uniform',
							value: { min_inclusive: 1, max_inclusive: data.config.max_placements },
						},
					},
				},
				{
					type: 'minecraft:scatter',
					config: {
						xz_spread: {
							type: 'minecraft:clamped_normal',
							value: { mean: 0.0, deviation: 3.0, min_inclusive: -10, max_inclusive: 10 },
						},
						y_spread: {
							type: 'minecraft:clamped_normal',
							value: { mean: 0.0, deviation: 0.6, min_inclusive: -2, max_inclusive: 2 },
						},
					},
				},
			]).config
			break
		case 'vegetation_patch':
		case 'waterlogged_vegetation_patch':
			fixFeature(data.config.vegetation_feature, ctx)
	}
}

function deltaIntProvider(data: any, delta: number): any {
	if (typeof data === 'number') return data + delta

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'constant':
			return {
				type: data.type,
				value: data.value + delta,
			}
		case 'uniform':
		case 'biased_to_bottom':
			return {
				type: data.type,
				value: {
					min_inclusive: data.min_inclusive + delta,
					max_inclusive: data.max_inclusive + delta,
				},
			}
		case 'clamped':
			return {
				type: data.type,
				value: {
					min_inclusive: data.min_inclusive + delta,
					max_inclusive: data.max_inclusive + delta,
					source: deltaIntProvider(data.source, delta),
				},
			}
	}
	throw new Error(`Unknown int provider "${type}"`)
}

function fixDecorator(data: any, ctx: FixContext) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'decorated':
			fixDecorator(data.config.outer, ctx)
			fixDecorator(data.config.inner, ctx)
			break
		case 'cave_surface':
			data.config.allow_water = false
			break
		case 'heightmap_spread_double':
			ctx.warn('Removed decorator "heightmap_spread_double" was replaced with "heightmap". You likely need to make this feature rarer.')
			data.type = 'minecraft:heightmap'
			break
		case 'spread_32_above':
			ctx.warn('Removed decorator "spread_32_above". You likely need to make this feature rarer.')
			data.type = 'minecraft:nope'
			break
	}
}

function decorated(feature: any, decorators: any[] = []): any {
	if (decorators.length == 0) {
		return feature
	}
	return {
		type: 'minecraft:decorated',
		config: {
			decorator: decorators[0],
			feature: decorated(feature, decorators.slice(1)),
		},
	}
}

function isNonEmptyList(obj: unknown): obj is unknown[] {
	return Array.isArray(obj) && obj.length > 0
}

function getBlockIds(states: any[]) {
	return [...new Set(states.map((state: any) => state.Name))]
}
