import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from "lucide-react"

interface RowActionsProps {
  children: React.ReactNode
}

export function RowActions({ children }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 flex items-center gap-0">
          <EllipsisVertical className="h-4 w-4 translate-x-1" />
          <EllipsisVertical className="h-4 w-4 -translate-x-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px] bg-white border shadow-lg">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { DropdownMenuItem, DropdownMenuSeparator }