<script lang="ts">
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import Building2 from '@lucide/svelte/icons/building-2';
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
<section class="flex flex-col items-center justify-center py-16">
	<h1 class="h1 mb-2">Welcome to Silroad</h1>
	<p class="mb-8 max-w-xl text-center text-xl">
		Connect with people
	</p>
	<div class="flex gap-4">
		<a href="/auth/register" class="btn preset-filled">Get Started</a>
		<a href="/explore" class="btn preset-outlined">Explore</a>
	</div>
</section>
