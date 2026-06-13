import type { ReactNode } from "react";
import { VISUAL_POST_SHELL_CLASS } from "../utils/postFormUtils";

type VisualPostPreviewShellProps = {
  children: ReactNode;
  label?: string;
};

function VisualPostPreviewShell({
  children,
  label,
}: VisualPostPreviewShellProps) {
  return (
    <div>
      {label && (
        <span className="block text-gray-700 font-medium mb-2">{label}</span>
      )}
      <div className={VISUAL_POST_SHELL_CLASS}>{children}</div>
    </div>
  );
}

export default VisualPostPreviewShell;
