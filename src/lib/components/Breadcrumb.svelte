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
</script>

<nav aria-label="Breadcrumb" class="mb-6 {classes}">
	<ol class="flex items-center gap-4">
		{#each items as item, index (index)}
			<li class="flex items-center gap-4">
				{#if item.href}
					<a class="opacity-60 hover:underline" href={item.href}>
						{item.label}
					</a>
				{:else}
					<span>{item.label}</span>
				{/if}

				{#if index < items.length - 1}
					<span class="opacity-50" aria-hidden="true">&rsaquo;</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
