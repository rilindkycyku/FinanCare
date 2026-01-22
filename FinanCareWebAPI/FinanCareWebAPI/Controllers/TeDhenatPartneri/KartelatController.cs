using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace FinanCareWebAPI.Controllers.TeDhenatPartneri
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class KartelatController : Controller
    {
        private readonly FinanCareDbContext _context;
        private readonly KartelaService _kartelaService;
        private readonly IAdminLogService _adminLogService;

        public KartelatController(FinanCareDbContext context, KartelaService kartelaService, IAdminLogService adminLogService)
        {
            _context = context;
            _kartelaService = kartelaService;
            _adminLogService = adminLogService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        private async Task LogAdminActionAsync(string action, string entityId, string description)
        {
            var userId = GetUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                await _adminLogService.LogAsync(userId, action, "KartelatEPartnerit", entityId, description);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqKartelenSipasIDs")]
        public async Task<IActionResult> ShfaqKartelenSipasIDs(int id)
        {
            try
            {
                var kartela = await _context.Kartelat.FirstOrDefaultAsync(x => x.IDKartela == id);

                return Ok(kartela);
            }
            catch (Exception ex)
            {

                return BadRequest("Kartela nuk egziston");
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqKartelenSipasKodit")]
        public async Task<IActionResult> ShfaqKartelenSipasKodit(string kodiKarteles)
        {
            var kartela = await _context.Kartelat.Include(x => x.Partneri)
                .Include(x => x.Stafi).FirstOrDefaultAsync(x => x.KodiKartela.Equals(kodiKarteles));

            if (kartela != null)
            {
                await LogAdminActionAsync("KerkesPerTeDhenaKartela", kartela.KodiKartela.ToString(), $"Eshte bere kerkes per perdorimin e karteles me numer: {kartela.KodiKartela} - {kartela.LlojiKarteles}");


                return Ok(kartela);
            }
            else
            {

                return BadRequest();
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqKartelat")]
        public async Task<IActionResult> ShfaqKartelat()
        {
            try
            {
                var kartela = await _context.Kartelat
                    .Include(x => x.Partneri)
                    .Include(x => x.Stafi)
                    .ToListAsync();

                return Ok(kartela);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpPost]
        [Route("ShtoKartelenBonus")]
        public async Task<IActionResult> ShtoKartelenBonus(int idPartneri, int stafiID, int rabati)
        {
            try
            {
                var kartela = await _kartelaService.ShtoKartelenBonus(idPartneri, stafiID, rabati);

                await LogAdminActionAsync("Shto", kartela.IDKartela.ToString(), $"Eshte shtuar bonusi per: {kartela.Partneri.EmriBiznesit} - {kartela.KodiKartela}");

                return Ok(kartela);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"Gabim: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPost]
        [Route("shtoKartelen")]
        public async Task<IActionResult> Post(Kartelat kartela)
        {
            await _context.Kartelat.AddAsync(kartela);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Shto", kartela.IDKartela.ToString(), $"Eshte shtuar kartela per: {kartela.Partneri.EmriBiznesit} - {kartela.KodiKartela}");


            return CreatedAtAction("Get", kartela.IDKartela, kartela);
        }

        [Authorize]
        [HttpPut]
        [Route("perditesoKartelen")]
        public async Task<IActionResult> Put(int id, [FromBody] Kartelat k)
        {
            var kartela = await _context.Kartelat.Include(x => x.Partneri).FirstOrDefaultAsync(x => x.IDKartela == id);

            if (id < 0)
            {
                return BadRequest("Partneri nuk egziston");
            }

            if (!k.LlojiKarteles.IsNullOrEmpty())
            {
                kartela.LlojiKarteles = k.LlojiKarteles;
            }

            if (k.KodiKartela.IsNullOrEmpty())
            {
                kartela.KodiKartela = k.KodiKartela;
            }

            if (k.PartneriID > 0)
            {
                kartela.LlojiKarteles = k.LlojiKarteles;
            }

            if (k.StafiID > 0)
            {
                kartela.StafiID = k.StafiID;
            }

            if (k.Rabati >= 0)
            {
                kartela.Rabati = k.Rabati;
            }

            _context.Kartelat.Update(kartela);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Perditeso", k.IDKartela.ToString(), $"Eshte perditesuar kartela: {kartela.Partneri.EmriBiznesit} - {kartela.KodiKartela} - Rabati: {kartela.Rabati}%");

            return Ok(kartela);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijKartelen")]
        public async Task<IActionResult> Delete(int id)
        {
            var kartela = await _context.Kartelat.FirstOrDefaultAsync(x => x.IDKartela == id);

            _context.Kartelat.Remove(kartela);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Fshij", kartela.IDKartela.ToString(), $"Eshte fshire kartela me kod: {kartela.KodiKartela}");

            return Ok("Kartela u fshi me sukses!");
        }
    }
}
