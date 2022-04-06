import { Fix } from '../../Fix'

export const Dimension = Fix.all(
	Fix.onFile('dimension', ({ data }) => fixGenerator(data.generator)),
)

function fixGenerator(data: any) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'noise':
			delete data.seed
			
			fixBiomeSource(data.biome_source)
	}
}

function fixBiomeSource(data: any) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'end':
			delete data.seed
	}
}
