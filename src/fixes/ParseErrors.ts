import type { Fix } from '../Fix'
import { categories } from '../Pack'

export const ParseErrors: Fix = async (pack, ctx) => {
	categories.forEach(category => {
		pack.data[category].filter(file => file.error).forEach(file => {
			ctx.warn(`!${file.error}`)
		})
	})
}
