'use client'

import { useNotifications } from './notification-context'
import { Toast } from './toast'

export function ToastContainer() {
    const { notifications } = useNotifications()

    if (notifications.length === 0) {
        return null
    }

    return (
        <div
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
            style={{ maxWidth: '380px' }}
        >
            {notifications.map((notification) => (
                <Toast key={notification.id} notification={notification} />
            ))}
        </div>
    )
}
