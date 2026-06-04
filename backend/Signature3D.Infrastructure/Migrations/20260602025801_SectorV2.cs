using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signature3D.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SectorV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverImage",
                table: "Sectors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Sectors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "Sectors",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "Sectors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Sectors",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverImage",
                table: "Sectors");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Sectors");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "Sectors");

            migrationBuilder.DropColumn(
                name: "Icon",
                table: "Sectors");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Sectors");
        }
    }
}
