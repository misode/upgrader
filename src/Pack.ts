import detectIndent from 'detect-indent'
import type { JSZipObject } from 'jszip'
import JSZip from 'jszip'
import stripJsonComments from 'strip-json-comments'
import type { FixConfig, FixContext } from './Fix'
import { Fixes } from './fixes'
import type { VersionOrAuto } from './Version'
import { Version } from './Version'

export const categories = [
	'advancements',
	'dimension',
	'dimension_type',
	'loot_tables',
	'predicates',
	'tags/blocks',
	'tags/entity_types',
	'tags/fluids',
	'tags/game_events',
	'tags/items',
	'tags/worldgen/biome',
	'tags/worldgen/configured_structure_feature',
	'tags/worldgen/flat_level_generator_preset',
	'tags/worldgen/structure',
	'tags/worldgen/world_preset',
	'worldgen/biome',
	'worldgen/configured_carver',
	'worldgen/configured_feature',
	'worldgen/configured_structure_feature',
	'worldgen/configured_surface_builder',
	'worldgen/density_function',
	'worldgen/noise_settings',
	'worldgen/noise',
	'worldgen/placed_feature',
	'worldgen/processor_list',
	'worldgen/structure',
	'worldgen/structure_set',
	'worldgen/template_pool',
] as const

export type PackFile = {
	name: string,
	data: any,
	indent?: string,
	error?: string,
	deleted?: boolean,
}

export type PackStatus = 'loaded' | 'upgrading' | 'upgraded' | 'writing' | 'done' | 'error'

export type PackError = {
	message: string,
	files: string[],
}

export type Pack = {
	id: string,
	name: string,
	root: JSZip,
	status: PackStatus,
	meta: PackFile,
	data: {
		[category: string]: PackFile[],
	},
}

export namespace Pack {
	export async function fromZip(file: File): Promise<Pack[]> {
		const buffer = await file.arrayBuffer()
		const zip = await JSZip.loadAsync(buffer)

		const metaFiles = zip.filter(path => path.endsWith('pack.mcmeta') && !path.startsWith('__MACOSX/'))
		if (metaFiles.length === 0) {
			throw new Error('Cannot find any "pack.mcmeta" files.')
		}
		return Promise.all(metaFiles.map(metaFile => {
			const rootPath = metaFile.name.replace(/\/?pack.mcmeta$/, '')
			const name = rootPath.length === 0
				? file.name.replace(/\.zip$/, '')
				: rootPath.split('/').pop()!
			return loadPack(name, zip.folder(rootPath)!)
		}))
	}

	async function loadPack(name: string, root: JSZip): Promise<Pack> {
		const pack: Pack = {
			id: hexId(),
			name: name,
			root,
			status: 'loaded',
			data: {},
			meta: {
				name: 'pack',
				...await loadJson(root.file('pack.mcmeta')!),
			},
		}
		await Promise.all(categories.map(async category => {
			pack.data[category] = await loadCategory(root.folder('data')!, category)
		}))
		pack.data.functions = await loadFunctions(root.folder('data')!)
		console.log(pack)
		return pack
	}

	async function loadCategory(root: JSZip, category: string): Promise<PackFile[]> {
		const matcher = new RegExp(`^([^\/]+)\/${category}\/(.*)\.json$`)
		const files: { name: string, file: JSZipObject }[] = []
		root.forEach((path, file) => {
			const match = path.match(matcher)
			if (match && match[1] && match[2]) {
				files.push({ name: `${match[1]}:${match[2]}`, file })
			}
		})
		return Promise.all(files.map(async ({ name, file }) => {
			try {
				const data = await loadJson(file)
				return { name, ...data }
			} catch (e: any) {
				return { name, data: undefined, error: e.message }
			}
		}))
	}

	async function loadJson(file: JSZipObject) {
		let text = await loadText(file)
		const indent = detectIndent(text).indent
		try {
			text = text.replaceAll('\u200B', '').replaceAll('\u200C', '').replaceAll('\u200D', '').replaceAll('\uFEFF', '')
			text = text.split('\n').map(l => l.replace(/^([^"\/]+)\/\/.*/, '$1')).join('\n')
			return { data: JSON.parse(stripJsonComments(text)), indent }
		} catch (e: any) {
			throw new Error(`Cannot parse file "${file.name}": ${e.message}.`)
		}
	}

	async function loadFunctions(root: JSZip): Promise<PackFile[]> {
		const matcher = /([^\/]+)\/functions\/(.*)\.mcfunction$/
		return Promise.all(root.filter((path) => path.match(matcher) !== null)
			.map(async file => {
				const m = file.name.match(matcher)
				return {
					name: `${m![1]}:${m![2]}`,
					data: (await loadText(file)).split('\n'),
				}
			})
		)
	}

	async function loadText(file: JSZipObject) {
		return await file.async('text')
	}

	export async function toZip(pack: Pack) {
		if (pack.status !== 'upgraded') {
			throw new Error(`Cannot download pack with status ${pack.status}.`)
		}
		categories.forEach(category => {
			writeCategory(pack.root.folder('data')!, category, pack.data[category] ?? [])
		})
		writeFunctions(pack.root.folder('data')!, pack.data.functions ?? [])
		writeJson(pack.root, 'pack.mcmeta', pack.meta.data, pack.meta.indent)
		const blob = await pack.root.generateAsync({ type: 'blob', compression: 'DEFLATE' })
		const url = URL.createObjectURL(blob)
		pack.status = 'done'
		return url
	}

	function writeCategory(root: JSZip, category: string, data: PackFile[]) {
		data.forEach(({ name, data, indent, error, deleted }) => {
			const [namespace, id] = name.split(':')
			const path = `${namespace}/${category}/${id}.json`
			if (deleted) {
				root.remove(path)
			} else if (!error) {
				writeJson(root, path, data, indent)
			}
		})
	}

	function writeFunctions(root: JSZip, functions: PackFile[]) {
		functions.forEach(({ name, data, error, deleted }) => {
			const [namespace, id] = name.split(':')
			const path = `${namespace}/functions/${id}.mcfunction`
			if (deleted) {
				root.remove(path)
			} else if (!error) {
				writeText(root, path, data.join('\n'))
			}
		})
	}

	function writeJson(zip: JSZip, path: string, data: any, indent?: string) {
		const text = JSON.stringify(data, null, indent) + '\n'
		writeText(zip, path, text)
	}

	function writeText(zip: JSZip, path: string, data: any) {
		zip.file(path, data)
	}

	export async function upgrade(pack: Pack, config: UpgradeConfig) {
		if (pack.status !== 'loaded') {
			throw new Error(`Cannot upgrade pack with status '${pack.status}'.`)
		}

		let source: Version
		const packFormat = pack.meta.data.pack.pack_format
		if (config.source === 'auto') {
			const detectedVersion = Version.autoDetect(packFormat)
			if (detectedVersion === undefined) {
				source = Version.autoDetectOrFallback(packFormat)
				config.onWarning(`No matching version found for pack format ${packFormat}, using fallback ${source}`)
			} else {
				source = detectedVersion
			}
		} else {
			if (packFormat !== Version.packFormat(config.source)) {
				throw new Error(`Found pack format ${packFormat}, which does not match version ${config.source}`)
			}
			source = config.source
		}
		const target = config.target
		if (Version.order(target, source)) {
			throw new Error(`Invalid version range: ${source} > ${target}`)
		}

		const ctx: FixContext = {
			warn: config.onWarning,
			prompt: config.onPrompt,
			source: () => source,
			target: () => target,
			config: (key: keyof FixConfig) => config.features[key],
			read: (category: string, name: string) => {
				return pack.data[category].find(f =>
					f.error === undefined &&
					f.name.replace(/^minecraft:/, '') === name.replace(/^minecraft:/, ''))
			},
			create: (category: string, name: string, data: any) => {
				pack.data[category].push({
					name: name,
					indent: pack.meta.indent,
					data,
				})
			},
		}

		await Fixes(pack, ctx)
		pack.status = 'upgraded'
	}
}

type UpgradeConfig = {
	features: FixConfig,
	source: VersionOrAuto,
	target: Version,
	onPrompt: FixContext['prompt'],
	onWarning: (message: string, files?: string[]) => unknown,
}

const dec2hex = (dec: number) => ('0' + dec.toString(16)).substr(-2)

export function hexId(length = 12) {
	var arr = new Uint8Array(length / 2)
	window.crypto.getRandomValues(arr)
	return Array.from(arr, dec2hex).join('')
}

export function MockPack(): Pack {
	const id = hexId()
	return {
		id,
		name: `Pack${id}`,
		root: new JSZip(),
		status: 'loaded',
		meta: {
			name: 'pack.mcmeta',
			data: { pack: { pack_format: 8, description: '' } },
		},
		data: {
			'worldgen/biome': [
				{
					name: 'test:plains',
					data: { features: [ ['red'] ] },
				},
				{
					name: 'test:desert',
					data: { features: [ ['black', 'red', 'yellow', 'green'] ] },
				},
				{
					name: 'test:jungle',
					data: { features: [ ['green', 'yellow', 'red'] ] },
				},
			],
		},
	}
}
