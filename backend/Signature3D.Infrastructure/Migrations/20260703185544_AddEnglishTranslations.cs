using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signature3D.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEnglishTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DescriptionEn",
                table: "Sectors",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortDescriptionEn",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LevelEn",
                table: "Offerings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LongDescriptionEn",
                table: "Offerings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortDescriptionEn",
                table: "Offerings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AnswerEn",
                table: "Faqs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuestionEn",
                table: "Faqs",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DescriptionEn",
                table: "Sectors");

            migrationBuilder.DropColumn(
                name: "ShortDescriptionEn",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "LevelEn",
                table: "Offerings");

            migrationBuilder.DropColumn(
                name: "LongDescriptionEn",
                table: "Offerings");

            migrationBuilder.DropColumn(
                name: "ShortDescriptionEn",
                table: "Offerings");

            migrationBuilder.DropColumn(
                name: "AnswerEn",
                table: "Faqs");

            migrationBuilder.DropColumn(
                name: "QuestionEn",
                table: "Faqs");
        }
    }
}
