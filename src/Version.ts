export const Versions = ['1.16.5', '1.17.1', '21w44a', '1.18.1', '1.18.2', '1.19', '1.19.3'] as const
export const PackFormats = [6, 7, 8, 8, 9, 10, 10]
export type Version = typeof Versions[number]
export type VersionOrAuto = Version | 'auto'

export namespace Version {
	export const DEFAULT_SOURCE: VersionOrAuto = 'auto'
	export const DEFAULT_TARGET: Version = '1.19.3'

	export function ord(version: Version): number {
		return Versions.indexOf(version)
	}

	export function order(before: Version, after: Version) {
		return ord(before) < ord(after)
	}

	export function includes(source: Version, target: Version, from: Version, to: Version) {
		return ord(source) < ord(to) && ord(target) > ord(from)
	}

	export function includesInclusive(source: Version, target: Version, from: Version, to: Version) {
		return ord(source) <= ord(to) && ord(target) >= ord(from)
	}

	export function isWorkInProgress(_source: Version, _target: Version) {
		return false
	}

	export function autoDetect(packFormat: number): Version | undefined {
		const index = PackFormats.indexOf(packFormat)
		if (index === -1) return undefined
		if (packFormat === 8) return '1.18.1' // Return 1.18.1 instead of 21w44a
		return Versions[index]
	}

	export function autoDetectOrFallback(packFormat: number): Version {
		const detected = autoDetect(packFormat)
		if (detected !== undefined) return detected
		if (packFormat < PackFormats[0]) return Versions[0]
		return Versions[Versions.length - 1]
	}

	export function packFormat(version: Version): number {
		const index = Versions.indexOf(version)
		return PackFormats[index]
	}
}
