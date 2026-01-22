using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace FinanCareWebAPI.Controllers.TeNdryshme
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class DitaFurnizimitController : Controller
    {
        private readonly FinanCareDbContext _context;
        private readonly IAdminLogService _adminLogService;

        public DitaFurnizimitController(FinanCareDbContext context, IAdminLogService adminLogService)
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
                await _adminLogService.LogAsync(userId, action, "DitaFurnizimit", entityId, description);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqDitenEFurnizimitSipasIDs")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var ditaEFurnizimit = await _context.DitaFurnizimit.FirstOrDefaultAsync(x => x.IDDitaFurnizimit == id);

                return Ok(ditaEFurnizimit);
            }
            catch (Exception ex)
            {

                return BadRequest("Dita e Furnzimit nuk egziston");
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqDitetEFurnizimit")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var ditaEFurnizimit = await _context.DitaFurnizimit
                    .Include(x => x.Partneri)
                    .OrderBy(x => x.Partneri.EmriBiznesit)
                    .ToListAsync();

                return Ok(ditaEFurnizimit);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpPost]
        [Route("shtoDitenEFurnizimit")]
        public async Task<IActionResult> Post(DitaFurnizimit ditaEFurnizimit)
        {
            await _context.DitaFurnizimit.AddAsync(ditaEFurnizimit);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Shto", ditaEFurnizimit.IDDitaFurnizimit.ToString(), $"Eshte shtuar dita e furnizmit per: {ditaEFurnizimit.Partneri.EmriBiznesit} - {ditaEFurnizimit.DitaEFurnizimit}");

            return CreatedAtAction("Get", ditaEFurnizimit.IDDitaFurnizimit, ditaEFurnizimit);
        }

        [Authorize]
        [HttpPut]
        [Route("perditesoDitenEFurnizimit")]
        public async Task<IActionResult> Put(int id, [FromBody] DitaFurnizimit k)
        {
            var ditaEFurnizimit = await _context.DitaFurnizimit.Include(x => x.Partneri).FirstOrDefaultAsync(x => x.IDDitaFurnizimit == id);

            if (id < 0)
            {
                return BadRequest("Partneri nuk egziston");
            }

            if (k.IDPartneri > 0)
            {
                ditaEFurnizimit.IDPartneri = k.IDPartneri;
            }

            if (!k.DitaEFurnizimit.IsNullOrEmpty())
            {
                ditaEFurnizimit.DitaEFurnizimit = k.DitaEFurnizimit;
            }

            _context.DitaFurnizimit.Update(ditaEFurnizimit);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Perditeso", k.IDDitaFurnizimit.ToString(), $"Eshte bere perditesimi per: {ditaEFurnizimit.Partneri.EmriBiznesit} - {k.DitaEFurnizimit}");


            return Ok(ditaEFurnizimit);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijDitenEFurnizimit")]
        public async Task<IActionResult> Delete(int id)
        {
            var ditaEFurnizimit = await _context.DitaFurnizimit.FirstOrDefaultAsync(x => x.IDDitaFurnizimit == id);

            if (ditaEFurnizimit == null)
                return BadRequest("Invalid id");


            _context.DitaFurnizimit.Remove(ditaEFurnizimit);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Fshij", ditaEFurnizimit.IDDitaFurnizimit.ToString(), $"Eshte fshire dita e furnizmit me ID: {ditaEFurnizimit.IDDitaFurnizimit}");

            return Ok("Dita e Furnzimit u fshi me sukses!");
        }
    }
}
