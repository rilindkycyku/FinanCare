using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanCareWebAPI.Models;

public partial class Perdoruesi
{
    [Key]
    public int UserID { get; set; }

    public string? Emri { get; set; }

    public string? Mbiemri { get; set; }

    public string? Email { get; set; }

    public string? Username { get; set; }

    public string AspNetUserID { get; set; }

    /// <summary>Superadmin i fshehur i sistemit - nuk shfaqet ne listen e perdoruesve</summary>
    public bool IsSuperAdmin { get; set; } = false;

    [ForeignKey("AspNetUserID")]
    public IdentityUser? AspNetUser { get; set; }

    public virtual ICollection<Faturat> Faturat { get; } = new List<Faturat>();

    public virtual TeDhenatPerdoruesit? TeDhenatPerdoruesit { get; set; }
    public virtual Kartelat? Kartelat { get; set; }
}
