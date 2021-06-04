import type { Fix } from '../Fix'
import { Carver } from './Carver'
import { DimensionType } from './DimensionType'
import { Feature } from './Feature'
import { NoiseSettings } from './NoiseSettings'
import { PackFormat } from './PackFormat'
import { Predicates } from './Predicates'
import { StructureFeature } from './StructureFeature'

export const Fixes: Fix[] = [
	DimensionType,
	NoiseSettings,
	StructureFeature,
	Carver,
	Feature,
	Predicates,
	PackFormat,
]
