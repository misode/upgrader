import type { PackFile } from '../src/Pack'
import { categories, Pack } from '../src/Pack'
import { Version } from '../src/Version'

const Categories = [...categories, 'functions'] as const

type Category = typeof Categories[number]

type PackData = Record<Category, Record<string, unknown>>

export function createUpgrader(from: Version, to: Version, format?: number) {
	return async (files: Partial<PackData>): Promise<PackData> => {

		const pack: Pack = {
			name: 'test',
			id: 'test',
			root: null as any,
			meta: {
				name: 'pack.mcmeta',
				data: {
					pack: {
						pack_format: format ?? Version.packFormat(from),
						description: '',
					},
				},
			},
			data: Object.fromEntries(Categories.map((category) => {
				return [category, Object.entries(files[category] ?? {}).map<PackFile>(([name, data]) => {
					return { name, data, indent: '  ' }
				})]
			})),
			status: 'loaded',
		}

		await Pack.upgrade(pack, {
			features: {
				functions: true,
				ids: true,
				predicates: true,
				worldgen: true,
				packFormat: true,
				featureCycles: true,
			},
			source: from,
			target: to,
			onPrompt: async () => '',
			onWarning: () => {},
		})

		return Object.fromEntries(Categories.map((category) => {
			const files: Record<string, unknown> = Object.fromEntries(pack.data[category].map(({ name, data }) => {
				return [name, data]
			}))
			return [category, files]
		})) as PackData
	}
}
