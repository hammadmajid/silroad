<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'filled' | 'tonal' | 'outlined';
		color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'surface';
		size?: 'sm' | 'base' | 'lg';
		base?: string;
		classes?: string;
		children: Snippet;
		icon?: Snippet;
	}

	let {
		variant = 'filled',
		color = 'primary',
		size = 'base',
		base = 'badge',
		classes = '',
		children,
		icon
	}: Props = $props();

	const variantClasses = {
		filled: `preset-filled-${color}-500`,
		tonal: `preset-tonal-${color}`,
		outlined: `preset-outlined-${color}-500`
	};

	const sizeClasses = {
		sm: 'text-xs px-2 py-0.5',
		base: 'text-sm px-2.5 py-1',
		lg: 'text-base px-3 py-1.5'
	};

	const finalClasses = [
		base,
		variantClasses[variant],
		sizeClasses[size],
		classes
	].filter(Boolean).join(' ');
</script>

<span class={finalClasses}>
	{#if icon}
		{@render icon()}
	{/if}
	{@render children()}
</span>