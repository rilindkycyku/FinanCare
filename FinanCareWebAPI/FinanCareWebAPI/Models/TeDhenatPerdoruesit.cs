using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanCareWebAPI.Models;

public partial class TeDhenatPerdoruesit
{
    [Key]
    public int UserID { get; set; }
    public string? NrKontaktit { get; set; }
    public string? Adresa { get; set; }
    public string? EmailPrivat { get; set; }
    public DateTime? Datelindja { get; set; }
    public DateTime? DataFillimitKontrates { get; set; }
    public DateTime? DataMbarimitKontrates { get; set; }
    public decimal? Paga { get; set; }
    public string? Profesioni { get; set; }
    public string? Specializimi { get; set; }
    public string? Kualifikimi { get; set; }
    public int? BankaID { get; set; }
    public string? NumriLlogarisBankare { get; set; }
    public string? NrPersonal {get; set; }
    public string? EshtePuntorAktive { get; set; } = "true";
    public string? isDeleted { get; set; } = "false";

    [ForeignKey(nameof(UserID))]
    public virtual Perdoruesi? User { get; set; }
    [ForeignKey(nameof(BankaID))]
    public virtual Bankat? Banka { get; set; }
}
