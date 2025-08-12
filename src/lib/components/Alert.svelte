<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x';

	interface Props {
		type?: 'info' | 'success' | 'warning' | 'error';
		dismissible?: boolean;
		title?: string;
		children: Snippet;
		onDismiss?: () => void;
		classes?: string;
		icon?: Snippet;
		[key: string]: any;
	}

	let {
		type = 'info',
		dismissible = false,
		title,
		children,
		onDismiss,
		classes = '',
		icon,
		...restProps
	}: Props = $props();

	const typeClasses = {
		info: 'preset-outlined-primary-500',
		success: 'preset-outlined-success-500',
		warning: 'preset-outlined-warning-500',
		error: 'preset-outlined-error-500'
	};

	const iconColors = {
		info: 'text-primary-500',
		success: 'text-success-500',
		warning: 'text-warning-500',
		error: 'text-error-500'
	};
</script>

<div
	class="w-full card {typeClasses[
		type
	]} grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto] {classes}"
	{...restProps}
>
	{#if icon}
		<div class={iconColors[type]}>
			{@render icon()}
		</div>
	{/if}

	<div>
		{#if title}
			<p class="font-bold">{title}</p>
		{/if}
		<div class="text-sm opacity-60">
			{@render children()}
		</div>
	</div>

	{#if dismissible && onDismiss}
		<div class="flex gap-1">
			<button class="btn preset-tonal hover:preset-filled" onclick={onDismiss} type="button">
				<X size={16} />
				Dismiss
			</button>
		</div>
	{/if}
</div>
