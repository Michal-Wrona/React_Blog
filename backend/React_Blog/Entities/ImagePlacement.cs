namespace React_Blog.Entities
{
    public class ImagePlacement
    {
        public int ImageId { get; set; }
        public double Left { get; set; }
        public double Top { get; set; }
        public double Width { get; set; }
        public double AspectRatio { get; set; }
        public int ZIndex { get; set; }
        public bool CaptionEnabled { get; set; }
        public string? Caption { get; set; }
    }
}
