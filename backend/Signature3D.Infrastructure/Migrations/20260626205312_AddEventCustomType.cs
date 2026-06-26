using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Signature3D.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEventCustomType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomType",
                table: "AgendaEvents",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomType",
                table: "AgendaEvents");
        }
    }
}
