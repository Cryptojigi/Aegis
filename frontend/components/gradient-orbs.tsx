export function GradientOrbs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-float-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent-cyan/20 blur-[100px]" />
      <div
        className="animate-float-orb absolute right-[-6rem] top-40 h-96 w-96 rounded-full bg-accent-cyan/10 blur-[120px]"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="animate-float-orb absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-[120px]"
        style={{ animationDelay: '8s' }}
      />
    </div>
  )
}
