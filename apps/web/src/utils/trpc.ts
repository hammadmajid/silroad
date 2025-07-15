import { QueryClient } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import type { AppRouter } from '@repo/trpc'

const trpcClient = createTRPCClient<AppRouter>({
	links: [httpBatchLink({ url: 'http://127.0.0.1:8787/trpc/' })],
})

export const queryClient = new QueryClient()

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
})
