using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanCareWebAPI.Models;

public partial class DitaFurnizimit
{
    [Key]
    public int IDDitaFurnizimit { get; set; }
    public int? IDPartneri { get; set; } = null;
    public string? DitaEFurnizimit { get; set; }

    [ForeignKey(nameof(IDPartneri))]
    public virtual Partneri? Partneri { get; set; }
}
