import { describe, expect, test } from 'vitest'
import { createUpgrader } from './util'

describe('1.19.3', () => {
	const upgrade = createUpgrader('1.19', '1.19.3', 10)

	test('sound event', async () => {
		const pack = await upgrade({
			'worldgen/biome': {
				'test:foo': {
					effects: {
						sky_color: 8103167,
						mood_sound: {
							sound: 'foo:brrr',
							tick_delay: 6000,
							block_search_extent: 8,
							offset: 2,
						},
					},
				},
				'test:same': {
					effects: {
						ambient_sound: 'foo:music.nether.crimson_forest',
						additions_sound: {
							sound: 'music.nether.crimson_forest',
						},
					},
				},
			},
		})
		expect(pack['worldgen/biome']['test:foo']).toEqual({
			effects: {
				sky_color: 8103167,
				mood_sound: {
					sound: {
						sound_id: 'foo:brrr',
					},
					tick_delay: 6000,
					block_search_extent: 8,
					offset: 2,
				},
			},
		})
		expect(pack['worldgen/biome']['test:same']).toEqual({
			effects: {
				ambient_sound: {
					sound_id: 'foo:music.nether.crimson_forest',
				},
				additions_sound: {
					sound: 'music.nether.crimson_forest',
				},
			},
		})
	})
})
