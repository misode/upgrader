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

type PackFile<Data = any> = {
	name: string,
	data: Data,
	indent?: string,
	unixPermissions?: string | number,
	dosPermissions?: number,
}

export type Pack = {
	name: string,
	zip: JSZip,
	meta: PackFile,
	data: {
		functions: PackFile<string[]>[],
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
		pack.meta = { ...await loadJson(zip, 'pack.mcmeta')  }
		console.log(pack)
		return pack
	}

	async function loadCategory(zip: JSZip, category: string): Promise<PackFile[]> {
		const matcher = new RegExp(`^data\/([^\/]+)\/${category}\/(.*)\.json$`)
		return Promise.all(Object.keys(zip.files)
			.map(f => f.match(matcher)).filter(m => m)
			.map(async m => ({
				...await loadJson(zip, m![0]),
				name: `${m![1]}:${m![2]}`,
			}))
		)
	}

	async function loadJson(zip: JSZip, path: string): Promise<PackFile> {
		const file = await loadFile(zip, path)
		let text = file.data
		try {
			text = text.replaceAll('\u200B', '').replaceAll('\u200C', '').replaceAll('\u200D', '').replaceAll('\uFEFF', '')
			text = text.split('\n').map(l => l.replace(/^([^"\/]+)\/\/.*/, '$1')).join('\n')
			return { ...file, data: JSON.parse(text) }
		} catch (e) {
			throw new Error(`Cannot parse "${path}": ${e.message}.`)
		}
	}

	async function loadFunctions(zip: JSZip): Promise<PackFile[]> {
		const matcher = /^data\/([^\/]+)\/functions\/(.*)\.mcfunction$/
		return Promise.all(Object.keys(zip.files)
			.map(f => f.match(matcher)).filter(m => m)
			.map(async m => ({
				...await loadFunction(zip, m![0]),
				name: `${m![0]}:${m![1]}`,
			})))
	}

	async function loadFunction(zip: JSZip, path: string): Promise<PackFile> {
		const file = await loadFile(zip, path)
		return { ...file, data: file.data.split('\n') }
	}

	async function loadFile(zip: JSZip, path: string): Promise<PackFile<string>> {
		const file = zip.files[path]
		if (!file) {
			throw new Error(`Cannot find "${path}".`)
		}
		const text = await file.async('text')
		return {
			name: file.name,
			data: text,
			indent: detectIndent(text).indent,
			unixPermissions: file.unixPermissions ?? undefined,
			dosPermissions: file.dosPermissions ?? undefined,
		}
	}

	export async function toZip(pack: Pack) {
		categories.forEach(category => {
			writeCategory(pack.zip, category, pack.data[category])
		})
		writeFunctions(pack.zip, pack.data.functions)
		writeJson(pack.zip, 'pack.mcmeta', pack.meta)
		const blob = await pack.zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
		return URL.createObjectURL(blob)
	}

	function writeCategory(zip: JSZip, category: string, data: PackFile[]) {
		data.forEach(file => {
			const [namespace, path] = file.name.split(':')
			writeJson(zip, `data/${namespace}/${category}/${path}.json`, file)
		})
	}

	function writeFunctions(zip: JSZip, functions: PackFile[]) {
		functions.forEach(file => {
			const [namespace, path] = file.name.split(':')
			zip.file(`data/${namespace}/functions/${path}.mcfunction`, file.data.join('\n'), {
				unixPermissions: file.unixPermissions,
				dosPermissions: file.dosPermissions,
			})
		})
	}

	function writeJson(zip: JSZip, path: string, file: PackFile) {
		const text = JSON.stringify(file.data, null, file.indent) + '\n'
		zip.file(path, text, {
			unixPermissions: file.unixPermissions,
			dosPermissions: file.dosPermissions,
		})
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
