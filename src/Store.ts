import { Version, Versions } from './Version'

type Config = {
	source?: string,
	target?: string,
}

export namespace Store {
	const KEY = 'misode_upgrader_config'

	function get(): Config {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}')
	}

	function set(config: Partial<Config>) {
		const data = { ...get(), ...config }
		localStorage.setItem(KEY, JSON.stringify(data))
	}

	export function getSource(): Version {
		const source = get().source
		if (source && Versions.includes(source as Version)) {
			return source as Version
		}
		return Version.DEFAULT_SOURCE
	}

	export function setSource(source: Version) {
		set({ source })
	}

	export function getTarget(): Version {
		const target = get().target
		if (target && Versions.includes(target as Version)) {
			return target as Version
		}
		return Version.DEFAULT_TARGET
	}

	export function setTarget(target: Version) {
		set({ target })
	}
}
