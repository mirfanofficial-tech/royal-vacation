export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/royal-vacation-logo.svg" alt="Royal Vacation" className={className} />
  );
}
