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
    public class NjesiaMateseController : Controller
    {
        private readonly FinanCareDbContext _context;
        private readonly IAdminLogService _adminLogService;

        public NjesiaMateseController(FinanCareDbContext context, IAdminLogService adminLogService)
        {
            _context = context;
            _adminLogService = adminLogService;
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqNjesineMateseSipasIDs")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                var njesiaMatese = await _context.NjesiaMatese
                .Where(x => x.isDeleted == "false").FirstOrDefaultAsync(x => x.IDNjesiaMatese == id);

                return Ok(njesiaMatese);
            }
            catch (Exception ex)
            {

                return BadRequest("Njesia Matese nuk egziston");
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqNjesiteMatese")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var njesiaMatese = await _context.NjesiaMatese

                .Where(x => x.isDeleted == "false")
                    .Include(x => x.Produkti)
                    .ToListAsync();

                var njesiaMateseDheTotProdukteve = njesiaMatese.Select(n => new
                {
                    IDNjesiaMatese = n.IDNjesiaMatese,
                    njesiaMatese = n.EmriNjesiaMatese,
                    totaliProdukteve = n.Produkti.Count()
                }).ToList();

                return Ok(njesiaMateseDheTotProdukteve);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [Authorize]
        [HttpPost]
        [Route("shtoNjesineMatese")]
        public async Task<IActionResult> Post(NjesiaMatese njesiaMatese)
        {
            await _context.NjesiaMatese.AddAsync(njesiaMatese);
            await _context.SaveChangesAsync();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _adminLogService.LogAsync(userId, "Shto", "NjesiaMatese", njesiaMatese.IDNjesiaMatese.ToString(), $"Eshte bere krijimi i: " + njesiaMatese.EmriNjesiaMatese);


            return CreatedAtAction("Get", njesiaMatese.IDNjesiaMatese, njesiaMatese);
        }

        [Authorize]
        [HttpPut]
        [Route("perditesoNjesineMatese")]
        public async Task<IActionResult> Put(int id, [FromBody] NjesiaMatese k)
        {
            var njesiaMatese = await _context.NjesiaMatese.FirstOrDefaultAsync(x => x.IDNjesiaMatese == id);

            if (id < 0)
            {
                return BadRequest("Partneri nuk egziston");
            }

            if (!k.EmriNjesiaMatese.IsNullOrEmpty())
            {
                njesiaMatese.EmriNjesiaMatese = k.EmriNjesiaMatese;
            }

            _context.NjesiaMatese.Update(njesiaMatese);
            await _context.SaveChangesAsync();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _adminLogService.LogAsync(userId, "Perditeso", "NjesiaMatese", njesiaMatese.IDNjesiaMatese.ToString(), $"Eshte bere perditesimi i: " + njesiaMatese.EmriNjesiaMatese);


            return Ok(njesiaMatese);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijNjesineMatese")]
        public async Task<IActionResult> Delete(int id)
        {
            var njesiaMatese = await _context.NjesiaMatese.FirstOrDefaultAsync(x => x.IDNjesiaMatese == id);

            if (njesiaMatese == null)
                return BadRequest("Invalid id");

            njesiaMatese.isDeleted = "true";

            _context.NjesiaMatese.Update(njesiaMatese);
            await _context.SaveChangesAsync();

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _adminLogService.LogAsync(userId, "Largo", "NjesiaMatese", njesiaMatese.IDNjesiaMatese.ToString(), $"Eshte bere largimi i: " + njesiaMatese.EmriNjesiaMatese);


            return Ok("Njesia Matese u fshi me sukses!");
        }
    }
}
