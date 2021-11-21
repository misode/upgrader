import { Fix } from '../../Fix'

const particleRegex = /particle (light|barrier)/

export const Function = Fix.onFile('functions', ({ data }: { data: string[] }) => {
	data.forEach((line, i) => {
		if (line.startsWith('particle ') || line.startsWith('execute ')) {
			data[i] = data[i].replace(particleRegex, 'particle block_marker $1')
		}
	})
})
