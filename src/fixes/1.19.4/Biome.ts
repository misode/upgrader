import { Fix } from '../../Fix'
import type { PackFile } from '../../Pack'

export const Biome = Fix.all(
	Fix.onFile('worldgen/biome', fixBiome),
)

async function fixBiome({ data }: PackFile) {
	if (typeof data !== 'object') return

	data.has_precipitation = data.precipitation == 'rain' || data.precipitation == 'snow'

	delete data.precipitation
}
