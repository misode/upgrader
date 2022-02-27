import { Fix } from '../../Fix'

/**
 * Fix infiniburn tag
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
	data.infiniburn = '#' + data.infiniburn
}
