import { Fix } from '../../Fix'

/**
 * Renames grass_path to dirt_path
 */
export const Ids = Fix.all(
	Fix.onFile('tags/blocks', ({ data }) => fixTag(data)),
	Fix.onFile('tags/items', ({ data }) => fixTag(data)),
)

function fixTag(data: any) {
	data.values?.forEach((_: any, i: number) => fixIds(data.values, i))
}

export function fixIds(data: any, key: string | number) {
	const id = data[key].replace(/^minecraft:/, '')

	if (id === 'grass_path') {
		data[key] = 'minecraft:dirt_path'
	}
}
