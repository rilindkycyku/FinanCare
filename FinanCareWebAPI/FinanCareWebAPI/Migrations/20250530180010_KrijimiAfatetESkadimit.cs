using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class KrijimiAfatetESkadimit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AfatetESkadimit",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StafiID = table.Column<int>(type: "int", nullable: true),
                    IDProduktit = table.Column<int>(type: "int", nullable: true),
                    DataSkadimit = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AfatetESkadimit", x => x.ID);
                    table.ForeignKey(
                        name: "FK_AfatetESkadimit_Perdoruesi_StafiID",
                        column: x => x.StafiID,
                        principalTable: "Perdoruesi",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_AfatetESkadimit_Produkti_IDProduktit",
                        column: x => x.IDProduktit,
                        principalTable: "Produkti",
                        principalColumn: "ProduktiID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AfatetESkadimit_IDProduktit",
                table: "AfatetESkadimit",
                column: "IDProduktit");

            migrationBuilder.CreateIndex(
                name: "IX_AfatetESkadimit_StafiID",
                table: "AfatetESkadimit",
                column: "StafiID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AfatetESkadimit");
        }
    }
}
