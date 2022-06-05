import { Fix } from '../../Fix'

export const DimensionType = Fix.all(
	Fix.onFile('dimension_type', ({ data }) => fixDimensionType(data)),
	Fix.onFile('dimension', ({ data }) => {
		if (typeof data.type === 'object') {
			fixDimensionType(data.type)
		}
	}),
)

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
