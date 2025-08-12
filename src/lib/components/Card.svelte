<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'interactive' | 'form';
		href?: string;
		base?: string;
		background?: string;
		border?: string;
		padding?: string;
		rounded?: string;
		shadow?: string;
		hover?: string;
		classes?: string;
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	}

	let {
		variant = 'default',
		href,
		base = 'card',
		background = 'preset-filled-surface-100-900',
		border = '',
		padding = 'p-6',
		rounded = 'rounded-container',
		shadow = '',
		hover = '',
		classes = '',
		header,
		children,
		footer,
		...restProps
	}: Props = $props();

	// Variant-specific overrides
	const variantOverrides = {
		default: {},
		interactive: {
			border: 'border-[1px] border-surface-200-800',
			hover: 'card-hover transition-all duration-200 hover:scale-105',
			padding: '' // Will be applied to inner sections instead
		},
		form: {}
	};

	const overrides = variantOverrides[variant];
	
	const finalClasses = [
		base,
		overrides.background || background,
		overrides.border || border,
		overrides.padding || padding,
		overrides.rounded || rounded,
		overrides.shadow || shadow,
		overrides.hover || hover,
		classes
	].filter(Boolean).join(' ');
</script>

{#if href}
	<a {href} class="block {finalClasses}" {...restProps}>
		{#if header}
			<header>
				{@render header()}
			</header>
		{/if}

		<article class={header || footer ? 'space-y-4 p-4' : variant === 'interactive' ? 'p-4' : ''}>
			{@render children()}
		</article>

		{#if footer}
			<footer class="flex items-center justify-between gap-4 p-4">
				{@render footer()}
			</footer>
		{/if}
	</a>
{:else}
	<div class={finalClasses} {...restProps}>
		{#if header}
			<header>
				{@render header()}
			</header>
		{/if}

		<div class={header || footer ? 'space-y-4 p-4' : variant === 'interactive' ? 'p-4' : ''}>
			{@render children()}
		</div>

		{#if footer}
			<footer class="flex items-center justify-between gap-4 p-4">
				{@render footer()}
			</footer>
		{/if}
	</div>
{/if}
