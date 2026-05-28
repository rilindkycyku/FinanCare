using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FinanCareWebAPI.Models;

public partial class TeDhenatBiznesit
{
    [Key]
    public int IDTeDhenatBiznesit { get; set; }
    public string? EmriIBiznesit { get; set; }
    public string? ShkurtesaEmritBiznesit { get; set; }
    public int? NUI { get; set; }
    public int? NF { get; set; }
    public int? NrTVSH { get; set; }
    public string? Adresa { get; set; }
    public string? NrKontaktit { get; set; }
    public string? Email { get; set; }
    public string? Logo { get; set; }
    public string? EmailDomain { get; set; }
    public string? LicenseKey { get; set; }
    public DateTime? LicenseExpiry { get; set; }
    public string? LicenseSignature { get; set; }
    public string? LicenseUsername { get; set; }
}
