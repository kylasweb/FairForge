/**
 * Optimized Server Configuration
 * High-performance setup with clustering and load balancing
 */

import cluster from 'cluster'
import os from 'os'
import { createServer } from 'http'
import { Server } from 'socket.io'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const numCPUs = os.cpus().length

// Enable clustering in production
if (!dev && cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`)

    // Fork workers
    for (let i = 0; i < Math.min(numCPUs, 4); i++) {
        cluster.fork()
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`)
        cluster.fork()
    })
} else {
    startServer()
}

async function startServer() {
    const app = next({ dev })
    const handle = app.getRequestHandler()

    await app.prepare()

    const server = createServer(async (req, res) => {
        try {
            // Add security headers
            res.setHeader('X-Content-Type-Options', 'nosniff')
            res.setHeader('X-Frame-Options', 'DENY')
            res.setHeader('X-XSS-Protection', '1; mode=block')

            // Enable compression
            res.setHeader('Accept-Encoding', 'gzip, deflate, br')

            await handle(req, res)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })

    // Socket.IO with optimizations
    const io = new Server(server, {
        cors: {
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            methods: ['GET', 'POST']
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000
    })

    // Redis adapter for horizontal scaling (optional)
    if (!dev && process.env.REDIS_URL) {
        try {
            // Use require() to avoid TypeScript import errors
            const redisAdapter = require('@socket.io/redis-adapter')
            const redis = require('redis')

            const pubClient = redis.createClient({ url: process.env.REDIS_URL })
            const subClient = pubClient.duplicate()

            await Promise.all([pubClient.connect(), subClient.connect()])
            io.adapter(redisAdapter.createAdapter(pubClient, subClient))

            console.log('✅ Redis adapter connected for horizontal scaling')
        } catch (error) {
            console.log('⚠️ Redis adapter not available, using default Socket.IO configuration')
        }
    } const PORT = parseInt(process.env.PORT || '3000', 10)

    server.listen(PORT, (err?: any) => {
        if (err) throw err
        console.log(`🚀 Worker ${process.pid} ready on http://localhost:${PORT}`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received')
        server.close(() => {
            console.log('Process terminated')
        })
    })
}