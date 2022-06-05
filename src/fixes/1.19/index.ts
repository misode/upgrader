import { Fix } from '../../Fix'
import { Biome } from './Biome'
import { Carver } from './Carver'
import { Dimension } from './Dimension'
import { DimensionType } from './DimensionType'
import { Feature } from './Feature'
import { NoiseSettings } from './NoiseSettings'
import { Predicates } from './Predicates'
import { Structure } from './Structure'

export const Fixes19 = Fix.version('1.18.2', '1.19', Fix.groupProblems(
	Fix.debug('1.19 fixes'),
	Fix.when('worldgen',
		Biome,
		Carver,
		Dimension,
		DimensionType,
		NoiseSettings,
		Structure,
		Feature,
	),
	Fix.when('predicates',
		Predicates,
	),
	Fix.packFormat(10),
))
