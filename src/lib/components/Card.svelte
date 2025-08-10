<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'interactive' | 'form';
		href?: string;
		class?: string;
		padding?: boolean;
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	}

	let {
		variant = 'default',
		href,
		class: className = '',
		padding = true,
		header,
		children,
		footer,
		...restProps
	}: Props = $props();

	const baseClasses = 'card';

	const variantClasses = {
		default: 'preset-filled-surface-100-900',
		interactive:
			'max-w-md divide-y divide-surface-200-800 overflow-hidden border-[1px] border-surface-200-800 preset-filled-surface-100-900 card-hover transition-all duration-200 hover:scale-105',
		form: 'preset-filled-surface-100-900'
	};

	const paddingClass = padding ? 'p-6' : '';
	const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClass} ${className}`.trim();
</script>

{#if href}
	<a {href} class="block {classes}" {...restProps}>
		{#if header}
			<header>
				{@render header()}
			</header>
		{/if}

		<article class={header || footer ? 'space-y-4 p-4' : ''}>
			{@render children()}
		</article>

		{#if footer}
			<footer class="flex items-center justify-between gap-4 p-4">
				{@render footer()}
			</footer>
		{/if}
	</a>
{:else}
	<div class={classes} {...restProps}>
		{#if header}
			<header>
				{@render header()}
			</header>
		{/if}

		<div class={header || footer ? 'space-y-4 p-4' : ''}>
			{@render children()}
		</div>

		{#if footer}
			<footer class="flex items-center justify-between gap-4 p-4">
				{@render footer()}
			</footer>
		{/if}
	</div>
{/if}
