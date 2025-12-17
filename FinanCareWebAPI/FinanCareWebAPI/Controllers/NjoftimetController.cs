using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FinanCareWebAPI.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using FinanCareWebAPI.Migrations;

namespace TechStoreWebAPI.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class NjoftimetController : Controller
    {
        private readonly FinanCareDbContext _context;

        public NjoftimetController(FinanCareDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqProduktetPaStok")]
        public async Task<ActionResult> ShfaqProduktetPaStok()
        {

            var Produkti = await _context.Produkti
                .Where(x => x.isDeleted == "false" && x.StokuQmimiProduktit.SasiaNeStok <= 0)
                .OrderBy(p => p.StokuQmimiProduktit.SasiaNeStok)
                .ThenByDescending(p => p.ProduktiID)
               .Select(p => new
               {
                   p.ProduktiID,
                   p.EmriProduktit,
                   p.Partneri.EmriBiznesit,
                   p.NjesiaMatese.EmriNjesiaMatese,
                   p.Barkodi,
                   p.KodiProduktit,
                   p.StokuQmimiProduktit.SasiaNeStok,
                   p.GrupiProduktit.GrupiIProduktit,
               })
               .ToListAsync();

            return Ok(Produkti);
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqAfatetESkadimit")]
        public async Task<ActionResult> ShfaqAfatetESkadimit()
        {

            var AfatetESkadimit = await _context.AfatetESkadimit
                .OrderBy(p => p.DataSkadimit)
                .Include(p => p.PersoniPergjegjes)
                .Include(p => p.Produkti)
               .Select(p => new
               {
                   p.ID,
                   p.StafiID,
                   p.DataSkadimit,
                   p.IDProduktit,
                   p.Produkti.EmriProduktit,
                   p.PersoniPergjegjes.Emri,
                   p.PersoniPergjegjes.Mbiemri
               })
               .ToListAsync();

            return Ok(AfatetESkadimit);
        }

        [Authorize]
        [HttpPost]
        [Route("shtoAfatetESkadimit")]
        public async Task<IActionResult> Post(AfatetESkadimit afatetESkadimit)
        {
            await _context.AfatetESkadimit.AddAsync(afatetESkadimit);
            await _context.SaveChangesAsync();

            var response = new { Message = "Success", Data = afatetESkadimit };
            return Ok(response);
        }

        [Authorize]
        [HttpPost("suggest-order/{productId}")]
        public async Task<IActionResult> SuggestOrder(
    int productId,
    int leadTimeWeeks = 1,
    int desiredWeeksCoverage = 2,
    int safetyStockWeeks = 1)
        {
            try
            {
                // 1. Product + settings
                var product = await _context.Produkti
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.ProduktiID == productId);

                if (product == null)
                    return NotFound($"Product with ID {productId} not found.");

                // 2. Current stock
                decimal currentStock = await _context.StokuQmimiProduktit
                    .AsNoTracking()
                    .Where(s => s.ProduktiID == productId)
                    .Select(s => s.SasiaNeStok ?? 0m)
                    .FirstOrDefaultAsync();

                // 3. Sales history - last 6 full months
                var today = DateTime.Today;
                var periodStart = new DateTime(today.Year, today.Month, 1).AddMonths(-6);

                var salesData = await _context.TeDhenatFaturat
                    .AsNoTracking()
                    .Where(td => td.IDProduktit == productId &&
                                 td.Faturat != null &&
                                 td.Faturat.DataRegjistrimit >= periodStart &&
                                 (td.Faturat.LlojiKalkulimit == "PARAGON" || td.Faturat.LlojiKalkulimit == "FAT"))
                    .Select(td => new
                    {
                        Quantity = td.SasiaStokut ?? 0m,
                        Date = td.Faturat.DataRegjistrimit.Value
                    })
                    .ToListAsync();

                // 4. Monthly sales
                var monthlySales = salesData
    .GroupBy(x => new { x.Date.Year, x.Date.Month })
    .Select(g => g.Sum(x => x.Quantity))
    .ToList();

                int monthsWithSales = monthlySales.Count;
                decimal avgMonthlySales = monthsWithSales > 0 ? monthlySales.Average() : 10m;
                decimal avgWeeklySales = avgMonthlySales / 4.345m;

                // 5. Trend detection (+20% safety if growing)
                bool isTrendingUp = false;
                if (monthsWithSales >= 4)
                {
                    decimal recentAvg = monthlySales.TakeLast(3).Average();
                    decimal olderAvg = monthlySales.Take(monthlySales.Count - 3).Average();
                    isTrendingUp = recentAvg > olderAvg * 1.2m;
                }
                int effectiveSafetyWeeks = isTrendingUp ? (int)Math.Ceiling(safetyStockWeeks * 1.2m) : safetyStockWeeks;

                // 6. Target stock & raw quantity needed
                decimal targetStock = avgWeeklySales * (leadTimeWeeks + desiredWeeksCoverage + effectiveSafetyWeeks);
                decimal rawOrderQty = Math.Max(0, targetStock - currentStock); // e.g. 0.21

                // 7. MOQ & PackSize from product (use correct fields!)
                decimal moq = product.SasiaShumices ?? 0m;        // CORRECT FIELD
                decimal packSize = product.SasiaShumices ?? 1m;           // CORRECT FIELD (or create one)

                // CORRECT LOGIC: Only apply MOQ/pack if we really need to order
                decimal recommendedOrderQty = 0m;

                if (rawOrderQty > 1m) // we actually need stock
                {
                    decimal temp = rawOrderQty;

                    if (moq > 0 && temp < moq)
                        temp = moq;

                    if (packSize > 1)
                        temp = Math.Ceiling(temp / packSize) * packSize;

                    recommendedOrderQty = Math.Round(temp, 2);
                }
                // If rawOrderQty ≈ 0 → recommendedOrderQty stays 0 → NO FORCED ORDER!

                // 8. Coverage
                decimal stockAfterOrder = currentStock + recommendedOrderQty;
                decimal currentWeeksCoverage = currentStock <= 0 ? 0m : Math.Round(currentStock / avgWeeklySales, 2);
                decimal projectedWeeksCoverage = avgWeeklySales > 0 ? Math.Round(stockAfterOrder / avgWeeklySales, 2) : 0m;

                // 9. Urgency level
                string suggestionLevel = currentStock < 0 ? "CRITICAL" :
                                        currentStock == 0 ? "CRITICAL" :
                                        currentWeeksCoverage < 1 ? "HIGH" :
                                        currentWeeksCoverage < 2 ? "MEDIUM" : "LOW";

                // 10. Smart message
                string message = recommendedOrderQty <= 0
                    ? "Stok i mjaftueshëm – nuk ka nevojë për porosi tani"
                    : suggestionLevel switch
                    {
                        "CRITICAL" => "KRITIKE: POROSIT MENJËHERË!",
                        "HIGH" => "URGJENTE: Porosit brenda 1-2 ditëve",
                        "MEDIUM" => "Rekomandohet porosi këtë javë",
                        _ => "Mund të porosisësh për siguri shtesë"
                    };

                // 11. Last purchase (fixed query – you were using sales table!)
                // 9. Last purchase info – 100% correct for your system
                var lastPurchase = await _context.TeDhenatFaturat
                    .AsNoTracking()
                    .Include(tf => tf.Faturat)
                        .ThenInclude(f => f.Partneri)
                    .Where(tf => tf.IDProduktit == productId &&
                                 tf.Faturat != null &&
                                 tf.Faturat.LlojiKalkulimit == "Hyrje")
                    .OrderByDescending(tf => tf.Faturat.DataRegjistrimit)
                    .Select(tf => new
                    {
                        Price = tf.QmimiBleres ?? 0m,
                        Supplier = tf.Faturat.Partneri.EmriBiznesit ?? "Pa emër",
                        Date = tf.Faturat.DataRegjistrimit
                    })
                    .FirstOrDefaultAsync();

                // 12. Final response
                var result = new
                {
                    ProductId = productId,
                    productName = product.EmriProduktit?.Trim(),
                    CurrentStock = Math.Round(currentStock, 2),
                    CurrentWeeksCoverage = currentWeeksCoverage,
                    AverageMonthlySales = Math.Round(avgMonthlySales, 2),
                    AverageWeeklySales = Math.Round(avgWeeklySales, 2),
                    RawSuggestedQuantity = Math.Round(rawOrderQty, 2),
                    RecommendedOrderQuantity = recommendedOrderQty,
                    ProjectedStockAfterOrder = Math.Round(stockAfterOrder, 2),
                    ProjectedWeeksCoverage = projectedWeeksCoverage,
                    SuggestionLevel = suggestionLevel,
                    Message = message,
                    IsOutOfStock = currentStock <= 0,
                    DataQualityWarning = monthsWithSales <= 2
                        ? $"Kujdes: Të dhëna të pakta shitjesh ({monthsWithSales} muaj)"
                        : null,
                    IsSalesTrendingUp = isTrendingUp,
                    MOQ = moq,
                    PackSize = packSize,
                    LastPurchasePrice = lastPurchase?.Price ?? 0m,
                    LastSupplier = lastPurchase?.Supplier ?? "Pa të dhëna",
                    LastPurchaseDate = lastPurchase?.Date?.ToString("yyyy-MM-dd"),
                    AnalysisPeriod = $"{periodStart:yyyy-MM-dd} - {today:yyyy-MM-dd}",
                    MonthsWithSales = monthsWithSales
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Gabim në llogaritje", details = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijAfatetESkadimit")]
        public async Task<IActionResult> Delete(int id)
        {
            var afatiSkadimit = await _context.AfatetESkadimit.FirstOrDefaultAsync(x => x.ID == id);

            if (afatiSkadimit == null)
                return BadRequest("Invalid id");

            _context.AfatetESkadimit.Remove(afatiSkadimit);
            await _context.SaveChangesAsync();

            return Ok("Afati Skadimit u fshi me sukses!");
        }
    }
}
