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
	export function onFile(category: typeof categories[number], fix: (data: any, ctx: FixContext) => unknown): Fix {
		return (pack, ctx) => {
			for (const [id, data] of Object.entries(pack.data[category])) {
				const fileCtx = {
					warn: (message: string) => ctx.warn(`${id} ${message}`),
				}
				try {
					fix(data, fileCtx)
				} catch (e) {
					const error = new Error(`Error fixing ${category.replace(/^worldgen\//, '').replaceAll('_', ' ')} ${id}: ${e.message}`)
					error.stack = e.stack
					throw error
				}
			}
		}
	}
}

export interface FixContext {
	warn: (message: string) => unknown
}
