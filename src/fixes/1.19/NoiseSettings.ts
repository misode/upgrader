import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'
import { DEFAULT_NOISE } from './DefaultNoise'

const PROCESSED = new Set()

export const NoiseSettings = Fix.all(
	async () => {
		PROCESSED.clear()
	},
	Fix.onFile('worldgen/noise_settings', ({ data }, ctx) => fixNoiseSettings(data, ctx)),
	Fix.onFile('dimension', ({ data }, ctx) => {
		if (data.generator?.type?.replace(/^minecraft:/, '') === 'noise') {
			fixNoiseSettings(data.generator.settings, ctx)
		}
	}),
	Fix.onFile('worldgen/density_function', ({ name, data }, ctx) => {
		const id = name.includes(':') ? name : 'minecraft:' + name
		if (!PROCESSED.has(id)) {
			console.debug(`Visiting ${id} with default noise`)
			PROCESSED.add(id)
			fixDensityFunction(data, ctx, DEFAULT_NOISE)
		}
	}),
)

function fixNoiseSettings(data: any, ctx: FixContext) {
	if (typeof data !== 'object') return

	Object.values(data.noise_router).forEach((d) => fixDensityFunction(d, ctx, data.noise))

	delete data.noise.terrain_shaper
	delete data.noise.sampling
	delete data.noise.top_slide
	delete data.noise.bottom_slide

	data.spawn_target = DEFAULT_SPAWN_TARGET
}

function fixDensityFunction(data: any, ctx: FixContext, noise: any) {
	if (typeof data === 'string') {
		const id = data.includes(':') ? data : 'minecraft:' + data
		if (!PROCESSED.has(id)) {
			console.debug(`Visiting ${id}`)
			PROCESSED.add(id)
			const file = ctx.read('worldgen/density_function', id)
			if (file && !file.error && !file.deleted) {
				fixDensityFunction(file.data, ctx, noise)
			} else if (DF_DEFAULTS.has(id)) {
				const contents = JSON.parse(DF_DEFAULTS.get(id)!)
				fixDensityFunction(contents, ctx, noise)
				ctx.create('worldgen/density_function', id, contents)
			}
		} else {
			console.debug(`Already visited ${id}`)
		}
		return
	}

	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'abs':
		case 'blend_density':
		case 'cache_2d':
		case 'cache_all_in_cell':
		case 'cache_once':
		case 'cube':
		case 'flat_cache':
		case 'half_negative':
		case 'interpolated':
		case 'quarter_negative':
		case 'square':
		case 'squeeze':
			fixDensityFunction(data.argument, ctx, noise)
			break
		case 'add':
		case 'max':
		case 'min':
		case 'mul':
			fixDensityFunction(data.argument1, ctx, noise)
			fixDensityFunction(data.argument2, ctx, noise)
			break
		case 'clamp':
		case 'range_choice':
		case 'weird_scaled_sampler':
			fixDensityFunction(data.input, ctx, noise)
			break
		case 'shifted_noise':
			fixDensityFunction(data.shift_x, ctx, noise)
			fixDensityFunction(data.shift_y, ctx, noise)
			fixDensityFunction(data.shift_z, ctx, noise)
			break
		case 'old_blended_noise':
			data.xz_scale = noise.sampling.xz_scale
			data.y_scale = noise.sampling.y_scale
			data.xz_factor = noise.sampling.xz_factor
			data.y_factor = noise.sampling.y_factor
			data.smear_scale_multiplier = 8
			break
		case 'slide':
			fixDensityFunction(data.argument, ctx, noise)
			const slides = createSlides(data.argument, noise)
			delete data.argument
			Object.assign(data, slides)
			break
		case 'spline':
			fixSpline(data.spline, ctx, noise)
			delete data.min_value
			delete data.max_value
			break
		case 'terrain_shaper_spline':
			data.type = 'minecraft:spline'
			fixDensityFunction(data.continentalness, ctx, noise)
			fixDensityFunction(data.erosion, ctx, noise)
			fixDensityFunction(data.weirdness, ctx, noise)
			const coordinates = {
				continents: data.continentalness,
				erosion: data.erosion,
				weirdness: data.weirdness,
				ridges: 'minecraft:overworld/ridges_folded',
			}
			let input: any = {
				type: 'minecraft:spline',
				spline: fixTerrainSpline(noise.terrain_shaper[data.spline], ctx, coordinates),
			}
			if (data.spline === 'offset') {
				input = {
					type: 'minecraft:add',
					argument1: -0.5037500262260437,
					argument2: input,
				}
			}
			data.type = 'minecraft:clamp'
			data.min = data.min_value
			data.max = data.max_value
			data.input = input
			delete data.spline
			delete data.min_value
			delete data.max_value
			delete data.continentalness
			delete data.erosion
			delete data.weirdness
			break
	}
}

function fixSpline(data: any, ctx: FixContext, noise: any) {
	if (typeof data !== 'object') return

	fixDensityFunction(data.coordinate, ctx, noise)

	for (const point of data.points) {
		fixSpline(point.value, ctx, noise)
	}
}

function fixTerrainSpline(data: any, ctx: FixContext, coordinates: Record<string, any>) {
	if (typeof data !== 'object') {
		return data
	}

	let coordinate = coordinates[data.coordinate]
	if (coordinate === undefined) {
		ctx.warn(`Unknown coordinate ${data.coordinate}`)
		coordinate = 0
	}

	return {
		coordinate,
		points: data.points.map((point: any) => ({
			location: point.location,
			value: fixTerrainSpline(point.value, ctx, coordinates),
			derivative: point.derivative,
		})),
	}
}

function createSlides(input: any, noise: any) {
	const top = noise.top_slide
	if (top.size > 0) {
		const fromY = noise.min_y + noise.height - (top.offset + top.size) * 4 * noise.size_vertical
		const toY = noise.min_y + noise.height - top.offset * 4 * noise.size_vertical
		const y = yClampedGradient(fromY, toY, 1, 0)
		input = lerp(y, input, top.target)
	}
	const bottom = noise.bottom_slide
	if (bottom.size > 0) {
		const fromY = noise.min_y + bottom.offset * 4 * noise.size_vertical
		const toY = noise.min_y + (bottom.offset + bottom.size) * 4 * noise.size_vertical
		const y = yClampedGradient(fromY, toY, 0, 1)
		input = lerp(y, input, bottom.target)
	}
	return input
}

function lerp(a: any, b: any, t: number) {
	return add(mul(a, add(b, -t)), t)
}

function add(a: any, b: any) {
	return {
		type: 'minecraft:add',
		argument1: a,
		argument2: b,
	}
}

function mul(a: any, b: any) {
	return {
		type: 'minecraft:mul',
		argument1: a,
		argument2: b,
	}
}

function yClampedGradient(from_y: number, to_y: number, from_value: number, to_value: number) {
	return {
		type: 'minecraft:y_clamped_gradient',
		from_y,
		to_y,
		from_value,
		to_value,
	}
}

const DEFAULT_SPAWN_TARGET = JSON.parse('[{"erosion":[-1,1],"depth":0,"weirdness":[-1,-0.16],"offset":0,"temperature":[-1,1],"humidity":[-1,1],"continentalness":[-0.11,1]},{"erosion":[-1,1],"depth":0,"weirdness":[0.16,1],"offset":0,"temperature":[-1,1],"humidity":[-1,1],"continentalness":[-0.11,1]}]')

const DF_DEFAULTS = new Map(Object.entries({
	'minecraft:overworld/sloped_cheese': '{"argument1":{"argument1":4,"argument2":{"argument":{"argument1":{"argument1":"minecraft:overworld/depth","argument2":{"argument1":{"argument":{"argument":{"argument1":{"argument1":0,"argument2":{"argument1":1,"argument2":{"argument1":-1,"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:mul"},"argument2":{"argument1":{"spline":"jaggedness","min_value":0,"max_value":1.28,"continentalness":"minecraft:overworld/continents","erosion":"minecraft:overworld/erosion","weirdness":"minecraft:overworld/ridges","type":"minecraft:terrain_shaper_spline"},"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:cache_2d"},"type":"minecraft:flat_cache"},"argument2":{"argument":{"noise":"minecraft:jagged","xz_scale":1500,"y_scale":0,"type":"minecraft:noise"},"type":"minecraft:half_negative"},"type":"minecraft:mul"},"type":"minecraft:add"},"argument2":"minecraft:overworld/factor","type":"minecraft:mul"},"type":"minecraft:quarter_negative"},"type":"minecraft:mul"},"argument2":"minecraft:overworld/base_3d_noise","type":"minecraft:add"}',
	'minecraft:overworld/factor': '{"argument":{"argument":{"argument1":{"argument1":10,"argument2":{"argument1":1,"argument2":{"argument1":-1,"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:mul"},"argument2":{"argument1":{"spline":"factor","min_value":0,"max_value":8,"continentalness":"minecraft:overworld/continents","erosion":"minecraft:overworld/erosion","weirdness":"minecraft:overworld/ridges","type":"minecraft:terrain_shaper_spline"},"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:cache_2d"},"type":"minecraft:flat_cache"}',
	'minecraft:overworld/depth': '{"argument1":{"from_y":-64,"to_y":320,"from_value":1.5,"to_value":-1.5,"type":"minecraft:y_clamped_gradient"},"argument2":{"argument":{"argument":{"argument1":{"argument1":{"type":"minecraft:blend_offset"},"argument2":{"argument1":1,"argument2":{"argument1":-1,"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:mul"},"argument2":{"argument1":{"spline":"offset","min_value":-0.81,"max_value":2.5,"continentalness":"minecraft:overworld/continents","erosion":"minecraft:overworld/erosion","weirdness":"minecraft:overworld/ridges","type":"minecraft:terrain_shaper_spline"},"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:cache_2d"},"type":"minecraft:flat_cache"},"type":"minecraft:add"}',
	'minecraft:overworld/base_3d_noise': '{"type":"minecraft:old_blended_noise"}',
	'minecraft:overworld_large_biomes/sloped_cheese': '{"argument1":{"argument1":4,"argument2":{"argument":{"argument1":{"argument1":"minecraft:overworld_large_biomes/depth","argument2":{"argument1":{"argument":{"argument":{"argument1":{"argument1":0,"argument2":{"argument1":1,"argument2":{"argument1":-1,"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:mul"},"argument2":{"argument1":{"spline":"jaggedness","min_value":0,"max_value":1.28,"continentalness":"minecraft:overworld_large_biomes/continents","erosion":"minecraft:overworld_large_biomes/erosion","weirdness":"minecraft:overworld/ridges","type":"minecraft:terrain_shaper_spline"},"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:cache_2d"},"type":"minecraft:flat_cache"},"argument2":{"argument":{"noise":"minecraft:jagged","xz_scale":1500,"y_scale":0,"type":"minecraft:noise"},"type":"minecraft:half_negative"},"type":"minecraft:mul"},"type":"minecraft:add"},"argument2":"minecraft:overworld_large_biomes/factor","type":"minecraft:mul"},"type":"minecraft:quarter_negative"},"type":"minecraft:mul"},"argument2":"minecraft:overworld/base_3d_noise","type":"minecraft:add"}',
	'minecraft:overworld_large_biomes/depth': '{"argument1":{"from_y":-64,"to_y":320,"from_value":1.5,"to_value":-1.5,"type":"minecraft:y_clamped_gradient"},"argument2":{"argument":{"argument":{"argument1":{"argument1":{"type":"minecraft:blend_offset"},"argument2":{"argument1":1,"argument2":{"argument1":-1,"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:mul"},"argument2":{"argument1":{"spline":"offset","min_value":-0.81,"max_value":2.5,"continentalness":"minecraft:overworld_large_biomes/continents","erosion":"minecraft:overworld_large_biomes/erosion","weirdness":"minecraft:overworld/ridges","type":"minecraft:terrain_shaper_spline"},"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:cache_2d"},"type":"minecraft:flat_cache"},"type":"minecraft:add"}',
	'minecraft:overworld_large_biomes/factor': '{"argument":{"argument":{"argument1":{"argument1":10,"argument2":{"argument1":1,"argument2":{"argument1":-1,"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:mul"},"argument2":{"argument1":{"spline":"factor","min_value":0,"max_value":8,"continentalness":"minecraft:overworld_large_biomes/continents","erosion":"minecraft:overworld_large_biomes/erosion","weirdness":"minecraft:overworld/ridges","type":"minecraft:terrain_shaper_spline"},"argument2":{"argument":{"type":"minecraft:blend_alpha"},"type":"minecraft:cache_once"},"type":"minecraft:mul"},"type":"minecraft:add"},"type":"minecraft:cache_2d"},"type":"minecraft:flat_cache"}',
}))
