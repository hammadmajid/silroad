import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { trpcServer } from '@hono/trpc-server'
import { appRouter } from '@repo/trpc'

const app = new Hono()

app.use('*', cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Add your web app URLs
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
}))

app.use(
	'/trpc/*',
	trpcServer({
		router: appRouter,
		allowBatching: true,
	}),
)

export default app
