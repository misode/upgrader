import { Fix } from '../../Fix'
import { Biome } from './Biome'
import { Dimension } from './Dimension'
import { Predicates } from './Predicates'

export const Fixes19 = Fix.version('1.18.2', '1.19', Fix.groupProblems(
	Fix.debug('1.19 fixes'),
	Fix.when('worldgen',
		Biome,
		Dimension,
	),
	Fix.when('predicates',
		Predicates,
	),
	Fix.packFormat(10),
))
