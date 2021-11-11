import { useEffect, useState } from 'preact/hooks'
import type { FixConfig } from '../Fix'
import { Pack } from '../Pack'
import type { Version } from '../Version'
import { Octicon } from './Octicon'

type PackCardProps = {
	pack: Pack,
	config: FixConfig,
	source: Version,
	target: Version,
	onError: (error: Error) => unknown,
}
export function PackCard({ pack, config, source, target, onError }: PackCardProps) {
	const [status, setStatus] = useState('Loading...')
	const [download, setDownload] = useState<string | null>(null)
	const [alerts, setAlerts] = useState<string[]>([])
	const [error, setError] = useState<string | null>(null)
	const [alertsHidden, setAlertsHidden] = useState(false)

	const downloadName = pack.name.replace(/\.zip$/, '_1_17.zip')
	const problems: Record<string, string[]> = {}
	alerts.forEach(a => {
		if (a.match(/^[a-z0-9_-]+:[a-z0-9/_-]+ /)) {
			const [file, ...name] = a.split(' ');
			(problems[name.join(' ')] ??= []).push(file)
		} else {
			problems[a] = []
		}
	})

	useEffect(() => {
		(async () => {
			try {
				setStatus('Upgrading...')
				const { warnings } = await Pack.upgrade(pack, config, source, target)
				await new Promise(res => setTimeout(res, 500))
				if (warnings) setAlerts(warnings)

				setStatus('Zipping...')
				const download = await Pack.toZip(pack)
				setDownload(download)
			} catch (e: any) {
				onError(e)
				setError('Error during upgrading')
			}
		})()
	}, [pack])

	const toggleAlerts = () => {
		setAlertsHidden(!alertsHidden)
	}

	return <div class="pack">
		<div class="pack-head">
			{download && <a class="pack-status download" href={download} download={downloadName} data-hover="Download data pack for 1.17">
				{Octicon.download}
			</a>}
			{(!download && !error) && <div class="pack-status loading" data-hover={status}>
				{Octicon.sync}
			</div>}
			{(alerts.length > 0 || error) && <div class={`pack-status alert${error ? ' error' : ''}`} onClick={toggleAlerts} data-hover={error ?? 'There were issues upgrading'}>
				{Octicon.alert}
			</div>}
			<span class="pack-name">{pack.name.replace(/\.zip$/, '')}</span>
		</div>
		{(alerts.length > 0 && !alertsHidden) && <div class="pack-body">
			{Object.entries(problems).map(([name, files]) => <div class="pack-alert">
				<div class="alert-name">{name}</div>
				{files.length > 0 && <>
					<p>Affected files:</p>
					<div class="alert-files">{files.map(file => <p>{file}</p>)}</div>
				</>}
			</div>)}
		</div>}
	</div>
}
