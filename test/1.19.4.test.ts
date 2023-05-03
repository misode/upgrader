import { describe, expect, test } from 'vitest'
import { createUpgrader } from './util'

describe('1.19.4', () => {
	const upgrade = createUpgrader('1.19.3', '1.19.4')

	test('damage source predicate', async () => {
		const pack = await upgrade({
			predicates: {
				'test:foo': {
					condition: 'damage_source_properties',
					predicate: {
						is_projectile: true,
						bypasses_invulnerability: false,
					},
				},
				'test:bar': {
					condition: 'damage_source_properties',
					predicate: {
						direct_entity: {},
					},
				},
			},
		})
		expect(pack['predicates']['test:foo']).toEqual({
			condition: 'damage_source_properties',
			predicate: {
				tags: [
					{
						id: 'minecraft:is_projectile',
						expected: true,
					},
					{
						id: 'minecraft:bypasses_invulnerability',
						expected: true,
					},
				],
			},
		})
		expect(pack['predicates']['test:bar']).toEqual({
			condition: 'damage_source_properties',
			predicate: {
				direct_entity: {},
			},
		})
	})

	test('weather command', async () => {
		const pack = await upgrade({
			functions: {
				'test:foo': [
					'weather rain 400',
					'say hi',
					'execute if score foo bar run weather clean 1000',
				],
			},
		})
		expect(pack['functions']['test:foo']).toEqual([
			'weather rain 400s',
			'say hi',
			'execute if score foo bar run weather clean 1000s',
		])
	})

	test('biome has precipitation', async () => {
		const pack = await upgrade({
			'worldgen/biome': {
				'test:none': {
					precipitation: 'none',
				},
				'test:rain': {
					precipitation: 'rain',
				},
			},
		})
		expect(pack['worldgen/biome']['test:none']).toEqual({
			has_precipitation: false,
		})
		expect(pack['worldgen/biome']['test:rain']).toEqual({
			has_precipitation: true,
		})
	})
})
