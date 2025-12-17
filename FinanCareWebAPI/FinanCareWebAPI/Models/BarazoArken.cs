using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanCareWebAPI.Models;

public partial class BarazoArken
{
    [Key]
    public int IDBarazoArken { get; set; }
    public int? IDArkatari { get; set; } = null;
    public decimal? TotaliShitjeve { get; set; } = 0;

    public decimal? FillimiArkes { get; set; } = 0;
    public decimal? TeShtuaraNeArke { get; set; } = 0;

    public decimal? Cash { get; set; } = 0;
    public decimal? Monedha { get; set; } = 0;
    public decimal? Borxhe { get; set; } = 0;
    public decimal? Banka { get; set; } = 0;
    public decimal? PagesFatura { get; set; } = 0;
    public decimal? Tjera { get; set; } = 0;
    public string? PershkrimiTjera { get; set; } = null;

    public DateTime? KohaBarazimit { get; set; } = DateTime.Now;

    public int? IDPersoniPergjegjes { get; set; } = null;

    [ForeignKey(nameof(IDArkatari))]
    public virtual Perdoruesi? Arkatari { get; set; }
    [ForeignKey(nameof(IDPersoniPergjegjes))]
    public virtual Perdoruesi? PersoniPergjejes { get; set; }
}
