using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace React_Blog.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddImageDisplayMode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ImageDisplayMode",
                table: "Posts",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageDisplayMode",
                table: "Posts");
        }
    }
}
