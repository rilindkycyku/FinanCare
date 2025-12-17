using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class EshteEditiarBarazimiArkes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BarazoArken_Partneri_IDArkatari",
                table: "BarazoArken");

            migrationBuilder.DropForeignKey(
                name: "FK_BarazoArken_Partneri_IDPersoniPergjegjes",
                table: "BarazoArken");

            migrationBuilder.AddForeignKey(
                name: "FK_BarazoArken_Perdoruesi_IDArkatari",
                table: "BarazoArken",
                column: "IDArkatari",
                principalTable: "Perdoruesi",
                principalColumn: "UserID");

            migrationBuilder.AddForeignKey(
                name: "FK_BarazoArken_Perdoruesi_IDPersoniPergjegjes",
                table: "BarazoArken",
                column: "IDPersoniPergjegjes",
                principalTable: "Perdoruesi",
                principalColumn: "UserID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BarazoArken_Perdoruesi_IDArkatari",
                table: "BarazoArken");

            migrationBuilder.DropForeignKey(
                name: "FK_BarazoArken_Perdoruesi_IDPersoniPergjegjes",
                table: "BarazoArken");

            migrationBuilder.AddForeignKey(
                name: "FK_BarazoArken_Partneri_IDArkatari",
                table: "BarazoArken",
                column: "IDArkatari",
                principalTable: "Partneri",
                principalColumn: "IDPartneri");

            migrationBuilder.AddForeignKey(
                name: "FK_BarazoArken_Partneri_IDPersoniPergjegjes",
                table: "BarazoArken",
                column: "IDPersoniPergjegjes",
                principalTable: "Partneri",
                principalColumn: "IDPartneri");
        }
    }
}
