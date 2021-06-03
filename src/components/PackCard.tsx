import { useEffect, useState } from 'preact/hooks'
import { Pack } from '../Pack'
import { Octicon } from './Octicon'

export function PackCard({ pack, onError }: { pack: Pack, onError: (error: Error) => unknown }) {
	const [download, setDownload] = useState<string | null>(null)
	const [alerts, setAlerts] = useState<string[] | null>(null)
	const downloadName = `${pack.name.replace(/\.zip$/, '')}_1_17.zip`

	useEffect(() => {
		(async () => {
			try {
				await Pack.upgrade(pack)
				const download = await Pack.toZip(pack)
				setDownload(download)
			} catch (e) {
				onError(e)
				setAlerts(['Error during upgrading'])
			}
		})()
	}, [pack])

	return <div class="pack">
		{download && <a class="pack-status download" href={download} download={downloadName}>
			{Octicon.download}
		</a>}
		{alerts && <div class="pack-status alert">
			{Octicon.alert}
		</div>}
		{(!download && !alerts) && <div class="pack-status loading">
			{Octicon.sync}
		</div>}
		<span>{pack.name.replace(/\.zip$/, '')}</span>
	</div>
}
