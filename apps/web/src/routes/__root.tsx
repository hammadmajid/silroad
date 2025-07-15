import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/utils/trpc'

export const Route = createRootRoute({
	component: () => (
		<>
			<QueryClientProvider client={queryClient}>
				<Outlet />
			</QueryClientProvider>
			<TanStackRouterDevtools />
		</>
	),
})
