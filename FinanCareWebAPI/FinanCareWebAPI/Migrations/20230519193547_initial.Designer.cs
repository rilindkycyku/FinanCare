﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using FinanCareWebAPI.Models;

#nullable disable

namespace WebAPI.Migrations
{
    [DbContext(typeof(FinanCareDbContext))]
    [Migration("20230519193547_initial")]
    partial class initial
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "6.0.7")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

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

            modelBuilder.Entity("WebAPI.Models.ContactForm", b =>
                {
                    b.Property<int>("MesazhiId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("mesazhiID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("MesazhiId"));

                    b.Property<DateTime?>("DataDergeses")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("date")
                        .HasColumnName("dataDergeses")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<string>("Email")
                        .HasMaxLength(250)
                        .IsUnicode(false)
                        .HasColumnType("varchar(250)")
                        .HasColumnName("email");

                    b.Property<string>("Emri")
                        .HasMaxLength(250)
                        .IsUnicode(false)
                        .HasColumnType("varchar(250)")
                        .HasColumnName("emri");

                    b.Property<string>("Mesazhi")
                        .HasColumnType("text")
                        .HasColumnName("mesazhi");

                    b.Property<string>("Statusi")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(60)
                        .IsUnicode(false)
                        .HasColumnType("varchar(60)")
                        .HasColumnName("statusi")
                        .HasDefaultValueSql("('Mesazhi juaj eshte derguar tek Stafi')");

                    b.Property<int?>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("userID");

                    b.HasKey("MesazhiId")
                        .HasName("PK__ContactF__0E3F7CF3731C8CDE");

                    b.HasIndex("UserId");

                    b.ToTable("ContactForm", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.KategoriaProduktit", b =>
                {
                    b.Property<int>("KategoriaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("kategoriaID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("KategoriaId"));

                    b.Property<string>("LlojiKategoris")
                        .HasColumnType("text")
                        .HasColumnName("llojiKategoris");

                    b.Property<string>("PershkrimiKategoris")
                        .HasColumnType("text")
                        .HasColumnName("pershkrimiKategoris");

                    b.HasKey("KategoriaId")
                        .HasName("PK__Kategori__AC39DE2ACE8BCA8A");

                    b.ToTable("KategoriaProduktit", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.KodiZbritje", b =>
                {
                    b.Property<string>("Kodi")
                        .HasMaxLength(12)
                        .IsUnicode(false)
                        .HasColumnType("varchar(12)")
                        .HasColumnName("kodi");

                    b.Property<DateTime?>("DataKrijimit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasColumnName("dataKrijimit")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<int?>("IdProdukti")
                        .HasColumnType("int")
                        .HasColumnName("idProdukti");

                    b.Property<decimal?>("QmimiZbritjes")
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("qmimiZbritjes");

                    b.HasKey("Kodi")
                        .HasName("PK__KodiZbri__25A8748FB3E013A8");

                    b.HasIndex("IdProdukti");

                    b.ToTable("KodiZbritjes");
                });

            modelBuilder.Entity("WebAPI.Models.Kompanium", b =>
                {
                    b.Property<int>("KompaniaId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("kompaniaID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("KompaniaId"));

                    b.Property<string>("Adresa")
                        .HasMaxLength(40)
                        .IsUnicode(false)
                        .HasColumnType("varchar(40)")
                        .HasColumnName("adresa");

                    b.Property<string>("EmriKompanis")
                        .HasColumnType("text")
                        .HasColumnName("emriKompanis");

                    b.Property<string>("Logo")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(40)
                        .IsUnicode(false)
                        .HasColumnType("varchar(40)")
                        .HasColumnName("logo")
                        .HasDefaultValueSql("('kompaniPaFoto.png')");

                    b.HasKey("KompaniaId")
                        .HasName("PK__Kompania__2026D74DCB37AA9A");

                    b.ToTable("Kompania");
                });

            modelBuilder.Entity("WebAPI.Models.Perdoruesi", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("userID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserId"));

                    b.Property<int?>("Aksesi")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("aksesi")
                        .HasDefaultValueSql("((0))");

                    b.Property<string>("Email")
                        .HasMaxLength(30)
                        .IsUnicode(false)
                        .HasColumnType("varchar(30)")
                        .HasColumnName("email");

                    b.Property<string>("Emri")
                        .HasMaxLength(30)
                        .IsUnicode(false)
                        .HasColumnType("varchar(30)")
                        .HasColumnName("emri");

                    b.Property<string>("Mbiemri")
                        .HasMaxLength(30)
                        .IsUnicode(false)
                        .HasColumnType("varchar(30)")
                        .HasColumnName("mbiemri");

                    b.Property<string>("UserPw")
                        .HasMaxLength(70)
                        .IsUnicode(false)
                        .HasColumnType("varchar(70)")
                        .HasColumnName("userPW");

                    b.Property<string>("Username")
                        .HasMaxLength(20)
                        .IsUnicode(false)
                        .HasColumnType("varchar(20)")
                        .HasColumnName("username");

                    b.HasKey("UserId")
                        .HasName("PK__Perdorue__CB9A1CDFC4C4A0AA");

                    b.HasIndex(new[] { "Username" }, "UQ__Perdorue__F3DBC5728A6B6DAE")
                        .IsUnique()
                        .HasFilter("[username] IS NOT NULL");

                    b.ToTable("Perdoruesi", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.Porosit", b =>
                {
                    b.Property<int>("IdPorosia")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("idPorosia");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IdPorosia"));

                    b.Property<DateTime?>("DataPorosis")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("date")
                        .HasColumnName("dataPorosis")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<int?>("IdKlienti")
                        .HasColumnType("int")
                        .HasColumnName("idKlienti");

                    b.Property<string>("StatusiPorosis")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(30)
                        .IsUnicode(false)
                        .HasColumnType("varchar(30)")
                        .HasColumnName("statusiPorosis")
                        .HasDefaultValueSql("('Ne Procesim')");

                    b.Property<decimal?>("TotaliPorosis")
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("totaliPorosis");

                    b.HasKey("IdPorosia")
                        .HasName("PK__Porosit__A9F27D2AB271ADFC");

                    b.HasIndex("IdKlienti");

                    b.ToTable("Porosit", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.Produkti", b =>
                {
                    b.Property<int>("ProduktiId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("produktiID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ProduktiId"));

                    b.Property<string>("EmriProduktit")
                        .HasColumnType("text")
                        .HasColumnName("emriProduktit");

                    b.Property<string>("FotoProduktit")
                        .ValueGeneratedOnAdd()
                        .HasMaxLength(40)
                        .IsUnicode(false)
                        .HasColumnType("varchar(40)")
                        .HasColumnName("fotoProduktit")
                        .HasDefaultValueSql("('produktPaFoto.png')");

                    b.Property<int?>("KategoriaId")
                        .HasColumnType("int")
                        .HasColumnName("kategoriaID");

                    b.Property<int?>("KompaniaId")
                        .HasColumnType("int")
                        .HasColumnName("kompaniaID");

                    b.Property<string>("Pershkrimi")
                        .HasColumnType("text")
                        .HasColumnName("pershkrimi");

                    b.HasKey("ProduktiId")
                        .HasName("PK__Produkti__76A3DFCF91A50347");

                    b.HasIndex("KategoriaId");

                    b.HasIndex("KompaniaId");

                    b.ToTable("Produkti", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.RegjistrimiStokut", b =>
                {
                    b.Property<int>("IdRegjistrimit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("idRegjistrimit");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IdRegjistrimit"));

                    b.Property<DateTime?>("DataRegjistrimit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasColumnName("dataRegjistrimit")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<decimal?>("ShumaTotaleBlerese")
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("shumaTotaleBlerese");

                    b.Property<decimal?>("ShumaTotaleRegjistrimit")
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("shumaTotaleRegjistrimit");

                    b.Property<int?>("StafiId")
                        .HasColumnType("int")
                        .HasColumnName("stafiID");

                    b.Property<int?>("TotaliProdukteveRegjistruara")
                        .HasColumnType("int")
                        .HasColumnName("totaliProdukteveRegjistruara");

                    b.HasKey("IdRegjistrimit");

                    b.HasIndex("StafiId");

                    b.ToTable("RegjistrimiStokut", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.StokuQmimiProduktit", b =>
                {
                    b.Property<int>("ProduktiId")
                        .HasColumnType("int")
                        .HasColumnName("produktiID");

                    b.Property<DateTime?>("DataKrijimit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasColumnName("dataKrijimit")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<DateTime?>("DataPerditsimit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasColumnName("dataPerditsimit")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<decimal?>("QmimiBleres")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("qmimiBleres")
                        .HasDefaultValueSql("((0))");

                    b.Property<decimal?>("QmimiProduktit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("qmimiProduktit")
                        .HasDefaultValueSql("((0))");

                    b.Property<int?>("SasiaNeStok")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("sasiaNeStok")
                        .HasDefaultValueSql("((0))");

                    b.HasKey("ProduktiId")
                        .HasName("PK_StokuProduktit");

                    b.ToTable("StokuQmimiProduktit", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.TeDhenatEporosi", b =>
                {
                    b.Property<int>("IdDetajet")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("idDetajet");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IdDetajet"));

                    b.Property<int?>("IdPorosia")
                        .HasColumnType("int")
                        .HasColumnName("idPorosia");

                    b.Property<int?>("IdProdukti")
                        .HasColumnType("int")
                        .HasColumnName("idProdukti");

                    b.Property<string>("KodiZbritjes")
                        .HasMaxLength(12)
                        .IsUnicode(false)
                        .HasColumnType("varchar(12)")
                        .HasColumnName("kodiZbritjes");

                    b.Property<decimal?>("QmimiTotal")
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("qmimiTotal");

                    b.Property<int?>("SasiaPorositur")
                        .HasColumnType("int")
                        .HasColumnName("sasiaPorositur");

                    b.HasKey("IdDetajet")
                        .HasName("PK__TeDhenat__494F491F84D65D51");

                    b.HasIndex("IdPorosia");

                    b.HasIndex("IdProdukti");

                    b.HasIndex("KodiZbritjes");

                    b.ToTable("TeDhenatEPorosis", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.TeDhenatPerdoruesit", b =>
                {
                    b.Property<string>("UserId")
                        .HasMaxLength(450)
                        .HasColumnType("nvarchar(450)")
                        .HasColumnName("userID");

                    b.Property<string>("Adresa")
                        .HasMaxLength(40)
                        .IsUnicode(false)
                        .HasColumnType("varchar(40)")
                        .HasColumnName("adresa");

                    b.Property<string>("NrKontaktit")
                        .HasMaxLength(15)
                        .IsUnicode(false)
                        .HasColumnType("varchar(15)")
                        .HasColumnName("nrKontaktit");

                    b.Property<string>("Qyteti")
                        .HasMaxLength(20)
                        .IsUnicode(false)
                        .HasColumnType("varchar(20)")
                        .HasColumnName("qyteti");

                    b.Property<int?>("ZipKodi")
                        .HasColumnType("int")
                        .HasColumnName("zipKodi");

                    b.HasKey("UserId");

                    b.ToTable("TeDhenatPerdoruesit", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.TeDhenatRegjistrimit", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("id");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int?>("IdProduktit")
                        .HasColumnType("int")
                        .HasColumnName("idProduktit");

                    b.Property<int?>("IdRegjistrimit")
                        .HasColumnType("int")
                        .HasColumnName("idRegjistrimit");

                    b.Property<decimal?>("QmimiBleres")
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("qmimiBleres");

                    b.Property<decimal?>("QmimiShites")
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("qmimiShites");

                    b.Property<int?>("SasiaStokut")
                        .HasColumnType("int")
                        .HasColumnName("sasiaStokut");

                    b.HasKey("Id");

                    b.HasIndex("IdProduktit");

                    b.HasIndex("IdRegjistrimit");

                    b.ToTable("TeDhenatRegjistrimit", (string)null);
                });

            modelBuilder.Entity("WebAPI.Models.ZbritjaQmimitProduktit", b =>
                {
                    b.Property<int>("ProduktiId")
                        .HasColumnType("int")
                        .HasColumnName("produktiID");

                    b.Property<DateTime?>("DataSkadimit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasColumnName("dataSkadimit")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<DateTime?>("DataZbritjes")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasColumnName("dataZbritjes")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<decimal?>("QmimiMeZbritjeProduktit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("qmimiMeZbritjeProduktit")
                        .HasDefaultValueSql("((0))");

                    b.Property<decimal?>("QmimiPaZbritjeProduktit")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(18, 2)")
                        .HasColumnName("qmimiPaZbritjeProduktit")
                        .HasDefaultValueSql("((0))");

                    b.HasKey("ProduktiId");

                    b.ToTable("ZbritjaQmimitProduktit", (string)null);
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

            modelBuilder.Entity("WebAPI.Models.ContactForm", b =>
                {
                    b.HasOne("WebAPI.Models.Perdoruesi", "User")
                        .WithMany("ContactForms")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.SetNull)
                        .HasConstraintName("FK_ContactForm_Perdoruesi");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WebAPI.Models.KodiZbritje", b =>
                {
                    b.HasOne("WebAPI.Models.Produkti", "IdProduktiNavigation")
                        .WithMany("KodiZbritjes")
                        .HasForeignKey("IdProdukti")
                        .OnDelete(DeleteBehavior.SetNull)
                        .HasConstraintName("FK_KodiZbritjes_Produkti");

                    b.Navigation("IdProduktiNavigation");
                });

            modelBuilder.Entity("WebAPI.Models.Porosit", b =>
                {
                    b.HasOne("WebAPI.Models.Perdoruesi", "IdKlientiNavigation")
                        .WithMany("Porosits")
                        .HasForeignKey("IdKlienti")
                        .OnDelete(DeleteBehavior.SetNull)
                        .HasConstraintName("FK_Porosit_Klienti");

                    b.Navigation("IdKlientiNavigation");
                });

            modelBuilder.Entity("WebAPI.Models.Produkti", b =>
                {
                    b.HasOne("WebAPI.Models.KategoriaProduktit", "Kategoria")
                        .WithMany("Produktis")
                        .HasForeignKey("KategoriaId")
                        .OnDelete(DeleteBehavior.SetNull)
                        .HasConstraintName("FK_Produkti_Kategoria");

                    b.HasOne("WebAPI.Models.Kompanium", "Kompania")
                        .WithMany("Produktis")
                        .HasForeignKey("KompaniaId")
                        .OnDelete(DeleteBehavior.SetNull)
                        .HasConstraintName("FK_Produkti_Kompania");

                    b.Navigation("Kategoria");

                    b.Navigation("Kompania");
                });

            modelBuilder.Entity("WebAPI.Models.RegjistrimiStokut", b =>
                {
                    b.HasOne("WebAPI.Models.Perdoruesi", "Stafi")
                        .WithMany("RegjistrimiStokuts")
                        .HasForeignKey("StafiId")
                        .OnDelete(DeleteBehavior.SetNull)
                        .HasConstraintName("FK_Regjistrimi_Perdoruesi");

                    b.Navigation("Stafi");
                });

            modelBuilder.Entity("WebAPI.Models.StokuQmimiProduktit", b =>
                {
                    b.HasOne("WebAPI.Models.Produkti", "Produkti")
                        .WithOne("StokuQmimiProduktit")
                        .HasForeignKey("WebAPI.Models.StokuQmimiProduktit", "ProduktiId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Produkti");
                });

            modelBuilder.Entity("WebAPI.Models.TeDhenatEporosi", b =>
                {
                    b.HasOne("WebAPI.Models.Porosit", "IdPorosiaNavigation")
                        .WithMany("TeDhenatEporosis")
                        .HasForeignKey("IdPorosia")
                        .OnDelete(DeleteBehavior.Cascade)
                        .HasConstraintName("FK_TeDhenatPorosis_Porosia");

                    b.HasOne("WebAPI.Models.Produkti", "IdProduktiNavigation")
                        .WithMany("TeDhenatEporosis")
                        .HasForeignKey("IdProdukti")
                        .OnDelete(DeleteBehavior.SetNull)
                        .HasConstraintName("FK_TeDhenatPorosis_Produkti");

                    b.HasOne("WebAPI.Models.KodiZbritje", "KodiZbritjesNavigation")
                        .WithMany("TeDhenatEporosis")
                        .HasForeignKey("KodiZbritjes")
                        .HasConstraintName("FK_TeDhenatPorosis_KodiZbritjes");

                    b.Navigation("IdPorosiaNavigation");

                    b.Navigation("IdProduktiNavigation");

                    b.Navigation("KodiZbritjesNavigation");
                });

            modelBuilder.Entity("WebAPI.Models.TeDhenatRegjistrimit", b =>
                {
                    b.HasOne("WebAPI.Models.Produkti", "IdProduktitNavigation")
                        .WithMany("TeDhenatRegjistrimits")
                        .HasForeignKey("IdProduktit")
                        .OnDelete(DeleteBehavior.SetNull)
                        .HasConstraintName("FK_Produkti_TeDhenatRegjistrimit");

                    b.HasOne("WebAPI.Models.RegjistrimiStokut", "IdRegjistrimitNavigation")
                        .WithMany("TeDhenatRegjistrimits")
                        .HasForeignKey("IdRegjistrimit")
                        .OnDelete(DeleteBehavior.Cascade)
                        .HasConstraintName("FK_RegjistrimiStokut_TeDhenatRegjistrimit");

                    b.Navigation("IdProduktitNavigation");

                    b.Navigation("IdRegjistrimitNavigation");
                });

            modelBuilder.Entity("WebAPI.Models.ZbritjaQmimitProduktit", b =>
                {
                    b.HasOne("WebAPI.Models.Produkti", "Produkti")
                        .WithOne("ZbritjaQmimitProduktit")
                        .HasForeignKey("WebAPI.Models.ZbritjaQmimitProduktit", "ProduktiId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Produkti");
                });

            modelBuilder.Entity("WebAPI.Models.KategoriaProduktit", b =>
                {
                    b.Navigation("Produktis");
                });

            modelBuilder.Entity("WebAPI.Models.KodiZbritje", b =>
                {
                    b.Navigation("TeDhenatEporosis");
                });

            modelBuilder.Entity("WebAPI.Models.Kompanium", b =>
                {
                    b.Navigation("Produktis");
                });

            modelBuilder.Entity("WebAPI.Models.Perdoruesi", b =>
                {
                    b.Navigation("ContactForms");

                    b.Navigation("Porosits");

                    b.Navigation("RegjistrimiStokuts");
                });

            modelBuilder.Entity("WebAPI.Models.Porosit", b =>
                {
                    b.Navigation("TeDhenatEporosis");
                });

            modelBuilder.Entity("WebAPI.Models.Produkti", b =>
                {
                    b.Navigation("KodiZbritjes");

                    b.Navigation("StokuQmimiProduktit");

                    b.Navigation("TeDhenatEporosis");

                    b.Navigation("TeDhenatRegjistrimits");

                    b.Navigation("ZbritjaQmimitProduktit");
                });

            modelBuilder.Entity("WebAPI.Models.RegjistrimiStokut", b =>
                {
                    b.Navigation("TeDhenatRegjistrimits");
                });
#pragma warning restore 612, 618
        }
    }
}
