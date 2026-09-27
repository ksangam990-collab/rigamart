import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-5"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner border border-brand-100"
        >
          <FileQuestion className="w-8 h-8" />
        </motion.div>

        <div>
          <span className="text-4xl font-black text-gray-900 tracking-tight block">404</span>
          <h1 className="text-xl font-black text-gray-800 tracking-tight mt-1">Page Not Found</h1>
          <p className="text-gray-500 mt-2 text-xs sm:text-sm leading-relaxed">
            The product, collection, or URL you requested could not be located on Rigamart. It might have been relocated or updated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all w-full"
            >
              <Home className="w-4 h-4" />
              Storefront Home
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all w-full"
            >
              <Search className="w-4 h-4" />
              Browse Catalog
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
