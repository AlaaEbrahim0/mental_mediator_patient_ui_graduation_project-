import { FiClock, FiFlag, FiTrash2 } from "react-icons/fi";
import { Badge } from "../ui";
import { formatChatTimestamp } from "../../utils/chat";
import { canDeleteChatMessage, canReportChatMessage, isOwnChatMessage } from "../../utils/chat";

/**
 * One message row.
 *
 * Content is rendered as plain text. The API validates length and moderates
 * the text but it does not sanitize HTML, so a script payload has to reach the
 * DOM as literal text and never as markup.
 */
export const ChatMessageItem = ({
    message,
    room,
    onDelete,
    onReport,
    isBusy = false,
}) => {
    const isOwn = isOwnChatMessage(message, room);
    const canDelete = canDeleteChatMessage(message, room);
    const canReport = canReportChatMessage(message, room);

    const isPending = Boolean(message.pending);
    const hasFailed = Boolean(message.failed);

    return (
        <article
            className={`flex gap-3 px-4 py-3 ${isOwn ? "bg-primary-50/40" : ""}`}
            aria-label={`Message from ${message.senderDisplayName}`}
        >
            <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-700"
            >
                {(message.senderDisplayName || "?").trim().charAt(0).toUpperCase() || "?"}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-neutral-900">
                        {isOwn ? "You" : message.senderDisplayName}
                    </span>
                    {message.senderIsDoctor && (
                        <Badge variant="primary" size="sm">
                            Doctor
                        </Badge>
                    )}
                    <time
                        dateTime={message.sentAtUtc}
                        className="text-xs text-neutral-500"
                    >
                        {formatChatTimestamp(message.sentAtUtc)}
                    </time>
                    {isPending && (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                            <FiClock aria-hidden="true" />
                            Sending…
                        </span>
                    )}
                    {hasFailed && (
                        <span className="text-xs font-medium text-error">
                            Not sent
                        </span>
                    )}
                </div>

                {message.isDeleted ? (
                    <p className="mt-1 text-sm italic text-neutral-500">
                        This message was removed.
                    </p>
                ) : (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-neutral-800">
                        {message.content}
                    </p>
                )}

                {(canDelete || canReport) && (
                    <div className="mt-1.5 flex items-center gap-1">
                        {canDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete?.(message)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 disabled:opacity-50"
                            >
                                <FiTrash2 aria-hidden="true" />
                                {isOwn ? "Delete" : "Remove"}
                            </button>
                        )}
                        {canReport && (
                            <button
                                type="button"
                                onClick={() => onReport?.(message)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-warning-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 disabled:opacity-50"
                            >
                                <FiFlag aria-hidden="true" />
                                Report
                            </button>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
};
