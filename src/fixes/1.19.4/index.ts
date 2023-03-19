import { Fix } from '../../Fix'
import { Biome } from './Biome'
import { Function } from './Function'
import { Predicates } from './Predicates'

export const Fixes194 = Fix.version('1.19.3', '1.19.4', Fix.groupProblems(
	Fix.packFormat(12),
	Fix.when('functions',
		Function,
	),
	Fix.when('predicates',
		Predicates,
	),
	Fix.when('worldgen',
		Biome,
	)
))
