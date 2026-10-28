import { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";
import { PAGE_SIZE, getDoctors } from "../api/doctors.api";
import { getApiErrorMessage } from "../api/client";
import { DoctorCard } from "../components/booking/shared";
import { Button, Card, EmptyState, ErrorState, Input, Select, Skeleton } from "../components/ui";
import { SPECIALIZATIONS, formatSpecialization } from "../utils/format";

const EMPTY_FILTERS = { name: "", specialization: "", gender: "", city: "", maxFees: "" };
const SEARCH_DEBOUNCE_MS = 400;

const DoctorCardSkeleton = () => (
    <Card>
        <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
        <Skeleton className="mt-5 h-12 w-full" />
        <Skeleton className="mt-5 h-9 w-full" />
    </Card>
);

export const Doctors = () => {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [doctors, setDoctors] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const requestId = useRef(0);

    // Debounce typing; selects apply as soon as they change because the
    // debounce is short enough not to be noticeable.
    useEffect(() => {
        const timer = window.setTimeout(() => setAppliedFilters(filters), SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [filters]);

    const load = useCallback(async (nextFilters, pageNumber) => {
        const id = ++requestId.current;
        const first = pageNumber === 1;
        first ? setIsLoading(true) : setIsLoadingMore(true);
        setError("");
        try {
            const result = await getDoctors(nextFilters, pageNumber, PAGE_SIZE);
            if (id !== requestId.current) return; // a newer request superseded this one
            setDoctors((previous) => (first ? result : [...previous, ...result]));
            setPage(pageNumber);
            setHasMore(result.length === PAGE_SIZE);
        } catch (requestError) {
            if (id !== requestId.current) return;
            setError(getApiErrorMessage(requestError, "We could not load doctors."));
        } finally {
            if (id === requestId.current) {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        }
    }, []);

    useEffect(() => {
        load(appliedFilters, 1);
    }, [appliedFilters, load]);

    const update = (field) => (event) => setFilters((previous) => ({ ...previous, [field]: event.target.value }));
    const hasFilters = Object.values(filters).some((value) => value !== "");

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Find a doctor</h1>
                <p className="mt-1 text-sm text-neutral-600 sm:text-base">
                    Browse mental health professionals and book a session that fits your schedule.
                </p>
            </header>

            <Card>
                <form role="search" aria-label="Filter doctors" onSubmit={(event) => { event.preventDefault(); setAppliedFilters(filters); }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Input label="Name" type="search" placeholder="Search by name" value={filters.name} onChange={update("name")} className="lg:col-span-1" />
                    <Select label="Specialization" value={filters.specialization} onChange={update("specialization")}>
                        <option value="">All specializations</option>
                        {SPECIALIZATIONS.map((value) => (
                            <option key={value} value={value}>{formatSpecialization(value)}</option>
                        ))}
                    </Select>
                    <Input label="City" placeholder="Any city" value={filters.city} onChange={update("city")} />
                    <Select label="Gender" value={filters.gender} onChange={update("gender")}>
                        <option value="">Any</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </Select>
                    <Input label="Max fee (EGP)" type="number" min="0" inputMode="numeric" placeholder="No limit" value={filters.maxFees} onChange={update("maxFees")} />
                </form>
                {hasFilters && (
                    <div className="mt-4 flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}>
                            Clear filters
                        </Button>
                    </div>
                )}
            </Card>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading doctors" aria-busy="true">
                    {Array.from({ length: 6 }).map((_, index) => <DoctorCardSkeleton key={index} />)}
                </div>
            ) : error && doctors.length === 0 ? (
                <ErrorState title="Doctors could not be loaded" message={error} onRetry={() => load(appliedFilters, 1)} />
            ) : doctors.length === 0 ? (
                <EmptyState
                    icon={hasFilters ? <FiSearch aria-hidden="true" /> : <FiUsers aria-hidden="true" />}
                    title={hasFilters ? "No doctors match your search" : "No doctors are listed yet"}
                    description={hasFilters ? "Try removing a filter or searching with a different name." : "Please check back soon."}
                    action={hasFilters && <Button variant="outline" onClick={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}>Clear filters</Button>}
                />
            ) : (
                <>
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Doctors">
                        {doctors.map((doctor) => (
                            <li key={doctor.id} className="list-none"><DoctorCard doctor={doctor} /></li>
                        ))}
                    </ul>
                    {error && <p role="alert" className="text-center text-sm text-error">{error}</p>}
                    {hasMore && (
                        <div className="flex justify-center">
                            <Button variant="outline" loading={isLoadingMore} loadingText="Loading…" onClick={() => load(appliedFilters, page + 1)}>
                                Show more doctors
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
