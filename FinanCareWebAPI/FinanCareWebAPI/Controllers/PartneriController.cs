using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FinanCareWebAPI.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class PartneriController : Controller
    {
        private readonly FinanCareDbContext _context;
        private readonly KartelaService _kartelaService;

        public PartneriController(FinanCareDbContext context, KartelaService kartelaService)
        {
            _context = context;
            _kartelaService = kartelaService;
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqPartnerinSipasIDs")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var partneri = await _context.Partneri
                .Where(x => x.isDeleted == "false")
                    .Include(p => p.Kartela) 
                    .FirstOrDefaultAsync(x => x.IDPartneri == id);

                if (partneri == null)
                {
                    return NotFound("Partneri nuk ekziston");
                }

                return Ok(partneri);
            }
            catch (Exception ex)
            {
                return BadRequest("Ndodhi një gabim: " + ex.Message);
            }
        }



        [Authorize]
        [HttpGet]
        [Route("shfaqPartneretSipasLlojit")]
        public async Task<IActionResult> GetSipasLlojit(string llojiPartnerit)
        {
            try
            {
                var partneri = await _context.Partneri.Include(p => p.Kartela).Where(x => x.LlojiPartnerit == llojiPartnerit && x.isDeleted == "false").ToListAsync();

                return Ok(partneri);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqPartneretFurntiore")]
        public async Task<IActionResult> GetFurnitoret()
        {
            try
            {
                var partneri = await _context.Partneri.Include(p => p.Kartela).Where(x => x.LlojiPartnerit != "B" && x.isDeleted == "false").ToListAsync();

                return Ok(partneri);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqPartneretBleres")]
        public async Task<IActionResult> GetBleresit()
        {
            try
            {
                var partneri = await _context.Partneri.Include(p => p.Kartela).Where(x => x.LlojiPartnerit != "F" && x.isDeleted == "false").ToListAsync();

                return Ok(partneri);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqPartneret")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var partneret = await _context.Partneri
                .Where(x => x.isDeleted == "false").Include(p => p.Kartela).ToArrayAsync();

                return Ok(partneret);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("KartelaFinanciare")]
        public async Task<ActionResult> GetById(int id)
        {
            var partneri = await _context.Partneri
                .Where(p => p.IDPartneri == id)
                .Include(x => x.Kartela)
                .Select(x => new
                {
                    x.IDPartneri,
                    x.EmriBiznesit,
                    x.NUI,
                    x.TVSH,
                    x.NRF,
                    x.Email,
                    x.Adresa,
                    x.NrKontaktit,
                    x.LlojiPartnerit,
                    x.ShkurtesaPartnerit,
                    x.Kartela
                })
                .FirstOrDefaultAsync();

            var kalkulimet = await _context.Faturat
                .Where(x => x.IDPartneri == id && x.StatusiKalkulimit.Equals("true") && x.LlojiKalkulimit != "OFERTE")
                .Select(x => new
                {
                    x.IDRegjistrimit,
                    x.DataRegjistrimit,
                    x.TotaliPaTVSH,
                    x.TVSH,
                    x.Rabati,
                    x.LlojiKalkulimit,
                    x.StatusiPageses,
                    x.LlojiPageses,
                    x.StatusiKalkulimit,
                    x.NrRendorFatures,
                    x.PershkrimShtese,
                    x.NrFatures
                })
                .ToListAsync();

            var kalkulimetDalese  = await _context.Faturat
                .Where(x => x.IDPartneri == id &&
                    (x.LlojiKalkulimit.Equals("FL")
                    || x.LlojiKalkulimit.Equals("KMSH")
                    || x.LlojiKalkulimit.Equals("PAGES")
                    || x.LlojiKalkulimit.Equals("KMB")
                    ) && x.StatusiKalkulimit.Equals("true")
                )
                .ToListAsync();


            var kalkulimetHyrese = await _context.Faturat
                .Where(x => x.IDPartneri == id &&
                    (x.LlojiKalkulimit.Equals("HYRJE")
                    || x.LlojiKalkulimit.Equals("FAT")
                    || x.LlojiKalkulimit.Equals("AS")
                    || x.LlojiKalkulimit.Equals("SALDO")
                    || x.LlojiKalkulimit.Equals("PARAGON")
                    || x.LlojiKalkulimit.Equals("FATURIM")
                    ) && x.StatusiKalkulimit.Equals("true")
                )
                .ToListAsync();

            decimal TotaliHyrese = 0;
            decimal TotaliDalese = 0;

            foreach (var produktiNeKalkulim in kalkulimetHyrese)
            {
                TotaliHyrese += (produktiNeKalkulim.TotaliPaTVSH + produktiNeKalkulim.TVSH - produktiNeKalkulim.Rabati) ?? 0;
            }

            foreach (var produktiNeKalkulim in kalkulimetDalese)
            {
                if((produktiNeKalkulim.TotaliPaTVSH + produktiNeKalkulim.TVSH - produktiNeKalkulim.Rabati) < 0)
                {
                    TotaliDalese += (produktiNeKalkulim.TotaliPaTVSH + produktiNeKalkulim.TVSH - produktiNeKalkulim.Rabati)*(-1) ?? 0;
                }
                else
                {
                    TotaliDalese += (produktiNeKalkulim.TotaliPaTVSH + produktiNeKalkulim.TVSH - produktiNeKalkulim.Rabati) ?? 0;
                }
                
            }

            if (partneri == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                partneri,
                kalkulimet,
                TotaliHyrese,
                TotaliDalese
            });
        }

        

        [Authorize]
        [HttpPost]
        [Route("shtoPartnerin")]
        public async Task<IActionResult> Post(Partneri partneri)
        {
            await _context.Partneri.AddAsync(partneri);
            await _context.SaveChangesAsync();

            return CreatedAtAction("Get", partneri.IDPartneri, partneri);
        }

        [Authorize]
        [HttpPut]
        [Route("perditesoPartnerin")]
        public async Task<IActionResult> Put(int stafiID, int id, [FromBody] Partneri k)
        {
            var partneri = await _context.Partneri.FirstOrDefaultAsync(x => x.IDPartneri == id);
            if (id < 0)
            {
                return BadRequest("Partneri nuk egziston");
            }

            if (!k.EmriBiznesit.IsNullOrEmpty())
            {
                partneri.EmriBiznesit = k.EmriBiznesit;
            }
            if (!k.NUI.IsNullOrEmpty())
            {
                partneri.NUI = k.NUI;
            }
            if (!k.NRF.IsNullOrEmpty())
            {
                partneri.NRF = k.NRF;
            }
            if (!k.TVSH.IsNullOrEmpty())
            {
                partneri.TVSH = k.TVSH;
            }
            if (!k.Email.IsNullOrEmpty())
            {
                partneri.Email = k.Email;
            }
            if (!k.Adresa.IsNullOrEmpty())
            {
                partneri.Adresa = k.Adresa;
            }
            if (!k.NrKontaktit.IsNullOrEmpty())
            {
                partneri.NrKontaktit = k.NrKontaktit;
            }
            if (!k.ShkurtesaPartnerit.IsNullOrEmpty())
            {
                partneri.ShkurtesaPartnerit = k.ShkurtesaPartnerit;
            }
            if (!string.IsNullOrEmpty(k.LlojiPartnerit))
            {
                // Case 1: Changing to Blerës (Buyer) - should have bonus card
                if (k.LlojiPartnerit == "B" || k.LlojiPartnerit == "B/F")
                {
                    partneri.LlojiPartnerit = k.LlojiPartnerit;

                    // Check if partner already has a bonus card
                    var kaKartelaBonus = await _kartelaService.PartnerKaKartelaBonus(id);

                    if (!kaKartelaBonus)
                    {

                        try
                        {
                            // Save partner changes first
                            _context.Partneri.Update(partneri);
                            await _context.SaveChangesAsync();

                            // Create bonus card
                            var kartela = await _kartelaService.ShtoKartelenBonus(id, stafiID,  0);

                            return Ok(new
                            {
                                partneri = partneri,
                                kartela = kartela,
                                message = "Partneri u perditesua dhe kartela bonus u krijua me sukses"
                            });
                        }
                        catch (InvalidOperationException ex)
                        {
                            return BadRequest(ex.Message);
                        }
                        catch (Exception ex)
                        {
                            return StatusCode(500, $"Gabim gjate krijimit te karteles: {ex.Message}");
                        }
                    }
                    else
                    {
                        // Just update the partner, card already exists
                        _context.Partneri.Update(partneri);
                        await _context.SaveChangesAsync();

                        return Ok(new
                        {
                            partneri = partneri,
                            message = "Partneri u perditesua. Kartela bonus ekziston tashme"
                        });
                    }
                }
                // Case 2: Changing to Furnitor (Supplier) - should NOT have bonus card
                else if (k.LlojiPartnerit == "F")
                {
                    partneri.LlojiPartnerit = "F";

                    // Check if partner has a bonus card
                    var existingKartela = await _context.Kartelat
                        .FirstOrDefaultAsync(kar => kar.PartneriID == id && kar.LlojiKarteles == "Bonus");

                    if (existingKartela != null)
                    {
                        // Delete the bonus card since suppliers don't have them
                        try
                        {
                            await _kartelaService.FshijKartelenMeID(existingKartela.IDKartela);

                            _context.Partneri.Update(partneri);
                            await _context.SaveChangesAsync();

                            return Ok(new
                            {
                                partneri = partneri,
                                message = "Partneri u perditesua dhe kartela bonus u fshi (furnitoret nuk kane kartela bonus)"
                            });
                        }
                        catch (Exception ex)
                        {
                            return BadRequest($"Gabim gjate fshirjes se karteles: {ex.Message}");
                        }
                    }
                    else
                    {
                        // No bonus card exists, just update
                        _context.Partneri.Update(partneri);
                        await _context.SaveChangesAsync();

                        return Ok(new
                        {
                            partneri = partneri,
                            message = "Partneri u perditesua si furnitor"
                        });
                    }
                }
                else
                {
                    // Other partner types
                    partneri.LlojiPartnerit = k.LlojiPartnerit;
                }
            }

            _context.Partneri.Update(partneri);
            await _context.SaveChangesAsync();

            return Ok(partneri);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijPartnerin")]
        public async Task<IActionResult> Delete(int id)
        {
            var partneri = await _context.Partneri.FirstOrDefaultAsync(x => x.IDPartneri == id);

            if (partneri == null)
                return BadRequest("Invalid id");

            partneri.isDeleted = "true";

            _context.Partneri.Update(partneri);
            await _context.SaveChangesAsync();

            return Ok("Partneri u fshi me sukses!");
        }
    }
}
