using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text.Encodings.Web;
using System.Text.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace TechStoreWebAPI.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class ExportoTeDhenatTekKlientiController : Controller
    {
        private readonly FinanCareDbContext _context;

        public ExportoTeDhenatTekKlientiController(FinanCareDbContext context)
        {
            _context = context;
        }


        [AllowAnonymous]
        [HttpPost("BartTeDhenatEProdukteve")]
        public async Task<IActionResult> BartTeDhenatEProdukteve()
        {
            try
            {
                var products = await _context.Produkti
                    .Where(x => (x.isDeleted == "false" || x.isDeleted == null) && x.perfshiNeOnline == "true") // safer check
                    .Select(p => new
                    {
                        ProduktiID = p.ProduktiID,
                        EmriProduktit = p.EmriProduktit,
                        Barkodi = p.Barkodi ?? "",
                        FotoProduktit = p.FotoProduktit ?? "ProduktPaFoto.png",
                        IDGrupiProduktit = p.IDGrupiProduktit,
                        IDNjesiaMatese = p.IDNjesiaMatese,
                        LlojiTVSH = p.LlojiTVSH,
                        isDeleted = p.isDeleted ?? "false",

                        // Always return a non-nullable anonymous object
                        StokuQmimiProduktit = new
                        {
                            SasiaNeStok = p.StokuQmimiProduktit != null
            ? p.StokuQmimiProduktit.SasiaNeStok ?? 0
            : 0,

                            QmimiProduktit = p.StokuQmimiProduktit != null
            ? p.StokuQmimiProduktit.QmimiProduktit ?? 0m
            : 0m,
                        },

                        ZbritjaQmimitProduktit = new
                        {

                            Rabati = p.ZbritjaQmimitProduktit.Rabati ?? 0,
                            DataZbritjes = p.ZbritjaQmimitProduktit.DataZbritjes,
                            DataSkadimit = p.ZbritjaQmimitProduktit.DataSkadimit,
                        }
                    })
.OrderByDescending(p => p.StokuQmimiProduktit.SasiaNeStok)
.ThenByDescending(p => p.ProduktiID)
.ToListAsync();

                // REMOVED JsonNamingPolicy.CamelCase → keeps your exact property names (PascalCase)
                var json = JsonSerializer.Serialize(products, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    // PropertyNamingPolicy = null → this is the key!
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                });

                // Correct path to Vite project (adjust if your structure differs)
                var baseDir = Directory.GetCurrentDirectory();
                var targetFolder = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "financareonline", "src", "data"));
                Directory.CreateDirectory(targetFolder);

                var filePath = Path.Combine(targetFolder, "products.json");

                await System.IO.File.WriteAllTextAsync(filePath, json);

                return Ok(new
                {
                    success = true,
                    message = "products.json u rifreskua me sukses!",
                    total = products.Count,
                    file = "financareonline/src/data/products.json",
                    generatedAt = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [AllowAnonymous]
        [HttpPost("BartTeDhenatEPerdorueseve")]
        public async Task<IActionResult> BartTeDhenatEPerdorueseve()
        {
            try
            {
                var partneret = await _context.Partneri
                    .Where(p => (p.isDeleted == "false" || p.isDeleted == null) && p.LlojiPartnerit == "B")
                    .Select(p => new
                    {
                        IDPartneri = p.IDPartneri,
                        EmriBiznesit = p.EmriBiznesit ?? "",
                        NUI = p.NUI ?? "",
                        NRF = p.NRF ?? "",
                        TVSH = p.TVSH ?? "",
                        Email = p.Email ?? "",
                        Adresa = p.Adresa ?? "",
                        NrKontaktit = p.NrKontaktit ?? "",
                        ShkurtesaPartnerit = p.ShkurtesaPartnerit ?? "",
                        Username = p.Username ?? "",
                        Password = p.Password ?? "",
                        isDeleted = p.isDeleted ?? "false",
                        p.Kartela.LlojiKarteles,
                        p.Kartela.KodiKartela,
                        p.Kartela.Rabati
                    })
                    .OrderBy(p => p.IDPartneri)
                    .ToListAsync();

                // Keep PascalCase (no camelCase)
                var json = JsonSerializer.Serialize(partneret, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = null,
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                });

                // Correct path to your Vite frontend
                var baseDir = Directory.GetCurrentDirectory(); // e.g. backend\bin\Debug\net8.0
                var targetFolder = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "financareonline", "src", "data"));
                Directory.CreateDirectory(targetFolder); // creates folder if it doesn't exist

                var filePath = Path.Combine(targetFolder, "users.json"); // → users.json

                await System.IO.File.WriteAllTextAsync(filePath, json);

                return Ok(new
                {
                    success = true,
                    message = "users.json u rifreskua me sukses!",
                    total = partneret.Count,
                    file = "financareonline/src/data/users.json",
                    generatedAt = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [AllowAnonymous]
        [HttpPost("BartTeDhenatEKategorive")]
        public async Task<IActionResult> BartTeDhenatEKategorive()
        {
            try
            {
                var grupet = await _context.GrupiProduktit
                    .Where(g => g.isDeleted == "false" || g.isDeleted == null)
                    .Select(g => new
                    {
                        IDGrupiProduktit = g.IDGrupiProduktit,
                        GrupiIProduktit = g.GrupiIProduktit ?? "",
                        isDeleted = g.isDeleted ?? "false"
                    })
                    .OrderBy(g => g.IDGrupiProduktit)
                    .ToListAsync();

                var json = JsonSerializer.Serialize(grupet, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = null, // Keeps exact PascalCase names
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                });

                // Path to your Vite frontend
                var baseDir = Directory.GetCurrentDirectory();
                var targetFolder = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "financareonline", "src", "data"));
                Directory.CreateDirectory(targetFolder);

                var filePath = Path.Combine(targetFolder, "categories.json");

                await System.IO.File.WriteAllTextAsync(filePath, json);

                return Ok(new
                {
                    success = true,
                    message = "categories.json u gjenerua me ssukses!",
                    total = grupet.Count,
                    file = "financareonline/src/data/categories.json",
                    generatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [AllowAnonymous]
        [HttpPost("BartTeDhenatEBiznesit")]
        public async Task<IActionResult> BartTeDhenatEBiznesit()
        {
            try
            {
                // 1. Merr të dhënat kryesore të biznesit
                var biz = await _context.TeDhenatBiznesit
                    .OrderBy(b => b.IDTeDhenatBiznesit)
                    .Select(b => new
                    {
                        IDTeDhenatBiznesit = b.IDTeDhenatBiznesit,
                        EmriIBiznesit = b.EmriIBiznesit ?? "",
                        ShkurtesaEmritBiznesit = b.ShkurtesaEmritBiznesit ?? "",
                        NUI = b.NUI.ToString() ?? "",
                        NF = b.NF.ToString() ?? "",
                        NrTVSH = b.NrTVSH.ToString() ?? "",
                        Adresa = b.Adresa ?? "",
                        NrKontaktit = b.NrKontaktit ?? "",
                        Email = b.Email ?? "",
                        Logo = b.Logo ?? "logo.png",
                        EmailDomain = b.EmailDomain ?? ""
                    })
                    .FirstOrDefaultAsync();

                if (biz == null)
                {
                    return NotFound(new { success = false, message = "Nuk u gjet asnjë biznes në databazë." });
                }

                // 2. Merr të gjitha llogaritë bankare + emrin dhe lokacionin e bankës
                var llogariteBankare = await _context.LlogaritEBiznesit
                    .Include(l => l.Banka) // Sigurohemi që ngarkohet Banka
            .Where(l => l.Banka == null || l.Banka.isDeleted != "true")
                    .Select(l => new
                    {
                        IDLlogariaBankare = l.IDLlogariaBankare,
                        NumriLlogaris = l.NumriLlogaris ?? "",
                        AdresaBankes = l.AdresaBankes ?? "",
                        Valuta = l.Valuta ?? "ALL",
                        EmriBankes = l.Banka != null ? l.Banka.EmriBankes ?? "" : "",
                        LokacioniBankes = l.Banka != null ? l.Banka.LokacioniBankes ?? "" : ""
                    })
                    .ToListAsync();

                // 3. Bashkojmë të gjitha në një objekt të vetëm
                var dataPerFrontend = new
                {
                    business = biz,
                    bankAccounts = llogariteBankare,
                    generatedAt = DateTime.UtcNow
                };

                // 4. Serializo në JSON të bukur
                var json = JsonSerializer.Serialize(dataPerFrontend, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = null,
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                });

                // 5. Ruaje në folderin e klientit (React)
                var baseDir = Directory.GetCurrentDirectory();
                var targetFolder = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "financareonline", "src", "data"));
                Directory.CreateDirectory(targetFolder);
                var filePath = Path.Combine(targetFolder, "business.json");

                await System.IO.File.WriteAllTextAsync(filePath, json);

                return Ok(new
                {
                    success = true,
                    message = "business.json u gjenerua me sukses (me banka + llogari)!",
                    file = "financareonline/src/data/business.json",
                    totalBankAccounts = llogariteBankare.Count,
                    generatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

    }
}
