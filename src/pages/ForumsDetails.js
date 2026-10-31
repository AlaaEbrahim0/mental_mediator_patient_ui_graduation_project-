import { useEffect, useRef, useState } from "react";
import { useDeletePost, useGetPostById } from "../api/community.api";
import { PostSkeleton } from "../components/ui/PostSkeleton";
import { Post } from "../components/ui/Post";
import { useAuth } from "../auth/authProvider";
import { getMyChatRooms } from "../api/chat.api";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export const ForumsDetails = () => {
    const { isLoading, error, data: post, setData, execute } = useGetPostById();
    const {
        isLoadingDelete,
        execute: executeDelete,
    } = useDeletePost();
    const navigate = useNavigate();
    const postRef = useRef(null);

    const { id } = useParams();
    const { userId, roles } = useAuth();
    const [groupOptions, setGroupOptions] = useState([]);

    useEffect(() => {
        if (!userId) return undefined;
        let active = true;
        getMyChatRooms()
            .then((rooms) => {
                if (active) setGroupOptions(rooms.map((room) => ({ id: room.id, label: room.name })));
            })
            .catch(() => {
                if (active) setGroupOptions([]);
            });
        return () => {
            active = false;
        };
    }, [userId]);

    useEffect(() => {
        const postId = Number(id);
        if (!isNaN(postId)) {
            execute(postId);
        }
    }, [execute, id]);

    if (!id || isNaN(Number(id))) {
        return (
            <div className="alert alert-error text-white">
                <span>Invalid post ID.</span>
            </div>
        );
    }

    const handleDelete = async (id) => {
        await executeDelete(id);
        navigate("/community", { replace: true });
        toast.success("Post has been deleted successfully");
    };

    return (
        <div
            className="row justify-center mx-auto max-w-3xl mt-4"
            ref={postRef}
        >
            {isLoading && <PostSkeleton />}
            {!isLoading && error && (
                <div className="alert alert-error text-white">
                    <span>This page was deleted.</span>
                </div>
            )}
            {!isLoading && !error && post && (
                <Post
                    key={"post-" + post.id}
                    id={post.id}
                    authorName={post.username}
                    authorId={post.appUserId}
                    title={post.title}
                    content={post.content}
                    date={post.postedOn}
                    image={post.photoUrl}
                    postPhoto={post.postPhotoUrl}
                    media={post.media}
                    postData={post}
                    groups={groupOptions}
                    canPostDoctorsOnly={(roles || []).some((role) => typeof role === "string" && ["doctor", "admin"].includes(role.toLowerCase()))}
                    isOwnPost={post.isOwnPost}
                    commentCount={post.commentsCount}
                    likesCount={post.likesCount}
                    isLikedByCurrentUser={post.isLikedByCurrentUser}
                    data={post}
                    setData={async () => {
                        setData(await execute(post.id));
                    }}
                    currentUserId={userId}
                    handleDelete={handleDelete}
                    postDeletionLoading={isLoadingDelete}
                />
            )}
        </div>
    );
};
