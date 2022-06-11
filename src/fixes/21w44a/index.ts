import { Fix } from '../../Fix'
import { Advancement } from './Advancement'
import { Biome } from './Biome'
import { Dimension } from './Dimension'
import { Feature } from './Feature'

export const Fixes21w44a = Fix.version('1.17.1', '21w44a', Fix.groupProblems(
	Fix.packFormat(8),
	Fix.when('predicates', Advancement),
	Fix.when('worldgen',
		Dimension,
		Feature,
		Biome,
	),
))
