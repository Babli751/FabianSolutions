'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-center p-6">
        <div>
          <h1 className="text-4xl font-bold text-red-600">Something went wrong!</h1>
          <p className="text-gray-500 dark:text-gray-300 mt-4">Please try again later.</p>
          <button
            onClick={() => reset()}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
