import { Fix } from '../../Fix'
import { Dimension } from './Dimension'
import { DimensionType } from './DimensionType'
import { Feature } from './Feature'
import { Function } from './Function'
import { NoiseSettings } from './NoiseSettings'
import { Predicates } from './Predicates'
import { ProcessorList } from './ProcessorList'
import { StructureFeature } from './StructureFeature'

export const Fixes182 = Fix.version('1.18.1', '1.18.2', Fix.groupProblems(
	Fix.packFormat(9),
	Fix.when('worldgen',
		DimensionType,
		NoiseSettings,
		Dimension,
		StructureFeature,
		ProcessorList,
		Feature,
	),
	Fix.when('predicates',
		Predicates,
	),
	Fix.when('functions', Function),
))
