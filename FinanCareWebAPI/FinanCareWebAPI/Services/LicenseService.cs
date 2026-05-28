using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace FinanCareWebAPI.Services
{
    public class LicenseService : ILicenseService
    {
        private readonly IConfiguration _configuration;
        private static string GetObfuscatedSecret()
        {
            byte[] xored = new byte[] {
                236, 195, 196, 203, 196, 233, 203, 216, 207, 249, 207, 201, 223, 216, 207, 230, 
                195, 201, 207, 196, 217, 195, 196, 205, 249, 207, 201, 216, 207, 222, 225, 207, 
                211, 152, 154, 152, 156, 139
            };
            byte[] decrypted = new byte[xored.Length];
            for (int i = 0; i < xored.Length; i++)
            {
                decrypted[i] = (byte)(xored[i] ^ 0xAA);
            }
            return System.Text.Encoding.UTF8.GetString(decrypted);
        }

        public LicenseService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetServerSecret()
        {
            return _configuration["Licensing:Secret"] ?? GetObfuscatedSecret();
        }

        public DateTime DecryptAndValidateLicense(string username, string licenseKey, string password)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentException("Username nuk mund të jetë bosh.", nameof(username));
            if (string.IsNullOrWhiteSpace(licenseKey))
                throw new ArgumentException("Kodi i licencës nuk mund të jetë bosh.", nameof(licenseKey));
            if (string.IsNullOrWhiteSpace(password))
                throw new ArgumentException("Fjalëkalimi nuk mund të jetë bosh.", nameof(password));

            try
            {
                string decrypted = DecryptAes(licenseKey, password);
                string[] parts = decrypted.Split(';');

                // Supported formats:
                //   2-part (legacy): "Username;ExpiryDate"
                //   3-part (new):    "Username;ExpiryDate;VlenPer"
                if (parts.Length < 2 || parts.Length > 3)
                    throw new FormatException("Kodi i licencës ka format të pasaktë.");

                string decryptedUsername = parts[0];
                if (!string.Equals(decryptedUsername, username, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("Kodi i licencës nuk përputhet me Username e ofruar.");

                if (!DateTime.TryParse(parts[1], out DateTime expiryDate))
                    throw new FormatException("Data e skadimit në kodin e licencës ka format të pasaktë.");

                // Validate VlenPer when present — must be "FinanCare" or "*" (wildcard)
                if (parts.Length == 3)
                {
                    string vlenPer = parts[2].Trim();
                    if (!string.Equals(vlenPer, "FinanCare", StringComparison.OrdinalIgnoreCase)
                        && !string.Equals(vlenPer, "*", StringComparison.Ordinal))
                    {
                        throw new InvalidOperationException(
                            $"Kjo licencë është lëshuar për produktin '{vlenPer}' dhe nuk është e vlefshme për FinanCare.");
                    }
                }

                return expiryDate;
            }
            catch (Exception ex) when (ex is not ArgumentException && ex is not FormatException && ex is not InvalidOperationException)
            {
                throw new InvalidOperationException("Fjalëkalimi i pasaktë ose kodi i licencës është i dëmtuar.", ex);
            }
        }


        public string GenerateTamperSignature(string username, DateTime expiryDate)
        {
            string message = $"{username.ToLowerInvariant()};{expiryDate:yyyy-MM-dd}";
            string secret = GetServerSecret();
            byte[] secretBytes = Encoding.UTF8.GetBytes(secret);
            byte[] messageBytes = Encoding.UTF8.GetBytes(message);

            using (var hmac = new HMACSHA256(secretBytes))
            {
                byte[] hashBytes = hmac.ComputeHash(messageBytes);
                return Convert.ToBase64String(hashBytes);
            }
        }

        public bool VerifyLicense(string username, DateTime? expiryDate, string? signature, out string message)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                message = "Të dhënat e biznesit nuk janë të konfiguruara (Username bosh).";
                return false;
            }

            if (!expiryDate.HasValue || string.IsNullOrWhiteSpace(signature))
            {
                message = "Sistemi nuk është i licencuar. Ju lutem aktivizoni licencën.";
                return false;
            }

            // Verify signature
            string expectedSignature = GenerateTamperSignature(username, expiryDate.Value);
            if (signature != expectedSignature)
            {
                message = "Vërejtje: Licenca është manipuluar ose ndryshuar jashtë sistemit!";
                return false;
            }

            // Verify expiry
            if (expiryDate.Value.Date < DateTime.Today)
            {
                message = $"Licenca ka skaduar më date {expiryDate.Value:dd/MM/yyyy}. Ju lutemi rinovoni licencën.";
                return false;
            }

            message = "Licenca është e rregullt.";
            return true;
        }

        private string DecryptAes(string cipherText, string password)
        {
            byte[] cipherBytes = Convert.FromBase64String(cipherText);
            using (Aes aes = Aes.Create())
            {
                using (SHA256 sha256 = SHA256.Create())
                {
                    aes.Key = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                }

                int ivLength = aes.BlockSize / 8; // 16 bytes for AES
                byte[] iv = new byte[ivLength];
                Array.Copy(cipherBytes, 0, iv, 0, ivLength);
                aes.IV = iv;

                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(cipherBytes, ivLength, cipherBytes.Length - ivLength);
                        cs.FlushFinalBlock();
                    }
                    return Encoding.UTF8.GetString(ms.ToArray());
                }
            }
        }
    }
}
