import { Fix } from '../Fix'

export const PackFormat = Fix.create('meta', (data) => {
	data.pack.pack_format = 7
})
