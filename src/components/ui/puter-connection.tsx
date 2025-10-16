'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { initializePuter, checkPuterAuth, authenticatePuter } from '@/lib/puter-integration'

interface PuterConnectionProps {
    onConnectionChange?: (connected: boolean) => void
    className?: string
}

export default function PuterConnection({ onConnectionChange, className }: PuterConnectionProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Check Puter connection on mount
    useEffect(() => {
        checkConnection()
    }, [])

    const checkConnection = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const initialized = await initializePuter()
            const authenticated = initialized && await checkPuterAuth()

            setIsConnected(authenticated)
            onConnectionChange?.(authenticated)
        } catch (err) {
            setError('Failed to check Puter connection')
            console.error('Puter connection check failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleConnect = async () => {
        try {
            setIsConnecting(true)
            setError(null)

            // First initialize Puter
            const initialized = await initializePuter()
            if (!initialized) {
                throw new Error('Failed to initialize Puter.js')
            }

            // Then authenticate
            const authenticated = await authenticatePuter()
            if (authenticated) {
                setIsConnected(true)
                onConnectionChange?.(true)
            } else {
                throw new Error('Authentication was cancelled or failed')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Puter'
            setError(errorMessage)
            console.error('Puter connection failed:', err)
        } finally {
            setIsConnecting(false)
        }
    }

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Checking Puter connection...
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (isConnected) {
        return (
            <Card className={className}>
                <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Connected to Puter.js</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={checkConnection}
                        className="text-xs"
                    >
                        Refresh
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Connect to Puter.js
                </CardTitle>
                <CardDescription>
                    Connect to Puter.js to enable AI-powered icon and UI generation.
                    This is free and works directly in your browser!
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="grid gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Free to use - no API keys required
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        Multiple AI models (GPT, Claude, Gemini)
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        Works entirely in your browser
                    </div>
                </div>

                <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full"
                >
                    {isConnecting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <Zap className="mr-2 h-4 w-4" />
                            Connect to Puter.js
                        </>
                    )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    You&apos;ll be redirected to Puter.com to sign in securely
                </p>
            </CardContent>
        </Card>
    )
}