import { fail, redirect } from '@sveltejs/kit';

import { ClientResponseError } from 'pocketbase';
import { message, superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(72)
});

const resetSchema = z.object({
	email: z.string().email()
});

export async function load({ locals: { pb } }) {
	if (pb.user.authStore.model) {
		return redirect(303, '/dashboard');
	}

	const form = await superValidate(zod(loginSchema));

	return { form };
}

export const actions = {
	signup: async ({ request, fetch, locals: { pb } }) => {
		const data = await request.formData();
		const form = await superValidate(data, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const password = form.data.password;
		data.set('passwordConfirm', password);

		const admin = await pb.getAdmin();

		try {
			await admin.collection('users').create(data, { fetch });
			await admin.collection('users').authWithPassword(email, password, { fetch });
			await admin.collection('users').requestVerification(email, { fetch });
		} catch (error) {
			const errorObj = error as ClientResponseError;

			const res = errorObj.response;
			const messages = [];
			for (const field in res.data) {
				messages.push(`${field}: ${res.data[field].message}`);
			}

			return message(form, messages, { status: res.code });
		}

		return message(form, ['Verification email sent']);
	},
	login: async ({ request, fetch, locals: { pb } }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const password = form.data.password;

		try {
			await pb.user.collection('users').authWithPassword(email, password, { fetch });
		} catch (error) {
			const errorObj = error as ClientResponseError;
			const res = errorObj.response;

			return message(form, [errorObj.data.message], { status: res.code });
		}

		return redirect(303, '/dashboard');
	},
	reset: async ({ request, fetch, locals: { pb } }) => {
		const form = await superValidate(request, zod(resetSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;

		try {
			await pb.user.collection('users').requestPasswordReset(email, { fetch });
		} catch (error) {
			const errorObj = error as ClientResponseError;
			const res = errorObj.response;

			return message(form, [errorObj.data.message], { status: res.code });
		}

		return message(form, ['Reset email sent']);
	},
	logout: async ({ locals: { pb } }) => {
		pb.user.authStore.clear();

		throw redirect(303, '/auth');
	}
};
