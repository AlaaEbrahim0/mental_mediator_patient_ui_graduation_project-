import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiUserX } from "react-icons/fi";
import { getPublicProfile } from "../api/profile.api";
import { ProfileView } from "../components/profile/ProfileView";
import { getDisplayName } from "../components/profile/profileUtils";
import { useAuth } from "../auth/authProvider";
import { Button, ErrorState, Skeleton } from "../components/ui";

export const PublicProfile = () => {
    const { id } = useParams();
    const { token, userId } = useAuth();
    const [state, setState] = useState({ status: "loading", profile: null, error: null });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        setState({ status: "loading", profile: null, error: null });
        if (!id) {
            setState({ status: "not-found", profile: null, error: null });
            return undefined;
        }

        getPublicProfile(id, { anonymous: !token })
            .then((profile) => {
                if (active) setState({ status: "ready", profile, error: null });
            })
            .catch((error) => {
                if (!active) return;
                if (error.response?.status === 404) {
                    setState({ status: "not-found", profile: null, error: null });
                } else {
                    setState({ status: "error", profile: null, error });
                }
            });

        return () => {
            active = false;
        };
    }, [id, reloadKey, token]);

    useEffect(() => {
        document.title = state.profile
            ? `${getDisplayName(state.profile)} | Nexus`
            : "Profile | Nexus";
        return () => {
            document.title = "Nexus";
        };
    }, [state.profile]);

    const isOwner = Boolean(userId && state.profile?.id === userId);
    const isDoctor = state.profile?.role === "Doctor";
    const primaryAction = !isOwner && isDoctor ? (
        <Button as={Link} to={`/doctors/${encodeURIComponent(id)}`} size="sm">
            <FiCalendar aria-hidden="true" /> View booking profile
        </Button>
    ) : null;

    return (
        <div className="mx-auto w-full max-w-6xl space-y-5">
            <Button as={Link} to="/community" variant="outline" size="sm">
                <FiArrowLeft aria-hidden="true" /> Back to community
            </Button>

            {state.status === "loading" && (
                <div className="space-y-4" aria-label="Loading profile" aria-busy="true">
                    <Skeleton className="h-48 w-full" rounded="rounded-3xl" />
                    <Skeleton className="h-64 w-full" rounded="rounded-3xl" />
                </div>
            )}

            {state.status === "not-found" && (
                <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-base-100 px-6 py-14 text-center shadow-sm">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-neutral-100 text-neutral-500">
                        <FiUserX aria-hidden="true" className="text-2xl" />
                    </span>
                    <h1 className="mt-4 text-2xl font-bold text-neutral-900">Profile not available</h1>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                        This profile does not exist or its owner has chosen to keep it private.
                    </p>
                </div>
            )}

            {state.status === "error" && (
                <ErrorState
                    title="Profile could not be loaded"
                    message="Please try again."
                    onRetry={() => setReloadKey((value) => value + 1)}
                />
            )}

            {state.status === "ready" && state.profile && (
                <ProfileView
                    profile={state.profile}
                    isOwner={isOwner}
                    onEdit={isOwner ? undefined : undefined}
                    primaryAction={primaryAction}
                    showPublicViewLink={false}
                />
            )}
        </div>
    );
};
