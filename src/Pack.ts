import JSZip from 'jszip'
import { Fixes } from './fixes'

export const categories = [
	'advancements',
	'dimension',
	'dimension_type',
	'loot_tables',
	'predicates',
	'worldgen/biome',
	'worldgen/configured_carver',
	'worldgen/configured_feature',
	'worldgen/configured_structure_feature',
	'worldgen/configured_surface_builder',
	'worldgen/noise_settings',
	'worldgen/processor_list',
	'worldgen/template_pool',
] as const

export type Pack = {
	name: string,
	zip: JSZip,
	meta: any,
	data: {
		[category: string]: Record<string, any>,
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
		pack.meta = await loadJson(zip, 'pack.mcmeta')
		console.warn(pack)
		return pack
	}
	
	async function loadCategory(zip: JSZip, category: string) {
		const matcher = new RegExp(`^data\/([^\/]+)\/${category}\/(.*)\.json$`)
		return Object.fromEntries(
			await Promise.all(Object.keys(zip.files)
				.map(f => f.match(matcher)).filter(m => m)
				.map<Promise<[string, any]>>(async m => [`${m![1]}:${m![2]}`, await loadJson(zip, m![0])]))
		)
	}

	async function loadJson(zip: JSZip, path: string) {
		const file = zip.files[path]
		if (!file) {
			throw new Error(`Cannot find "${path}".`)
		}
		try {
			let text = await file.async('text')
			text = text.split('\n').map(l => l.replace(/^([^"\/]+)\/\/.*/, '$1')).join('\n')
			return JSON.parse(text)
		} catch (e) {
			throw new Error(`Cannot parse "${path}": ${e.message}.`)
		}
	}

	export async function toZip(pack: Pack) {
		categories.forEach(category => {
			writeCategory(pack.zip, category, pack.data[category])
		})
		writeJson(pack.zip, 'pack.mcmeta', pack.meta)
		const blob = await pack.zip.generateAsync({ type: 'blob'})
		return URL.createObjectURL(blob)
	}
	
	function writeCategory(zip: JSZip, category: string, data: Record<string, any>) {
		Object.entries(data)
			.forEach(([k, v]) => {
				const [namespace, path] = k.split(':')
				writeJson(zip, `data/${namespace}/${category}/${path}.json`, v)
			})
	}

	function writeJson(zip: JSZip, path: string, data: any) {
		const text = JSON.stringify(data, null, 2) + '\n'
		zip.file(path, text)
	}

	export async function upgrade(pack: Pack) {
		if (pack.meta.pack.pack_format === 7) return {
			warnings: ['This pack already has pack_format 7 and cannot be upgraded.'],
		}

		const warnings: string[] = []
		const ctx = {
			warn: (message: string) => warnings.push(message),
		}
		for (const fix of Fixes) {
			fix(pack, ctx)
		}
		return { warnings }
	}
}