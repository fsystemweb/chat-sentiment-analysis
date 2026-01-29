'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import type { Notification } from '@/lib/types'
import { useNotifications } from './notification-context'
import { Spinner } from '@/components/ui/spinner'

interface ToastProps {
    notification: Notification
}

const iconMap = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
    loading: null, // Will use Spinner instead
}

const colorMap = {
    info: 'border-primary bg-primary/5 text-primary',
    success: 'border-success bg-success/5 text-success',
    warning: 'border-warning bg-warning/5 text-warning',
    error: 'border-destructive bg-destructive/5 text-destructive',
    loading: 'border-primary bg-primary/5 text-primary',
}

export function Toast({ notification }: ToastProps) {
    const { removeNotification } = useNotifications()
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        if (notification.duration) {
            const timer = setTimeout(() => {
                setIsExiting(true)
                setTimeout(() => removeNotification(notification.id), 300)
            }, notification.duration)
            return () => clearTimeout(timer)
        }
    }, [notification.id, notification.duration, removeNotification])

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(() => removeNotification(notification.id), 300)
    }

    const Icon = iconMap[notification.type]

    return (
        <div
            className={`
        toast-item relative flex items-start gap-3 rounded-lg border-l-4 bg-card p-4 shadow-lg
        ${colorMap[notification.type]}
        ${isExiting ? 'toast-exit' : 'toast-enter'}
      `}
            role="alert"
        >
            <div className="shrink-0 pt-0.5">
                {notification.type === 'loading' ? (
                    <Spinner size="sm" />
                ) : Icon ? (
                    <Icon className="h-5 w-5" />
                ) : null}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{notification.title}</p>
                {notification.message && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                    </p>
                )}
            </div>
            <button
                onClick={handleClose}
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
