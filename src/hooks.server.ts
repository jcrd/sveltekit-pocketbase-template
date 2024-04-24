import PocketBase from 'pocketbase';
import { PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const unprotectedPrefix = ['/auth'];

async function getAdmin() {
	const pb = new PocketBase(PB_URL);

	const { token } = await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);

	pb.beforeSend = (url, options) => {
		options.headers = Object.assign({}, options.headers, {
			Authorization: token
		});
		return { url, options };
	};

	return pb;
}

export const authentication: Handle = async ({ event, resolve }) => {
	event.locals.pb = {
		user: new PocketBase(PB_URL),
		getAdmin
	};

	// load the store data from the request cookie string
	event.locals.pb.user.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	try {
		// get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
		event.locals.pb.user.authStore.isValid &&
			(await event.locals.pb.user.collection('users').authRefresh());
	} catch (_) {
		// clear the auth store on failed refresh
		event.locals.pb.user.authStore.clear();
	}

	const response = await resolve(event);

	// send back the default 'pb_auth' cookie to the client with the latest store state
	response.headers.append('set-cookie', event.locals.pb.user.authStore.exportToCookie());

	return response;
};

export const authorization: Handle = async ({ event, resolve }) => {
	if (
		!unprotectedPrefix.some((path) => event.url.pathname.startsWith(path)) &&
		event.url.pathname !== '/'
	) {
		const model = await event.locals.pb.user.authStore.model;
		if (!model) {
			throw redirect(303, '/auth');
		}
	}

	return await resolve(event);
};

export const handle = sequence(authentication, authorization);
