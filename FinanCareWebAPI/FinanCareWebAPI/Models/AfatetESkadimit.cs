using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanCareWebAPI.Models;

public partial class AfatetESkadimit
{
    [Key]
    public int ID { get; set; }
    public int? StafiID { get; set; }
    public int? IDProduktit { get; set; }
    public DateTime? DataSkadimit { get; set; } = DateTime.Now;

    [ForeignKey(nameof(IDProduktit))]
    public virtual Produkti? Produkti { get; set; }
    [ForeignKey(nameof(StafiID))]
    public virtual Perdoruesi? PersoniPergjegjes { get; set; }
}
