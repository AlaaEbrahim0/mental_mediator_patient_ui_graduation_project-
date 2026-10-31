import AuthProvider from "./auth/authProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { ExternalLoginGate } from "./auth/ExternalLoginGate";
import { UserProfileProvider } from "./context/profileContext";
import { NotificationsProvider } from "./context/notificationsContext";
import Routes from "./routes";

function App() {
    return (
        <ThemeProvider>
        <AuthProvider>
            <ExternalLoginGate>
                <UserProfileProvider>
                    <NotificationsProvider>
                        <Routes />
                    </NotificationsProvider>
                </UserProfileProvider>
            </ExternalLoginGate>
        </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
