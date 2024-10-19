const LoadingModal = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-16 rounded-lg shadow-lg text-center flex justify-center flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-dashed rounded-full border-blue-500 animate-[spin_2s_linear_infinite]"></div>
        <div>
          <p className="text-lg font-semibold">Loading...</p>
          <p className="mt-2 text-sm text-gray-600">Please wait a moment.</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
