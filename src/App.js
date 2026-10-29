import AuthProvider from "./auth/authProvider";
import { ExternalLoginGate } from "./auth/ExternalLoginGate";
import { UserProfileProvider } from "./context/profileContext";
import { NotificationsProvider } from "./context/notificationsContext";
import Routes from "./routes";

function App() {
    return (
        <AuthProvider>
            <ExternalLoginGate>
                <UserProfileProvider>
                    <NotificationsProvider>
                        <Routes />
                    </NotificationsProvider>
                </UserProfileProvider>
            </ExternalLoginGate>
        </AuthProvider>
    );
}

export default App;
