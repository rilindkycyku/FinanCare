using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebAPI.Auth;
using FinanCareWebAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Services;

namespace FinanCareWebAPI.Controllers.SERVER
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly FinanCareDbContext _context;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILicenseService _licenseService;

        public AuthenticateController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            FinanCareDbContext context,
            ILicenseService licenseService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _context = context;
            _licenseService = licenseService;
        }

        [Authorize]
        [HttpGet]
        [Route("shfaqRolet")]
        public async Task<IActionResult> ShfaqRolet()
        {
            var rolet = await _roleManager.Roles.ToListAsync();

            var roletWithUsersCount = new List<object>();

            foreach (var roli in rolet)
            {
                var usersCount = await _userManager.GetUsersInRoleAsync(roli.Name);

                var roliWithUsersCount = new
                {
                    roli.Id,
                    roli.Name,
                    roli.NormalizedName,
                    roli.ConcurrencyStamp,
                    TotaliPerdoruesve = usersCount.Count
                };

                roletWithUsersCount.Add(roliWithUsersCount);
            }

            return Ok(roletWithUsersCount);
        }

        [Authorize]
        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel registerModel)
        {
            if (ModelState.IsValid)
            {
                var perdoruesiEkziston = await _userManager.FindByEmailAsync(registerModel.Email);

                if (perdoruesiEkziston != null)
                {
                    return BadRequest(new AuthResults()
                    {
                        Result = false,
                        Errors = new List<string>()
                {
                    "Email already exists"
                }
                    });
                }

                var perdoruesiIRI = new IdentityUser()
                {
                    Email = registerModel.Email,
                    UserName = registerModel.Username,
                    PhoneNumber = registerModel.NrTelefonit,
                };

                var shtuarMeSukses = await _userManager.CreateAsync(perdoruesiIRI, registerModel.Password);

                if (!shtuarMeSukses.Succeeded)
                {
                    return BadRequest(new AuthResults()
                    {
                        Result = false,
                        Errors = shtuarMeSukses.Errors.Select(e => e.Description).ToList()
                    });
                }

                if (shtuarMeSukses.Succeeded)
                {
                    // Filter out null so AddToRolesAsync doesn't throw when Roli is not provided
                    var rolesToAdd = new[] { "User", registerModel.Roli }
                        .Where(r => !string.IsNullOrEmpty(r))
                        .Distinct()
                        .ToArray();
                    await _userManager.AddToRolesAsync(perdoruesiIRI, rolesToAdd);

                    Perdoruesi perdoruesi = new Perdoruesi
                    {
                        AspNetUserID = perdoruesiIRI.Id,
                        Emri = registerModel.Name,
                        Username = perdoruesiIRI.UserName,
                        Email = perdoruesiIRI.Email,
                        Mbiemri = registerModel.LastName,
                    };
                    await _context.Perdoruesi.AddAsync(perdoruesi);
                    await _context.SaveChangesAsync();

                    TeDhenatPerdoruesit teDhenatPerdoruesit = new TeDhenatPerdoruesit
                    {
                        UserID = perdoruesi.UserID,
                        Adresa = !registerModel.Adresa.IsNullOrEmpty() ? registerModel.Adresa : null,
                        NrKontaktit = !registerModel.NrTelefonit.IsNullOrEmpty() ? registerModel.NrTelefonit : null,
                        BankaID = int.TryParse(registerModel.BankaID.ToString(), out int bankaIdValue) && bankaIdValue > 0
                            ? bankaIdValue : (int?)null,
                        DataFillimitKontrates = DateTime.TryParse(registerModel.DataFillimitKontrates.ToString(), out DateTime dataFillimit)
                            ? dataFillimit : (DateTime?)null,
                        DataMbarimitKontrates = DateTime.TryParse(registerModel.DataMbarimitKontrates.ToString(), out DateTime dataMbarimit)
                            ? dataMbarimit : (DateTime?)null,
                        Datelindja = DateTime.TryParse(registerModel.Datelindja.ToString(), out DateTime datelindja)
                            ? datelindja : (DateTime?)null,
                        EmailPrivat = !registerModel.EmailPrivat.IsNullOrEmpty() ? registerModel.EmailPrivat : null,
                        EshtePuntorAktive = !registerModel.EshtePuntorAktive.IsNullOrEmpty() ? registerModel.EshtePuntorAktive : "true",
                        Kualifikimi = !registerModel.Kualifikimi.IsNullOrEmpty() ? registerModel.Kualifikimi : null,
                        NrPersonal = !registerModel.NrPersonal.IsNullOrEmpty() ? registerModel.NrPersonal : null,
                        NumriLlogarisBankare = !registerModel.NumriLlogarisBankare.IsNullOrEmpty() ? registerModel.NumriLlogarisBankare : null,
                        Paga = decimal.TryParse(registerModel.Paga.ToString(), out decimal paga)
                            ? paga : (decimal?)null,
                        Profesioni = !registerModel.Profesioni.IsNullOrEmpty() ? registerModel.Profesioni : null,
                        Specializimi = !registerModel.Specializimi.IsNullOrEmpty() ? registerModel.Specializimi : null
                    };
                    await _context.TeDhenatPerdoruesit.AddAsync(teDhenatPerdoruesit);
                    await _context.SaveChangesAsync();

                    // Check if the user is a "Menaxher" and create the bonus card directly here
                    if (registerModel.Roli == "Menaxher" || registerModel.Roli == "1 Euro Menaxher")
                    {
                        var kartelaCount = await _context.Kartelat.CountAsync();
                        var kodiKartela = $"M{perdoruesi.UserID.ToString().PadLeft(6, '0')}{(kartelaCount + 1).ToString().PadLeft(6, '0')}";

                        Kartelat kartela = new Kartelat
                        {
                            DataKrijimit = DateTime.Now,
                            LlojiKarteles = "Fshirje",
                            Rabati = null, // Set appropriate value for Rabati
                            PartneriID = null, // Set appropriate value for PartneriID
                            KodiKartela = kodiKartela,
                            StafiID = perdoruesi.UserID, // Set the appropriate stafiID
                        };

                        _context.Kartelat.Add(kartela);
                        await _context.SaveChangesAsync();
                    }

                    return Ok(new AuthResults()
                    {
                        Result = true
                    });
                }

                return BadRequest(new AuthResults()
                {
                    Errors = new List<string>
            {
                "Server Errors"
            },
                    Result = false
                });
            }

            return BadRequest();
        }


        [AllowAnonymous]
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LogInModel login)
        {
            if (ModelState.IsValid)
            {

                var useri_ekziston = await _userManager.FindByEmailAsync(login.Email);

                if (useri_ekziston == null)
                {
                    return BadRequest(new AuthResults()
                    {
                        Errors = new List<string>()
                        {
                            "Inavlid Payload"
                        },
                        Result = false
                    });
                }

                var neRregull = await _userManager.CheckPasswordAsync(useri_ekziston, login.Password);

                if (!neRregull)
                {
                    return BadRequest(new AuthResults()
                    {
                        Errors = new List<string>()
                        {
                            "Invalid Credintials"
                        },
                        Result = false
                    });
                }

                var eshteAktiv = await _context.Perdoruesi.Include(x => x.TeDhenatPerdoruesit).Where(x => x.Email == login.Email && x.TeDhenatPerdoruesit.EshtePuntorAktive == "true").FirstOrDefaultAsync();

                if (eshteAktiv == null)
                {
                    return BadRequest(new AuthResults()
                    {
                        Errors = new List<string>()
        {
            "Llogari deaktive"
        },
                        Result = false
                    });
                }



                var roles = await _userManager.GetRolesAsync(useri_ekziston);

                var jwtToken = GenerateJwtToken(useri_ekziston, roles);

                return Ok(new AuthResults()
                {
                    Token = jwtToken,
                    Result = true
                });
            }

            return BadRequest(new AuthResults()
            {
                Errors = new List<String>()
                {
                    "Inavlid Payload"
                }
            });
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

            return Ok(passwodiINdryshuar);
        }

        [Authorize]
        [HttpPost]
        [Route("ResetoFjalekalimin")]
        public async Task<IActionResult> ResetoFjalekalimin(string AspNetID)
        {
            var perdoruesiASPNet = await _userManager.FindByIdAsync(AspNetID);

            var perdoruesi = await _context.Perdoruesi.Where(x => x.AspNetUserID == AspNetID).FirstOrDefaultAsync();


            if (perdoruesi == null)
            {
                return BadRequest("Perdoreusi nuk egziston");
            }


            var emri = perdoruesi.Emri.ToLower();
            var mbiemri = perdoruesi.Mbiemri.ToLower();

            var PasswordiGjeneruar = $"{emri}{mbiemri}1@";

            var tokeniPassword = await _userManager.GeneratePasswordResetTokenAsync(perdoruesiASPNet);

            var passwodiINdryshuar = await _userManager.ResetPasswordAsync(perdoruesiASPNet, tokeniPassword, PasswordiGjeneruar);

            if (!passwodiINdryshuar.Succeeded)
            {
                return BadRequest("Ndodhi nje gabim gjate resetimit te fjalekalimit");
            }

            var PerdoruesiObject = new
            {
                perdoruesiASPNet.Email,
                perdoruesi.Username,
                PasswordiGjeneruar
            };

            return Ok(PerdoruesiObject);
        }

        [Authorize]
        [HttpPost]
        [Route("shtoRolin")]
        public async Task<IActionResult> ShtoRolin(string roli)
        {
            var ekziston = await _roleManager.FindByNameAsync(roli);

            if (ekziston != null)
            {
                return BadRequest(new AuthResults
                {
                    Errors = new List<string> { "Ky role tashme Egziston!" }
                });
            }
            else
            {
                var role = new IdentityRole(roli);
                var result = await _roleManager.CreateAsync(role);

                if (result.Succeeded)
                {
                    return Ok(new AuthResults
                    {
                        Result = true
                    });
                }
                else
                {
                    return BadRequest(new AuthResults
                    {
                        Errors = new List<string> { "Ndodhi nje gabim gjate shtimit te rolit" }
                    });
                }
            }
        }

        [Authorize]
        [HttpPut]
        [Route("PerditesoAksesin")]
        public async Task<IActionResult> PerditesoAksesin(string UserID, string roli)
        {
            var user = await _userManager.FindByIdAsync(UserID);

            if (user == null)
            {
                return BadRequest(new AuthResults
                {
                    Errors = new List<string> { "Perdoruesi nuk ekziston!" }
                });
            }

            // Fetch all roles assigned to the user
            var userRoles = await _userManager.GetRolesAsync(user);

            var perdoruesi = await _context.Perdoruesi.Where(x => x.AspNetUserID == UserID).FirstOrDefaultAsync();

            if ((!userRoles.Contains("Menaxher") && roli == "Menaxher" ) || (!userRoles.Contains("1 Euro Menaxher") && roli == "1 Euro Menaxher"))
            {
                // Create and add a new Kartela for this user
                var kartelaCount = await _context.Kartelat.CountAsync();
                var kodiKartela = $"M{perdoruesi.UserID.ToString().PadLeft(6, '0')}{(kartelaCount + 1).ToString().PadLeft(6, '0')}"; // Adjust as needed

                Kartelat kartela = new Kartelat
                {
                    DataKrijimit = DateTime.Now,
                    LlojiKarteles = "Fshirje",
                    Rabati = null,
                    PartneriID = null,
                    KodiKartela = kodiKartela,
                    StafiID = perdoruesi.UserID,
                };

                await _context.Kartelat.AddAsync(kartela);
                await _context.SaveChangesAsync();
            }

            // Check if the user is being removed from the "Menaxher" role
            if ((userRoles.Contains("Menaxher") && roli != "Menaxher") || (userRoles.Contains("1 Euro Menaxher") && roli != "1 Euro Menaxher"))
            {
                // Find and remove the Kartela for this user
                var kartelaToRemove = await _context.Kartelat.Include(x => x.Stafi).FirstOrDefaultAsync(k => k.StafiID == perdoruesi.UserID); // Adjust based on your ID reference

                if (kartelaToRemove != null)
                {
                    _context.Kartelat.Remove(kartelaToRemove);
                    await _context.SaveChangesAsync();
                }
            }

            // Remove all roles except "User"
            foreach (var role in userRoles)
            {
                if (role != "User")
                {
                    var removeRoleResult = await _userManager.RemoveFromRoleAsync(user, role);
                    if (!removeRoleResult.Succeeded)
                    {
                        return BadRequest(new AuthResults
                        {
                            Errors = new List<string> { $"Ndodhi nje gabim gjate heqjes se rolit {role}" }
                        });
                    }
                }
            }

            // Check if the user already has the new role
            if (await _userManager.IsInRoleAsync(user, roli))
            {
                return BadRequest(new AuthResults
                {
                    Errors = new List<string> { "Ky perdorues e ka kete rol!" }
                });
            }

            // Assign the new role
            var perditesoAksesin = await _userManager.AddToRoleAsync(user, roli);

            if (perditesoAksesin.Succeeded)
            {
                return Ok(new AuthResults
                {
                    Result = true
                });
            }
            else
            {
                return BadRequest(new AuthResults
                {
                    Errors = new List<string> { "Ndodhi nje gabim gjate perditesimit te Aksesit" }
                });
            }
        }





        [Authorize]
        [HttpDelete]
        [Route("fshijRolin")]
        public async Task<IActionResult> FshijRolet(string emriRolit)
        {
            var roliEkziston = await _roleManager.FindByNameAsync(emriRolit);

            if (roliEkziston != null)
            {
                var roliUFshi = await _roleManager.DeleteAsync(roliEkziston);

                if (roliUFshi.Succeeded)
                {
                    return Ok(new AuthResults { Result = true });
                }
                else
                {
                    return BadRequest(new AuthResults
                    {
                        Errors = new List<string> { "Ndodhi nje gabim gjate fshirjes" }
                    });
                }
            }
            else
            {
                return BadRequest(new AuthResults
                {
                    Errors = new List<string> { "Ky Rol nuk egziston" }
                });
            }
        }

        


        private string GenerateJwtToken(IdentityUser user, IList<string> roles)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();

            var key = Encoding.UTF8.GetBytes(_configuration.GetSection("JwtConfig:Secret").Value);

            // Token descriptor
            var TokenDescriptor = new SecurityTokenDescriptor()
            {

                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("Id", user.Id),
                    new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                    new Claim(JwtRegisteredClaimNames.Email, value:user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, DateTime.Now.ToUniversalTime().ToString())
                }),

                Expires = DateTime.Now.AddHours(18),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            };

            foreach (var role in roles)
            {
                TokenDescriptor.Subject.AddClaim(new Claim(ClaimTypes.Role, role));
            }

            var token = jwtTokenHandler.CreateToken(TokenDescriptor);
            var jwtToken = jwtTokenHandler.WriteToken(token);

            return jwtToken;
        }

    }

}