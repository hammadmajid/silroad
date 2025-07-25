import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			autoCodeSplitting: true,
			quoteStyle: 'single',
			addExtensions: true,
			semicolons: false,
		}),
		viteReact(),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
})
