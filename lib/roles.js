export const USER_ROLES = ["citizen", "responder", "moderator", "admin"];

export function isStaff(user) {
    return user?.role === "moderator" || user?.role === "admin";
}

export function isAdmin(user) {
    return user?.role === "admin";
}
