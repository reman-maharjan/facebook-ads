import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  title: string
  description?: string
  showBack?: boolean
}

export function Header({ title, description, showBack = true }: HeaderProps) {
  return (
    <div className="border-b border-border bg-card">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          {showBack && (
            <Link href="/facebookads">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          )}
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        {description && <p className="text-muted-foreground text-sm ml-12">{description}</p>}
      </div>
    </div>
  )
}
