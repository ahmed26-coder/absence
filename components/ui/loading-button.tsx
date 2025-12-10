"use client"

import { Loader2 } from "lucide-react"
import { Button } from "./button"
import React from "react"

interface LoadingButtonProps extends React.ComponentProps<"button"> {
  isLoading?: boolean
  loadingText?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText = "جاري...",
  disabled,
  children,
  ...props
}) => {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
