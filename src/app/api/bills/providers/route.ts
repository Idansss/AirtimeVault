import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/response";

export const dynamic = "force-dynamic";

// Static provider catalog — replace with VTU provider API calls in production
const PROVIDERS: Record<string, Array<{ code: string; name: string }>> = {
  AIRTIME: [
    { code: "MTN",        name: "MTN"     },
    { code: "AIRTEL",     name: "Airtel"  },
    { code: "GLO",        name: "Glo"     },
    { code: "9MOBILE",    name: "9mobile" },
  ],
  DATA: [
    { code: "MTN",        name: "MTN Data"     },
    { code: "AIRTEL",     name: "Airtel Data"  },
    { code: "GLO",        name: "Glo Data"     },
    { code: "9MOBILE",    name: "9mobile Data" },
  ],
  ELECTRICITY: [
    { code: "IKEDC",      name: "Ikeja Electric"          },
    { code: "EKEDC",      name: "Eko Electric"            },
    { code: "AEDC",       name: "Abuja Electricity"       },
    { code: "PHEDC",      name: "Port Harcourt Electric"  },
    { code: "IBEDC",      name: "Ibadan Electric"         },
    { code: "KAEDCO",     name: "Kaduna Electric"         },
    { code: "KEDCO",      name: "Kano Electric"           },
    { code: "EEDC",       name: "Enugu Electric"          },
    { code: "BEDC",       name: "Benin Electric"          },
    { code: "YEDC",       name: "Yola Electric"           },
    { code: "JED",        name: "Jos Electric"            },
  ],
  CABLE_TV: [
    { code: "DSTV",       name: "DStv"          },
    { code: "GOTV",       name: "GOtv"          },
    { code: "STARTIMES",  name: "StarTimes"     },
  ],
  INTERNET: [
    { code: "SMILE",      name: "Smile"         },
    { code: "SPECTRANET", name: "Spectranet"    },
  ],
  EXAM_PIN: [
    { code: "WAEC",       name: "WAEC Result Checker" },
    { code: "NECO",       name: "NECO Result Checker" },
    { code: "NABTEB",     name: "NABTEB"              },
    { code: "JAMB",       name: "JAMB e-PIN"          },
  ],
  TRANSPORT: [
    { code: "BRT_LAGOS",  name: "Lagos BRT (Cowry Card)"  },
    { code: "LAGBUS",     name: "LAGBUS"                  },
    { code: "LASTMA",     name: "LASTMA e-Tag"            },
    { code: "UBER",       name: "Uber Voucher"            },
    { code: "BOLT",       name: "Bolt Voucher"            },
  ],
  SCHOOL: [
    { code: "JAMB_REG",   name: "JAMB Registration"         },
    { code: "WAEC_REG",   name: "WAEC Registration"         },
    { code: "NECO_REG",   name: "NECO Registration"         },
    { code: "POSTUTME",   name: "Post-UTME Scratch Card"    },
    { code: "SCHOOL_FEE", name: "School Fees (via Remita)"  },
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.toUpperCase();
  if (!category) return err("category query param required");
  const providers = PROVIDERS[category];
  if (!providers) return err(`Unknown category: ${category}`);
  return ok({ providers });
}
