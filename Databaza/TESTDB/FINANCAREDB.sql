
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Bankat]') AND type in (N'U'))
DROP TABLE [dbo].[Bankat];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Kartelat]') AND type in (N'U'))
DROP TABLE [dbo].[Kartelat];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LlogaritEBiznesit]') AND type in (N'U'))
DROP TABLE [dbo].[LlogaritEBiznesit];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[HistoriaZbritjeveProduktit]') AND type in (N'U'))
DROP TABLE [dbo].[HistoriaZbritjeveProduktit];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[__EFMigrationsHistory]') AND type in (N'U'))
DROP TABLE [dbo].[__EFMigrationsHistory];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetRoles]') AND type in (N'U'))
DROP TABLE [dbo].[AspNetRoles];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND type in (N'U'))
DROP TABLE [dbo].[AspNetUsers];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GrupiProduktit]') AND type in (N'U'))
DROP TABLE [dbo].[GrupiProduktit];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NjesiaMatese]') AND type in (N'U'))
DROP TABLE [dbo].[NjesiaMatese];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Partneri]') AND type in (N'U'))
DROP TABLE [dbo].[Partneri];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TeDhenatBiznesit]') AND type in (N'U'))
DROP TABLE [dbo].[TeDhenatBiznesit];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetRoleClaims]') AND type in (N'U'))
DROP TABLE [dbo].[AspNetRoleClaims];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUserClaims]') AND type in (N'U'))
DROP TABLE [dbo].[AspNetUserClaims];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUserLogins]') AND type in (N'U'))
DROP TABLE [dbo].[AspNetUserLogins];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUserRoles]') AND type in (N'U'))
DROP TABLE [dbo].[AspNetUserRoles];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUserTokens]') AND type in (N'U'))
DROP TABLE [dbo].[AspNetUserTokens];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Perdoruesi]') AND type in (N'U'))
DROP TABLE [dbo].[Perdoruesi];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Produkti]') AND type in (N'U'))
DROP TABLE [dbo].[Produkti];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Faturat]') AND type in (N'U'))
DROP TABLE [dbo].[Faturat];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TeDhenatPerdoruesit]') AND type in (N'U'))
DROP TABLE [dbo].[TeDhenatPerdoruesit];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[StokuQmimiProduktit]') AND type in (N'U'))
DROP TABLE [dbo].[StokuQmimiProduktit];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ZbritjaQmimitProduktit]') AND type in (N'U'))
DROP TABLE [dbo].[ZbritjaQmimitProduktit];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TeDhenatFaturat]') AND type in (N'U'))
DROP TABLE [dbo].[TeDhenatFaturat];
CREATE TABLE [dbo].[Bankat] ( 
  [BankaID] INT IDENTITY NOT NULL,
  [EmriBankes] NVARCHAR(MAX) NULL,
  [LokacioniBankes] NVARCHAR(MAX) NULL,
  [isDeleted] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_Bankat] PRIMARY KEY ([BankaID])
);
CREATE TABLE [dbo].[Kartelat] ( 
  [IDKartela] INT IDENTITY NOT NULL,
  [KodiKartela] NVARCHAR(MAX) NULL,
  [LlojiKarteles] NVARCHAR(MAX) NULL,
  [Rabati] DECIMAL(18,2) NULL,
  [StafiID] INT NULL,
  [PartneriID] INT NULL,
  [DataKrijimit] DATETIME2 NULL,
  CONSTRAINT [PK_Kartelat] PRIMARY KEY ([IDKartela])
);
CREATE TABLE [dbo].[LlogaritEBiznesit] ( 
  [IDLlogariaBankare] INT IDENTITY NOT NULL,
  [NumriLlogaris] NVARCHAR(MAX) NULL,
  [AdresaBankes] NVARCHAR(MAX) NULL,
  [Valuta] NVARCHAR(MAX) NULL,
  [BankaID] INT NOT NULL,
  CONSTRAINT [PK_LlogaritEBiznesit] PRIMARY KEY ([IDLlogariaBankare])
);
CREATE TABLE [dbo].[HistoriaZbritjeveProduktit] ( 
  [HistoriaZbritjesProduktitID] INT IDENTITY NOT NULL,
  [ProduktiID] INT NOT NULL,
  [DataZbritjes] DATETIME2 NULL,
  [DataSkadimit] DATETIME2 NULL,
  [Rabati] DECIMAL(18,2) NULL,
  CONSTRAINT [PK_HistoriaZbritjeveProduktit] PRIMARY KEY ([HistoriaZbritjesProduktitID])
);
CREATE TABLE [dbo].[__EFMigrationsHistory] ( 
  [MigrationId] NVARCHAR(150) NOT NULL,
  [ProductVersion] NVARCHAR(32) NOT NULL,
  CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
);
CREATE TABLE [dbo].[AspNetRoles] ( 
  [Id] NVARCHAR(450) NOT NULL,
  [Name] NVARCHAR(256) NULL,
  [NormalizedName] NVARCHAR(256) NULL,
  [ConcurrencyStamp] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
CREATE TABLE [dbo].[AspNetUsers] ( 
  [Id] NVARCHAR(450) NOT NULL,
  [UserName] NVARCHAR(256) NULL,
  [NormalizedUserName] NVARCHAR(256) NULL,
  [Email] NVARCHAR(256) NULL,
  [NormalizedEmail] NVARCHAR(256) NULL,
  [EmailConfirmed] BIT NOT NULL,
  [PasswordHash] NVARCHAR(MAX) NULL,
  [SecurityStamp] NVARCHAR(MAX) NULL,
  [ConcurrencyStamp] NVARCHAR(MAX) NULL,
  [PhoneNumber] NVARCHAR(MAX) NULL,
  [PhoneNumberConfirmed] BIT NOT NULL,
  [TwoFactorEnabled] BIT NOT NULL,
  [LockoutEnd] DATETIMEOFFSET NULL,
  [LockoutEnabled] BIT NOT NULL,
  [AccessFailedCount] INT NOT NULL,
  CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
);
CREATE TABLE [dbo].[GrupiProduktit] ( 
  [IDGrupiProduktit] INT IDENTITY NOT NULL,
  [GrupiIProduktit] NVARCHAR(MAX) NOT NULL,
  [isDeleted] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_GrupiProduktit] PRIMARY KEY ([IDGrupiProduktit])
);
CREATE TABLE [dbo].[NjesiaMatese] ( 
  [IDNjesiaMatese] INT IDENTITY NOT NULL,
  [EmriNjesiaMatese] NVARCHAR(MAX) NULL,
  [isDeleted] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_NjesiaMatese] PRIMARY KEY ([IDNjesiaMatese])
);
CREATE TABLE [dbo].[Partneri] ( 
  [IDPartneri] INT IDENTITY NOT NULL,
  [EmriBiznesit] NVARCHAR(MAX) NULL,
  [NUI] NVARCHAR(MAX) NULL,
  [NRF] NVARCHAR(MAX) NULL,
  [TVSH] NVARCHAR(MAX) NULL,
  [Email] NVARCHAR(MAX) NULL,
  [Adresa] NVARCHAR(MAX) NULL,
  [NrKontaktit] NVARCHAR(MAX) NULL,
  [LlojiPartnerit] NVARCHAR(MAX) NULL,
  [ShkurtesaPartnerit] NVARCHAR(MAX) NULL,
  [isDeleted] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_Partneri] PRIMARY KEY ([IDPartneri])
);
CREATE TABLE [dbo].[TeDhenatBiznesit] ( 
  [IDTeDhenatBiznesit] INT IDENTITY NOT NULL,
  [EmriIBiznesit] NVARCHAR(MAX) NULL,
  [ShkurtesaEmritBiznesit] NVARCHAR(MAX) NULL,
  [NUI] INT NULL,
  [NF] INT NULL,
  [NrTVSH] INT NULL,
  [Adresa] NVARCHAR(MAX) NULL,
  [NrKontaktit] NVARCHAR(MAX) NULL,
  [Email] NVARCHAR(MAX) NULL,
  [Logo] NVARCHAR(MAX) NULL,
  [EmailDomain] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_TeDhenatBiznesit] PRIMARY KEY ([IDTeDhenatBiznesit])
);
CREATE TABLE [dbo].[AspNetRoleClaims] ( 
  [Id] INT IDENTITY NOT NULL,
  [RoleId] NVARCHAR(450) NOT NULL,
  [ClaimType] NVARCHAR(MAX) NULL,
  [ClaimValue] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id])
);
CREATE TABLE [dbo].[AspNetUserClaims] ( 
  [Id] INT IDENTITY NOT NULL,
  [UserId] NVARCHAR(450) NOT NULL,
  [ClaimType] NVARCHAR(MAX) NULL,
  [ClaimValue] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id])
);
CREATE TABLE [dbo].[AspNetUserLogins] ( 
  [LoginProvider] NVARCHAR(450) NOT NULL,
  [ProviderKey] NVARCHAR(450) NOT NULL,
  [ProviderDisplayName] NVARCHAR(MAX) NULL,
  [UserId] NVARCHAR(450) NOT NULL,
  CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey])
);
CREATE TABLE [dbo].[AspNetUserRoles] ( 
  [UserId] NVARCHAR(450) NOT NULL,
  [RoleId] NVARCHAR(450) NOT NULL,
  CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId])
);
CREATE TABLE [dbo].[AspNetUserTokens] ( 
  [UserId] NVARCHAR(450) NOT NULL,
  [LoginProvider] NVARCHAR(450) NOT NULL,
  [Name] NVARCHAR(450) NOT NULL,
  [Value] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name])
);
CREATE TABLE [dbo].[Perdoruesi] ( 
  [UserID] INT IDENTITY NOT NULL,
  [Emri] NVARCHAR(MAX) NULL,
  [Mbiemri] NVARCHAR(MAX) NULL,
  [Email] NVARCHAR(MAX) NULL,
  [Username] NVARCHAR(MAX) NULL,
  [AspNetUserID] NVARCHAR(450) NOT NULL,
  CONSTRAINT [PK_Perdoruesi] PRIMARY KEY ([UserID])
);
CREATE TABLE [dbo].[Produkti] ( 
  [ProduktiID] INT IDENTITY NOT NULL,
  [EmriProduktit] NVARCHAR(MAX) NULL,
  [IDPartneri] INT NULL,
  [IDNjesiaMatese] INT NULL,
  [Barkodi] NVARCHAR(MAX) NULL,
  [KodiProduktit] NVARCHAR(MAX) NULL,
  [LlojiTVSH] INT NULL,
  [IDGrupiProduktit] INT NULL,
  [SasiaShumices] DECIMAL(18,2) NULL,
  [isDeleted] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_Produkti] PRIMARY KEY ([ProduktiID])
);
CREATE TABLE [dbo].[Faturat] ( 
  [IDRegjistrimit] INT IDENTITY NOT NULL,
  [DataRegjistrimit] DATETIME2 NULL,
  [StafiID] INT NULL,
  [TotaliPaTVSH] DECIMAL(18,2) NULL,
  [TVSH] DECIMAL(18,2) NULL,
  [IDPartneri] INT NULL,
  [StatusiPageses] NVARCHAR(MAX) NULL,
  [LlojiPageses] NVARCHAR(MAX) NULL,
  [LlojiKalkulimit] NVARCHAR(MAX) NULL,
  [NrFatures] NVARCHAR(MAX) NULL,
  [StatusiKalkulimit] NVARCHAR(MAX) NULL,
  [PershkrimShtese] NVARCHAR(MAX) NULL,
  [Rabati] DECIMAL(18,2) NULL,
  [NrRendorFatures] INT NULL,
  [EshteFaturuarOferta] NVARCHAR(MAX) NULL,
  [IDBonusKartela] INT NULL,
  CONSTRAINT [PK_Faturat] PRIMARY KEY ([IDRegjistrimit])
);
CREATE TABLE [dbo].[TeDhenatPerdoruesit] ( 
  [UserID] INT NOT NULL,
  [NrKontaktit] NVARCHAR(MAX) NULL,
  [Adresa] NVARCHAR(MAX) NULL,
  [BankaID] INT NULL,
  [DataFillimitKontrates] DATETIME2 NULL,
  [DataMbarimitKontrates] DATETIME2 NULL,
  [Datelindja] DATETIME2 NULL,
  [EmailPrivat] NVARCHAR(MAX) NULL,
  [EshtePuntorAktive] NVARCHAR(MAX) NULL,
  [Kualifikimi] NVARCHAR(MAX) NULL,
  [NrPersonal] NVARCHAR(MAX) NULL,
  [NumriLlogarisBankare] NVARCHAR(MAX) NULL,
  [Paga] DECIMAL(18,2) NULL,
  [Profesioni] NVARCHAR(MAX) NULL,
  [Specializimi] NVARCHAR(MAX) NULL,
  CONSTRAINT [PK_TeDhenatPerdoruesit] PRIMARY KEY ([UserID])
);
CREATE TABLE [dbo].[StokuQmimiProduktit] ( 
  [ProduktiID] INT NOT NULL,
  [SasiaNeStok] DECIMAL(18,2) NULL,
  [QmimiBleres] DECIMAL(18,2) NULL,
  [QmimiProduktit] DECIMAL(18,2) NULL,
  [DataKrijimit] DATETIME2 NULL,
  [DataPerditsimit] DATETIME2 NULL,
  [QmimiMeShumic] DECIMAL(18,2) NULL,
  CONSTRAINT [PK_StokuQmimiProduktit] PRIMARY KEY ([ProduktiID])
);
CREATE TABLE [dbo].[ZbritjaQmimitProduktit] ( 
  [ProduktiID] INT NOT NULL,
  [DataZbritjes] DATETIME2 NULL,
  [DataSkadimit] DATETIME2 NULL,
  [Rabati] DECIMAL(18,2) NULL,
  CONSTRAINT [PK_ZbritjaQmimitProduktit] PRIMARY KEY ([ProduktiID])
);
CREATE TABLE [dbo].[TeDhenatFaturat] ( 
  [ID] INT IDENTITY NOT NULL,
  [IDRegjistrimit] INT NOT NULL CONSTRAINT [DF__TeDhenatF__IDReg__05D8E0BE] DEFAULT 0 ,
  [IDProduktit] INT NULL,
  [SasiaStokut] DECIMAL(18,2) NULL,
  [QmimiBleres] DECIMAL(18,2) NULL,
  [QmimiShites] DECIMAL(18,2) NULL,
  [QmimiShitesMeShumic] DECIMAL(18,2) NULL,
  [Rabati1] DECIMAL(18,2) NULL,
  [Rabati2] DECIMAL(18,2) NULL,
  [Rabati3] DECIMAL(18,2) NULL,
  CONSTRAINT [PK_TeDhenatFaturat] PRIMARY KEY ([ID])
);
CREATE UNIQUE INDEX [IX_Kartelat_PartneriID] 
ON [dbo].[Kartelat] (
  [PartneriID] ASC
)
WHERE ([PartneriID] IS NOT NULL);
CREATE INDEX [IX_Kartelat_StafiID] 
ON [dbo].[Kartelat] (
  [StafiID] ASC
)
WHERE ([StafiID] IS NOT NULL);
CREATE INDEX [IX_LlogaritEBiznesit_BankaID] 
ON [dbo].[LlogaritEBiznesit] (
  [BankaID] ASC
);
CREATE INDEX [IX_HistoriaZbritjeveProduktit_ProduktiID] 
ON [dbo].[HistoriaZbritjeveProduktit] (
  [ProduktiID] ASC
);
CREATE UNIQUE INDEX [RoleNameIndex] 
ON [dbo].[AspNetRoles] (
  [NormalizedName] ASC
)
WHERE ([NormalizedName] IS NOT NULL);
CREATE INDEX [EmailIndex] 
ON [dbo].[AspNetUsers] (
  [NormalizedEmail] ASC
);
CREATE UNIQUE INDEX [UserNameIndex] 
ON [dbo].[AspNetUsers] (
  [NormalizedUserName] ASC
)
WHERE ([NormalizedUserName] IS NOT NULL);
CREATE INDEX [IX_AspNetRoleClaims_RoleId] 
ON [dbo].[AspNetRoleClaims] (
  [RoleId] ASC
);
CREATE INDEX [IX_AspNetUserClaims_UserId] 
ON [dbo].[AspNetUserClaims] (
  [UserId] ASC
);
CREATE INDEX [IX_AspNetUserLogins_UserId] 
ON [dbo].[AspNetUserLogins] (
  [UserId] ASC
);
CREATE INDEX [IX_AspNetUserRoles_RoleId] 
ON [dbo].[AspNetUserRoles] (
  [RoleId] ASC
);
CREATE INDEX [IX_Perdoruesi_AspNetUserID] 
ON [dbo].[Perdoruesi] (
  [AspNetUserID] ASC
);
CREATE INDEX [IX_Produkti_IDGrupiProduktit] 
ON [dbo].[Produkti] (
  [IDGrupiProduktit] ASC
);
CREATE INDEX [IX_Produkti_IDNjesiaMatese] 
ON [dbo].[Produkti] (
  [IDNjesiaMatese] ASC
);
CREATE INDEX [IX_Produkti_IDPartneri] 
ON [dbo].[Produkti] (
  [IDPartneri] ASC
);
CREATE INDEX [IX_Faturat_IDPartneri] 
ON [dbo].[Faturat] (
  [IDPartneri] ASC
);
CREATE INDEX [IX_Faturat_StafiID] 
ON [dbo].[Faturat] (
  [StafiID] ASC
);
CREATE INDEX [IX_Faturat_IDBonusKartela] 
ON [dbo].[Faturat] (
  [IDBonusKartela] ASC
);
CREATE INDEX [IX_TeDhenatPerdoruesit_BankaID] 
ON [dbo].[TeDhenatPerdoruesit] (
  [BankaID] ASC
);
CREATE INDEX [IX_TeDhenatFaturat_IDProduktit] 
ON [dbo].[TeDhenatFaturat] (
  [IDProduktit] ASC
);
CREATE INDEX [IX_TeDhenatFaturat_IDRegjistrimit] 
ON [dbo].[TeDhenatFaturat] (
  [IDRegjistrimit] ASC
);
TRUNCATE TABLE [dbo].[Bankat];
TRUNCATE TABLE [dbo].[Kartelat];
TRUNCATE TABLE [dbo].[LlogaritEBiznesit];
TRUNCATE TABLE [dbo].[HistoriaZbritjeveProduktit];
TRUNCATE TABLE [dbo].[__EFMigrationsHistory];
TRUNCATE TABLE [dbo].[AspNetRoles];
TRUNCATE TABLE [dbo].[AspNetUsers];
TRUNCATE TABLE [dbo].[GrupiProduktit];
TRUNCATE TABLE [dbo].[NjesiaMatese];
TRUNCATE TABLE [dbo].[Partneri];
TRUNCATE TABLE [dbo].[TeDhenatBiznesit];
TRUNCATE TABLE [dbo].[AspNetRoleClaims];
TRUNCATE TABLE [dbo].[AspNetUserClaims];
TRUNCATE TABLE [dbo].[AspNetUserLogins];
TRUNCATE TABLE [dbo].[AspNetUserRoles];
TRUNCATE TABLE [dbo].[AspNetUserTokens];
TRUNCATE TABLE [dbo].[Perdoruesi];
TRUNCATE TABLE [dbo].[Produkti];
TRUNCATE TABLE [dbo].[Faturat];
TRUNCATE TABLE [dbo].[TeDhenatPerdoruesit];
TRUNCATE TABLE [dbo].[StokuQmimiProduktit];
TRUNCATE TABLE [dbo].[ZbritjaQmimitProduktit];
TRUNCATE TABLE [dbo].[TeDhenatFaturat];
SET IDENTITY_INSERT [dbo].[Bankat] ON;
INSERT INTO [dbo].[Bankat] ([BankaID], [EmriBankes], [LokacioniBankes], [isDeleted]) VALUES (1, 'NLB Banka SH. A.', 'Kombetare', 'false');
INSERT INTO [dbo].[Bankat] ([BankaID], [EmriBankes], [LokacioniBankes], [isDeleted]) VALUES (2, 'Raiffeisen Bank Kosovo', 'Kombetare', 'false');
INSERT INTO [dbo].[Bankat] ([BankaID], [EmriBankes], [LokacioniBankes], [isDeleted]) VALUES (3, 'Banka për Biznes', 'Kombetare', 'false');
INSERT INTO [dbo].[Bankat] ([BankaID], [EmriBankes], [LokacioniBankes], [isDeleted]) VALUES (4, 'Banka Ekonomike', 'Kombetare', 'false');
INSERT INTO [dbo].[Bankat] ([BankaID], [EmriBankes], [LokacioniBankes], [isDeleted]) VALUES (5, 'ProCredit Bank', 'Kombetare', 'false');
SET IDENTITY_INSERT [dbo].[Bankat] OFF;
SET IDENTITY_INSERT [dbo].[Kartelat] ON;
INSERT INTO [dbo].[Kartelat] ([IDKartela], [KodiKartela], [LlojiKarteles], [Rabati], [StafiID], [PartneriID], [DataKrijimit]) VALUES (1, 'M000009000001', 'Fshirje', NULL, 9, NULL, '1900-09-01T00:00:00.000Z');
INSERT INTO [dbo].[Kartelat] ([IDKartela], [KodiKartela], [LlojiKarteles], [Rabati], [StafiID], [PartneriID], [DataKrijimit]) VALUES (4, 'B000014000003', 'Bonus', 2, 9, 14, '2024-10-05T11:31:38.793Z');
INSERT INTO [dbo].[Kartelat] ([IDKartela], [KodiKartela], [LlojiKarteles], [Rabati], [StafiID], [PartneriID], [DataKrijimit]) VALUES (5, 'B000015000004', 'Bonus', 4, 9, 15, '2024-10-05T11:35:21.420Z');
SET IDENTITY_INSERT [dbo].[Kartelat] OFF;
SET IDENTITY_INSERT [dbo].[LlogaritEBiznesit] ON;
INSERT INTO [dbo].[LlogaritEBiznesit] ([IDLlogariaBankare], [NumriLlogaris], [AdresaBankes], [Valuta], [BankaID]) VALUES (1, '1290012345678900', 'P.A.', 'Euro', 4);
INSERT INTO [dbo].[LlogaritEBiznesit] ([IDLlogariaBankare], [NumriLlogaris], [AdresaBankes], [Valuta], [BankaID]) VALUES (2, '1290012345678900', 'P.A.', 'Dollar', 5);
INSERT INTO [dbo].[LlogaritEBiznesit] ([IDLlogariaBankare], [NumriLlogaris], [AdresaBankes], [Valuta], [BankaID]) VALUES (3, '1290012345678900', 'P.A.', 'Franga Zvicerane', 2);
SET IDENTITY_INSERT [dbo].[LlogaritEBiznesit] OFF;
SET IDENTITY_INSERT [dbo].[HistoriaZbritjeveProduktit] ON;
INSERT INTO [dbo].[HistoriaZbritjeveProduktit] ([HistoriaZbritjesProduktitID], [ProduktiID], [DataZbritjes], [DataSkadimit], [Rabati]) VALUES (0, 1, '2024-10-05T13:14:26.243Z', '2024-11-05T00:00:00.000Z', 6);
INSERT INTO [dbo].[HistoriaZbritjeveProduktit] ([HistoriaZbritjesProduktitID], [ProduktiID], [DataZbritjes], [DataSkadimit], [Rabati]) VALUES (1, 1, '2024-09-05T13:13:26.243Z', '2024-10-05T00:00:00.000Z', 2);
INSERT INTO [dbo].[HistoriaZbritjeveProduktit] ([HistoriaZbritjesProduktitID], [ProduktiID], [DataZbritjes], [DataSkadimit], [Rabati]) VALUES (2, 4, '2024-10-05T13:13:47.744Z', '2024-11-05T00:00:00.000Z', 6);
SET IDENTITY_INSERT [dbo].[HistoriaZbritjeveProduktit] OFF;
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240211172729_KrijimiIDatabazesMeEntityFramework', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240212104111_KrijimiIBankave', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240212210222_PerditesimeTekTeDhenatFaturaDheBankat', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240213145335_PerditesimeTekOfertimet', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240215213935_LargimiITabelaveTePaNevojshme', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240801121049_KrijimiKartelave', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240805094709_VendosjaBonusKartelesNeID', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240819001457_VendosjaEEmailDomanNeTeDhenatBiznesit', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240819004228_PerditesimiTeDhenatStafit', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240819004515_PerditesimiTeDhenatStafitLlogariaBankare', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240820064403_PerditesimiTeDhenatStafitAdresa', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240827075743_PerditesimiKartelave', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240827095106_PerditesimiBankave', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240827213648_PerditesimiEmritBankave', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240827214525_PerditesimiEmritBankaveEmriKey', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240903083507_KrijimiHistoraZbritjeveProduktit', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20240918211515_VendosjaIsDeletedNeDisaEntitete', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20241001220018_PerditesimeTekKartelat', '7.0.5');
INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ('20241001220230_Vendosja e te dhenave kryesore per sistemin', '7.0.5');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('514b7bb5-7733-4d1e-9920-c4556c87ad97', 'Financa', 'FINANCA', 'a12358d2-d691-46b5-a400-45f4e6561a5a');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('64e367f5-18d9-4e1e-b464-50c1b2f7ad37', 'Mbeshtetje e Klientit', 'MBESHTETJE E KLIENTIT', 'db64a094-025e-43d2-b1ff-6ecebafe23d2');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('66ac7eb5-abad-447e-81c6-2d333572c847', 'Qmimore', 'QMIMORE', 'a33a7870-8f7a-4d66-9c95-b3fac891f785');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('679d19c9-c4f9-42f3-855f-1435d0f4a201', 'Faturist', 'FATURIST', 'ccafbdee-b37b-489a-8eb6-783d3db05b0d');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('6fc1148e-60b4-495b-a5e0-6979dee73436', 'Puntor i Thjeshte', 'PUNTOR I THJESHTE', 'acb37c93-91f5-40cb-8908-36761ecdc400');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('730c0aed-158a-421e-9fe3-7354a4915b4c', 'Burime Njerzore', 'BURIME NJERZORE', '29cc6cdb-cd61-4ca4-b703-dd5a915a6cf0');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('a75a93f5-b3a5-4215-b983-2fd6234d3c8e', 'Komercialist', 'KOMERCIALIST', '70f4442e-f2c7-4bb1-ae83-0f6b85b1030a');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('a91804e4-cf30-44cf-8817-fac24f5faeae', 'Kalkulant', 'KALKULANT', '61f9183a-be56-4628-b365-9e275c2e961d');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('be4b8ef8-abf0-454c-852c-676cdab20e3b', 'User', 'USER', '264000ea-9d66-4686-b48b-e06165a906fc');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('db3dd60d-a159-4f85-a9a5-d1444ee1013d', 'Menaxher', 'MENAXHER', '3e215a86-6eeb-48a6-90d9-fe12a7a70f28');
INSERT INTO [dbo].[AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp]) VALUES ('ea70e8ed-81a0-4cbf-8726-93ca6fe59a23', 'Arkatar', 'ARKATAR', '34436c94-0d46-46ac-a9ac-64f62ac579b4');
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('1545403d-e285-4247-812d-2c7cd81c80f4', 'arkatar.arkatar', 'ARKATAR.ARKATAR', 'arkatar.arkatar@financare.com', 'ARKATAR.ARKATAR@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAENR/nFR3o0tT/SpbY54Co0WWoxWLv9Lzqsp/CGr9XdjZ/clq0QbQiiMZSR2zLbKYKQ==', 'HZSEG5KQF5AIXLALZZQBGBCZJJJ7QC6I', 'b49cbfdb-820c-4df2-a435-2d9e5a449bb8', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('7553cfb4-093e-428c-ae2f-68aea8b8767a', 'financa.financa', 'FINANCA.FINANCA', 'financa.financa@financare.com', 'FINANCA.FINANCA@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAEFtpleq07mtta7xasI6UD9vq6Y82J0GwYUnhzwLnGEJNEapjmUK4pOI2jeyyP0if1w==', 'JFUF2AFOE3VCHXH4ECOGJSXIFTPSWPQZ', '2bf6aee1-e6de-4a89-9d51-0e0bcdfbfb8d', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('8c3e98d7-f7cc-45c2-bf09-3bc3dfb89e5c', 'puntor.thjeshte', 'PUNTOR.THJESHTE', 'puntor.thjeshte@financare.com', 'PUNTOR.THJESHTE@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAELOnOPnFvOVJ0fzGbKdBj15kLvUgETtzgMHzKtnamff4n8pEUvRq2EAhxTbAkH6Y4w==', 'V2IS4SMJQ2BK4JCRGY2CFHBNHJ5MYBO3', '4fbfc099-f066-4c91-8051-c4e74c67403f', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('a62e8d51-48fa-44af-b70e-d9f3b01591e7', 'menaxher.menaxher', 'MENAXHER.MENAXHER', 'menaxher.menaxher@financare.com', 'MENAXHER.MENAXHER@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAEM787no6o/qmE0NxPpA8q8fD5wdkJnU4+cWHcMwC6o5v0rgSUh7fIEDVTf43OOjQSg==', 'ZFKAJS5CFYGKSYUSOGXEFPIGGIYPTVRL', 'dd3dbde5-a09d-4762-88e5-746630538f25', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('c8f9f05e-3d2f-407b-b082-f5405fd97d9c', 'mbeshtetje.klientit', 'MBESHTETJE.KLIENTIT', 'mbeshtetje.klientit@financare.com', 'MBESHTETJE.KLIENTIT@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAEGvIHxztRzV2W5xNIGLnBIdb4kplt+pKEAtPwRI3+weuudHWYeymXISHENZfcdN7Tg==', '7E5QTAGIXY7PXCEQZ4VLBTUOHLHIJDOT', '20fdcec7-a7b4-4022-9d3c-0a9c9e914225', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('d677de99-762e-430a-abee-0c48c6595b58', 'burime.njerzore', 'BURIME.NJERZORE', 'burime.njerzore@financare.com', 'BURIME.NJERZORE@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAEBCQGgM8DcQ3RZY8F3L6VJToDyHzB0KM7ET/S/h5+n6AwzENNzorSIwKcW/OEmTZFw==', 'YXNSR47VEH7WYWUDQYM3GXAIETXKGBZH', 'dfff55b5-da42-43c9-88e6-55ae80841b7b', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('d833b2ff-e681-4266-8c99-792c54a93ef1', 'komercialist.komercialist', 'KOMERCIALIST.KOMERCIALIST', 'komercialist.komercialist@financare.com', 'KOMERCIALIST.KOMERCIALIST@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAEOC5hPEvjUF7ToxB6T+Nd8bYONKgXR3VhUo+OGHCHUyBmOT4LZZZkuZqlifRQc2Z2w==', 'KWNR6BXX2MYNDZEQQICABNY6V2KGEISV', 'ba2cc0b6-be99-4229-96f5-3589942b858b', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('d8918bff-7926-456f-bec0-cf3356a62824', 'qmimore.qmimore', 'QMIMORE.QMIMORE', 'qmimore.qmimore@financare.com', 'QMIMORE.QMIMORE@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAEJlYRvbOR+Wra3z7s0yxDLBSuI9wMLf5TKUIOk5BsBGjnnkgZhvVFX2Ui6jsH7wRGQ==', '2C6FP5XXUUF2MUML6UVH6FSHQ7AH2KUG', 'afb80062-a616-48c2-89cf-76f42ebb0fe0', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('e3a0fcb7-296a-4458-aad5-ef1143205642', 'kalkulant.kalkulant', 'KALKULANT.KALKULANT', 'kalkulant.kalkulant@financare.com', 'KALKULANT.KALKULANT@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAEO5JlCd0RD33NUUMMt4GhizK3gCQkxj6ZZenZe4ljep1NGPt6plFO0MaXEzPFf9/rw==', 'JGAPOQDNFFHO5IBNNSSAHFWCEJRQFQA4', 'cdd454d6-6776-4ba6-a5e3-76e27bd363d3', '+38344123456', 0, 0, NULL, 1, 0);
INSERT INTO [dbo].[AspNetUsers] ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES ('f6c341aa-79e4-42fb-bcd1-be031b7d8357', 'faturist.faturist', 'FATURIST.FATURIST', 'faturist.faturist@financare.com', 'FATURIST.FATURIST@FINANCARE.COM', 0, 'AQAAAAEAACcQAAAAEGC2cHyofurlLcCUwVQlLlwyrEn/NkS3MBhlYVA2XgRh1/n/SwMxXTethQHoGQW/0g==', 'GYZYC76TVRDXGPQWIXWKX23IAYPCNKVM', '7b3dc7b0-9a5c-41a2-8bcd-078364773b8d', '+38344123456', 0, 0, NULL, 1, 0);
SET IDENTITY_INSERT [dbo].[GrupiProduktit] ON;
INSERT INTO [dbo].[GrupiProduktit] ([IDGrupiProduktit], [GrupiIProduktit], [isDeleted]) VALUES (1, 'Ushqimore', 'false');
INSERT INTO [dbo].[GrupiProduktit] ([IDGrupiProduktit], [GrupiIProduktit], [isDeleted]) VALUES (2, 'Plastika', 'false');
INSERT INTO [dbo].[GrupiProduktit] ([IDGrupiProduktit], [GrupiIProduktit], [isDeleted]) VALUES (3, 'Auto Kozmetik', 'false');
INSERT INTO [dbo].[GrupiProduktit] ([IDGrupiProduktit], [GrupiIProduktit], [isDeleted]) VALUES (4, 'Kozmetik', 'false');
INSERT INTO [dbo].[GrupiProduktit] ([IDGrupiProduktit], [GrupiIProduktit], [isDeleted]) VALUES (5, 'Higjen', 'false');
INSERT INTO [dbo].[GrupiProduktit] ([IDGrupiProduktit], [GrupiIProduktit], [isDeleted]) VALUES (6, 'Duhan', 'false');
INSERT INTO [dbo].[GrupiProduktit] ([IDGrupiProduktit], [GrupiIProduktit], [isDeleted]) VALUES (7, 'Bujqesore', 'false');
INSERT INTO [dbo].[GrupiProduktit] ([IDGrupiProduktit], [GrupiIProduktit], [isDeleted]) VALUES (8, 'Pije Alkolike', 'false');
SET IDENTITY_INSERT [dbo].[GrupiProduktit] OFF;
SET IDENTITY_INSERT [dbo].[NjesiaMatese] ON;
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (1, 'Bidon', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (2, 'Copë', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (3, 'Kg', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (4, 'Gr', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (5, 'Komplet', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (6, 'Litër', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (7, 'Pako', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (8, 'Set', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (9, 'Shtek', 'false');
INSERT INTO [dbo].[NjesiaMatese] ([IDNjesiaMatese], [EmriNjesiaMatese], [isDeleted]) VALUES (10, 'Thes', 'false');
SET IDENTITY_INSERT [dbo].[NjesiaMatese] OFF;
SET IDENTITY_INSERT [dbo].[Partneri] ON;
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (1, 'Bleres Qytetar', '112233445', '112233445', '112233445', 'info@financare.com', 'P.A., Prishtine, 10000 Kosove', '38344111222', 'B', 'BQ', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (2, 'Kthimi Mallit te Shitur', '112233445', '112233445', '112233445', 'info@financare.com', 'P.A., Prishtine, 10000 Kosove', '38344111222', 'F', 'KMSH', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (3, 'Asgjesim i Stokut', '112233445', '112233445', '112233445', 'info@financare.com', 'P.A., Prishtine, 10000 Kosove', '38344111222', 'F', 'AS', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (4, 'Passable SH.P.K.', '810497453', '0', '330051152', 'info@passable.com', 'Magjistralja Prishtine - Shkup KM. 4, Llapnaselle,Graqanic', '038501000', 'F', 'PSB', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (5, 'Meridian Corporation SH.P.K.', '810482521', '600117883', '330076978', 'meridian@meridian-ks.com', 'Rruga Hyrije Hana, p.n, Prishtinë', '+38349770350', 'F', 'MC', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (6, 'ALBI COMMERCE SH.P.K.', '810443424', '600245006', '330004515', NULL, 'Zona e Re Industriale - Veternik P.N., Prishtinë', '+38349771112', 'F', 'ALB', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (7, 'Elkos SH.P.K.', '810413584', '600052386', '330064668', 'ardita.sadiku@elkosgroup.com', 'Zahir Pajaziti, PN, Peje', '+38349772164', 'F', 'ELK', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (8, 'BUÇAJ SH.P.K.', '810535990', '600018221', '330019209', NULL, 'Magjistralja Prishtinë-Shkup ,km 10, Graçanicë', '049153114', 'F', 'BUC', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (9, 'MIGROS GROUP SH.P.K.', '810820771', '600875085', '330177742', NULL, 'Zona Industriale, Prishtinë', '044161940', 'F', 'MG', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (10, 'Pestova SH.P.K.', '810535081', '600161658', '330008179', NULL, 'Vushtrri, P.N.', NULL, 'F', 'PES', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (11, 'Magic Ice Joint Stock Company SH.A.', '810379471', '600133871', '330065898', NULL, 'Industrial Zone, Lipjan', NULL, 'F', 'MI', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (12, 'Kosmonte Foods SH.P.K.', '810828858', '600978582', '0', 'hr@kosmontefoods.com', 'Rruga Antenës, Fushë Kosovë', '+38349911912', 'F', 'KF', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (13, 'Kajmak SH.P.K.', '810596679', '600017710', '330071978', NULL, 'Prizren, P.N.', '044126560', 'F', 'KJM', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (14, 'BESA NJË SH.P.K.', '812085688', '0', '0', 'supermarketbesa1978@gmail.com', 'Rr. Agim Bajrami, P.N., Kaçanik', '+38344279504', 'B', 'BESA', 'false');
INSERT INTO [dbo].[Partneri] ([IDPartneri], [EmriBiznesit], [NUI], [NRF], [TVSH], [Email], [Adresa], [NrKontaktit], [LlojiPartnerit], [ShkurtesaPartnerit], [isDeleted]) VALUES (15, 'Rilind Kyçyku', '0', '0', '0', 'rilindkycyku@gmail.com', 'Komandant Zefi 69, Kaçanik', '+38343710410', 'B', 'RK', 'false');
SET IDENTITY_INSERT [dbo].[Partneri] OFF;
SET IDENTITY_INSERT [dbo].[TeDhenatBiznesit] ON;
INSERT INTO [dbo].[TeDhenatBiznesit] ([IDTeDhenatBiznesit], [EmriIBiznesit], [ShkurtesaEmritBiznesit], [NUI], [NF], [NrTVSH], [Adresa], [NrKontaktit], [Email], [Logo], [EmailDomain]) VALUES (1, 'FinanCare SH.P.K.', 'FC', 112233445, 112233445, 112233445, 'P.A., Prishtine, 10000 Kosove', '38344111222', 'info@financare.com', '3eab0d81e6ad4923ba72501e3db224db.png', 'financare.com');
SET IDENTITY_INSERT [dbo].[TeDhenatBiznesit] OFF;
SET IDENTITY_INSERT [dbo].[AspNetRoleClaims] ON;
SET IDENTITY_INSERT [dbo].[AspNetRoleClaims] OFF;
SET IDENTITY_INSERT [dbo].[AspNetUserClaims] ON;
SET IDENTITY_INSERT [dbo].[AspNetUserClaims] OFF;
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('7553cfb4-093e-428c-ae2f-68aea8b8767a', '514b7bb5-7733-4d1e-9920-c4556c87ad97');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('c8f9f05e-3d2f-407b-b082-f5405fd97d9c', '64e367f5-18d9-4e1e-b464-50c1b2f7ad37');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('d8918bff-7926-456f-bec0-cf3356a62824', '66ac7eb5-abad-447e-81c6-2d333572c847');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('f6c341aa-79e4-42fb-bcd1-be031b7d8357', '679d19c9-c4f9-42f3-855f-1435d0f4a201');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('8c3e98d7-f7cc-45c2-bf09-3bc3dfb89e5c', '6fc1148e-60b4-495b-a5e0-6979dee73436');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('d677de99-762e-430a-abee-0c48c6595b58', '730c0aed-158a-421e-9fe3-7354a4915b4c');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('d833b2ff-e681-4266-8c99-792c54a93ef1', 'a75a93f5-b3a5-4215-b983-2fd6234d3c8e');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('e3a0fcb7-296a-4458-aad5-ef1143205642', 'a91804e4-cf30-44cf-8817-fac24f5faeae');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('1545403d-e285-4247-812d-2c7cd81c80f4', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('7553cfb4-093e-428c-ae2f-68aea8b8767a', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('8c3e98d7-f7cc-45c2-bf09-3bc3dfb89e5c', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('a62e8d51-48fa-44af-b70e-d9f3b01591e7', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('c8f9f05e-3d2f-407b-b082-f5405fd97d9c', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('d677de99-762e-430a-abee-0c48c6595b58', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('d833b2ff-e681-4266-8c99-792c54a93ef1', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('d8918bff-7926-456f-bec0-cf3356a62824', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('e3a0fcb7-296a-4458-aad5-ef1143205642', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('f6c341aa-79e4-42fb-bcd1-be031b7d8357', 'be4b8ef8-abf0-454c-852c-676cdab20e3b');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('a62e8d51-48fa-44af-b70e-d9f3b01591e7', 'db3dd60d-a159-4f85-a9a5-d1444ee1013d');
INSERT INTO [dbo].[AspNetUserRoles] ([UserId], [RoleId]) VALUES ('1545403d-e285-4247-812d-2c7cd81c80f4', 'ea70e8ed-81a0-4cbf-8726-93ca6fe59a23');
SET IDENTITY_INSERT [dbo].[Perdoruesi] ON;
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (1, 'Financa', 'Financa', 'financa.financa@financare.com', 'financa.financa', '7553cfb4-093e-428c-ae2f-68aea8b8767a');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (2, 'Mbeshtetje', 'Klientit', 'mbeshtetje.klientit@financare.com', 'mbeshtetje.klientit', 'c8f9f05e-3d2f-407b-b082-f5405fd97d9c');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (3, 'Qmimore', 'Qmimore', 'qmimore.qmimore@financare.com', 'qmimore.qmimore', 'd8918bff-7926-456f-bec0-cf3356a62824');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (4, 'Faturist', 'Faturist', 'faturist.faturist@financare.com', 'faturist.faturist', 'f6c341aa-79e4-42fb-bcd1-be031b7d8357');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (5, 'Puntor', 'Thjeshte', 'puntor.thjeshte@financare.com', 'puntor.thjeshte', '8c3e98d7-f7cc-45c2-bf09-3bc3dfb89e5c');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (6, 'Burime', 'Njerzore', 'burime.njerzore@financare.com', 'burime.njerzore', 'd677de99-762e-430a-abee-0c48c6595b58');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (7, 'Komercialist', 'Komercialist', 'komercialist.komercialist@financare.com', 'komercialist.komercialist', 'd833b2ff-e681-4266-8c99-792c54a93ef1');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (8, 'Kalkulant', 'Kalkulant', 'kalkulant.kalkulant@financare.com', 'kalkulant.kalkulant', 'e3a0fcb7-296a-4458-aad5-ef1143205642');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (9, 'Menaxher', 'Menaxher', 'menaxher.menaxher@financare.com', 'menaxher.menaxher', 'a62e8d51-48fa-44af-b70e-d9f3b01591e7');
INSERT INTO [dbo].[Perdoruesi] ([UserID], [Emri], [Mbiemri], [Email], [Username], [AspNetUserID]) VALUES (10, 'Arkatar', 'Arkatar', 'arkatar.arkatar@financare.com', 'arkatar.arkatar', '1545403d-e285-4247-812d-2c7cd81c80f4');
SET IDENTITY_INSERT [dbo].[Perdoruesi] OFF;
SET IDENTITY_INSERT [dbo].[Produkti] ON;
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (1, 'STR8 Deo Rise 150ml', 4, 2, '5201314107231', 'PSB0001', 18, 5, 6, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (2, 'STR8 Deo FR34K 150ml', 4, 2, '5201314145073', 'PSB0002', 18, 5, 6, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (3, 'STR8 Deo Original150ml LF', 4, 2, '5201314153542', 'PSB0003', 18, 5, 6, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (4, 'STR8 Deo Original 150ml LF', 4, 2, '5201314153573', 'PSB0004', 18, 5, 6, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (5, 'STR8 Deo Spray Game 150ml 23', 4, 2, '5201314170457', 'PSB0005', 18, 5, 6, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (6, 'Xtreme3 Myl Comfort 12''s Tear Strip', 4, 2, '4027800319107', 'PSB0006', 18, 5, 12, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (7, 'Vanille 5+1 8g Dr. Oetker', 4, 2, '5997381367240', 'PSB0007', 18, 1, 56, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (8, 'Puding Vanilla 38gr Dr. Oetker', 4, 2, '5997381312363', 'PSB0008', 18, 1, 30, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (9, 'Beer Tuborg 0.5L', 5, 2, '3890000508180', 'MC0001', 18, 8, 12, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (10, 'Lezita Chicken Nugget 500gr', 5, 2, '8696425017796', 'MC0003', 18, 1, 24, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (11, 'Lezita Chicken Nugget 1KG', 5, 2, '8696425017789', 'MC0002', 18, 1, 12, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (12, 'GULLON Biskota me Fruta 300gr', 6, 2, '841037640425', 'ALB0005', 18, 1, 16, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (13, 'HOPLA pa sheqel 1L', 6, 2, '8000005430019', 'ALB0005', 18, 1, 12, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (14, 'FRONDI maxi limon 250gr', 6, 2, '3850102002283', 'ALB0005', 18, 1, 24, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (15, 'ALBRED Slim Tea Acai Berry', 6, 2, '3904424231251', 'ALB0004', 18, 1, 30, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (16, 'ALBRED Slim Tea Blueberry', 6, 2, '3904434241268', 'ALB0005', 18, 1, 30, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (17, 'Mish pule pjek Kotanyi 40g', 9, 2, '9001414501696', 'MG0001', 18, 1, 25, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (18, 'Vaj luledielli 1/1 Zvijezda', 9, 2, '3858882219617', 'MG0002', 8, 1, 15, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (19, 'Hudhra Kotanyi 70g', 9, 2, '9001414502129', 'MG0003', 18, 1, 4, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (20, 'Mish pule pjek Kotanyi 110g', 9, 2, '9001414502167', 'MG0004', 18, 1, 4, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (21, 'Chips Classic 130g', 10, 2, '3902634650637', 'PES0001', 18, 1, 12, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (22, 'Chips Ribbed Ketchup 130g', 10, 2, '3902634650095', 'PES0002', 18, 1, 12, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (23, 'Schmand Magic Ice 400gr 18%', 11, 2, '3901470400956', 'MI0001', 8, 1, 12, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (24, 'Schmand Magic Ice 180gr 18%', 11, 2, '3901470400963', 'MI0002', 8, 1, 20, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (25, 'Perutnina copeza pule 400gr', 12, 2, '3838977041460', 'KF0001', 18, 1, 14, 'false');
INSERT INTO [dbo].[Produkti] ([ProduktiID], [EmriProduktit], [IDPartneri], [IDNjesiaMatese], [Barkodi], [KodiProduktit], [LlojiTVSH], [IDGrupiProduktit], [SasiaShumices], [isDeleted]) VALUES (26, 'Perutnina stejk pule 900gr', 12, 2, '3838977019704', 'KF0002', 18, 1, 8, 'false');
SET IDENTITY_INSERT [dbo].[Produkti] OFF;
SET IDENTITY_INSERT [dbo].[Faturat] ON;
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (1, '2024-09-06T00:00:00.000Z', 9, 160.42, 28.88, 4, 'E Paguar', 'Cash', 'HYRJE', 'PSI-24-0011724', 'true', N'Tot - TVSH: 160.36€, TVSH: 28.86€, Tot Fat: 189.22€', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (2, '2024-09-06T00:00:00.000Z', 9, 189.3, 0, 4, 'E Paguar', 'Cash', 'PAGES', 'PAGES-PSI-24-0011724', 'true', 'Pagese per Faturen: PSI-24-0011724', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (3, '2024-09-02T00:00:00.000Z', 9, 90.78, 16.34, 5, 'Pa Paguar', 'Borxh', 'HYRJE', '24033692', 'true', N'Tot - TVSH: 90.81€, TVSH: 16.35€, Tot Fat: 107.16€', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (4, '2024-09-02T00:00:00.000Z', 9, 190.48, 34.29, 6, 'Pa Paguar', 'Borxh', 'HYRJE', 'P-M-240902-364519', 'true', N'Tot - TVSH: 203.19€, TVSH: 36.57€, Tot Fat: 239.76€', 0, 3, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (5, '2024-09-02T00:00:00.000Z', 9, 101.08, 18.2, 6, 'Pa Paguar', 'Borxh', 'HYRJE', 'P-M-240902-364796', 'false', N'Tot - TVSH: 144.41€, TVSH: 25.99€, Tot Fat: 170.40€', 0, 4, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (6, '2024-09-05T00:00:00.000Z', 9, 112.7, 12.2, 9, 'Pa Paguar', 'Borxh', 'HYRJE', '24-PF1-M112-501954', 'true', N'Tot - TVSH: 121.97€, TVSH: 12.30€, Tot Fat: 134.27€', 0, 5, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (7, '2024-09-05T00:00:00.000Z', 9, 100.25, 18.05, 10, 'Pa Paguar', 'Borxh', 'HYRJE', 'pes018060910', 'true', N'Tot - TVSH: 94.58€, TVSH: 17.02€, Tot Fat: 111.60€', 0, 6, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (8, '2024-09-05T00:00:00.000Z', 9, 25.93, 2.07, 11, 'Pa Paguar', 'Borxh', 'HYRJE', '24-SHV01-L01-17130', 'true', N'Tot - TVSH: 25.93€, TVSH: 2.07€, Tot Fat: 28.00€', 0, 7, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (9, '2025-09-07T00:00:00.000Z', 9, 72.29, 13.01, 12, 'Pa Paguar', 'Borxh', 'HYRJE', '302-82/6347', 'false', N'Tot - TVSH: 0.00€, TVSH: 0.00€, Tot Fat: 0.00€', 0, 8, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (10, '2024-10-04T00:00:00.000Z', 9, 120, 17.23, 8, 'Pa Paguar', 'Borxh', 'HYRJE', 'DSD-FE1-BQK1231', 'false', N'Tot - TVSH: 0.00€, TVSH: 0.00€, Tot Fat: 0.00€', 0, 9, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (14, '2024-10-05T10:59:59.489Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PARAGON', '051024-9-1', 'false', '', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (15, '2024-10-05T00:00:00.000Z', 9, -13.54, -2.44, 5, 'E Paguar', 'Cash', 'KMB', '1', 'true', '24033692', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (17, '2024-10-05T12:14:24.795Z', 7, 133.8, 20.47, 14, 'E Paguar', 'Cash', 'OFERTE', '1', 'true', '', 3.81, 1, 'true', 4);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (18, '2024-10-05T12:14:24.795Z', 7, 133.8, 20.47, 14, 'Pa Paguar', 'Cash', 'FAT', '1', 'true', ' Referenti: komercialist.komercialist, Nr. Ofertes: FC-051024-OFERTE-1', 3.81, 1, 'false', 4);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (19, '2024-10-05T12:20:36.583Z', 4, -36.91, -8.1, 14, 'E Paguar', 'Cash', 'FL', '1', 'true', 'Flete Lejimi per munges malli, Vlene per Faturen Nr: <strong>FC-051024-FAT-1</strong>', -0.92, 1, 'false', 4);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (23, '2024-10-05T13:04:53.995Z', 10, 6.66, 1.2, 15, 'E Paguar', 'Borxh', 'PARAGON', '051024-10-1', 'true', '', 0.33, 1, 'false', 5);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (24, '2024-10-05T13:07:26.881Z', 10, 5.27, 0.88, 1, 'E Paguar', 'Cash', 'PARAGON', '051024-10-2', 'true', '', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (25, '2024-10-05T13:07:59.120Z', 10, 8.53, 1.54, 15, 'E Paguar', 'Banke', 'PARAGON', '051024-10-3', 'true', '', 0.42, 3, 'false', 5);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (26, '2024-10-05T13:07:59.120Z', 10, 9.65, 0, 15, 'E Paguar', 'Banke', 'PAGES', 'PAGES-051024-10-3', 'true', ' Pagese per Faturen: 051024-10-3', 0, 4, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (27, '2024-10-05T13:08:11.250Z', 10, 0, 0, 1, 'E Paguar', 'Cash', 'PARAGON', '051024-10-4', 'false', '', 0, 4, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (28, '2024-10-05T00:00:00.000Z', 10, 6.73, 1.21, 1, 'E Paguar', 'Cash', 'KMSH', '', 'true', '', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (29, '2024-10-05T13:11:48.996Z', 9, 7.53, 0, 15, 'E Paguar', 'Cash', 'PAGES', NULL, 'true', 'Pagesa e Borgjit', 0, 0, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (30, '2024-10-05T00:00:00.000Z', 9, -3.19, -0.57, 3, 'E Paguar', 'Cash', 'AS', '1', 'true', '', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (37, '2024-10-06T00:44:58.255Z', 9, 5.01, 0.83, 1, 'E Paguar', 'Cash', 'PARAGON', '061024-9-1', 'true', '', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (38, '2024-10-06T00:46:33.136Z', 9, 3.66, 0.66, 15, 'E Paguar', 'Cash', 'PARAGON', '061024-9-2', 'false', '', 0.18, 2, 'false', 5);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (42, '2024-10-07T02:04:54.322Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PARAGON', '071024-9-1', 'false', '', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (43, '2025-02-25T19:26:49.345Z', 9, 12.94, 2.33, 1, 'E Paguar', 'Cash', 'PARAGON', '250225-9-1', 'true', '', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (44, '2025-02-25T19:27:28.261Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PARAGON', '250225-9-2', 'false', '', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (46, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'KLFV', '1/2025', 'true', N'Tot - TVSH: 85.91€, TVSH: 15.46€, Tot Fat: 101.37€', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (47, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (48, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (49, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (50, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (51, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (52, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (53, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (54, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (55, '2025-03-01T01:49:09.348Z', 9, 1.31, 0.24, 1, 'E Paguar', 'Cash', 'PARAGON', '010325-9-1', 'false', '', 0, 1, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (56, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (57, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (58, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (59, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
INSERT INTO [dbo].[Faturat] ([IDRegjistrimit], [DataRegjistrimit], [StafiID], [TotaliPaTVSH], [TVSH], [IDPartneri], [StatusiPageses], [LlojiPageses], [LlojiKalkulimit], [NrFatures], [StatusiKalkulimit], [PershkrimShtese], [Rabati], [NrRendorFatures], [EshteFaturuarOferta], [IDBonusKartela]) VALUES (60, '2025-02-26T00:00:00.000Z', 9, 0, 0, 1, 'E Paguar', 'Cash', 'PAGES', 'PAGES-1/2025', 'true', 'Pagese per Faturen: 1/2025', 0, 2, 'false', NULL);
SET IDENTITY_INSERT [dbo].[Faturat] OFF;
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (1, '+38344123456', 'P.A.', 4, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (2, '+38344123456', 'P.A.', 1, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (3, '+38344123456', 'P.A.', 5, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (4, '+38344123456', 'P.A.', 5, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (5, '+38344123456', 'P.A.', 2, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (6, '+38344123456', 'P.A.', 3, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (7, '+38344123456', 'P.A.', 2, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (8, '+38344123456', 'P.A.', 4, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (9, '+38344123456', 'P.A.', 3, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[TeDhenatPerdoruesit] ([UserID], [NrKontaktit], [Adresa], [BankaID], [DataFillimitKontrates], [DataMbarimitKontrates], [Datelindja], [EmailPrivat], [EshtePuntorAktive], [Kualifikimi], [NrPersonal], [NumriLlogarisBankare], [Paga], [Profesioni], [Specializimi]) VALUES (10, '+38344123456', 'P.A.', 3, '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', '1900-09-01T00:00:00.000Z', 'email@domain.com', 'true', 'P.K.', '1122334455', '1290012345678900', 99999.99, 'P.P.', 'P.S.');
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (1, 12, 2.39, 3.25, '2024-10-03T11:56:02.006Z', '2024-10-04T00:22:08.967Z', 3.25);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (2, 12, 2.39, 3.25, '2024-10-03T11:57:01.277Z', '2024-10-04T00:22:08.956Z', 3.25);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (3, 12, 2.39, 3.25, '2024-10-03T11:59:25.849Z', '2024-10-04T00:22:08.944Z', 3.25);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (4, 12, 2.39, 3.25, '2024-10-03T12:00:05.983Z', '2024-10-04T00:22:08.930Z', 3.25);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (5, 10, 2.39, 3.25, '2024-10-03T12:00:52.936Z', '2024-10-07T02:01:49.840Z', 3.25);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (6, 24, 1.13, 1.49, '2024-10-03T12:03:59.364Z', '2024-10-04T00:22:08.902Z', 1.49);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (7, 56, 0.6, 0.79, '2024-10-03T12:06:02.958Z', '2024-10-04T00:22:08.890Z', 0.79);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (8, 30, 0.3, 0.39, '2024-10-03T12:08:20.857Z', '2024-10-04T00:22:08.874Z', 0.39);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (9, 8, 0.94, 1.25, '2024-10-03T12:09:33.641Z', '2024-10-05T13:22:50.400Z', 1.2);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (10, 20, 2.01, 2.59, '2024-10-03T12:10:24.582Z', '2024-10-05T11:19:28.893Z', 2.59);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (11, -4, 3.97, 5.09, '2024-10-03T12:10:59.833Z', '2025-02-25T19:27:27.576Z', 5.09);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (12, 32, 1.35, 1.8, '2024-10-03T12:14:01.247Z', '2024-10-04T23:35:38.413Z', 1.8);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (13, 48, 3.22, 4.19, '2024-10-03T12:14:42.083Z', '2024-10-04T23:35:38.397Z', 4.19);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (14, 24, 1.75, 2.25, '2024-10-03T12:15:21.264Z', '2024-10-04T23:35:38.371Z', 2.25);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (15, 0, 0, 0, '2024-10-03T12:16:07.403Z', '2024-10-03T12:16:07.403Z', 0);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (16, 0, 0, 0, '2024-10-03T23:51:27.907Z', '2024-10-03T23:51:27.908Z', 0);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (17, 9, 0.74, 0.95, '2024-10-03T23:54:03.114Z', '2024-10-05T13:07:26.058Z', 0.95);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (18, 55, 1.39, 1.65, '2024-10-03T23:54:46.533Z', '2024-10-05T12:20:11.877Z', 1.65);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (19, 1, 1.67, 2.15, '2024-10-03T23:55:21.851Z', '2024-10-05T13:08:10.480Z', 2.15);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (20, 4, 1.21, 1.55, '2024-10-03T23:56:16.928Z', '2024-10-04T23:45:29.172Z', 1.55);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (21, 60, 0.93, 1.19, '2024-10-03T23:57:50.810Z', '2024-10-04T23:51:53.952Z', 1.19);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (22, 60, 0.93, 1.19, '2024-10-03T23:59:36.878Z', '2024-10-04T23:51:53.934Z', 1.19);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (23, 12, 1.3, 1.55, '2024-10-04T00:01:10.550Z', '2024-10-04T23:55:48.812Z', 1.55);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (24, 8, 0.62, 0.75, '2024-10-04T00:02:04.565Z', '2024-10-06T00:46:32.111Z', 0.75);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (25, 0, 0, 0, '2024-10-04T00:03:15.374Z', '2024-10-04T00:03:15.374Z', 0);
INSERT INTO [dbo].[StokuQmimiProduktit] ([ProduktiID], [SasiaNeStok], [QmimiBleres], [QmimiProduktit], [DataKrijimit], [DataPerditsimit], [QmimiMeShumic]) VALUES (26, 0, 0, 0, '2024-10-04T00:03:53.824Z', '2024-10-04T00:03:53.824Z', 0);
INSERT INTO [dbo].[ZbritjaQmimitProduktit] ([ProduktiID], [DataZbritjes], [DataSkadimit], [Rabati]) VALUES (1, '2024-10-05T13:13:26.243Z', '2024-11-05T00:00:00.000Z', 6);
INSERT INTO [dbo].[ZbritjaQmimitProduktit] ([ProduktiID], [DataZbritjes], [DataSkadimit], [Rabati]) VALUES (4, '2024-10-05T13:13:47.744Z', '2024-11-05T00:00:00.000Z', 6);
SET IDENTITY_INSERT [dbo].[TeDhenatFaturat] ON;
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (1, 1, 1, 12, 2.39, 3.25, 3.25, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (2, 1, 2, 12, 2.39, 3.25, 3.25, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (4, 1, 3, 12, 2.39, 3.25, 3.25, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (5, 1, 4, 12, 2.39, 3.25, 3.25, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (6, 1, 5, 2, 2.39, 3.25, 3.25, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (7, 1, 6, 24, 1.13, 1.49, 1.49, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (8, 1, 7, 56, 0.6, 0.79, 0.79, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (9, 1, 8, 30, 0.3, 0.39, 0.39, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (10, 3, 9, 12, 0.94, 1.25, 1.2, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (12, 3, 10, 24, 2.01, 2.59, 2.59, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (14, 3, 11, 12, 3.97, 5.09, 5.09, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (15, 4, 12, 32, 1.35, 1.8, 1.8, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (16, 4, 13, 48, 3.22, 4.19, 4.19, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (17, 4, 14, 24, 1.75, 2.25, 2.25, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (19, 5, 16, 60, 1.42, 1.85, 1.85, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (20, 5, 15, 60, 1.42, 1.85, 1.85, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (21, 6, 17, 25, 0.74, 0.95, 0.95, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (22, 6, 18, 75, 1.39, 1.65, 1.65, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (23, 6, 19, 4, 1.67, 2.15, 2.15, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (24, 6, 20, 4, 1.21, 1.55, 1.55, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (25, 7, 21, 60, 0.93, 1.19, 1.19, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (26, 7, 22, 60, 0.93, 1.19, 1.19, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (27, 8, 24, 20, 0.62, 0.75, 0.75, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (28, 8, 23, 12, 1.3, 1.55, 1.55, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (30, 15, 11, 2, -3.97, 5.09, 5.09, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (31, 15, 10, 4, -2.01, 2.59, 2.59, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (34, 17, 5, 13, 2.39, 3.25, 3.25, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (35, 17, 11, 12, 3.97, 5.09, 5.09, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (36, 17, 17, 15, 0.74, 0.95, 0.95, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (37, 17, 24, 10, 0.62, 0.75, 0.75, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (38, 17, 18, 20, 1.39, 1.65, 1.65, 0, 2, 2);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (39, 18, 18, 20, 1.39, 1.65, 1.65, 0, 2, 2);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (40, 18, 24, 10, 0.62, 0.75, 0.75, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (41, 18, 17, 15, 0.74, 0.95, 0.95, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (42, 18, 11, 12, 3.97, 5.09, 5.09, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (43, 18, 5, 13, 2.39, 3.25, 3.25, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (44, 19, 11, 2, 3.97, -5.09, 5.09, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (45, 19, 5, 11, 2.39, -3.25, 3.25, 0, 2, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (47, 23, 11, 1, 0, 5.09, 5.09, 0, 4, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (48, 23, 19, 1, 0, 2.15, 2.15, 0, 4, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (49, 23, 17, 1, 0, 0.95, 0.95, 0, 4, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (50, 24, 5, 1, 0, 3.25, 3.25, NULL, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (51, 24, 19, 1, 0, 2.15, 2.15, NULL, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (52, 24, 24, 1, 0, 0.75, 0.75, NULL, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (53, 25, 11, 1, 0, 5.09, 5.09, 0, 4, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (54, 25, 5, 1, 0, 3.25, 3.25, 0, 4, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (55, 25, 19, 1, 0, 2.15, 2.15, 0, 4, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (56, 28, 11, 2, 3.97, 5.09, 5.09, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (57, 30, 9, 4, -0.94, 1.25, 1.2, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (65, 37, 11, 1, 0, 5.09, 5.09, NULL, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (66, 37, 24, 1, 0, 0.75, 0.75, NULL, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (67, 38, 5, 1, 0, 3.25, 3.25, 0, 4, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (68, 38, 9, 1, 0, 1.25, 1.2, 0, 4, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (69, 43, 11, 3, 0, 5.09, 5.09, NULL, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (87, 55, 20, 1, 0, 1.55, 1.55, NULL, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (88, 46, 11, 12, 3.97, 5.09, 5.09, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (89, 46, 19, 15, 1.67, 2.15, 2.15, 0, 0, 0);
INSERT INTO [dbo].[TeDhenatFaturat] ([ID], [IDRegjistrimit], [IDProduktit], [SasiaStokut], [QmimiBleres], [QmimiShites], [QmimiShitesMeShumic], [Rabati1], [Rabati2], [Rabati3]) VALUES (90, 46, 3, 12, 2.39, 3.25, 3.25, 0, 0, 0);
SET IDENTITY_INSERT [dbo].[TeDhenatFaturat] OFF;
ALTER TABLE [dbo].[Kartelat] ADD CONSTRAINT [FK_Kartelat_Partneri_PartneriID] FOREIGN KEY ([PartneriID]) REFERENCES [dbo].[Partneri] ([IDPartneri]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Kartelat] ADD CONSTRAINT [FK_Kartelat_Perdoruesi_StafiID] FOREIGN KEY ([StafiID]) REFERENCES [dbo].[Perdoruesi] ([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[LlogaritEBiznesit] ADD CONSTRAINT [FK_LlogaritEBiznesit_Bankat_BankaID] FOREIGN KEY ([BankaID]) REFERENCES [dbo].[Bankat] ([BankaID]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[HistoriaZbritjeveProduktit] ADD CONSTRAINT [FK_HistoriaZbritjeveProduktit_Produkti_ProduktiID] FOREIGN KEY ([ProduktiID]) REFERENCES [dbo].[Produkti] ([ProduktiID]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetRoleClaims] ADD CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserClaims] ADD CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserLogins] ADD CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserRoles] ADD CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserRoles] ADD CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[AspNetUserTokens] ADD CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Perdoruesi] ADD CONSTRAINT [FK_Perdoruesi_AspNetUsers_AspNetUserID] FOREIGN KEY ([AspNetUserID]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Produkti] ADD CONSTRAINT [FK_Produkti_GrupiProduktit_IDGrupiProduktit] FOREIGN KEY ([IDGrupiProduktit]) REFERENCES [dbo].[GrupiProduktit] ([IDGrupiProduktit]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Produkti] ADD CONSTRAINT [FK_Produkti_NjesiaMatese_IDNjesiaMatese] FOREIGN KEY ([IDNjesiaMatese]) REFERENCES [dbo].[NjesiaMatese] ([IDNjesiaMatese]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Produkti] ADD CONSTRAINT [FK_Produkti_Partneri_IDPartneri] FOREIGN KEY ([IDPartneri]) REFERENCES [dbo].[Partneri] ([IDPartneri]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Faturat] ADD CONSTRAINT [FK_Faturat_Kartelat_IDBonusKartela] FOREIGN KEY ([IDBonusKartela]) REFERENCES [dbo].[Kartelat] ([IDKartela]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Faturat] ADD CONSTRAINT [FK_Faturat_Partneri_IDPartneri] FOREIGN KEY ([IDPartneri]) REFERENCES [dbo].[Partneri] ([IDPartneri]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[Faturat] ADD CONSTRAINT [FK_Faturat_Perdoruesi_StafiID] FOREIGN KEY ([StafiID]) REFERENCES [dbo].[Perdoruesi] ([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TeDhenatPerdoruesit] ADD CONSTRAINT [FK_TeDhenatPerdoruesit_Bankat_BankaID] FOREIGN KEY ([BankaID]) REFERENCES [dbo].[Bankat] ([BankaID]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TeDhenatPerdoruesit] ADD CONSTRAINT [FK_TeDhenatPerdoruesit_Perdoruesi_UserID] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Perdoruesi] ([UserID]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[StokuQmimiProduktit] ADD CONSTRAINT [FK_StokuQmimiProduktit_Produkti_ProduktiID] FOREIGN KEY ([ProduktiID]) REFERENCES [dbo].[Produkti] ([ProduktiID]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[ZbritjaQmimitProduktit] ADD CONSTRAINT [FK_ZbritjaQmimitProduktit_Produkti_ProduktiID] FOREIGN KEY ([ProduktiID]) REFERENCES [dbo].[Produkti] ([ProduktiID]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TeDhenatFaturat] ADD CONSTRAINT [FK_TeDhenatFaturat_Faturat_IDRegjistrimit] FOREIGN KEY ([IDRegjistrimit]) REFERENCES [dbo].[Faturat] ([IDRegjistrimit]) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE [dbo].[TeDhenatFaturat] ADD CONSTRAINT [FK_TeDhenatFaturat_Produkti_IDProduktit] FOREIGN KEY ([IDProduktit]) REFERENCES [dbo].[Produkti] ([ProduktiID]) ON DELETE NO ACTION ON UPDATE NO ACTION;
