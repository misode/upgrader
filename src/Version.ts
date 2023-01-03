/* eslint-disable quote-props */
const Versions = {
	'1.16.5': '1.16.3—1.16.5',
	'1.17.1': '1.17—1.17.1',
	'21w44a': '21w44a',
	'1.18.1': '1.18—1.18.1',
	'1.18.2': '1.18.2',
	'1.19':   '1.19—1.19.2',
	'1.19.3': '1.19.3',
}
export type Version = keyof typeof Versions
export const VersionKeys = Object.keys(Versions) as Version[]
export const PackFormats = [6, 7, 8, 8, 9, 10, 10]
export type VersionOrAuto = Version | 'auto'

export namespace Version {
	export const DEFAULT_SOURCE: VersionOrAuto = 'auto'
	export const DEFAULT_TARGET: Version = '1.19.3'

	export function displayName(version: string): string {
		return VersionKeys.includes(version as Version) ? Versions[version as Version] : version
	}

	export function ord(version: Version): number {
		return VersionKeys.indexOf(version)
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
		return VersionKeys[index]
	}

	export function autoDetectOrFallback(packFormat: number): Version {
		const detected = autoDetect(packFormat)
		if (detected !== undefined) return detected
		if (packFormat < PackFormats[0]) return VersionKeys[0]
		return VersionKeys[VersionKeys.length - 1]
	}

	export function packFormat(version: Version): number {
		const index = VersionKeys.indexOf(version)
		return PackFormats[index]
	}
}
