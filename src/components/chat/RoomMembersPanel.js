import { useState } from "react";
import { FiShield, FiUserCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { Badge, EmptyState, Select } from "../ui";
import { canManageChatMemberRole, getChatMemberInitial } from "../../utils/chat";
import {
    getChatErrorMessage,
    useUpdateChatMemberRole,
} from "../../api/chat.api";

const roleBadgeVariant = (role) => {
    if (role === "Owner") return "primary";
    if (role === "Moderator") return "info";

    return "neutral";
};

/**
 * The member list of a room.
 *
 * Only the owner can assign the Moderator role, and the server additionally
 * requires the target to hold the global Doctor role. The UI hides the action
 * for everybody else; the server remains the authority.
 */
export const RoomMembersPanel = ({ room, members, onRoleChanged }) => {
    const [busyMemberId, setBusyMemberId] = useState(null);
    const { execute } = useUpdateChatMemberRole();

    const handleRoleChange = async (member, nextRole) => {
        if (!room || !member) return;

        setBusyMemberId(member.memberId);

        try {
            const updated = await execute(room.id, member.memberId, nextRole);
            onRoleChanged?.(updated);
        } catch (error) {
            toast.error(getChatErrorMessage(error, "The role could not be changed."));
        } finally {
            setBusyMemberId(null);
        }
    };

    if (!members || members.length === 0) {
        return (
            <EmptyState
                icon={<FiUserCheck aria-hidden="true" />}
                title="No members yet"
                description="Members appear here once someone joins the room."
                className="border-0 shadow-none"
            />
        );
    }

    return (
        <div>
            <h3 className="text-sm font-bold text-neutral-900">Members</h3>
            <p className="mt-0.5 text-xs text-neutral-600">
                {members.length} active {members.length === 1 ? "member" : "members"}
            </p>

            <ul className="mt-3 space-y-2">
                {members.map((member) => {
                    const canManage = canManageChatMemberRole(room, member);

                    return (
                        <li
                            key={member.memberId}
                            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-base-100 p-2.5"
                        >
                            <span
                                aria-hidden="true"
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700"
                            >
                                {getChatMemberInitial(member.displayName)}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-neutral-900">
                                    {member.displayName}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    Joined {new Date(member.joinedAtUtc).toLocaleDateString()}
                                </p>
                            </div>

                            <Badge variant={roleBadgeVariant(member.role)} size="sm">
                                {member.role}
                            </Badge>

                            {canManage && (
                                <span className="w-28 shrink-0">
                                    <Select
                                        aria-label={`Role for ${member.displayName}`}
                                        value={member.role}
                                        disabled={busyMemberId === member.memberId}
                                        onChange={(event) => {
                                            handleRoleChange(member, event.target.value).catch(() => undefined);
                                        }}
                                    >
                                        <option value="Member">Member</option>
                                        <option value="Moderator">Moderator</option>
                                    </Select>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>

            {room?.myRole === "Owner" && (
                <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-neutral-500">
                    <FiShield aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                        Only doctor members can become moderators. The room owner’s role
                        cannot be changed.
                    </span>
                </p>
            )}
        </div>
    );
};
