using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanCareWebAPI.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class BarazoArkenController : ControllerBase
    {
        private readonly FinanCareDbContext _context;

        public BarazoArkenController(FinanCareDbContext context)
        {
            _context = context;
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

        // POST: api/BarazoArken/shtoBarazimin
        [HttpPost]
        [Route("shtoBarazimin")]
        public async Task<IActionResult> Post([FromBody] BarazoArken barazoArken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // KohaBarazimit defaults to DateTime.Now in model, but you can override if needed
            barazoArken.KohaBarazimit ??= DateTime.Now;

            await _context.BarazoArken.AddAsync(barazoArken);
            await _context.SaveChangesAsync();

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

            var barazo = await _context.BarazoArken
                .FirstOrDefaultAsync(b => b.IDBarazoArken == id);

            if (barazo == null)
                return NotFound("Barazimi i arkës nuk u gjet.");

            _context.BarazoArken.Remove(barazo);
            await _context.SaveChangesAsync();

            return Ok("Barazimi i arkës u fshi me sukses!");
        }
    }
}