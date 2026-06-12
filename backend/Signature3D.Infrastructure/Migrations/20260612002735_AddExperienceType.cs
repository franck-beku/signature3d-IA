using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signature3D.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddExperienceType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExperienceType",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "Matterport");

            migrationBuilder.AddColumn<string>(
                name: "ExperienceUrl",
                table: "Projects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExperienceType",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ExperienceUrl",
                table: "Projects");
        }
    }
}
