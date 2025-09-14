export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading Your Feedback</h1>
        <p className="text-gray-600">Please wait while we prepare your interview feedback...</p>
      </div>
    </div>
  );
}
