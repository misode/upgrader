import { Fix } from '../../Fix'
import { Biome } from './Biome'

export const Fixes193 = Fix.version('1.19', '1.19.3', Fix.groupProblems(
	Fix.when('worldgen',
		Biome,
	)
))
