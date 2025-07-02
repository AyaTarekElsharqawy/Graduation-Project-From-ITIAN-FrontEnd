import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "../../api/axios";

const AdminRagPage = () => {
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmbed = async (type) => {
    setLoading(type);
    setMessage("");
    setError("");
    try {
      const url =
        type === "posts" ? "/api/rag/embed/posts" : "/api/rag/embed/jobs";
      const res = await axios.get(url);
      setMessage(res.data.message || "Success!");
    } catch (e) {
      setError(e.response?.data?.error || "An error occurred");
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-red-700">
          RAG Embedding Tools
        </h2>
        <div className="flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleEmbed("posts")}
            disabled={loading === "posts"}
            className={`py-3 rounded-lg font-semibold transition-all shadow-md border text-lg ${
              loading === "posts"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
            }`}
          >
            {loading === "posts" ? "Embedding Posts..." : "Embed All Posts"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleEmbed("jobs")}
            disabled={loading === "jobs"}
            className={`py-3 rounded-lg font-semibold transition-all shadow-md border text-lg ${
              loading === "jobs"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
            }`}
          >
            {loading === "jobs" ? "Embedding Jobs..." : "Embed All Jobs"}
          </motion.button>
        </div>
        {message && (
          <div className="mt-6 p-3 rounded-lg bg-green-100 text-green-700 text-center border border-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-6 p-3 rounded-lg bg-red-100 text-red-700 text-center border border-red-200">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminRagPage;
