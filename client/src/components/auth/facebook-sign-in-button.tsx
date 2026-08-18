"use client";

import { useState } from "react";

import { FacebookIcon } from "@/components/icons/social-icons";
import { ApiError, loginWithFacebook } from "@/lib/api";

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const FACEBOOK_CONFIGURED = Boolean(FACEBOOK_APP_ID);
const SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";

type FacebookLoginResponse = {
  status: "connected" | "not_authorized" | "unknown";
  authResponse: { accessToken: string } | null;
};

declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string;
        version: string;
        xfbml: boolean;
        cookie: boolean;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

let sdkLoadPromise: Promise<void> | null = null;

function loadFacebookSdk(): Promise<void> {
  sdkLoadPromise ??= new Promise((resolve) => {
    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: FACEBOOK_APP_ID ?? "",
        version: "v21.0",
        xfbml: false,
        cookie: true,
      });
      resolve();
    };
    if (document.getElementById("facebook-jssdk")) return;
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = SDK_SRC;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

export function FacebookSignInButton({
  onSuccess,
  onError,
}: {
  onSuccess: (user: Awaited<ReturnType<typeof loginWithFacebook>>) => void;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!FACEBOOK_CONFIGURED || loading) return;
    setLoading(true);
    try {
      await loadFacebookSdk();
    } catch {
      setLoading(false);
      onError("Couldn't load Facebook sign-in. Please try again.");
      return;
    }

    if (!window.FB) {
      setLoading(false);
      onError("Couldn't load Facebook sign-in. Please try again.");
      return;
    }

    window.FB.login(async (response) => {
      try {
        if (response.status !== "connected" || !response.authResponse) {
          onError("Facebook sign-in was cancelled or failed.");
          return;
        }
        const user = await loginWithFacebook(response.authResponse.accessToken);
        onSuccess(user);
      } catch (error) {
        onError(
          error instanceof ApiError
            ? error.message
            : "Couldn't sign in with Facebook. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }, { scope: "email" });
  }

  return (
    <button
      type="button"
      aria-label="Continue with Facebook"
      title={FACEBOOK_CONFIGURED ? undefined : "Facebook sign-in isn't configured yet"}
      disabled={!FACEBOOK_CONFIGURED || loading}
      onClick={handleClick}
      className="flex h-12 items-center justify-center rounded-lg border border-border py-2.5 text-foreground hover:border-navy hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-transparent"
    >
      <FacebookIcon className="h-5 w-5" />
    </button>
  );
}
