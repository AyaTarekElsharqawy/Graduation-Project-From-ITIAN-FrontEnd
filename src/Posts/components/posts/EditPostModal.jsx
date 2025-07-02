import { useState, useRef } from 'react';
import { updatePost } from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const EditPostModal = ({ post, onClose, onUpdate }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(post.image ? `http://localhost:8000/storage/${post.image}` : null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    image: '',
    general: ''
  });
  
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: 'Please upload a valid image (JPEG, PNG, JPG, GIF)'
        });
        return;
      }
      
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          image: 'Image size should be less than 2MB'
        });
        return;
      }
      
      setErrors({ ...errors, image: '' });
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: '',
      content: '',
      image: '',
      general: ''
    };
    let isValid = true;

    // Title validation
    if (title && title.length > 255) {
      newErrors.title = 'Title should be less than 255 characters';
      isValid = false;
    }

    // Content validation
    if (content && content.length > 5000) {
      newErrors.content = 'Content is too long (max 5000 characters)';
      isValid = false;
    }

    // Title requires content
    if (title.trim() && !content.trim()) {
      newErrors.content = 'Please provide content when adding a title';
      isValid = false;
    }

    // At least one field must be provided
    if (!title.trim() && !content.trim() && !image) {
      newErrors.general = 'Please provide at least one of: content or image (title requires content)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updatedPost = await updatePost(post.id, { title, content, image });
      onUpdate(updatedPost);
      toast.success('Post updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      setErrors({
        ...errors,
        general: error.response?.data?.error || 'Failed to update post'
      });
      toast.error(error.response?.data?.error || 'Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for error messages
  const ErrorMessage = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-500 text-xs mt-1 flex items-start"
    >
      <span className="mr-1">⚠️</span>
      <span>{message}</span>
    </motion.div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal container */}
        <motion.div
          ref={modalRef}
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border-4 border-red-500/20"
        >
          {/* Header with gradient */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-600 to-red-700 p-6 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    transition: { repeat: Infinity, duration: 2 }
                  }}
                  className="text-2xl"
                >
                  ✏️
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Post</h2>
                  <p className="text-red-100/90 text-sm">Make changes to your post</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* Form content */}
          <div className="p-6 overflow-y-auto flex-grow bg-gradient-to-b from-white to-red-50">
            <form onSubmit={handleSubmit}>
              {/* General error message */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 bg-red-100 border border-red-300 rounded-lg p-3 mb-4 text-sm font-medium shadow-sm flex items-start"
                >
                  <span className="mr-2">⚠️</span>
                  <span>{errors.general}</span>
                </motion.div>
              )}

              {/* Title field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <label className="block text-red-700 font-medium mb-2">
                  Title <span className="text-gray-400 text-sm">(requires content)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title || errors.content) {
                        setErrors({ 
                          ...errors, 
                          title: '',
                          content: '' 
                        });
                      }
                    }}
                    className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-200 transition-all duration-300 shadow-sm ${
                      errors.title ? 'border-red-400' : 'border-gray-200 focus:border-red-500'
                    }`}
                  />
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="absolute right-3 top-3 text-red-400"
                  >
                    📝
                  </motion.div>
                </div>
                {errors.title && <ErrorMessage message={errors.title} />}
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {title.length}/255 characters
                </div>
              </motion.div>

              {/* Content field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <label className="block text-red-700 font-medium mb-2">
                  Content <span className="text-gray-400 text-sm">(optional unless title is provided)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) {
                      setErrors({ ...errors, content: '' });
                    }
                  }}
                  className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-200 transition-all duration-300 shadow-sm resize-none ${
                    errors.content ? 'border-red-400' : 'border-gray-200 focus:border-red-500'
                  }`}
                  rows="4"
                />
                {errors.content && <ErrorMessage message={errors.content} />}
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {content.length}/5000 characters
                </div>
              </motion.div>

              {/* Image upload */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <label className="block text-red-700 font-medium mb-2">
                  Update Image <span className="text-gray-400 text-sm">(optional)</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg, image/png, image/jpg, image/gif"
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    fileInputRef.current.click();
                    setErrors({ ...errors, image: '' });
                  }}
                  className={`flex items-center justify-center w-full py-4 px-4 rounded-xl transition-all duration-300 shadow-inner ${
                    errors.image 
                      ? 'border-2 border-dashed border-red-400 bg-red-50' 
                      : 'border-2 border-dashed border-red-300 bg-red-50 hover:bg-red-100'
                  }`}
                >
                  <motion.div 
                    animate={{ 
                      y: [0, -3, 0],
                      transition: { repeat: Infinity, duration: 2 }
                    }}
                    className="text-2xl"
                  >
                    {preview ? '🖼️' : '📷'}
                  </motion.div>
                  <span className="ml-3 text-red-600 font-medium">
                    {preview ? 'Change Image' : 'Upload an Image'}
                  </span>
                </motion.button>
                
                {errors.image && <ErrorMessage message={errors.image} />}
                <div className="text-xs text-gray-500 mt-1">
                  Max size: 2MB (JPEG, PNG, GIF)
                </div>

                {preview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 relative group overflow-hidden rounded-xl shadow-lg"
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full object-cover max-h-64 transition-transform duration-500 group-hover:scale-105"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      type="button"
                      onClick={() => {
                        setPreview(null);
                        setImage(null);
                        setErrors({ ...errors, image: '' });
                      }}
                      className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-end space-x-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium shadow-sm transition-all duration-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading}
                  className={`px-6 py-2.5 text-white rounded-lg font-medium shadow-lg transition-all duration-300 flex items-center justify-center min-w-28 ${
                    isLoading 
                      ? 'bg-red-400' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1,
                          ease: "linear"
                        }}
                        className="inline-block mr-2"
                      >
                        ⏳
                      </motion.span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <motion.span 
                        animate={{ 
                          x: [0, 5, 0],
                          transition: { repeat: Infinity, duration: 1.5 }
                        }}
                        className="mr-2"
                      >
                        💾
                      </motion.span>
                      Update
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>

          {/* Decorative footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="h-2 bg-gradient-to-r from-red-500 via-red-400 to-red-500"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditPostModal;