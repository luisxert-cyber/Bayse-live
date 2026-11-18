import { removeDevice } from '@/app/devices/actions';

type D = { id: string; device_id: string; label: string; first_seen: string; last_seen: string };
const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function DeviceList({ devices, thisDevice, back }: { devices: D[]; thisDevice: string | null; back: string }) {
  return (
    <ul className="divide-y divide-stone border border-stone">
      {devices.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-3 p-4 text-sm">
          <div>
            <p className="font-bold">{d.label}{d.device_id === thisDevice ? ' (this device)' : ''}</p>
            <p className="text-xs text-muted">First used {when(d.first_seen)} · last used {when(d.last_seen)}</p>
          </div>
          {d.device_id !== thisDevice && (
            <form action={removeDevice}><input type="hidden" name="id" value={d.id} /><input type="hidden" name="back" value={back} />
              <button className="inline-flex min-h-[40px] items-center border border-current px-3 text-xs font-bold uppercase">Remove</button></form>
          )}
        </li>
      ))}
      {!devices.length && <li className="p-4 text-sm text-muted">No devices yet.</li>}
    </ul>
  );
}
