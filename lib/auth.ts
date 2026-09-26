import { cookies } from "next/headers";

const COOKIE_NAME = "us_admin_session";

export function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "urban-spice-secret-key-2026";
}

export function setAdminSession() {
  cookies().set(COOKIE_NAME, getSessionSecret(), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminSession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export function isAdminSessionValid(cookieValue: string | undefined) {
  return !!cookieValue && cookieValue === getSessionSecret();
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
