'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Search, LayoutDashboard, Home, BarChart3 } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const commands = [
    {
      category: 'Navigation',
      items: [
        {
          icon: Home,
          label: 'Home',
          action: () => {
            router.push('/')
            setOpen(false)
          },
        },
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          action: () => {
            router.push('/dashboard')
            setOpen(false)
          },
        },
      ],
    },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-40 justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline-flex">CMD+K</span>
        <span className="inline-flex sm:hidden">Search</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {commands.map((group, i) => (
            <React.Fragment key={i}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup heading={group.category}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.label}
                    onSelect={item.action}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
