using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;

namespace FinanCareWebAPI.Controllers.TeNdryshme
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class StatistikatController : Controller
    {
        private readonly FinanCareDbContext _context;

        public StatistikatController(FinanCareDbContext context)
        {
            _context = context;
        }

        // ============================================================================
        // OPTIMIZATION 1: Calculate all totals in ONE query
        // ============================================================================
        [Authorize]
        [HttpGet]
        [Route("totaleTeNdryshme")]
        public async Task<IActionResult> GetTotaleTeNdryshme()
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);
            var yesterday = today.AddDays(-1);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);
            var endOfLastMonth = startOfMonth;

            // Single query to get all data we need
            var allData = await _context.Faturat
                .Where(x => x.DataRegjistrimit.HasValue)
                .Select(x => new
                {
                    x.TotaliPaTVSH,
                    x.TVSH,
                    x.LlojiKalkulimit,
                    x.DataRegjistrimit,
                    IsSotme = x.DataRegjistrimit >= today && x.DataRegjistrimit < tomorrow,
                    IsDjeshme = x.DataRegjistrimit >= yesterday && x.DataRegjistrimit < today,
                    IsKeteMuaj = x.DataRegjistrimit >= startOfMonth && x.DataRegjistrimit < endOfMonth,
                    IsMuajinKaluar = x.DataRegjistrimit >= startOfLastMonth && x.DataRegjistrimit < endOfLastMonth,
                })
                .ToListAsync();

            // Calculate everything in memory (much faster than multiple DB queries)
            var totShitjevePaTVSHFat = allData
                .Where(x => x.LlojiKalkulimit == "FAT")
                .Sum(p => p.TotaliPaTVSH ?? 0);

            var totShitjeveVetemTVSHFat = allData
                .Where(x => x.LlojiKalkulimit == "FAT")
                .Sum(p => p.TVSH ?? 0);

            var totShitjevePaTVSHFl = allData
                .Where(x => x.LlojiKalkulimit == "FL")
                .Sum(p => p.TotaliPaTVSH ?? 0);

            var totShitjeveVetemTVSHFl = allData
                .Where(x => x.LlojiKalkulimit == "FL")
                .Sum(p => p.TVSH ?? 0);

            var totShitjeveParagonPaTVSH = allData
                .Where(x => x.LlojiKalkulimit == "PARAGON")
                .Sum(p => p.TotaliPaTVSH ?? 0);

            var totShitjeveParagonetemTVSH = allData
                .Where(x => x.LlojiKalkulimit == "PARAGON")
                .Sum(p => p.TVSH ?? 0);

            // Count queries (still fast)
            var totKlient = await _context.Partneri
                .CountAsync(x => (x.LlojiPartnerit == "B" || x.LlojiPartnerit == "B/F") && x.NUI == "0");

            var totKlientBiznesi = await _context.Partneri
                .CountAsync(x => (x.LlojiPartnerit == "B" || x.LlojiPartnerit == "B/F") && x.NUI != "0");

            var totProdukteve = await _context.Produkti.CountAsync();
            var totPorosive = allData.Count(x => x.LlojiKalkulimit == "FAT");
            var totPorosiveParagon = allData.Count(x => x.LlojiKalkulimit == "PARAGON");

            // Today's data
            var todaySotme = allData.Where(x => x.IsSotme).ToList();
            var totPorosiveSotme = todaySotme.Count(x => x.LlojiKalkulimit == "FAT");
            var totShitjeveSotmePaTVSHFat = todaySotme.Where(x => x.LlojiKalkulimit == "FAT").Sum(p => p.TotaliPaTVSH ?? 0);
            var totShitjeveSotmeVetemTVSHFat = todaySotme.Where(x => x.LlojiKalkulimit == "FAT").Sum(p => p.TVSH ?? 0);
            var totShitjeveSotmePaTVSHFl = todaySotme.Where(x => x.LlojiKalkulimit == "FL").Sum(p => p.TotaliPaTVSH ?? 0);
            var totShitjeveSotmeVetemTVSHFl = todaySotme.Where(x => x.LlojiKalkulimit == "FL").Sum(p => p.TVSH ?? 0);
            var totShitjeveSotmeParagon = todaySotme.Where(x => x.LlojiKalkulimit == "PARAGON").Sum(p => (p.TotaliPaTVSH ?? 0) + (p.TVSH ?? 0));

            // Monthly data
            var dataKeteMuaj = allData.Where(x => x.IsKeteMuaj).ToList();
            var totPorosiveMujore = dataKeteMuaj.Count(x => x.LlojiKalkulimit == "FAT");
            var totShitjeveMujorePaTVSHFat = dataKeteMuaj.Where(x => x.LlojiKalkulimit == "FAT").Sum(p => p.TotaliPaTVSH ?? 0);
            var totShitjeveMujoreVetemTVSHFat = dataKeteMuaj.Where(x => x.LlojiKalkulimit == "FAT").Sum(p => p.TVSH ?? 0);
            var totShitjeveMujorePaTVSHFl = dataKeteMuaj.Where(x => x.LlojiKalkulimit == "FL").Sum(p => p.TotaliPaTVSH ?? 0);
            var totShitjeveMujoreVetemTVSHFl = dataKeteMuaj.Where(x => x.LlojiKalkulimit == "FL").Sum(p => p.TVSH ?? 0);
            var totShitjeveMujoreParagon = dataKeteMuaj.Where(x => x.LlojiKalkulimit == "PARAGON").Sum(p => (p.TotaliPaTVSH ?? 0) + (p.TVSH ?? 0));

            // Yesterday's data
            var dataDjeshme = allData.Where(x => x.IsDjeshme).ToList();
            var totPorosiveDjeshme = dataDjeshme.Count(x => x.LlojiKalkulimit == "FAT");
            var totShitjeveDjeshmePaTVSHFat = dataDjeshme.Where(x => x.LlojiKalkulimit == "FAT").Sum(p => p.TotaliPaTVSH ?? 0);
            var totShitjeveDjeshmeVetemTVSHFat = dataDjeshme.Where(x => x.LlojiKalkulimit == "FAT").Sum(p => p.TVSH ?? 0);
            var totShitjeveDjeshmePaTVSHFl = dataDjeshme.Where(x => x.LlojiKalkulimit == "FL").Sum(p => p.TotaliPaTVSH ?? 0);
            var totShitjeveDjeshmeVetemTVSHFl = dataDjeshme.Where(x => x.LlojiKalkulimit == "FL").Sum(p => p.TVSH ?? 0);
            var totShitjeveDjeshmeParagon = dataDjeshme.Where(x => x.LlojiKalkulimit == "PARAGON").Sum(p => (p.TotaliPaTVSH ?? 0) + (p.TVSH ?? 0));

            // Last month's data
            var dataMuajinKaluar = allData.Where(x => x.IsMuajinKaluar).ToList();
            var totPorosiveMujoreKaluar = dataMuajinKaluar.Count(x => x.LlojiKalkulimit == "FAT");
            var totShitjeveMujoreKaluarPaTVSHFat = dataMuajinKaluar.Where(x => x.LlojiKalkulimit == "FAT").Sum(p => p.TotaliPaTVSH ?? 0);
            var totShitjeveMujoreKaluarVetemTVSHFat = dataMuajinKaluar.Where(x => x.LlojiKalkulimit == "FAT").Sum(p => p.TVSH ?? 0);
            var totShitjeveMujoreKaluarPaTVSHFl = dataMuajinKaluar.Where(x => x.LlojiKalkulimit == "FL").Sum(p => p.TotaliPaTVSH ?? 0);
            var totShitjeveMujoreKaluarVetemTVSHFl = dataMuajinKaluar.Where(x => x.LlojiKalkulimit == "FL").Sum(p => p.TVSH ?? 0);
            var totShitjeveMujoreKaluarParagon = dataMuajinKaluar.Where(x => x.LlojiKalkulimit == "PARAGON").Sum(p => (p.TotaliPaTVSH ?? 0) + (p.TVSH ?? 0));

            // P&L Calculations for Today
            // Llojet e dokumenteve që ndikojnë cash flow (sipas menysë së navigimit):
            // HYRJET: HYRJE=blerje+, KMSH=blerje+ (kthim malli shitur, mall vjen si hyrje), FL=blerje- (kreditnotë)
            // SHITJET: FAT=shitje+, PARAGON=shitje+, KMB=shitje- (kthen tek furnitori), AS=COGS humbje
            // PRM: përjashtuar
            var todayInvoicesWithItems = await _context.Faturat
                .AsNoTracking()
                .Include(x => x.TeDhenatFaturat)
                .Where(x => x.DataRegjistrimit.HasValue && x.DataRegjistrimit >= today && x.DataRegjistrimit < tomorrow)
                .ToListAsync();

            // SHITJET: FAT + PARAGON  minus  KMB (kthim malli tek furnitori)
            var rawShitjetSotmePaTVSH = todayInvoicesWithItems
                .Where(x => x.LlojiKalkulimit == "FAT" || x.LlojiKalkulimit == "PARAGON")
                .Sum(x => x.TotaliPaTVSH ?? 0)
                - todayInvoicesWithItems.Where(x => x.LlojiKalkulimit == "KMB")
                    .Sum(x => x.TotaliPaTVSH ?? 0);

            var rawShitjetSotmeVetemTVSH = todayInvoicesWithItems
                .Where(x => x.LlojiKalkulimit == "FAT" || x.LlojiKalkulimit == "PARAGON")
                .Sum(x => x.TVSH ?? 0)
                - todayInvoicesWithItems.Where(x => x.LlojiKalkulimit == "KMB")
                    .Sum(x => x.TVSH ?? 0);

            // BLERJET: HYRJE + KMSH (kthim malli i shitur = mall vjen si hyrje)  minus  FL (kreditnotë)
            var rawBlerjetSotmePaTVSH = todayInvoicesWithItems
                .Where(x => x.LlojiKalkulimit == "HYRJE" || x.LlojiKalkulimit == "KMSH")
                .Sum(x => x.TotaliPaTVSH ?? 0)
                - todayInvoicesWithItems.Where(x => x.LlojiKalkulimit == "FL")
                    .Sum(x => x.TotaliPaTVSH ?? 0);

            var rawBlerjetSotmeVetemTVSH = todayInvoicesWithItems
                .Where(x => x.LlojiKalkulimit == "HYRJE" || x.LlojiKalkulimit == "KMSH")
                .Sum(x => x.TVSH ?? 0)
                - todayInvoicesWithItems.Where(x => x.LlojiKalkulimit == "FL")
                    .Sum(x => x.TVSH ?? 0);

            // COGS: Kosto e mallit të shitur (FAT+PARAGON) minus kthimet via KMB (mall del tek furnitori)
            // plus asgjësimi (AS = humbje direkte e mallit nga inventar)
            var cogsSales = todayInvoicesWithItems
                .Where(x => x.LlojiKalkulimit == "FAT" || x.LlojiKalkulimit == "PARAGON")
                .SelectMany(x => x.TeDhenatFaturat)
                .Sum(item => (item.SasiaStokut ?? 0) * (item.QmimiBleres ?? 0));

            var cogsReturnsKMB = todayInvoicesWithItems
                .Where(x => x.LlojiKalkulimit == "KMB")
                .SelectMany(x => x.TeDhenatFaturat)
                .Sum(item => (item.SasiaStokut ?? 0) * (item.QmimiBleres ?? 0));

            // Asgjësimi i stokut = humbje direkte e vlerës së mallit (shtohet te COGS)
            var cogsAsgjesimi = todayInvoicesWithItems
                .Where(x => x.LlojiKalkulimit == "AS")
                .SelectMany(x => x.TeDhenatFaturat)
                .Sum(item => (item.SasiaStokut ?? 0) * (item.QmimiBleres ?? 0));

            var rawCogsSotme = cogsSales - cogsReturnsKMB + cogsAsgjesimi;

            var shitjetSotmePaTVSH = Math.Max(0, rawShitjetSotmePaTVSH);
            var shitjetSotmeVetemTVSH = Math.Max(0, rawShitjetSotmeVetemTVSH);
            var shitjetSotmeGjithsej = shitjetSotmePaTVSH + shitjetSotmeVetemTVSH;

            var blerjetSotmePaTVSH = Math.Max(0, rawBlerjetSotmePaTVSH);
            var blerjetSotmeVetemTVSH = Math.Max(0, rawBlerjetSotmeVetemTVSH);
            var blerjetSotmeGjithsej = blerjetSotmePaTVSH + blerjetSotmeVetemTVSH;

            var cogsSotme = Math.Max(0, rawCogsSotme);

            var profitiBrutoSotme = rawShitjetSotmePaTVSH - rawCogsSotme;
            var margjinaSotme = shitjetSotmePaTVSH > 0 ? (profitiBrutoSotme / shitjetSotmePaTVSH) * 100 : 0;
            var cashFlowSotme = shitjetSotmeGjithsej - blerjetSotmeGjithsej;

            var totalet = new
            {
                TotaliShitjeve = Math.Abs(totShitjevePaTVSHFat + totShitjeveVetemTVSHFat + totShitjeveParagonPaTVSH + totShitjeveParagonetemTVSH),
                TotaliKlient = totKlient,
                TotaliKlientBiznesi = totKlientBiznesi,
                TotaliProdukteve = totProdukteve,
                TotaliPorosive = totPorosive,
                TotaliShitjeveParagonEuro = Math.Abs(totShitjeveParagonPaTVSH + totShitjeveParagonetemTVSH),
                TotaliShitjeveParagon = totPorosiveParagon,
                TotaliPorosiveSotme = totPorosiveSotme,
                TotaliShitjeveSotme = Math.Abs(totShitjeveSotmePaTVSHFat + totShitjeveSotmeVetemTVSHFat + totShitjeveSotmeParagon),
                TotaliPorosiveKeteMuaj = totPorosiveMujore,
                TotaliShitjeveKeteMuaj = Math.Abs(totShitjeveMujorePaTVSHFat + totShitjeveMujoreVetemTVSHFat + totShitjeveMujoreParagon),
                TotaliPorosiveDjeshme = totPorosiveDjeshme,
                TotaliShitjeveDjeshme = Math.Abs(totShitjeveDjeshmePaTVSHFat + totShitjeveDjeshmeVetemTVSHFat + totShitjeveDjeshmeParagon),
                TotaliPorosiveMuajinKaluar = totPorosiveMujoreKaluar,
                TotaliShitjeveMuajinKaluar = Math.Abs(totShitjeveMujoreKaluarPaTVSHFat + totShitjeveMujoreKaluarVetemTVSHFat + totShitjeveMujoreKaluarParagon),

                // Daily P&L calculations
                BlerjetSotmePaTVSH = blerjetSotmePaTVSH,
                BlerjetSotmeVetemTVSH = blerjetSotmeVetemTVSH,
                BlerjetSotmeGjithsej = blerjetSotmeGjithsej,
                ShitjetSotmePaTVSH = shitjetSotmePaTVSH,
                ShitjetSotmeVetemTVSH = shitjetSotmeVetemTVSH,
                ShitjetSotmeGjithsej = shitjetSotmeGjithsej,
                CogsSotme = cogsSotme,
                ProfitiBrutoSotme = profitiBrutoSotme,
                MargjinaSotme = margjinaSotme,
                CashFlowSotme = cashFlowSotme,
            };

            return Ok(totalet);
        }

        // ============================================================================
        // OPTIMIZATION 2: Use .AsNoTracking() and single query
        // ============================================================================
        [Authorize]
        [HttpGet]
        [Route("15BleresitQytetarMeSeShumtiBlerje")]
        public async Task<IActionResult> BleresitQytetarMeSeShumtiBlerje()
        {
            var topBuyers = await _context.Partneri
                .AsNoTracking() // Don't track changes - faster
                .Where(p => p.IDPartneri != 1 && p.IDPartneri != 2 && p.IDPartneri != 3)
                .Select(p => new
                {
                    Partneri = p,
                    NumriBlerjeve = p.Faturat.Count(f => f.LlojiKalkulimit == "PARAGON"),
                    TotaliBlerjeveEuro = p.Faturat
                        .Where(f => f.LlojiKalkulimit == "PARAGON")
                        .Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0))
                })
                .Where(x => x.NumriBlerjeve > 0)
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)
                .ToListAsync();

            return Ok(topBuyers);
        }

        [Authorize]
        [HttpGet]
        [Route("15BleresitBiznesorMeSeShumtiBlerje")]
        public async Task<IActionResult> BleresitBiznesorMeSeShumtiBlerje()
        {
            var topBuyers = await _context.Partneri
                .AsNoTracking()
                .Where(p => p.IDPartneri != 1 && p.IDPartneri != 2 && p.IDPartneri != 3)
                .Select(p => new
                {
                    Partneri = p,
                    NumriBlerjeve = p.Faturat.Count(f => f.LlojiKalkulimit == "FAT"),
                    TotaliBlerjeveEuro = p.Faturat
                        .Where(f => f.LlojiKalkulimit == "FAT")
                        .Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0))
                })
                .Where(x => x.NumriBlerjeve > 0)
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)
                .ToListAsync();

            return Ok(topBuyers);
        }

        // ============================================================================
        // OPTIMIZATION 3: Reduce includes and use AsNoTracking
        // ============================================================================
        [Authorize]
        [HttpGet]
        [Route("ShitjetMeParagonSipasOperatorit")]
        public async Task<IActionResult> ShitjetMeParagonSipasOperatorit()
        {
            var today = DateTime.Today;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
            if (today.DayOfWeek == DayOfWeek.Sunday)
                startOfWeek = today.AddDays(-6);

            var endOfWeek = startOfWeek.AddDays(6);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

            // Single query for all data
            var allData = await _context.Faturat
                .AsNoTracking()
                .Where(x => x.LlojiKalkulimit == "PARAGON" && x.DataRegjistrimit.HasValue)
                .Include(x => x.Stafi)
                .Select(x => new
                {
                    x.Stafi,
                    x.TotaliPaTVSH,
                    x.TVSH,
                    x.DataRegjistrimit,
                    IsDitore = x.DataRegjistrimit.Value.Date == today,
                    IsJavore = x.DataRegjistrimit.Value.Date >= startOfWeek && x.DataRegjistrimit.Value.Date <= endOfWeek,
                    IsMujore = x.DataRegjistrimit.Value.Date >= startOfMonth && x.DataRegjistrimit.Value.Date <= endOfMonth,
                })
                .ToListAsync();

            // Process in memory
            var ShitjetDitoreSipasOperatorit = allData
                .Where(x => x.IsDitore)
                .GroupBy(p => p.Stafi?.UserID)
                .Select(g => new
                {
                    Stafi = g.FirstOrDefault()?.Stafi,
                    NumriBlerjeve = g.Count(),
                    TotaliBlerjeveEuro = g.Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0))
                })
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)
                .ToList();

            var ShitjetDitoreParagon = allData.Count(x => x.IsDitore);
            var ShitjetDitoreEuro = allData.Where(x => x.IsDitore).Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0));

            var ShitjetJavoreSipasOperatorit = allData
                .Where(x => x.IsJavore)
                .GroupBy(p => p.Stafi?.UserID)
                .Select(g => new
                {
                    Stafi = g.FirstOrDefault()?.Stafi,
                    NumriBlerjeve = g.Count(),
                    TotaliBlerjeveEuro = g.Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0))
                })
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)
                .ToList();

            var ShitjetJavoreParagon = allData.Count(x => x.IsJavore);
            var ShitjetJavoreEuro = allData.Where(x => x.IsJavore).Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0));

            var ShitjetMujoreSipasOperatorit = allData
                .Where(x => x.IsMujore)
                .GroupBy(p => p.Stafi?.UserID)
                .Select(g => new
                {
                    Stafi = g.FirstOrDefault()?.Stafi,
                    NumriBlerjeve = g.Count(),
                    TotaliBlerjeveEuro = g.Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0))
                })
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)
                .ToList();

            var ShitjetMujoreParagon = allData.Count(x => x.IsMujore);
            var ShitjetMujoreEuro = allData.Where(x => x.IsMujore).Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0));

            return Ok(new
            {
                ShitjetDitore = new { ShitjetDitoreSipasOperatorit, ShitjetDitoreParagon, ShitjetDitoreEuro },
                ShitjetJavore = new { ShitjetJavoreSipasOperatorit, ShitjetJavoreParagon, ShitjetJavoreEuro },
                ShitjetMujore = new { ShitjetMujoreSipasOperatorit, ShitjetMujoreParagon, ShitjetMujoreEuro },
                startOfWeek,
                today,
                endOfWeek,
                startOfMonth,
                endOfMonth
            });
        }

        [Authorize]
        [HttpGet]
        [Route("15ProduktetMeTeShitura")]
        public async Task<IActionResult> GetTop15Prod()
        {
            var produktet = await _context.Produkti
                .AsNoTracking()
                .Select(e => new
                {
                    Produkti = new
                    {
                        e.ProduktiID,
                        e.EmriProduktit,
                        e.StokuQmimiProduktit.SasiaNeStok,
                        e.StokuQmimiProduktit.QmimiBleres,
                        e.StokuQmimiProduktit.QmimiProduktit,
                        e.ZbritjaQmimitProduktit.Rabati,
                        Njesia = e.NjesiaMatese != null ? e.NjesiaMatese.EmriNjesiaMatese : "njësi",
                    },
                    TotaliPorosive = (e.TeDhenatFaturat.Where(x => x.Faturat.LlojiKalkulimit == "FAT" || x.Faturat.LlojiKalkulimit == "PARAGON").Sum(q => q.SasiaStokut) - e.TeDhenatFaturat.Where(x => x.Faturat.LlojiKalkulimit == "FL").Sum(q => q.SasiaStokut)),
                    TotaliBlerjeve = (e.TeDhenatFaturat.Where(x => x.Faturat.LlojiKalkulimit == "FAT" || x.Faturat.LlojiKalkulimit == "PARAGON").Sum(q => q.SasiaStokut) - e.TeDhenatFaturat.Where(x => x.Faturat.LlojiKalkulimit == "FL").Sum(q => q.SasiaStokut)) * e.StokuQmimiProduktit.QmimiProduktit,
                })
                .OrderByDescending(g => g.TotaliBlerjeve)
                .ThenByDescending(g => g.TotaliPorosive)
                .Take(15)
                .ToListAsync();

            return Ok(produktet.Where(x => x.TotaliBlerjeve > 0 || x.TotaliPorosive > 0));
        }

        // ============================================================================
        // OPTIMIZATION 4: Reduce loop iterations - fetch once instead of 7 times
        // ============================================================================
        [Authorize]
        [HttpGet]
        [Route("TotaletJavore")]
        public async Task<IActionResult> GetShitjetJavore()
        {
            var today = DateTime.Today;
            var weekAgo = today.AddDays(-6);

            // Single query instead of 7 loops
            var weekData = await _context.Faturat
                .AsNoTracking()
                .Where(x => x.LlojiKalkulimit == "FAT"
                    && x.DataRegjistrimit.HasValue
                    && x.DataRegjistrimit.Value.Date >= weekAgo
                    && x.DataRegjistrimit.Value.Date <= today)
                .GroupBy(x => x.DataRegjistrimit.Value.Date)
                .Select(g => new
                {
                    Data = g.Key,
                    totaliPorosiveDitore = g.Count(),
                    totaliShitjeveDitore = g.Sum(p => (p.TotaliPaTVSH ?? 0) + (p.TVSH ?? 0))
                })
                .OrderByDescending(x => x.Data)
                .ToListAsync();

            // Fill in missing days
            var totaletDitore = new List<object>();
            for (var date = today; date >= weekAgo; date = date.AddDays(-1))
            {
                var dayData = weekData.FirstOrDefault(x => x.Data == date);
                totaletDitore.Add(new
                {
                    Data = date,
                    totaliPorosiveDitore = dayData?.totaliPorosiveDitore ?? 0,
                    totaliShitjeveDitore = dayData?.totaliShitjeveDitore ?? 0m
                });
            }

            var totaliPorosiveJavore = weekData.Sum(x => x.totaliPorosiveDitore);
            var totaliShitjeveJavore = weekData.Sum(x => x.totaliShitjeveDitore);

            var totalet = new
            {
                totaletDitore,
                TotaletJavore = new
                {
                    TotaliShitjeveJavore = totaliShitjeveJavore,
                    TotaliPorosiveJavore = totaliPorosiveJavore,
                }
            };

            return Ok(totalet);
        }
    }
}