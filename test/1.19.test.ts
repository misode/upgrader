import { describe, expect, test } from 'vitest'
import { createUpgrader } from './util'

describe('1.19', () => {
	const upgrade = createUpgrader('1.18.2', '1.19')

	test('commands', async () => {
		const pack = await upgrade({
			functions: {
				'test:foo': [
					'locatebiome minecraft:plains ~10 ~ ~',
					'locate #minecraft:village',
				],
			},
		})
		expect(pack.functions['test:foo']).toEqual([
			'locate biome minecraft:plains ~10 ~ ~',
			'locate structure #minecraft:village',
		])
	})

	test('dimensions', async () => {
		const pack = await upgrade({
			dimension: {
				'test:foo': {
					type: {},
					generator: {
						type: 'minecraft:noise',
						seed: 123,
					},
				},
			},
		})
		expect(pack.dimension['test:foo']).toEqual({
			type: 'test:foo',
			generator: {
				type: 'minecraft:noise',
			},
		})
		expect(pack.dimension_type['test:foo']).toEqual({
			monster_spawn_block_light_limit: 0,
			monster_spawn_light_level: { type: 'minecraft:uniform', value: { min_inclusive: 0, max_inclusive: 7 } },
		})
	})
})
