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
    public class ProduktiController : Controller
    {
        private readonly FinanCareDbContext _context;

        public ProduktiController(FinanCareDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        [Route("Products")]
        public async Task<ActionResult> Get()
        {

            var Produkti = await _context.Produkti
                .Where(x => x.isDeleted == "false")
                .OrderByDescending(p => p.StokuQmimiProduktit.SasiaNeStok)
                .ThenByDescending(p => p.ProduktiID)
               .Select(p => new
               {
                   p.ProduktiID,
                   p.EmriProduktit,
                   p.IDPartneri,
                   p.Partneri.EmriBiznesit,
                   p.IDNjesiaMatese,
                   p.NjesiaMatese.EmriNjesiaMatese,
                   p.Barkodi,
                   p.KodiProduktit,
                   p.LlojiTVSH,
                   p.StokuQmimiProduktit.SasiaNeStok,
                   p.StokuQmimiProduktit.QmimiProduktit,
                   p.StokuQmimiProduktit.QmimiBleres,
                   p.StokuQmimiProduktit.QmimiMeShumic,
                   p.ZbritjaQmimitProduktit.Rabati,
                   p.SasiaShumices,
                   p.IDGrupiProduktit,
                   p.GrupiProduktit.GrupiIProduktit,
               })
               .ToListAsync();

            return Ok(Produkti);
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqProduktinNgaID")]
        public async Task<ActionResult> ShfaqProduktinNgaID(int id)
        {

            var Produkti = await _context.Produkti
                .Where(x => x.isDeleted == "false")
                .OrderByDescending(p => p.StokuQmimiProduktit.SasiaNeStok)
                .ThenByDescending(p => p.ProduktiID)
               .Select(p => new
               {
                   p.ProduktiID,
                   p.EmriProduktit,
                   p.IDPartneri,
                   p.Partneri.EmriBiznesit,
                   p.IDNjesiaMatese,
                   p.NjesiaMatese.EmriNjesiaMatese,
                   p.Barkodi,
                   p.KodiProduktit,
                   p.LlojiTVSH,
                   p.StokuQmimiProduktit.SasiaNeStok,
                   p.StokuQmimiProduktit.QmimiProduktit,
                   p.StokuQmimiProduktit.QmimiBleres,
                   p.StokuQmimiProduktit.QmimiMeShumic,
                   p.ZbritjaQmimitProduktit.Rabati,
                   p.SasiaShumices,
                   p.IDGrupiProduktit,
                   p.GrupiProduktit.GrupiIProduktit,
               }).Where(x => x.ProduktiID == id)
               .FirstOrDefaultAsync();

            if(Produkti == null)
            {
                return BadRequest("Produkti nuk egziston");
            }

            return Ok(Produkti);
        }

        [Authorize]
        [HttpGet]
        [Route("ProduktetPerKalkulim")]
        public async Task<ActionResult> ProduktetPerKalkulim()
        {

            var Produkti = await _context.Produkti
                .Where(x => x.isDeleted == "false")
               .OrderBy(x => x.StokuQmimiProduktit.SasiaNeStok)
               .ThenByDescending(x => x.ProduktiID)
               .Select(p => new
               {
                   p.ProduktiID,
                   p.EmriProduktit,
                   p.IDPartneri,
                   p.Partneri.EmriBiznesit,
                   p.IDNjesiaMatese,
                   p.NjesiaMatese.EmriNjesiaMatese,
                   p.Barkodi,
                   p.KodiProduktit,
                   p.LlojiTVSH,
                   p.StokuQmimiProduktit.SasiaNeStok,
                   p.StokuQmimiProduktit.QmimiProduktit,
                   p.StokuQmimiProduktit.QmimiBleres,
                   p.StokuQmimiProduktit.QmimiMeShumic,
                   p.ZbritjaQmimitProduktit.Rabati,
                   p.SasiaShumices,
                   p.IDGrupiProduktit,
                   p.GrupiProduktit.GrupiIProduktit,
               })
               .ToListAsync();

            return Ok(Produkti);
        }

        [Authorize]
        [HttpGet]
        [Route("GetStokuProduktit")]
        public async Task<ActionResult> GetStokuProduktit(int id)
        {

            var Produkti = await _context.Produkti
               .OrderBy(x => x.StokuQmimiProduktit.SasiaNeStok)
               .ThenByDescending(x => x.ProduktiID)
               .Select(p => new
               {
                   p.ProduktiID,
                   p.EmriProduktit,
                   p.StokuQmimiProduktit.SasiaNeStok,
               })
               .Where(x => x.ProduktiID == id).FirstOrDefaultAsync();

            if(Produkti == null)
            {
                return BadRequest("Produkti nuk u Gjet");
            }

            return Ok(Produkti);
        }

        [Authorize]
        [HttpGet]
        [Route("GetKodiProduktitPerRegjistrim")]
        public async Task<IActionResult> GetKodiProduktitPerRegjistrim(int IDPartneri)
        {
            var partneri = await _context.Partneri.FirstOrDefaultAsync(x => x.IDPartneri == IDPartneri);

            var totaliProdukteveNgaPartneri = await _context.Produkti.Where(x => x.IDPartneri == IDPartneri).CountAsync();

            var kodiProduktit = $"{partneri.ShkurtesaPartnerit.ToUpper()}{totaliProdukteveNgaPartneri + 1:D4}";

            return Ok(kodiProduktit);
        }

        [Authorize]
        [HttpGet]
        [Route("KartelaArtikullit")]
        public async Task<ActionResult> GetById(int id)
        {
            var produkti = await _context.Produkti
                .Include(p => p.Partneri)
                .Include(p => p.NjesiaMatese)
                .Include(p => p.StokuQmimiProduktit)
                .Where(p => p.ProduktiID == id)
                .Select(p => new
                {
                    p.ProduktiID,
                    p.EmriProduktit,
                    p.Partneri.EmriBiznesit,
                    p.NjesiaMatese.EmriNjesiaMatese,
                    p.Barkodi,
                    p.KodiProduktit,
                    p.LlojiTVSH,
                    p.StokuQmimiProduktit.SasiaNeStok,
                    p.StokuQmimiProduktit.QmimiProduktit,
                    p.StokuQmimiProduktit.QmimiBleres,
                    p.StokuQmimiProduktit.QmimiMeShumic,
                    p.ZbritjaQmimitProduktit.Rabati,
                    p.SasiaShumices,
                    p.GrupiProduktit.GrupiIProduktit,
                })
                .FirstOrDefaultAsync();

            var kalkulimet = await _context.TeDhenatFaturat
                .Include(x => x.Faturat)
                .Where(x => x.IDProduktit == id && x.Faturat.StatusiKalkulimit.Equals("true") && x.Faturat.LlojiKalkulimit != "OFERTE")
                .Select(x => new
                {
                    x.ID,
                    x.SasiaStokut,
                    x.QmimiBleres,
                    x.QmimiShites,
                    x.QmimiShitesMeShumic,
                    x.Rabati1,
                    x.Rabati2,
                    x.Rabati3,
                    x.Faturat.DataRegjistrimit,
                    x.Faturat.LlojiKalkulimit,
                    x.Faturat.NrRendorFatures,
                    x.Faturat.Partneri.EmriBiznesit,
                })
                .ToListAsync();

            var kalkulimetHyrese = await _context.TeDhenatFaturat
                .Include(x => x.Faturat)
                .Where(x => x.IDProduktit == id &&
                    (x.Faturat.LlojiKalkulimit.Equals("HYRJE")
                    || x.Faturat.LlojiKalkulimit.Equals("FL")
                    || x.Faturat.LlojiKalkulimit.Equals("KMSH")
                    ) && x.Faturat.StatusiKalkulimit.Equals("true")
                )
                .ToListAsync();


            var kalkulimetDalese = await _context.TeDhenatFaturat
                .Include(x => x.Faturat)
                .Where(x => x.IDProduktit == id &&
                    (x.Faturat.LlojiKalkulimit.Equals("FAT")
                    || x.Faturat.LlojiKalkulimit.Equals("AS")
                    || x.Faturat.LlojiKalkulimit.Equals("KMB")
                    ) && x.Faturat.StatusiKalkulimit.Equals("true")
                )
                .ToListAsync();

            decimal TotaliHyrese = 0;
            decimal TotaliDalese = 0;

            foreach (var produktiNeKalkulim in kalkulimetHyrese)
            {
                TotaliHyrese += produktiNeKalkulim.SasiaStokut ?? 0;
            }

            foreach (var produktiNeKalkulim in kalkulimetDalese)
            {
                TotaliDalese += produktiNeKalkulim.SasiaStokut ?? 0;
            }

            var zbritjet = await _context.ZbritjaQmimitProduktit
                .Where(x => x.ProduktiID == id)
                .Select(x => new
                {
                    x.DataZbritjes,
                    x.DataSkadimit,
                    x.Rabati,
                })
                .ToListAsync();

            var hisotriaZbritjes = await _context.HistoriaZbritjeveProduktit
                .Where(x => x.ProduktiID == id).ToListAsync();


            if (produkti == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                produkti,
                kalkulimet,
                zbritjet,
                TotaliHyrese,
                TotaliDalese,
                hisotriaZbritjes
            });
        }


        [Authorize]
        [HttpPost]
        [Route("shtoProdukt")]
        public async Task<IActionResult> Post(Produkti produkti)
        {
            await _context.Produkti.AddAsync(produkti);
            await _context.SaveChangesAsync();

            StokuQmimiProduktit s = new StokuQmimiProduktit
            {
                ProduktiID = produkti.ProduktiID
            };

            await _context.StokuQmimiProduktit.AddAsync(s);
            await _context.SaveChangesAsync();

            return CreatedAtAction("Get", produkti.ProduktiID, produkti);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Produkti p)
        {
            var produkti = await _context.Produkti.FirstOrDefaultAsync(x => x.ProduktiID == id);
            var stokuQmimi = await _context.StokuQmimiProduktit.FirstOrDefaultAsync(x => x.ProduktiID == id);

            if (produkti == null || stokuQmimi == null)
            {
                return BadRequest("Produkti me këtë ID nuk ekziston");
            }

            if (!p.EmriProduktit.IsNullOrEmpty())
            {
                produkti.EmriProduktit = p.EmriProduktit;
            }

            if (p.IDNjesiaMatese != null)
            {
                produkti.IDNjesiaMatese = p.IDNjesiaMatese;
            }

            if (p.IDPartneri != null)
            {
                produkti.IDPartneri = p.IDPartneri;
            }

            if (p.Barkodi != null)
            {
                produkti.Barkodi = p.Barkodi;
            }

            if (p.KodiProduktit != null)
            {
                produkti.KodiProduktit = p.KodiProduktit;
            }

            if (p.LlojiTVSH != null)
            {
                produkti.LlojiTVSH = p.LlojiTVSH;
            }

            if (p.SasiaShumices != null)
            {
                produkti.SasiaShumices = p.SasiaShumices;
            }

            if (p.IDGrupiProduktit != null)
            {
                produkti.IDGrupiProduktit = p.IDGrupiProduktit;
            }

            if (p.StokuQmimiProduktit != null)
            {
                if (p.StokuQmimiProduktit.QmimiProduktit != null)
                {
                    stokuQmimi.QmimiProduktit = p.StokuQmimiProduktit.QmimiProduktit;
                }

                if (p.StokuQmimiProduktit.QmimiBleres != null)
                {
                    stokuQmimi.QmimiBleres = p.StokuQmimiProduktit.QmimiBleres;
                }

                if (p.StokuQmimiProduktit.SasiaNeStok != null)
                {
                    stokuQmimi.SasiaNeStok = p.StokuQmimiProduktit.SasiaNeStok;
                }

                if (p.StokuQmimiProduktit.QmimiMeShumic != null)
                {
                    stokuQmimi.QmimiMeShumic = p.StokuQmimiProduktit.QmimiMeShumic;
                }
            }

            _context.Produkti.Update(produkti);
            _context.StokuQmimiProduktit.Update(stokuQmimi);
            await _context.SaveChangesAsync();

            return Ok(produkti);
        }

        [Authorize]
        [HttpPut]
        [Route("bartjaArtikullit")]
        public async Task<IActionResult> BartjaArtikullit(int IDArtikulliVjeter, int IDArtikulliRi)
        {
            var produktiIVjeter = await _context.Produkti.FirstOrDefaultAsync(x => x.ProduktiID == IDArtikulliVjeter);
            var stokuQmimiIVjeter = await _context.StokuQmimiProduktit.FirstOrDefaultAsync(x => x.ProduktiID == IDArtikulliVjeter);
            var produktiIRi = await _context.Produkti.FirstOrDefaultAsync(x => x.ProduktiID == IDArtikulliRi);
            var stokuQmimiIRi = await _context.StokuQmimiProduktit.FirstOrDefaultAsync(x => x.ProduktiID == IDArtikulliRi);

            if (produktiIVjeter == null || stokuQmimiIVjeter == null || produktiIRi == null || stokuQmimiIRi == null)
            {
                return BadRequest("Produkti me këtë ID nuk ekziston");
            }


            if (stokuQmimiIVjeter != null)
            {
                if (stokuQmimiIVjeter.QmimiProduktit != null)
                {
                    stokuQmimiIRi.QmimiProduktit = stokuQmimiIVjeter.QmimiProduktit;
                }

                if (stokuQmimiIVjeter.QmimiBleres != null)
                {
                    stokuQmimiIRi.QmimiBleres = stokuQmimiIVjeter.QmimiBleres;
                }

                if (stokuQmimiIVjeter.SasiaNeStok != null)
                {
                    stokuQmimiIRi.SasiaNeStok += stokuQmimiIVjeter.SasiaNeStok;
                }

                if (stokuQmimiIVjeter.QmimiMeShumic != null)
                {
                    stokuQmimiIRi.QmimiMeShumic = stokuQmimiIVjeter.QmimiMeShumic;
                }
            }

            if (stokuQmimiIVjeter != null)
            {
                if (stokuQmimiIVjeter.QmimiProduktit != null)
                {
                    stokuQmimiIVjeter.QmimiProduktit = 0;
                }

                if (stokuQmimiIVjeter.QmimiBleres != null)
                {
                    stokuQmimiIVjeter.QmimiBleres = 0;
                }

                if (stokuQmimiIVjeter.SasiaNeStok != null)
                {
                    stokuQmimiIVjeter.SasiaNeStok = 0;
                }

                if (stokuQmimiIVjeter.QmimiMeShumic != null)
                {
                    stokuQmimiIVjeter.QmimiMeShumic = 0;
                }
            }

            //_context.Produkti.Update(produkti);
            _context.StokuQmimiProduktit.Update(stokuQmimiIRi);
            _context.StokuQmimiProduktit.Update(stokuQmimiIVjeter);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var produkti = await _context.Produkti.FirstOrDefaultAsync(x => x.ProduktiID == id);

            if (produkti == null)
                return BadRequest("Invalid id");

            produkti.isDeleted = "true";

            _context.Produkti.Update(produkti);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        

    }
}
