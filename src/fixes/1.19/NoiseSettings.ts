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
		const id = data.includes(':') ? name : 'minecraft:' + name
		if (!PROCESSED.has(id)) {
			PROCESSED.add(id)
			fixDensityFunction(data, ctx, DEFAULT_NOISE)
		}
	}),
)

function fixNoiseSettings(data: any, ctx: FixContext) {
	if (typeof data !== 'object') return

	Object.values(data.noise_router).forEach((d) => fixDensityFunction(d, ctx, data.noise))
}

function fixDensityFunction(data: any, ctx: FixContext, noise: any) {
	if (typeof data === 'string') {
		const id = data.includes(':') ? data : 'minecraft:' + data
		if (!PROCESSED.has(id)) {
			PROCESSED.add(id)
			const file = ctx.read('worldgen/density_function', id)
			if (file && !file.error && !file.deleted) {
				fixDensityFunction(file.data, ctx, noise)
			}
		}
		return
	}

	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'old_blended_noise':
			// TODO: add sampling fields from noise settings
			data.smear_scale_multiplier = 8
			break
		case 'spline':
			delete data.min_value
			delete data.max_value
			break
		case 'terrain_shaper_spline':
			data.type = 'minecraft:spline'
			// TODO: add spline
			break
	}
}
