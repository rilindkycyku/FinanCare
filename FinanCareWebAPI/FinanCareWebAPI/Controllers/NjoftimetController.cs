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
    public class NjoftimetController : Controller
    {
        private readonly FinanCareDbContext _context;

        public NjoftimetController(FinanCareDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqProduktetPaStok")]
        public async Task<ActionResult> ShfaqProduktetPaStok()
        {

            var Produkti = await _context.Produkti
                .Where(x => x.isDeleted == "false" && x.StokuQmimiProduktit.SasiaNeStok <= 0)
                .OrderBy(p => p.StokuQmimiProduktit.SasiaNeStok)
                .ThenByDescending(p => p.ProduktiID)
               .Select(p => new
               {
                   p.ProduktiID,
                   p.EmriProduktit,
                   p.Partneri.EmriBiznesit,
                   p.NjesiaMatese.EmriNjesiaMatese,
                   p.Barkodi,
                   p.KodiProduktit,
                   p.StokuQmimiProduktit.SasiaNeStok,
                   p.GrupiProduktit.GrupiIProduktit,
               })
               .ToListAsync();

            return Ok(Produkti);
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqAfatetESkadimit")]
        public async Task<ActionResult> ShfaqAfatetESkadimit()
        {

            var AfatetESkadimit = await _context.AfatetESkadimit
                .OrderBy(p => p.DataSkadimit)
                .Include(p => p.PersoniPergjegjes)
                .Include(p => p.Produkti)
               .Select(p => new
               {
                   p.ID,
                   p.StafiID,
                   p.DataSkadimit,
                   p.IDProduktit,
                   p.Produkti.EmriProduktit,
                   p.PersoniPergjegjes.Emri,
                   p.PersoniPergjegjes.Mbiemri
               })
               .ToListAsync();

            return Ok(AfatetESkadimit);
        }

        [Authorize]
        [HttpPost]
        [Route("shtoAfatetESkadimit")]
        public async Task<IActionResult> Post(AfatetESkadimit afatetESkadimit)
        {
            await _context.AfatetESkadimit.AddAsync(afatetESkadimit);
            await _context.SaveChangesAsync();

            var response = new { Message = "Success", Data = afatetESkadimit };
            return Ok(response);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijAfatetESkadimit")]
        public async Task<IActionResult> Delete(int id)
        {
            var afatiSkadimit = await _context.AfatetESkadimit.FirstOrDefaultAsync(x => x.ID == id);

            if (afatiSkadimit == null)
                return BadRequest("Invalid id");

            _context.AfatetESkadimit.Remove(afatiSkadimit);
            await _context.SaveChangesAsync();

            return Ok("Afati Skadimit u fshi me sukses!");
        }
    }
}
