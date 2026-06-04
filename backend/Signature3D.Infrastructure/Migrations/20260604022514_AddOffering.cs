using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signature3D.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOffering : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OfferingId",
                table: "Projects",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Offerings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    ShortDescription = table.Column<string>(type: "text", nullable: true),
                    LongDescription = table.Column<string>(type: "text", nullable: true),
                    Icon = table.Column<string>(type: "text", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    Level = table.Column<string>(type: "text", nullable: true),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Offerings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OfferingId",
                table: "Projects",
                column: "OfferingId");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Offerings_OfferingId",
                table: "Projects",
                column: "OfferingId",
                principalTable: "Offerings",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Offerings_OfferingId",
                table: "Projects");

            migrationBuilder.DropTable(
                name: "Offerings");

            migrationBuilder.DropIndex(
                name: "IX_Projects_OfferingId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "OfferingId",
                table: "Projects");
        }
    }
}
