import type { categories, Pack } from './Pack'

export type Fix = (pack: Pack) => unknown

export namespace Fix {
	/**
	 * Runs each fix after each other
	 */
	export function all(fixes: Fix[]): Fix {
		return (pack) => {
			fixes.forEach(fix => fix(pack))
		}
	}

	/**
	 * A simple fix that runs on one file category
	 */
	export function onFile(category: typeof categories[number], fix: (data: any) => unknown): Fix {
		return (pack) => {
			for (const [_id, data] of Object.entries(pack.data[category])) {
				fix(data)
			}
		}
	}
}
