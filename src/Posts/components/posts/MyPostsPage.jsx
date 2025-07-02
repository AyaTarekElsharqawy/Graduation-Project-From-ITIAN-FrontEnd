import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import {
  fetchMyPosts,
  fetchPosts,
  deletePost as apiDeletePost,
} from "../../services/api";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import EditPostModal from "./EditPostModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ReactionsModal from "./ReactionsModal";
import { useSelector, useDispatch } from "react-redux";
import { fetchItianProfile } from "../../store/itianSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ItianSidebarProfile from "./ItianSidebarProfile";

const MyPostsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.itian.user);
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      dispatch(fetchItianProfile());
    }
  }, [user, dispatch]);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [editPost, setEditPost] = useState(null);
  const [deletePostId, setDeletePostId] = useState(null);
  const [reactionsModalOpen, setReactionsModalOpen] = useState(false);
  const [reactionsModalPostId, setReactionsModalPostId] = useState(null);
  const observer = useRef();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const loadPosts = useCallback(
    async (reset = false, pageNumber = 1) => {
      try {
        setLoading(true);
        // جلب userId من الكويري سترينج
        const params = new URLSearchParams(location.search);
        const userId = params.get("userId");
        let data;
        if (userId) {
          data = await fetchPosts({ page: pageNumber, user_id: userId });
        } else {
          data = await fetchMyPosts({ page: pageNumber });
        }
        const postsArray = Array.isArray(data.data) ? data.data : [];
        if (reset) {
          setPosts(postsArray);
        } else {
          setPosts((prev) => [...prev, ...postsArray]);
        }
        setHasMore(data.current_page < data.last_page);
      } catch (err) {
        toast.error("Failed to load posts. Please try again.");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    },
    [location.search]
  );

  useEffect(() => {
    setPage(1);
    loadPosts(true, 1);
  }, [loadPosts]);

  useEffect(() => {
    if (page === 1) return;
    loadPosts(false, page);
  }, [page, loadPosts]);

  const lastPostRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
    toast.success("Post created successfully!");
  };
  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
    toast.success("Post deleted successfully!");
  };
  const handleUpdatePost = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    toast.success("Post updated successfully!");
  };
  const handleRefresh = () => {
    setPage(1);
    loadPosts(true, 1);
  };
  const openEditModal = (post) => setEditPost(post);
  const closeEditModal = () => setEditPost(null);
  const openDeleteModal = (postId) => setDeletePostId(postId);
  const closeDeleteModal = () => setDeletePostId(null);
  const handleDeleteConfirmed = async () => {
    if (!deletePostId) return;
    try {
      await apiDeletePost(deletePostId);
      handleDeletePost(deletePostId);
      closeDeleteModal();
    } catch {
      toast.error("Failed to delete post.");
    }
  };
  const handleOpenReactionsModal = (postId) => {
    setReactionsModalOpen(true);
    setReactionsModalPostId(postId);
  };
  const handleCloseReactionsModal = () => {
    setReactionsModalOpen(false);
    setReactionsModalPostId(null);
  };
  const handleEditClick = (post) => openEditModal(post);
  const handleDeleteClick = (postId) => openDeleteModal(postId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-6">
            {user && <ItianSidebarProfile profile={user} />}
          </div>
        </div>
        <div className="flex-1 py-8 pl-2 pr-4 sm:pl-4 sm:pr-6 lg:pl-6 lg:pr-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} />
                </motion.button>
              </div>
            </div>
            {loading && page === 1 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : posts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center"
              >
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-500 mb-4">
                  You haven't created any posts yet.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
                >
                  <FiPlus className="mr-2" />
                  Create Post
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    variants={itemVariants}
                    ref={index === posts.length - 1 ? lastPostRef : null}
                  >
                    <PostCard
                      post={post}
                      onEditClick={handleEditClick}
                      onDeleteClick={handleDeleteClick}
                      onOpenReactionsModal={handleOpenReactionsModal}
                    />
                  </motion.div>
                ))}
                {loading && page > 1 && (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                  </div>
                )}
                {!hasMore && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6 text-gray-500"
                  >
                    You've reached the end
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-xl flex items-center justify-center mb-18"
      >
        <FiPlus className="text-xl" />
      </motion.button>
      <AnimatePresence>
        {isModalOpen && (
          <CreatePostModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </AnimatePresence>
      {editPost && (
        <EditPostModal
          post={editPost}
          onClose={closeEditModal}
          onUpdate={handleUpdatePost}
        />
      )}
      <DeleteConfirmModal
        isOpen={!!deletePostId}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirmed}
      />
      <ReactionsModal
        isOpen={reactionsModalOpen}
        postId={reactionsModalPostId}
        onClose={handleCloseReactionsModal}
      />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default MyPostsPage;
