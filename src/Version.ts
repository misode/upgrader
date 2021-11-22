export const Versions = ['1.16.5', '1.17.1', '21w44a', '1.18-pre5'] as const
export type Version = typeof Versions[number]

export namespace Version {
	export function ord(version: Version): number {
		return Versions.indexOf(version)
	}

	export function order(before: Version, after: Version) {
		return ord(before) < ord(after)
	}

	export function includes(source: Version, target: Version, from: Version, to: Version) {
		return ord(source) < ord(to) && ord(target) > ord(from)
	}
}
