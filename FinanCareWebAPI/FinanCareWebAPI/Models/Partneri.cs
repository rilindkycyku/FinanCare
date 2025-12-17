using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FinanCareWebAPI.Models;

public partial class Partneri
{
    [Key]
    public int IDPartneri { get; set; }
    public string? EmriBiznesit { get; set; }
    public string? NUI { get; set; }
    public string? NRF { get; set; }
    public string? TVSH { get; set; }
    public string? Email { get; set; }
    public string? Adresa { get; set; }
    public string? NrKontaktit { get; set; }
    public string? LlojiPartnerit { get; set; }
    public string? ShkurtesaPartnerit { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? isDeleted { get; set; } = "false";

    public virtual ICollection<Faturat> Faturat { get; set; } = new List<Faturat>();

    public virtual ICollection<Produkti> Produkti { get; } = new List<Produkti>();
    public virtual Kartelat? Kartela { get; set; }
}
