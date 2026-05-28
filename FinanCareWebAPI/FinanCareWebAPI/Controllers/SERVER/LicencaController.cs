using System;
using System.Linq;
using System.Threading.Tasks;
using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanCareWebAPI.Controllers.SERVER
{
    [ApiController]
    [Route("api/[controller]")]
    public class LicencaController : ControllerBase
    {
        private readonly FinanCareDbContext _context;
        private readonly ILicenseService _licenseService;

        public LicencaController(FinanCareDbContext context, ILicenseService licenseService)
        {
            _context = context;
            _licenseService = licenseService;
        }

        private static string GetObfuscatedPassword()
        {
            byte[] xored = new byte[] {
                236, 227, 228, 235, 228, 233, 235, 248, 239, 230, 227, 233, 239, 228, 249, 239, 
                248, 227, 230, 227, 228, 238, 225, 243, 233, 243, 225, 255
            };
            byte[] decrypted = new byte[xored.Length];
            for (int i = 0; i < xored.Length; i++)
            {
                decrypted[i] = (byte)(xored[i] ^ 0xAA);
            }
            return System.Text.Encoding.UTF8.GetString(decrypted);
        }

        public class AktivizoRequest
        {
            public string Username { get; set; } = string.Empty;
            public string LicenseKey { get; set; } = string.Empty;
            public string? Password { get; set; }
        }

        [HttpPost("aktivizo")]
        public async Task<IActionResult> Aktivizo([FromBody] AktivizoRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Kërkesa është e zbrazët." });

            try
            {
                // 1. Decrypt and validate the license code using the password (default to shared secret if blank)
                string decryptionPassword = string.IsNullOrWhiteSpace(request.Password)
                    ? GetObfuscatedPassword()
                    : request.Password;

                DateTime expiryDate = _licenseService.DecryptAndValidateLicense(
                    request.Username, 
                    request.LicenseKey, 
                    decryptionPassword
                );

                // 2. Fetch the business record from database
                var teDhenat = await _context.TeDhenatBiznesit.FirstOrDefaultAsync();
                if (teDhenat == null)
                {
                    // Create one if it does not exist (safety fallback)
                    teDhenat = new TeDhenatBiznesit
                    {
                        EmriIBiznesit = request.Username,
                        LicenseUsername = request.Username,
                        Adresa = "Kosovë"
                    };
                    await _context.TeDhenatBiznesit.AddAsync(teDhenat);
                }
                else
                {
                    // Decouple business name from licensed name. The license signature will verify against LicenseUsername.
                    teDhenat.LicenseUsername = request.Username;
                    if (string.IsNullOrWhiteSpace(teDhenat.EmriIBiznesit))
                    {
                        teDhenat.EmriIBiznesit = request.Username;
                    }
                }

                // 3. Generate secure HMAC signature using the server secret key
                string signature = _licenseService.GenerateTamperSignature(request.Username, expiryDate);

                // 4. Save to database
                teDhenat.LicenseKey = request.LicenseKey;
                teDhenat.LicenseExpiry = expiryDate;
                teDhenat.LicenseSignature = signature;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Sistemi u aktivizua me sukses!",
                    expiryDate = expiryDate.ToString("dd/MM/yyyy"),
                    biznesi = request.Username
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Gabim gjatë aktivizimit: {ex.Message}" });
            }
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var teDhenat = await _context.TeDhenatBiznesit.FirstOrDefaultAsync();
            if (teDhenat == null)
            {
                return Ok(new
                {
                    isLicensed = false,
                    message = "Të dhënat e biznesit nuk ekzistojnë në sistem."
                });
            }

            bool isValid = _licenseService.VerifyLicense(
                teDhenat.LicenseUsername ?? teDhenat.EmriIBiznesit ?? string.Empty, 
                teDhenat.LicenseExpiry, 
                teDhenat.LicenseSignature, 
                out string message
            );

            int? daysRemaining = null;
            if (teDhenat.LicenseExpiry.HasValue)
            {
                daysRemaining = (int)(teDhenat.LicenseExpiry.Value.Date - DateTime.Today).TotalDays;
            }

            return Ok(new
            {
                isLicensed = isValid,
                message = message,
                expiryDate = teDhenat.LicenseExpiry?.ToString("dd/MM/yyyy"),
                daysRemaining = daysRemaining,
                biznesi = teDhenat.EmriIBiznesit
            });
        }
    }
}
