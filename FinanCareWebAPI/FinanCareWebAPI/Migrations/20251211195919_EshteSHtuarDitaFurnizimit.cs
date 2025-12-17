using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class EshteSHtuarDitaFurnizimit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DitaFurnizimit",
                columns: table => new
                {
                    IDDitaFurnizimit = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDPartneri = table.Column<int>(type: "int", nullable: true),
                    DitaEFurnizimit = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DitaFurnizimit", x => x.IDDitaFurnizimit);
                    table.ForeignKey(
                        name: "FK_DitaFurnizimit_Partneri_IDPartneri",
                        column: x => x.IDPartneri,
                        principalTable: "Partneri",
                        principalColumn: "IDPartneri");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DitaFurnizimit_IDPartneri",
                table: "DitaFurnizimit",
                column: "IDPartneri");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DitaFurnizimit");
        }
    }
}
