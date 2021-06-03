import { Fix } from '../Fix'

/**
 * Adds the "min_y" and "height" properties to dimension types
 */
export const NoiseSettings = Fix.all([
	Fix.onFile('worldgen/noise_settings', fixNoiseSettings),
	Fix.onFile('dimension', (data) => {
		if (data.generator?.type?.replace(/^minecraft:/, '') === 'noise') {
			fixNoiseSettings(data.generator.settings)
		}
	}),
])

function fixNoiseSettings(data: any) {
	if (typeof data !== 'object') return

	data.min_surface_level = 0
	data.noise_caves_enabled = false
	data.noodle_caves_enabled = false
	data.aquifers_enabled = false
	data.deepslate_enabled = false
	data.ore_veins_enabled = false
	data.noise.min_y = 0
}
