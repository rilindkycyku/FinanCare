﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using Microsoft.IdentityModel.Tokens;

namespace WebAPI.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("/api/[controller]")]
    public class TeDhenatBiznesitController : Controller
    {
        private readonly FinanCareDbContext _context;

        public TeDhenatBiznesitController(FinanCareDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqTeDhenat")]
        public IActionResult Get()
        {
            var teDhenat = _context.TeDhenatBiznesit.First();

            return Ok(teDhenat);
        }

        

        [Authorize]
        [HttpGet]
        [Route("ShfaqBankat")]
        public async Task<IActionResult> ShfaqBankat()
        {
            var bankat = await _context.Bankat
                .Where(x => x.isDeleted == "false").OrderBy(x => x.EmriBankes).ToListAsync();

            return Ok(bankat);
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqLlogaritEBiznesit")]
        public async Task<IActionResult> ShfaqLlogaritEBiznesit()
        {
            var bankat = await _context.LlogaritEBiznesit.Include(x => x.Banka).ToListAsync();

            return Ok(bankat);
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqBankenNgaID")]
        public async Task<IActionResult> ShfaqBankenNgaID(int id)
        {
            var bankaNgaID = await _context.Bankat
                .Where(x => x.BankaID == id).ToListAsync();

            if(bankaNgaID == null)
            {
                return BadRequest("Banka nuk Egziston");
            }

            return Ok(bankaNgaID);
        }

        [Authorize]
        [HttpGet]
        [Route("ShfaqLlogarineNgaID")]
        public async Task<IActionResult> ShfaqLlogarineNgaID(int id)
        {
            var bankaNgaID = await _context.LlogaritEBiznesit
                .Where(x => x.IDLlogariaBankare == id).Include(x => x.Banka).ToListAsync();

            if (bankaNgaID == null)
            {
                return BadRequest("Llogaria nuk Egziston");
            }

            return Ok(bankaNgaID);
        }

        [Authorize]
        [HttpPost]
        [Route("ShtoBanken")]
        public async Task<IActionResult> ShtoBanken(Bankat banka)
        {
            await _context.Bankat.AddAsync(banka);
            await _context.SaveChangesAsync();

            return CreatedAtAction("get", banka.BankaID, banka);
        }

        [Authorize]
        [HttpPost]
        [Route("ShtoLlogarineBankareBiznesit")]
        public async Task<IActionResult> ShtoLlogarineBankareBiznesit(LlogaritEBiznesit banka)
        {
            await _context.LlogaritEBiznesit.AddAsync(banka);
            await _context.SaveChangesAsync();

            return CreatedAtAction("get", banka.IDLlogariaBankare, banka);
        }

        [Authorize]
        [HttpPut]
        [Route("PerditesoBanken")]
        public async Task<IActionResult> PerditesoBanken(int id, [FromBody] Bankat b)
        {
            var banka = _context.Bankat.FirstOrDefault(x => x.BankaID == id);
            if (banka == null)
            {
                return BadRequest("Banka nuk egziston");
            }

            if (!b.EmriBankes.IsNullOrEmpty())
            {
                banka.EmriBankes = b.EmriBankes;
            }
            if (!b.LokacioniBankes.IsNullOrEmpty())
            {
                banka.LokacioniBankes = b.LokacioniBankes;
            }

            _context.Bankat.Update(banka);
            await _context.SaveChangesAsync();

            return Ok(banka);
        }

        [Authorize]
        [HttpPut]
        [Route("PerditesoLlogarineBankare")]
        public async Task<IActionResult> PerditesoLlogarineBankare(int id, [FromBody] LlogaritEBiznesit b)
        {
            var banka = _context.LlogaritEBiznesit.FirstOrDefault(x => x.IDLlogariaBankare == id);
            if (banka == null)
            {
                return BadRequest("Llogaria nuk egziston");
            }

            if (!b.NumriLlogaris.IsNullOrEmpty())
            {
                banka.NumriLlogaris = b.NumriLlogaris;
            }
            if (!b.AdresaBankes.IsNullOrEmpty())
            {
                banka.AdresaBankes = b.AdresaBankes;
            }
            if (!b.Valuta.IsNullOrEmpty())
            {
                banka.Valuta = b.Valuta;
            }
            if (b.BankaID != banka.BankaID && b.BankaID > 0)
            {
                banka.BankaID = b.BankaID;
            }

            _context.LlogaritEBiznesit.Update(banka);
            await _context.SaveChangesAsync();

            return Ok(banka);
        }

        [Authorize]
        [HttpPut]
        [Route("perditesoTeDhenat")]
        public IActionResult Put([FromBody] TeDhenatBiznesit k)
        {
            var teDhenat = _context.TeDhenatBiznesit.FirstOrDefault(x => x.IDTeDhenatBiznesit == 1);
            if (teDhenat == null)
            {
                return BadRequest("Kategoria nuk egziston");
            }

            teDhenat.NrKontaktit = k.NrKontaktit;
            teDhenat.NF = k.NF;
            teDhenat.NUI = k.NUI;
            teDhenat.Email = k.Email;
            teDhenat.EmriIBiznesit = k.EmriIBiznesit;
            teDhenat.ShkurtesaEmritBiznesit = k.ShkurtesaEmritBiznesit;
            teDhenat.NrTVSH = k.NrTVSH;
            teDhenat.Adresa = k.Adresa;
            teDhenat.Logo = k.Logo;
            teDhenat.EmailDomain = k.EmailDomain;

            _context.SaveChanges();

            return Ok(teDhenat);
        }

        [Authorize]
        [HttpDelete]
        [Route("FshijBanken")]
        public async Task<IActionResult> FshijBanken(int id)
        {
            var banka = await _context.Bankat.FirstOrDefaultAsync(x => x.BankaID == id);

            if (banka == null)
                return BadRequest("Invalid id");

            banka.isDeleted = "true";

            _context.Bankat.Update(banka);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpDelete]
        [Route("FshijLlogarinBankareBiznesit")]
        public async Task<IActionResult> FshijLlogarinBankareBiznesit(int id)
        {
            var banka = await _context.LlogaritEBiznesit.FirstOrDefaultAsync(x => x.IDLlogariaBankare == id);

            if (banka == null)
            {
                return BadRequest("Llogaria nuk egziston!");
            }

            _context.LlogaritEBiznesit.Remove(banka);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        
    }
}
