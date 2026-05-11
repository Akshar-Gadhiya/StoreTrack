import * as React from "react"

import { cn } from "src/lib/utils"

type SelectContextValue = {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

const Select = ({
  value,
  onValueChange,
  disabled,
  children,
  className,
}: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn("relative inline-flex w-full", className)}>
      <SelectContext.Provider value={{ value, onValueChange, open, setOpen, disabled }}>
        {children}
      </SelectContext.Provider>
    </div>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)

  if (!context) {
    return null
  }

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "inline-flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => {
        if (context.disabled) return
        context.setOpen(!context.open)
      }}
      data-state={context.open ? "open" : "closed"}
      {...props}
    >
      {children}
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)

  if (!context) {
    return null
  }

  return (
    <span ref={ref} className={cn("block truncate text-left text-sm", className)} {...props}>
      {children ?? (context.value ? context.value : placeholder)}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(SelectContext)

  if (!context || !context.open) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext)

  if (!context) {
    return null
  }

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/80",
        className
      )}
      onClick={() => {
        context.onValueChange?.(value)
        context.setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
