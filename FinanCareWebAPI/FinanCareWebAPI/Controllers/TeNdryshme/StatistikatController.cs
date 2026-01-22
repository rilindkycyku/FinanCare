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

        [Authorize]
        [HttpGet]
        [Route("totaleTeNdryshme")]
        public async Task<IActionResult> GetTotaleTeNdryshme()
        {
            /* Prepare reusable date values */
            var today = DateTime.Today;
            var yesterday = today.AddDays(-1);
            var startOfMonth = new DateTime(today.Year, today.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
            var startOfLastMonth = startOfMonth.AddMonths(-1);
            var endOfLastMonth = startOfMonth.AddDays(-1);

            /* General Totals */
            var fatQuery = _context.Faturat.Where(x => x.LlojiKalkulimit == "FAT");
            var flQuery = _context.Faturat.Where(x => x.LlojiKalkulimit == "FL");
            var paragonQuery = _context.Faturat.Where(x => x.LlojiKalkulimit == "PARAGON");

            var totShitjevePaTVSHFat = await fatQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveVetemTVSHFat = await fatQuery.SumAsync(p => p.TVSH);
            var totShitjevePaTVSHFl = await flQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveVetemTVSHFl = await flQuery.SumAsync(p => p.TVSH);
            var totShitjeveParagonPaTVSH = await paragonQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveParagonetemTVSH = await paragonQuery.SumAsync(p => p.TVSH);

            var totKlient = await _context.Partneri.CountAsync(x => (x.LlojiPartnerit == "B" || x.LlojiPartnerit == "B/F") && x.NUI.Equals("0"));
            var totKlientBiznesi = await _context.Partneri.CountAsync(x => (x.LlojiPartnerit == "B" || x.LlojiPartnerit == "B/F") && !x.NUI.Equals("0"));
            var totProdukteve = await _context.Produkti.CountAsync();
            var totPorosive = await fatQuery.CountAsync();
            var totPorosiveParagon = await paragonQuery.CountAsync();

            /* Today's Totals */
            var tomorrow = today.AddDays(1);
            var todayFatQuery = fatQuery.Where(p => p.DataRegjistrimit >= today && p.DataRegjistrimit < tomorrow);
            var todayFlQuery = flQuery.Where(p => p.DataRegjistrimit >= today && p.DataRegjistrimit < tomorrow);

            var totPorosiveSotme = await todayFatQuery.CountAsync();
            var totShitjeveSotmePaTVSHFat = await todayFatQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveSotmeVetemTVSHFat = await todayFatQuery.SumAsync(p => p.TVSH);
            var totShitjeveSotmePaTVSHFl = await todayFlQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveSotmeVetemTVSHFl = await todayFlQuery.SumAsync(p => p.TVSH);

            /* Monthly Totals */
            var monthFatQuery = fatQuery.Where(p => p.DataRegjistrimit >= startOfMonth && p.DataRegjistrimit <= endOfMonth);
            var monthFlQuery = flQuery.Where(p => p.DataRegjistrimit >= startOfMonth && p.DataRegjistrimit <= endOfMonth);

            var totPorosiveMujore = await monthFatQuery.CountAsync();
            var totShitjeveMujorePaTVSHFat = await monthFatQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveMujoreVetemTVSHFat = await monthFatQuery.SumAsync(p => p.TVSH);
            var totShitjeveMujorePaTVSHFl = await monthFlQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveMujoreVetemTVSHFl = await monthFlQuery.SumAsync(p => p.TVSH);

            /* Yesterday's Totals */
            var todayStart = today;
            var yesterdayFatQuery = fatQuery.Where(p => p.DataRegjistrimit >= yesterday && p.DataRegjistrimit < todayStart);
            var yesterdayFlQuery = flQuery.Where(p => p.DataRegjistrimit >= yesterday && p.DataRegjistrimit < todayStart);

            var totPorosiveDjeshme = await yesterdayFatQuery.CountAsync();
            var totShitjeveDjeshmePaTVSHFat = await yesterdayFatQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveDjeshmeVetemTVSHFat = await yesterdayFatQuery.SumAsync(p => p.TVSH);
            var totShitjeveDjeshmePaTVSHFl = await yesterdayFlQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveDjeshmeVetemTVSHFl = await yesterdayFlQuery.SumAsync(p => p.TVSH);

            /* Last Month's Totals */
            var lastMonthFatQuery = fatQuery.Where(p => p.DataRegjistrimit >= startOfLastMonth && p.DataRegjistrimit <= endOfLastMonth);
            var lastMonthFlQuery = flQuery.Where(p => p.DataRegjistrimit >= startOfLastMonth && p.DataRegjistrimit <= endOfLastMonth);

            var totPorosiveMujoreKaluar = await lastMonthFatQuery.CountAsync();
            var totShitjeveMujoreKaluarPaTVSHFat = await lastMonthFatQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveMujoreKaluarVetemTVSHFat = await lastMonthFatQuery.SumAsync(p => p.TVSH);
            var totShitjeveMujoreKaluarPaTVSHFl = await lastMonthFlQuery.SumAsync(p => p.TotaliPaTVSH);
            var totShitjeveMujoreKaluarVetemTVSHFl = await lastMonthFlQuery.SumAsync(p => p.TVSH);

            var totalet = new
            {
                /* General */
                TotaliShitjeve = totShitjevePaTVSHFat + totShitjeveVetemTVSHFat - totShitjevePaTVSHFl - totShitjeveVetemTVSHFl,
                TotaliKlient = totKlient,
                TotaliKlientBiznesi = totKlientBiznesi,
                TotaliProdukteve = totProdukteve,
                TotaliPorosive = totPorosive,
                TotaliShitjeveParagonEuro = totShitjeveParagonPaTVSH + totShitjeveParagonetemTVSH,
                TotaliShitjeveParagon = totPorosiveParagon,

                /* Today's Totals */
                TotaliPorosiveSotme = totPorosiveSotme,
                TotaliShitjeveSotme = totShitjeveSotmePaTVSHFat + totShitjeveSotmeVetemTVSHFat - totShitjeveSotmePaTVSHFl - totShitjeveSotmeVetemTVSHFl,

                /* Monthly Totals */
                TotaliPorosiveKeteMuaj = totPorosiveMujore,
                TotaliShitjeveKeteMuaj = totShitjeveMujorePaTVSHFat + totShitjeveMujoreVetemTVSHFat - totShitjeveMujorePaTVSHFl - totShitjeveMujoreVetemTVSHFl,

                /* Yesterday's Totals */
                TotaliPorosiveDjeshme = totPorosiveDjeshme,
                TotaliShitjeveDjeshme = totShitjeveDjeshmePaTVSHFat + totShitjeveDjeshmeVetemTVSHFat - totShitjeveDjeshmePaTVSHFl - totShitjeveDjeshmeVetemTVSHFl,

                /* Last Month's Totals */
                TotaliPorosiveMuajinKaluar = totPorosiveMujoreKaluar,
                TotaliShitjeveMuajinKaluar = totShitjeveMujoreKaluarPaTVSHFat + totShitjeveMujoreKaluarVetemTVSHFat - totShitjeveMujoreKaluarPaTVSHFl - totShitjeveMujoreKaluarVetemTVSHFl,
            };

            return Ok(totalet);
        }




        /*[Authorize]*/
        [Authorize]
        [HttpGet]
        [Route("15BleresitQytetarMeSeShumtiBlerje")]
        public async Task<IActionResult> BleresitQytetarMeSeShumtiBlerje()
        {
            var topBuyers = await _context.Partneri
                .Where(p => p.IDPartneri != 1 && p.IDPartneri != 2 && p.IDPartneri != 3)  // Exclude partner with ID 1
                .Include(x => x.Kartela)        // Include related Kartela
                .Select(p => new
                {
                    Partneri = p,
                    NumriBlerjeve = p.Faturat.Count(f => f.LlojiKalkulimit == "PARAGON"),
                    TotaliBlerjeveEuro = p.Faturat
                        .Where(f => f.LlojiKalkulimit == "PARAGON")
                        .Sum(f => f.TotaliPaTVSH + f.TVSH)
                })
                .Where(x => x.NumriBlerjeve > 0) // Only include partners with more than 0 purchases
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)  // Take up to 15, will return fewer if less available
                .ToListAsync();

            return Ok(topBuyers);
        }

        [Authorize]
        [HttpGet]
        [Route("15BleresitBiznesorMeSeShumtiBlerje")]
        public async Task<IActionResult> BleresitBiznesorMeSeShumtiBlerje()
        {
            var topBuyers = await _context.Partneri
                .Where(p => p.IDPartneri != 1 && p.IDPartneri != 2 && p.IDPartneri != 3)  // Exclude partner with ID 1
                .Select(p => new
                {
                    Partneri = p,
                    NumriBlerjeve = p.Faturat.Count(f => f.LlojiKalkulimit == "FAT"),
                    TotaliBlerjeveEuro = p.Faturat
                        .Where(f => f.LlojiKalkulimit == "FAT")
                        .Sum(f => f.TotaliPaTVSH + f.TVSH)
                })
                .Where(x => x.NumriBlerjeve > 0) // Only include partners with more than 0 purchases
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)  // Take up to 15, will return fewer if less available
                .ToListAsync();

            return Ok(topBuyers);
        }

        [Authorize]
        [HttpGet]
        [Route("ShitjetMeParagonSipasOperatorit")]
        public async Task<IActionResult> ShitjetMeParagonSipasOperatorit()
        {
            var today = DateTime.Today;

            // Calculate the start of the week (Monday)
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);

            // Adjust if today is Sunday (since DayOfWeek.Sunday == 0)
            if (today.DayOfWeek == DayOfWeek.Sunday)
            {
                startOfWeek = today.AddDays(-6); // Move back to the previous Monday
            }

            // Calculate the end of the week (Sunday)
            var endOfWeek = startOfWeek.AddDays(6);

            // Calculate the start of the month
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

            var query = _context.Faturat
                .Where(x => x.LlojiKalkulimit == "PARAGON" && x.DataRegjistrimit.HasValue);

            // Daily Sales
            var dailyQuery = query.Where(x => x.DataRegjistrimit.Value.Date == today);

            var ShitjetDitoreSipasOperatorit = await dailyQuery
                .Include(x => x.Stafi)
                .GroupBy(p => p.Stafi)
                .Select(g => new
                {
                    Stafi = g.Key,
                    NumriBlerjeve = g.Count(),
                    TotaliBlerjeveEuro = g.Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0))
                })
                .Where(x => x.NumriBlerjeve > 0)
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)
                .ToListAsync();

            var ShitjetDitoreParagon = await dailyQuery.CountAsync();
            var ShitjetDitoreEuro = await dailyQuery.SumAsync(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0));

            // Weekly Sales
            var weeklyQuery = query.Where(x => x.DataRegjistrimit.Value.Date >= startOfWeek && x.DataRegjistrimit.Value.Date <= endOfWeek);

            var ShitjetJavoreSipasOperatorit = await weeklyQuery
                .Include(x => x.Stafi)
                .GroupBy(p => p.Stafi)
                .Select(g => new
                {
                    Stafi = g.Key,
                    NumriBlerjeve = g.Count(),
                    TotaliBlerjeveEuro = g.Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0))
                })
                .Where(x => x.NumriBlerjeve > 0)
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)
                .ToListAsync();

            var ShitjetJavoreParagon = await weeklyQuery.CountAsync();
            var ShitjetJavoreEuro = await weeklyQuery.SumAsync(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0));

            // Monthly Sales
            var monthlyQuery = query.Where(x => x.DataRegjistrimit.Value.Date >= startOfMonth && x.DataRegjistrimit <= endOfMonth);

            var ShitjetMujoreSipasOperatorit = await monthlyQuery
                .Include(x => x.Stafi)
                .GroupBy(p => p.Stafi)
                .Select(g => new
                {
                    Stafi = g.Key,
                    NumriBlerjeve = g.Count(),
                    TotaliBlerjeveEuro = g.Sum(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0))
                })
                .Where(x => x.NumriBlerjeve > 0)
                .OrderByDescending(x => x.TotaliBlerjeveEuro)
                .Take(15)
                .ToListAsync();

            var ShitjetMujoreParagon = await monthlyQuery.CountAsync();
            var ShitjetMujoreEuro = await monthlyQuery.SumAsync(f => (f.TotaliPaTVSH ?? 0) + (f.TVSH ?? 0));

            var ShitjetDitore = new
            {
                ShitjetDitoreSipasOperatorit,
                ShitjetDitoreParagon,
                ShitjetDitoreEuro
            };

            var ShitjetJavore = new
            {
                ShitjetJavoreSipasOperatorit,
                ShitjetJavoreParagon,
                ShitjetJavoreEuro
            };

            var ShitjetMujore = new
            {
                ShitjetMujoreSipasOperatorit,
                ShitjetMujoreParagon,
                ShitjetMujoreEuro
            };

            return Ok(new
            {
                ShitjetDitore,
                ShitjetJavore,
                ShitjetMujore,
                startOfWeek,
                today ,
                endOfWeek,
            startOfMonth ,
            endOfMonth 
        });
        }


        [Authorize]
        [HttpGet]
        [Route("15ProduktetMeTeShitura")]
        public async Task<IActionResult> GetTop15Prod()
        {
            var produktet = await _context.Produkti
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
                    },
                    TotaliPorosive = (e.TeDhenatFaturat.Where(x => x.Faturat.LlojiKalkulimit == "FAT").Sum(q => q.SasiaStokut) - e.TeDhenatFaturat.Where(x => x.Faturat.LlojiKalkulimit == "FL").Sum(q => q.SasiaStokut)),
                    TotaliBlerjeve = (e.TeDhenatFaturat.Where(x => x.Faturat.LlojiKalkulimit == "FAT").Sum(q => q.SasiaStokut) - e.TeDhenatFaturat.Where(x => x.Faturat.LlojiKalkulimit == "FL").Sum(q => q.SasiaStokut)) * e.StokuQmimiProduktit.QmimiProduktit,
                })
                .OrderByDescending(g => g.TotaliPorosive)
                .ThenByDescending(g => g.TotaliBlerjeve)
                .Take(15)
                .ToListAsync();

            return Ok(produktet);
        }

        [Authorize]
        [HttpGet]
        [Route("TotaletJavore")]
        public async Task<IActionResult> GetShitjetJavore()
        {
            var dataESotme = DateTime.Today;
            var dataFillimit = dataESotme; 
            var dataMbarimit = dataESotme.AddDays(-6); ; 

            int totaliPorosiveJavore = 0;
            decimal totaliShitjeveJavore = 0;

            var totaletDitore = new List<Object>();

            for (var date = dataFillimit; date >= dataMbarimit; date = date.AddDays(-1))
            {
                var totalPorosive = await _context.Faturat.Where(x => x.LlojiKalkulimit == "FAT")
                    .Where(p => p.DataRegjistrimit == date)
                    .CountAsync();

                totaliPorosiveJavore += totalPorosive;

                var totalShitjevePaTVSH = await _context.Faturat.Where(x => x.LlojiKalkulimit == "FAT")
                    .Where(p => p.DataRegjistrimit == date)
                    .SumAsync(p => p.TotaliPaTVSH);

                var totalShitjeveVetemTVSH = await _context.Faturat.Where(x => x.LlojiKalkulimit == "FAT")
                    .Where(p => p.DataRegjistrimit == date)
                    .SumAsync(p => p.TVSH);

                totaliShitjeveJavore += (decimal)(totalShitjevePaTVSH + totalShitjeveVetemTVSH);

                var totaliDitor = new
                {
                    Data = date,
                    totaliPorosiveDitore = totalPorosive,
                    totaliShitjeveDitore = (totalShitjevePaTVSH + totalShitjeveVetemTVSH)
                };

                totaletDitore.Add(totaliDitor);
            }

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
