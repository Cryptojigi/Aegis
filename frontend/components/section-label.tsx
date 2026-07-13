export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-10 bg-accent-cyan/70" />
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
        {children}
      </span>
    </div>
  )
}
