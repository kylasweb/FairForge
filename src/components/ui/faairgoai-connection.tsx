'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { initializeFaairgoAI, checkFaairgoAIAuth, authenticateFaairgoAI } from '@/lib/faairgoai-integration'

interface FaairgoAIConnectionProps {
    onConnectionChange?: (connected: boolean) => void
    className?: string
}

export default function FaairgoAIConnection({ onConnectionChange, className }: FaairgoAIConnectionProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Check FaairgoAI connection on mount
    useEffect(() => {
        checkConnection()
    }, [])

    const checkConnection = async () => {
        setIsLoading(true)
        setError(null)

        try {
            // Initialize FaairgoAI first
            const initialized = await initializeFaairgoAI()

            if (!initialized) {
                setError('FaairgoAI service is currently unavailable')
                setIsConnected(false)
                return
            }

            // Check authentication status
            const connected = await checkFaairgoAIAuth()
            setIsConnected(connected)

            if (onConnectionChange) {
                onConnectionChange(connected)
            }
        } catch (err) {
            console.error('Failed to check FaairgoAI connection:', err)
            setError('Failed to connect to FaairgoAI service')
            setIsConnected(false)
        } finally {
            setIsLoading(false)
        }
    }

    const handleConnect = async () => {
        setIsConnecting(true)
        setError(null)

        try {
            const success = await authenticateFaairgoAI()

            if (success) {
                setIsConnected(true)
                if (onConnectionChange) {
                    onConnectionChange(true)
                }
            } else {
                setError('Authentication failed. Please try again.')
            }
        } catch (err) {
            console.error('FaairgoAI authentication error:', err)
            setError('Failed to authenticate with FaairgoAI')
        } finally {
            setIsConnecting(false)
        }
    }

    const getStatusIcon = () => {
        if (isLoading) {
            return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        }

        if (error) {
            return <AlertCircle className="h-5 w-5 text-red-500" />
        }

        if (isConnected) {
            return <CheckCircle className="h-5 w-5 text-green-500" />
        }

        return <Zap className="h-5 w-5 text-gray-400" />
    }

    const getStatusText = () => {
        if (isLoading) return 'Checking FaairgoAI connection...'
        if (error) return error
        if (isConnected) return 'Connected to FaairgoAI'
        return 'Not connected to FaairgoAI'
    }

    const getStatusColor = () => {
        if (error) return 'text-red-600'
        if (isConnected) return 'text-green-600'
        return 'text-gray-600'
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon()}
                    FaairgoAI Connection
                </CardTitle>
                <CardDescription>
                    Connect to FaairgoAI for advanced AI-powered generation features
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className={`text-sm ${getStatusColor()}`}>
                        {getStatusText()}
                    </div>

                    {!isConnected && !isLoading && (
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
                                    Connect to FaairgoAI
                                </>
                            )}
                        </Button>
                    )}

                    {isConnected && (
                        <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md">
                            ✅ Successfully connected! You can now use AI generation features.
                        </div>
                    )}

                    {error && (
                        <div className="space-y-2">
                            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={checkConnection}
                                className="w-full"
                            >
                                Retry Connection
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Export both the default and named export for compatibility
export { FaairgoAIConnection }