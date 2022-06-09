import { Fix } from '../../Fix'
import { Carver } from './Carver'
import { DimensionType } from './DimensionType'
import { Feature } from './Feature'
import { Function } from './Function'
import { Ids } from './Ids'
import { NoiseSettings } from './NoiseSettings'
import { Predicates } from './Predicates'
import { StructureFeature } from './StructureFeature'

export const Fixes17 = Fix.version('1.16.5', '1.17.1', Fix.groupProblems(
	Fix.when('ids', Ids),
	Fix.when('predicates', Predicates),
	Fix.when('functions', Function),
	Fix.when('worldgen',
		DimensionType,
		NoiseSettings,
		StructureFeature,
		Carver,
		Feature
	),
	Fix.packFormat(7),
))
