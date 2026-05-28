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

            // Zëvendësojmë përdoruesin ekzistues me ID 12 (nëse ka) me një ID të re, për të liruar ID 12 pa humbur të dhënat
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM Perdoruesi WHERE UserID = 12)
                BEGIN
                    DECLARE @NewUserID INT;
                    SELECT @NewUserID = MAX(UserID) + 1 FROM Perdoruesi;
                    IF @NewUserID IS NULL OR @NewUserID < 13
                        SET @NewUserID = 13;

                    -- 1. Krijojmë një kopje të përdoruesit me ID-në e re
                    SET IDENTITY_INSERT Perdoruesi ON;
                    INSERT INTO Perdoruesi (UserID, Emri, Mbiemri, Email, Username, AspNetUserID, IsSuperAdmin)
                    SELECT @NewUserID, Emri, Mbiemri, Email, Username, AspNetUserID, IsSuperAdmin
                    FROM Perdoruesi
                    WHERE UserID = 12;
                    SET IDENTITY_INSERT Perdoruesi OFF;

                    -- 2. Përditësojmë dinamikisht të gjitha tabelat që referencojnë Perdoruesi(UserID) si Foreign Key
                    DECLARE @Sql NVARCHAR(MAX) = '';
                    SELECT @Sql = @Sql + 'UPDATE [' + OBJECT_SCHEMA_NAME(fk.parent_object_id) + '].[' + OBJECT_NAME(fk.parent_object_id) + '] SET [' + c.name + '] = ' + CAST(@NewUserID AS NVARCHAR) + ' WHERE [' + c.name + '] = 12; '
                    FROM sys.foreign_key_columns fkc
                    JOIN sys.foreign_keys fk ON fkc.constraint_object_id = fk.object_id
                    JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
                    WHERE fk.referenced_object_id = OBJECT_ID('Perdoruesi');

                    IF @Sql <> ''
                        EXEC sp_executesql @Sql;

                    -- 3. Fshijmë përdoruesin e vjetër me ID 12
                    DELETE FROM Perdoruesi WHERE UserID = 12;
                END
            ");

            // ── 2. Seed i plotë i superadminit me InsertData ───────────────────
            const string saAspNetUserId = "1cf55bef-b993-4550-9a70-79aa99cd34df";
            const int saUserId = 12;

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
                columns: new[] { "DataKrijimit", "KodiKartela", "LlojiKarteles", "Rabati", "StafiID", "PartneriID" },
                values: new object[] { new DateTime(1900, 9, 1), "FINANCAREADMIN1@", "Fshirje", null, saUserId, null });
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            const string saAspNetUserId = "1cf55bef-b993-4550-9a70-79aa99cd34df";
            const int saUserId = 12;

            migrationBuilder.DeleteData(
                table: "Kartelat",
                keyColumn: "KodiKartela",
                keyValue: "FINANCAREADMIN1@");

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
