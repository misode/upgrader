import type { Fix } from '../Fix'
import { Carver } from './Carver'
import { DimensionType } from './DimensionType'
import { NoiseSettings } from './NoiseSettings'
import { PackFormat } from './PackFormat'
import { StructureFeature } from './StructureFeature'

export const Fixes: Fix[] = [
	DimensionType,
	NoiseSettings,
	StructureFeature,
	Carver,
	PackFormat,
]
