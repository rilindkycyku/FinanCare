using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    /// <inheritdoc />
    public partial class ShtoSuperAdminFushen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── 1. Shto kolonën IsSuperAdmin ───────────────────
            migrationBuilder.AddColumn<bool>(
                name: "IsSuperAdmin",
                table: "Perdoruesi",
                type: "bit",
                nullable: false,
                defaultValue: false);

            // ── 2. Seed i plotë i superadminit me InsertData ───────────────────
            const string saAspNetUserId = "1cf55bef-b993-4550-9a70-79aa99cd34df";
            const int saUserId = 9999;

            // AspNetUsers
            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "UserName", "NormalizedUserName", "Email", "NormalizedEmail", "EmailConfirmed", "PasswordHash", "SecurityStamp", "ConcurrencyStamp", "PhoneNumber", "PhoneNumberConfirmed", "TwoFactorEnabled", "LockoutEnd", "LockoutEnabled", "AccessFailedCount" },
                values: new object[] { saAspNetUserId, "financare.admin", "FINANCARE.ADMIN", "financare.admin@staff.local", "FINANCARE.ADMIN@STAFF.LOCAL", true, "AQAAAAEAACcQAAAAEEj5xEXMxNevQmrwICKy+Gh+RbYdLpZonUifW/nW4Uu+KbIXmFBn6dpIVuu8sAPM7Q==", "fa914d2c-1111-2222-3333-securitystmp", "fa914d2c-1111-2222-3333-concurrencys", null, false, false, null, true, 0 });

            // AspNetUserRoles: User + Menaxher
            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "UserId", "RoleId" },
                values: new object[,]
                {
                    { saAspNetUserId, "be4b8ef8-abf0-454c-852c-676cdab20e3b" },
                    { saAspNetUserId, "db3dd60d-a159-4f85-a9a5-d1444ee1013d" }
                });

            // Perdoruesi (UserID = 9999, IsSuperAdmin = true)
            migrationBuilder.InsertData(
                table: "Perdoruesi",
                columns: new[] { "UserID", "Emri", "Mbiemri", "Email", "Username", "AspNetUserID", "IsSuperAdmin" },
                values: new object[] { saUserId, "FinanCare", "Admin", "financare.admin@staff.local", "financare.admin", saAspNetUserId, true });

            // TeDhenatPerdoruesit
            migrationBuilder.InsertData(
                table: "TeDhenatPerdoruesit",
                columns: new[] { "UserID", "EshtePuntorAktive" },
                values: new object[] { saUserId, "true" });

            // Kartelat
            migrationBuilder.InsertData(
                table: "Kartelat",
                columns: new[] { "IDKartela", "DataKrijimit", "KodiKartela", "LlojiKarteles", "Rabati", "StafiID", "PartneriID" },
                values: new object[] { 9999, null, "FINANCAREADMIN1@", "Fshirje", null, saUserId, null });
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            const string saAspNetUserId = "1cf55bef-b993-4550-9a70-79aa99cd34df";
            const int saUserId = 9999;

            migrationBuilder.DeleteData(
                table: "Kartelat",
                keyColumn: "IDKartela",
                keyValue: 9999);

            migrationBuilder.DeleteData(
                table: "TeDhenatPerdoruesit",
                keyColumn: "UserID",
                keyValue: saUserId);

            migrationBuilder.DeleteData(
                table: "Perdoruesi",
                keyColumn: "UserID",
                keyValue: saUserId);

            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "UserId", "RoleId" },
                keyValues: new object[] { saAspNetUserId, "be4b8ef8-abf0-454c-852c-676cdab20e3b" });

            migrationBuilder.DeleteData(
                table: "AspNetUserRoles",
                keyColumns: new[] { "UserId", "RoleId" },
                keyValues: new object[] { saAspNetUserId, "db3dd60d-a159-4f85-a9a5-d1444ee1013d" });

            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: saAspNetUserId);

            migrationBuilder.DropColumn(
                name: "IsSuperAdmin",
                table: "Perdoruesi");
        }
    }
}
