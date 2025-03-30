"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple toast component without dependencies, inspired by shadcn/ui
// We'll use CSS for animations since we're not importing multiple UI libraries

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success"
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-0 right-0 z-50 flex max-w-md translate-x-0 transform-gpu flex-col gap-y-4 p-4 opacity-100 transition-all",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:slide-in-from-right-1/2",
          variant === "destructive" && "bg-red-50 text-red-900 border-red-200",
          variant === "success" && "bg-green-50 text-green-900 border-green-200",
          variant === "default" && "bg-white text-gray-900 border-gray-200",
          "rounded-md border shadow-md",
          className
        )}
        {...props}
      />
    )
  }
)
Toast.displayName = "Toast"

interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-0 right-0 z-50 flex max-h-screen flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
          className
        )}
        {...props}
      />
    )
  }
)
ToastViewport.displayName = "ToastViewport"

interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const ToastTitle = React.forwardRef<HTMLHeadingElement, ToastTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn("text-sm font-semibold", className)}
        {...props}
      />
    )
  }
)
ToastTitle.displayName = "ToastTitle"

interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastDescription = React.forwardRef<HTMLDivElement, ToastDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-sm opacity-90", className)}
        {...props}
      />
    )
  }
)
ToastDescription.displayName = "ToastDescription"

interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-70 transition-opacity hover:opacity-100",
          className
        )}
        {...props}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        <span className="sr-only">Close</span>
      </button>
    )
  }
)
ToastClose.displayName = "ToastClose"

interface ToastProviderProps extends React.PropsWithChildren {}

function ToastProvider({ children }: ToastProviderProps) {
  return <>{children}</>
}

export {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
  ToastProvider,
} 