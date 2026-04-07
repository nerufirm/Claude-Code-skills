import liff from "@line/liff";

let initialized = false;

const isServer = typeof window === "undefined";

export async function initLiff(): Promise<void> {
  if (isServer || initialized) return;

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) {
    console.warn("NEXT_PUBLIC_LIFF_ID is not set");
    return;
  }

  try {
    await liff.init({ liffId });
    initialized = true;
  } catch (error) {
    console.error("LIFF initialization failed:", error);
    throw error;
  }
}

export async function liffLogin(): Promise<void> {
  if (isServer) return;

  if (!initialized) {
    await initLiff();
  }

  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: window.location.href });
  }
}

export async function liffLogout(): Promise<void> {
  if (isServer) return;

  if (liff.isLoggedIn()) {
    liff.logout();
  }
}

export async function getLiffProfile(): Promise<{
  userId: string;
  displayName: string;
  pictureUrl: string | undefined;
} | null> {
  if (isServer) return null;

  if (!initialized) {
    await initLiff();
  }

  if (!liff.isLoggedIn()) {
    return null;
  }

  try {
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
    };
  } catch (error) {
    console.error("Failed to get LIFF profile:", error);
    return null;
  }
}

export function isLiffLoggedIn(): boolean {
  if (isServer) return false;
  if (!initialized) return false;
  return liff.isLoggedIn();
}

export function getLiffAccessToken(): string | null {
  if (isServer) return null;
  if (!initialized) return null;
  return liff.getAccessToken();
}
