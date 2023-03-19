import { Fix } from '../../Fix'

const WeatherPattern = /^(\s*weather [a-z]+ \d+)/
const WeatherPattern2 = /(run weather [a-z]+ \d+)/

export const Function = Fix.onFile('functions', ({ data }: { data: string[] }) => {
	data.forEach((line, i) => {
		if (line.includes('weather')) {
			data[i] = data[i].replace(WeatherPattern, '$1s')
			data[i] = data[i].replace(WeatherPattern2, '$1s')
		}
	})
})
