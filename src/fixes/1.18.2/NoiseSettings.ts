import { Fix } from '../../Fix'

export const NoiseSettings = Fix.all(
	Fix.onFile('worldgen/noise_settings', ({ data }) => fixNoiseSettings(data)),
	Fix.onFile('dimension', ({ data }) => {
		if (data.generator?.type?.replace(/^minecraft:/, '') === 'noise') {
			fixNoiseSettings(data.generator.settings)
		}
	}),
)

function fixNoiseSettings(data: any) {
	fixSurfaceRule(data.surface_rule)

	// TODO: create noise router
	delete data.noise_caves_enabled
	delete data.noodle_caves_enabled
	delete data.noise.island_noise_override
	delete data.noise.amplified
	delete data.noise.large_biomes

	// TODO: create structure sets
	delete data.structures
}

function fixSurfaceRule(data: any) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'sequence':
			data.sequence.forEach((s: any) => fixSurfaceRule(s))
			break
		case 'condition':
			fixSurfaceCondition(data.if_true)
			fixSurfaceRule(data.then_run)
	}
}

function fixSurfaceCondition(data: any) {
	if (typeof data !== 'object') return
	const condition = data.type.replace(/^minecraft:/, '')
	switch (condition) {
		case 'stone_depth':
			data.secondary_depth_range = data.add_surface_secondary_depth ? 6 : 0
			delete data.add_surface_secondary_depth
	}
}
