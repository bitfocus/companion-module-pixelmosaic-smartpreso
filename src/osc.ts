import { createSocket, type Socket } from 'node:dgram'

/** One OSC argument. Ints and floats are sent as distinct OSC types (i / f). */
export type OscArg =
	| { type: 'i'; value: number }
	| { type: 'f'; value: number }
	| { type: 's'; value: string }
	| { type: 'T' }
	| { type: 'F' }

export const oscInt = (value: number): OscArg => ({ type: 'i', value: Math.trunc(value) })
export const oscFloat = (value: number): OscArg => ({ type: 'f', value })
export const oscString = (value: string): OscArg => ({ type: 's', value })
export const oscBool = (value: boolean): OscArg => (value ? { type: 'T' } : { type: 'F' })

/** OSC strings are null-terminated and padded to a multiple of 4 bytes. */
function oscStringBytes(s: string): Buffer {
	const raw = Buffer.from(s, 'utf8')
	const out = Buffer.alloc((raw.length + 4) & ~3) // +1 for the null, rounded up to 4
	raw.copy(out)
	return out
}

/** Encode a single OSC 1.0 message. All numbers are big-endian. */
export function encodeOscMessage(address: string, args: OscArg[]): Buffer {
	const parts: Buffer[] = [oscStringBytes(address), oscStringBytes(',' + args.map((a) => a.type).join(''))]
	for (const arg of args) {
		switch (arg.type) {
			case 'i': {
				const b = Buffer.alloc(4)
				b.writeInt32BE(arg.value)
				parts.push(b)
				break
			}
			case 'f': {
				const b = Buffer.alloc(4)
				b.writeFloatBE(arg.value)
				parts.push(b)
				break
			}
			case 's':
				parts.push(oscStringBytes(arg.value))
				break
			// T and F carry no data bytes
		}
	}
	return Buffer.concat(parts)
}

/** A UDP sender with broadcast enabled, so the destination can be a broadcast or unicast address. */
export class OscSender {
	private socket: Socket | null = null
	private ready: Promise<void> | null = null

	async open(onError: (err: Error) => void): Promise<void> {
		this.close()
		const socket = createSocket({ type: 'udp4', reuseAddr: true })
		this.socket = socket
		socket.on('error', onError)
		this.ready = new Promise((resolve, reject) => {
			socket.once('error', reject)
			// setBroadcast only works on a bound socket; port 0 = any free local port
			socket.bind(0, () => {
				socket.off('error', reject)
				socket.setBroadcast(true)
				resolve()
			})
		})
		return this.ready
	}

	async send(host: string, port: number, address: string, args: OscArg[]): Promise<void> {
		if (!this.socket || !this.ready) throw new Error('OSC socket is not open')
		await this.ready
		const packet = encodeOscMessage(address, args)
		const socket = this.socket
		await new Promise<void>((resolve, reject) => {
			socket.send(packet, port, host, (err) => (err ? reject(err) : resolve()))
		})
	}

	close(): void {
		try {
			this.socket?.close()
		} catch {
			// already closed
		}
		this.socket = null
		this.ready = null
	}
}
