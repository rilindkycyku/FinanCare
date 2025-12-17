using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Migrations;

namespace FinanCareWebAPI.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class DitaFurnizimitController : Controller
    {
        private readonly FinanCareDbContext _context;

        public DitaFurnizimitController(FinanCareDbContext context)
        {
            _context = context;
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

            return CreatedAtAction("Get", ditaEFurnizimit.IDDitaFurnizimit, ditaEFurnizimit);
        }

        [Authorize]
        [HttpPut]
        [Route("perditesoDitenEFurnizimit")]
        public async Task<IActionResult> Put(int id, [FromBody] DitaFurnizimit k)
        {
            var ditaEFurnizimit = await _context.DitaFurnizimit.FirstOrDefaultAsync(x => x.IDDitaFurnizimit == id);

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

            return Ok("Dita e Furnzimit u fshi me sukses!");
        }
    }
}
