import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiFilter, FiSearch, FiUsers, FiX } from "react-icons/fi";
import { PAGE_SIZE, getDoctors } from "../api/doctors.api";
import { getApiErrorMessage } from "../api/client";
import { DoctorCard } from "../components/booking/shared";
import { Button, Card, EmptyState, ErrorState, Input, Select, Skeleton } from "../components/ui";
import { SPECIALIZATIONS, formatSpecialization } from "../utils/format";

const EMPTY_FILTERS = {
    name: "",
    specialization: "",
    gender: "",
    city: "",
    minFees: "",
    maxFees: "",
    isAvailable: "",
};
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

// Human-readable chips for every active filter, each carrying the field key so
// a single chip can be removed without clearing the rest.
const describeFilters = (filters) => {
    const chips = [];
    if (filters.name?.trim()) chips.push({ key: "name", label: `Name: ${filters.name.trim()}` });
    if (filters.specialization) chips.push({ key: "specialization", label: formatSpecialization(filters.specialization) });
    if (filters.gender) chips.push({ key: "gender", label: filters.gender === "male" ? "Male" : "Female" });
    if (filters.city?.trim()) chips.push({ key: "city", label: `City: ${filters.city.trim()}` });
    if (filters.minFees !== "" && filters.minFees != null) chips.push({ key: "minFees", label: `Min ${filters.minFees} EGP` });
    if (filters.maxFees !== "" && filters.maxFees != null) chips.push({ key: "maxFees", label: `Max ${filters.maxFees} EGP` });
    if (filters.isAvailable === true || filters.isAvailable === "true") chips.push({ key: "isAvailable", label: "Available now" });
    return chips;
};

export const Doctors = () => {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
    const [doctors, setDoctors] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(undefined);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [areFiltersOpen, setFiltersOpen] = useState(false);
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
            const { items, total: count } = await getDoctors(nextFilters, pageNumber, PAGE_SIZE);
            if (id !== requestId.current) return; // a newer request superseded this one
            setDoctors((previous) => (first ? items : [...previous, ...items]));
            setTotal(count);
            setPage(pageNumber);
            setHasMore(items.length === PAGE_SIZE);
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

    const update = (field) => (event) => {
        const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
        setFilters((previous) => ({ ...previous, [field]: value }));
    };

    const clearAll = () => {
        setFilters(EMPTY_FILTERS);
        setAppliedFilters(EMPTY_FILTERS);
    };

    const removeFilter = (key) => {
        const next = { ...filters, [key]: EMPTY_FILTERS[key] };
        setFilters(next);
        setAppliedFilters(next);
    };

    const activeChips = useMemo(() => describeFilters(appliedFilters), [appliedFilters]);
    const hasFilters = activeChips.length > 0;
    const resultLabel = typeof total === "number"
        ? `${total} doctor${total === 1 ? "" : "s"}`
        : `${doctors.length} doctor${doctors.length === 1 ? "" : "s"}`;

    const filterForm = (
        <form
            role="search"
            aria-label="Filter doctors"
            onSubmit={(event) => { event.preventDefault(); setAppliedFilters(filters); setFiltersOpen(false); }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
            <Input label="Name" type="search" placeholder="Search by name" value={filters.name} onChange={update("name")} />
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
            <Input label="Min fee (EGP)" type="number" min="0" inputMode="numeric" placeholder="No minimum" value={filters.minFees} onChange={update("minFees")} />
            <Input label="Max fee (EGP)" type="number" min="0" inputMode="numeric" placeholder="No limit" value={filters.maxFees} onChange={update("maxFees")} />
            <label className="flex items-center gap-3 self-end rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    name="isAvailable"
                    checked={filters.isAvailable === true}
                    onChange={update("isAvailable")}
                />
                <span className="text-sm font-semibold text-neutral-800">Available now</span>
            </label>
            <div className="col-span-full flex flex-wrap justify-end gap-2">
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAll}>
                        <FiX aria-hidden="true" /> Clear all
                    </Button>
                )}
                <Button type="submit" size="sm" variant="primary" className="lg:hidden">
                    Show results
                </Button>
            </div>
        </form>
    );

    return (
        <div className="space-y-5">
            <header>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Find a doctor</h1>
                <p className="mt-1 text-sm text-neutral-600 sm:text-base">
                    Browse mental health professionals and book a session that fits your schedule.
                </p>
            </header>

            <div className="flex items-center justify-between gap-3 lg:hidden">
                <Button
                    variant="outline"
                    onClick={() => setFiltersOpen((open) => !open)}
                    aria-expanded={areFiltersOpen}
                    aria-controls="doctor-filters"
                >
                    <FiFilter aria-hidden="true" /> Filters
                    {activeChips.length > 0 && (
                        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                            {activeChips.length}
                        </span>
                    )}
                </Button>
                <p className="text-sm font-semibold text-neutral-700">{resultLabel}</p>
            </div>

            <div id="doctor-filters" className={`${areFiltersOpen ? "block" : "hidden"} lg:block`}>
                <Card>{filterForm}</Card>
            </div>

            {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
                    {activeChips.map((chip) => (
                        <button
                            key={chip.key}
                            type="button"
                            onClick={() => removeFilter(chip.key)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary/10 py-1 pl-3 pr-2 text-sm font-semibold text-primary-900 transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                        >
                            {chip.label}
                            <FiX aria-hidden="true" className="text-sm" />
                            <span className="sr-only">Remove {chip.label} filter</span>
                        </button>
                    ))}
                    <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
                </div>
            )}

            <div className="hidden justify-end text-sm font-semibold text-neutral-700 lg:flex">{resultLabel}</div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading doctors" aria-busy="true">
                    {Array.from({ length: 6 }).map((_, index) => <DoctorCardSkeleton key={index} />)}
                </div>
            ) : error && doctors.length === 0 ? (
                <ErrorState title="Doctors could not be loaded" message={error} onRetry={() => load(appliedFilters, 1)} />
            ) : doctors.length === 0 ? (
                <EmptyState
                    icon={hasFilters ? <FiSearch aria-hidden="true" /> : <FiUsers aria-hidden="true" />}
                    title={hasFilters ? "No doctors match your filters" : "No doctors are listed yet"}
                    description={hasFilters ? "Try removing a filter or searching with a different name." : "Please check back soon."}
                    action={hasFilters && <Button variant="outline" onClick={clearAll}>Clear filters</Button>}
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
