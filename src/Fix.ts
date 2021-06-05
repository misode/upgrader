import type { categories, Pack } from './Pack'

export type Fix = (pack: Pack, ctx: FixContext) => unknown

export namespace Fix {
	/**
	 * Runs each fix after each other
	 */
	export function all(fixes: Fix[]): Fix {
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
				} catch (e) {
					const error = new Error(`Error fixing ${category.replace(/^worldgen\//, '').replaceAll('_', ' ')} ${name}: ${e.message}`)
					error.stack = e.stack
					throw error
				}
			}
		}
	}
}

export type FixConfig = Record<string, boolean>

export interface FixContext {
	warn: (message: string) => unknown
	config: (config: string) => boolean
}
