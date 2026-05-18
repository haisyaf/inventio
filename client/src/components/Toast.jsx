import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const ICONS = {
  success: <CheckCircle size={15} />,
  error: <XCircle size={15} />,
  warning: <AlertCircle size={15} />,
};

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {ICONS[type]}
      <span>{message}</span>
    </div>
  );
}
