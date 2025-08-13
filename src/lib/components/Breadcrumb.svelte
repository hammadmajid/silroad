<script lang="ts">
	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		items: BreadcrumbItem[];
		classes?: string;
	}

	let { items, classes = '' }: Props = $props();

	function formatLabel(label: string): string {
		return label.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
	}
</script>

<nav aria-label="Breadcrumb" class="mb-6 {classes}">
	<ol class="flex flex-wrap items-center gap-2 text-sm">
		{#each items as item, index (index)}
			<li class="flex items-center gap-2">
				{#if item.href}
					<a
						class="max-w-xs truncate rounded px-1 py-0.5 opacity-60 transition-opacity duration-200 hover:bg-surface-100-900 hover:underline hover:opacity-100"
						href={item.href}
						title={formatLabel(item.label)}
					>
						{formatLabel(item.label)}
					</a>
				{:else}
					<span
						class="text-surface-900-50 max-w-xs truncate font-medium"
						title={formatLabel(item.label)}
					>
						{formatLabel(item.label)}
					</span>
				{/if}

				{#if index < items.length - 1}
					<span class="flex-shrink-0 opacity-50" aria-hidden="true">&rsaquo;</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
