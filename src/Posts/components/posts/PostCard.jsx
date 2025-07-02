import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { reactToPost, removeReaction } from "../../services/api";
import ReactionPicker from "./ReactionPicker";
import CommentSection from "./CommentSection";

const reactionIcons = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠",
  support: "💪",
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 150,
    },
  },
  hover: {
    y: -2,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
  },
};

const PostCard = memo(
  ({ post, onEditClick, onDeleteClick, onOpenReactionsModal }) => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.itian.user);

    const [showComments, setShowComments] = useState(false);
    const [reactions, setReactions] = useState(post.reactions || {});
    const [userReaction, setUserReaction] = useState(post.user_reaction);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const MAX_CONTENT_LENGTH = 250;
    const isLongContent =
      post.content && post.content.length > MAX_CONTENT_LENGTH;
    const displayedContent =
      !isLongContent || showFullContent
        ? post.content
        : post.content.slice(0, MAX_CONTENT_LENGTH) + "...";

    const isMyPost = user?.user_id === post.itian?.user_id;
    const totalReactions = Object.values(reactions).reduce(
      (sum, count) => sum + count,
      0
    );

    // تعديل: فتح بروفايل اليوزر الحالي أو العام حسب اليوزر
    const handleProfileClick = useCallback(() => {
      if (user?.user_id === post.itian?.user_id) {
        navigate("/itian-profile");
      } else {
        navigate(`/itian-profile/${post.itian.user_id}`);
      }
    }, [navigate, post.itian?.user_id, user?.user_id]);

    const handleReaction = useCallback(
      async (reactionType) => {
        try {
          if (userReaction === reactionType) {
            await removeReaction(post.id);
            setUserReaction(null);
            setReactions((prev) => ({
              ...prev,
              [reactionType]: prev[reactionType] - 1,
            }));
          } else {
            if (userReaction) {
              await removeReaction(post.id);
              setReactions((prev) => ({
                ...prev,
                [userReaction]: prev[userReaction] - 1,
              }));
            }

            await reactToPost(post.id, reactionType);
            setUserReaction(reactionType);
            setReactions((prev) => ({
              ...prev,
              [reactionType]: (prev[reactionType] || 0) + 1,
            }));
          }
        } catch (error) {
          console.error("Error reacting to post:", error);
          toast.error("Failed to react to post");
        }
      },
      [post.id, userReaction]
    );

    const handleEdit = useCallback(() => {
      onEditClick(post);
      setShowOptions(false);
    }, [onEditClick, post]);

    const UserAvatar = () => (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer"
        onClick={handleProfileClick}
      >
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center overflow-hidden ring-2 ring-white group-hover:ring-red-300 transition-all duration-300">
          {post.itian.profile_picture ? (
            <motion.img
              src={`http://localhost:8000/storage/${post.itian.profile_picture}`}
              alt="Profile"
              className="h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <span className="text-red-600 font-semibold text-xl">
              {post.itian.first_name?.charAt(0)}
            </span>
          )}
        </div>
        {userReaction && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm"
          >
            <span className="text-sm">{reactionIcons[userReaction]}</span>
          </motion.div>
        )}
      </motion.div>
    );

    const PostOptions = () => (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowOptions(!showOptions)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Post options"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        </motion.button>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200 overflow-hidden"
            >
              <div className="py-1">
                <motion.button
                  whileHover={{ x: 3 }}
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Post
                </motion.button>
                <motion.button
                  whileHover={{ x: 3 }}
                  onClick={() => {
                    setShowOptions(false);
                    onDeleteClick(post.id);
                  }}
                  className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete Post
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden relative group border border-gray-100"
      >
        {/* Sidebar indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-200 to-red-400"></div>

        {/* Post header */}
        <div className="pl-5 pr-5 pb-0 pt-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <UserAvatar />

              <motion.div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={handleProfileClick}
                whileHover={{ x: 3 }}
              >
                <motion.h3
                  className="font-semibold text-gray-900 truncate hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  {post.itian.first_name} {post.itian.last_name}
                </motion.h3>
                <motion.p
                  className="text-xs text-gray-500"
                  whileHover={{ x: 3 }}
                >
                  {new Date(post.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </motion.p>
              </motion.div>
            </div>

            {isMyPost && <PostOptions />}
          </div>
        </div>

        {/* Post content */}
        <div className="p-5 pt-3">
          <motion.h2
            className="text-xl font-bold text-gray-800 mb-3"
            whileHover={{ x: 2 }}
          >
            {post.title}
          </motion.h2>
          <motion.p
            className="text-gray-700 whitespace-pre-line leading-relaxed"
            whileHover={{ x: 2 }}
          >
            {displayedContent}
            {isLongContent && (
              <button
                className="ml-2 text-red-500 font-semibold hover:underline text-sm focus:outline-none"
                onClick={() => setShowFullContent((prev) => !prev)}
                type="button"
              >
                {showFullContent ? "Show less" : "Load more"}
              </button>
            )}
          </motion.p>

          {/* Post image */}
          {post.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-4 rounded-xl overflow-hidden border border-gray-100"
            >
              <motion.img
                src={`http://localhost:8000/storage/${post.image}`}
                alt="Post"
                className="w-full h-auto object-cover max-h-96 cursor-pointer"
                loading="lazy"
                whileHover={{ scale: 1.01 }}
              />
            </motion.div>
          )}
        </div>

        {/* Reactions and comments count */}
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex space-x-2">
              {Object.entries(reactions)
                .filter(([, count]) => count > 0)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([type, count]) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOpenReactionsModal(post.id)}
                    className="flex items-center px-3 py-1 bg-gray-50 rounded-full font-medium border border-gray-100 shadow-sm"
                  >
                    <span className="mr-1 text-xs">{reactionIcons[type]}</span>
                    <span>{count}</span>
                  </motion.button>
                ))}
            </div>

            <div className="flex space-x-4">
              {post.comments_count > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComments(!showComments)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  {post.comments_count}{" "}
                  {post.comments_count === 1 ? "comment" : "comments"}
                </motion.button>
              )}
              {totalReactions > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onOpenReactionsModal(post.id)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  {totalReactions}{" "}
                  {totalReactions === 1 ? "reaction" : "reactions"}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-gray-100 px-5 py-2">
          <div className="flex justify-around">
            {/* Reaction button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  userReaction
                    ? "text-red-500 bg-red-50"
                    : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                }`}
              >
                {userReaction ? (
                  <>
                    <span className="text-sm">
                      {reactionIcons[userReaction]}
                    </span>
                    <span className="capitalize">{userReaction}</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    <span>React</span>
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {showReactionPicker && (
                  <ReactionPicker
                    onSelect={(type) => {
                      handleReaction(type);
                      setShowReactionPicker(false);
                    }}
                    onClose={() => setShowReactionPicker(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Comment button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
                showComments
                  ? "text-red-500 bg-red-50"
                  : "text-gray-500 hover:text-red-500 hover:bg-red-50"
              } transition-all`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Comment</span>
            </motion.button>
          </div>
        </div>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-gray-100 overflow-hidden"
            >
              <CommentSection postId={post.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

export default PostCard;
