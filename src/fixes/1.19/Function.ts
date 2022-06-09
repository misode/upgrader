import { Fix } from '../../Fix'

export const Function = Fix.onFile('functions', ({ data }: { data: string[] }) => {
	data.forEach((line, i) => {
		if (line.startsWith('locate ') || line.startsWith('execute ')) {
			data[i] = data[i].replace('locate ', 'locate structure ')
		}
		if (line.startsWith('locatebiome ') || line.startsWith('execute ')) {
			data[i] = data[i].replace('locatebiome ', 'locate biome ')
		}
		if (line.startsWith('placefeature ') || line.startsWith('execute ')) {
			data[i] = data[i].replace('placefeature ', 'place feature ')
		}
	})
})
