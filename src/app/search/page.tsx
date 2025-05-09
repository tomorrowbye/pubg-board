'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlatformShard } from '@/types/pubg-api';

export default function SearchPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [platform, setPlatform] = useState<PlatformShard>(PlatformShard.STEAM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platforms = [
    { value: PlatformShard.STEAM, label: 'Steam' },
    { value: PlatformShard.KAKAO, label: 'Kakao' },
    { value: PlatformShard.XBOX, label: 'Xbox' },
    { value: PlatformShard.PSN, label: 'PlayStation' },
  ];

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Please enter a player name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, we could pre-validate the player exists here
      // But instead, we'll directly navigate to the player page
      router.push(`/player/${encodeURIComponent(playerName)}?shard=${platform}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred during search');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">PUBG Stats Tracker</h1>
          <p className="text-gray-700 dark:text-gray-300">
            Search for a player to view their stats and match history
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Player Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="Enter PUBG player name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Platform
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlatform(p.value)}
                  className={`py-2 px-4 rounded-md transition-colors ${
                    platform === p.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching...
              </span>
            ) : (
              'Search Player'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Popular Players:</h2>
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/player/shroud?shard=steam"
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-300 transition-colors"
            >
              shroud
            </Link>
            <Link 
              href="/player/chocoTaco?shard=steam"
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-300 transition-colors"
            >
              chocoTaco
            </Link>
            <Link 
              href="/player/TGLTN?shard=steam"
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-300 transition-colors"
            >
              TGLTN
            </Link>
            <Link 
              href="/player/BreaK?shard=steam"
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm text-gray-800 dark:text-gray-300 transition-colors"
            >
              BreaK
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}