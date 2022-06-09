import { Fix } from '../../Fix'
import { Feature } from './Feature'
import { CycleOrder } from './FeatureCycles'
import { NoiseSettings } from './NoiseSettings'

export const Fixes18 = Fix.all(
	Fix.version('21w44a', '1.18.1', Fix.groupProblems(
		Fix.when('worldgen',
			Feature,
			NoiseSettings
		),
	)),
	Fix.versionInclusive('1.18.1', '1.18.1',
		Fix.when('featureCycles',
			CycleOrder
		)
	)
)
