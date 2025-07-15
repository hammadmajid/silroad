import { createFileRoute } from '@tanstack/react-router'
import '../App.css'

import { useMutation, useQuery } from '@tanstack/react-query'
import { trpc } from '@/utils/trpc'

export const Route = createFileRoute('/')({
	component: App,
})

function App() {
	const testQuery = useQuery(trpc.test.testQuery.queryOptions())
	const testMutation = useMutation(trpc.test.testMutation.mutationOptions())

	return (
		<div className='App'>
			<header>
				<h1>{testQuery.data?.message}</h1>
				<button onClick={() => testMutation.mutate()}>
					{testMutation.status}
				</button>
			</header>
		</div>
	)
}
