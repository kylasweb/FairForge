/**
 * Performance Monitoring and Analytics
 * Tracks app performance metrics and user interactions
 */

'use client'

import { useEffect } from 'react'

interface PerformanceMetrics {
    loadTime: number
    renderTime: number
    apiLatency: number
    errorCount: number
    userSessions: number
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor
    private metrics: PerformanceMetrics = {
        loadTime: 0,
        renderTime: 0,
        apiLatency: 0,
        errorCount: 0,
        userSessions: 0
    }

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor()
        }
        return PerformanceMonitor.instance
    }

    // Track page load performance
    trackPageLoad(): void {
        if (typeof window !== 'undefined' && 'performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart

            // Log Core Web Vitals
            this.trackWebVitals()
        }
    }

    // Track API response times
    trackApiCall(endpoint: string, startTime: number): void {
        const endTime = Date.now()
        const latency = endTime - startTime
        this.metrics.apiLatency = (this.metrics.apiLatency + latency) / 2 // Running average

        console.log(`API ${endpoint}: ${latency}ms`)

        // Alert on slow APIs
        if (latency > 5000) {
            console.warn(`Slow API detected: ${endpoint} took ${latency}ms`)
        }
    }

    // Track errors
    trackError(error: Error, context?: string): void {
        this.metrics.errorCount++

        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        }

        // Send to monitoring service (Sentry, LogRocket, etc.)
        if (process.env.NODE_ENV === 'production') {
            this.sendToMonitoring('error', errorInfo)
        }

        console.error('Performance Monitor - Error:', errorInfo)
    }

    // Track user interactions
    trackUserAction(action: string, data?: any): void {
        const actionInfo = {
            action,
            data,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        }

        // Send to analytics
        this.sendToAnalytics('user_action', actionInfo)
    }

    // Get performance summary
    getMetrics(): PerformanceMetrics {
        return { ...this.metrics }
    }

    private trackWebVitals(): void {
        // Track Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime)
                    }
                }
            })
            observer.observe({ entryTypes: ['largest-contentful-paint'] })
        }
    }

    private sendToMonitoring(type: string, data: any): void {
        // Implement your monitoring service integration
        // Example: Sentry, LogRocket, DataDog, etc.
        fetch('/api/monitoring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data })
        }).catch(console.error)
    }

    private sendToAnalytics(event: string, data: any): void {
        // Implement your analytics service integration
        // Example: Google Analytics, Mixpanel, Amplitude, etc.
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', event, data)
        }
    }

    private getSessionId(): string {
        let sessionId = sessionStorage.getItem('performance_session_id')
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15)
            sessionStorage.setItem('performance_session_id', sessionId)
        }
        return sessionId
    }
}

// React Hook for easy integration
export function usePerformanceMonitor() {
    const monitor = PerformanceMonitor.getInstance()

    useEffect(() => {
        monitor.trackPageLoad()

        // Track errors globally
        const handleError = (event: ErrorEvent) => {
            monitor.trackError(new Error(event.message), 'global')
        }

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            monitor.trackError(new Error(event.reason), 'promise')
        }

        window.addEventListener('error', handleError)
        window.addEventListener('unhandledrejection', handleUnhandledRejection)

        return () => {
            window.removeEventListener('error', handleError)
            window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
    }, [monitor])

    return {
        trackApiCall: monitor.trackApiCall.bind(monitor),
        trackError: monitor.trackError.bind(monitor),
        trackUserAction: monitor.trackUserAction.bind(monitor),
        getMetrics: monitor.getMetrics.bind(monitor)
    }
}