using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class ShtoLicenseUsername : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LicenseUsername",
                table: "TeDhenatBiznesit",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LicenseUsername",
                table: "TeDhenatBiznesit");
        }
    }
}
