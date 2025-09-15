import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to Game Platform
        </h1>
        <div className="space-x-4">
          <Link
            href="/server"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Game Server Dashboard
          </Link>
          <Link
            href="/player"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Player Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
