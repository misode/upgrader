import { useRef } from 'preact/hooks'
import type { Version } from '../Version'
import { Versions } from '../Version'

type VersionPickerProps = {
	value: Version,
	onChange: (version: Version) => unknown,
}
export function VersionPicker({ value, onChange }: VersionPickerProps) {
	const select = useRef<HTMLSelectElement>(null)
	const change = () => {
		onChange(select.current.value as Version)
	}
	return <select class="version-picker" ref={select} value={value} onChange={change}>
		{Versions.map(v => <option value={v}>{v}</option>)}
	</select>
}
