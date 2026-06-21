import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-[var(--primary-hover)] active:bg-[var(--primary-hover)]",
        secondary: "border border-primary text-primary hover:bg-primary/10 active:bg-primary/15",
        ghost: "hover:bg-muted hover:text-foreground",
        danger: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/90",
        success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700",
        outline: "border border-border bg-background hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        md: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        sm: "h-8 gap-2 px-3 text-sm in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        lg: "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        icon: "size-10",
        "icon-sm": "size-8 in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
