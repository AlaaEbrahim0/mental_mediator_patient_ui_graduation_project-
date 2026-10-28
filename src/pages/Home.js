import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiMessageCircle } from "react-icons/fi";
import { getUpcomingAppointments } from "../api/appointments.api";
import { getPosts } from "../api/community.api";
import { getDoctors } from "../api/doctors.api";
import { Avatar, DoctorCard, StatusBadge } from "../components/booking/shared";
import { Button, Card, EmptyState, Skeleton } from "../components/ui";
import { useUserProfile } from "../context/profileContext";
import { convertUtcToRelativeTime } from "../utils/utcToRelativeTime";
import { formatDateTime, formatDuration } from "../utils/format";

// Each block loads independently so one failing endpoint never blanks the dashboard.
const useLoad = (loader) => {
    const [state, setState] = useState({ data: null, loading: true, error: false });
    useEffect(() => {
        let cancelled = false;
        loader()
            .then((data) => !cancelled && setState({ data, loading: false, error: false }))
            .catch(() => !cancelled && setState({ data: null, loading: false, error: true }));
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return state;
};

const Section = ({ title, action, children }) => (
    <section>
        <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
            {action}
        </div>
        {children}
    </section>
);

const SeeAll = ({ to, children }) => (
    <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-800 hover:underline">
        {children} <FiArrowRight aria-hidden="true" />
    </Link>
);

export const Home = () => {
    const { userProfileData } = useUserProfile();
    const upcoming = useLoad(() => getUpcomingAppointments());
    const posts = useLoad(() => getPosts(1, 3));
    const doctors = useLoad(() => getDoctors({}, 1, 3));

    // Declined and cancelled requests are not something to prepare for.
    const active = (upcoming.data || []).filter((a) => ["Pending", "Confirmed"].includes(a.status));
    const next = active[0];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    Hello{userProfileData?.firstName ? `, ${userProfileData.firstName}` : ""}
                </h1>
                <p className="mt-1 text-sm text-neutral-600 sm:text-base">Here is what is coming up for you.</p>
            </header>

            <Section title="Your next appointment" action={<SeeAll to="/appointments">All appointments</SeeAll>}>
                {upcoming.loading ? (
                    <Skeleton className="h-32 w-full" rounded="rounded-2xl" />
                ) : upcoming.error ? (
                    <Card><p className="text-sm text-neutral-600">We could not load your appointments right now.</p></Card>
                ) : next ? (
                    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar src={next.doctorPhotoUrl} name={next.doctorName} size="h-16 w-16" />
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-bold text-neutral-900">Dr. {next.doctorName}</p>
                                    <StatusBadge status={next.status} size="sm" />
                                </div>
                                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-neutral-800"><FiCalendar aria-hidden="true" className="text-primary-700" /> {formatDateTime(next.startTime)}</p>
                                <p className="mt-0.5 text-sm text-neutral-600">{formatDuration(next.duration)}{next.location ? ` · ${next.location}` : ""}</p>
                            </div>
                        </div>
                        <Button as={Link} to="/appointments" variant="outline">Manage</Button>
                    </Card>
                ) : (
                    <EmptyState
                        icon={<FiCalendar aria-hidden="true" />}
                        title="You have no upcoming appointments"
                        description="Find a professional who fits you and book your first session in a few taps."
                        action={<Button as={Link} to="/doctors">Find a doctor</Button>}
                    />
                )}
                {active.length > 1 && (
                    <p className="mt-3 text-sm text-neutral-600">You have {active.length - 1} more upcoming {active.length - 1 === 1 ? "appointment" : "appointments"}.</p>
                )}
            </Section>

            <Section title="Find support" action={<SeeAll to="/doctors">Browse doctors</SeeAll>}>
                {doctors.loading ? (
                    <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-56" rounded="rounded-2xl" />)}</div>
                ) : doctors.data?.length ? (
                    <ul className="grid gap-4 md:grid-cols-3">
                        {doctors.data.map((doctor) => <li key={doctor.id} className="list-none"><DoctorCard doctor={doctor} /></li>)}
                    </ul>
                ) : (
                    <Card><p className="text-sm text-neutral-600">Doctors will appear here once they are available.</p></Card>
                )}
            </Section>

            <Section title="From the community" action={<SeeAll to="/community">Open community</SeeAll>}>
                {posts.loading ? (
                    <Skeleton className="h-28 w-full" rounded="rounded-2xl" />
                ) : posts.data?.length ? (
                    <ul className="space-y-3">
                        {posts.data.map((post) => (
                            <li key={post.id} className="list-none">
                                <Card hover as={Link} to={`/forums/${post.id}`} className="block">
                                    <p className="font-semibold text-neutral-900">{post.title}</p>
                                    <p className="mt-1 flex items-center gap-3 text-xs text-neutral-600">
                                        <span>{post.username || "Member"}</span>
                                        <span>{convertUtcToRelativeTime(post.postedOn)}</span>
                                        <span className="inline-flex items-center gap-1"><FiMessageCircle aria-hidden="true" /> {post.commentsCount ?? 0}</span>
                                    </p>
                                </Card>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Card><p className="text-sm text-neutral-600">{posts.error ? "The community is unavailable right now." : "No posts yet. Be the first to share something."}</p></Card>
                )}
            </Section>
        </div>
    );
};
