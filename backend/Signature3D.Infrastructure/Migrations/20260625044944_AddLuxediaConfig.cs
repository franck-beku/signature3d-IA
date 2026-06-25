using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signature3D.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLuxediaConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LuxediaAvatarUrl",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaBotMessageColor",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaButtonIcon",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaClientLogoUrl",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaLanguage",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaPersonalityInstructions",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaPrimaryColor",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaTone",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaUserMessageColor",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaWidgetBgColor",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LuxediaWidgetPosition",
                table: "Projects",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LuxediaAvatarUrl",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaBotMessageColor",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaButtonIcon",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaClientLogoUrl",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaLanguage",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaPersonalityInstructions",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaPrimaryColor",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaTone",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaUserMessageColor",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaWidgetBgColor",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LuxediaWidgetPosition",
                table: "Projects");
        }
    }
}
