// Type declarations for optional dependencies
// This prevents TypeScript errors when optimization packages aren't installed

declare module 'ioredis' {
    export class Redis {
        constructor(url?: string)
        get(key: string): Promise<string | null>
        setex(key: string, ttl: number, value: string): Promise<void>
    }
}

declare module '@socket.io/redis-adapter' {
    export function createAdapter(pubClient: any, subClient: any): any
}

declare module 'redis' {
    export function createClient(options?: { url: string }): {
        connect(): Promise<void>
        duplicate(): any
    }
}

// Global gtag type for analytics
declare global {
    interface Window {
        gtag?: (command: string, action: string, data?: any) => void
    }
}

export { }