<script lang="ts">
	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import Building2 from '@lucide/svelte/icons/building-2';

	let { children } = $props();
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
				<a href="/about" class="anchor">About</a>
			</li>
			<li>
				<a href="/explore" class="anchor">Explore</a>
			</li>
			<li>
				<a href="/#faq" class="anchor">FAQ</a>
			</li>
			<li>
				<a href="/auth/login" class="btn preset-filled">Login</a>
			</li>
		</ul>
	{/snippet}
</AppBar>
<main>
	{@render children()}
</main>
