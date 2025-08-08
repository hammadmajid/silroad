<script lang="ts">
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<div class="min-h-screen flex">
	<!-- Left side - Image (hidden on mobile) -->
	<div class="hidden lg:flex lg:w-1/2">
		<div class="relative w-full">
			<enhanced:img
				src="./placeholder.png"
				alt="Silroad Platform"
				class="absolute inset-0 w-full h-full object-cover"
			/>
			<div class="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20"></div>
		</div>
	</div>

	<!-- Right side - Content -->
	<div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
		<div class="w-full max-w-md">
			{@render children()}
		</div>
	</div>
</div>
