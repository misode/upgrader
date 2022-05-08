import { Fix } from '../../Fix'

export const NoiseSettings = Fix.all(
	Fix.onFile('worldgen/noise_settings', ({ data }) => fixNoiseSettings(data)),
	Fix.onFile('dimension', ({ data }) => {
		if (data.generator?.type?.replace(/^minecraft:/, '') === 'noise') {
			fixNoiseSettings(data.generator.settings)
		}
	}),
	Fix.onFile('worldgen/density_function', ({ data }) => fixDensityFunction(data)),
)

function fixNoiseSettings(data: any) {
	if (typeof data !== 'object') return
	
	Object.values(data.noise_router).forEach(fixDensityFunction)
}

function fixDensityFunction(data: any) {
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
