import { Fix } from '../../Fix'
import { Feature } from './Feature'
import { NoiseSettings } from './NoiseSettings'

export const Fixes18 = Fix.all(
	Fix.version('21w44a', '1.18-pre6', Fix.groupProblems(
		Fix.debug('1.18 fixes'),
		Fix.when('worldgen',
			Feature,
			NoiseSettings
		),
	)),
	Fix.versionInclusive('1.18-pre6', '1.18-pre6',
		// CycleOrder
	)
)
