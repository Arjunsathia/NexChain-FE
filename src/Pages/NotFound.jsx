import { Link } from "react-router-dom";

const NotFound = () => (
  <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
    <p className="text-6xl font-black text-cyan-500">404</p>
    <h1 className="text-xl font-bold">Page not found</h1>
    <p className="text-sm text-gray-500 max-w-sm">
      The page you&apos;re looking for doesn&apos;t exist or has moved.
    </p>
    <Link
      to="/"
      className="mt-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold"
    >
      Back to home
    </Link>
  </main>
);

export default NotFound;
