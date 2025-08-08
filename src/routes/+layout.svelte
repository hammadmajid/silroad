<script lang="ts">
	import type { LayoutProps } from './$types';

	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';

	import Building2 from '@lucide/svelte/icons/building-2';
	import User from '@lucide/svelte/icons/user';

	let { data, children }: LayoutProps = $props();

	const { id, image } = data;
</script>

<AppBar>
	{#snippet lead()}
		<a href="/">
			<Building2 size={24} />
		</a>
	{/snippet}
	{#snippet trail()}
		<ul class="flex items-center gap-4">
			<li>
				<a href="/explore" class="anchor">Explore</a>
			</li>
			{#if id}
				<li>
					<a href="/settings/profile" class="btn-icon preset-filled"><User /></a>
				</li>
			{:else}
				<li>
					<a href="/login" class="btn preset-filled">Login</a>
				</li>
			{/if}
		</ul>
	{/snippet}
</AppBar>
<main>
	{@render children()}
</main>
