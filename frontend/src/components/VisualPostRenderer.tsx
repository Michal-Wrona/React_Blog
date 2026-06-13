import type { Image, VisualLayout, VisualStyle } from "../types";
import { EMPTY_VISUAL_LAYOUT } from "../utils/visualLayoutUtils";
import VisualPostCanvas from "./VisualPostCanvas";

type VisualPostRendererProps = {
  title: string;
  content: string;
  style: VisualStyle;
  images?: Image[];
  layout?: VisualLayout | null;
  placeholder?: boolean;
};

function VisualPostRenderer({
  title,
  content,
  style,
  images = [],
  layout,
  placeholder = false,
}: VisualPostRendererProps) {
  return (
    <VisualPostCanvas
      title={title}
      content={content}
      style={style}
      images={images}
      layout={layout ?? EMPTY_VISUAL_LAYOUT}
      placeholder={placeholder}
    />
  );
}

export default VisualPostRenderer;
