import type { categories } from './Pack'

export type Fix = {
	type: 'meta' | typeof categories[number],
	fix: (data: any, id: string) => unknown,
}
export namespace Fix {
	export function create(type: Fix['type'], fix: Fix['fix']): Fix {
		return { type, fix }
	}
}
