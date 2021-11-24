import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'
import type { PackFile } from '../../Pack'

export const Biome = Fix.all(
	Fix.onFile('worldgen/biome', fixBiome),
)

function fixBiome({ data }: PackFile, ctx: FixContext) {
	ctx.warn('Biome "depth" and "scale" were removed and replaced with a more powerful terrain shaper option in noise settings. No automatic upgrade possible.')
	data.depth = undefined
	data.scale = undefined

	ctx.warn('Biome "surface_builder" was removed and replaced with a more powerful surface_rule option in noise settings. No automatic upgrade possible.')
	data.surface_builder = undefined

	if (Array.isArray(data.starts) && data.starts.length > 0) {
		ctx.warn('Biome "starts" was removed, custom structures are not supported in 1.18.')
	}
	data.starts = undefined

	if (Array.isArray(data.features) && data.features.length >= 9) {
		(data.features as any[]).splice(8, 0, [])
	}

	// Particle fix (should've been in 1.16 -> 1.17)
	const particle = data.effects.particle?.options
	if (particle?.type?.replace(/minecraft:/, '') === 'dust' && particle.r) {
		data.effects.particle.options = {
			type: 'minecraft:dust',
			color: [particle.r, particle.g, particle.b],
			scale: particle.scale,
		}
	}
}
