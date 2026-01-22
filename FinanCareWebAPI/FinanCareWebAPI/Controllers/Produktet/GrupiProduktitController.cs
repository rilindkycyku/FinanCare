using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace FinanCareWebAPI.Controllers.Produktet
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class GrupiProduktitController : Controller
    {
        private readonly FinanCareDbContext _context;
        private readonly IAdminLogService _adminLogService;

        public GrupiProduktitController(FinanCareDbContext context, IAdminLogService adminLogService)
        {
            _context = context;
            _adminLogService = adminLogService;
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqGrupinEProduktitSipasIDs")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var grupiIProduktit = await _context.GrupiProduktit
                .Where(x => x.isDeleted == "false").FirstOrDefaultAsync(x => x.IDGrupiProduktit == id);

                return Ok(grupiIProduktit);
            }
            catch (Exception ex)
            {

                return BadRequest("Grupi i Produktit nuk egziston");
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqGrupetEProduktit")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var grupiIProduktit = await _context.GrupiProduktit.Where(x => x.isDeleted == "false")
                    .Include(x => x.Produkti)
                    .ToListAsync();

                var grupiIProduktitDheTotProdukteve = grupiIProduktit.Select(n => new
                {
                    n.IDGrupiProduktit,
                    n.GrupiIProduktit,
                    totaliProdukteve = n.Produkti.Count()
                }).ToList();

                return Ok(grupiIProduktitDheTotProdukteve);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpPost]
        [Route("shtoGrupinEProduktit")]
        public async Task<IActionResult> Post(GrupiProduktit grupiIProduktit)
        {
            await _context.GrupiProduktit.AddAsync(grupiIProduktit);
            await _context.SaveChangesAsync();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _adminLogService.LogAsync(userId, "Shto", "GrupiIProduktit", grupiIProduktit.IDGrupiProduktit.ToString(), $"Eshte bere vendosja e: " + grupiIProduktit.GrupiIProduktit);


            return CreatedAtAction("Get", grupiIProduktit.IDGrupiProduktit, grupiIProduktit);
        }

        [Authorize]
        [HttpPut]
        [Route("perditesoGrupinEProduktit")]
        public async Task<IActionResult> Put(int id, [FromBody] GrupiProduktit k)
        {
            var grupiIProduktit = await _context.GrupiProduktit.FirstOrDefaultAsync(x => x.IDGrupiProduktit == id);

            if (id < 0)
            {
                return BadRequest("Partneri nuk egziston");
            }

            if (!k.GrupiIProduktit.IsNullOrEmpty())
            {
                grupiIProduktit.GrupiIProduktit = k.GrupiIProduktit;
            }

            _context.GrupiProduktit.Update(grupiIProduktit);
            await _context.SaveChangesAsync();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _adminLogService.LogAsync(userId, "Perditeso", "GrupiIProduktit", grupiIProduktit.IDGrupiProduktit.ToString(), $"Eshte bere perditesimi i: " + grupiIProduktit.GrupiIProduktit);

            return Ok(grupiIProduktit);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijGrupinEProduktit")]
        public async Task<IActionResult> Delete(int id)
        {
            var grupiIProduktit = await _context.GrupiProduktit.FirstOrDefaultAsync(x => x.IDGrupiProduktit == id);

            if (grupiIProduktit == null)
                return BadRequest("Invalid id");

            grupiIProduktit.isDeleted = "true";

            _context.GrupiProduktit.Update(grupiIProduktit);
            await _context.SaveChangesAsync();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _adminLogService.LogAsync(userId, "Largo", "GrupiIProduktit", grupiIProduktit.IDGrupiProduktit.ToString(), $"Eshte bere largmi i: " + grupiIProduktit.GrupiIProduktit);

            return Ok("Grupi i Produktit u fshi me sukses!");
        }
    }
}
