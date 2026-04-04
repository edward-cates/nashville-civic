import { sendContactEmail } from '$lib/server/email';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const senderName = formData.get('senderName') as string;
		const senderEmail = formData.get('senderEmail') as string;
		const subject = formData.get('subject') as string;
		const message = formData.get('message') as string;
		const representativeName = formData.get('representativeName') as string;
		const representativeEmail = formData.get('representativeEmail') as string;
		const representativeLevel = formData.get('representativeLevel') as string;

		if (!senderName || !senderEmail || !subject || !message) {
			return fail(400, { error: 'All fields are required.' });
		}

		if (!representativeEmail) {
			return fail(400, { error: 'No representative email address provided.' });
		}

		const result = await sendContactEmail({
			senderName,
			senderEmail,
			subject,
			message,
			representativeName,
			representativeEmail,
			representativeLevel
		});

		if (result.mailtoFallback) {
			return { success: false, mailtoFallback: result.mailtoFallback };
		}

		if (!result.success) {
			return fail(500, { error: result.error || 'Failed to send message.' });
		}

		return { success: true };
	}
};
