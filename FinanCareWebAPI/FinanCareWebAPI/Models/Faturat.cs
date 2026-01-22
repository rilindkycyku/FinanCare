using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanCareWebAPI.Models;

public partial class Faturat
{ 
    [Key]
    public int IDRegjistrimit { get; set; }
    public DateTime? DataRegjistrimit { get; set; } = DateTime.Now;
    public int? StafiID { get; set; } = null;
    public decimal? TotaliPaTVSH { get; set; } = 0;
    public decimal? TVSH { get; set; } = 0;
    public int? IDPartneri { get; set; } = null;
    public string? StatusiPageses { get; set; } = "E Paguar";
    public string? LlojiPageses { get; set; } = "Cash";
    public string? LlojiKalkulimit { get; set; } = "HYRJE";
    public string? NrFatures { get; set; } = null;
    public string? StatusiKalkulimit { get; set; } = "false";
    public string? PershkrimShtese { get; set; } = "";
    public decimal? Rabati { get; set; } = 0;
    public decimal? Transporti { get; set; } = 0;
    public int? NrRendorFatures { get; set; } = 0;
    public string? EshteFaturuarOferta { get; set; } = "false";
    public int? IDBonusKartela { get; set; } = null;

    [ForeignKey(nameof(IDPartneri))]
    public virtual Partneri? Partneri { get; set; }
    [ForeignKey(nameof(StafiID))]
    public virtual Perdoruesi? Stafi { get; set; }
    [ForeignKey(nameof(IDBonusKartela))]
    public virtual Kartelat? BonusKartela { get; set; }
    public virtual ICollection<TeDhenatFaturat> TeDhenatFaturat { get; } = new List<TeDhenatFaturat>();
}
