import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl w-full text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">PUBG Board</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Track your PUBG statistics, match history, and compare with other players.
          </p>
          
          <Link
            href="/search"
            className="inline-block bg-primary-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-md"
          >
            Search Players
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-2">Player Stats</h2>
            <p className="text-gray-600 dark:text-gray-300">View detailed statistics for any PUBG player across multiple platforms</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-2">Match History</h2>
            <p className="text-gray-600 dark:text-gray-300">Review recent matches with detailed performance breakdowns</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-2">Season Tracking</h2>
            <p className="text-gray-600 dark:text-gray-300">Track your progress throughout current and past seasons</p>
          </div>
        </div>

        <div className="flex justify-center items-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by PUBG Official API</p>
          <div className="mx-3 text-gray-300 dark:text-gray-600">|</div>
          <Link href="/search" className="text-primary-600 dark:text-primary-400 hover:underline">
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}