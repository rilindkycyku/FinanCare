using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class ShtoLicenciminBiznesit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LicenseExpiry",
                table: "TeDhenatBiznesit",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LicenseKey",
                table: "TeDhenatBiznesit",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LicenseSignature",
                table: "TeDhenatBiznesit",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LicenseExpiry",
                table: "TeDhenatBiznesit");

            migrationBuilder.DropColumn(
                name: "LicenseKey",
                table: "TeDhenatBiznesit");

            migrationBuilder.DropColumn(
                name: "LicenseSignature",
                table: "TeDhenatBiznesit");
        }
    }
}
