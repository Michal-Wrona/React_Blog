type AlertModalProps = {
  message: string;
  onClose: () => void;
};

function AlertModal({ message, onClose }: AlertModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-modal-message"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Zamknij"
      />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <p id="alert-modal-message" className="text-gray-800 text-center mb-6">
          {message}
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-xl transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
