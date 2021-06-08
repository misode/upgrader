

export function Config({ name, value, onChange }: { name: string, value: boolean, onChange: (value: boolean) => unknown }) {
	return <label class="config">	
		<input type="checkbox" checked={value} onChange={(e) => onChange((e.target as any).checked )} />
		{name}
	</label>
}
