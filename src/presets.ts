import type { CompanionPresetDefinitions, CompanionPresetSection, CompanionOptionValues } from '@companion-module/base'
import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import { COMMANDS, TEST_PATTERNS } from './commands.js'
import { argsFor } from './actions.js'

/** Option values for a command: its defaults, an empty target (= connection default), plus overrides */
function optionsFor(actionId: string, overrides: CompanionOptionValues = {}): CompanionOptionValues {
	const cmd = COMMANDS.find((c) => c.id === actionId)
	if (!cmd) throw new Error(`Unknown command ${actionId}`)
	const options: CompanionOptionValues = { target: 'all' }
	for (const arg of argsFor(cmd)) options[arg.id] = arg.default
	return { ...options, ...overrides }
}

function button(text: string, actionId: string, bgcolor: number, overrides?: CompanionOptionValues) {
	return {
		type: 'simple' as const,
		name: text.replace(/\n/g, ' '),
		style: { text, size: 'auto' as const, color: 0xffffff, bgcolor, show_topbar: false },
		steps: [{ down: [{ actionId, options: optionsFor(actionId, overrides) }], up: [] }],
		feedbacks: [],
	}
}

export function UpdatePresets(self: ModuleInstance): void {
	const presets: Record<string, unknown> = {
		take: button('TAKE', 'cuelist_take', 0x007a3d),
		next: button('NEXT\nCUE', 'cuelist_select_next', 0x333333),
		previous: button('PREV\nCUE', 'cuelist_select_previous', 0x333333),
		seq_play: button('SEQ\nPLAY', 'cuesequence_play', 0x007a3d),
	}
	for (const p of TEST_PATTERNS) {
		presets[`testpattern_${p.id}`] = button(
			p.label.toUpperCase(),
			'testpattern_set',
			p.id === 0 ? 0x333333 : 0x4b2a85,
			{
				pattern: p.id,
			},
		)
	}

	const structure: CompanionPresetSection[] = [
		{
			id: 'cue_list',
			name: 'Cue List',
			definitions: [{ id: 'cue_list_ops', name: 'Operation', type: 'simple', presets: ['take', 'previous', 'next'] }],
		},
		{
			id: 'cue_sequence',
			name: 'Cue Sequence',
			definitions: [{ id: 'cue_sequence_ops', name: 'Playback', type: 'simple', presets: ['seq_play'] }],
		},
		{
			id: 'system',
			name: 'System',
			definitions: [
				{
					id: 'test_patterns',
					name: 'Test Patterns',
					type: 'simple',
					presets: TEST_PATTERNS.map((p) => `testpattern_${p.id}`),
				},
			],
		},
	]

	self.setPresetDefinitions(structure, presets as CompanionPresetDefinitions<ModuleSchema>)
}
