using System.ComponentModel.DataAnnotations.Schema;

namespace FinanCareWebAPI.Models;

    public class AdminLogs
    {
        public int Id { get; set; }
        public int? StafiId { get; set; }
        public string? Veprimi { get; set; }
        public string? Entiteti { get; set; }
        public string? EntitetiId { get; set; }
        public DateTime Koha { get; set; }
        public string? Detaje { get; set; }

        [ForeignKey(nameof(StafiId))]
        public virtual Perdoruesi? Stafi { get; set; }
    }

