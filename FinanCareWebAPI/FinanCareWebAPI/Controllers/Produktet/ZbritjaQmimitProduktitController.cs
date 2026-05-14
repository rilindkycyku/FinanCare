using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanCareWebAPI.Controllers.Produktet
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class ZbritjaQmimitProduktitController : Controller
    {
        private readonly FinanCareDbContext _context;
        private readonly IAdminLogService _adminLogService;

        public ZbritjaQmimitProduktitController(FinanCareDbContext context, IAdminLogService adminLogService)
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
                await _adminLogService.LogAsync(userId, action, "ZbritjaQmimitProduktit", entityId, description);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqZbritjet")]
        public async Task<IActionResult> get()
        {
            var prodMeZbritje = await _context.Produkti
                .Where(x => x.ZbritjaQmimitProduktit.Rabati != null && x.isDeleted == "false")
                .Select(x => new
                {
                    x.EmriProduktit,
                    x.Barkodi,
                    x.ZbritjaQmimitProduktit.ProduktiID,
                    x.ZbritjaQmimitProduktit.Rabati,
                    x.ZbritjaQmimitProduktit.DataZbritjes,
                    x.ZbritjaQmimitProduktit.DataSkadimit,
                    x.StokuQmimiProduktit.QmimiProduktit,
                }).ToListAsync();

            return Ok(prodMeZbritje);
        }

        [Authorize]
        [HttpPost]
        [Route("shtoZbritjenProduktit")]
        public async Task<IActionResult> post(ZbritjaQmimitProduktit zbritja)
        {
            // Load the product name before inserting so the navigation property
            // is available for the admin log (EF Core does not populate it after AddAsync).
            var emriProduktit = await _context.Produkti
                .Where(p => p.ProduktiID == zbritja.ProduktiID)
                .Select(p => p.EmriProduktit)
                .FirstOrDefaultAsync() ?? zbritja.ProduktiID.ToString();

            await _context.ZbritjaQmimitProduktit.AddAsync(zbritja);
            HistoriaZbritjeveProduktit historiaZbritjeveProduktit = new()
            {
                DataSkadimit = zbritja.DataSkadimit,
                DataZbritjes = zbritja.DataZbritjes,
                ProduktiID = zbritja.ProduktiID,
                Rabati = zbritja.Rabati,
            };
            await _context.HistoriaZbritjeveProduktit.AddAsync(historiaZbritjeveProduktit);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Shto", zbritja.ProduktiID.ToString(), $"Zbritja vlen per: {emriProduktit} - nga {zbritja.DataZbritjes} deri {zbritja.DataSkadimit}");

            return CreatedAtAction("get", zbritja.ProduktiID, zbritja);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijZbritjenProduktit")]
        public async Task<IActionResult> Delete(int id)
        {
            var produkti = await _context.ZbritjaQmimitProduktit.Include(x => x.Produkti).FirstOrDefaultAsync(x => x.ProduktiID == id);

            if(produkti == null)
            {
                return BadRequest("Ky produkt nuk ka zbritje!");
            }

            _context.ZbritjaQmimitProduktit.Remove(produkti);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Fshij", produkti.ProduktiID.ToString(), $"Zbritja u fshi per: {produkti.Produkti.EmriProduktit}");

            return NoContent();
        }
    }
}
