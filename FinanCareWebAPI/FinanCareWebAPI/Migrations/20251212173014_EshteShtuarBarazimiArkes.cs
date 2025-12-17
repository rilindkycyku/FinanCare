using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class EshteShtuarBarazimiArkes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BarazoArken",
                columns: table => new
                {
                    IDBarazoArken = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IDArkatari = table.Column<int>(type: "int", nullable: true),
                    FillimiArkes = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TeShtuaraNeArke = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Cash = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Borxhe = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Banka = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PagesFatura = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Tjera = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    PershkrimiTjera = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KohaBarazimit = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IDPersoniPergjegjes = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BarazoArken", x => x.IDBarazoArken);
                    table.ForeignKey(
                        name: "FK_BarazoArken_Partneri_IDArkatari",
                        column: x => x.IDArkatari,
                        principalTable: "Partneri",
                        principalColumn: "IDPartneri");
                    table.ForeignKey(
                        name: "FK_BarazoArken_Partneri_IDPersoniPergjegjes",
                        column: x => x.IDPersoniPergjegjes,
                        principalTable: "Partneri",
                        principalColumn: "IDPartneri");
                });

            migrationBuilder.CreateIndex(
                name: "IX_BarazoArken_IDArkatari",
                table: "BarazoArken",
                column: "IDArkatari");

            migrationBuilder.CreateIndex(
                name: "IX_BarazoArken_IDPersoniPergjegjes",
                table: "BarazoArken",
                column: "IDPersoniPergjegjes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BarazoArken");
        }
    }
}
