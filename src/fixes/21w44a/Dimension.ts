import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'

export const Dimension = Fix.all(
	Fix.onFile('worldgen/noise_settings', ({ data }, ctx) => fixNoiseSettings(data, ctx)),
	Fix.onFile('dimension', ({ data }, ctx) => {
		if (data.generator?.type?.replace(/^minecraft:/, '') === 'noise') {
			const biomes = fixBiomeSource(data.generator.biome_source, ctx)
			fixNoiseSettings(data.generator.settings, ctx, biomes)
		}
	}),
)

// Returns a list of biome IDs
function fixBiomeSource(data: any, ctx: FixContext) {
	if (typeof data !== 'object') return []

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'fixed':
			return [data.biome]
		case 'checkerboard':
			return [...new Set<string>(data.biomes)]
		case 'multi_noise':
			data.seed = undefined
			if (data.preset.replace(/^minecraft:/, '') === 'nether') {
				return ['nether_wastes', 'soul_sand_valley', 'crimson_forest', 'warped_forest', 'basalt_deltas']
			}
			data.altitude_noise = undefined
			data.temperature_noise = undefined
			data.humidity_noise = undefined
			data.weirdness_noise = undefined
			data.biomes.forEach((b: any) => {
				b.parameters = {
					temperature: b.parameters.temperature,
					humidity: b.parameters.humidity,
					continentalness: b.parameters.altitude,
					erosion: 0,
					weirdness: b.parameters.weirdness,
					depth: 0,
					offset: b.parameters.offset,
				}
			})
			return [...new Set<string>(data.biomes.map((b: any) => b.biome))]
		case 'vanilla_layered':
			ctx.warn('Removed biome source "vanilla_layered", replaced with the multi noise overworld preset.')
			data.type = 'multi_noise'
			data.preset = 'minecraft:overworld'
			return []
	}
	return []
}

function fixNoiseSettings(data: any, ctx: FixContext, biomes: string[] = []) {
	if (typeof data === 'string') {
		const file = ctx.read('worldgen/noise_settings', data)
		if (file) {
			fixNoiseSettings(file.data, ctx, biomes)
		}
		return
	}
	if (typeof data !== 'object') return

	data.legacy_random_source = false

	data.noise.top_slide.target /= 128
	data.noise.bottom_slide.target /= 128
	
	data.min_surface_level = undefined
	data.noise.simplex_surface_noise = undefined
	data.noise.random_density_offset = undefined

	data.noise.terrain_shaper = {
		offset: data.noise.density_offset,
		factor: data.noise.density_factor,
		jaggedness: 0,
	}

	data.noise.density_offset = undefined
	data.noise.density_factor = undefined

	const rules = []

	if (data.bedrock_floor_position > -10) {
		rules.push(ifTrue('vertical_gradient', {
			random_name: 'minecraft:bedrock_floor',
			true_at_and_below: { above_bottom: data.bedrock_floor_position + 5 },
			false_at_and_above: { above_bottom: data.bedrock_floor_position },
		}).thenRun('block', {
			result_state: { Name: 'minecraft:bedrock' },
		}))
	}
	if (data.bedrock_roof_position > -10) {
		rules.push(ifNotTrue('vertical_gradient', {
			random_name: 'minecraft:bedrock_roof',
			true_at_and_below: { below_top: data.bedrock_roof_position + 5 },
			false_at_and_above: { below_top: data.bedrock_roof_position },
		}).thenRun('block', {
			result_state: { Name: 'minecraft:bedrock' },
		}))
	}
	// TODO: add surface rules for the biomes
	if (data.deepslate_enabled) {
		rules.push(ifTrue('vertical_gradient', {
			random_name: 'minecraft:deepslate',
			true_at_and_below: { absolute: 0 },
			false_at_and_above: { absolute: 8 },
		}).thenRun('block', {
			result_state: { Name: 'minecraft:deepslate', Properties: { axis: 'y' } },
		}))
	}

	data.surface_rule = {
		type: 'minecraft:sequence',
		sequence: rules,
	}
}

function ifTrue(conditionType: string, conditionData: any) {
	return {
		thenRun: (ruleType: string, ruleData: any) => ({
			type: 'minecraft:condition',
			if_true: { type: `minecraft:${conditionType}`, ...conditionData },
			then_run: { type: `minecraft:${ruleType}`, ...ruleData },
		}),
	}
}

function ifNotTrue(conditionType: string, conditionData: any) {
	return ifTrue('not', {
		invert: { type: `minecraft:${conditionType}`, ...conditionData },
	})
}
