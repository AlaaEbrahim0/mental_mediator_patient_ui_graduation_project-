import apiClient from "./client";

export const signIn = async ({ email, password }) => {
    const { data } = await apiClient.post("/api/auth/signin", { email, password });
    return data;
};

/** Public registration. The server assigns the role, "User" is the patient role. */
export const registerPatient = async ({ firstName, lastName, email, password, birthDate, gender }) => {
    const { data } = await apiClient.post("/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
        birthDate,
        gender,
        role: "User",
    });
    return data;
};

export const resendConfirmationEmail = async (email) => {
    const { data } = await apiClient.post("/api/auth/send-email-confirmation-link", null, { params: { email } });
    return data;
};

export const requestPasswordReset = async (email) => {
    const { data } = await apiClient.post("/api/auth/send-reset-password-link", null, { params: { email } });
    return data;
};

export const resetPassword = async ({ email, token, newPassword }) => {
    const { data } = await apiClient.post("/api/auth/reset-password", { email, token, newPassword });
    return data;
};

