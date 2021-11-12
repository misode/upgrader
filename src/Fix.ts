import type { categories, Pack, PackFile } from './Pack'
import { Version } from './Version'

export type Fix = (pack: Pack, ctx: FixContext) => unknown

export namespace Fix {
	/**
	 * Runs each fix after each other
	 */
	export function all(...fixes: Fix[]): Fix {
		return (pack, ctx) => {
			fixes.forEach(fix => fix(pack, ctx))
		}
	}

	/**
	 * A simple fix that runs on one file category
	 */
	export function onFile(category: typeof categories[number] | 'functions', fix: (file: PackFile, ctx: FixContext) => unknown): Fix {
		return (pack, ctx) => {
			for (const file of pack.data[category]) {
				const fileCtx: FixContext = {
					...ctx,
					warn: (message: string) => ctx.warn(`${file.name} ${message}`),
				}
				try {
					fix(file, fileCtx)
				} catch (e: any) {
					const error = new Error(`Error fixing ${category.replace(/^worldgen\//, '').replaceAll('_', ' ')} ${file.name}: ${e.message}`)
					error.stack = e.stack
					console.warn(error)
					throw error
				}
			}
		}
	}

	export function when(key: keyof FixConfig, ...fixes: Fix[]): Fix {
		return (pack, ctx) => {
			if (ctx.config(key)) {
				fixes.forEach(fix => fix(pack, ctx))
			}
		}
	}

	export function assert(predicate: (pack: Pack, ctx: FixContext) => boolean, message: string): Fix {
		return (pack, ctx) => {
			if (!predicate(pack, ctx)) {
				throw new Error(message)
			}
		}
	}

	export function version(from: Version, to: Version, ...fixes: Fix[]): Fix {
		return (pack, ctx) => {
			if (Version.includes(ctx.source(), ctx.target(), from, to)) {
				fixes.forEach(fix => fix(pack, ctx))
			}
		}
	}

	export function debug(message: string): Fix {
		return () => {
			console.debug(message)
		}
	}
}

export type FixConfig = {
	functions: boolean,
	ids: boolean,
	predicates: boolean,
	worldgen: boolean,
	packFormat: boolean,
}

export interface FixContext {
	warn: (message: string) => unknown
	config: (key: keyof FixConfig) => boolean
	create: (category: string, name: string, data: any) => unknown,
	source: () => Version,
	target: () => Version,
}
