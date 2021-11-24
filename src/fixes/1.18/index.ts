import { Fix } from '../../Fix'
// import { CycleOrder } from './CycleOrder'
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
		Fix.debug('Checking feature order cycle'),
		// CycleOrder
	)
)
