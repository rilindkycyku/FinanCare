using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class FshirjaEPerdorueseve : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "isDeleted",
                table: "TeDhenatPerdoruesit",
                type: "nvarchar(max)",
                nullable: true,
                defaultValue: "false");

            migrationBuilder.Sql("UPDATE TeDhenatPerdoruesit SET isDeleted = 'false' WHERE isDeleted IS NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isDeleted",
                table: "TeDhenatPerdoruesit");
        }
    }
}
