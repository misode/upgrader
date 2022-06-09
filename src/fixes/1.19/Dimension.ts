import type { FixContext } from '../../Fix'
import { Fix } from '../../Fix'

export const Dimension = Fix.all(
	Fix.onFile('dimension_type', ({ data }) => fixDimensionType(data)),
	Fix.onFile('dimension', ({ data, name }, ctx) => fixDimension(data, name, ctx)),
)

function fixDimension(data: any, name: string, ctx: FixContext) {
	if (typeof data !== 'object') return

	if (typeof data.type === 'object') {
		fixDimensionType(data.type)
		ctx.create('dimension_type', name, data.type)
		data.type = name
	}

	fixGenerator(data.generator)
}

function fixDimensionType(data: any) {
	data.monster_spawn_block_light_limit = 0
	data.monster_spawn_light_level = {
		type: 'minecraft:uniform',
		value: {
			min_inclusive: 0,
			max_inclusive: 7,
		},
	}
}

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
