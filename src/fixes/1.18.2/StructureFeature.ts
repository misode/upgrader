import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'

/**
 * Adds the new biomes and spawn_overrides fields
 */
export const StructureFeature = Fix.all(
	Fix.onFile('worldgen/configured_structure_feature', ({ data }, ctx) => fixStructureFeature(data, ctx)),
)

function fixStructureFeature(data: any, ctx: FixContext) {
	if (typeof data !== 'object') return
	
	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'pillager_outpost':
		case 'village':
			data.adapt_noise = true
	}

	ctx.warn('Cannot upgrade configured structure features, set biomes to empty list.')

	data.biomes = []
	data.spawn_overrides = {}
}
