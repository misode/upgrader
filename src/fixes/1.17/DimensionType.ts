import { Fix } from '../../Fix'

/**
 * Adds the "min_y" and "height" properties to dimension types
 */
export const DimensionType = Fix.all(
	Fix.onFile('dimension_type', ({ data }) => fixDimensionType(data)),
	Fix.onFile('dimension', ({ data }) => {
		if (typeof data.type === 'object') {
			fixDimensionType(data.type)
		}
	}),
)

function fixDimensionType(data: any) {
	data.min_y = 0
	data.height = 256
}
