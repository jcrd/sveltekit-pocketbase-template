<script>
	import { page } from '$app/stores'
	import { superForm } from 'sveltekit-superforms/client'
	import FormStatus from '$lib/components/form/status.svelte'

	export let data

	let error = false

	const { form, message, enhance, errors, constraints, delayed, timeout, submitting, allErrors } = superForm(data.form, {
		resetForm: false
	})

	$: if ($allErrors.length > 0 || $message) {
		error = true
	}
</script>

<svelte:head>
	<title>login</title>
</svelte:head>

<div class="grid grid-rows-3">
	<form
		method="post"
		action="?/login"
		class="row-start-2 w-full flex flex-col items-center gap-8"
		use:enhance
	>
		<div>
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">Email</span>
				</div>
				<input
					id="email"
					name="email"
					type="text"
					class="input input-bordered w-full"
					aria-invalid={$errors.email ? 'true' : undefined}
					bind:value={$form.email}
					{...$constraints.email}
				/>
				{#if $errors.email}<span class="mt-1 p-1 rounded bg-error">{$errors.email}</span>{/if}
			</label>
			<label class="form-control w-full">
				<div class="label">
					<span class="label-text">Password</span>
				</div>
				<input
					id="password"
					name="password"
					type="password"
					class="input input-bordered w-full"
					aria-invalid={$errors.password ? 'true' : undefined}
					bind:value={$form.password}
					{...$constraints.password}
				/>
				{#if $errors.password}<span class="mt-1 p-1 rounded bg-error">{$errors.password}</span>{/if}
			</label>
		</div>
		<div class="flex gap-4">
			<button class="w-20 btn btn-primary" type="submit">
				Log in
			</button>
			<button class="w-20 btn btn-accent" formaction="?/signup">
				Signup
			</button>
		</div>
		<button class="btn btn-link" formaction="?/reset">
			Reset password
		</button>
	</form>
	<div class="row-start-3 flex flex-col items-center">
		{#if $message?.length > 0}
			{#each $message as msg}
				<div
					class="p-2 rounded"
					class:bg-error={$page.status >= 400}
					class:bg-success={$page.status == 200}
				>
					{msg}
				</div>
			{/each}
		{/if}
		<FormStatus data={{delayed, timeout, submitting, error}} />
	</div>
</div>
