

export function Config({ name, value, onChange }: { name: string, value: boolean, onChange: (value: boolean) => unknown }) {
	return <div class="config">
		<label>	
			<input type="checkbox" checked={value} onChange={(e) => onChange((e.target as any).checked )} />
			{name}
		</label>
	</div>
}
