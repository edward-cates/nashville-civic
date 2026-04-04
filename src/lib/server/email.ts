import { env } from '$env/dynamic/private';
import type { ContactFormData } from '$lib/types';

interface SendResult {
	success: boolean;
	error?: string;
	mailtoFallback?: string;
}

export async function sendContactEmail(data: ContactFormData): Promise<SendResult> {
	const apiKey = env.RESEND_API_KEY;

	// If no Resend API key, return a mailto link as fallback
	if (!apiKey) {
		const subject = encodeURIComponent(data.subject);
		const body = encodeURIComponent(
			`${data.message}\n\n---\nSent by ${data.senderName} (${data.senderEmail}) via Nashville Civic`
		);
		return {
			success: false,
			mailtoFallback: `mailto:${data.representativeEmail}?subject=${subject}&body=${body}`
		};
	}

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: 'Nashville Civic <noreply@nashvillecivic.org>',
			to: [data.representativeEmail],
			reply_to: data.senderEmail,
			subject: `[Constituent Message] ${data.subject}`,
			text: `Message from ${data.senderName} (${data.senderEmail}), a Nashville constituent:\n\n${data.message}\n\n---\nSent via Nashville Civic (nashvillecivic.org)\nThis is a constituent message forwarded by Nashville Civic. Reply directly to reach the sender.`
		})
	});

	if (!res.ok) {
		const error = await res.text();
		console.error('Resend API error:', error);
		return { success: false, error: 'Failed to send email. Please try again.' };
	}

	return { success: true };
}
