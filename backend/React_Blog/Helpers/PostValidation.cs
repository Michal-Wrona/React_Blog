namespace React_Blog.Helpers
{
    public static class PostValidation
    {
        public static string? ValidateCreateTitle(string title)
        {
            if (title.Length < 5)
                return "Tytuł musi mieć minimum 5 znaków.";

            if (string.IsNullOrWhiteSpace(title))
                return "Tytuł nie może składać się wyłącznie ze znaków białych.";

            return null;
        }

        public static string? ValidateCreateContent(string content)
        {
            if (content.Length < 30)
                return "Treść musi mieć minimum 30 znaków.";

            if (content.Count(char.IsWhiteSpace) > content.Length / 2)
                return "Treść może zawierać maksymalnie połowę znaków białych.";

            return null;
        }
    }
}
