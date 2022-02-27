import { Fix } from '../../Fix'

export const Dimension = Fix.all(
	Fix.onFile('dimension', ({ data }) => fixGenerator(data.generator)),
)

function fixGenerator(data: any) {
	if (typeof data !== 'object') return

	const type = data.type.replace(/^minecraft:/, '')
	switch (type) {
		case 'flat':
			if (typeof data.settings !== 'object') return
			data.settings.structure_overrides = []
			delete data.settings.structures
	}
}
