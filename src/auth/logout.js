import { useEffect } from "react";
import { useAuth } from "./authProvider";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        signOut();
        navigate("/login", { replace: true });
    }, [signOut, navigate]);

    return <div>Logging out...</div>;
};
