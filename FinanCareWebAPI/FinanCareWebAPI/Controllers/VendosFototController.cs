using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using FinanCareWebAPI.Migrations;

namespace WebAPI.Controllers
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class VendosFototController : Controller
    {
        private readonly FinanCareDbContext _context;

        public VendosFototController(FinanCareDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("PerditesoTeDhenatBiznesit")]
        public async Task<IActionResult> PerditesoTeDhenatBiznesit(IFormFile foto, string logoVjeter)
        {
            if (foto == null || foto.Length == 0)
            {
                return BadRequest("Ju lutem vendosni foton");
            }

            var follderiKlient = Path.Combine("..", "..", "financareonline", "public", "img", "web");
            var follderiAdmin = Path.Combine("..", "..", "financarevite", "public", "img", "web");

            if (!logoVjeter.Equals("PaLogo.png"))
            {
                var fotoVjeterKlient = Path.Combine(follderiKlient, logoVjeter);
                var fotoVjeterAdmin = Path.Combine(follderiAdmin, logoVjeter);

                if (System.IO.File.Exists(fotoVjeterKlient))
                {
                    System.IO.File.Delete(fotoVjeterKlient);
                }
                if (System.IO.File.Exists(fotoVjeterAdmin))
                {
                    System.IO.File.Delete(fotoVjeterAdmin);
                }
            }

            var emriUnikFotos = GjeneroEmrinUnikFotos(foto.FileName);

            var fotoEReKlient = Path.Combine(follderiKlient, emriUnikFotos);
            var fotoEReAdmin = Path.Combine(follderiAdmin, emriUnikFotos);

            using (var stream = new FileStream(fotoEReKlient, FileMode.Create))
            {
                await foto.CopyToAsync(stream);
            }

            using (var stream = new FileStream(fotoEReAdmin, FileMode.Create))
            {
                await foto.CopyToAsync(stream);
            }

            return Ok(emriUnikFotos);
        }

        [AllowAnonymous]
        [HttpPost("EditoProduktin")]
        public async Task<IActionResult> EditoProduktin(IFormFile? foto, string? fotoVjeterProduktit = null)
        {
            var follderi = Path.Combine("..", "..", "financareonline", "public", "img", "products");

            // Sigurohu që folderi ekziston
            if (!Directory.Exists(follderi))
                Directory.CreateDirectory(follderi);

            // 2. Nëse nuk ka foto të re → kthe të vjetrën
            if (foto == null || foto.Length == 0)
                return Ok(fotoVjeterProduktit ?? "ProduktPaFoto.png");

            // 3. Fshi foton e vjetër (vetëm nëse nuk është default)
            if (!string.IsNullOrWhiteSpace(fotoVjeterProduktit) &&
                !fotoVjeterProduktit.Equals("ProduktPaFoto.png", StringComparison.OrdinalIgnoreCase))
            {
                var fotoVjeterPath = Path.Combine(follderi, fotoVjeterProduktit);

                if (System.IO.File.Exists(fotoVjeterPath))
                {
                    try
                    {
                        System.IO.File.Delete(fotoVjeterPath);
                        // Ose me retry nëse është locked:
                        // await Task.Delay(100);
                        // System.IO.File.Delete(fotoVjeterPath);
                    }
                    catch (IOException ex)
                    {
                        // Log-o nëse do, por mos e ndal procesin
                        Console.WriteLine($"Nuk u fshi dot foto e vjetër: {ex.Message}");
                        // Vazhdo gjithsesi – fotoja e re do të ngarkohet
                    }
                }
            }

            // 4. Ruaj foton e re
            var emriUnik = GjeneroEmrinUnikFotos(foto.FileName);
            var fotoPath = Path.Combine(follderi, emriUnik);

            using (var stream = new FileStream(fotoPath, FileMode.Create))
            {
                await foto.CopyToAsync(stream);
            }

            return Ok(emriUnik);
        }

        private string GjeneroEmrinUnikFotos(string emriOrigjinal)
        {
            return $"{Guid.NewGuid():N}{Path.GetExtension(emriOrigjinal)}";
        }
    }
}
