import { Fix } from '../../Fix'
import { Biome } from './Biome'
import { Carver } from './Carver'
import { Dimension } from './Dimension'
import { Feature } from './Feature'
import { Function } from './Function'
import { NoiseSettings } from './NoiseSettings'
import { Predicates } from './Predicates'
import { Structure } from './Structure'

export const Fixes19 = Fix.version('1.18.2', '1.19', Fix.groupProblems(
	Fix.when('worldgen',
		Biome,
		Carver,
		Dimension,
		NoiseSettings,
		Structure,
		Feature,
	),
	Fix.when('predicates',
		Predicates,
	),
	Fix.when('functions',
		Function,
	),
	Fix.packFormat(10),
))
