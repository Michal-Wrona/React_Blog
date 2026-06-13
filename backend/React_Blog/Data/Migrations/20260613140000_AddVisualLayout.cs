using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace React_Blog.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVisualLayout : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VisualLayout",
                table: "Posts",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VisualLayout",
                table: "Posts");
        }
    }
}
