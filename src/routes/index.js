import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../auth/authProvider";
import { Login } from "../auth/login";
import { Logout } from "../auth/logout";
import { Register } from "../auth/register";
import { ForgotPassword } from "../auth/forgotPassword";
import { ResetPassword } from "../auth/resetPassword";
import { MainLayout } from "../components/layout/MainLayout";
import { Home } from "../pages/Home";
import { Doctors } from "../pages/Doctors";
import { DoctorDetails } from "../pages/DoctorDetails";
import { BookAppointment } from "../pages/BookAppointment";
import { Appointments } from "../pages/Appointments";
import { PatientHistory } from "../pages/PatientHistory";
import { PublicProfile } from "../pages/PublicProfile";
import { Profile } from "../pages/Profile";
import { Notifications } from "../pages/Notifications";
import { CommunityLayout } from "../pages/CommunityLayout";
import { Forums } from "../pages/Forums";
import { ForumsDetails } from "../pages/ForumsDetails";
import { ChatRooms } from "../pages/ChatRooms";
import { ChatRoom } from "../pages/ChatRoom";
import { ProtectedRoute, hasPatientRole } from "./ProtectedRoute";
import { RootScrollLayout } from "../components/routing/ScrollManager";

// Signed-in patients skip the public auth pages.
const PublicOnly = ({ children }) => {
    const { token, roles } = useAuth();
    return token && hasPatientRole(roles) ? <Navigate to="/" replace /> : children;
};

// One router for the lifetime of the app: recreating a data router when auth
// state changes can remount <Navigate> and cause redirect loops.
const router = createBrowserRouter([
    {
        element: <RootScrollLayout />,
        children: [
    { path: "/login", element: <PublicOnly><Login /></PublicOnly> },
    { path: "/register", element: <PublicOnly><Register /></PublicOnly> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    // The password-reset email currently links to /forgetpassword/resetpassword.
    { path: "/forgetpassword/resetpassword", element: <ResetPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/profiles/:id", element: <PublicProfile /> },
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <MainLayout />,
                children: [
                    { index: true, element: <Home /> },
                    { path: "doctors", element: <Doctors /> },
                    { path: "doctors/:doctorId", element: <DoctorDetails /> },
                    { path: "doctors/:doctorId/book", element: <BookAppointment /> },
                    { path: "appointments", element: <Appointments /> },
                    { path: "history", element: <PatientHistory /> },
                    { path: "profile", element: <Profile /> },
                    { path: "notifications", element: <Notifications /> },
                    {
                        path: "community",
                        element: <CommunityLayout />,
                        children: [
                            { index: true, element: <Forums /> },
                            { path: "rooms", element: <ChatRooms /> },
                            { path: "rooms/:id", element: <ChatRoom /> },
                        ],
                    },
                    { path: "forums/:id", element: <ForumsDetails /> },
                    { path: "logout", element: <Logout /> },
                ],
            },
        ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
        ],
    },
]);

const Routes = () => <RouterProvider router={router} />;

export default Routes;
