import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { getRoles, getToken } from "../auth/session";

export const PATIENT_ROLE = "user";

export const hasPatientRole = (roles = []) =>
    roles.some((role) => typeof role === "string" && role.toLowerCase() === PATIENT_ROLE);

/**
 * Guards the signed-in area. The server still authorises every request;
 * this only decides which screen to show.
 */
export const ProtectedRoute = () => {
    const { token, roles } = useAuth();
    const location = useLocation();

    // Fall back to the persisted session so a navigation right after sign-in
    // is not rejected while React state is still settling.
    const activeToken = token || getToken();
    const activeRoles = roles?.length > 0 ? roles : getRoles();

    if (!activeToken || !hasPatientRole(activeRoles)) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return <Outlet />;
};
