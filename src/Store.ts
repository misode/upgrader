import type { VersionOrAuto } from './Version'
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

	export function getSource(): VersionOrAuto {
		const sourceOverride = new URLSearchParams(location.search).get('from')
		if (sourceOverride && Versions.includes(sourceOverride as Version)) {
			return sourceOverride as Version
		}
		const source = get().source
		if (source && Versions.includes(source as Version)) {
			return source as Version
		}
		return Version.DEFAULT_SOURCE
	}

	export function setSource(source: VersionOrAuto) {
		set({ source })
	}

	export function getTarget(): Version {
		const targetOverride = new URLSearchParams(location.search).get('to')
		if (targetOverride && Versions.includes(targetOverride as Version)) {
			return targetOverride as Version
		}
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
