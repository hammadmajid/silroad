import { publicProcedure, router } from '../trpc'

const testRouter = router({
	testQuery: publicProcedure.query(() => {
		return { message: 'Hello from testQuery!' }
	}),
	testMutation: publicProcedure.mutation(({ input }) => {
		// Example mutation logic
		return { success: true, input }
	}),
})

export default testRouter
