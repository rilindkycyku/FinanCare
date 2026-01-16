using FinanCareWebAPI.Migrations;
using FinanCareWebAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanCareWebAPI.Services
{
    public class KartelaService
    {
        private readonly FinanCareDbContext _context;

        public KartelaService(FinanCareDbContext context)
        {
            _context = context;
        }

        public async Task<bool> KartelaExists(string kodiKartela)
        {
            return await _context.Kartelat.AnyAsync(k => k.KodiKartela == kodiKartela);
        }

        public async Task<bool> PartnerKaKartelaBonus(int idPartneri)
        {
            return await _context.Kartelat.AnyAsync(k =>
                k.PartneriID == idPartneri &&
                k.LlojiKarteles == "Bonus");
        }

        public async Task<Kartelat> ShtoKartelenBonus(int idPartneri, int stafiID, int rabati)
        {
            // Check if partner already has a bonus card
            var kaKartelaBonus = await PartnerKaKartelaBonus(idPartneri);
            if (kaKartelaBonus)
            {
                throw new InvalidOperationException("Partneri ka tashme nje kartele bonus");
            }

            var kartelaCount = await _context.Kartelat.CountAsync();
            var partneri = await _context.Partneri.FirstOrDefaultAsync(x => x.IDPartneri == idPartneri);

            if (partneri == null)
            {
                throw new InvalidOperationException("Partneri nuk u gjet");
            }

            // Generate unique card code
            string kodiKartela;
            int attempt = 0;
            do
            {
                kodiKartela = $"B{idPartneri.ToString().PadLeft(6, '0')}{(kartelaCount + 1 + attempt).ToString().PadLeft(6, '0')}";
                attempt++;
            } while (await KartelaExists(kodiKartela));

            Kartelat kartela = new Kartelat
            {
                DataKrijimit = DateTime.Now,
                LlojiKarteles = "Bonus",
                Rabati = rabati,
                PartneriID = idPartneri,
                KodiKartela = kodiKartela,
                StafiID = stafiID,
            };

            partneri.Username = kodiKartela;
            partneri.Password = kodiKartela;

            _context.Partneri.Update(partneri);
            _context.Kartelat.Add(kartela);
            await _context.SaveChangesAsync();

            return kartela;
        }

        public async Task<Kartelat?> FshijKartelenMeKod(string kodiKartela)
        {
            // Get the kartela with partner info
            var kartela = await _context.Kartelat
                .Include(k => k.Partneri)
                .FirstOrDefaultAsync(k => k.KodiKartela == kodiKartela);

            if (kartela == null)
            {
                return null;
            }

            // If it's a bonus card, clear partner's username/password
            if (kartela.LlojiKarteles == "Bonus" && kartela.Partneri != null)
            {
                if (kartela.Partneri.Username == kodiKartela)
                {
                    kartela.Partneri.Username = null;
                }
                if (kartela.Partneri.Password == kodiKartela)
                {
                    kartela.Partneri.Password = null;
                }
                _context.Partneri.Update(kartela.Partneri);
            }

            // Remove the kartela
            _context.Kartelat.Remove(kartela);
            await _context.SaveChangesAsync();

            return kartela;
        }

        // Delete card by ID
        public async Task<Kartelat?> FshijKartelenMeID(int kartelaID)
        {
            var kartela = await _context.Kartelat
                .Include(k => k.Partneri)
                .FirstOrDefaultAsync(k => k.IDKartela == kartelaID);

            if (kartela == null)
            {
                return null;
            }

            // If it's a bonus card, clear partner's username/password
            if (kartela.LlojiKarteles == "Bonus" && kartela.Partneri != null)
            {
                if (kartela.Partneri.Username == kartela.KodiKartela)
                {
                    kartela.Partneri.Username = null;
                }
                if (kartela.Partneri.Password == kartela.KodiKartela)
                {
                    kartela.Partneri.Password = null;
                }
                _context.Partneri.Update(kartela.Partneri);
            }

            _context.Kartelat.Remove(kartela);
            await _context.SaveChangesAsync();

            return kartela;
        }

        public async Task<Kartelat?> GetKartelaByKod(string kodiKartela)
        {
            return await _context.Kartelat
                .Include(k => k.Partneri)
                .FirstOrDefaultAsync(k => k.KodiKartela == kodiKartela);
        }

        public async Task<List<Kartelat>> GetKartelatByPartner(int idPartneri)
        {
            return await _context.Kartelat
                .Where(k => k.PartneriID == idPartneri)
                .OrderByDescending(k => k.DataKrijimit)
                .ToListAsync();
        }
    }
}
