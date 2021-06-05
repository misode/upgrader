import type { Fix } from '../Fix'
import { Carver } from './Carver'
import { DimensionType } from './DimensionType'
import { Feature } from './Feature'
import { Function } from './Function'
import { Ids } from './Ids'
import { NoiseSettings } from './NoiseSettings'
import { PackFormat } from './PackFormat'
import { Predicates } from './Predicates'
import { StructureFeature } from './StructureFeature'

export const Fixes: Fix[] = [
	Ids,
	Predicates,
	Function,
	DimensionType,
	NoiseSettings,
	StructureFeature,
	Carver,
	Feature,
	PackFormat,
]
