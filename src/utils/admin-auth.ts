/**
 * Admin authentication and authorization utilities
 */

// Simple password-based admin system
// In production, you should use a more secure authentication system
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
const ADMIN_SESSION_KEY = 'admin_session';

export interface AdminUser {
    isAuthenticated: boolean;
    loginTime?: number;
}

/**
 * Check if current user is authenticated as admin
 */
export function isAdmin(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        const session = localStorage.getItem(ADMIN_SESSION_KEY);
        if (!session) return false;

        const { loginTime } = JSON.parse(session);
        const now = Date.now();

        // Session expires after 24 hours
        const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (now - loginTime > SESSION_DURATION) {
            logoutAdmin();
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Authenticate admin user
 */
export function loginAdmin(password: string): boolean {
    if (typeof window === 'undefined') return false;

    if (password === ADMIN_PASSWORD) {
        try {
            const session = {
                isAuthenticated: true,
                loginTime: Date.now()
            };
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
            return true;
        } catch {
            return false;
        }
    }

    return false;
}

/**
 * Logout admin user
 */
export function logoutAdmin(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
        // Ignore errors
    }
}

/**
 * Get admin session info
 */
export function getAdminSession(): AdminUser {
    if (typeof window === 'undefined') return { isAuthenticated: false };

    try {
        const session = localStorage.getItem(ADMIN_SESSION_KEY);
        if (!session) return { isAuthenticated: false };

        const { loginTime } = JSON.parse(session);
        const now = Date.now();

        // Session expires after 24 hours
        const SESSION_DURATION = 24 * 60 * 60 * 1000;

        if (now - loginTime > SESSION_DURATION) {
            logoutAdmin();
            return { isAuthenticated: false };
        }

        return {
            isAuthenticated: true,
            loginTime
        };
    } catch {
        return { isAuthenticated: false };
    }
}

/**
 * Middleware to protect admin-only components
 */
export function requireAdmin(): boolean {
    return isAdmin();
}