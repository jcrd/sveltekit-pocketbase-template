import 'unplugin-icons/types/svelte';
import { PocketBase } from 'pocketbase';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: {
				user: import('pocketbase').default;
				getAdmin: () => Promise<import('pocketbase').default>;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
