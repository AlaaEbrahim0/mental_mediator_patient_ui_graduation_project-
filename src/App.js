import AuthProvider from "./auth/authProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import { UserProfileProvider } from "./context/profileContext";
import { NotificationsProvider } from "./context/notificationsContext";
import Routes from "./routes";

function App() {
    return (
        <ThemeProvider>
        <AuthProvider>
            <UserProfileProvider>
                <NotificationsProvider>
                    <Routes />
                </NotificationsProvider>
            </UserProfileProvider>
        </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
