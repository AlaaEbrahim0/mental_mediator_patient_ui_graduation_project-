import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../api/client";
import { getMyProfile, updateMyPhoto, updateMyProfile } from "../api/profile.api";
import { useAuth } from "../auth/authProvider";

const UserProfileContext = createContext(null);

/** Loads the signed-in patient's profile once per session and shares it. */
export const UserProfileProvider = ({ children }) => {
    const { token } = useAuth();
    const [userProfileData, setUserProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(Boolean(token));
    const [error, setError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!token) {
            setUserProfileData(null);
            setError(null);
            setIsLoading(false);
            return null;
        }
        setIsLoading(true);
        setError(null);
        try {
            const profile = await getMyProfile();
            setUserProfileData(profile);
            return profile;
        } catch (requestError) {
            setError(requestError);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateUserProfile = useCallback(async (updates) => {
        setUpdateLoading(true);
        try {
            const { photo, ...fields } = updates;
            // The rich profile endpoint replaces every submitted field, so
            // merge the form changes onto the loaded profile to preserve
            // social links, visibility and doctor details this form omits.
            let updated = await updateMyProfile({
                ...(userProfileData || {}),
                ...fields,
            });
            if (photo) {
                updated = await updateMyPhoto(photo);
            }
            setUserProfileData(updated);
            toast.success("Profile updated");
            return updated;
        } catch (requestError) {
            toast.error(getApiErrorMessage(requestError, "Could not update your profile."));
            throw requestError;
        } finally {
            setUpdateLoading(false);
        }
    }, [userProfileData]);

    const value = useMemo(
        () => ({ userProfileData, isLoading, error, refresh, updateUserProfile, updateLoading }),
        [userProfileData, isLoading, error, refresh, updateUserProfile, updateLoading]
    );

    return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

export const useUserProfile = () => useContext(UserProfileContext);
