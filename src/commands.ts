/**
 * The Smart Preso command library, one entry per OSC command.
 * actions.ts turns each entry into a Companion action automatically, so adding a
 * command to the module means adding an entry here.
 *
 * IMPORTANT: once released, never rename an entry's `id` or an argument's `id`.
 * Users' buttons reference them; renaming breaks existing buttons (use an upgrade script instead).
 */

export type ArgDef =
	| { kind: 'int'; id: string; label: string; default: number; min: number; max: number }
	| {
			kind: 'float'
			id: string
			label: string
			default: number
			min: number
			max: number
			step?: number
			scale?: number
	  }
	| { kind: 'string'; id: string; label: string; default: string }
	| { kind: 'bool'; id: string; label: string; default: boolean }
	| { kind: 'color'; id: string; label: string; default: number }
	| { kind: 'choice'; id: string; label: string; default: number; choices: { id: number; label: string }[] }

export interface CommandDef {
	id: string
	name: string
	description?: string
	/** Address after /sp/TARGET/ */
	path: string
	args: ArgDef[]
	/** Adds the trailing "relay to Player devices" bool argument (commands marked * in the API doc) */
	relay?: boolean
}

const TRACK: ArgDef = { kind: 'int', id: 'track', label: 'Track Index', default: 1, min: 1, max: 999 }
const PLAY: ArgDef = { kind: 'bool', id: 'play', label: 'Play after cueing (unchecked = pause)', default: true }
const PIXELS = 100000

export const TEST_PATTERNS = [
	{ id: 0, label: 'OFF' },
	{ id: 1, label: 'Pixel Map Grid' },
	{ id: 2, label: 'Window IDs' },
	{ id: 3, label: 'Color Bars' },
	{ id: 4, label: 'Vertical Gray Bars' },
	{ id: 5, label: 'Horizontal Gray Bars' },
	{ id: 6, label: 'Cross Hatch' },
]

export const COMMANDS: CommandDef[] = [
	// ---------------------------------------------------------------- Cue List
	{
		id: 'cuelist_activate',
		name: 'Cue List: Activate',
		path: 'cuelist/activate',
		args: [{ kind: 'string', id: 'name', label: 'Cue List name', default: 'Cue List 1' }],
	},
	{ id: 'cuelist_take', name: 'Cue List: Take (run) current Cue List Item', path: 'cuelist/current/take', args: [] },
	{ id: 'cuelist_select_next', name: 'Cue List: Select next Cue List Item', path: 'cuelist/cue/select/next', args: [] },
	{
		id: 'cuelist_select_previous',
		name: 'Cue List: Select previous Cue List Item',
		path: 'cuelist/cue/select/previous',
		args: [],
	},
	{
		id: 'cuelist_select',
		name: 'Cue List: Select Cue List Item',
		path: 'cuelist/cue/select',
		args: [
			{ kind: 'string', id: 'group', label: 'Cue Group name', default: 'Cue Group 1' },
			{ kind: 'int', id: 'item', label: 'Cue Item number', default: 1, min: 1, max: 9999 },
		],
	},

	// ---------------------------------------------------------------- Cue Sequence
	{
		id: 'cuesequence_activate',
		name: 'Cue Sequence: Activate',
		path: 'cuesequence/activate',
		args: [{ kind: 'string', id: 'name', label: 'Cue Sequence name', default: 'Cue Seq 1' }],
	},
	{ id: 'cuesequence_play', name: 'Cue Sequence: Play', path: 'cuesequence/current/play', args: [] },
	{
		id: 'cuesequence_goto',
		name: 'Cue Sequence: Go to Cue Column',
		path: 'cuesequence/current/goto',
		args: [{ kind: 'int', id: 'column', label: 'Cue Column', default: 1, min: 1, max: 9999 }, PLAY],
	},
	{
		id: 'cuesequence_goto_marker',
		name: 'Cue Sequence: Go to Marker',
		path: 'cuesequence/current/goto/marker',
		args: [{ kind: 'string', id: 'marker', label: 'Marker', default: 'Marker A' }, PLAY],
	},

	// ---------------------------------------------------------------- Timeline Cue
	{ id: 'cue_play', name: 'Timeline Cue: Play', path: 'cuesequence/cue/play', args: [TRACK] },
	{ id: 'cue_stop', name: 'Timeline Cue: Stop', path: 'cuesequence/cue/stop', args: [TRACK] },
	{
		id: 'cue_goto',
		name: 'Timeline Cue: Go to time',
		path: 'cuesequence/cue/goto',
		args: [
			TRACK,
			{ kind: 'float', id: 'seconds', label: 'Time (seconds)', default: 0, min: 0, max: 86400, step: 0.1 },
			PLAY,
		],
	},
	{
		id: 'cue_goto_marker',
		name: 'Timeline Cue: Go to Marker (Compositions)',
		path: 'cuesequence/cue/goto/marker',
		args: [TRACK, { kind: 'string', id: 'marker', label: 'Marker (e.g. 30s)', default: '30s' }, PLAY],
	},
	{
		id: 'cue_set_transform',
		name: 'Timeline Cue: Set transform',
		path: 'cuesequence/cue/set/transform',
		relay: true,
		args: [
			TRACK,
			{ kind: 'float', id: 'x', label: 'X position (px)', default: 0, min: -PIXELS, max: PIXELS },
			{ kind: 'float', id: 'y', label: 'Y position (px)', default: 0, min: -PIXELS, max: PIXELS },
			{ kind: 'float', id: 'width', label: 'Width (px)', default: 1920, min: 0, max: PIXELS },
			{ kind: 'float', id: 'height', label: 'Height (px)', default: 1080, min: 0, max: PIXELS },
		],
	},
	{
		id: 'cue_set_rotation',
		name: 'Timeline Cue: Set rotation',
		path: 'cuesequence/cue/set/rotation',
		relay: true,
		args: [
			TRACK,
			{ kind: 'float', id: 'x', label: 'X rotation (deg)', default: 0, min: -360, max: 360 },
			{ kind: 'float', id: 'y', label: 'Y rotation (deg)', default: 0, min: -360, max: 360 },
			{ kind: 'float', id: 'z', label: 'Z rotation (deg)', default: 0, min: -360, max: 360 },
		],
	},
	{
		id: 'cue_set_crop',
		name: 'Timeline Cue: Set crop',
		path: 'cuesequence/cue/set/crop',
		relay: true,
		args: [
			TRACK,
			{ kind: 'float', id: 'left', label: 'Left crop (px)', default: 0, min: 0, max: PIXELS },
			{ kind: 'float', id: 'right', label: 'Right crop (px)', default: 0, min: 0, max: PIXELS },
			{ kind: 'float', id: 'top', label: 'Top crop (px)', default: 0, min: 0, max: PIXELS },
			{ kind: 'float', id: 'bottom', label: 'Bottom crop (px)', default: 0, min: 0, max: PIXELS },
			{ kind: 'float', id: 'feather', label: 'Edge feathering (px)', default: 0, min: 0, max: PIXELS },
		],
	},
	{
		id: 'cue_set_opacity',
		name: 'Timeline Cue: Set opacity',
		path: 'cuesequence/cue/set/opacity',
		relay: true,
		// Shown to users as 0-100 %, sent to Smart Preso as 0-1
		args: [TRACK, { kind: 'float', id: 'opacity', label: 'Opacity (%)', default: 100, min: 0, max: 100, scale: 0.01 }],
	},
	{
		id: 'cue_set_color',
		name: 'Timeline Cue: Set color',
		path: 'cuesequence/cue/set/color',
		relay: true,
		args: [TRACK, { kind: 'color', id: 'color', label: 'Color / tint', default: 0xffffff }],
	},
	{
		id: 'cue_set_volume',
		name: 'Timeline Cue: Set volume',
		path: 'cuesequence/cue/set/volume',
		relay: true,
		args: [TRACK, { kind: 'float', id: 'volume', label: 'Volume (%)', default: 100, min: 0, max: 100, scale: 0.01 }],
	},

	// ---------------------------------------------------------------- System
	{
		id: 'testpattern_set',
		name: 'System: Set test pattern',
		path: 'network/testpattern/set',
		args: [{ kind: 'choice', id: 'pattern', label: 'Test pattern', default: 0, choices: TEST_PATTERNS }],
	},
]
