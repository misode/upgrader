import { Fix } from '../../Fix'
import { Feature } from './Feature'
import { CycleOrder } from './FeatureCycles'
import { NoiseSettings } from './NoiseSettings'

export const Fixes18 = Fix.all(
	Fix.version('21w44a', '1.18', Fix.groupProblems(
		Fix.debug('1.18 fixes'),
		Fix.when('worldgen',
			Feature,
			NoiseSettings
		),
	)),
	Fix.versionInclusive('1.18', '1.18',
		Fix.when('featureCycles',
			Fix.debug('Checking feature order cycle'),
			CycleOrder
		)
	)
)
