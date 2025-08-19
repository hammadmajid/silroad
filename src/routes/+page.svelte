<script lang="ts">
	import Feed from '$lib/components/home/Feed.svelte';
	import Landing from '$lib/components/home/Landing.svelte';
	import { userStore } from '$lib/stores/user.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Silroad</title>
</svelte:head>

<div class="space-y-16">
	{#if userStore.isLoggedIn}
		<Feed
			attendingEvents={data.attendingEvents}
			pastAttendedEvents={data.pastAttendedEvents}
			followedOrgsEvents={data.followedOrgsEvents}
		/>
	{:else}
		<Landing />
	{/if}
</div>
