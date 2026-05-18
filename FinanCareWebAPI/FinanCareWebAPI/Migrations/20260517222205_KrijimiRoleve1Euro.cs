using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class KrijimiRoleve1Euro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "Name", "NormalizedName", "ConcurrencyStamp" },
                values: new object[,]
                {
                    { "b8c3a1d9-813c-4573-a8e5-3d84a7e8f522", "1 Euro Menaxher", "1 EURO MENAXHER", "c7a84e60-9d1a-4c2f-b42e-13c5f6e8b41a" },
                    { "f6c491e5-8f2c-493a-b8e7-6d14c9f7a31b", "1 Euro Staff", "1 EURO STAFF", "e9b53e80-1a2c-4f2b-8a4d-38c7f9e8a52c" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValues: new object[] { "b8c3a1d9-813c-4573-a8e5-3d84a7e8f522", "f6c491e5-8f2c-493a-b8e7-6d14c9f7a31b" });
        }
    }
}
