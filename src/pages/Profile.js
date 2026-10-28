import { useEffect, useState } from "react";
import { useUserProfile } from "../context/profileContext";
import { getApiErrorMessages } from "../api/client";
import { Avatar } from "../components/booking/shared";
import { Alert, Button, Card, ErrorState, Input, Select, Skeleton, Textarea } from "../components/ui";
import { fullName, localDateKey } from "../utils/format";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/png", "image/jpeg"];

const toForm = (profile) => ({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    birthDate: profile?.birthDate ? String(profile.birthDate).slice(0, 10) : "",
    gender: (profile?.gender || "").toLowerCase(),
    phoneNumber: profile?.phoneNumber || "",
    city: profile?.city || "",
    biography: profile?.biography || "",
});

export const Profile = () => {
    const { userProfileData, isLoading, error, refresh, updateUserProfile, updateLoading } = useUserProfile();
    const [values, setValues] = useState(toForm(null));
    const [errors, setErrors] = useState({});
    const [serverErrors, setServerErrors] = useState([]);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    useEffect(() => {
        if (userProfileData) setValues(toForm(userProfileData));
    }, [userProfileData]);

    useEffect(() => () => photoPreview && URL.revokeObjectURL(photoPreview), [photoPreview]);

    const change = (field) => (event) => {
        setValues((previous) => ({ ...previous, [field]: event.target.value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
    };

    const choosePhoto = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!PHOTO_TYPES.includes(file.type)) {
            setErrors((previous) => ({ ...previous, photo: "Choose a PNG or JPEG image." }));
        } else if (file.size > MAX_PHOTO_BYTES) {
            setErrors((previous) => ({ ...previous, photo: "The image must be 5 MB or smaller." }));
        } else {
            setErrors((previous) => ({ ...previous, photo: undefined }));
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const next = {};
        if (values.firstName.trim().length < 2) next.firstName = "First name must be at least 2 characters.";
        if (values.lastName.trim().length < 2) next.lastName = "Last name must be at least 2 characters.";
        if (!values.birthDate) next.birthDate = "Enter your date of birth.";
        else if (values.birthDate >= localDateKey(new Date())) next.birthDate = "Date of birth must be in the past.";
        if (!values.gender) next.gender = "Select an option.";
        setErrors(next);
        if (Object.keys(next).length) return;

        setServerErrors([]);
        try {
            await updateUserProfile({ ...values, firstName: values.firstName.trim(), lastName: values.lastName.trim(), photo });
            setPhoto(null);
            setPhotoPreview("");
        } catch (requestError) {
            setServerErrors(getApiErrorMessages(requestError));
        }
    };

    if (isLoading && !userProfileData) {
        return <div className="space-y-4" aria-busy="true"><Skeleton className="h-28 w-full" rounded="rounded-2xl" /><Skeleton className="h-96 w-full" rounded="rounded-2xl" /></div>;
    }
    if (error && !userProfileData) {
        return <ErrorState title="Your profile could not be loaded" message="Please try again." onRetry={refresh} />;
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Your profile</h1>
                <p className="mt-1 text-sm text-neutral-600">Keep your details up to date. Your email is used to sign in and cannot be changed here.</p>
            </header>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <Card>
                    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                        <Avatar src={photoPreview || userProfileData?.photoUrl} name={fullName(userProfileData)} size="h-20 w-20" textSize="text-2xl" />
                        <div>
                            <p className="font-bold text-neutral-900">{fullName(userProfileData)}</p>
                            <p className="text-sm text-neutral-600">{userProfileData?.email}</p>
                            <label className="mt-3 inline-block cursor-pointer rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-800 transition focus-within:ring-2 focus-within:ring-primary-700 hover:bg-neutral-50">
                                Change photo
                                <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={choosePhoto} />
                            </label>
                            {errors.photo && <p role="alert" className="mt-2 text-sm text-error">{errors.photo}</p>}
                        </div>
                    </div>
                </Card>

                <Card className="space-y-4">
                    {serverErrors.length > 0 && (
                        <Alert variant="error" title="Your profile could not be saved">
                            <ul className="list-disc space-y-1 pl-4">{serverErrors.map((message, index) => <li key={index}>{message}</li>)}</ul>
                        </Alert>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="First name" required value={values.firstName} onChange={change("firstName")} error={errors.firstName} />
                        <Input label="Last name" required value={values.lastName} onChange={change("lastName")} error={errors.lastName} />
                        <Input label="Date of birth" type="date" required max={localDateKey(new Date())} value={values.birthDate} onChange={change("birthDate")} error={errors.birthDate} />
                        <Select label="Gender" required value={values.gender} onChange={change("gender")} error={errors.gender}>
                            <option value="">Select…</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </Select>
                        <Input label="Phone number" type="tel" autoComplete="tel" value={values.phoneNumber} onChange={change("phoneNumber")} />
                        <Input label="City" autoComplete="address-level2" value={values.city} onChange={change("city")} />
                    </div>
                    <Textarea label="About you" rows={4} maxLength={1000} value={values.biography} onChange={change("biography")} hint="Optional. Shown on your community posts." />
                    <div className="flex justify-end">
                        <Button type="submit" loading={updateLoading} loadingText="Saving…">Save changes</Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};
