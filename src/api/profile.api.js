import apiClient from "./client";

/**
 * Profile API.
 *
 * The backend exposes one profile surface for every account type. Doctor
 * practice details live in a nested `doctor` object; social links, languages,
 * certificates, and qualifications are shared with regular users.
 */

const isEmpty = (value) =>
    value === undefined || value === null || String(value).trim() === "";

const cleanText = (value) => {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    return trimmed === "" ? null : trimmed;
};

const cleanList = (values) => {
    if (!Array.isArray(values)) return [];
    return Array.from(
        new Set(
            values
                .map((value) => String(value ?? "").trim())
                .filter(Boolean)
        )
    );
};

/**
 * Normalize a Date or ISO value to the `yyyy-MM-dd` shape DateOnly expects.
 *
 * Date inputs already produce this shape. Building the string from local date
 * parts (instead of toISOString) keeps a date picked at midnight from moving
 * to the previous day in positive time zones.
 */
export const toDateOnly = (value) => {
    if (!value) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
};

const toNullableInteger = (value) => {
    if (isEmpty(value)) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

export const buildProfilePayload = (profile = {}) => {
    const doctor = profile.doctor
        ? {
              location: cleanText(profile.doctor.location),
              professionalTitle: cleanText(profile.doctor.professionalTitle),
              clinicName: cleanText(profile.doctor.clinicName),
              qualifications: cleanText(profile.doctor.qualifications),
              yearsOfExperience: toNullableInteger(
                  profile.doctor.yearsOfExperience
              ),
              sessionFees: Number(profile.doctor.sessionFees) || 0,
              specialization: profile.doctor.specialization,
              isAvailable: Boolean(profile.doctor.isAvailable),
          }
        : null;

    return {
        firstName: profile.firstName?.trim() ?? "",
        lastName: profile.lastName?.trim() ?? "",
        birthDate: toDateOnly(profile.birthDate),
        gender: (profile.gender || "").toLowerCase(),
        biography: cleanText(profile.biography),
        phoneNumber: cleanText(profile.phoneNumber),
        city: cleanText(profile.city),
        contactEmail: cleanText(profile.contactEmail),
        contactPhone: cleanText(profile.contactPhone),
        contactAddress: cleanText(profile.contactAddress),
        headline: cleanText(profile.headline),
        pronouns: cleanText(profile.pronouns),
        coverPhotoUrl: cleanText(profile.coverPhotoUrl),
        websiteUrl: cleanText(profile.websiteUrl),
        linkedInUrl: cleanText(profile.linkedInUrl),
        twitterUrl: cleanText(profile.twitterUrl),
        instagramUrl: cleanText(profile.instagramUrl),
        facebookUrl: cleanText(profile.facebookUrl),
        youTubeUrl: cleanText(profile.youTubeUrl),
        languages: cleanList(profile.languages),
        interests: cleanList(profile.interests),
        isProfilePublic: Boolean(profile.isProfilePublic),
        doctor,
    };
};

export const getMyProfile = async () => {
    const { data } = await apiClient.get("/api/profiles/me");
    return data;
};

export const getPublicProfile = async (profileId, { anonymous = false } = {}) => {
    const { data } = await apiClient.get(
        `/api/profiles/${encodeURIComponent(profileId)}`,
        anonymous ? { skipAuth: true } : undefined
    );
    return data;
};

export const updateMyProfile = async (profile) => {
    const { data } = await apiClient.put(
        "/api/profiles/me",
        buildProfilePayload(profile)
    );
    return data;
};

export const updateMyPhoto = async (photo) => {
    const formData = new FormData();
    formData.append("Photo", photo);
    const { data } = await apiClient.put("/api/profiles/me/photo", formData);
    return data;
};

/** Append only values the API should receive; empty fields stay unset. */
const appendFormValue = (formData, key, value) => {
    if (!isEmpty(value)) formData.append(key, value);
};

export const buildCertificateFormData = (certificate = {}) => {
    const formData = new FormData();
    appendFormValue(formData, "Title", certificate.title?.trim());
    appendFormValue(
        formData,
        "IssuingOrganization",
        certificate.issuingOrganization?.trim()
    );
    appendFormValue(formData, "IssueDate", toDateOnly(certificate.issueDate));
    appendFormValue(formData, "ExpiryDate", toDateOnly(certificate.expiryDate));
    appendFormValue(formData, "CredentialId", cleanText(certificate.credentialId));
    appendFormValue(
        formData,
        "CredentialUrl",
        cleanText(certificate.credentialUrl)
    );
    appendFormValue(formData, "Description", cleanText(certificate.description));
    if (certificate.image instanceof File) {
        formData.append("Image", certificate.image);
    }
    return formData;
};

export const addCertificate = async (certificate) => {
    const { data } = await apiClient.post(
        "/api/profiles/me/certificates",
        buildCertificateFormData(certificate)
    );
    return data;
};

export const updateCertificate = async (certificateId, certificate) => {
    const { data } = await apiClient.put(
        `/api/profiles/me/certificates/${certificateId}`,
        buildCertificateFormData(certificate)
    );
    return data;
};

export const deleteCertificate = async (certificateId) => {
    await apiClient.delete(`/api/profiles/me/certificates/${certificateId}`);
};

export const buildQualificationPayload = (qualification = {}) => ({
    degree: qualification.degree?.trim() ?? "",
    institution: qualification.institution?.trim() ?? "",
    fieldOfStudy: cleanText(qualification.fieldOfStudy),
    startYear: toNullableInteger(qualification.startYear),
    endYear: toNullableInteger(qualification.endYear),
    description: cleanText(qualification.description),
});

export const addQualification = async (qualification) => {
    const { data } = await apiClient.post(
        "/api/profiles/me/qualifications",
        buildQualificationPayload(qualification)
    );
    return data;
};

export const updateQualification = async (qualificationId, qualification) => {
    const { data } = await apiClient.put(
        `/api/profiles/me/qualifications/${qualificationId}`,
        buildQualificationPayload(qualification)
    );
    return data;
};

export const deleteQualification = async (qualificationId) => {
    await apiClient.delete(`/api/profiles/me/qualifications/${qualificationId}`);
};
