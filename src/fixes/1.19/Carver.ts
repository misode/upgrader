import { Fix } from '../../Fix'

export const Carver = Fix.all(
	Fix.onFile('worldgen/configured_carver', ({ data }) => fixCarver(data)),
	Fix.onFile('worldgen/biome', ({ data }) => {
		if (typeof data.carvers === 'object') {
			data.carvers.air?.forEach(fixCarver)
			data.carvers.liquid?.forEach(fixCarver)
		}
	}),
)

function fixCarver(data: any) {
	if (typeof data !== 'object') return
	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'canyon':
		case 'cave':
			data.config.replaceable = '#minecraft:overworld_carver_replaceables'
			break
		case 'nether_cave':
			data.config.replaceable = '#minecraft:nether_carver_replaceables'
			break
	}
}
