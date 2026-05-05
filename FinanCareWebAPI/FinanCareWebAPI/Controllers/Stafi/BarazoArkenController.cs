using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanCareWebAPI.Controllers.Stafi
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class BarazoArkenController : ControllerBase
    {
        private readonly FinanCareDbContext _context;
        private readonly IAdminLogService _adminLogService;

        public BarazoArkenController(FinanCareDbContext context, IAdminLogService adminLogService)
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
                await _adminLogService.LogAsync(userId, action, "BarazoArken", entityId, description);
            }
        }

        // GET: api/BarazoArken/shfaqBaraziminSipasIDs/5
        [HttpGet]
        [Route("shfaqBaraziminSipasIDs")]
        public async Task<IActionResult> GetById(int id)
        {
            if (id <= 0)
                return BadRequest("ID e pavlefshme.");

            var barazimi = await _context.BarazoArken
                .Include(b => b.Arkatari)
                .Include(b => b.PersoniPergjejes)
                .FirstOrDefaultAsync(b => b.IDBarazoArken == id);

            if (barazimi == null)
                return NotFound("Barazimi i arkës nuk u gjet.");

            return Ok(barazimi);
        }

        // GET: api/BarazoArken/shfaqArkataretPerSot
        [AllowAnonymous]
        [HttpGet]
        [Route("shfaqArkataretPerSot")]
        public async Task<IActionResult> ShfaqArkataretPerSot()
        {
            var todayStart = DateTime.Today;
            var tomorrowStart = todayStart.AddDays(1);

            var arkataret = await _context.Faturat
                .Where(x => x.LlojiKalkulimit == "PARAGON"
                    && x.DataRegjistrimit >= todayStart
                    && x.DataRegjistrimit < tomorrowStart)
                .GroupBy(x => x.Stafi)  // Group by cashier
                .Select(g => new
                {
                    stafiID = g.Key.UserID,
                    emri = g.Key.Emri,
                    mbiemri = g.Key.Mbiemri,
                    username = g.Key.Username,
                    totaliShitjeve = g.Sum(f => f.TotaliPaTVSH + f.TVSH)  // Total with VAT
                })
                .OrderBy(x => x.emri)  // Optional: sort by name
                .ToListAsync();

            if (!arkataret.Any())
                return NotFound("Nuk ka arkatarë aktivë sot.");

            return Ok(arkataret);
        }

        // GET: api/BarazoArken/shfaqTeGjithaBarazimet
        [HttpGet]
        [Route("shfaqTeGjithaBarazimet")]
        public async Task<IActionResult> GetAll()
        {
            var barazimet = await _context.BarazoArken
                .Include(b => b.Arkatari)
                .Include(b => b.PersoniPergjejes)
                .OrderByDescending(b => b.KohaBarazimit)
                .ToListAsync();

            return Ok(barazimet);
        }

        [HttpPost]
        [Route("shtoBarazimin")]
        public async Task<IActionResult> Post([FromBody] BarazoArken barazoArken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            barazoArken.KohaBarazimit ??= DateTime.Now;

            await _context.BarazoArken.AddAsync(barazoArken);
            await _context.SaveChangesAsync();

            // Fetch the cashier info if it's not loaded to avoid null reference during logging
            var arkatari = await _context.Perdoruesi.FindAsync(barazoArken.IDArkatari);
            string cashierInfo = arkatari != null ? $"{arkatari.Username} - {arkatari.Emri} {arkatari.Mbiemri}" : "ID: " + barazoArken.IDArkatari;

            await LogAdminActionAsync("Shto", barazoArken.IDBarazoArken.ToString(), $"Barazimi i Arkes per: {cashierInfo}");

            return CreatedAtAction(
                nameof(GetById),
                new { id = barazoArken.IDBarazoArken },
                barazoArken);
        }

        // DELETE: api/BarazoArken/fshijBarazimin/5
        [HttpDelete]
        [Route("fshijBarazimin/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (id <= 0)
                return BadRequest("ID e pavlefshme.");

            var barazo = await _context.BarazoArken.Include(x => x.Arkatari)
                .FirstOrDefaultAsync(b => b.IDBarazoArken == id);

            if (barazo == null)
                return NotFound("Barazimi i arkës nuk u gjet.");

            _context.BarazoArken.Remove(barazo);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Fshij", id.ToString(), $"Barazimi i Arkes u fshi per: {barazo.Arkatari.Username} - {barazo.Arkatari.Emri} {barazo.Arkatari.Mbiemri}");

            return Ok("Barazimi i arkës u fshi me sukses!");
        }
    }
}