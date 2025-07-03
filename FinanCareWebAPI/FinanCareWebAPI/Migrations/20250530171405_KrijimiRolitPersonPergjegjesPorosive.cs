using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class KrijimiRolitPersonPergjegjesPorosive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
    table: "AspNetRoles",
    columns: new[] { "Id", "Name", "NormalizedName", "ConcurrencyStamp" },
    values: new object[,]
    {
        { "40ec4178-b07f-4819-877b-7d1faf19a192", "Pergjegjes i Porosive", "PERGJEGJES I POROSIVE", "e69785b6-0b18-4dc6-af5b-2f5e38881dbd" }
    });
            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnd", "LockoutEnabled", "AccessFailedCount" },
                values: new object[,]
                {
        { "7441482f-3f20-4d80-986f-400246c66e3c", "pergjegjes.porosive", "PERGJEGJES.POROSIVE", "pergjegjes.porosive@financare.com", "PERGJEGJES.POROSIVE@FINANCARE.COM", false, "AQAAAAEAACcQAAAAEPGBtnZnpdz3YbN3GFHTILvUzP3MKXV3uFjv7QNLCDt91K8m5cH6aGlvgnnWr363RQ==", "L4BRHQI3OLKTHC5DT7UUGJ6KP53C4J5O", "866c2aff-76b2-4487-a08b-b6087aca1a30", "+38344123456", false, false, null, true, 0 },
                });
            migrationBuilder.InsertData(
    table: "AspNetUserRoles",
    columns: new[] { "UserId", "RoleId" },
    values: new object[,]
    {
        { "7441482f-3f20-4d80-986f-400246c66e3c", "40ec4178-b07f-4819-877b-7d1faf19a192" },
        { "7441482f-3f20-4d80-986f-400246c66e3c", "be4b8ef8-abf0-454c-852c-676cdab20e3b" }
    });

            migrationBuilder.InsertData(
                table: "Perdoruesi",
                columns: new[] { "UserID", "Emri", "Mbiemri", "Email", "Username", "AspNetUserID" },
                values: new object[,]
                {
        { 11, "Pergjegjes", "Porosive", "pergjegjes.porosive@financare.com", "pergjegjes.porosive", "7441482f-3f20-4d80-986f-400246c66e3c" },
                });
            migrationBuilder.InsertData(
               table: "TeDhenatPerdoruesit",
               columns: new[] { "UserID", "NrKontaktit", "Adresa", "BankaID", "DataFillimitKontrates", "DataMbarimitKontrates", "Datelindja", "EmailPrivat", "EshtePuntorAktive", "Kualifikimi", "NrPersonal", "NumriLlogarisBankare", "Paga", "Profesioni", "Specializimi" },
               values: new object[,]
               {
        { 11, "+38344123456", "P.A.", 2, new DateTime(1900, 9, 1), new DateTime(1900, 9, 1), new DateTime(1900, 9, 1), "email@domain.com", "true", "P.K.", "1122334455", "1290012345678900", 99999.99, "P.P.", "P.S." },
               });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
