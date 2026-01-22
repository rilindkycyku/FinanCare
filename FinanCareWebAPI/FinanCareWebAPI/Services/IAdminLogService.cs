namespace FinanCareWebAPI.Services
{
    public interface IAdminLogService
    {
        Task LogAsync(string userId, string veprimi, string entiteti, string entitetID, string detaje);
    }
}
