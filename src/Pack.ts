import detectIndent from 'detect-indent'
import JSZip from 'jszip'
import type { FixConfig } from './Fix'
import { Fixes } from './fixes'

export const categories = [
	'advancements',
	'dimension',
	'dimension_type',
	'loot_tables',
	'predicates',
	'tags/blocks',
	'tags/items',
	'worldgen/biome',
	'worldgen/configured_carver',
	'worldgen/configured_feature',
	'worldgen/configured_structure_feature',
	'worldgen/configured_surface_builder',
	'worldgen/noise_settings',
	'worldgen/processor_list',
	'worldgen/template_pool',
] as const

type PackFile = {
	name: string,
	data: any,
	indent?: string,
}

export type Pack = {
	name: string,
	zip: JSZip,
	meta: PackFile,
	data: {
		[category: string]: PackFile[],
	},
}

export namespace Pack {
	export async function fromZip(file: File): Promise<Pack> {
		const buffer = await file.arrayBuffer()
		const zip = await JSZip.loadAsync(buffer)

		const pack: Pack = { name: file.name, zip, data: {} } as Pack
		await Promise.all(categories.map(async category => {
			pack.data[category] = await loadCategory(zip, category)
		}))
		pack.data.functions = await loadFunctions(zip)
		pack.meta = { name: 'pack', ...await loadJson(zip, 'pack.mcmeta') }
		console.log(pack)
		return pack
	}

	async function loadCategory(zip: JSZip, category: string): Promise<PackFile[]> {
		const matcher = new RegExp(`^data\/([^\/]+)\/${category}\/(.*)\.json$`)
		return Promise.all(Object.keys(zip.files)
			.map(f => f.match(matcher)).filter(m => m)
			.map(async m => ({
				name: `${m![1]}:${m![2]}`,
				...await loadJson(zip, m![0]),
			}))
		)
	}

	async function loadJson(zip: JSZip, path: string) {
		let text = await loadText(zip, path)
		const indent = detectIndent(text).indent
		try {
			text = text.split('\n').map(l => l.replace(/^([^"\/]+)\/\/.*/, '$1')).join('\n')
			return { data: JSON.parse(text), indent }
		} catch (e) {
			throw new Error(`Cannot parse "${path}": ${e.message}.`)
		}
	}

	async function loadFunctions(zip: JSZip): Promise<PackFile[]> {
		const matcher = /^data\/([^\/]+)\/functions\/(.*)\.mcfunction$/
		return Promise.all(Object.keys(zip.files)
			.map(f => f.match(matcher)).filter(m => m)
			.map(async m => ({
				name: `${m![1]}:${m![2]}`,
				data: (await loadText(zip, m![0])).split('\n'),
			}))
		)
	}

	async function loadText(zip: JSZip, path: string) {
		const file = zip.files[path]
		if (!file) {
			throw new Error(`Cannot find "${path}".`)
		}
		return await file.async('text')
	}

	export async function toZip(pack: Pack) {
		categories.forEach(category => {
			writeCategory(pack.zip, category, pack.data[category])
		})
		writeFunctions(pack.zip, pack.data.functions)
		writeJson(pack.zip, 'pack.mcmeta', pack.meta.data, pack.meta.indent)
		const blob = await pack.zip.generateAsync({ type: 'blob'})
		return URL.createObjectURL(blob)
	}

	function writeCategory(zip: JSZip, category: string, data: PackFile[]) {
		data.forEach(({ name, data, indent }) => {
			const [namespace, path] = name.split(':')
			writeJson(zip, `data/${namespace}/${category}/${path}.json`, data, indent)
		})
	}

	function writeFunctions(zip: JSZip, functions: PackFile[]) {
		functions.forEach(({ name, data }) => {
			const [namespace, path] = name.split(':')
			writeText(zip, `data/${namespace}/functions/${path}.mcfunction`, data.join('\n'))
		})
	}

	function writeJson(zip: JSZip, path: string, data: any, indent?: string) {
		const text = JSON.stringify(data, null, indent) + '\n'
		writeText(zip, path, text)
	}

	function writeText(zip: JSZip, path: string, data: any) {
		zip.file(path, data)
	}

	export async function upgrade(pack: Pack, config: FixConfig) {
		if (pack.meta.data.pack.pack_format === 7) {
			return {
				warnings: ['This pack already has pack_format 7 and cannot be upgraded.'],
			}
		}

		const warnings: string[] = []
		const ctx = {
			warn: (message: string) => warnings.push(message),
			config: (key: keyof FixConfig) => config[key],
		}
		Fixes(pack, ctx)
		return { warnings }
	}
}
