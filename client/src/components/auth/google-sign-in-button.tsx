"use client";

import { useGoogleLogin } from "@react-oauth/google";

import { GoogleIcon } from "@/components/icons/social-icons";
import { ApiError, loginWithGoogle } from "@/lib/api";

const GOOGLE_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

const buttonClassName =
  "flex h-12 items-center justify-center rounded-lg border border-border py-2.5 text-foreground hover:border-navy hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent";

type GoogleSignInButtonProps = {
  onSuccess: (user: Awaited<ReturnType<typeof loginWithGoogle>>) => void;
  onError: (message: string) => void;
};

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  // useGoogleLogin() calls Google's real SDK (initTokenClient) as soon as it
  // mounts, not on click — and that SDK throws synchronously on an empty
  // client_id. So the hook-using component below must never mount at all
  // when unconfigured, rather than just disabling its button.
  if (!GOOGLE_CONFIGURED) {
    return (
      <button
        type="button"
        aria-label="Continue with Google"
        title="Google sign-in isn't configured yet"
        disabled
        className={buttonClassName}
      >
        <GoogleIcon className="h-5 w-5" />
      </button>
    );
  }
  return <ConfiguredGoogleButton {...props} />;
}

function ConfiguredGoogleButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const triggerLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const user = await loginWithGoogle(tokenResponse.access_token);
        onSuccess(user);
      } catch (error) {
        onError(
          error instanceof ApiError
            ? error.message
            : "Couldn't sign in with Google. Please try again."
        );
      }
    },
    onError: () => onError("Google sign-in was cancelled or failed."),
  });

  return (
    <button
      type="button"
      aria-label="Continue with Google"
      onClick={() => triggerLogin()}
      className={buttonClassName}
    >
      <GoogleIcon className="h-5 w-5" />
    </button>
  );
}
