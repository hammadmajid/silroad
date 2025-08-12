<script lang="ts">
	import { page } from '$app/stores';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Home from '@lucide/svelte/icons/home';
	import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';

	$: error = $page.error;
	$: status = $page.status;

	function getErrorTitle(status: number): string {
		switch (status) {
			case 404:
				return 'Page Not Found';
			case 403:
				return 'Access Forbidden';
			case 500:
				return 'Internal Server Error';
			case 503:
				return 'Service Unavailable';
			default:
				return 'Something went wrong';
		}
	}

	function getErrorDescription(status: number): string {
		switch (status) {
			case 404:
				return "The page you're looking for doesn't exist or has been moved.";
			case 403:
				return "You don't have permission to access this resource.";
			case 500:
				return 'An unexpected error occurred on our servers. Please try again later.';
			case 503:
				return 'The service is temporarily unavailable. Please try again in a few minutes.';
			default:
				return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
		}
	}

	function reload() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Error {status} | Silroad</title>
</svelte:head>

<div class="flex min-h-[60vh] items-center justify-center">
	<div class="text-center space-y-6 max-w-md">
		<div class="flex justify-center">
			<div class="rounded-full bg-error-500/10 p-6">
				<AlertTriangle size={48} class="text-error-500" />
			</div>
		</div>

		<div class="space-y-2">
			<h1 class="h2 font-bold text-surface-900-100">{getErrorTitle(status)}</h1>
			<p class="text-surface-600-300">{getErrorDescription(status)}</p>
			{#if error?.message && status >= 500}
				<details class="mt-4 text-left">
					<summary class="cursor-pointer text-sm text-surface-500-400 hover:text-surface-700-200">
						Technical details
					</summary>
					<pre class="mt-2 text-xs text-surface-600-300 whitespace-pre-wrap">{error.message}</pre>
				</details>
			{/if}
		</div>

		<div class="flex flex-col sm:flex-row gap-3 justify-center">
			<a href="/explore" class="btn preset-filled-primary flex items-center gap-2">
				<Home size={16} />
				<span>Back to Home</span>
			</a>
			<button onclick={reload} class="btn preset-tonal flex items-center gap-2">
				<RefreshCcw size={16} />
				<span>Try Again</span>
			</button>
		</div>
	</div>
</div>