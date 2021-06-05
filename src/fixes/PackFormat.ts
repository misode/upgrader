import type { Fix } from '../Fix'
import type { Pack } from '../Pack'

/**
 * Sets the pack.mcmeta "pack_format" to 7
 */
export const PackFormat: Fix = (pack: Pack) => {
	pack.meta.data.pack.pack_format = 7
}
