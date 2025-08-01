import React from 'react';
import { UserX, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const AttendeeNotFoundError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl border border-white/20 backdrop-blur-sm shadow-lg">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto p-4 rounded-2xl bg-red-500/20 w-fit">
          <UserX className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Attendee Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We couldn&apos;t find your attendee information for this webinar call. Please check your registration or contact support.
          </p>
        </div>
        <Link
          href="/live-webinar" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 text-gray-900 dark:text-white font-semibold hover:scale-105 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back to webinars
        </Link>
      </div>
    </div>
  );
};

export default AttendeeNotFoundError; 