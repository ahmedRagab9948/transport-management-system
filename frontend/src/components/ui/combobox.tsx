"use client"

import * as React from "react"
import { Check, ChevronDown, Search, Loader2 } from "lucide-react"
import { Command } from "cmdk"
import { Popover } from "@base-ui/react/popover"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import { scaleIn, DURATIONS } from "@/lib/design"

export interface ComboboxOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  loading?: boolean
  renderOption?: (option: ComboboxOption) => React.ReactNode
  error?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled,
  loading,
  renderOption,
  error,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { dir } = useT()

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const s = search.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(s) ||
        opt.description?.toLowerCase().includes(s) ||
        opt.value.toLowerCase().includes(s)
    )
  }, [options, search])

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10 bg-background hover:bg-background/90 text-start overflow-hidden",
              !selectedOption && "text-muted-foreground",
              error && "border-destructive ring-2 ring-destructive/20 focus-visible:ring-destructive/40",
              className
            )}
            disabled={disabled}
            aria-invalid={error}
          />
        }
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {loading ? (
          <Loader2 className="ms-2 size-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronDown
            className={cn(
              "ms-2 size-4 shrink-0 opacity-50 transition-transform duration-200 ease-out",
              open && "rotate-180"
            )}
          />
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          className="isolate z-50 outline-none"
          align={dir === 'rtl' ? "end" : "start"}
          sideOffset={4}
        >
          <AnimatePresence>
            {open && (
              <Popover.Popup
                className="w-(--anchor-width) min-w-32 z-50 overflow-hidden rounded-xl border border-border/60 bg-popover/95 text-popover-foreground shadow-lg backdrop-blur-sm outline-none"
                render={
                  <motion.div
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: DURATIONS.fast }}
                  />
                }
              >
                <Command
                  className="flex h-full w-full flex-col bg-transparent"
                  shouldFilter={false}
                >
                  <div className="flex items-center border-b px-3" dir={dir}>
                    <Search className="me-2 size-4 shrink-0 opacity-50" />
                    <Command.Input
                      ref={inputRef}
                      value={search}
                      onValueChange={setSearch}
                      placeholder={searchPlaceholder}
                      className="flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Command.List className="max-h-[260px] overflow-y-auto overflow-x-hidden p-1">
                    {filteredOptions.length === 0 && (
                      <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                        {emptyText}
                      </Command.Empty>
                    )}
                    <Command.Group>
                      {filteredOptions.map((option, idx) => (
                        <Command.Item
                          key={option.value}
                          value={option.value}
                          onSelect={(currentValue) => {
                            onValueChange(currentValue === value ? "" : currentValue)
                            setOpen(false)
                            setSearch("")
                          }}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 transition-colors hover:bg-accent",
                            value === option.value && "bg-accent text-accent-foreground font-medium"
                          )}
                        >
                          <Check
                            className={cn(
                              "me-2 size-4 shrink-0",
                              value === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {renderOption ? (
                            renderOption(option)
                          ) : (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                {option.icon && <span className="shrink-0">{option.icon}</span>}
                                <span>{option.label}</span>
                              </div>
                              {option.description && (
                                <span className="text-xs text-muted-foreground">
                                  {option.description}
                                </span>
                              )}
                            </div>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </Command.List>
                </Command>
              </Popover.Popup>
            )}
          </AnimatePresence>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
