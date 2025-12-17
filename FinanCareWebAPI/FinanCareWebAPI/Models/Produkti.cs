using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanCareWebAPI.Models;

public partial class Produkti
{
    [Key]
    public int ProduktiID { get; set; }
    public string? EmriProduktit { get; set; }
    public int? IDPartneri { get; set; }
    public int? IDNjesiaMatese { get; set; }
    public string? Barkodi { get; set; }
    public string? KodiProduktit { get; set; }
    public int? LlojiTVSH { get; set; }
    public int? IDGrupiProduktit { get; set; }
    public decimal? SasiaShumices { get; set; }
    public string? FotoProduktit { get; set; } = "ProduktPaFoto.png";
    public string? perfshiNeOnline { get; set; } = "false";
    public string? isDeleted { get; set; } = "false";

    [ForeignKey(nameof(IDNjesiaMatese))]
    public virtual NjesiaMatese? NjesiaMatese { get; set; }
    [ForeignKey(nameof(IDPartneri))]
    public virtual Partneri? Partneri { get; set; }
    [ForeignKey(nameof(IDGrupiProduktit))]
    public virtual GrupiProduktit? GrupiProduktit { get; set; }
    public virtual StokuQmimiProduktit? StokuQmimiProduktit { get; set; }
    public virtual ICollection<TeDhenatFaturat> TeDhenatFaturat { get; } = new List<TeDhenatFaturat>();
    public virtual ZbritjaQmimitProduktit? ZbritjaQmimitProduktit { get; set; }
}
