<script lang="ts">
	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

	interface Props {
		text?: string;
		size?: string;
		centered?: boolean;
		classes?: string;
	}

	let { text = 'Loading...', size = 'size-14', centered = true, classes = '' }: Props = $props();
</script>

<div class="flex {centered ? 'items-center justify-center' : ''} py-12 {classes}">
	<div class="space-y-4 text-center">
		<ProgressRing
			value={null}
			{size}
			meterStroke="stroke-primary-600-400"
			trackStroke="stroke-primary-50-950"
		/>
		{#if text}
			<p class="text-sm opacity-70">{text}</p>
		{/if}
	</div>
</div>
