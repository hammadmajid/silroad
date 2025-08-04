// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        interface Platform {
            env: Env
            cf: CfProperties
            ctx: ExecutionContext
        }
        interface Locals {
            user: {
                id: string,
                email: string,
                name: string,
                image: string | null,
            }
        }
    }
}

export { };