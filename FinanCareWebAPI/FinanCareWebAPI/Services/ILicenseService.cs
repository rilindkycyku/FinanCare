using System;

namespace FinanCareWebAPI.Services
{
    public interface ILicenseService
    {
        /// <summary>
        /// Decrypts and validates a license key with a developer-provided password.
        /// </summary>
        /// <param name="username">Expected username (business name)</param>
        /// <param name="licenseKey">Base64 encrypted license key</param>
        /// <param name="password">Developer's personal password used for encryption</param>
        /// <returns>The decrypted expiry date if valid, otherwise throws an exception</returns>
        DateTime DecryptAndValidateLicense(string username, string licenseKey, string password);

        /// <summary>
        /// Generates a secure tamper-proof signature for a given username and expiry date.
        /// </summary>
        string GenerateTamperSignature(string username, DateTime expiryDate);

        /// <summary>
        /// Verifies whether the stored license expiry and signature have been tampered with or expired.
        /// </summary>
        bool VerifyLicense(string username, DateTime? expiryDate, string? signature, out string message);
    }
}
