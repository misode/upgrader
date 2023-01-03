import { useRef } from 'preact/hooks'
import type { VersionOrAuto } from '../Version'
import { Version, VersionKeys } from '../Version'

type VersionPickerProps = {
	value: VersionOrAuto,
	onChange: (version: VersionOrAuto) => unknown,
	allowAuto?: boolean,
}
export function VersionPicker({ value, onChange, allowAuto }: VersionPickerProps) {
	const select = useRef<HTMLSelectElement>(null)
	const change = () => {
		onChange(select.current.value as Version)
	}
	return <select class="version-picker" ref={select} value={value} onChange={change}>
		{allowAuto && <option value="auto">Auto-detect</option>}
		{VersionKeys
			.filter(v => v !== '21w44a')
			.map(v => <option value={v}>{Version.displayName(v)}</option>)}
	</select>
}
