using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

namespace FinanCareWebAPI.Controllers.Stafi
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class PerdoruesiController : Controller
    {
        private readonly FinanCareDbContext _context;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IAdminLogService _adminLogService;

        public PerdoruesiController(
            FinanCareDbContext context,
            UserManager<IdentityUser> userManager,
            IAdminLogService adminLogService)
        {
            _context = context;
            _userManager = userManager;
            _adminLogService = adminLogService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        private async Task LogAdminActionAsync(string action, string entityId, string description)
        {
            var userId = GetUserId();
            if (!string.IsNullOrEmpty(userId))
            {
                await _adminLogService.LogAsync(userId, action, "Perdoruesi", entityId, description);
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqPerdoruesit")]
        public async Task<IActionResult> Get()
        {
            var perdoruesit = await _context.Perdoruesi
                .Include(p => p.TeDhenatPerdoruesit)
                .ThenInclude(x => x.Banka)
                .Include(x => x.Kartelat)
                .Where(x => (x.Kartelat.LlojiKarteles == "Fshirje" || x.Kartelat == null)
                         && !x.IsSuperAdmin   // Fsheh superadmin-in e sistemit
                         && (x.TeDhenatPerdoruesit == null || x.TeDhenatPerdoruesit.isDeleted == null || x.TeDhenatPerdoruesit.isDeleted != "true"))
                .ToListAsync();

            var perdoruesiList = new List<RoletEPerdoruesit>();

            foreach (var perdoruesi in perdoruesit)
            {
                var user = await _userManager.FindByIdAsync(perdoruesi.AspNetUserID);
                var roles = await _userManager.GetRolesAsync(user);

                var roletEPerdoruesit = new RoletEPerdoruesit
                {
                    Perdoruesi = perdoruesi,
                    Rolet = roles.ToList(),
                    IsLockedOut = user != null && await _userManager.IsLockedOutAsync(user)
                };

                perdoruesiList.Add(roletEPerdoruesit);
            }

            return Ok(perdoruesiList);
        }

        [Authorize]
        [HttpDelete]
        [Route("fshijPerdoruesin")]
        public async Task<IActionResult> Delete(string idUserAspNet)
        {
            var user = await _userManager.FindByIdAsync(idUserAspNet);
            if (user == null)
            {
                return NotFound("Perdoruesi nuk ekziston ne Identity.");
            }

            var perdoruesi = await _context.Perdoruesi
                .Include(p => p.TeDhenatPerdoruesit)
                .FirstOrDefaultAsync(x => x.AspNetUserID.Equals(idUserAspNet));

            if (perdoruesi == null)
            {
                return BadRequest("TeDhenatPerdoruesit nuk ekziston");
            }

            var rolet = await _userManager.GetRolesAsync(user);

            var uniqueSuffix = Guid.NewGuid().ToString().Substring(0, 8);

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var setEmailResult = await _userManager.SetEmailAsync(user, $"{user.UserName}.REMOVED.{uniqueSuffix}@staff.local");
                    if (!setEmailResult.Succeeded)
                    {
                        return BadRequest("Deshtoi perditesimi i emailit gjate fshirjes.");
                    }

                    var setUsernameResult = await _userManager.SetUserNameAsync(user, $"{user.UserName}.REMOVED.{uniqueSuffix}");
                    if (!setUsernameResult.Succeeded)
                    {
                        return BadRequest("Deshtoi perditesimi i username gjate fshirjes.");
                    }

                    await _userManager.SetLockoutEnabledAsync(user, true);
                    await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
                    await _userManager.UpdateSecurityStampAsync(user);

                    if (rolet.Any())
                    {
                        var removeRolesResult = await _userManager.RemoveFromRolesAsync(user, rolet);
                        if (!removeRolesResult.Succeeded)
                        {
                            return BadRequest("Deshtoi heqja e roleve te perdoruesit gjate fshirjes.");
                        }
                    }

                    perdoruesi.Email = user.Email;
                    perdoruesi.Username = user.UserName;
                    _context.Perdoruesi.Update(perdoruesi);

                    var teDhenatUser = await _context.TeDhenatPerdoruesit
                        .FirstOrDefaultAsync(x => x.UserID == perdoruesi.UserID);

                    if (teDhenatUser == null)
                    {
                        teDhenatUser = new TeDhenatPerdoruesit
                        {
                            UserID = perdoruesi.UserID,
                            isDeleted = "true",
                            EshtePuntorAktive = "false",
                            DataMbarimitKontrates = DateTime.Now
                        };
                        await _context.TeDhenatPerdoruesit.AddAsync(teDhenatUser);
                    }
                    else
                    {
                        teDhenatUser.isDeleted = "true";
                        teDhenatUser.EshtePuntorAktive = "false";
                        teDhenatUser.DataMbarimitKontrates = DateTime.Now;
                        _context.TeDhenatPerdoruesit.Update(teDhenatUser);
                    }
                        
                    var kartelatEStafit = await _context.Kartelat
                        .Where(x => x.StafiID == perdoruesi.UserID)
                        .ToListAsync();

                    foreach (var kartela in kartelatEStafit)
                    {
                        kartela.LlojiKarteles = null;
                        kartela.KodiKartela = null;
                        kartela.PartneriID = null;
                        kartela.Rabati = null;

                        _context.Kartelat.Update(kartela);
                    }

                    await _context.SaveChangesAsync();

                    await LogAdminActionAsync("Fshij", idUserAspNet, $"Eshte bere fshirja (soft-delete) e perdoruesit: {perdoruesi.Emri} {perdoruesi.Mbiemri}");

                    await transaction.CommitAsync();

                    var result = new
                    {
                        perdoruesi,
                        rolet
                    };

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, $"Gabim gjate fshirjes: {ex.Message}");
                }
            }
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqSipasID")]
        public async Task<IActionResult> GetbyId(string idUserAspNet)
        {
            var user = await _userManager.FindByIdAsync(idUserAspNet);

            var perdoruesi = await _context.Perdoruesi
                .Include(p => p.TeDhenatPerdoruesit)
                .ThenInclude(x => x.Banka)
                .FirstOrDefaultAsync(x => x.AspNetUserID.Equals(idUserAspNet));

            var rolet = await _userManager.GetRolesAsync(user);

            var result = new
            {
                perdoruesi,
                rolet
            };

            return Ok(result);
        }


        [Authorize]
        [HttpGet]
        [Route("KontrolloEmail")]
        public async Task<IActionResult> KontrolloEmail(string email)
        {
            var perdoruesi = await _userManager.FindByEmailAsync(email);

            var emailIPerdorur = false;

            if (perdoruesi != null)
            {
                emailIPerdorur = true;
            }


            return Ok(emailIPerdorur);
        }


        [Authorize]
        [HttpGet]
        [Route("KontrolloFjalekalimin")]
        public async Task<IActionResult> KontrolloFjalekalimin(string AspNetID, string fjalekalimi)
        {
            var perdoruesi = await _userManager.FindByIdAsync(AspNetID);

            var kontrolloFjalekalimin = await _userManager.CheckPasswordAsync(perdoruesi, fjalekalimi);

            return Ok(kontrolloFjalekalimin);
        }

        [Authorize]
        [HttpGet]
        [Route("GjeneroTeDhenatPerHyrje")]
        public async Task<IActionResult> GjeneroTeDhenatPerHyrje(string e, string m, string? domain)
        {
            var emri = e.ToLower();
            var mbiemri = m.ToLower();

            // Use a default domain when none is configured in business settings
            var domainEfektiv = string.IsNullOrWhiteSpace(domain) ? "staff.local" : domain.ToLower();

            var UsernameGjeneruar = $"{emri}.{mbiemri}";
            var EmailGjeneruar = $"{UsernameGjeneruar}@{domainEfektiv}";

            var ekziston = await _context.Perdoruesi.Where(x => x.Email == EmailGjeneruar).ToListAsync();

            int counter = 1;
            while (ekziston.Count > 0)
            {
                UsernameGjeneruar = $"{emri}.{mbiemri}.{counter}";
                EmailGjeneruar = $"{UsernameGjeneruar}@{domainEfektiv}";

                ekziston = await _context.Perdoruesi.Where(x => x.Email == EmailGjeneruar).ToListAsync();

                counter++;
            }

            var PasswordiGjeneruar = $"{emri}{mbiemri}1@";

            var teDhenat = new
            {
                EmailGjeneruar,
                UsernameGjeneruar,
                PasswordiGjeneruar
            };

            return Ok(teDhenat);
        }

        [Authorize]
        [HttpPost]
        [Route("NdryshoEmail")]
        public async Task<IActionResult> NdryshoEmail(string emailIVjeter, string emailIRI)
        {
            var perdoruesi = await _userManager.FindByEmailAsync(emailIVjeter);

            if (perdoruesi == null)
            {
                return BadRequest("Perdoreusi nuk egziston");
            }

            var tokeniPerNderrimEmail = await _userManager.GenerateChangeEmailTokenAsync(perdoruesi, emailIRI);

            var emailINdryshuar = await _userManager.ChangeEmailAsync(perdoruesi, emailIRI, tokeniPerNderrimEmail);

            if (!emailINdryshuar.Succeeded)
            {
                return BadRequest("Ndodhi nje gabim gjate perditesimit te email");
            }

            await LogAdminActionAsync("Perditeso", emailIVjeter.ToString(), $"Eshte bere perditesimi i emailit ne: {emailIRI}");

            return Ok(emailINdryshuar);
        }


        [Authorize]
        [HttpPost]
        [Route("NdryshoFjalekalimin")]
        public async Task<IActionResult> NdryshoFjalekalimin(string AspNetID, string fjalekalimiAktual, string fjalekalimiIRi)
        {
            var perdoruesi = await _userManager.FindByIdAsync(AspNetID);


            if (perdoruesi == null)
            {
                return BadRequest("Perdoreusi nuk egziston");
            }

            var passwodiINdryshuar = await _userManager.ChangePasswordAsync(perdoruesi, fjalekalimiAktual, fjalekalimiIRi);

            if (!passwodiINdryshuar.Succeeded)
            {
                return BadRequest("Ndodhi nje gabim gjate perditesimit te fjalekalimit");
            }

            await LogAdminActionAsync("Perditeso", AspNetID.ToString(), $"Eshte bere ndryshimi i passwordid per: {perdoruesi.Email}");

            return Ok(passwodiINdryshuar);
        }


        [Authorize]
        [HttpPut]
        [Route("perditesoPerdorues/{id}")]
        public async Task<IActionResult> Put(string id, [FromBody] Perdoruesi p)
        {
            // Fetch the user from Perdoruesi
            var perdouresi = await _context.Perdoruesi
                .Include(u => u.TeDhenatPerdoruesit) // Include TeDhenatPerdoruesit for updating
                .FirstOrDefaultAsync(x => x.AspNetUserID == id);

            if (perdouresi == null)
            {
                return BadRequest("Perdoruesi nuk ekziston");
            }

            if (!string.IsNullOrEmpty(p.Email))
            {
                perdouresi.Email = p.Email;
            }
            if (!string.IsNullOrEmpty(p.Emri))
            {
                perdouresi.Emri = p.Emri;
            }
            if (!string.IsNullOrEmpty(p.Mbiemri))
            {
                perdouresi.Mbiemri = p.Mbiemri;
            }

            _context.Perdoruesi.Update(perdouresi);
            await _context.SaveChangesAsync();

            var teDhenatUser = await _context.TeDhenatPerdoruesit
                .FirstOrDefaultAsync(x => x.UserID == perdouresi.UserID);

            if (teDhenatUser == null)
            {
                teDhenatUser = new TeDhenatPerdoruesit
                {
                    UserID = perdouresi.UserID,
                    EshtePuntorAktive = "true"
                };
                await _context.TeDhenatPerdoruesit.AddAsync(teDhenatUser);
                await _context.SaveChangesAsync();
            }

            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.Adresa))
            {
                teDhenatUser.Adresa = p.TeDhenatPerdoruesit.Adresa;
            }
            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.NrKontaktit))
            {
                teDhenatUser.NrKontaktit = p.TeDhenatPerdoruesit.NrKontaktit;
            }
            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.EmailPrivat))
            {
                teDhenatUser.EmailPrivat = p.TeDhenatPerdoruesit.EmailPrivat;
            }
            if (p.TeDhenatPerdoruesit.Datelindja.HasValue)
            {
                teDhenatUser.Datelindja = p.TeDhenatPerdoruesit.Datelindja;
            }
            if (p.TeDhenatPerdoruesit.DataFillimitKontrates.HasValue)
            {
                teDhenatUser.DataFillimitKontrates = p.TeDhenatPerdoruesit.DataFillimitKontrates;
            }
            if (p.TeDhenatPerdoruesit.DataMbarimitKontrates.HasValue)
            {
                teDhenatUser.DataMbarimitKontrates = p.TeDhenatPerdoruesit.DataMbarimitKontrates;
            }
            if (p.TeDhenatPerdoruesit.Paga.HasValue)
            {
                teDhenatUser.Paga = p.TeDhenatPerdoruesit.Paga;
            }
            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.Profesioni))
            {
                teDhenatUser.Profesioni = p.TeDhenatPerdoruesit.Profesioni;
            }
            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.Specializimi))
            {
                teDhenatUser.Specializimi = p.TeDhenatPerdoruesit.Specializimi;
            }
            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.Kualifikimi))
            {
                teDhenatUser.Kualifikimi = p.TeDhenatPerdoruesit.Kualifikimi;
            }
            if (p.TeDhenatPerdoruesit.BankaID.HasValue)
            {
                teDhenatUser.BankaID = p.TeDhenatPerdoruesit.BankaID;
            }
            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.NumriLlogarisBankare))
            {
                teDhenatUser.NumriLlogarisBankare = p.TeDhenatPerdoruesit.NumriLlogarisBankare;
            }
            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.NrPersonal))
            {
                teDhenatUser.NrPersonal = p.TeDhenatPerdoruesit.NrPersonal;
            }
            if (!string.IsNullOrEmpty(p.TeDhenatPerdoruesit.EshtePuntorAktive))
            {
                teDhenatUser.EshtePuntorAktive = p.TeDhenatPerdoruesit.EshtePuntorAktive;

                var identityUser = await _userManager.FindByIdAsync(perdouresi.AspNetUserID);
                if (identityUser != null)
                {
                    if (teDhenatUser.EshtePuntorAktive == "false")
                    {
                        await _userManager.SetLockoutEnabledAsync(identityUser, true);
                        await _userManager.SetLockoutEndDateAsync(identityUser, DateTimeOffset.MaxValue);
                        await _userManager.UpdateSecurityStampAsync(identityUser);
                    }
                    else if (teDhenatUser.EshtePuntorAktive == "true")
                    {
                        await _userManager.SetLockoutEndDateAsync(identityUser, null);
                        await _userManager.UpdateSecurityStampAsync(identityUser);
                    }
                }
            }

            _context.TeDhenatPerdoruesit.Update(teDhenatUser);
            await _context.SaveChangesAsync();

            await LogAdminActionAsync("Perditeso", id.ToString(), $"Eshte bere perditesimi i te dhenave te perdoruesit: {perdouresi.UserID} - {perdouresi.Emri} {perdouresi.Mbiemri}");

            return Ok(perdouresi);
        }
    }

    public class RoletEPerdoruesit
    {
        public Perdoruesi Perdoruesi { get; set; }
        public List<string> Rolet { get; set; }
        public bool IsLockedOut { get; set; }
    }
}
