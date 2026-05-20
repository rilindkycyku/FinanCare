using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanCareWebAPI.Controllers.TeNdryshme
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class FaturatController : Controller
    {
        private readonly FinanCareDbContext _context;
        private readonly IAdminLogService _adminLogService;

        public FaturatController(FinanCareDbContext context, IAdminLogService adminLogService)
        {
            _context = context;
            _adminLogService = adminLogService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        private async Task LogAdminActionAsync(string action, string entityId, string description)
        {
            var userId = GetUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                await _adminLogService.LogAsync(userId, action, "Produkti", entityId, description);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqRegjistrimet")]
        public async Task<IActionResult> Get(DateTime? dataFillim = null, DateTime? dataMbarim = null)
        {
            // If no dates provided, show today only
            if (dataFillim == null && dataMbarim == null)
            {
                dataFillim = DateTime.Today;
                dataMbarim = DateTime.Today.AddDays(1);
            }
            // If only dataFillim provided, set dataMbarim to next day
            else if (dataMbarim == null)
            {
                dataMbarim = dataFillim?.AddDays(1);
            }

            // Convert to nullable DateTime for comparison
            DateTime startDate = dataFillim.Value.Date;
            DateTime endDate = dataMbarim.Value.Date.AddDays(1); // Include entire end date

            var regjistrimet = await _context.Faturat
                .Include(x => x.BonusKartela)
                .ThenInclude(x => x.Partneri)
                .Where(x => x.DataRegjistrimit.HasValue &&
                            x.DataRegjistrimit.Value.Date >= startDate &&
                            x.DataRegjistrimit.Value.Date < endDate)
                .OrderByDescending(x => x.IDRegjistrimit)
                .Select(x => new
                {
                    x.IDRegjistrimit,
                    x.TotaliPaTVSH,
                    x.TVSH,
                    x.DataRegjistrimit,
                    x.StafiID,
                    x.Stafi.Username,
                    x.NrFatures,
                    x.Partneri.EmriBiznesit,
                    x.Partneri.IDPartneri,
                    x.LlojiKalkulimit,
                    x.LlojiPageses,
                    x.StatusiPageses,
                    x.StatusiKalkulimit,
                    x.PershkrimShtese,
                    x.Rabati,
                    x.NrRendorFatures,
                    x.EshteFaturuarOferta,
                    x.IDBonusKartela,
                    x.BonusKartela,
                    x.Transporti
                }).ToListAsync();

            return Ok(regjistrimet);
        }


        [Authorize]
        [HttpGet]
        [Route("shfaqRegjistrimetSipasStatusit")]
        public async Task<IActionResult> GetByStatusi(string statusi, DateTime? dataFillim = null, DateTime? dataMbarim = null)
        {
            // If no dates provided, show today only
            if (dataFillim == null && dataMbarim == null)
            {
                dataFillim = DateTime.Today;
                dataMbarim = DateTime.Today.AddDays(1);
            }
            // If only dataFillim provided, set dataMbarim to next day
            else if (dataMbarim == null)
            {
                dataMbarim = dataFillim?.AddDays(1);
            }

            // Convert to nullable DateTime for comparison
            DateTime startDate = dataFillim.Value.Date;
            DateTime endDate = dataMbarim.Value.Date.AddDays(1); // Include entire end date
            var regjistrimet = await _context.Faturat
                .Include(x => x.BonusKartela)
                .ThenInclude(x => x.Partneri)
                .Where(x => x.StatusiKalkulimit == statusi && (x.DataRegjistrimit.HasValue &&
                    x.DataRegjistrimit.Value.Date >= startDate &&
                    x.DataRegjistrimit.Value.Date < endDate))
                .OrderByDescending(x => x.IDRegjistrimit)
                .Select(x => new
                {
                    x.IDRegjistrimit,
                    x.TotaliPaTVSH,
                    x.TVSH,
                    x.DataRegjistrimit,
                    x.StafiID,
                    x.Stafi.Username,
                    x.NrFatures,
                    x.Partneri.IDPartneri,
                    x.Partneri.EmriBiznesit,
                    x.LlojiKalkulimit,
                    x.LlojiPageses,
                    x.StatusiPageses,
                    x.StatusiKalkulimit,
                    x.PershkrimShtese,
                    x.Rabati,
                    x.NrRendorFatures,
                    x.EshteFaturuarOferta,
                    x.IDBonusKartela,
                    x.BonusKartela
                }).ToListAsync();

            return Ok(regjistrimet);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("shfaqRegjistrimetNgaID")]
        public async Task<IActionResult> GetRegjistrimin(int id)
        {
            var regjistrimet = await _context.Faturat
                .Include(x => x.BonusKartela)
                .ThenInclude(x => x.Partneri)
                .Select(x => new
                {
                    x.IDRegjistrimit,
                    x.TotaliPaTVSH,
                    x.TVSH,
                    x.DataRegjistrimit,
                    x.StafiID,
                    x.Stafi.Username,
                    x.NrFatures,
                    x.Partneri.EmriBiznesit,
                    x.Partneri.Adresa,
                    x.Partneri.NRF,
                    x.Partneri.NUI,
                    partneriTVSH = x.Partneri.TVSH,
                    x.Partneri.IDPartneri,
                    x.Partneri.ShkurtesaPartnerit,
                    x.Partneri.Email,
                    x.Partneri.NrKontaktit,
                    x.LlojiKalkulimit,
                    x.LlojiPageses,
                    x.StatusiPageses,
                    x.StatusiKalkulimit,
                    x.PershkrimShtese,
                    x.Rabati,
                    x.NrRendorFatures,
                    x.EshteFaturuarOferta,
                    x.IDBonusKartela,
                    x.BonusKartela,
                    x.Transporti
                }).FirstOrDefaultAsync(x => x.IDRegjistrimit == id);

            var totTVSH18 = await _context.TeDhenatFaturat.Include(x => x.Produkti).Where(x => x.Produkti.LlojiTVSH == 18 && x.IDRegjistrimit == id).ToListAsync();
            var totTVSH8 = await _context.TeDhenatFaturat.Include(x => x.Produkti).Where(x => x.Produkti.LlojiTVSH == 8 && x.IDRegjistrimit == id).ToListAsync();
            var totTVSH0 = await _context.TeDhenatFaturat.Include(x => x.Produkti).Where(x => (x.Produkti.LlojiTVSH == 0 || x.Produkti.LlojiTVSH == null) && x.IDRegjistrimit == id).ToListAsync();

            decimal TotaliMeTVSH18 = 0;
            decimal TotaliMeTVSH8 = 0;
            decimal TotaliPaTVSH18 = 0;
            decimal TotaliPaTVSH8 = 0;
            decimal TotaliMeTVSH0 = 0;
            decimal TotaliPaTVSH0 = 0;
            decimal Rabati = 0;
            decimal QmimiTotalShites = 0;

            foreach (var teDhenat in totTVSH18)
            {
                decimal rabati1 = teDhenat.Rabati1 ?? 0;
                decimal rabati2 = teDhenat.Rabati2 ?? 0;
                decimal rabati3 = teDhenat.Rabati3 ?? 0;
                decimal rabati = rabati1 + rabati2 + rabati3;
                decimal vatRate = 0.18m; // 18% VAT rate as a decimal
                decimal totalBeforeVAT = 0.00m;
                decimal vatAmount = 0.00m;

                if (regjistrimet.LlojiKalkulimit.Equals("KLFV"))
                {
                    QmimiTotalShites += Convert.ToDecimal(teDhenat.QmimiShites * teDhenat.SasiaStokut);
                }

                if (regjistrimet.LlojiKalkulimit.Equals("ONLINE") || regjistrimet.LlojiKalkulimit.Equals("OFERTE") || regjistrimet.LlojiKalkulimit.Equals("FAT") || regjistrimet.LlojiKalkulimit.Equals("FL") || regjistrimet.LlojiKalkulimit.Equals("PARAGON"))
                {
                    totalBeforeVAT = Convert.ToDecimal((teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                              (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                    vatAmount = vatRate / (1 + vatRate) * totalBeforeVAT;
                }
                else
                {
                    totalBeforeVAT = Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut - (teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100));
                    vatAmount = vatRate / (1 + vatRate) * totalBeforeVAT;
                }

                TotaliMeTVSH18 += totalBeforeVAT;
                TotaliPaTVSH18 += totalBeforeVAT - vatAmount;

                if (regjistrimet.LlojiKalkulimit.Equals("ONLINE") || regjistrimet.LlojiKalkulimit.Equals("OFERTE") || regjistrimet.LlojiKalkulimit.Equals("FAT") || regjistrimet.LlojiKalkulimit.Equals("FL") || regjistrimet.LlojiKalkulimit.Equals("PARAGON"))
                {
                    Rabati += Convert.ToDecimal((teDhenat.QmimiShites * (rabati1 / 100) +
                              (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) +
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                }
                else
                {

                    Rabati += Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100);
                }
            }

            foreach (var teDhenat in totTVSH8)
            {
                decimal rabati1 = teDhenat.Rabati1 ?? 0;
                decimal rabati2 = teDhenat.Rabati2 ?? 0;
                decimal rabati3 = teDhenat.Rabati3 ?? 0;
                decimal rabati = rabati1 + rabati2 + rabati3;
                decimal vatRate = 0.08m; // 8% VAT rate as a decimal
                decimal totalBeforeVAT = 0.00m;
                decimal vatAmount = 0.00m;

                if (regjistrimet.LlojiKalkulimit.Equals("ONLINE") || regjistrimet.LlojiKalkulimit.Equals("OFERTE") || regjistrimet.LlojiKalkulimit.Equals("FAT") || regjistrimet.LlojiKalkulimit.Equals("FL") || regjistrimet.LlojiKalkulimit.Equals("PARAGON"))
                {
                    totalBeforeVAT = Convert.ToDecimal((teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                              (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                    vatAmount = vatRate / (1 + vatRate) * totalBeforeVAT;
                }
                else
                {
                    totalBeforeVAT = Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut - (teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100));
                    vatAmount = vatRate / (1 + vatRate) * totalBeforeVAT;
                }

                TotaliMeTVSH8 += totalBeforeVAT;
                TotaliPaTVSH8 += totalBeforeVAT - vatAmount;

                if (regjistrimet.LlojiKalkulimit.Equals("ONLINE") || regjistrimet.LlojiKalkulimit.Equals("OFERTE") || regjistrimet.LlojiKalkulimit.Equals("FAT") || regjistrimet.LlojiKalkulimit.Equals("FL") || regjistrimet.LlojiKalkulimit.Equals("PARAGON"))
                {
                    Rabati += Convert.ToDecimal((teDhenat.QmimiShites * (rabati1 / 100) +
                              (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) +
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                }
                else
                {

                    Rabati += Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100);
                }
            }



            // 0% TVSH products
            foreach (var teDhenat in totTVSH0)
            {
                decimal rabati1 = teDhenat.Rabati1 ?? 0;
                decimal rabati2 = teDhenat.Rabati2 ?? 0;
                decimal rabati3 = teDhenat.Rabati3 ?? 0;
                decimal rabati = rabati1 + rabati2 + rabati3;
                decimal totalBeforeVAT = 0.00m;

                if (regjistrimet.LlojiKalkulimit.Equals("KLFV"))
                {
                    QmimiTotalShites += Convert.ToDecimal(teDhenat.QmimiShites * teDhenat.SasiaStokut);
                }

                if (regjistrimet.LlojiKalkulimit.Equals("ONLINE") || regjistrimet.LlojiKalkulimit.Equals("OFERTE") || regjistrimet.LlojiKalkulimit.Equals("FAT") || regjistrimet.LlojiKalkulimit.Equals("FL") || regjistrimet.LlojiKalkulimit.Equals("PARAGON"))
                {
                    totalBeforeVAT = Convert.ToDecimal((teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                              (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                    Rabati += Convert.ToDecimal((teDhenat.QmimiShites * (rabati1 / 100) +
                              (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) +
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                                (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                }
                else
                {
                    totalBeforeVAT = Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut - (teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100));
                    Rabati += Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100);
                }

                // vatAmount = 0 for 0% products — totalPaTVSH == totalMeTVSH
                TotaliMeTVSH0 += totalBeforeVAT;
                TotaliPaTVSH0 += totalBeforeVAT;
            }

            decimal TotaliPaTVSH = TotaliPaTVSH18 + TotaliPaTVSH8 + TotaliPaTVSH0;
            decimal TotaliMeTVSH = TotaliPaTVSH + (TotaliMeTVSH18 - TotaliPaTVSH18) + (TotaliMeTVSH8 - TotaliPaTVSH8);

            return Ok(new
            {
                regjistrimet,
                TotaliMeTVSH18,
                TotaliMeTVSH8,
                TotaliMeTVSH0,
                TotaliPaTVSH18,
                TotaliPaTVSH8,
                TotaliPaTVSH0,
                TotaliPaTVSH,
                TotaliMeTVSH,
                Rabati,
                TVSH18 = TotaliMeTVSH18 - TotaliPaTVSH18,
                TVSH8 = TotaliMeTVSH8 - TotaliPaTVSH8,
                totTVSH18,
                totTVSH8,
                totTVSH0,
                QmimiTotalShites
            });
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("shfaqRegjistrimetNgaProdukti")]
        public async Task<IActionResult> ShfaqRegjistrimetNgaProdukti(int id, int partneriID, DateTime? dataFillim = null, DateTime? dataMbarim = null)
        {
            // If no dates provided, show today only
            if (dataFillim == null && dataMbarim == null)
            {
                dataFillim = DateTime.Today;
                dataMbarim = DateTime.Today.AddDays(1);
            }
            // If only dataFillim provided, set dataMbarim to next day
            else if (dataMbarim == null)
            {
                dataMbarim = dataFillim?.AddDays(1);
            }


            // Fetch invoice data based on IDProduktit
            var regjistrimet = await _context.TeDhenatFaturat
                .Include(x => x.Faturat)
                .ThenInclude(x => x.BonusKartela)
                .ThenInclude(x => x.Partneri)
                .Where(x => x.IDProduktit == id && x.Faturat.IDPartneri == partneriID && (x.Faturat.DataRegjistrimit.HasValue &&
                    x.Faturat.DataRegjistrimit.Value.Date >= dataFillim &&
                    x.Faturat.DataRegjistrimit.Value.Date < dataMbarim))
                .Select(x => new
                {
                    IDRegjistrimit = x.Faturat.IDRegjistrimit,
                    TotaliPaTVSH = x.Faturat.TotaliPaTVSH,
                    TVSH = x.Faturat.TVSH,
                    DataRegjistrimit = x.Faturat.DataRegjistrimit,
                    StafiID = x.Faturat.StafiID,
                    Username = x.Faturat.Stafi.Username,
                    NrFatures = x.Faturat.NrFatures,
                    EmriBiznesit = x.Faturat.Partneri.EmriBiznesit,
                    Adresa = x.Faturat.Partneri.Adresa,
                    NRF = x.Faturat.Partneri.NRF,
                    NUI = x.Faturat.Partneri.NUI,
                    PartneriTVSH = x.Faturat.Partneri.TVSH,
                    IDPartneri = x.Faturat.Partneri.IDPartneri,
                    ShkurtesaPartnerit = x.Faturat.Partneri.ShkurtesaPartnerit,
                    Email = x.Faturat.Partneri.Email,
                    NrKontaktit = x.Faturat.Partneri.NrKontaktit,
                    LlojiKalkulimit = x.Faturat.LlojiKalkulimit,
                    LlojiPageses = x.Faturat.LlojiPageses,
                    StatusiPageses = x.Faturat.StatusiPageses,
                    StatusiKalkulimit = x.Faturat.StatusiKalkulimit,
                    PershkrimShtese = x.Faturat.PershkrimShtese,
                    Rabati = x.Faturat.Rabati,
                    NrRendorFatures = x.Faturat.NrRendorFatures,
                    EshteFaturuarOferta = x.Faturat.EshteFaturuarOferta,
                    IDBonusKartela = x.Faturat.IDBonusKartela,
                    BonusKartela = x.Faturat.BonusKartela,
                    x.Faturat.Transporti
                })
                .ToListAsync();

            if (!regjistrimet.Any())
            {
                return NotFound("No invoices found for the given product ID.");
            }

            // Calculate VAT totals for 18% and 8%
            var totTVSH18 = await _context.TeDhenatFaturat
                .Include(x => x.Produkti)
                .Where(x => x.IDProduktit == id && x.Produkti.LlojiTVSH == 18)
                .ToListAsync();
            var totTVSH8 = await _context.TeDhenatFaturat
                .Include(x => x.Produkti)
                .Where(x => x.IDProduktit == id && x.Produkti.LlojiTVSH == 8)
                .ToListAsync();

            decimal TotaliMeTVSH18 = 0;
            decimal TotaliMeTVSH8 = 0;
            decimal TotaliPaTVSH18 = 0;
            decimal TotaliPaTVSH8 = 0;
            decimal Rabati = 0;
            decimal QmimiTotalShites = 0;

            foreach (var teDhenat in totTVSH18)
            {
                decimal rabati1 = teDhenat.Rabati1 ?? 0;
                decimal rabati2 = teDhenat.Rabati2 ?? 0;
                decimal rabati3 = teDhenat.Rabati3 ?? 0;
                decimal rabati = rabati1 + rabati2 + rabati3;
                decimal vatRate = 0.18m;
                decimal totalBeforeVAT = 0.00m;
                decimal vatAmount = 0.00m;

                var llojiKalkulimit = teDhenat.Faturat?.LlojiKalkulimit ?? "Unknown";
                if (llojiKalkulimit.Equals("KLFV"))
                {
                    QmimiTotalShites += Convert.ToDecimal(teDhenat.QmimiShites * teDhenat.SasiaStokut);
                }
                if (llojiKalkulimit.Equals("ONLINE") || llojiKalkulimit.Equals("OFERTE") || llojiKalkulimit.Equals("FAT") ||
                    llojiKalkulimit.Equals("FL") || llojiKalkulimit.Equals("PARAGON"))
                {
                    totalBeforeVAT = Convert.ToDecimal((teDhenat.QmimiShites -
                        teDhenat.QmimiShites * (rabati1 / 100) -
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) -
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                    vatAmount = vatRate / (1 + vatRate) * totalBeforeVAT;
                }
                else
                {
                    totalBeforeVAT = Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut -
                        (teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100));
                    vatAmount = vatRate / (1 + vatRate) * totalBeforeVAT;
                }
                TotaliMeTVSH18 += totalBeforeVAT;
                TotaliPaTVSH18 += totalBeforeVAT - vatAmount;

                if (llojiKalkulimit.Equals("ONLINE") || llojiKalkulimit.Equals("OFERTE") || llojiKalkulimit.Equals("FAT") ||
                    llojiKalkulimit.Equals("FL") || llojiKalkulimit.Equals("PARAGON"))
                {
                    Rabati += Convert.ToDecimal((teDhenat.QmimiShites * (rabati1 / 100) +
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) +
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                }
                else
                {
                    Rabati += Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100);
                }
            }

            foreach (var teDhenat in totTVSH8)
            {
                decimal rabati1 = teDhenat.Rabati1 ?? 0;
                decimal rabati2 = teDhenat.Rabati2 ?? 0;
                decimal rabati3 = teDhenat.Rabati3 ?? 0;
                decimal rabati = rabati1 + rabati2 + rabati3;
                decimal vatRate = 0.08m;
                decimal totalBeforeVAT = 0.00m;
                decimal vatAmount = 0.00m;

                var llojiKalkulimit = teDhenat.Faturat?.LlojiKalkulimit ?? "Unknown";
                if (llojiKalkulimit.Equals("ONLINE") || llojiKalkulimit.Equals("OFERTE") || llojiKalkulimit.Equals("FAT") ||
                    llojiKalkulimit.Equals("FL") || llojiKalkulimit.Equals("PARAGON"))
                {
                    totalBeforeVAT = Convert.ToDecimal((teDhenat.QmimiShites -
                        teDhenat.QmimiShites * (rabati1 / 100) -
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) -
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                    vatAmount = vatRate / (1 + vatRate) * totalBeforeVAT;
                }
                else
                {
                    totalBeforeVAT = Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut -
                        (teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100));
                    vatAmount = vatRate / (1 + vatRate) * totalBeforeVAT;
                }
                TotaliMeTVSH8 += totalBeforeVAT;
                TotaliPaTVSH8 += totalBeforeVAT - vatAmount;

                if (llojiKalkulimit.Equals("ONLINE") || llojiKalkulimit.Equals("OFERTE") || llojiKalkulimit.Equals("FAT") ||
                    llojiKalkulimit.Equals("FL") || llojiKalkulimit.Equals("PARAGON"))
                {
                    Rabati += Convert.ToDecimal((teDhenat.QmimiShites * (rabati1 / 100) +
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100) +
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100) -
                        (teDhenat.QmimiShites - teDhenat.QmimiShites * (rabati1 / 100)) * (rabati2 / 100)) * (rabati3 / 100)) * teDhenat.SasiaStokut);
                }
                else
                {
                    Rabati += Convert.ToDecimal(teDhenat.QmimiBleres * teDhenat.SasiaStokut * rabati / 100);
                }
            }

            decimal TotaliPaTVSH = TotaliPaTVSH18 + TotaliPaTVSH8;
            decimal TotaliMeTVSH = TotaliPaTVSH + (TotaliMeTVSH18 - TotaliPaTVSH18) + (TotaliMeTVSH8 - TotaliPaTVSH8);

            return Ok(new
            {
                regjistrimet
            });
        }


        [Authorize]
        [HttpGet]
        [Route("shfaqTeDhenatKalkulimit")]
        public async Task<IActionResult> GetRegjistrimi(int IDRegjistrimit)
        {
            var teDhenat = await _context.TeDhenatFaturat
                .Where(x => x.IDRegjistrimit == IDRegjistrimit)
                .Select(x => new
                {
                    x.ID,
                    x.IDRegjistrimit,
                    x.IDProduktit,
                    x.Produkti.EmriProduktit,
                    x.Produkti.Barkodi,
                    x.Produkti.KodiProduktit,
                    x.SasiaStokut,
                    x.QmimiBleres,
                    x.QmimiShites,
                    x.QmimiShitesMeShumic,
                    x.Produkti.LlojiTVSH,
                    x.Rabati1,
                    x.Rabati2,
                    x.Rabati3,
                    x.Produkti.NjesiaMatese.EmriNjesiaMatese,
                    SasiaAktualeNeStok = x.Produkti.StokuQmimiProduktit.SasiaNeStok
                })
                .OrderByDescending(x => x.ID)
               .ToListAsync();

            return Ok(teDhenat);
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqNumrinRendorFatures")]
        public async Task<IActionResult> ShfaqNumrinRendorFatures(int stafiID)
        {
            var kaFatTeHapura = await _context.Faturat.Where(x => x.DataRegjistrimit.Value.Date == DateTime.Today && x.StafiID == stafiID && x.LlojiKalkulimit == "PARAGON" && x.StatusiKalkulimit == "false").FirstOrDefaultAsync();
            var nrFat = await _context.Faturat.Where(x => x.DataRegjistrimit.Value.Date == DateTime.Today && x.StafiID == stafiID && x.LlojiKalkulimit == "PARAGON").CountAsync();

            string datePart = DateTime.Today.ToString("ddMMyy");
            string nrFatures = $"{datePart}-{stafiID}-{nrFat + 1}";

            Faturat f = new Faturat()
            {
                IDPartneri = 1,
                StafiID = stafiID,
                LlojiKalkulimit = "PARAGON",
                NrFatures = nrFatures,
                NrRendorFatures = nrFat + 1,
                IDBonusKartela = null
            };

            await _context.Faturat.AddAsync(f);
            await _context.SaveChangesAsync();

            var obj = new
            {
                NrFat = nrFat + 1,
                f.IDRegjistrimit,
            };

            return Ok(obj);
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqFaturatEHapura")]
        public async Task<IActionResult> ShfaqFaturatEHapura(int stafiID)
        {
            var openInvoices = await _context.Faturat
                .Where(x => x.DataRegjistrimit.Value.Date == DateTime.Today
                            && x.StafiID == stafiID
                            && x.LlojiKalkulimit == "PARAGON"
                            && x.StatusiKalkulimit == "false")
                .Select(x => new
                {
                    x.IDRegjistrimit,
                    x.NrFatures,
                    x.IDPartneri,
                    x.IDBonusKartela,
                    BonusKartela = x.IDBonusKartela != null ? new
                    {
                        x.BonusKartela.IDKartela,
                        x.BonusKartela.Rabati,
                        Partneri = new
                        {
                            x.BonusKartela.Partneri.EmriBiznesit
                        }
                    } : null
                })
                .ToListAsync();
            return Ok(openInvoices);
        }

        [Authorize]
        [HttpGet]
        [Route("ruajKalkulimin/getKalkulimi")]
        public async Task<IActionResult> GetKalkulimi(int idKalkulimit)
        {
            var kalkulimi = await _context.TeDhenatFaturat
                .Where(x => x.ID == idKalkulimit)
                .Select(x => new
                {
                    x.ID,
                    x.IDRegjistrimit,
                    x.IDProduktit,
                    x.Produkti.EmriProduktit,
                    x.Produkti.Barkodi,
                    x.Produkti.KodiProduktit,
                    x.SasiaStokut,
                    x.Produkti.StokuQmimiProduktit.SasiaNeStok,
                    x.Produkti.StokuQmimiProduktit.QmimiMeShumic,
                    x.Produkti.StokuQmimiProduktit.QmimiProduktit,
                    x.Produkti.SasiaShumices,
                    x.Produkti.NjesiaMatese.EmriNjesiaMatese,
                    x.QmimiBleres,
                    x.QmimiShites,
                    x.QmimiShitesMeShumic,
                    x.Produkti.LlojiTVSH,
                    x.Rabati1,
                    x.Rabati2,
                    x.Rabati3,
                })
               .ToListAsync();
            ;

            return Ok(kalkulimi);
        }

        [Authorize]
        [HttpGet]
        [Route("getNumriFaturesMeRradhe")]
        public async Task<IActionResult> GetNumriFaturesMeRradhe(string llojiKalkulimit)
        {
            var nrFatures = await _context.Faturat
                .Where(x => x.LlojiKalkulimit == llojiKalkulimit)
                .OrderByDescending(x => x.IDRegjistrimit)
                .Take(1)
                .Select(x => x.NrRendorFatures)
                .ToListAsync();

            if (nrFatures.Count == 0)
            {
                return Ok(0);
            }

            return Ok(nrFatures);
        }

        [Authorize]
        [HttpGet]
        [Route("fshijKalkulimin/perditesoStokunQmimin")]
        public async Task<IActionResult> fshijKalkuliminPerditesoStokun(int idKalkulimi, int idProdukti, int idTeDhenatKalkulimit)
        {
            var secondLatestTeDhenat = await _context.TeDhenatFaturat
            .Where(x => x.IDProduktit == idProdukti && x.IDRegjistrimit != idKalkulimi && x.Faturat.StatusiKalkulimit == "true")
            .OrderByDescending(x => x.ID)
            .Take(1) // Take only one record (the second latest)
            .Select(x => new
            {
                x.ID,
                x.IDRegjistrimit,
                x.IDProduktit,
                x.Produkti.EmriProduktit,
                x.SasiaStokut,
                x.QmimiBleres,
                x.QmimiShites,
                x.QmimiShitesMeShumic,
                x.Rabati1,
                x.Rabati2,
                x.Rabati3,
            })
            .SingleOrDefaultAsync(); // Use SingleOrDefaultAsync to retrieve one record


            var produktiNeKalkulim = await _context.TeDhenatFaturat.FirstOrDefaultAsync(x => x.ID == idTeDhenatKalkulimit);


            var produkti = await _context.StokuQmimiProduktit.FindAsync(idProdukti);

            if (produkti == null)
            {
                return NotFound();
            }

            produkti.SasiaNeStok -= produktiNeKalkulim.SasiaStokut;
            produkti.DataPerditsimit = DateTime.Now;

            if (secondLatestTeDhenat == null)
            {
                produkti.QmimiProduktit = 0;
                produkti.QmimiBleres = 0;
                produkti.QmimiMeShumic = 0;
            }
            else
            {
                produkti.QmimiProduktit = secondLatestTeDhenat.QmimiShites;
                produkti.QmimiBleres = secondLatestTeDhenat.QmimiBleres;
                produkti.QmimiMeShumic = secondLatestTeDhenat.QmimiShitesMeShumic;
            }

            if (produkti.DataKrijimit == null)
            {
                produkti.DataKrijimit = produkti.DataKrijimit;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            var result = new
            {
                SecondLatestTeDhenat = secondLatestTeDhenat,
                ProduktiNeKalkulim = produktiNeKalkulim,
                Produkti = produkti
            };

            return Ok(result); // Return both details

        }

        [Authorize]
        [HttpGet]
        [Route("hapAsgjesiminKthimin/perditesoStokunQmimin")]
        public async Task<IActionResult> FshijAsgjesiminPerditesoStokun(int idProdukti, int idTeDhenatKalkulimit, string lloji)
        {
            var produktiNeKalkulim = await _context.TeDhenatFaturat.FirstOrDefaultAsync(x => x.ID == idTeDhenatKalkulimit);


            var produkti = await _context.StokuQmimiProduktit.FindAsync(idProdukti);

            if (produkti == null)
            {
                return NotFound();
            }

            if (lloji == "AS")
            {
                produkti.SasiaNeStok += produktiNeKalkulim.SasiaStokut;
                produkti.DataPerditsimit = DateTime.Now;
            }

            if (lloji == "KMSH")
            {
                produkti.SasiaNeStok -= produktiNeKalkulim.SasiaStokut;
                produkti.DataPerditsimit = DateTime.Now;
            }

            _context.StokuQmimiProduktit.Update(produkti);
            await _context.SaveChangesAsync();

            var result = new
            {
                ProduktiNeKalkulim = produktiNeKalkulim,
                Produkti = produkti
            };

            return Ok(result); // Return both details

        }


        [Authorize]
        [HttpPost]
        [Route("ruajKalkulimin")]
        public async Task<IActionResult> Post(Faturat regjistrimet)
        {
            await _context.Faturat.AddAsync(regjistrimet);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Shto", regjistrimet.IDRegjistrimit.ToString(), $"Eshte sthuar fatura me NR: {regjistrimet.NrFatures}");

            return CreatedAtAction("Get", regjistrimet.IDRegjistrimit, regjistrimet);
        }

        [Authorize]
        [HttpPost]
        [Route("ruajKalkulimin/teDhenat")]
        public async Task<IActionResult> Post(TeDhenatFaturat teDhenat)
        {
            await _context.TeDhenatFaturat.AddAsync(teDhenat);
            await _context.SaveChangesAsync();

            return Ok(teDhenat);
        }



        [Authorize]
        [HttpPut]
        [Route("ruajKalkulimin/PerditesoTeDhenat")]
        public async Task<IActionResult> Put(int id, [FromBody] TeDhenatFaturat teDhenat)
        {
            var produkti = await _context.TeDhenatFaturat
                .Include(x => x.Produkti)
                .Include(x => x.Faturat)
                .FirstOrDefaultAsync(x => x.ID == id);
            if (produkti == null)
            {
                return NotFound();
            }

            var isParagon = false;
            string nrFatures = null;
            if (produkti.Faturat != null)
            {
                isParagon = produkti.Faturat.LlojiKalkulimit == "PARAGON";
                nrFatures = produkti.Faturat.NrFatures;
            }
            else
            {
                var fature = await _context.Faturat.FirstOrDefaultAsync(f => f.IDRegjistrimit == produkti.IDRegjistrimit);
                isParagon = fature?.LlojiKalkulimit == "PARAGON";
                nrFatures = fature?.NrFatures;
            }

            if (isParagon && produkti.QmimiShites != teDhenat.QmimiShites)
            {
                produkti.Rabati1 = 0;
                await LogAdminActionAsync("NdryshoQmimiPOS", produkti.IDProduktit?.ToString() ?? "0", $"U ndryshua cmimi i produktit: {produkti.Produkti?.EmriProduktit ?? "E panjohur"} ne POS nga {produkti.QmimiShites} € ne {teDhenat.QmimiShites} € (Sasia: {teDhenat.SasiaStokut}) - Fatura Nr: {nrFatures}");
            }
            else
            {
                produkti.Rabati1 = teDhenat.Rabati1;
            }

            produkti.SasiaStokut = teDhenat.SasiaStokut;
            produkti.QmimiBleres = teDhenat.QmimiBleres;
            produkti.QmimiShites = teDhenat.QmimiShites;
            produkti.QmimiShitesMeShumic = teDhenat.QmimiShitesMeShumic;
            produkti.Rabati2 = teDhenat.Rabati2;
            produkti.Rabati3 = teDhenat.Rabati3;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(produkti);
        }

        [Authorize]
        [HttpPut]
        [Route("ruajKalkulimin/perditesoStokunQmimin")]
        public async Task<IActionResult> Put(int id, [FromBody] StokuQmimiProduktit stoku)
        {
            var produkti = await _context.StokuQmimiProduktit.FindAsync(id);
            if (produkti == null)
            {
                return NotFound();
            }

            produkti.SasiaNeStok += stoku.SasiaNeStok;
            produkti.DataPerditsimit = DateTime.Now;
            produkti.QmimiProduktit = stoku.QmimiProduktit;
            produkti.QmimiBleres = stoku.QmimiBleres;
            produkti.QmimiMeShumic = stoku.QmimiMeShumic;

            if (stoku.DataKrijimit == null)
            {
                produkti.DataKrijimit = produkti.DataKrijimit;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(produkti);
        }

        [Authorize]
        [HttpPut]
        [Route("ruajKalkulimin/kalkulimifillestarvjetor/perditesoStokunQmimin")]
        public async Task<IActionResult> Putkalkulimifillestarvjetor(int id, [FromBody] StokuQmimiProduktit stoku)
        {
            var produkti = await _context.StokuQmimiProduktit.FindAsync(id);
            if (produkti == null)
            {
                return NotFound();
            }

            produkti.SasiaNeStok = stoku.SasiaNeStok;
            produkti.DataPerditsimit = DateTime.Now;
            produkti.QmimiProduktit = stoku.QmimiProduktit;
            produkti.QmimiBleres = stoku.QmimiBleres;
            produkti.QmimiMeShumic = stoku.QmimiMeShumic;

            if (stoku.DataKrijimit == null)
            {
                produkti.DataKrijimit = produkti.DataKrijimit;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(produkti);
        }

        [Authorize]
        [HttpPut]
        [Route("FaturoOferten/PerditesoStokun")]
        public async Task<IActionResult> FaturoOfertenPerditesoStokun(int id, string lloji, double stoku)
        {
            var produkti = await _context.StokuQmimiProduktit.FindAsync(id);
            if (produkti == null)
            {
                return NotFound();
            }

            if (lloji == "FAT")
            {
                produkti.SasiaNeStok -= (decimal)stoku;
                produkti.DataPerditsimit = DateTime.Now;
            }

            if (lloji == "FL")
            {
                produkti.SasiaNeStok += (decimal)stoku;
                produkti.DataPerditsimit = DateTime.Now;
            }

            try
            {
                _context.StokuQmimiProduktit.Update(produkti);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(produkti);
        }

        [Authorize]
        [HttpPut]
        [Route("ruajKalkulimin/perditesoStatusinKalkulimit")]
        public async Task<IActionResult> Put(int id, string statusi)
        {
            var kalkulimi = await _context.Faturat.FindAsync(id);
            if (kalkulimi == null)
            {
                return NotFound();
            }

            kalkulimi.StatusiKalkulimit = statusi;

            var StatusiShqip = statusi == "true" ? "I Hapur" : "I Mbyllut";

            try
            {
                await _context.SaveChangesAsync();
                await LogAdminActionAsync("Perditeso", id.ToString(), $"Eshte bere perditesimi i statusit te kalkulimit me NR: {id} - {StatusiShqip}");
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(kalkulimi);
        }

        [Authorize]
        [HttpPut]
        [Route("BartNgaPranimiMallitKalkulim")]
        public async Task<IActionResult> BartNgaPranimiMallitKalkulim(int id, int idPartneri)
        {
            var kalkulimi = await _context.Faturat.FindAsync(id);
            var nrRendorFatures = await _context.Faturat.Where(x => x.LlojiKalkulimit == "HYRJE").CountAsync();

            if (kalkulimi == null)
            {
                return NotFound();
            }

            kalkulimi.LlojiKalkulimit = "HYRJE";
            kalkulimi.NrRendorFatures = nrRendorFatures + 1;
            kalkulimi.StafiID = idPartneri;

            try
            {
                await _context.SaveChangesAsync();

                await LogAdminActionAsync("BartNgaPranimMalli", id.ToString(), $"Eshte bere bartja e kalkulimit nr: {id}");
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(kalkulimi);
        }

        [Authorize]
        [HttpPut]
        [Route("FaturoOferten")]
        public async Task<IActionResult> FaturoOferten(int id)
        {
            var oferta = await _context.Faturat.FindAsync(id);
            if (oferta == null)
            {
                return NotFound();
            }

            oferta.EshteFaturuarOferta = "true";

            try
            {
                await _context.SaveChangesAsync();

                await LogAdminActionAsync("FaturoOferten", oferta.NrFatures.ToString(), $"Eshte faturuar oferta: {oferta.NrFatures}");
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(oferta);
        }



        [Authorize]
        [HttpPut]
        [Route("ruajKalkulimin/asgjesoStokun/perditesoStokunQmimin")]
        public async Task<IActionResult> AsgjesoStokunPerditesoStokunQmimin(int id, [FromBody] StokuQmimiProduktit stoku)
        {
            var produkti = await _context.StokuQmimiProduktit.FindAsync(id);
            if (produkti == null)
            {
                return NotFound();
            }

            produkti.SasiaNeStok -= stoku.SasiaNeStok;
            produkti.DataPerditsimit = DateTime.Now;

            if (stoku.DataKrijimit == null)
            {
                produkti.DataKrijimit = produkti.DataKrijimit;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(produkti);
        }

        [Authorize]
        [HttpPut]
        [Route("perditesoFaturen")]
        public async Task<IActionResult> PerditesoFaturen(int idKalulimit, [FromBody] Faturat fat)
        {
            var fatura = await _context.Faturat.FindAsync(idKalulimit);
            if (fatura == null)
            {
                return NotFound();
            }

            if (fat.Rabati != null)
            {
                fatura.Rabati = fat.Rabati;
            }
            if (fat.NrFatures != null)
            {
                fatura.NrFatures = fat.NrFatures;
            }
            if (fat.NrRendorFatures != null)
            {
                fatura.NrRendorFatures = fat.NrRendorFatures;
            }
            if (fat.StatusiPageses != null)
            {
                fatura.StatusiPageses = fat.StatusiPageses;
            }
            if (fat.StatusiKalkulimit != null)
            {
                fatura.StatusiKalkulimit = fat.StatusiKalkulimit;
            }
            if (fat.IDPartneri != null)
            {
                fatura.IDPartneri = fat.IDPartneri;
            }
            if (fat.LlojiKalkulimit != null)
            {
                fatura.LlojiKalkulimit = fat.LlojiKalkulimit;
            }
            if (fat.LlojiPageses != null)
            {
                fatura.LlojiPageses = fat.LlojiPageses;
            }
            if (fat.PershkrimShtese != null)
            {
                fatura.PershkrimShtese = fat.PershkrimShtese;
            }
            if (fat.StafiID != null)
            {
                fatura.StafiID = fat.StafiID;
            }
            if (fat.TotaliPaTVSH != null)
            {
                fatura.TotaliPaTVSH = fat.TotaliPaTVSH;
            }
            if (fat.TVSH != null)
            {
                fatura.TVSH = fat.TVSH;
            }
            if (fat.DataRegjistrimit != null)
            {
                fatura.DataRegjistrimit = fat.DataRegjistrimit;
            }
            if (fat.EshteFaturuarOferta != null)
            {
                fatura.EshteFaturuarOferta = fat.EshteFaturuarOferta;
            }
            if (fat.IDBonusKartela != null)
            {
                fatura.IDBonusKartela = fat.IDBonusKartela;
            }


            try
            {
                await _context.SaveChangesAsync();

                if (fatura.LlojiKalkulimit != "PARAGON")
                {
                    await LogAdminActionAsync("Perditeso", idKalulimit.ToString() ?? 0.ToString(), $"Eshte bere perditesimi i kalkulimit: {idKalulimit} - {fat?.Partneri?.EmriBiznesit}");
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok(fatura);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijKalkulimin")]
        public async Task<IActionResult> fshijKalkulimin(int idKalkulimi)
        {
            var kalkulimi = await _context.Faturat.Include(x => x.Partneri).FirstOrDefaultAsync(x => x.IDRegjistrimit == idKalkulimi);
            var teDhenatKalkulimit = await _context.TeDhenatFaturat.Where(x => x.IDRegjistrimit == idKalkulimi).ToListAsync();

            foreach (var teDhenat in teDhenatKalkulimit)
            {
                _context.TeDhenatFaturat.Remove(teDhenat);
            }

            _context.Faturat.Remove(kalkulimi);

            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Largo", idKalkulimi.ToString(), $"Eshte bere largimi i kalkulimit me numer: {kalkulimi.IDRegjistrimit} - {kalkulimi.Partneri.EmriBiznesit}");


            return Ok();
        }

        [Authorize]
        [HttpDelete]
        [Route("ruajKalkulimin/FshijTeDhenat")]
        public async Task<IActionResult> Delete(int idTeDhenat)
        {
            var produkti = await _context.TeDhenatFaturat.FirstOrDefaultAsync(x => x.ID == idTeDhenat);

            if (produkti == null)
                return BadRequest("Invalid id");

            _context.TeDhenatFaturat.Remove(produkti);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpDelete]
        [Route("ruajKalkulimin/FshijTeDhenatNgaIdKalkulimit")]
        public async Task<IActionResult> DeleteByIdKalkulimi(int idKalkulimi)
        {
            var teDhenatKalkulimi = await _context.TeDhenatFaturat.Where(x => x.IDRegjistrimit == idKalkulimi).ToListAsync();

            if (teDhenatKalkulimi == null)
                return BadRequest("Invalid id");

            foreach (var produkti in teDhenatKalkulimi)
            {
                _context.TeDhenatFaturat.Remove(produkti);
            }

            await _context.SaveChangesAsync();



            return NoContent();
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("shtoFaturen")]
        public async Task<ActionResult<object>> ShtoFaturen([FromBody] ImportFaturaDto dto)
        {
            try
            {

                // Check if partner exists
                var partner = await _context.Partneri.FindAsync(dto.IDKlienti);
                if (partner == null)
                {
                    return NotFound(new { message = "Partneri nuk u gjet" });
                }

                var staffId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var staff = await _context.Perdoruesi.FirstOrDefaultAsync(x => x.AspNetUserID == staffId);
                int currentUserId = 0;
                if (staff != null)
                {
                    currentUserId = staff.UserID;
                }
                else { currentUserId = 9; }

                var fatura = new Faturat
                {
                    NrFatures = dto.NrFatures,
                    DataRegjistrimit = dto.Data ?? DateTime.Now,
                    StafiID = currentUserId,
                    IDPartneri = dto.IDKlienti,
                    LlojiPageses = dto.LlojiPageses ?? "Cash",
                    TotaliPaTVSH = dto.TotaliPaTVSH ?? 0,
                    TVSH = dto.TVSH ?? 0,
                    Rabati = dto.Rabati ?? 0,
                    LlojiKalkulimit = dto.LlojiKalkulimit ?? "HYRJE",
                    StatusiPageses = dto.StatusiPageses ?? "Pa Paguar",
                    StatusiKalkulimit = "true",

                    Transporti = dto.Transporti ?? 0
                };

                await _context.Faturat.AddAsync(fatura);
                await _context.SaveChangesAsync();

                await LogAdminActionAsync("ShtoPorosiOnline", fatura.NrFatures.ToString(), $"Eshte bere vendosja e porosis numer: {fatura.NrFatures} - {fatura.Partneri.EmriBiznesit}");

                return Ok(new
                {
                    idFatura = fatura.IDRegjistrimit,
                    nrFatures = fatura.NrFatures,
                    message = "Fatura u shtua me sukses"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gabim në shtimin e faturës", error = ex.Message });
            }
        }

        // POST: api/Faturat/shtoTeDhenatFatura
        [HttpPost("shtoTeDhenatFatura")]
        public async Task<ActionResult<object>> ShtoTeDhenatFatura([FromBody] ImportTeDhenatFaturaDto dto)
        {
            try
            {
                if (dto.IDFatura <= 0 || dto.IDProdukti <= 0)
                {
                    return BadRequest(new { message = "IDFatura dhe IDProdukti janë të detyrueshëm" });
                }

                var fatura = await _context.Faturat.FindAsync(dto.IDFatura);
                if (fatura == null)
                {
                    return NotFound(new { message = "Fatura nuk u gjet" });
                }

                var produkti = await _context.Produkti.FindAsync(dto.IDProdukti);
                if (produkti == null)
                {
                    return NotFound(new { message = "Produkti nuk u gjet" });
                }

                var teDhenat = new TeDhenatFaturat
                {
                    IDRegjistrimit = dto.IDFatura,
                    IDProduktit = dto.IDProdukti,
                    SasiaStokut = dto.Sasia ?? 0,
                    QmimiShites = dto.Qmimi ?? 0,
                    Rabati1 = dto.Rabati ?? 0,
                };

                var stokuProduktit = await _context.StokuQmimiProduktit.FirstOrDefaultAsync(sp => sp.ProduktiID == dto.IDProdukti);

                if (stokuProduktit != null)
                {
                    stokuProduktit.SasiaNeStok -= teDhenat.SasiaStokut;
                    stokuProduktit.DataPerditsimit = DateTime.Now;
                    _context.StokuQmimiProduktit.Update(stokuProduktit);
                }

                _context.TeDhenatFaturat.Add(teDhenat);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    idTeDhenatFatura = teDhenat.ID,
                    message = "Të dhënat e faturës u shtuan me sukses"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gabim në shtimin e të dhënave të faturës", error = ex.Message });
            }
        }

        // GET: api/Faturat/kerkoFatureNgaNumri
        [HttpGet("kerkoFatureNgaNumri")]
        public async Task<ActionResult<object>> KerkoFatureNgaNumri([FromQuery] string nrFatures)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(nrFatures))
                {
                    return BadRequest(new { message = "Numri i faturës është i detyrueshëm" });
                }

                var fatura = await _context.Faturat
                    .Include(f => f.Partneri)
                    .FirstOrDefaultAsync(f => f.NrFatures == nrFatures);

                if (fatura == null)
                {
                    return Ok();
                }

                return Ok(new
                {
                    idFatura = fatura.IDRegjistrimit,
                    nrFatures = fatura.NrFatures,
                    data = fatura.DataRegjistrimit,
                    emriPartnerit = fatura.Partneri != null ? fatura.Partneri.EmriBiznesit : "N/A",
                    statusiPageses = fatura.StatusiPageses
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gabim në kërkimin e faturës", error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet]
        [Route("qmimore/getOrCreateActive")]
        public async Task<IActionResult> GetOrCreateActiveQmimore()
        {
            try
            {
                var active = await _context.Faturat
                    .Where(x => x.LlojiKalkulimit == "ETIKETA" && x.NrFatures == "QMIMORE-LISTA-KRYESORE")
                    .FirstOrDefaultAsync();

                if (active == null)
                {
                    active = new Faturat
                    {
                        DataRegjistrimit = DateTime.Now,
                        LlojiKalkulimit = "ETIKETA",
                        StatusiKalkulimit = "false",
                        NrFatures = "QMIMORE-LISTA-KRYESORE",
                        StatusiPageses = "E Paguar",
                        LlojiPageses = "Cash",
                        PershkrimShtese = "Qmimore Permanent Print Queue",
                        NrRendorFatures = 999999
                    };
                    await _context.Faturat.AddAsync(active);
                    await _context.SaveChangesAsync();
                }

                return Ok(active);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gabim gjate krijimit te qmimores", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost]
        [Route("qmimore/shtoProdukt")]
        public async Task<IActionResult> ShtoProduktQmimore(int idRegjistrimit, int idProduktit)
        {
            try
            {
                var produkti = await _context.Produkti
                    .Include(p => p.StokuQmimiProduktit)
                    .FirstOrDefaultAsync(p => p.ProduktiID == idProduktit);

                if (produkti == null)
                {
                    return NotFound(new { message = "Produkti nuk u gjet." });
                }

                var ekziston = await _context.TeDhenatFaturat
                    .Where(x => x.IDRegjistrimit == idRegjistrimit && x.IDProduktit == idProduktit)
                    .FirstOrDefaultAsync();

                if (ekziston != null)
                {
                    ekziston.SasiaStokut += 1;
                    _context.TeDhenatFaturat.Update(ekziston);
                }
                else
                {
                    decimal qmimiShites = produkti.StokuQmimiProduktit?.QmimiProduktit ?? 0;
                    decimal qmimiShitesMeShumic = produkti.StokuQmimiProduktit?.QmimiMeShumic ?? 0;
                    decimal qmimiBleres = produkti.StokuQmimiProduktit?.QmimiBleres ?? 0;

                    var eRe = new TeDhenatFaturat
                    {
                        IDRegjistrimit = idRegjistrimit,
                        IDProduktit = idProduktit,
                        SasiaStokut = 1,
                        QmimiBleres = qmimiBleres,
                        QmimiShites = qmimiShites,
                        QmimiShitesMeShumic = qmimiShitesMeShumic,
                        Rabati1 = 0,
                        Rabati2 = 0,
                        Rabati3 = 0
                    };
                    await _context.TeDhenatFaturat.AddAsync(eRe);
                }

                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gabim gjate shtimit te produktit", error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost]
        [Route("qmimore/pastroTabelen")]
        public async Task<IActionResult> PastroTabelenQmimore(int idRegjistrimit)
        {
            try
            {
                var teDhenat = await _context.TeDhenatFaturat
                    .Where(x => x.IDRegjistrimit == idRegjistrimit)
                    .ToListAsync();

                _context.TeDhenatFaturat.RemoveRange(teDhenat);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Gabim gjate pastrimit te qmimores", error = ex.Message });
            }
        }
    }

    // Import DTOs
    public class ImportFaturaDto
    {
        public string? NrFatures { get; set; }
        public DateTime? Data { get; set; }
        public int? IDKlienti { get; set; }
        public decimal? TotaliPaTVSH { get; set; }
        public decimal? TVSH { get; set; }
        public decimal? Rabati { get; set; }
        public decimal? Transporti { get; set; }
        public decimal? Totali { get; set; }
        public string? LlojiPageses { get; set; }
        public string? StatusiPageses { get; set; }
        public string? LlojiKalkulimit { get; set; } = "ONLINE";
    }

    public class ImportTeDhenatFaturaDto
    {
        public int IDFatura { get; set; }
        public int IDProdukti { get; set; }
        public decimal? Sasia { get; set; }
        public decimal? Qmimi { get; set; }
        public int? Rabati { get; set; }
    }

}

