import type ModuleInstance from './main.js'

// The OSC protocol is one-way (no state comes back from Smart Preso), so there are no feedbacks yet.
export type FeedbacksSchema = Record<string, never>

export function UpdateFeedbacks(self: ModuleInstance): void {
	self.setFeedbackDefinitions({})
}
