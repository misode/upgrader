import { Fix } from '../../Fix'
import type { PackFile } from '../../Pack'

export const Biome = Fix.all(
	Fix.onFile('worldgen/biome', fixBiome),
)

function fixBiome({ data }: PackFile) {
	delete data.category
}
