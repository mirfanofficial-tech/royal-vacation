import type { SVGProps } from "react";

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.1 15.95 2 14.66 2 11.98 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12s0-3.2-.4-4.7a2.9 2.9 0 0 0-2-2C17.9 5 12 5 12 5s-5.9 0-7.6.3a2.9 2.9 0 0 0-2 2C2 8.8 2 12 2 12s0 3.2.4 4.7a2.9 2.9 0 0 0 2 2C6.1 19 12 19 12 19s5.9 0 7.6-.3a2.9 2.9 0 0 0 2-2C22 15.2 22 12 22 12Z" />
      <path d="M10 15.2 15.5 12 10 8.8v6.4Z" fill="var(--navy)" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.24 3H21l-6.53 7.46L22 21h-6.24l-4.9-6.41L4.7 21H2l7-8-7.5-10h6.4l4.42 5.86Zm-1.1 16.2h1.5L7.94 4.7H6.33Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2 3.77-2C20.9 8.7 21 12 21 15.1V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9Z" />
    </svg>
  );
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M22.5 12.23c0-.82-.07-1.42-.22-2.05H12v3.72h6c-.12 1-.78 2.5-2.24 3.5l-.02.14 3.25 2.52.23.02c2.07-1.91 3.28-4.72 3.28-7.85Z"
      />
      <path
        fill="#34A853"
        d="M12 22.5c2.97 0 5.46-.98 7.28-2.65l-3.47-2.68c-.93.65-2.18 1.1-3.81 1.1a6.6 6.6 0 0 1-6.24-4.56l-.13.01-3.38 2.61-.04.13A10.5 10.5 0 0 0 12 22.5Z"
      />
      <path
        fill="#FBBC05"
        d="M5.76 13.71a6.5 6.5 0 0 1-.34-2.09c0-.73.13-1.43.33-2.09l-.01-.14-3.42-2.65-.11.05A10.5 10.5 0 0 0 1.5 12c0 1.7.41 3.3 1.13 4.71l3.13-3Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.06c2.07 0 3.46.9 4.26 1.64l3.1-3.03C17.45 1.99 14.97 1 12 1a10.5 10.5 0 0 0-9.38 5.79l3.14 2.44A6.62 6.62 0 0 1 12 5.06Z"
      />
    </svg>
  );
}
