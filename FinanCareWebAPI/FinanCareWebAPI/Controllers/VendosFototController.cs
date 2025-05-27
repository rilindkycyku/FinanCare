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

        [Authorize]
        [HttpPost]
        [Route("PerditesoTeDhenatBiznesit")]
        public async Task<IActionResult> PerditesoTeDhenatBiznesit(IFormFile foto, string logoVjeter)
        {
            if (foto == null || foto.Length == 0)
            {
                return BadRequest("Ju lutem vendosni foton");
            }

            var follderi = Path.Combine("..", "..", "financarevite", "public", "img", "web");

            if (!logoVjeter.Equals("PaLogo.png"))
            {
                var fotoVjeter = Path.Combine(follderi, logoVjeter);

                if (System.IO.File.Exists(fotoVjeter))
                {
                    System.IO.File.Delete(fotoVjeter);
                }
            }

            var emriUnikFotos = GjeneroEmrinUnikFotos(foto.FileName);

            var fotoERe = Path.Combine(follderi, emriUnikFotos);

            using (var stream = new FileStream(fotoERe, FileMode.Create))
            {
                await foto.CopyToAsync(stream);
            }

            return Ok(emriUnikFotos);
        }

        private string GjeneroEmrinUnikFotos(string emriFotos)
        {
            string emriUnikIFotos = Guid.NewGuid().ToString("N") + Path.GetExtension(emriFotos);

            return emriUnikIFotos;
        }
    }
}
