import AuthProvider from "./auth/authProvider";
import { UserProfileProvider } from "./context/profileContext";
import { NotificationsProvider } from "./context/notificationsContext";
import Routes from "./routes";

function App() {
    return (
        <AuthProvider>
            <UserProfileProvider>
                <NotificationsProvider>
                    <Routes />
                </NotificationsProvider>
            </UserProfileProvider>
        </AuthProvider>
    );
}

export default App;
