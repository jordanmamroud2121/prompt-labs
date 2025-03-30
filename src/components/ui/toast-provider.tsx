"use client"

import * as React from "react"

type ToastActionElement = React.ReactElement<HTMLButtonElement>

export type Toast = {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive" | "success"
}

export type ToasterToast = Toast & {
  open: boolean
}

interface ToastContextValue {
  toasts: ToasterToast[]
  addToast: (toast: Toast) => void
  updateToast: (id: string, toast: Partial<Toast>) => void
  dismissToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  updateToast: () => {},
  dismissToast: () => {},
})

export const useToast = () => {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return {
    ...context,
    toast: (props: Toast) => {
      context.addToast({ ...props, id: props.id || String(Date.now()) })
    },
  }
}

export interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProviderContext({
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const addToast = React.useCallback((toast: Toast) => {
    setToasts((prev) => [
      ...prev,
      { ...toast, id: toast.id || String(Date.now()), open: true },
    ])
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast
      )
    )

    // Remove the toast after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 300)
  }, [])

  const updateToast = React.useCallback(
    (id: string, toast: Partial<Toast>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
      )
    },
    []
  )

  // Dismiss toasts automatically after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      toasts
        .filter((toast) => toast.open)
        .forEach((toast) => {
          dismissToast(toast.id)
        })
    }, 5000)

    return () => clearTimeout(timer)
  }, [toasts, dismissToast])

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, updateToast, dismissToast }}
    >
      {children}
    </ToastContext.Provider>
  )
} 