using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signature3D.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ProjectV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverImage",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "SectorId",
                table: "Projects",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShortDescription",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Projects_SectorId",
                table: "Projects",
                column: "SectorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_Sectors_SectorId",
                table: "Projects",
                column: "SectorId",
                principalTable: "Sectors",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_Sectors_SectorId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_SectorId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "CoverImage",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "SectorId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ShortDescription",
                table: "Projects");
        }
    }
}
