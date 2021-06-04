import { useEffect, useState } from 'preact/hooks'
import { Pack } from '../Pack'
import { Octicon } from './Octicon'

export function PackCard({ pack, onError }: { pack: Pack, onError: (error: Error) => unknown }) {
	const [download, setDownload] = useState<string | null>(null)
	const [alerts, setAlerts] = useState<string[]>([])
	const [error, setError] = useState<string | null>(null)
	const [alertsHidden, setAlertsHidden] = useState(false)
	const downloadName = pack.name.replace(/\.zip$/, '_1_17.zip')

	useEffect(() => {
		(async () => {
			try {
				const { warnings } = await Pack.upgrade(pack)
				if (warnings) setAlerts(warnings)

				const download = await Pack.toZip(pack)
				setDownload(download)
			} catch (e) {
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
			{(!download && !error) && <div class="pack-status loading">
				{Octicon.sync}
			</div>}
			{((download && alerts.length > 0) || error) && <div class={`pack-status alert${error ? ' error' : ''}`} onClick={toggleAlerts} data-hover={error ?? 'Not everything could be upgraded perfectly'}>
				{Octicon.alert}
			</div>}
			<span class="pack-name">{pack.name.replace(/\.zip$/, '')}</span>
		</div>
		{(download && alerts && !alertsHidden) && <div class="pack-body">
			{alerts.map(alert => <div class="pack-alert">
				{alert}
			</div>)}
		</div>}
	</div>
}
