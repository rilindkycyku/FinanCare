using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using FinanCareWebAPI.Models;

namespace FinanCareWebAPI.Migrations;

public partial class FinanCareDbContext : IdentityDbContext
{
    public FinanCareDbContext(DbContextOptions<FinanCareDbContext> options)
        : base(options)
    {
    }

    public DbSet<Faturat> Faturat { get; set; }
    public DbSet<NjesiaMatese> NjesiaMatese { get; set; }
    public DbSet<GrupiProduktit> GrupiProduktit { get; set; }
    public DbSet<Partneri> Partneri { get; set; }
    public DbSet<Perdoruesi> Perdoruesi { get; set; }
    public DbSet<Produkti> Produkti { get; set; }
    public DbSet<StokuQmimiProduktit> StokuQmimiProduktit { get; set; }
    public DbSet<TeDhenatBiznesit> TeDhenatBiznesit { get; set; }
    public DbSet<TeDhenatFaturat> TeDhenatFaturat { get; set; }
    public DbSet<TeDhenatPerdoruesit> TeDhenatPerdoruesit { get; set; }
    public DbSet<ZbritjaQmimitProduktit> ZbritjaQmimitProduktit { get; set; }
    public DbSet<Bankat> Bankat { get; set; }
    public DbSet<Kartelat> Kartelat { get; set; }
    public DbSet<LlogaritEBiznesit> LlogaritEBiznesit { get; set; }
    public DbSet<HistoriaZbritjeveProduktit> HistoriaZbritjeveProduktit { get; set; }
    public DbSet<AfatetESkadimit> AfatetESkadimit { get; set; }
    public DbSet<DitaFurnizimit> DitaFurnizimit { get; set; }
    public DbSet<BarazoArken> BarazoArken { get; set; }
}
