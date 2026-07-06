using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signature3D.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentIndexingError : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IndexingError",
                table: "Documents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IndexingError",
                table: "Documents");
        }
    }
}
