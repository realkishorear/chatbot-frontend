export default function Spinner() {
  return (
    <div className="flex items-center justify-center space-x-1 h-12" role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
      <div className="h-3 w-3 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-3 w-3 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-3 w-3 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce"></div>
    </div>
  );
}
