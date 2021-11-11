import type { categories, Pack } from './Pack'
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
	export function onFile(category: typeof categories[number] | 'functions', fix: (data: any, ctx: FixContext) => unknown): Fix {
		return (pack, ctx) => {
			for (const { name, data } of pack.data[category]) {
				const fileCtx = {
					...ctx,
					warn: (message: string) => ctx.warn(`${name} ${message}`),
				}
				try {
					fix(data, fileCtx)
				} catch (e: any) {
					const error = new Error(`Error fixing ${category.replace(/^worldgen\//, '').replaceAll('_', ' ')} ${name}: ${e.message}`)
					error.stack = e.stack
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
			if (Version.intersects(ctx.source(), ctx.target(), from, to)) {
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
	source: () => Version,
	target: () => Version,
}
