﻿// <auto-generated />
using System;
using FinanCareWebAPI.Migrations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace FinanCareWebAPI.Migrations
{
    [DbContext(typeof(FinanCareDbContext))]
    [Migration("20240827075743_PerditesimiKartelave")]
    partial class PerditesimiKartelave
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.5")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("FinanCareWebAPI.Models.Bankat", b =>
                {
                    b.Property<int>("BankaID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("BankaID"));

                    b.Property<string>("AdresaBankes")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EmriBankes")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NumriLlogaris")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Valuta")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("BankaID");

                    b.ToTable("Bankat");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Faturat", b =>
                {
                    b.Property<int>("IDRegjistrimit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IDRegjistrimit"));

                    b.Property<DateTime?>("DataRegjistrimit")
                        .HasColumnType("datetime2");

                    b.Property<string>("EshteFaturuarOferta")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("IDBonusKartela")
                        .HasColumnType("int");

                    b.Property<int?>("IDPartneri")
                        .HasColumnType("int");

                    b.Property<string>("LlojiKalkulimit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LlojiPageses")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NrFatures")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("NrRendorFatures")
                        .HasColumnType("int");

                    b.Property<string>("PershkrimShtese")
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal?>("Rabati")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int?>("StafiID")
                        .HasColumnType("int");

                    b.Property<string>("StatusiKalkulimit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("StatusiPageses")
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal?>("TVSH")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("TotaliPaTVSH")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("IDRegjistrimit");

                    b.HasIndex("IDBonusKartela");

                    b.HasIndex("IDPartneri");

                    b.HasIndex("StafiID");

                    b.ToTable("Faturat");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.GrupiProduktit", b =>
                {
                    b.Property<int>("IDGrupiProduktit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IDGrupiProduktit"));

                    b.Property<string>("GrupiIProduktit")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("IDGrupiProduktit");

                    b.ToTable("GrupiProduktit");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Kartelat", b =>
                {
                    b.Property<int>("IDKartela")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IDKartela"));

                    b.Property<DateTime?>("DataKrijimit")
                        .HasColumnType("datetime2");

                    b.Property<string>("KodiKartela")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LlojiKarteles")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("PartneriID")
                        .HasColumnType("int");

                    b.Property<decimal?>("Rabati")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int?>("StafiID")
                        .HasColumnType("int");

                    b.HasKey("IDKartela");

                    b.HasIndex("PartneriID");

                    b.HasIndex("StafiID");

                    b.ToTable("Kartelat");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.NjesiaMatese", b =>
                {
                    b.Property<int>("IDNjesiaMatese")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IDNjesiaMatese"));

                    b.Property<string>("EmriNjesiaMatese")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("IDNjesiaMatese");

                    b.ToTable("NjesiaMatese");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Partneri", b =>
                {
                    b.Property<int>("IDPartneri")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IDPartneri"));

                    b.Property<string>("Adresa")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EmriBiznesit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("LlojiPartnerit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NRF")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NUI")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NrKontaktit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ShkurtesaPartnerit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TVSH")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("IDPartneri");

                    b.ToTable("Partneri");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Perdoruesi", b =>
                {
                    b.Property<int>("UserID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserID"));

                    b.Property<string>("AspNetUserID")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Emri")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Mbiemri")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Username")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserID");

                    b.HasIndex("AspNetUserID");

                    b.ToTable("Perdoruesi");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Produkti", b =>
                {
                    b.Property<int>("ProduktiID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ProduktiID"));

                    b.Property<string>("Barkodi")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EmriProduktit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("IDGrupiProduktit")
                        .HasColumnType("int");

                    b.Property<int?>("IDNjesiaMatese")
                        .HasColumnType("int");

                    b.Property<int?>("IDPartneri")
                        .HasColumnType("int");

                    b.Property<string>("KodiProduktit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("LlojiTVSH")
                        .HasColumnType("int");

                    b.Property<decimal?>("SasiaShumices")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("ProduktiID");

                    b.HasIndex("IDGrupiProduktit");

                    b.HasIndex("IDNjesiaMatese");

                    b.HasIndex("IDPartneri");

                    b.ToTable("Produkti");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.StokuQmimiProduktit", b =>
                {
                    b.Property<int>("ProduktiID")
                        .HasColumnType("int");

                    b.Property<DateTime?>("DataKrijimit")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DataPerditsimit")
                        .HasColumnType("datetime2");

                    b.Property<decimal?>("QmimiBleres")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("QmimiMeShumic")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("QmimiProduktit")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("SasiaNeStok")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("ProduktiID");

                    b.ToTable("StokuQmimiProduktit");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.TeDhenatBiznesit", b =>
                {
                    b.Property<int>("IDTeDhenatBiznesit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IDTeDhenatBiznesit"));

                    b.Property<string>("Adresa")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EmailDomain")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EmriIBiznesit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Logo")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("NF")
                        .HasColumnType("int");

                    b.Property<int?>("NUI")
                        .HasColumnType("int");

                    b.Property<string>("NrKontaktit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("NrTVSH")
                        .HasColumnType("int");

                    b.Property<string>("ShkurtesaEmritBiznesit")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("IDTeDhenatBiznesit");

                    b.ToTable("TeDhenatBiznesit");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.TeDhenatFaturat", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ID"));

                    b.Property<int?>("IDProduktit")
                        .HasColumnType("int");

                    b.Property<int>("IDRegjistrimit")
                        .HasColumnType("int");

                    b.Property<decimal?>("QmimiBleres")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("QmimiShites")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("QmimiShitesMeShumic")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("Rabati1")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("Rabati2")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("Rabati3")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal?>("SasiaStokut")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("ID");

                    b.HasIndex("IDProduktit");

                    b.HasIndex("IDRegjistrimit");

                    b.ToTable("TeDhenatFaturat");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.TeDhenatPerdoruesit", b =>
                {
                    b.Property<int>("UserID")
                        .HasColumnType("int");

                    b.Property<string>("Adresa")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("BankaID")
                        .HasColumnType("int");

                    b.Property<DateTime?>("DataFillimitKontrates")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DataMbarimitKontrates")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("Datelindja")
                        .HasColumnType("datetime2");

                    b.Property<string>("EmailPrivat")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("EshtePuntorAktive")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Kualifikimi")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NrKontaktit")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NrPersonal")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("NumriLlogarisBankare")
                        .HasColumnType("nvarchar(max)");

                    b.Property<decimal?>("Paga")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("Profesioni")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Specializimi")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserID");

                    b.HasIndex("BankaID");

                    b.ToTable("TeDhenatPerdoruesit");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.ZbritjaQmimitProduktit", b =>
                {
                    b.Property<int>("ProduktiID")
                        .HasColumnType("int");

                    b.Property<DateTime?>("DataSkadimit")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("DataZbritjes")
                        .HasColumnType("datetime2");

                    b.Property<decimal?>("Rabati")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("ProduktiID");

                    b.ToTable("ZbritjaQmimitProduktit");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex")
                        .HasFilter("[NormalizedName] IS NOT NULL");

                    b.ToTable("AspNetRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUser", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("AspNetUsers", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("RoleId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Faturat", b =>
                {
                    b.HasOne("FinanCareWebAPI.Models.Kartelat", "BonusKartela")
                        .WithMany()
                        .HasForeignKey("IDBonusKartela");

                    b.HasOne("FinanCareWebAPI.Models.Partneri", "Partneri")
                        .WithMany("Faturat")
                        .HasForeignKey("IDPartneri");

                    b.HasOne("FinanCareWebAPI.Models.Perdoruesi", "Stafi")
                        .WithMany("Faturat")
                        .HasForeignKey("StafiID");

                    b.Navigation("BonusKartela");

                    b.Navigation("Partneri");

                    b.Navigation("Stafi");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Kartelat", b =>
                {
                    b.HasOne("FinanCareWebAPI.Models.Partneri", "Partneri")
                        .WithMany()
                        .HasForeignKey("PartneriID");

                    b.HasOne("FinanCareWebAPI.Models.Perdoruesi", "Stafi")
                        .WithMany()
                        .HasForeignKey("StafiID");

                    b.Navigation("Partneri");

                    b.Navigation("Stafi");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Perdoruesi", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", "AspNetUser")
                        .WithMany()
                        .HasForeignKey("AspNetUserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AspNetUser");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Produkti", b =>
                {
                    b.HasOne("FinanCareWebAPI.Models.GrupiProduktit", "GrupiProduktit")
                        .WithMany("Produkti")
                        .HasForeignKey("IDGrupiProduktit");

                    b.HasOne("FinanCareWebAPI.Models.NjesiaMatese", "NjesiaMatese")
                        .WithMany("Produkti")
                        .HasForeignKey("IDNjesiaMatese");

                    b.HasOne("FinanCareWebAPI.Models.Partneri", "Partneri")
                        .WithMany("Produkti")
                        .HasForeignKey("IDPartneri");

                    b.Navigation("GrupiProduktit");

                    b.Navigation("NjesiaMatese");

                    b.Navigation("Partneri");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.StokuQmimiProduktit", b =>
                {
                    b.HasOne("FinanCareWebAPI.Models.Produkti", "Produkti")
                        .WithOne("StokuQmimiProduktit")
                        .HasForeignKey("FinanCareWebAPI.Models.StokuQmimiProduktit", "ProduktiID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Produkti");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.TeDhenatFaturat", b =>
                {
                    b.HasOne("FinanCareWebAPI.Models.Produkti", "Produkti")
                        .WithMany("TeDhenatFaturat")
                        .HasForeignKey("IDProduktit");

                    b.HasOne("FinanCareWebAPI.Models.Faturat", "Faturat")
                        .WithMany("TeDhenatFaturat")
                        .HasForeignKey("IDRegjistrimit")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Faturat");

                    b.Navigation("Produkti");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.TeDhenatPerdoruesit", b =>
                {
                    b.HasOne("FinanCareWebAPI.Models.Bankat", "Banka")
                        .WithMany()
                        .HasForeignKey("BankaID");

                    b.HasOne("FinanCareWebAPI.Models.Perdoruesi", "User")
                        .WithOne("TeDhenatPerdoruesit")
                        .HasForeignKey("FinanCareWebAPI.Models.TeDhenatPerdoruesit", "UserID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Banka");

                    b.Navigation("User");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.ZbritjaQmimitProduktit", b =>
                {
                    b.HasOne("FinanCareWebAPI.Models.Produkti", "Produkti")
                        .WithOne("ZbritjaQmimitProduktit")
                        .HasForeignKey("FinanCareWebAPI.Models.ZbritjaQmimitProduktit", "ProduktiID")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Produkti");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Faturat", b =>
                {
                    b.Navigation("TeDhenatFaturat");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.GrupiProduktit", b =>
                {
                    b.Navigation("Produkti");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.NjesiaMatese", b =>
                {
                    b.Navigation("Produkti");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Partneri", b =>
                {
                    b.Navigation("Faturat");

                    b.Navigation("Produkti");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Perdoruesi", b =>
                {
                    b.Navigation("Faturat");

                    b.Navigation("TeDhenatPerdoruesit");
                });

            modelBuilder.Entity("FinanCareWebAPI.Models.Produkti", b =>
                {
                    b.Navigation("StokuQmimiProduktit");

                    b.Navigation("TeDhenatFaturat");

                    b.Navigation("ZbritjaQmimitProduktit");
                });
#pragma warning restore 612, 618
        }
    }
}
