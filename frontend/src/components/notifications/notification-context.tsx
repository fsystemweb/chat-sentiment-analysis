'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import type { Notification } from '@/lib/types'

interface NotificationState {
    notifications: Notification[]
}

type NotificationAction =
    | { type: 'ADD'; notification: Notification }
    | { type: 'REMOVE'; id: string }
    | { type: 'CLEAR_ALL' }

const initialState: NotificationState = {
    notifications: [],
}

function notificationReducer(
    state: NotificationState,
    action: NotificationAction
): NotificationState {
    switch (action.type) {
        case 'ADD':
            // Prevent duplicates by ID
            if (state.notifications.some((n) => n.id === action.notification.id)) {
                return state
            }
            return {
                ...state,
                notifications: [...state.notifications, action.notification],
            }
        case 'REMOVE':
            return {
                ...state,
                notifications: state.notifications.filter((n) => n.id !== action.id),
            }
        case 'CLEAR_ALL':
            return { ...state, notifications: [] }
        default:
            return state
    }
}

interface NotificationContextType {
    notifications: Notification[]
    addNotification: (notification: Omit<Notification, 'id'> & { id?: string }) => string
    removeNotification: (id: string) => void
    clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
)

let notificationIdCounter = 0

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [state, dispatch] = useReducer(notificationReducer, initialState)

    const addNotification = useCallback(
        (notification: Omit<Notification, 'id'> & { id?: string }) => {
            const id = notification.id || `notification-${++notificationIdCounter}`
            dispatch({
                type: 'ADD',
                notification: { ...notification, id },
            })
            return id
        },
        []
    )

    const removeNotification = useCallback((id: string) => {
        dispatch({ type: 'REMOVE', id })
    }, [])

    const clearAll = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' })
    }, [])

    return (
        <NotificationContext.Provider
            value={{
                notifications: state.notifications,
                addNotification,
                removeNotification,
                clearAll,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error(
            'useNotifications must be used within a NotificationProvider'
        )
    }
    return context
}
