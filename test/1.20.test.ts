import { describe, expect, test } from 'vitest'
import { createUpgrader } from './util'

describe('1.19.4', () => {
	const upgrade = createUpgrader('1.19.4', '1.20')

	test('trigger field merges', async () => {
		const pack = await upgrade({
			advancements: {
				'test:foo': {
					criteria: {
						foo: {
							trigger: 'minecraft:item_used_on_block',
							conditions: {
								item: {
									items: [
										'minecraft:glow_ink_sac',
									],
								},
								location: {
									block: {
										tag: 'minecraft:all_signs',
									},
								},
							},
						},
					},
				},
			},
		})
		expect(pack['advancements']['test:foo']).toEqual({
			criteria: {
				foo: {
					trigger: 'minecraft:item_used_on_block',
					conditions: {
						location: [
							{
								condition: 'minecraft:match_tool',
								predicate: {
									items: [
										'minecraft:glow_ink_sac',
									],
								},
							},
							{
								condition: 'minecraft:location_check',
								predicate: {
									block: {
										tag: 'minecraft:all_signs',
									},
								},
							},
						],
					},
				},
			},
		})
	})
})
