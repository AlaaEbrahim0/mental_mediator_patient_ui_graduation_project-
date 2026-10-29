import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { Button } from "../ui";
import { useModerationStage } from "../../hooks/useModerationStage";

const CONTENT_MAX_LENGTH = 2000;

/**
 * The message composer.
 *
 * Enter sends, Shift+Enter inserts a newline. The send button is disabled
 * while the message is empty, while a send is in flight, and when the room is
 * archived: an archived room is read-only.
 */
export const ChatComposer = ({
    onSend,
    disabled = false,
    disabledReason = null,
    isSending = false,
    placeholder = "Write a message…",
}) => {
    const [content, setContent] = useState("");
    const textareaRef = useRef(null);
    const stage = useModerationStage(isSending);

    // Clear the draft when the room becomes read-only.
    useEffect(() => {
        if (disabled) setContent("");
    }, [disabled]);

    const trimmed = content.trim();
    const canSend = Boolean(trimmed) && !disabled && !isSending;

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSend) return;

        const value = trimmed;
        setContent("");

        try {
            await onSend?.(value);
        } catch {
            // The caller owns the error feedback; restore the draft so a
            // failed send does not silently discard what the user typed.
            setContent(value);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
        }
    };

    if (disabled) {
        return (
            <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                {disabledReason || "This room is read-only."}
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-neutral-200 bg-base-100 px-4 py-3"
        >
            <div className="flex items-end gap-2">
                <label className="min-w-0 flex-1">
                    <span className="sr-only">Message</span>
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={2}
                        maxLength={CONTENT_MAX_LENGTH}
                        placeholder={placeholder}
                        disabled={isSending}
                        className="w-full resize-none rounded-xl border border-neutral-300 bg-base-100 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:cursor-not-allowed disabled:bg-neutral-50"
                    />
                </label>
                <Button
                    type="submit"
                    disabled={!canSend}
                    loading={isSending}
                    aria-label="Send message"
                >
                    <FiSend aria-hidden="true" />
                    <span className="hidden sm:inline">{isSending ? "Checking…" : "Send"}</span>
                </Button>
            </div>
            {stage && (
                <p role="status" aria-live="polite" className="mt-2 text-sm text-neutral-700">
                    <span className="font-semibold">{stage.label}</span>
                    {stage.detail && <span className="mt-0.5 block text-xs text-neutral-600">{stage.detail}</span>}
                </p>
            )}
            <p className="mt-1.5 text-xs text-neutral-500">
                Messages are visible to everyone in this room. Do not share personal
                health information.
            </p>
        </form>
    );
};
