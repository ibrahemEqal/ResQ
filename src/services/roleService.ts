import { auth, db } from "@/config/firebaseConfig";
import { getUserLocally } from "@/services/authService";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const DASHBOARD_ROLES = new Set(["admin"]);
const ADMIN_EMAILS = new Set(["ibrahem@uni.com"]);

function normalizeRole(role: string | null | undefined) {
  return typeof role === "string" && role.trim() === "admin"
    ? "admin"
    : "student";
}

export function isAdminEmail(email: string | null | undefined) {
  return (
    typeof email === "string" && ADMIN_EMAILS.has(email.trim().toLowerCase())
  );
}

export function isAdminRole(
  role: string | null | undefined,
  email?: string | null,
) {
  return normalizeRole(role) === "admin" || isAdminEmail(email);
}

export function canAccessDashboard(
  role: string | null | undefined,
  email?: string | null,
) {
  const normalizedRole = normalizeRole(role);
  return isAdminEmail(email) || DASHBOARD_ROLES.has(normalizedRole);
}

export async function getRoleForUser(user: User): Promise<string | null> {
  if (isAdminEmail(user.email)) return "admin";

  const local = await getUserLocally();
  const localRole =
    local?.uid === user.uid && typeof local.role === "string"
      ? local.role.trim()
      : null;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const rawRole = userDoc.data().role;
      return normalizeRole(typeof rawRole === "string" ? rawRole : localRole);
    }
  } catch {
    return normalizeRole(localRole);
  }

  return normalizeRole(localRole);
}

export async function getCurrentUserRole(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return getRoleForUser(user);
}

export async function currentUserIsAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  if (isAdminEmail(user.email)) return true;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) return false;

    const rawRole = userDoc.data().role;
    return normalizeRole(typeof rawRole === "string" ? rawRole : null) === "admin";
  } catch {
    return false;
  }
}
