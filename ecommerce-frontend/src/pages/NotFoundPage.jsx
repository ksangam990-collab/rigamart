import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-gray-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mt-1">Page Not Found</h2>
      <p className="text-gray-500 mt-2 max-w-sm text-sm">
        The product, category, or page you are looking for has been moved or doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
      >
        <Home className="w-4 h-4" />
        Back to Rigamart Home
      </Link>
    </div>
  );
}
