using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanCareWebAPI.Controllers.SERVER
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminLogsController : ControllerBase
    {
        private readonly FinanCareDbContext _context;
        private readonly IAdminLogService _adminLogService;

        public AdminLogsController(FinanCareDbContext context, IAdminLogService adminLogService)
        {
            _context = context;
            _adminLogService = adminLogService;
        }

        /// <summary>
        /// Gets the current user ID from JWT claims
        /// </summary>
        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        /// <summary>
        /// Retrieves all admin logs with staff information
        /// </summary>
        [Authorize]
        [HttpGet("ShfaqGjurmimet")]
        public async Task<IActionResult> ShfaqGjurmimet()
        {
            try
            {
                var gjurmimet = await _context.AdminLogs
                    .Include(x => x.Stafi)
                    .OrderByDescending(x => x.Koha)
                    .ToListAsync();

                return Ok(gjurmimet);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Gabim në marrjen e gjurmimeve", error = ex.Message });
            }
        }

        /// <summary>
        /// Gets the count of admin logs
        /// </summary>
        [Authorize]
        [HttpGet("ShfaqNumerinEGjurmimeve")]
        public async Task<IActionResult> ShfaqNumerinEGjurmimeve()
        {
            try
            {
                var count = await _context.AdminLogs.CountAsync();
                return Ok(new { totaliGjurmimeve = count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Gabim në marrjen e numrit të gjurmimeve", error = ex.Message });
            }
        }

        /// <summary>
        /// Clears all admin logs (only for Menaxher role)
        /// </summary>
        [Authorize(Roles = "Menaxher")]
        [HttpDelete("FshijGjurmimetEGjitha")]
        public async Task<IActionResult> FshijGjurmimetEGjitha()
        {
            try
            {
                var logsCount = await _context.AdminLogs.CountAsync();

                if (logsCount == 0)
                    return NotFound(new { message = "Nuk ka gjurmimet për të fshirë" });

                var logs = await _context.AdminLogs.ToListAsync();
                _context.AdminLogs.RemoveRange(logs);
                await _context.SaveChangesAsync();

                var userId = GetUserId();
                if (!string.IsNullOrEmpty(userId))
                {
                    await _adminLogService.LogAsync(userId, "Largo", "AdminLogs", "All",
                        $"U fshirën të gjitha gjurmimet. Totali: {logsCount}");
                }

                return Ok(new { message = $"U fshirën {logsCount} gjurmimet me sukses!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Gabim në fshirjen e gjurmimeve", error = ex.Message });
            }
        }

        /// <summary>
        /// Clears logs older than specified days (only for Menaxher role)
        /// </summary>
        [Authorize(Roles = "Menaxher")]
        [HttpDelete("FshijGjurmimetEVjetra/{dite:int}")]
        public async Task<IActionResult> FshijGjurmimetEVjetra(int dite)
        {
            try
            {
                if (dite < 1)
                    return BadRequest(new { message = "Numri i ditëve duhet të jetë minimum 1" });

                var cutoffDate = DateTime.Now.AddDays(-dite);

                var logsToDelete = await _context.AdminLogs
                    .Where(x => x.Koha < cutoffDate)
                    .ToListAsync();

                if (logsToDelete.Count == 0)
                    return NotFound(new { message = $"Nuk ka gjurmimet më të vjetra se {dite} ditë" });

                _context.AdminLogs.RemoveRange(logsToDelete);
                await _context.SaveChangesAsync();

                var userId = GetUserId();
                if (!string.IsNullOrEmpty(userId))
                {
                    await _adminLogService.LogAsync(userId, "Largo", "AdminLogs", "Old",
                        $"U fshirën gjurmimet më të vjetra se {dite} ditë. Totali: {logsToDelete.Count}");
                }

                return Ok(new { message = $"U fshirën {logsToDelete.Count} gjurmimet më të vjetra me sukses!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Gabim në fshirjen e gjurmimeve", error = ex.Message });
            }
        }

        /// <summary>
        /// Exports admin logs to CSV format
        /// </summary>
        [Authorize]
        [HttpGet("EksportoGjurmimet")]
        public async Task<IActionResult> EksportoGjurmimet()
        {
            try
            {
                var gjurmimet = await _context.AdminLogs
                    .Include(x => x.Stafi)
                    .OrderByDescending(x => x.Koha)
                    .ToListAsync();

                if (gjurmimet.Count == 0)
                    return NotFound(new { message = "Nuk ka gjurmimet për të eksportuar" });

                var csv = "ID,Stafi,Koha,Veprimi,Entiteti,Entiteti ID,Detajet\n";
                foreach (var log in gjurmimet)
                {
                    var stafiEmri = log.Stafi != null ? $"{log.Stafi.Emri} {log.Stafi.Mbiemri}" : "Unknown";
                    csv += $"{log.Id},\"{stafiEmri}\",{log.Koha},{log.Veprimi},{log.Entiteti},{log.EntitetiId},\"{log.Detaje}\"\n";
                }

                var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
                return File(bytes, "text/csv", $"Gjurmimet_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Gabim në eksportimin e gjurmimeve", error = ex.Message });
            }
        }
    }
}