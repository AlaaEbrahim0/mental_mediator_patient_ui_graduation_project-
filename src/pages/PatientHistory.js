import { useCallback, useEffect, useState } from "react";
import { getMyHistory } from "../api/history.api";
import { getApiErrorMessage } from "../api/client";
import { PatientHistoryTimeline } from "../components/history/PatientHistoryTimeline";
import { Alert, Button } from "../components/ui";

export const PatientHistory = () => {
    const [history, setHistory] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [category, setCategory] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (page = 1, activeCategory = category, from = dateFrom, to = dateTo) => {
        setIsLoading(true);
        setError("");
        try {
            const result = await getMyHistory(page, 20, { category: activeCategory, from, to });
            setHistory(result);
            setPageNumber(page);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "We could not load your history."));
        } finally {
            setIsLoading(false);
        }
    }, [category, dateFrom, dateTo]);

    useEffect(() => {
        load(1);
        // Re-runs only when the filters themselves change; page turns go
        // through the explicit load(page) calls from the timeline.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, dateFrom, dateTo]);

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">Your health history</h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Appointments and records your care team has shared with you, newest first.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => load(pageNumber)} loading={isLoading} loadingText="Refreshing…">
                    Refresh
                </Button>
            </header>

            {error && (
                <Alert variant="error" title="History could not be loaded" action={<Button size="sm" variant="ghost" onClick={() => load(pageNumber)}>Try again</Button>}>
                    {error}
                </Alert>
            )}

            <PatientHistoryTimeline
                history={history}
                isLoading={isLoading}
                error={error ? new Error(error) : null}
                onRetry={() => load(pageNumber)}
                onPageChange={load}
                category={category}
                onCategoryChange={setCategory}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateChange={({ from, to }) => {
                    setDateFrom(from);
                    setDateTo(to);
                }}
            />
        </div>
    );
};
