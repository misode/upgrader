import { Fix } from '../../Fix'

/**
 * Adds the new config property to the nether_fossil structure feature
 */
export const StructureFeature = Fix.all(
	Fix.onFile('worldgen/configured_structure_feature', ({ data }) => fixStructureFeature(data)),
	Fix.onFile('worldgen/biome', ({ data }) => {
		if (Array.isArray(data.starts)) {
			data.starts.forEach(fixStructureFeature)
		}
	}),
)

function fixStructureFeature(data: any) {
	if (typeof data !== 'object') return
	const type = data.type.replace(/^minecraft:/, '')

	if (type === 'nether_fossil') {
		if (!data.config) data.config = {}
		data.config.height = {
			type: 'minecraft:uniform',
			min_inclusive: { absolute: 32 },
			max_inclusive: { below_top: 2 },
		}
	}
}
