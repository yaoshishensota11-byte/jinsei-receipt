// このファイルは scripts/buildapi.mjs が作る。直接は書きかえない。

// src/server/og.ts
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// src/engine/rng.ts
function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 1540483477);
  h ^= h >>> 15;
  return h >>> 0;
}
var Rng = class {
  constructor(seed) {
    this.s = seed >>> 0 || 2654435769;
  }
  next() {
    let t = this.s = this.s + 1831565813 >>> 0;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  chance(p) {
    return this.next() < p;
  }
  range(a, b) {
    return a + (b - a) * this.next();
  }
  int(a, b) {
    return Math.floor(this.range(a, b + 1));
  }
  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }
  weighted(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }
  normal(mean = 0, sd = 1) {
    const u = Math.max(this.next(), 1e-12);
    const v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
};
function streamRng(seed, stream, age) {
  return new Rng(hashStr(`${seed}|${stream}|${age}`));
}

// data/world/life_stats.json
var life_stats_default = {
  AFG: {
    roadDeathsPer100k: 23.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2021",
      socialAssistanceQ1: "2011",
      socialProtection: "2019",
      childLabour: "2023"
    },
    maternalDeathsPer100kBirths: 521,
    accountShare: 0.0965,
    socialAssistanceQ1: 0.1247,
    socialProtection: 0.075,
    childLabour: 0.193
  },
  AGO: {
    roadDeathsPer100k: 15,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialAssistanceQ1: "2018",
      socialProtection: "2022",
      childLabour: "2024"
    },
    maternalDeathsPer100kBirths: 183,
    socialAssistanceQ1: 0.0468,
    socialProtection: 0.087,
    childLabour: 0.14
  },
  ARG: {
    roadDeathsPer100k: 10.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2021",
      childLabour: "2017"
    },
    maternalDeathsPer100kBirths: 33,
    accountShare: 0.8174,
    socialAssistanceQ1: 0.6886,
    socialProtection: 0.659,
    childLabour: 0.02
  },
  AUS: {
    roadDeathsPer100k: 4.5,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 2,
    accountShare: 0.9801,
    socialProtection: 0.94
  },
  BDI: {
    roadDeathsPer100k: 12.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialAssistanceQ1: "2019",
      socialProtection: "2022",
      childLabour: "2020"
    },
    maternalDeathsPer100kBirths: 392,
    socialAssistanceQ1: 0.1126,
    socialProtection: 0.161,
    childLabour: 0.566
  },
  BEN: {
    roadDeathsPer100k: 24.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2020",
      childLabour: "2022"
    },
    maternalDeathsPer100kBirths: 518,
    accountShare: 0.5184,
    socialAssistanceQ1: 0.0441,
    socialProtection: 0.084,
    childLabour: 0.199
  },
  BFA: {
    roadDeathsPer100k: 27.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2021",
      childLabour: "2022"
    },
    maternalDeathsPer100kBirths: 242,
    accountShare: 0.5143,
    socialAssistanceQ1: 0.4704,
    socialProtection: 0.097,
    childLabour: 0.206
  },
  BGD: {
    roadDeathsPer100k: 18.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2021",
      childLabour: "2025",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 115,
    accountShare: 0.4328,
    socialAssistanceQ1: 0.6934,
    socialProtection: 0.22,
    childLabour: 0.092,
    sicknessBenefit: 0.5,
    emigrantShare: 0.0508,
    emigrantDest: [
      [
        "Saudi Arabia",
        2362680
      ],
      [
        "India",
        2293959
      ],
      [
        "United Arab Emirates",
        1024949
      ]
    ],
    alcoholUseDisorder: 8e-3
  },
  BOL: {
    roadDeathsPer100k: 17.7,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2021",
      childLabour: "2019"
    },
    maternalDeathsPer100kBirths: 146,
    accountShare: 0.5685,
    socialAssistanceQ1: 0.9934,
    socialProtection: 0.384,
    childLabour: 0.136
  },
  BRA: {
    roadDeathsPer100k: 15.7,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2022",
      childLabour: "2022",
      singleParentPoverty: "2022",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 67,
    accountShare: 0.8638,
    socialAssistanceQ1: 0.6428,
    socialProtection: 0.712,
    childLabour: 0.021,
    singleParentPoverty: 0.6122,
    sicknessBenefit: 1,
    emigrantShare: 0.0104,
    emigrantDest: [
      [
        "United States",
        738994
      ],
      [
        "Japan",
        207220
      ],
      [
        "Spain",
        179946
      ]
    ],
    alcoholUseDisorder: 0.042
  },
  CAF: {
    roadDeathsPer100k: 26.1,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialProtection: "2019",
      childLabour: "2019"
    },
    maternalDeathsPer100kBirths: 692,
    socialProtection: 0.035,
    childLabour: 0.269
  },
  CAN: {
    roadDeathsPer100k: 4.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 12,
    accountShare: 0.984,
    socialProtection: 0.956
  },
  CHL: {
    roadDeathsPer100k: 10.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2022",
      childLabour: "2012"
    },
    maternalDeathsPer100kBirths: 10,
    accountShare: 0.8507,
    socialAssistanceQ1: 0.9278,
    socialProtection: 0.753,
    childLabour: 0.059
  },
  CHN: {
    roadDeathsPer100k: 17.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2013",
      socialProtection: "2021",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 16,
    accountShare: 0.8938,
    socialAssistanceQ1: 0.6504,
    socialProtection: 0.756,
    sicknessBenefit: 0.5,
    emigrantShare: 82e-4,
    emigrantDest: [
      [
        "Hong Kong",
        2490414
      ],
      [
        "United States",
        2488775
      ],
      [
        "Japan",
        809893
      ]
    ],
    alcoholUseDisorder: 0.044
  },
  CIV: {
    roadDeathsPer100k: 20.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2022",
      childLabour: "2022"
    },
    maternalDeathsPer100kBirths: 359,
    accountShare: 0.5757,
    socialAssistanceQ1: 0.0341,
    socialProtection: 0.121,
    childLabour: 0.13
  },
  CMR: {
    roadDeathsPer100k: 10.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2022",
      childLabour: "2014"
    },
    maternalDeathsPer100kBirths: 258,
    accountShare: 0.6087,
    socialAssistanceQ1: 0.1279,
    socialProtection: 0.1,
    childLabour: 0.389
  },
  COD: {
    roadDeathsPer100k: 16.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2012",
      socialProtection: "2022",
      childLabour: "2024",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 427,
    accountShare: 0.3921,
    socialAssistanceQ1: 0.0483,
    socialProtection: 0.052,
    childLabour: 0.119,
    sicknessBenefit: 0,
    emigrantShare: 0.0198,
    emigrantDest: [
      [
        "Uganda",
        637206
      ],
      [
        "Rwanda",
        236385
      ],
      [
        "Burundi",
        224091
      ]
    ],
    alcoholUseDisorder: 0.05
  },
  COG: {
    roadDeathsPer100k: 8.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      childLabour: "2015"
    },
    maternalDeathsPer100kBirths: 241,
    accountShare: 0.5558,
    childLabour: 0.141
  },
  COL: {
    roadDeathsPer100k: 16.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2025",
      childLabour: "2024"
    },
    maternalDeathsPer100kBirths: 59,
    accountShare: 0.5706,
    socialAssistanceQ1: 0.5404,
    socialProtection: 0.583,
    childLabour: 0.029
  },
  DEU: {
    roadDeathsPer100k: 3.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022",
      singleParentPoverty: "2020",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 4,
    accountShare: 0.983,
    socialProtection: 1,
    singleParentPoverty: 0.2906,
    sicknessBenefit: 1,
    emigrantShare: 0.0508,
    emigrantDest: [
      [
        "United States",
        1137577
      ],
      [
        "Switzerland",
        371816
      ],
      [
        "Turkey",
        363563
      ]
    ],
    alcoholUseDisorder: 0.068
  },
  DOM: {
    roadDeathsPer100k: 27.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2022",
      childLabour: "2019"
    },
    maternalDeathsPer100kBirths: 124,
    accountShare: 0.6478,
    socialAssistanceQ1: 0.5696,
    socialProtection: 0.61,
    childLabour: 0.038
  },
  DZA: {
    roadDeathsPer100k: 18.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2021",
      childLabour: "2019"
    },
    maternalDeathsPer100kBirths: 62,
    accountShare: 0.3529,
    socialProtection: 0.602,
    childLabour: 0.025
  },
  ECU: {
    roadDeathsPer100k: 22.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2021"
    },
    maternalDeathsPer100kBirths: 55,
    accountShare: 0.6451,
    socialAssistanceQ1: 0.5645,
    socialProtection: 0.468
  },
  EGY: {
    roadDeathsPer100k: 9.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2019",
      socialProtection: "2022",
      childLabour: "2023",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 17,
    accountShare: 0.4311,
    socialAssistanceQ1: 0.9409,
    socialProtection: 0.366,
    childLabour: 0.114,
    sicknessBenefit: 1,
    emigrantShare: 0.0421,
    emigrantDest: [
      [
        "Saudi Arabia",
        1498313
      ],
      [
        "United Arab Emirates",
        841883
      ],
      [
        "Jordan",
        767948
      ]
    ],
    alcoholUseDisorder: 0.014
  },
  ESP: {
    roadDeathsPer100k: 3.5,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 3,
    accountShare: 0.9838,
    socialProtection: 0.781
  },
  ETH: {
    roadDeathsPer100k: 17.7,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2018",
      socialProtection: "2024",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 195,
    accountShare: 0.4883,
    socialAssistanceQ1: 0.3001,
    socialProtection: 0.115,
    sicknessBenefit: 0.5,
    emigrantShare: 96e-4,
    emigrantDest: [
      [
        "United States",
        363811
      ],
      [
        "Saudi Arabia",
        180746
      ],
      [
        "Sudan",
        121969
      ]
    ],
    alcoholUseDisorder: 0.025
  },
  FRA: {
    roadDeathsPer100k: 4.7,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2021",
      singleParentPoverty: "2021",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 7,
    accountShare: 0.9919,
    socialProtection: 0.994,
    singleParentPoverty: 0.3115,
    sicknessBenefit: 1,
    emigrantShare: 0.0383,
    emigrantDest: [
      [
        "United States",
        253094
      ],
      [
        "Spain",
        217960
      ],
      [
        "Belgium",
        196995
      ]
    ],
    alcoholUseDisorder: 0.07
  },
  GBR: {
    roadDeathsPer100k: 2.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2023",
      singleParentPoverty: "2021",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 8,
    accountShare: 0.9928,
    socialProtection: 0.936,
    singleParentPoverty: 0.2667,
    sicknessBenefit: 0.5,
    emigrantShare: 0.07,
    emigrantDest: [
      [
        "Australia",
        1107102
      ],
      [
        "United States",
        894789
      ],
      [
        "Canada",
        427526
      ]
    ],
    alcoholUseDisorder: 0.087
  },
  GHA: {
    roadDeathsPer100k: 25.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2016",
      socialProtection: "2022",
      childLabour: "2018"
    },
    maternalDeathsPer100kBirths: 234,
    accountShare: 0.8124,
    socialAssistanceQ1: 0.3951,
    socialProtection: 0.252,
    childLabour: 0.201
  },
  GIN: {
    roadDeathsPer100k: 37.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2018",
      socialProtection: "2021",
      childLabour: "2016"
    },
    maternalDeathsPer100kBirths: 494,
    accountShare: 0.3605,
    socialAssistanceQ1: 0.0779,
    socialProtection: 0.037,
    childLabour: 0.242
  },
  GTM: {
    roadDeathsPer100k: 12.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2014",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 94,
    accountShare: 0.3828,
    socialAssistanceQ1: 0.7165,
    socialProtection: 0.121
  },
  HND: {
    roadDeathsPer100k: 18.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2019",
      socialProtection: "2022",
      childLabour: "2023"
    },
    maternalDeathsPer100kBirths: 47,
    accountShare: 0.4244,
    socialAssistanceQ1: 0.5039,
    socialProtection: 0.301,
    childLabour: 0.288
  },
  HTI: {
    roadDeathsPer100k: 31.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialAssistanceQ1: "2012",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 328,
    socialAssistanceQ1: 0.2153,
    socialProtection: 0.066
  },
  IDN: {
    roadDeathsPer100k: 11.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2021",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 140,
    accountShare: 0.5633,
    socialAssistanceQ1: 0.6939,
    socialProtection: 0.543,
    sicknessBenefit: 0.5,
    emigrantShare: 0.0133,
    emigrantDest: [
      [
        "Malaysia",
        1761502
      ],
      [
        "United Arab Emirates",
        298351
      ],
      [
        "Taiwan",
        292830
      ]
    ],
    alcoholUseDisorder: 8e-3
  },
  IND: {
    roadDeathsPer100k: 14.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2011",
      socialProtection: "2025",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 80,
    accountShare: 0.8902,
    socialAssistanceQ1: 0.9276,
    socialProtection: 0.643,
    sicknessBenefit: 1,
    emigrantShare: 0.0129,
    emigrantDest: [
      [
        "United Arab Emirates",
        3248545
      ],
      [
        "United States",
        3165238
      ],
      [
        "Saudi Arabia",
        1953496
      ]
    ],
    alcoholUseDisorder: 0.049
  },
  IRN: {
    roadDeathsPer100k: 20.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2020",
      socialProtection: "2023"
    },
    maternalDeathsPer100kBirths: 16,
    accountShare: 0.9106,
    socialAssistanceQ1: 0.8977,
    socialProtection: 1
  },
  IRQ: {
    roadDeathsPer100k: 21.5,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2012",
      socialProtection: "2022",
      childLabour: "2018"
    },
    maternalDeathsPer100kBirths: 66,
    accountShare: 0.3016,
    socialAssistanceQ1: 0.8612,
    socialProtection: 0.417,
    childLabour: 0.045
  },
  ISR: {
    roadDeathsPer100k: 4.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 2,
    accountShare: 0.8927,
    socialProtection: 1
  },
  ITA: {
    roadDeathsPer100k: 5,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 6,
    accountShare: 0.8602,
    socialProtection: 0.888
  },
  JOR: {
    roadDeathsPer100k: 13.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2010",
      socialProtection: "2022",
      childLabour: "2016"
    },
    maternalDeathsPer100kBirths: 31,
    accountShare: 0.4646,
    socialAssistanceQ1: 0.8331,
    socialProtection: 0.288,
    childLabour: 0.017
  },
  JPN: {
    roadDeathsPer100k: 2.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2020",
      singleParentPoverty: "2021",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 3,
    accountShare: 0.9852,
    socialProtection: 0.946,
    singleParentPoverty: 0.4446,
    sicknessBenefit: 1,
    emigrantShare: 81e-4,
    emigrantDest: [
      [
        "United States",
        547444
      ],
      [
        "Thailand",
        104515
      ],
      [
        "Australia",
        53094
      ]
    ],
    alcoholUseDisorder: 0.034
  },
  KAZ: {
    roadDeathsPer100k: 11.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2023",
      childLabour: "2024"
    },
    maternalDeathsPer100kBirths: 10,
    accountShare: 0.8705,
    socialAssistanceQ1: 0.4108,
    socialProtection: 0.943,
    childLabour: 0.075
  },
  KEN: {
    roadDeathsPer100k: 28.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2015",
      socialProtection: "2021",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 149,
    accountShare: 0.9012,
    socialAssistanceQ1: 0.3451,
    socialProtection: 0.09,
    sicknessBenefit: 0.5,
    emigrantShare: 98e-4,
    emigrantDest: [
      [
        "United States",
        210991
      ],
      [
        "United Kingdom",
        137817
      ],
      [
        "Australia",
        30123
      ]
    ],
    alcoholUseDisorder: 0.04
  },
  KHM: {
    roadDeathsPer100k: 18.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022",
      childLabour: "2012"
    },
    maternalDeathsPer100kBirths: 137,
    accountShare: 0.3903,
    socialProtection: 0.208,
    childLabour: 0.126
  },
  KOR: {
    roadDeathsPer100k: 6.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022",
      singleParentPoverty: "2022",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 4,
    accountShare: 0.9689,
    socialProtection: 0.802,
    singleParentPoverty: 0.2956,
    sicknessBenefit: 0,
    emigrantShare: 0.0392,
    emigrantDest: [
      [
        "United States",
        1083174
      ],
      [
        "Japan",
        393944
      ],
      [
        "Canada",
        151409
      ]
    ],
    alcoholUseDisorder: 0.139
  },
  LKA: {
    roadDeathsPer100k: 11.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2019",
      socialProtection: "2021",
      childLabour: "2016"
    },
    maternalDeathsPer100kBirths: 18,
    accountShare: 0.8169,
    socialAssistanceQ1: 0.4882,
    socialProtection: 0.413,
    childLabour: 8e-3
  },
  MAR: {
    roadDeathsPer100k: 18.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2009",
      socialProtection: "2019"
    },
    maternalDeathsPer100kBirths: 70,
    accountShare: 0.4439,
    socialAssistanceQ1: 0.5011,
    socialProtection: 0.205
  },
  MDG: {
    roadDeathsPer100k: 22.5,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022",
      childLabour: "2018"
    },
    maternalDeathsPer100kBirths: 445,
    accountShare: 0.2445,
    socialProtection: 0.154,
    childLabour: 0.367
  },
  MEX: {
    roadDeathsPer100k: 12,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2022",
      childLabour: "2022",
      singleParentPoverty: "2022",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 42,
    accountShare: 0.5303,
    socialAssistanceQ1: 0.5158,
    socialProtection: 0.808,
    childLabour: 0.06,
    singleParentPoverty: 0.339,
    sicknessBenefit: 1,
    emigrantShare: 0.0894,
    emigrantDest: [
      [
        "United States",
        11279561
      ],
      [
        "Canada",
        103620
      ],
      [
        "Spain",
        77724
      ]
    ],
    alcoholUseDisorder: 0.023
  },
  MLI: {
    roadDeathsPer100k: 20.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2022",
      childLabour: "2020"
    },
    maternalDeathsPer100kBirths: 367,
    accountShare: 0.5475,
    socialAssistanceQ1: 0.4095,
    socialProtection: 0.126,
    childLabour: 0.227
  },
  MMR: {
    roadDeathsPer100k: 19.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2021",
      socialAssistanceQ1: "2017",
      socialProtection: "2019",
      childLabour: "2015"
    },
    maternalDeathsPer100kBirths: 185,
    accountShare: 0.4779,
    socialAssistanceQ1: 0.1038,
    socialProtection: 0.063,
    childLabour: 0.099
  },
  MOZ: {
    roadDeathsPer100k: 19.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2019",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 99,
    accountShare: 0.5439,
    socialAssistanceQ1: 0.0394,
    socialProtection: 0.06
  },
  MWI: {
    roadDeathsPer100k: 20.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2019",
      socialProtection: "2022",
      childLabour: "2020"
    },
    maternalDeathsPer100kBirths: 225,
    accountShare: 0.5037,
    socialAssistanceQ1: 0.4243,
    socialProtection: 0.199,
    childLabour: 0.14
  },
  MYS: {
    roadDeathsPer100k: 13.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2016",
      socialProtection: "2023"
    },
    maternalDeathsPer100kBirths: 26,
    accountShare: 0.8869,
    socialAssistanceQ1: 0.9763,
    socialProtection: 0.292
  },
  NER: {
    roadDeathsPer100k: 24.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2015",
      childLabour: "2022"
    },
    maternalDeathsPer100kBirths: 350,
    accountShare: 0.1483,
    socialAssistanceQ1: 0.2364,
    socialProtection: 0.206,
    childLabour: 0.427
  },
  NGA: {
    roadDeathsPer100k: 17.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2018",
      socialProtection: "2022",
      childLabour: "2021",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 993,
    accountShare: 0.6326,
    socialAssistanceQ1: 0.277,
    socialProtection: 0.148,
    childLabour: 0.315,
    sicknessBenefit: 0.5,
    emigrantShare: 92e-4,
    emigrantDest: [
      [
        "United States",
        565053
      ],
      [
        "United Kingdom",
        324007
      ],
      [
        "Niger",
        199722
      ]
    ],
    alcoholUseDisorder: 6e-3
  },
  NPL: {
    roadDeathsPer100k: 28.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2010",
      socialProtection: "2022",
      childLabour: "2017"
    },
    maternalDeathsPer100kBirths: 142,
    accountShare: 0.5999,
    socialAssistanceQ1: 0.4895,
    socialProtection: 0.21,
    childLabour: 0.1
  },
  PAK: {
    roadDeathsPer100k: 11.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2018",
      socialProtection: "2022",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 155,
    accountShare: 0.273,
    socialAssistanceQ1: 0.2065,
    socialProtection: 0.202,
    sicknessBenefit: 0.5,
    emigrantShare: 0.0279,
    emigrantDest: [
      [
        "Saudi Arabia",
        1937044
      ],
      [
        "United Arab Emirates",
        932356
      ],
      [
        "India",
        768138
      ]
    ],
    alcoholUseDisorder: 4e-3
  },
  PER: {
    roadDeathsPer100k: 12.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2024",
      childLabour: "2015"
    },
    maternalDeathsPer100kBirths: 51,
    accountShare: 0.5931,
    socialAssistanceQ1: 0.9531,
    socialProtection: 0.301,
    childLabour: 0.145
  },
  PHL: {
    roadDeathsPer100k: 9.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2018",
      socialProtection: "2022",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 84,
    accountShare: 0.5018,
    socialAssistanceQ1: 0.5724,
    socialProtection: 0.349,
    sicknessBenefit: 1,
    emigrantShare: 0.0608,
    emigrantDest: [
      [
        "United States",
        2263697
      ],
      [
        "Canada",
        835779
      ],
      [
        "Saudi Arabia",
        755432
      ]
    ],
    alcoholUseDisorder: 0.053
  },
  PNG: {
    roadDeathsPer100k: 15.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialAssistanceQ1: "2009",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 189,
    socialAssistanceQ1: 0.0192,
    socialProtection: 0.091
  },
  POL: {
    roadDeathsPer100k: 6.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2019",
      socialProtection: "2023"
    },
    maternalDeathsPer100kBirths: 2,
    accountShare: 0.8614,
    socialAssistanceQ1: 0.7179,
    socialProtection: 0.842
  },
  PRK: {
    roadDeathsPer100k: 42.7,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      childLabour: "2017"
    },
    maternalDeathsPer100kBirths: 67,
    childLabour: 0.043
  },
  RUS: {
    roadDeathsPer100k: 10.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2017",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 9,
    accountShare: 0.7934,
    socialAssistanceQ1: 0.7756,
    socialProtection: 0.954
  },
  RWA: {
    roadDeathsPer100k: 11.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialAssistanceQ1: "2013",
      socialProtection: "2023",
      childLabour: "2024"
    },
    maternalDeathsPer100kBirths: 229,
    socialAssistanceQ1: 0.2005,
    socialProtection: 0.077,
    childLabour: 0.068
  },
  SAU: {
    roadDeathsPer100k: 18.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2022"
    },
    maternalDeathsPer100kBirths: 7,
    accountShare: 0.7884,
    socialProtection: 0.64
  },
  SDN: {
    roadDeathsPer100k: 19.6,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialAssistanceQ1: "2009",
      socialProtection: "2021",
      childLabour: "2022"
    },
    maternalDeathsPer100kBirths: 256,
    socialAssistanceQ1: 0.131,
    socialProtection: 0.104,
    childLabour: 0.182
  },
  SEN: {
    roadDeathsPer100k: 20.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2022",
      childLabour: "2016"
    },
    maternalDeathsPer100kBirths: 237,
    accountShare: 0.7646,
    socialAssistanceQ1: 0.3911,
    socialProtection: 0.199,
    childLabour: 0.228
  },
  SLE: {
    roadDeathsPer100k: 13.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2018",
      socialProtection: "2019",
      childLabour: "2017"
    },
    maternalDeathsPer100kBirths: 354,
    accountShare: 0.3862,
    socialAssistanceQ1: 0.2134,
    socialProtection: 0.044,
    childLabour: 0.252
  },
  SOM: {
    roadDeathsPer100k: 20.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialAssistanceQ1: "2017",
      socialProtection: "2023"
    },
    maternalDeathsPer100kBirths: 563,
    socialAssistanceQ1: 0.0573,
    socialProtection: 0
  },
  SSD: {
    roadDeathsPer100k: 23.5,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2021",
      socialAssistanceQ1: "2009",
      socialProtection: "2023"
    },
    maternalDeathsPer100kBirths: 692,
    accountShare: 0.0583,
    socialAssistanceQ1: 0.0337,
    socialProtection: 0
  },
  SYR: {
    roadDeathsPer100k: 29.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023"
    },
    maternalDeathsPer100kBirths: 20
  },
  TCD: {
    roadDeathsPer100k: 26.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2022",
      socialProtection: "2022",
      childLabour: "2019"
    },
    maternalDeathsPer100kBirths: 748,
    accountShare: 0.209,
    socialAssistanceQ1: 0.0667,
    socialProtection: 0.025,
    childLabour: 0.39
  },
  TGO: {
    roadDeathsPer100k: 22.7,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2022",
      childLabour: "2022"
    },
    maternalDeathsPer100kBirths: 349,
    accountShare: 0.5743,
    socialAssistanceQ1: 0.1724,
    socialProtection: 0.387,
    childLabour: 0.269
  },
  THA: {
    roadDeathsPer100k: 25.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2020"
    },
    maternalDeathsPer100kBirths: 34,
    accountShare: 0.9182,
    socialAssistanceQ1: 0.9708,
    socialProtection: 0.701
  },
  TJK: {
    roadDeathsPer100k: 13.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2011",
      socialProtection: "2023"
    },
    maternalDeathsPer100kBirths: 14,
    accountShare: 0.5452,
    socialAssistanceQ1: 0.1304,
    socialProtection: 0.341
  },
  TUR: {
    roadDeathsPer100k: 6.4,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2019",
      socialProtection: "2022",
      childLabour: "2022"
    },
    maternalDeathsPer100kBirths: 15,
    accountShare: 0.8155,
    socialAssistanceQ1: 0.3961,
    socialProtection: 0.64,
    childLabour: 0.059
  },
  TZA: {
    roadDeathsPer100k: 15.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2014",
      socialProtection: "2021",
      childLabour: "2014"
    },
    maternalDeathsPer100kBirths: 276,
    accountShare: 0.5983,
    socialAssistanceQ1: 0.0867,
    socialProtection: 0.114,
    childLabour: 0.248
  },
  UGA: {
    roadDeathsPer100k: 16,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2016",
      socialProtection: "2022",
      childLabour: "2021"
    },
    maternalDeathsPer100kBirths: 170,
    accountShare: 0.7283,
    socialAssistanceQ1: 46e-4,
    socialProtection: 0.031,
    childLabour: 0.408
  },
  UKR: {
    roadDeathsPer100k: 10.5,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2020",
      socialProtection: "2019",
      childLabour: "2015"
    },
    maternalDeathsPer100kBirths: 15,
    accountShare: 0.8758,
    socialAssistanceQ1: 0.3342,
    socialProtection: 0.73,
    childLabour: 0.04
  },
  USA: {
    roadDeathsPer100k: 14.2,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialProtection: "2023",
      singleParentPoverty: "2022",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 17,
    accountShare: 0.9702,
    socialProtection: 0.788,
    singleParentPoverty: 0.4963,
    sicknessBenefit: 0,
    emigrantShare: 93e-4,
    emigrantDest: [
      [
        "Mexico",
        823502
      ],
      [
        "Canada",
        256571
      ],
      [
        "United Kingdom",
        243570
      ]
    ],
    alcoholUseDisorder: 0.139
  },
  UZB: {
    roadDeathsPer100k: 9.3,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2018",
      socialProtection: "2022",
      childLabour: "2022"
    },
    maternalDeathsPer100kBirths: 26,
    accountShare: 0.5966,
    socialAssistanceQ1: 0.1026,
    socialProtection: 0.56,
    childLabour: 0.206
  },
  VEN: {
    roadDeathsPer100k: 13.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2006",
      socialProtection: "2019"
    },
    maternalDeathsPer100kBirths: 227,
    accountShare: 0.8732,
    socialAssistanceQ1: 0.05,
    socialProtection: 0.308
  },
  VNM: {
    roadDeathsPer100k: 17.7,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2020",
      socialProtection: "2022",
      childLabour: "2021",
      sicknessBenefit: "2023",
      emigrantShare: "2024",
      alcoholUseDisorder: "2016"
    },
    maternalDeathsPer100kBirths: 48,
    accountShare: 0.7055,
    socialAssistanceQ1: 0.8855,
    socialProtection: 0.383,
    childLabour: 0.069,
    sicknessBenefit: 1,
    emigrantShare: 0.0368,
    emigrantDest: [
      [
        "United States",
        1434631
      ],
      [
        "Japan",
        589874
      ],
      [
        "Australia",
        294435
      ]
    ],
    alcoholUseDisorder: 0.054
  },
  YEM: {
    roadDeathsPer100k: 29.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      socialAssistanceQ1: "2014",
      socialProtection: "2022",
      childLabour: "2023"
    },
    maternalDeathsPer100kBirths: 118,
    socialAssistanceQ1: 0.4421,
    socialProtection: 0.07,
    childLabour: 0.159
  },
  ZAF: {
    roadDeathsPer100k: 24.9,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2021",
      socialProtection: "2019",
      childLabour: "2019"
    },
    maternalDeathsPer100kBirths: 118,
    accountShare: 0.8113,
    socialAssistanceQ1: 0.9458,
    socialProtection: 0.493,
    childLabour: 0.075
  },
  ZMB: {
    roadDeathsPer100k: 17.1,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2015",
      socialProtection: "2021",
      childLabour: "2023"
    },
    maternalDeathsPer100kBirths: 85,
    accountShare: 0.727,
    socialAssistanceQ1: 62e-4,
    socialProtection: 0.303,
    childLabour: 0.187
  },
  ZWE: {
    roadDeathsPer100k: 29.8,
    years: {
      roadDeathsPer100k: "2021",
      maternalDeathsPer100kBirths: "2023",
      accountShare: "2024",
      socialAssistanceQ1: "2019",
      socialProtection: "2021",
      childLabour: "2019"
    },
    maternalDeathsPer100kBirths: 358,
    accountShare: 0.4952,
    socialAssistanceQ1: 0.5896,
    socialProtection: 0.164,
    childLabour: 0.279
  }
};

// src/engine/lifestats.ts
var STATS = life_stats_default;
var of = (iso3) => STATS[iso3] ?? {};
function roadInjuryRate(iso3) {
  return Math.min(0.01, (of(iso3).roadDeathsPer100k ?? 15) * 10 / 1e5);
}
var maternalDeaths = (iso3) => of(iso3).maternalDeathsPer100kBirths ?? null;
var singleParentPoverty = (iso3) => of(iso3).singleParentPoverty ?? null;
function sickPayCovered(iso3, job, informalShare) {
  const s = of(iso3).sicknessBenefit ?? (informalShare < 0.3 ? 1 : informalShare < 0.7 ? 0.5 : 0);
  if (s >= 1) return job === "big" || job === "sme" || job === "civil";
  if (s > 0) return job === "big" || job === "civil";
  return false;
}
function publicAidRate(iso3) {
  const s = of(iso3);
  return s.socialAssistanceQ1 ?? s.socialProtection ?? 0.3;
}
var childLabourShare = (iso3) => STATS[iso3]?.childLabour ?? null;
var alcoholDisorderShare = (iso3) => STATS[iso3]?.alcoholUseDisorder ?? null;
function emigration(iso3) {
  const s = STATS[iso3];
  if (!s?.emigrantShare || !s.emigrantDest?.length) return null;
  return { share: s.emigrantShare, dest: s.emigrantDest.filter(([n]) => DEST_JA[n]).map(([n, c]) => [DEST_JA[n], c]) };
}
var accountShare = (iso3) => STATS[iso3]?.accountShare ?? null;
var DEST_JA = {
  Australia: "\u30AA\u30FC\u30B9\u30C8\u30E9\u30EA\u30A2",
  Belgium: "\u30D9\u30EB\u30AE\u30FC",
  Burundi: "\u30D6\u30EB\u30F3\u30B8",
  Canada: "\u30AB\u30CA\u30C0",
  "Hong Kong": "\u9999\u6E2F",
  India: "\u30A4\u30F3\u30C9",
  Japan: "\u65E5\u672C",
  Jordan: "\u30E8\u30EB\u30C0\u30F3",
  Malaysia: "\u30DE\u30EC\u30FC\u30B7\u30A2",
  Mexico: "\u30E1\u30AD\u30B7\u30B3",
  Niger: "\u30CB\u30B8\u30A7\u30FC\u30EB",
  Rwanda: "\u30EB\u30EF\u30F3\u30C0",
  "Saudi Arabia": "\u30B5\u30A6\u30B8\u30A2\u30E9\u30D3\u30A2",
  Spain: "\u30B9\u30DA\u30A4\u30F3",
  Sudan: "\u30B9\u30FC\u30C0\u30F3",
  Switzerland: "\u30B9\u30A4\u30B9",
  Taiwan: "\u53F0\u6E7E",
  Thailand: "\u30BF\u30A4",
  Turkey: "\u30C8\u30EB\u30B3",
  Uganda: "\u30A6\u30AC\u30F3\u30C0",
  "United Arab Emirates": "\u30A2\u30E9\u30D6\u9996\u9577\u56FD\u9023\u90A6",
  "United Kingdom": "\u30A4\u30AE\u30EA\u30B9",
  "United States": "\u30A2\u30E1\u30EA\u30AB"
};

// data/income.json
var income_default = {
  source: "\u539A\u751F\u52B4\u50CD\u7701\u300C\u4EE4\u548C6\u5E74\u8CC3\u91D1\u69CB\u9020\u57FA\u672C\u7D71\u8A08\u8ABF\u67FB\u300D(\u96C7\u7528\u5F62\u614B\u30FB\u5B66\u6B74\u30FB\u5E74\u9F62\u968E\u7D1A\u5225 \u304D\u307E\u3063\u3066\u652F\u7D66\u3059\u308B\u73FE\u91D1\u7D66\u4E0E\u984D\xD712\uFF0B\u5E74\u9593\u8CDE\u4E0E\u305D\u306E\u4ED6\u7279\u5225\u7D66\u4E0E\u984D) \u3092\u3082\u3068\u306B\u518D\u69CB\u6210",
  year: 2024,
  estimated: true,
  ageBands: [
    20,
    25,
    30,
    35,
    40,
    45,
    50,
    55,
    60,
    65,
    70
  ],
  regular: {
    male: {
      junior_high: [
        289e4,
        329e4,
        36e5,
        39e5,
        412e4,
        427e4,
        44e5,
        439e4,
        359e4,
        314e4,
        297e4
      ],
      high_school: [
        315e4,
        371e4,
        422e4,
        462e4,
        502e4,
        536e4,
        565e4,
        577e4,
        43e5,
        347e4,
        319e4
      ],
      vocational: [
        312e4,
        389e4,
        451e4,
        508e4,
        565e4,
        616e4,
        656e4,
        673e4,
        493e4,
        393e4,
        354e4
      ],
      university: [
        3634e3,
        4605e3,
        547e4,
        632e4,
        711e4,
        785e4,
        864e4,
        904e4,
        664e4,
        526e4,
        482e4
      ],
      graduate: [
        378e4,
        525e4,
        654e4,
        79e5,
        926e4,
        1038e4,
        114e5,
        1174e4,
        92e5,
        802e4,
        714e4
      ]
    },
    female: {
      junior_high: [
        254e4,
        271e4,
        286e4,
        294e4,
        302e4,
        31e5,
        311e4,
        3076e3,
        274e4,
        253e4,
        244e4
      ],
      high_school: [
        284e4,
        32e5,
        337e4,
        354e4,
        371e4,
        382e4,
        39e5,
        388e4,
        321e4,
        283e4,
        264e4
      ],
      vocational: [
        298e4,
        362e4,
        394e4,
        426e4,
        451e4,
        476e4,
        492e4,
        491e4,
        413e4,
        347e4,
        325e4
      ],
      university: [
        353e4,
        43e5,
        479e4,
        525e4,
        571e4,
        605e4,
        634e4,
        64e5,
        511e4,
        446e4,
        419e4
      ],
      graduate: [
        372e4,
        491e4,
        581e4,
        661e4,
        741e4,
        814e4,
        872e4,
        884e4,
        75e5,
        642e4,
        598e4
      ]
    }
  },
  nonRegular: {
    male: [
      256e4,
      294e4,
      316e4,
      329e4,
      336e4,
      336e4,
      343e4,
      344e4,
      365e4,
      312e4,
      282e4
    ],
    female: [
      243e4,
      267e4,
      275e4,
      274e4,
      274e4,
      2716e3,
      2704e3,
      268e4,
      264e4,
      245e4,
      236e4
    ]
  },
  selfEmployedMedianAnnual: 3e6,
  selfEmployedNote: "\u63A8\u5B9A\u5024\u3002\u500B\u4EBA\u4E8B\u696D\u4E3B\u306E\u4E8B\u696D\u6240\u5F97(\u58F2\u4E0A\u2212\u7D4C\u8CBB)\u306E\u4E2D\u592E\u5024\u306F\u6982\u306D200\u301C400\u4E07\u5186\u7A0B\u5EA6\u3068\u3055\u308C\u308B(\u56FD\u7A0E\u5E81 \u7533\u544A\u6240\u5F97\u7A0E\u6A19\u672C\u8ABF\u67FB\u7B49\u304B\u3089\u6982\u7B97)\u3002\u696D\u7A2E\u5DEE\u304C\u6975\u3081\u3066\u5927\u304D\u3044\u3002",
  notes: {
    method: "\u4E00\u6B21\u8868(e-Stat)\u3092\u76F4\u63A5\u53D6\u5F97\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u3001\u691C\u7D22\u3067\u78BA\u8A8D\u3067\u304D\u305F\u30A2\u30F3\u30AB\u30FC\u5024(\u7537\u6027\u5927\u5352 \u6240\u5B9A\u5185417.7\u5343\u5186\u30FB55\u301C59\u6B73\u30D4\u30FC\u30AF549.6\u5343\u5186\u3001\u5927\u535220\u301C24\u6B73 250.8\u5343\u5186\u3001\u7537\u6027\u5927\u535220\u301C24/25\u301C29\u6B73\u306E\u5E74\u9593\u8CDE\u4E0E 368.9/884.8\u5343\u5186\u3001\u9AD8\u5352\u7537\u6027\u5B66\u6B74\u8A08\u5E74\u53CE \u7D04512\u4E07\u5186\u30FB\u5927\u5352\u7537\u6027 \u7D04684\u4E07\u5186 \u7B49)\u306B\u5408\u308F\u305B\u3066\u3001\u8CC3\u91D1\u30BB\u30F3\u30B5\u30B9\u306E\u5178\u578B\u7684\u306A\u5E74\u9F62\u30AB\u30FC\u30D6\u3067\u5404\u30BB\u30EB\u3092\u88DC\u5B8C\u3057\u305F\u63A8\u5B9A\u5024\u3002\u30BB\u30EB\u5358\u4F4D\u306E\u5024\u306F\xB110%\u7A0B\u5EA6\u306E\u8AA4\u5DEE\u3092\u60F3\u5B9A\u3002",
    junior_high_high_school_20: "20\u301C24\u6B73\u306E\u5024\u3092\u4F7F\u7528(19\u6B73\u4EE5\u4E0B\u306F\u4F7F\u7528\u305B\u305A)",
    vocational: "\u5C02\u9580\u5B66\u6821\u5352\u30FB\u9AD8\u5C02\u77ED\u5927\u5352\u306E\u4E2D\u9593\u5024",
    graduate: "\u5927\u5B66\u9662\u5352",
    rounding: "\u5343\u5186\u5358\u4F4D"
  }
};

// data/living.json
var living_default = {
  source: "\u7DCF\u52D9\u7701\u300C\u5BB6\u8A08\u8ABF\u67FB(\u5BB6\u8A08\u53CE\u652F\u7DE8)2024\u5E74\u300D\u307B\u304B",
  year: 2024,
  singleMonthly: {
    food: 43941,
    housing: 23372,
    utilities: 12816,
    furniture: 5822,
    clothing: 4881,
    medical: 8394,
    transport_comm: 20418,
    education: 0,
    culture: 19519,
    other: 30375
  },
  familyMonthlyByHeadAge: {
    under30: 25e4,
    "30s": 305e3,
    "40s": 348607,
    "50s": 367643,
    "60s": 327405,
    "70plus": 264332
  },
  retiredCoupleMonthly: {
    expense: 256521,
    income: 252818
  },
  educationCostPerChild: {
    public_total_k_to_hs: 596e4,
    private_total_k_to_hs: 1976e4,
    university_national_4y: 2425200,
    university_private_4y: 4738710
  },
  weddingCost: 3439e3,
  childbirthNetCost: 1e5,
  funeralCost: 1185e3,
  housePriceNewBuilt: {
    tokyo: 5e7,
    national: 4e7
  },
  rentMonthly: {
    tokyo: 87e3,
    osaka: 6e4,
    regional_city: 55e3,
    rural: 45e3
  },
  estimatedKeys: [
    "familyMonthlyByHeadAge.under30",
    "familyMonthlyByHeadAge.30s",
    "educationCostPerChild.public_total_k_to_hs",
    "educationCostPerChild.private_total_k_to_hs",
    "educationCostPerChild.university_private_4y",
    "childbirthNetCost",
    "funeralCost",
    "housePriceNewBuilt",
    "rentMonthly"
  ],
  notes: {
    singleMonthly: "\u5BB6\u8A08\u8ABF\u67FB2024\u5E74 \u5358\u8EAB\u4E16\u5E2F \u6D88\u8CBB\u652F\u51FA169,547\u5186\u306E\u5185\u8A33(\u6559\u80B2\u306F9\u5186\u306E\u305F\u30810\u3068\u3057\u305F)",
    familyMonthlyByHeadAge: "40s\u4EE5\u4E0A\u306F\u5BB6\u8A08\u8ABF\u67FB2025\u5E74(\u4E8C\u4EBA\u4EE5\u4E0A\u306E\u4E16\u5E2F)\u306E\u4E16\u5E2F\u4E3B\u5E74\u9F62\u968E\u7D1A\u5225\u516C\u8868\u5024\u30022025\u5E74\u6982\u6CC1\u3067\u306F40\u6B73\u672A\u6E80\u304C\u4E00\u62EC(299,100\u5186)\u306E\u305F\u3081 under30/30s \u306F\u6309\u5206\u63A8\u5B9A",
    retiredCoupleMonthly: "\u5BB6\u8A08\u8ABF\u67FB2024\u5E74 65\u6B73\u4EE5\u4E0A\u306E\u592B\u5A66\u306E\u307F\u306E\u7121\u8077\u4E16\u5E2F(\u5B9F\u53CE\u5165252,818\u5186\u30FB\u6D88\u8CBB\u652F\u51FA256,521\u5186)\u3002\u975E\u6D88\u8CBB\u652F\u51FA30,356\u5186\u306F\u5225",
    educationCostPerChild: "\u6587\u79D1\u7701 \u4EE4\u548C5\u5E74\u5EA6\u5B50\u4F9B\u306E\u5B66\u7FD2\u8CBB\u8ABF\u67FB(\u5E7C\u7A1A\u57123\u6B73\u301C\u9AD8\u68213\u5E74 15\u5E74\u9593 \u3059\u3079\u3066\u516C\u7ACB \u7D04596\u4E07\u5186/\u3059\u3079\u3066\u79C1\u7ACB \u7D041,976\u4E07\u5186)\u3002\u56FD\u7ACB\u5927\u5B66\u306F\u6A19\u6E96\u984D \u5165\u5B66\u91D1282,000\u5186+\u6388\u696D\u6599535,800\u5186\xD74\u3002\u79C1\u7ACB\u5927\u5B66\u306F\u4EE4\u548C5\u5E74\u5EA6 \u79C1\u7ACB\u5927\u5B66\u5165\u5B66\u8005\u306B\u4FC2\u308B\u521D\u5E74\u5EA6\u5B66\u751F\u7D0D\u4ED8\u91D1\u8ABF\u67FB\u306E\u5E73\u5747(\u5165\u5B66\u91D1240,806\u5186+(\u6388\u696D\u6599959,205\u5186+\u65BD\u8A2D\u8A2D\u5099\u8CBB165,271\u5186)\xD74)",
    weddingCost: "\u30BC\u30AF\u30B7\u30A3\u7D50\u5A5A\u30C8\u30EC\u30F3\u30C9\u8ABF\u67FB2024 \u6319\u5F0F\u30FB\u62AB\u9732\u5BB4\u7DCF\u984D\u5E73\u5747343.9\u4E07\u5186(\u3054\u795D\u5100\u5DEE\u3057\u5F15\u304D\u524D)",
    childbirthNetCost: "\u6B63\u5E38\u5206\u5A29\u8CBB\u7528\u306E\u5168\u56FD\u5E73\u5747\u7D0450\u301C52\u4E07\u5186\u304B\u3089\u51FA\u7523\u80B2\u5150\u4E00\u6642\u91D150\u4E07\u5186\u3092\u5DEE\u3057\u5F15\u304D\u3001\u598A\u5A66\u5065\u8A3A\u81EA\u5DF1\u8CA0\u62C5\u30FB\u6E96\u5099\u54C1\u3092\u52A0\u3048\u305F\u63A8\u5B9A",
    funeralCost: "\u938C\u5009\u65B0\u66F8 \u304A\u846C\u5F0F\u306B\u95A2\u3059\u308B\u5168\u56FD\u8ABF\u67FB(2024) \u7DCF\u984D\u5E73\u5747 \u7D04118.5\u4E07\u5186(\u63A8\u5B9A\u30FB\u672A\u691C\u8A3C)",
    housePriceNewBuilt: "\u4F4F\u5B85\u91D1\u878D\u652F\u63F4\u6A5F\u69CB \u30D5\u30E9\u30C3\u30C835\u5229\u7528\u8005\u8ABF\u67FB(2023\u5E74\u5EA6)\u306E\u5EFA\u58F2\u4F4F\u5B85\u30FB\u30DE\u30F3\u30B7\u30E7\u30F3\u306E\u6240\u8981\u8CC7\u91D1\u3092\u5E73\u5747\u3057\u305F\u6982\u7B97",
    rentMonthly: "\u4F4F\u5B85\u30FB\u571F\u5730\u7D71\u8A08\u8ABF\u67FB(\u6C11\u55B6\u501F\u5BB6)\u304A\u3088\u3073\u5E02\u5834\u5BB6\u8CC3\u304B\u3089\u306E\u63A8\u5B9A"
  }
};

// data/lifetable.json
var lifetable_default = {
  source: "\u539A\u751F\u52B4\u50CD\u7701\u300C\u4EE4\u548C6\u5E74\u7C21\u6613\u751F\u547D\u8868\u300D(\u5E73\u5747\u5BFF\u547D) / \u5E74\u9F62\u5225qx\u306F\u4E3B\u8981\u5E74\u9F62\u306E\u6B7B\u4EA1\u7387\u304B\u3089\u518D\u69CB\u6210 / \u6B7B\u56E0\u306F\u4EBA\u53E3\u52D5\u614B\u7D71\u8A08",
  year: 2024,
  lifeExpectancy0: {
    male: 81.09,
    female: 87.13
  },
  qx: {
    male: [
      1925e-6,
      2718e-7,
      2106e-7,
      1631e-7,
      1263e-7,
      9786e-8,
      9559e-8,
      9336e-8,
      9119e-8,
      8906e-8,
      8699e-8,
      1045e-7,
      1255e-7,
      1507e-7,
      1811e-7,
      2175e-7,
      2558e-7,
      3008e-7,
      3538e-7,
      4161e-7,
      4893e-7,
      4997e-7,
      5104e-7,
      5213e-7,
      5324e-7,
      5437e-7,
      5581e-7,
      5729e-7,
      5882e-7,
      6038e-7,
      6198e-7,
      6458e-7,
      6729e-7,
      7011e-7,
      7305e-7,
      7612e-7,
      8142e-7,
      8708e-7,
      9314e-7,
      9963e-7,
      1066e-6,
      1165e-6,
      1273e-6,
      1392e-6,
      1522e-6,
      1664e-6,
      1825e-6,
      2002e-6,
      2196e-6,
      2409e-6,
      2642e-6,
      2891e-6,
      3163e-6,
      3461e-6,
      3787e-6,
      4143e-6,
      455e-5,
      4998e-6,
      5489e-6,
      6029e-6,
      6622e-6,
      7255e-6,
      7948e-6,
      8707e-6,
      9539e-6,
      0.01045,
      0.01148,
      0.01262,
      0.01387,
      0.01525,
      0.01676,
      0.01843,
      0.02028,
      0.0223,
      0.02453,
      0.02699,
      0.02999,
      0.03332,
      0.03701,
      0.04113,
      0.04569,
      0.05122,
      0.05742,
      0.06437,
      0.07217,
      0.0809,
      0.09114,
      0.1027,
      0.1157,
      0.1303,
      0.1468,
      0.1633,
      0.1816,
      0.2019,
      0.2246,
      0.2498,
      0.2735,
      0.2994,
      0.3278,
      0.3589,
      0.393,
      0.4226,
      0.4545,
      0.4889,
      0.5258,
      1
    ],
    female: [
      182e-5,
      2553e-7,
      1896e-7,
      1408e-7,
      1046e-7,
      777e-7,
      7534e-8,
      7306e-8,
      7084e-8,
      6869e-8,
      666e-7,
      789e-7,
      9347e-8,
      1107e-7,
      1312e-7,
      1554e-7,
      1731e-7,
      1928e-7,
      2147e-7,
      2392e-7,
      2664e-7,
      2707e-7,
      2751e-7,
      2795e-7,
      284e-6,
      2886e-7,
      2989e-7,
      3096e-7,
      3207e-7,
      3322e-7,
      3441e-7,
      3621e-7,
      381e-6,
      401e-6,
      4219e-7,
      444e-6,
      4783e-7,
      5152e-7,
      5549e-7,
      5977e-7,
      6438e-7,
      6982e-7,
      7572e-7,
      8211e-7,
      8905e-7,
      9657e-7,
      105e-5,
      1141e-6,
      124e-5,
      1348e-6,
      1465e-6,
      1574e-6,
      1691e-6,
      1817e-6,
      1953e-6,
      2098e-6,
      2263e-6,
      2441e-6,
      2633e-6,
      284e-5,
      3064e-6,
      3308e-6,
      3572e-6,
      3856e-6,
      4164e-6,
      4496e-6,
      4902e-6,
      5344e-6,
      5827e-6,
      6353e-6,
      6927e-6,
      7747e-6,
      8664e-6,
      969e-5,
      0.01084,
      0.01212,
      0.01373,
      0.01555,
      0.01762,
      0.01995,
      0.0226,
      0.02589,
      0.02967,
      0.03399,
      0.03895,
      0.04462,
      0.0516,
      0.05966,
      0.06899,
      0.07977,
      0.09224,
      0.1059,
      0.1217,
      0.1397,
      0.1604,
      0.1843,
      0.2066,
      0.2318,
      0.2599,
      0.2915,
      0.3269,
      0.3558,
      0.3873,
      0.4216,
      0.4589,
      1
    ]
  },
  causeShare: {
    under40: {
      accident: 0.14,
      cancer: 0.2,
      heart: 0.08,
      other: 0.58
    },
    "40to64": {
      cancer: 0.4,
      heart: 0.15,
      stroke: 0.08,
      accident: 0.04,
      other: 0.33
    },
    "65plus": {
      cancer: 0.23,
      heart: 0.15,
      senility: 0.14,
      stroke: 0.07,
      pneumonia: 0.055,
      other: 0.355
    }
  },
  estimatedKeys: [
    "qx",
    "causeShare"
  ],
  notes: {
    qx: "\u4E00\u6B21\u8868\u3092\u53D6\u5F97\u3067\u304D\u306A\u304B\u3063\u305F\u305F\u3081\u3001\u8FD1\u5E74\u306E\u7C21\u6613\u751F\u547D\u8868\u306E\u4E3B\u8981\u5E74\u9F62(0,1,5,10,\u2026,100\u6B73)\u306E\u6B7B\u4EA1\u7387\u3092\u5E7E\u4F55\u88DC\u9593\u3057\u3001\u5E73\u5747\u5BFF\u547D(\u753781.09\u30FB\u597387.13)\u306B\u4E00\u81F4\u3059\u308B\u3088\u3046\u4E00\u5F8B\u500D\u7387\u3067\u6821\u6B63\u3057\u305F\u63A8\u5B9A\u5024\u3002105\u6B73=1.0",
    causeShare: "\u4EBA\u53E3\u52D5\u614B\u7D71\u8A08(2024: \u5168\u6B7B\u4EA1\u306E\u3046\u3061\u60AA\u6027\u65B0\u751F\u726923.9%,\u5FC3\u75BE\u60A314.1%,\u8001\u887012.9%,\u8133\u8840\u7BA16.4%,\u80BA\u708E5.0%)\u3092\u57FA\u306B\u5E74\u9F62\u5C64\u5225\u69CB\u6210\u3092\u63A8\u5B9A\u3002\u81EA\u6BBA\u306F other \u306B\u542B\u3081\u305F"
  }
};

// data/education.json
var education_default = {
  source: "\u6587\u90E8\u79D1\u5B66\u7701\u300C\u5B66\u6821\u57FA\u672C\u8ABF\u67FB\u300D(\u4EE4\u548C6\u5E74\u5EA6)\u3001\u6587\u79D1\u7701\u300C\u5150\u7AE5\u751F\u5F92\u306E\u554F\u984C\u884C\u52D5\u30FB\u4E0D\u767B\u6821\u7B49\u751F\u5F92\u6307\u5C0E\u4E0A\u306E\u8AF8\u8AB2\u984C\u306B\u95A2\u3059\u308B\u8ABF\u67FB\u300D\u3001\u6771\u4EAC\u5927\u5B66\u5927\u5B66\u7D4C\u55B6\u30FB\u653F\u7B56\u7814\u7A76\u30BB\u30F3\u30BF\u30FC\u300C\u9AD8\u6821\u751F\u306E\u9032\u8DEF\u8FFD\u8DE1\u8ABF\u67FB\u300D\u3001JASSO\u300C\u5B66\u751F\u751F\u6D3B\u8ABF\u67FB\u300D",
  year: 2024,
  highSchoolEntryRate: 0.988,
  highSchoolDropoutRate: 0.015,
  universityEntryRate: 0.591,
  vocationalEntryRate: 0.21,
  graduateSchoolEntryRate: 0.125,
  universityDropoutRate: 0.019,
  universityEntryByHouseholdIncome: {
    under400: 0.314,
    "400to600": 0.439,
    "600to800": 0.494,
    "800to1000": 0.548,
    over1000: 0.624
  },
  scholarshipUseRate: 0.55,
  privateUniversityShare: 0.78,
  estimatedKeys: [
    "highSchoolDropoutRate",
    "vocationalEntryRate",
    "graduateSchoolEntryRate",
    "universityDropoutRate",
    "scholarshipUseRate",
    "privateUniversityShare"
  ],
  notes: {
    universityEntryRate: "\u5927\u5B66(\u5B66\u90E8)\u9032\u5B66\u7387(\u904E\u5E74\u5EA6\u5352\u542B\u3080, 18\u6B73\u4EBA\u53E3\u6BD4)",
    universityDropoutRate: "\u5E74\u9593\u306E\u4E2D\u9014\u9000\u5B66\u7387(\u6587\u79D1\u7701\u8ABF\u67FB\u3067\u6982\u306D2%\u524D\u5F8C)\u3002\u5728\u5B664\u5E74\u9593\u306E\u7D2F\u7A4D\u3067\u306F\u7D047%",
    highSchoolDropoutRate: "\u5E74\u9593\u4E2D\u9014\u9000\u5B66\u7387(\u4EE4\u548C5\u5E74\u5EA6 \u7D041.5%)",
    universityEntryByHouseholdIncome: "\u6771\u5927CRUMP 2005\u5E74\u9AD8\u68213\u5E74\u751F\u8FFD\u8DE1\u8ABF\u67FB(2009\u5E74\u5831\u544A) \u4E21\u89AA\u5E74\u53CE\u52254\u5E74\u5236\u5927\u5B66\u9032\u5B66\u7387\u3002\u533A\u5206\u306F400\u4E07\u5186\u4EE5\u4E0B/\u301C600/\u301C800/\u301C1000/1000\u4E07\u5186\u8D85",
    scholarshipUseRate: "JASSO \u5B66\u751F\u751F\u6D3B\u8ABF\u67FB(\u4EE4\u548C4\u5E74\u5EA6) \u5927\u5B66\u663C\u9593\u90E8\u3067\u4F55\u3089\u304B\u306E\u5968\u5B66\u91D1\u3092\u53D7\u7D66 \u7D0455%",
    privateUniversityShare: "\u5B66\u90E8\u5B66\u751F\u306E\u3046\u3061\u79C1\u7ACB\u5728\u7C4D \u7D0478%"
  }
};

// data/household.json
var household_default = {
  source: "\u539A\u751F\u52B4\u50CD\u7701\u300C2023\u5E74\u56FD\u6C11\u751F\u6D3B\u57FA\u790E\u8ABF\u67FB\u300D(\u5150\u7AE5\u306E\u3044\u308B\u4E16\u5E2F\u306E\u6240\u5F97\u5206\u5E03)\u3001\u4EBA\u53E3\u52D5\u614B\u7D71\u8A082024(\u90FD\u9053\u5E9C\u770C\u5225\u51FA\u751F\u6570)\u3001\u8CC3\u91D1\u69CB\u9020\u57FA\u672C\u7D71\u8A08\u8ABF\u67FB2024(\u90FD\u9053\u5E9C\u770C\u5225)",
  year: 2023,
  incomeBandsWithChildren: [
    {
      id: "low",
      label: "\u5E74\u53CE300\u4E07\u5186\u672A\u6E80",
      min: 0,
      max: 3e6,
      share: 0.09
    },
    {
      id: "lower_mid",
      label: "300\u301C500\u4E07\u5186",
      min: 3e6,
      max: 5e6,
      share: 0.16
    },
    {
      id: "mid",
      label: "500\u301C800\u4E07\u5186",
      min: 5e6,
      max: 8e6,
      share: 0.3
    },
    {
      id: "upper_mid",
      label: "800\u301C1200\u4E07\u5186",
      min: 8e6,
      max: 12e6,
      share: 0.29
    },
    {
      id: "high",
      label: "1200\u4E07\u5186\u4EE5\u4E0A",
      min: 12e6,
      max: 3e7,
      share: 0.16
    }
  ],
  regions: [
    {
      id: "tokyo",
      label: "\u6771\u4EAC\u570F",
      birthShare: 0.31,
      wageIndex: 1.15,
      rentIndex: 1.5,
      disasterRisk: 1.2
    },
    {
      id: "osaka",
      label: "\u5927\u962A\u570F",
      birthShare: 0.16,
      wageIndex: 1.03,
      rentIndex: 1,
      disasterRisk: 1.1
    },
    {
      id: "nagoya",
      label: "\u540D\u53E4\u5C4B\u570F",
      birthShare: 0.1,
      wageIndex: 1.02,
      rentIndex: 0.95,
      disasterRisk: 1.3
    },
    {
      id: "city",
      label: "\u5730\u65B9\u4E2D\u6838\u90FD\u5E02",
      birthShare: 0.23,
      wageIndex: 0.92,
      rentIndex: 0.85,
      disasterRisk: 0.9
    },
    {
      id: "rural",
      label: "\u5730\u65B9\u306E\u753A",
      birthShare: 0.2,
      wageIndex: 0.85,
      rentIndex: 0.7,
      disasterRisk: 1
    }
  ],
  estimatedKeys: [
    "incomeBandsWithChildren[].share",
    "regions[].birthShare",
    "regions[].wageIndex",
    "regions[].rentIndex",
    "regions[].disasterRisk"
  ],
  notes: {
    incomeBands: "\u5150\u7AE5\u306E\u3044\u308B\u4E16\u5E2F\u306E\u5E73\u5747\u6240\u5F97 \u7D04812\u4E07\u5186(2022\u5E74\u6240\u5F97)\u3068\u6574\u5408\u3059\u308B\u63A8\u5B9A\u5206\u5E03",
    birthShare: "2024\u5E74\u51FA\u751F\u6570686,061\u4EBA\u3002\u6771\u4EAC\u570F=\u6771\u4EAC\u30FB\u795E\u5948\u5DDD\u30FB\u57FC\u7389\u30FB\u5343\u8449\u3001\u5927\u962A\u570F=\u5927\u962A\u30FB\u4EAC\u90FD\u30FB\u5175\u5EAB\u30FB\u5948\u826F\u3001\u540D\u53E4\u5C4B\u570F=\u611B\u77E5(45,514\u4EBA,\u78BA\u5B9A)\u30FB\u5C90\u961C\u30FB\u4E09\u91CD\u3002\u5730\u65B9\u306F\u4E2D\u6838\u90FD\u5E02/\u753A\u3092\u6982\u306D\u534A\u3005\u3067\u6309\u5206",
    disasterRisk: "\u76F8\u5BFE\u5024(1.0=\u5E73\u5747)\u3002\u9996\u90FD\u76F4\u4E0B\u30FB\u5357\u6D77\u30C8\u30E9\u30D5\u7B49\u306E\u60F3\u5B9A\u3092\u8003\u616E\u3057\u305F\u63A8\u5B9A"
  }
};

// data/events.json
var events_default = {
  source: "\u4EBA\u53E3\u52D5\u614B\u7D71\u8A08\u30FB\u56FD\u52E2\u8ABF\u67FB\u30FB\u51FA\u751F\u52D5\u5411\u57FA\u672C\u8ABF\u67FB\u30FB\u52B4\u50CD\u529B\u8ABF\u67FB\u30FB\u96C7\u7528\u52D5\u5411\u8ABF\u67FB\u30FB\u56FD\u7ACB\u304C\u3093\u7814\u7A76\u30BB\u30F3\u30BF\u30FC\u30FB\u4ECB\u8B77\u4FDD\u967A\u4E8B\u696D\u72B6\u6CC1\u5831\u544A\u30FB\u539A\u751F\u5E74\u91D1\u4FDD\u967A\u30FB\u56FD\u6C11\u5E74\u91D1\u4E8B\u696D\u306E\u6982\u6CC1\u30FB\u5C31\u52B4\u6761\u4EF6\u7DCF\u5408\u8ABF\u67FB \u307B\u304B",
  year: 2024,
  marriageByAge: {
    "20s": 0.06,
    "30s": 0.06,
    "40s": 0.015,
    "50plus": 3e-3
  },
  lifetimeUnmarriedRate: {
    male: 0.2825,
    female: 0.1781
  },
  divorceRateAnnual: 65e-4,
  birthsPerCouple: 1.9,
  unemploymentRate: 0.025,
  layoffAnnual: 0.01,
  jobChangeRateAnnual: 0.05,
  promotionToManagerBy45: 0.3,
  cancerLifetimeRisk: {
    male: 0.621,
    female: 0.489
  },
  cancerIncidenceByAge: {
    "30s": 1e-3,
    "40s": 3e-3,
    "50s": 65e-4,
    "60s": 0.014,
    "70plus": 0.025
  },
  longTermCareNeedRateByAge: {
    "65to74": 0.043,
    "75to84": 0.19,
    "85plus": 0.58
  },
  parentCareStartProbByChildAge: {
    "40s": 0.03,
    "50s": 0.05,
    "60s": 0.04
  },
  inheritanceAverage: 15e6,
  inheritanceProbability: 0.6,
  majorDisasterAnnualByRiskUnit: 3e-3,
  lotteryJackpotOdds: 5e-8,
  lotteryParticipationRate: 0.3,
  startupFiveYearSurvival: 0.6,
  startupBigSuccessRate: 0.01,
  investmentReturn: {
    meanAnnual: 0.07,
    stdevAnnual: 0.16,
    note: "\u5168\u4E16\u754C\u682A\u5F0F historical (MSCI ACWI \u5186\u30D9\u30FC\u30B9\u9577\u671F\u306E\u6982\u7B97)"
  },
  depositRate: 2e-3,
  pensionMonthly: {
    kosei_avg: 146429,
    kokumin_avg: 57584
  },
  retirementAllowance: {
    university: 1896e4,
    high_school: 1682e4
  },
  taxAndSocialInsuranceRate: 0.8,
  estimatedKeys: [
    "marriageByAge",
    "divorceRateAnnual",
    "layoffAnnual",
    "jobChangeRateAnnual",
    "promotionToManagerBy45",
    "cancerLifetimeRisk",
    "cancerIncidenceByAge",
    "longTermCareNeedRateByAge",
    "parentCareStartProbByChildAge",
    "inheritanceAverage",
    "inheritanceProbability",
    "majorDisasterAnnualByRiskUnit",
    "lotteryParticipationRate",
    "startupFiveYearSurvival",
    "startupBigSuccessRate",
    "investmentReturn",
    "depositRate",
    "taxAndSocialInsuranceRate"
  ],
  notes: {
    marriageByAge: "\u672A\u5A5A\u8005\u306E\u5E74\u9593\u521D\u5A5A\u30CF\u30B6\u30FC\u30C9\u3002\u5E73\u5747\u521D\u5A5A\u5E74\u9F62(\u592B31.1\u30FB\u59BB29.8\u6B73)\u3068\u751F\u6DAF\u672A\u5A5A\u7387\u306B\u6574\u5408\u3059\u308B\u3088\u3046\u63A8\u5B9A",
    lifetimeUnmarriedRate: "2020\u5E74\u56FD\u52E2\u8ABF\u67FB 50\u6B73\u6642\u672A\u5A5A\u5272\u5408",
    divorceRateAnnual: "\u96E2\u5A5A\u4EF6\u6570\u7D0418.6\u4E07\u4EF6(2024)/\u6709\u914D\u5076\u592B\u5A66\u7D042,900\u4E07\u7D44",
    birthsPerCouple: "\u7B2C16\u56DE\u51FA\u751F\u52D5\u5411\u57FA\u672C\u8ABF\u67FB(2021) \u5B8C\u7D50\u51FA\u751F\u5150\u65701.90",
    unemploymentRate: "\u52B4\u50CD\u529B\u8ABF\u67FB2024\u5E74\u5E73\u5747 2.5%",
    layoffAnnual: "\u96C7\u7528\u52D5\u5411\u8ABF\u67FB \u96E2\u8077\u738714.2%(2024)\u306E\u3046\u3061\u7D4C\u55B6\u4E0A\u306E\u90FD\u5408\u7B49\u306E\u5272\u5408\u304B\u3089\u6982\u7B97",
    jobChangeRateAnnual: "\u52B4\u50CD\u529B\u8ABF\u67FB \u8EE2\u8077\u8005\u6BD4\u7387(\u7D045%)",
    cancerLifetimeRisk: "\u56FD\u7ACB\u304C\u3093\u7814\u7A76\u30BB\u30F3\u30BF\u30FC \u304C\u3093\u60C5\u5831\u30B5\u30FC\u30D3\u30B9 \u751F\u6DAF\u7D2F\u7A4D\u7F79\u60A3\u30EA\u30B9\u30AF(2020\u5E74\u30C7\u30FC\u30BF)\u3002\u8A18\u61B6\u5024\u30FB\u672A\u691C\u8A3C",
    cancerIncidenceByAge: "\u5E74\u9593\u7F79\u60A3\u7387(\u5168\u90E8\u4F4D, \u7537\u5973\u8A08)\u306E\u6982\u7B97",
    longTermCareNeedRateByAge: "\u8981\u652F\u63F4\u30FB\u8981\u4ECB\u8B77\u8A8D\u5B9A\u7387(65-69\u6B73\u7D043%,70-74\u6B73\u7D046%,75-79\u6B73\u7D0412%,80-84\u6B73\u7D0426%,85\u6B73\u4EE5\u4E0A\u7D0460%)\u3092\u96C6\u7D04",
    inheritanceAverage: "\u76F8\u7D9A\u4EBA1\u4EBA\u3042\u305F\u308A\u53D6\u5F97\u984D\u306E\u6982\u7B97",
    pensionMonthly: "\u4EE4\u548C5\u5E74\u5EA6 \u539A\u751F\u5E74\u91D1\u4FDD\u967A\u30FB\u56FD\u6C11\u5E74\u91D1\u4E8B\u696D\u306E\u6982\u6CC1(\u539A\u751F\u5E74\u91D1\u306F\u57FA\u790E\u5E74\u91D1\u542B\u3080)",
    retirementAllowance: "\u4EE4\u548C5\u5E74\u5C31\u52B4\u6761\u4EF6\u7DCF\u5408\u8ABF\u67FB \u5B9A\u5E74\u9000\u8077\u8005\u5E73\u5747(\u5927\u5B66\u30FB\u5927\u5B66\u9662\u5352/\u9AD8\u6821\u5352 \u3044\u305A\u308C\u3082\u7BA1\u7406\u30FB\u4E8B\u52D9\u30FB\u6280\u8853\u8077)\u3002\u9AD8\u5352\u73FE\u696D\u8077\u306F1,183\u4E07\u5186",
    taxAndSocialInsuranceRate: "\u53EF\u51E6\u5206\u6240\u5F97/\u984D\u9762 \u306E\u6982\u7B97(\u5E74\u53CE\u30FB\u6276\u990A\u306B\u3088\u308A0.75\u301C0.85)",
    lotteryJackpotOdds: "\u5E74\u672B\u30B8\u30E3\u30F3\u30DC1\u7B49 1\u30E6\u30CB\u30C3\u30C82,000\u4E07\u901A\u306B1\u672C"
  }
};

// src/engine/data.ts
var CountryData = class {
  constructor(iso3, nameJa, currency, k, income, living, lifetable, education, household, ev, inst) {
    this.iso3 = iso3;
    this.nameJa = nameJa;
    this.currency = currency;
    this.k = k;
    this.income = income;
    this.living = living;
    this.lifetable = lifetable;
    this.education = education;
    this.household = household;
    this.ev = ev;
    this.inst = inst;
  }
  get isJapan() {
    return this.inst === null;
  }
  /** 年齢 → 年収（正社員、学歴別） */
  regularWage(sex, edu, age) {
    const tbl = this.income.regular[sex][edu] ?? this.income.regular[sex].high_school;
    return this.bandLookup(tbl, age);
  }
  nonRegularWage(sex, age) {
    return this.bandLookup(this.income.nonRegular[sex], age);
  }
  bandLookup(tbl, age) {
    const bands = this.income.ageBands;
    const mids = bands.map((b) => b + 2.5);
    if (age <= mids[0]) return num(tbl[0]) * Math.max(0.75, 1 - (mids[0] - age) * 0.05);
    for (let i = 0; i < mids.length - 1; i++) {
      if (age < mids[i + 1]) {
        const t = (age - mids[i]) / (mids[i + 1] - mids[i]);
        return num(tbl[i]) * (1 - t) + num(tbl[i + 1] ?? tbl[i]) * t;
      }
    }
    return num(tbl[tbl.length - 1]);
  }
  qx(sex, age) {
    const arr = this.lifetable.qx[sex];
    if (age >= arr.length) return 1;
    return Math.min(1, Math.max(0, num(arr[age])));
  }
  familyMonthly(headAge) {
    const f = this.living.familyMonthlyByHeadAge;
    if (headAge < 30) return f.under30;
    if (headAge < 40) return f["30s"];
    if (headAge < 50) return f["40s"];
    if (headAge < 60) return f["50s"];
    if (headAge < 70) return f["60s"];
    return f["70plus"];
  }
  singleMonthlyTotal() {
    return Object.values(this.living.singleMonthly).reduce((a, b) => a + num(b), 0);
  }
  rentFor(region) {
    const r = this.living.rentMonthly;
    if (!this.isJapan) return r.regional_city * region.rentIndex;
    if (region.id === "tokyo") return r.tokyo;
    if (region.id === "osaka" || region.id === "nagoya") return r.osaka;
    if (region.id === "city") return r.regional_city;
    return r.rural;
  }
  cancerAnnual(age) {
    const c = this.ev.cancerIncidenceByAge;
    if (age < 30) return c["30s"] * 0.25;
    if (age < 40) return c["30s"];
    if (age < 50) return c["40s"];
    if (age < 60) return c["50s"];
    if (age < 70) return c["60s"];
    return c["70plus"];
  }
  careNeed(age) {
    const c = this.ev.longTermCareNeedRateByAge;
    if (age < 65) return 4e-3;
    if (age < 75) return c["65to74"];
    if (age < 85) return c["75to84"];
    return c["85plus"];
  }
  /** 1年あたりの初婚の起こりやすさ（その国の結婚年齢に合わせて年齢をずらす） */
  marriageHazard(age, sex) {
    const shift = this.inst?.marriageAgeShift[sex] ?? 0;
    const a = age + shift;
    const m = this.ev.marriageByAge;
    if (a < 18) return 0;
    const base = a < 30 ? m["20s"] : a < 40 ? m["30s"] : a < 50 ? m["40s"] : m["50plus"];
    return base * (this.isJapan ? 1 : 1.35);
  }
  /** 世帯年収 → 子どもの大学進学率 */
  univRateForIncome(hh) {
    const u = this.education.universityEntryByHouseholdIncome;
    const x = hh / this.k;
    if (x < 4e6) return u.under400;
    if (x < 6e6) return u["400to600"];
    if (x < 8e6) return u["600to800"];
    if (x < 1e7) return u["800to1000"];
    return u.over1000;
  }
  /** 給与にかかる税・社会保険 */
  tax(gross, formal) {
    if (gross <= 0) return 0;
    if (this.isJapan) return taxJapan(gross);
    const inst = this.inst;
    const rel = gross / Math.max(1, this.regularWage("male", "high_school", 40));
    const rate = inst.effectiveTaxRate * Math.min(1.8, Math.max(0.3, Math.pow(rel, 0.35)));
    return gross * rate * (formal ? 1 : 0.25);
  }
  pensionTax(p) {
    if (this.isJapan) return Math.max(0, p - 11e5) * 0.1 + p * 0.06;
    return p * this.inst.effectiveTaxRate * 0.4;
  }
  /** お金の表示。日本は円、他の国は現地通貨（約◯円） */
  fmt(n, withJpy = true) {
    if (this.isJapan) return yen(n);
    const local = jaUnits(n) + this.currency.nameJa;
    return withJpy ? `${local}\uFF08\u7D04${yen(n * this.currency.jpyPerUnit)}\uFF09` : local;
  }
  toJpy(n) {
    return n * this.currency.jpyPerUnit;
  }
};
function num(x) {
  return typeof x === "number" && isFinite(x) ? x : 0;
}
function taxJapan(gross) {
  if (gross <= 0) return 0;
  const social = Math.min(gross, 14e6) * 0.15;
  const kyuyo = Math.min(195e4, Math.max(55e4, gross * 0.2 + 44e4));
  const taxable = Math.max(0, gross - kyuyo - social - 48e4);
  const brackets = [
    [195e4, 0.05],
    [33e5, 0.1],
    [695e4, 0.2],
    [9e6, 0.23],
    [18e6, 0.33],
    [4e7, 0.4],
    [Infinity, 0.45]
  ];
  let it = 0;
  let prev = 0;
  for (const [cap, rate] of brackets) {
    if (taxable > prev) it += (Math.min(taxable, cap) - prev) * rate;
    prev = cap;
  }
  return social + it * 1.021 + taxable * 0.1;
}
function jaUnits(n) {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1e8) return `${sign}${(a / 1e8).toFixed(a >= 1e9 ? 1 : 2)}\u5104`;
  if (a >= 1e4) return `${sign}${Math.round(a / 1e4).toLocaleString("ja-JP")}\u4E07`;
  return `${sign}${Math.round(a).toLocaleString("ja-JP")}`;
}
function yen(n) {
  return jaUnits(n) + "\u5186";
}
var JAPAN = new CountryData(
  "JPN",
  "\u65E5\u672C",
  { code: "JPY", nameJa: "\u5186", symbol: "\xA5", jpyPerUnit: 1 },
  1,
  income_default,
  living_default,
  lifetable_default,
  education_default,
  household_default,
  events_default,
  null
);

// data/world/risks.json
var risks_default = {
  IND: {
    inflationMean: 0.061,
    inflationCrisisShare: 0,
    inflationRecent: 0.024,
    homicidePer100k: 2.82,
    ipvPast12mWomen: 0.22,
    politicalStability: -0.61,
    conflictRisk: 0.0398,
    floodRisk: 0.7787,
    droughtRisk: 0.59,
    earthquakeRisk: 0.5718,
    epidemicRisk: 0.66,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.3,
      flood: 9.2,
      drought: 5.9,
      epidemic: 6.6,
      conflictProjected: 10,
      conflictCurrent: 6.5
    }
  },
  CHN: {
    inflationMean: 0.02,
    inflationCrisisShare: 0,
    inflationRecent: 1e-3,
    homicidePer100k: 0.5,
    ipvPast12mWomen: 0.106,
    politicalStability: 0.02,
    conflictRisk: 48e-4,
    floodRisk: 0.8044,
    droughtRisk: 0.46,
    earthquakeRisk: 0.3008,
    epidemicRisk: 0.53,
    years: {
      inflationRecent: 2025,
      homicide: 2020,
      ipv: "WHO VAW 2018\uFF08vaw-data.srhr.org\u300115\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 6.7,
      flood: 9.3,
      drought: 4.6,
      epidemic: 5.3,
      conflictProjected: 2.4,
      conflictCurrent: 4.2
    }
  },
  NGA: {
    inflationMean: 0.139,
    inflationCrisisShare: 0.114,
    inflationRecent: 0.23,
    homicidePer100k: 15.75,
    ipvPast12mWomen: 0.11,
    politicalStability: -1.74,
    conflictRisk: 0.5248,
    floodRisk: 0.5718,
    droughtRisk: 0.31,
    earthquakeRisk: 0,
    epidemicRisk: 0.8,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2013,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 8.3,
      drought: 3.1,
      epidemic: 8,
      conflictProjected: 10,
      conflictCurrent: 9.3
    }
  },
  PAK: {
    inflationMean: 0.095,
    inflationCrisisShare: 0,
    inflationRecent: 0.035,
    homicidePer100k: 4.33,
    ipvPast12mWomen: 0.130906,
    politicalStability: -1.95,
    conflictRisk: 0.631,
    floodRisk: 0.8574,
    droughtRisk: 0.45,
    earthquakeRisk: 0.7787,
    epidemicRisk: 0.75,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.2,
      flood: 9.5,
      drought: 4.5,
      epidemic: 7.5,
      conflictProjected: 10,
      conflictCurrent: 9.5
    }
  },
  IDN: {
    inflationMean: 0.058,
    inflationCrisisShare: 0.029,
    inflationRecent: 0.019,
    homicidePer100k: 0.3,
    ipvPast12mWomen: 0.035864,
    politicalStability: -0.74,
    conflictRisk: 83e-4,
    floodRisk: 0.5927,
    droughtRisk: 0.33,
    earthquakeRisk: 0.705,
    epidemicRisk: 0.74,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.9,
      flood: 8.4,
      drought: 3.3,
      epidemic: 7.4,
      conflictProjected: 10,
      conflictCurrent: 4.8
    }
  },
  COD: {
    inflationMean: 0.446,
    inflationCrisisShare: 0.407,
    inflationRecent: 0.0741,
    homicidePer100k: 12.42099214,
    ipvPast12mWomen: 0.368,
    politicalStability: -2.13,
    conflictRisk: 1,
    floodRisk: 0.343,
    droughtRisk: 0.23,
    earthquakeRisk: 0.0741,
    epidemicRisk: 0.82,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: 2014,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 4.2,
      flood: 7,
      drought: 2.3,
      epidemic: 8.2,
      conflictProjected: 10,
      conflictCurrent: 10
    }
  },
  ETH: {
    inflationMean: 0.148,
    inflationCrisisShare: 0.029,
    inflationRecent: 0.132,
    homicidePer100k: 8.51,
    ipvPast12mWomen: 0.198,
    politicalStability: -1.85,
    conflictRisk: 0.5248,
    floodRisk: 0.1406,
    droughtRisk: 0.51,
    earthquakeRisk: 0.0973,
    epidemicRisk: 0.7,
    years: {
      inflationRecent: 2025,
      homicide: 2012,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 4.6,
      flood: 5.2,
      drought: 5.1,
      epidemic: 7,
      conflictProjected: 10,
      conflictCurrent: 9.3
    }
  },
  USA: {
    inflationMean: 0.026,
    inflationCrisisShare: 0,
    inflationRecent: 0.029,
    homicidePer100k: 5.76,
    ipvPast12mWomen: 0.073688,
    politicalStability: -0.3,
    conflictRisk: 0.01,
    floodRisk: 0.5927,
    droughtRisk: 0.42,
    earthquakeRisk: 0.4565,
    epidemicRisk: 0.47,
    years: {
      inflationRecent: 2024,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 7.7,
      flood: 8.4,
      drought: 4.2,
      epidemic: 4.7,
      conflictProjected: 0,
      conflictCurrent: 5
    }
  },
  BGD: {
    inflationMean: 0.066,
    inflationCrisisShare: 0,
    inflationRecent: 0.088,
    homicidePer100k: 2.34,
    ipvPast12mWomen: 0.288,
    politicalStability: -0.94,
    conflictRisk: 91e-4,
    floodRisk: 0.9703,
    droughtRisk: 0.15,
    earthquakeRisk: 0.705,
    epidemicRisk: 0.69,
    years: {
      inflationRecent: 2025,
      homicide: 2018,
      ipv: 2015,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.9,
      flood: 9.9,
      drought: 1.5,
      epidemic: 6.9,
      conflictProjected: 10,
      conflictCurrent: 4.9
    }
  },
  BRA: {
    inflationMean: 0.063,
    inflationCrisisShare: 0.171,
    inflationRecent: 0.05,
    homicidePer100k: 19.28,
    ipvPast12mWomen: 0.023823,
    politicalStability: -0.38,
    conflictRisk: 91e-4,
    floodRisk: 0.4565,
    droughtRisk: 0.45,
    earthquakeRisk: 1e-4,
    epidemicRisk: 0.64,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.5,
      flood: 7.7,
      drought: 4.5,
      epidemic: 6.4,
      conflictProjected: 10,
      conflictCurrent: 4.9
    }
  },
  EGY: {
    inflationMean: 0.115,
    inflationCrisisShare: 0,
    inflationRecent: 0.141,
    homicidePer100k: 1.31,
    ipvPast12mWomen: 0.14,
    politicalStability: -0.89,
    conflictRisk: 48e-4,
    floodRisk: 0.9703,
    droughtRisk: 0.17,
    earthquakeRisk: 0.0973,
    epidemicRisk: 0.32,
    years: {
      inflationRecent: 2025,
      homicide: 2017,
      ipv: 2014,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 4.6,
      flood: 9.9,
      drought: 1.7,
      epidemic: 3.2,
      conflictProjected: 10,
      conflictCurrent: 4.2
    }
  },
  TZA: {
    inflationMean: 0.063,
    inflationCrisisShare: 0,
    inflationRecent: 0.033,
    homicidePer100k: 3.75,
    ipvPast12mWomen: 0.296,
    politicalStability: -0.48,
    conflictRisk: 0.01,
    floodRisk: 0.0741,
    droughtRisk: 0.47,
    earthquakeRisk: 0.0852,
    epidemicRisk: 0.69,
    years: {
      inflationRecent: 2025,
      homicide: 2020,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 4.4,
      flood: 4.2,
      drought: 4.7,
      epidemic: 6.9,
      conflictProjected: 10,
      conflictCurrent: 5
    }
  },
  MEX: {
    inflationMean: 0.048,
    inflationCrisisShare: 0,
    inflationRecent: 0.038,
    homicidePer100k: 24.86,
    ipvPast12mWomen: 0.095,
    politicalStability: -0.61,
    conflictRisk: 0.2089,
    floodRisk: 0.493,
    droughtRisk: 0.3,
    earthquakeRisk: 0.5514,
    epidemicRisk: 0.54,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.2,
      flood: 7.9,
      drought: 3,
      epidemic: 5.4,
      conflictProjected: 10,
      conflictCurrent: 8.3
    }
  },
  PHL: {
    inflationMean: 0.039,
    inflationCrisisShare: 0,
    inflationRecent: 0.017,
    homicidePer100k: 4.35,
    ipvPast12mWomen: 0.055,
    politicalStability: -0.84,
    conflictRisk: 52e-4,
    floodRisk: 0.705,
    droughtRisk: 0.35,
    earthquakeRisk: 0.9127,
    epidemicRisk: 0.61,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2017,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.7,
      flood: 8.9,
      drought: 3.5,
      epidemic: 6.1,
      conflictProjected: 10,
      conflictCurrent: 4.3
    }
  },
  UGA: {
    inflationMean: 0.06,
    inflationCrisisShare: 0,
    inflationRecent: 0.036,
    homicidePer100k: 8.97,
    ipvPast12mWomen: 0.299,
    politicalStability: -0.87,
    conflictRisk: 63e-4,
    floodRisk: 0.0593,
    droughtRisk: 0.7,
    earthquakeRisk: 0.0507,
    epidemicRisk: 0.77,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 3.7,
      flood: 3.9,
      drought: 7,
      epidemic: 7.7,
      conflictProjected: 10,
      conflictCurrent: 4.5
    }
  },
  SDN: {
    inflationMean: 0.446,
    inflationCrisisShare: 0.394,
    inflationRecent: 1.388,
    homicidePer100k: 5.15,
    ipvPast12mWomen: 0.286374,
    politicalStability: -2.07,
    conflictRisk: 1,
    floodRisk: 0.6585,
    droughtRisk: 0.54,
    earthquakeRisk: 0,
    epidemicRisk: 0.61,
    years: {
      inflationRecent: 2022,
      homicide: 2008,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 8.7,
      drought: 5.4,
      epidemic: 6.1,
      conflictProjected: 10,
      conflictCurrent: 10
    }
  },
  KEN: {
    inflationMean: 0.084,
    inflationCrisisShare: 0.029,
    inflationRecent: 0.041,
    homicidePer100k: 4.87,
    ipvPast12mWomen: 0.255,
    politicalStability: -1.12,
    conflictRisk: 0.0145,
    floodRisk: 0.1406,
    droughtRisk: 0.66,
    earthquakeRisk: 0.022,
    epidemicRisk: 0.62,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: 2014,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 2.8,
      flood: 5.2,
      drought: 6.6,
      epidemic: 6.2,
      conflictProjected: 10,
      conflictCurrent: 5.4
    }
  },
  AFG: {
    inflationMean: 0.053,
    inflationCrisisShare: 0,
    inflationRecent: -0.066,
    homicidePer100k: 4.03,
    ipvPast12mWomen: 0.461,
    politicalStability: -2.04,
    conflictRisk: 0.0832,
    floodRisk: 0.389,
    droughtRisk: 0.87,
    earthquakeRisk: 0.6815,
    epidemicRisk: 0.62,
    years: {
      inflationRecent: 2024,
      homicide: 2021,
      ipv: 2015,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.8,
      flood: 7.3,
      drought: 8.7,
      epidemic: 6.2,
      conflictProjected: 10,
      conflictCurrent: 7.3
    }
  },
  VNM: {
    inflationMean: 0.057,
    inflationCrisisShare: 0,
    inflationRecent: 0.033,
    homicidePer100k: 1.54,
    ipvPast12mWomen: 0.108,
    politicalStability: 0.12,
    conflictRisk: 1e-3,
    floodRisk: 0.9703,
    droughtRisk: 0.4,
    earthquakeRisk: 0.0429,
    epidemicRisk: 0.67,
    years: {
      inflationRecent: 2025,
      homicide: 2011,
      ipv: 2010,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 3.5,
      flood: 9.9,
      drought: 4,
      epidemic: 6.7,
      conflictProjected: 1.4,
      conflictCurrent: 2.5
    }
  },
  YEM: {
    inflationMean: 0.111,
    inflationCrisisShare: 0.083,
    inflationRecent: 0.2018,
    homicidePer100k: 5.81,
    ipvPast12mWomen: 0.19,
    politicalStability: -2.51,
    conflictRisk: 0.4365,
    floodRisk: 0.216,
    droughtRisk: 0.42,
    earthquakeRisk: 49e-4,
    epidemicRisk: 0.61,
    years: {
      inflationRecent: 2025,
      homicide: 2013,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 1.7,
      flood: 6,
      drought: 4.2,
      epidemic: 6.1,
      conflictProjected: 10,
      conflictCurrent: 9.1
    }
  },
  AGO: {
    inflationMean: 0.42,
    inflationCrisisShare: 0.412,
    inflationRecent: 0.202,
    homicidePer100k: 4.1,
    ipvPast12mWomen: 0.259,
    politicalStability: -0.44,
    conflictRisk: 21e-4,
    floodRisk: 0.0593,
    droughtRisk: 0.37,
    earthquakeRisk: 0,
    epidemicRisk: 0.68,
    years: {
      inflationRecent: 2025,
      homicide: 2016,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 3.9,
      drought: 3.7,
      epidemic: 6.8,
      conflictProjected: 10,
      conflictCurrent: 3.3
    }
  },
  MOZ: {
    inflationMean: 0.077,
    inflationCrisisShare: 0,
    inflationRecent: 0.044,
    homicidePer100k: 3.59,
    ipvPast12mWomen: 0.155,
    politicalStability: -1.66,
    conflictRisk: 0.0251,
    floodRisk: 0.227,
    droughtRisk: 0.71,
    earthquakeRisk: 0.0393,
    epidemicRisk: 0.67,
    years: {
      inflationRecent: 2025,
      homicide: 2011,
      ipv: 2015,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 3.4,
      flood: 6.1,
      drought: 7.1,
      epidemic: 6.7,
      conflictProjected: 10,
      conflictCurrent: 6
    }
  },
  RUS: {
    inflationMean: 0.099,
    inflationCrisisShare: 0.156,
    inflationRecent: 0.087,
    homicidePer100k: 6.77,
    ipvPast12mWomen: 0.09,
    politicalStability: -0.94,
    conflictRisk: 1,
    floodRisk: 0.5927,
    droughtRisk: 0.58,
    earthquakeRisk: 0.0741,
    epidemicRisk: 0.31,
    years: {
      inflationRecent: 2025,
      homicide: 2021,
      ipv: null,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [
      "ipvPast12mWomen"
    ],
    inform: {
      earthquake: 4.2,
      flood: 8.4,
      drought: 5.8,
      epidemic: 3.1,
      conflictProjected: 10,
      conflictCurrent: 10
    }
  },
  ZAF: {
    inflationMean: 0.052,
    inflationCrisisShare: 0,
    inflationRecent: 0.032,
    homicidePer100k: 43.72,
    ipvPast12mWomen: 0.106245,
    politicalStability: -0.38,
    conflictRisk: 4e-3,
    floodRisk: 0.0328,
    droughtRisk: 0.86,
    earthquakeRisk: 34e-4,
    epidemicRisk: 0.44,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 1.5,
      flood: 3.2,
      drought: 8.6,
      epidemic: 4.4,
      conflictProjected: 10,
      conflictCurrent: 4
    }
  },
  IRN: {
    inflationMean: 0.219,
    inflationCrisisShare: 0.114,
    inflationRecent: 0.422,
    homicidePer100k: 2.38,
    ipvPast12mWomen: 0.15,
    politicalStability: -1.69,
    conflictRisk: 0.3311,
    floodRisk: 0.4052,
    droughtRisk: 0.64,
    earthquakeRisk: 0.8044,
    epidemicRisk: 0.61,
    years: {
      inflationRecent: 2025,
      homicide: 2014,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.3,
      flood: 7.4,
      drought: 6.4,
      epidemic: 6.1,
      conflictProjected: 10,
      conflictCurrent: 8.8
    }
  },
  IRQ: {
    inflationMean: 0.096,
    inflationCrisisShare: 0.176,
    inflationRecent: 3e-3,
    homicidePer100k: 9.46,
    ipvPast12mWomen: 0.14,
    politicalStability: -1.87,
    conflictRisk: 0.0275,
    floodRisk: 0.8847,
    droughtRisk: 0.75,
    earthquakeRisk: 0.1327,
    epidemicRisk: 0.62,
    years: {
      inflationRecent: 2025,
      homicide: 2013,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 5.1,
      flood: 9.6,
      drought: 7.5,
      epidemic: 6.2,
      conflictProjected: 10,
      conflictCurrent: 6.1
    }
  },
  NER: {
    inflationMean: 0.025,
    inflationCrisisShare: 0,
    inflationRecent: -0.045,
    homicidePer100k: 4.42,
    ipvPast12mWomen: 0.124843,
    politicalStability: -1.77,
    conflictRisk: 1,
    floodRisk: 0.2875,
    droughtRisk: 0.59,
    earthquakeRisk: 0,
    epidemicRisk: 0.71,
    years: {
      inflationRecent: 2025,
      homicide: 2012,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 6.6,
      drought: 5.9,
      epidemic: 7.1,
      conflictProjected: 10,
      conflictCurrent: 10
    }
  },
  MDG: {
    inflationMean: 0.086,
    inflationCrisisShare: 0.029,
    inflationRecent: 0.081,
    homicidePer100k: 7.66,
    ipvPast12mWomen: 0.146063,
    politicalStability: -0.52,
    conflictRisk: 11e-4,
    floodRisk: 0.25,
    droughtRisk: 0.46,
    earthquakeRisk: 0,
    epidemicRisk: 0.69,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 6.3,
      drought: 4.6,
      epidemic: 6.9,
      conflictProjected: 3.4,
      conflictCurrent: 2.6
    }
  },
  CIV: {
    inflationMean: 0.026,
    inflationCrisisShare: 0,
    inflationRecent: 1e-3,
    homicidePer100k: 4.87,
    ipvPast12mWomen: 0.22,
    politicalStability: -0.72,
    conflictRisk: 19e-4,
    floodRisk: 0.1106,
    droughtRisk: 0.09,
    earthquakeRisk: 0,
    epidemicRisk: 0.77,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 4.8,
      drought: 0.9,
      epidemic: 7.7,
      conflictProjected: 5.1,
      conflictCurrent: 3.2
    }
  },
  CMR: {
    inflationMean: 0.027,
    inflationCrisisShare: 0,
    inflationRecent: 0.034,
    homicidePer100k: 6.76,
    ipvPast12mWomen: 0.327,
    politicalStability: -1.69,
    conflictRisk: 0.1096,
    floodRisk: 0.3008,
    droughtRisk: 0.34,
    earthquakeRisk: 0,
    epidemicRisk: 0.75,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: 2014,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 6.7,
      drought: 3.4,
      epidemic: 7.5,
      conflictProjected: 10,
      conflictCurrent: 7.6
    }
  },
  TUR: {
    inflationMean: 0.217,
    inflationCrisisShare: 0.457,
    inflationRecent: 0.349,
    homicidePer100k: 3.23,
    ipvPast12mWomen: 0.11,
    politicalStability: -0.88,
    conflictRisk: 0.0631,
    floodRisk: 0.216,
    droughtRisk: 0.21,
    earthquakeRisk: 0.8044,
    epidemicRisk: 0.53,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2014,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.3,
      flood: 6,
      drought: 2.1,
      epidemic: 5.3,
      conflictProjected: 10,
      conflictCurrent: 7
    }
  },
  MLI: {
    inflationMean: 0.022,
    inflationCrisisShare: 0,
    inflationRecent: 0.033,
    homicidePer100k: 10.82,
    ipvPast12mWomen: 0.215,
    politicalStability: -2.5,
    conflictRisk: 0.8318,
    floodRisk: 0.493,
    droughtRisk: 0.67,
    earthquakeRisk: 0,
    epidemicRisk: 0.68,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: 2006,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 7.9,
      drought: 6.7,
      epidemic: 6.8,
      conflictProjected: 10,
      conflictCurrent: 9.8
    }
  },
  UZB: {
    inflationMean: 0.118,
    inflationCrisisShare: 0,
    inflationRecent: 0.088,
    homicidePer100k: 1.4,
    ipvPast12mWomen: 0.08,
    politicalStability: 0.1,
    conflictRisk: 4e-4,
    floodRisk: 0.5718,
    droughtRisk: 0.66,
    earthquakeRisk: 0.343,
    epidemicRisk: 0.54,
    years: {
      inflationRecent: 2025,
      homicide: 2021,
      ipv: null,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [
      "ipvPast12mWomen"
    ],
    inform: {
      earthquake: 7,
      flood: 8.3,
      drought: 6.6,
      epidemic: 5.4,
      conflictProjected: 1.3,
      conflictCurrent: 1.6
    }
  },
  DZA: {
    inflationMean: 0.044,
    inflationCrisisShare: 0,
    inflationRecent: 0.014,
    homicidePer100k: 1.16,
    ipvPast12mWomen: 0.04,
    politicalStability: -0.66,
    conflictRisk: 3e-3,
    floodRisk: 0.0467,
    droughtRisk: 0.38,
    earthquakeRisk: 0.493,
    epidemicRisk: 0.36,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 7.9,
      flood: 3.6,
      drought: 3.8,
      epidemic: 3.6,
      conflictProjected: 8.2,
      conflictCurrent: 3.7
    }
  },
  MMR: {
    inflationMean: 0.137,
    inflationCrisisShare: 0.067,
    inflationRecent: 0.211,
    homicidePer100k: 2.58,
    ipvPast12mWomen: 0.11,
    politicalStability: -2.12,
    conflictRisk: 0.1318,
    floodRisk: 0.6815,
    droughtRisk: 0.09,
    earthquakeRisk: 0.5514,
    epidemicRisk: 0.63,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.2,
      flood: 8.8,
      drought: 0.9,
      epidemic: 6.3,
      conflictProjected: 10,
      conflictCurrent: 7.8
    }
  },
  GHA: {
    inflationMean: 0.178,
    inflationCrisisShare: 0.114,
    inflationRecent: 0.142,
    homicidePer100k: 1.83,
    ipvPast12mWomen: 0.192,
    politicalStability: 0.09,
    conflictRisk: 25e-4,
    floodRisk: 0.1038,
    droughtRisk: 0.13,
    earthquakeRisk: 0,
    epidemicRisk: 0.74,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: 2008,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 4.7,
      drought: 1.3,
      epidemic: 7.4,
      conflictProjected: 9.8,
      conflictCurrent: 3.5
    }
  },
  TCD: {
    inflationMean: 0.034,
    inflationCrisisShare: 0.029,
    inflationRecent: -0.039,
    homicidePer100k: 7.3,
    ipvPast12mWomen: 0.175,
    politicalStability: -1.57,
    conflictRisk: 0.0692,
    floodRisk: 0.5314,
    droughtRisk: 0.55,
    earthquakeRisk: 0,
    epidemicRisk: 0.74,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: 2015,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 8.1,
      drought: 5.5,
      epidemic: 7.4,
      conflictProjected: 10,
      conflictCurrent: 7.1
    }
  },
  SOM: {
    inflationMean: 0.08,
    inflationCrisisShare: 0,
    inflationRecent: 0.037,
    homicidePer100k: 4.3,
    ipvPast12mWomen: 0.16,
    politicalStability: -2.17,
    conflictRisk: 0.2754,
    floodRisk: 0.4746,
    droughtRisk: 1,
    earthquakeRisk: 22e-4,
    epidemicRisk: 0.63,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [
      "inflationCrisisShare",
      "inflationMean"
    ],
    inform: {
      earthquake: 1.3,
      flood: 7.8,
      drought: 10,
      epidemic: 6.3,
      conflictProjected: 10,
      conflictCurrent: 8.6
    }
  },
  JPN: {
    inflationMean: 4e-3,
    inflationCrisisShare: 0,
    inflationRecent: 0.032,
    homicidePer100k: 0.23,
    ipvPast12mWomen: 0.04,
    politicalStability: 1.26,
    conflictRisk: 6e-4,
    floodRisk: 0.8306,
    droughtRisk: 0.04,
    earthquakeRisk: 0.9127,
    epidemicRisk: 0.37,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "\u5185\u95A3\u5E9C\u300C\u7537\u5973\u9593\u306B\u304A\u3051\u308B\u66B4\u529B\u306B\u95A2\u3059\u308B\u8ABF\u67FB\u300D\u4EE4\u548C5\u5E74\u5EA6\uFF08\u6982\u8981\u7248 p.3\u3001\u7D50\u5A5A\u3057\u305F\u3053\u3068\u306E\u3042\u308B\u4EBA\u306E\u8EAB\u4F53\u7684\u66B4\u884C\u306E\u88AB\u5BB3\u7D4C\u9A13\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.7,
      flood: 9.4,
      drought: 0.4,
      epidemic: 3.7,
      conflictProjected: 0.2,
      conflictCurrent: 2
    },
    ipvLifetimeWomen: 0.15,
    ipvLifetimeMen: 0.115
  },
  BFA: {
    inflationMean: 0.025,
    inflationCrisisShare: 0,
    inflationRecent: -6e-3,
    homicidePer100k: 1.25,
    ipvPast12mWomen: 0.093,
    politicalStability: -1.8,
    conflictRisk: 0.5754,
    floodRisk: 0.0106,
    droughtRisk: 0.51,
    earthquakeRisk: 0,
    epidemicRisk: 0.71,
    years: {
      inflationRecent: 2025,
      homicide: 2017,
      ipv: 2010,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 2.2,
      drought: 5.1,
      epidemic: 7.1,
      conflictProjected: 10,
      conflictCurrent: 9.4
    }
  },
  COL: {
    inflationMean: 0.054,
    inflationCrisisShare: 0,
    inflationRecent: 0.051,
    homicidePer100k: 24.91,
    ipvPast12mWomen: 0.184,
    politicalStability: -0.95,
    conflictRisk: 0.0437,
    floodRisk: 0.343,
    droughtRisk: 0.27,
    earthquakeRisk: 0.705,
    epidemicRisk: 0.56,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2015,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.9,
      flood: 7,
      drought: 2.7,
      epidemic: 5.6,
      conflictProjected: 10,
      conflictCurrent: 6.6
    }
  },
  DEU: {
    inflationMean: 0.019,
    inflationCrisisShare: 0,
    inflationRecent: 0.022,
    homicidePer100k: 0.91,
    ipvPast12mWomen: 0.05,
    politicalStability: 0.21,
    conflictRisk: 3e-4,
    floodRisk: 0.512,
    droughtRisk: 0.13,
    earthquakeRisk: 0.0507,
    epidemicRisk: 0.15,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 3.7,
      flood: 8,
      drought: 1.3,
      epidemic: 1.5,
      conflictProjected: 0,
      conflictCurrent: 1.1
    }
  },
  GBR: {
    inflationMean: 0.025,
    inflationCrisisShare: 0,
    inflationRecent: 0.039,
    homicidePer100k: 1.12,
    ipvPast12mWomen: 0.06,
    politicalStability: 0.29,
    conflictRisk: 5e-4,
    floodRisk: 0.5718,
    droughtRisk: 0.15,
    earthquakeRisk: 0,
    epidemicRisk: 0.23,
    years: {
      inflationRecent: 2025,
      homicide: 2021,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 8.3,
      drought: 1.5,
      epidemic: 2.3,
      conflictProjected: 0,
      conflictCurrent: 1.7
    }
  },
  ZMB: {
    inflationMean: 0.134,
    inflationCrisisShare: 0.171,
    inflationRecent: 0.139,
    homicidePer100k: 5.2,
    ipvPast12mWomen: 0.267,
    politicalStability: -0.06,
    conflictRisk: 16e-4,
    floodRisk: 0.1106,
    droughtRisk: 0.55,
    earthquakeRisk: 0.0156,
    epidemicRisk: 0.62,
    years: {
      inflationRecent: 2025,
      homicide: 2015,
      ipv: 2014,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 2.5,
      flood: 4.8,
      drought: 5.5,
      epidemic: 6.2,
      conflictProjected: 7.1,
      conflictCurrent: 3
    }
  },
  FRA: {
    inflationMean: 0.017,
    inflationCrisisShare: 0,
    inflationRecent: 9e-3,
    homicidePer100k: 1.34,
    ipvPast12mWomen: 0.07,
    politicalStability: -0.09,
    conflictRisk: 13e-4,
    floodRisk: 0.4219,
    droughtRisk: 0.09,
    earthquakeRisk: 0.022,
    epidemicRisk: 0.23,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 2.8,
      flood: 7.5,
      drought: 0.9,
      epidemic: 2.3,
      conflictProjected: 0,
      conflictCurrent: 2.8
    }
  },
  MWI: {
    inflationMean: 0.163,
    inflationCrisisShare: 0.057,
    inflationRecent: 0.284,
    homicidePer100k: 1.78,
    ipvPast12mWomen: 0.243,
    politicalStability: -0.16,
    conflictRisk: 14e-4,
    floodRisk: 0.1038,
    droughtRisk: 0.65,
    earthquakeRisk: 0.227,
    epidemicRisk: 0.64,
    years: {
      inflationRecent: 2025,
      homicide: 2012,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 6.1,
      flood: 4.7,
      drought: 6.5,
      epidemic: 6.4,
      conflictProjected: 0.7,
      conflictCurrent: 2.9
    }
  },
  MAR: {
    inflationMean: 0.019,
    inflationCrisisShare: 0,
    inflationRecent: 7e-3,
    homicidePer100k: 1.71,
    ipvPast12mWomen: 0.215999,
    politicalStability: -0.54,
    conflictRisk: 28e-4,
    floodRisk: 0.125,
    droughtRisk: 0.64,
    earthquakeRisk: 0.0852,
    epidemicRisk: 0.35,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 4.4,
      flood: 5,
      drought: 6.4,
      epidemic: 3.5,
      conflictProjected: 7,
      conflictCurrent: 3.6
    }
  },
  THA: {
    inflationMean: 0.019,
    inflationCrisisShare: 0,
    inflationRecent: -1e-3,
    homicidePer100k: 4.79,
    ipvPast12mWomen: 0.143262,
    politicalStability: -0.56,
    conflictRisk: 76e-4,
    floodRisk: 0.9412,
    droughtRisk: 0.52,
    earthquakeRisk: 49e-4,
    epidemicRisk: 0.58,
    years: {
      inflationRecent: 2025,
      homicide: 2011,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 1.7,
      flood: 9.8,
      drought: 5.2,
      epidemic: 5.8,
      conflictProjected: 10,
      conflictCurrent: 4.7
    }
  },
  NPL: {
    inflationMean: 0.063,
    inflationCrisisShare: 0,
    inflationRecent: 0.027,
    homicidePer100k: 2.13,
    ipvPast12mWomen: 0.112,
    politicalStability: -0.44,
    conflictRisk: 52e-4,
    floodRisk: 0.3285,
    droughtRisk: 0.37,
    earthquakeRisk: 0.9412,
    epidemicRisk: 0.6,
    years: {
      inflationRecent: 2025,
      homicide: 2020,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.8,
      flood: 6.9,
      drought: 3.7,
      epidemic: 6,
      conflictProjected: 8.8,
      conflictCurrent: 4.3
    }
  },
  SAU: {
    inflationMean: 0.023,
    inflationCrisisShare: 0,
    inflationRecent: 0.02,
    homicidePer100k: 0.94,
    ipvPast12mWomen: 0.11,
    politicalStability: 0.02,
    conflictRisk: 33e-4,
    floodRisk: 0.1106,
    droughtRisk: 0.5,
    earthquakeRisk: 58e-4,
    epidemicRisk: 0.58,
    years: {
      inflationRecent: 2025,
      homicide: 2019,
      ipv: null,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [
      "ipvPast12mWomen"
    ],
    inform: {
      earthquake: 1.8,
      flood: 4.8,
      drought: 5,
      epidemic: 5.8,
      conflictProjected: 9.5,
      conflictCurrent: 3.8
    }
  },
  PER: {
    inflationMean: 0.031,
    inflationCrisisShare: 0.114,
    inflationRecent: 0.015,
    homicidePer100k: 8.6,
    ipvPast12mWomen: 0.108,
    politicalStability: -0.5,
    conflictRisk: 25e-4,
    floodRisk: 0.2875,
    droughtRisk: 0.38,
    earthquakeRisk: 0.8847,
    epidemicRisk: 0.56,
    years: {
      inflationRecent: 2025,
      homicide: 2021,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.6,
      flood: 6.6,
      drought: 3.8,
      epidemic: 5.6,
      conflictProjected: 7.2,
      conflictCurrent: 3.5
    }
  },
  SEN: {
    inflationMean: 0.021,
    inflationCrisisShare: 0,
    inflationRecent: 0.015,
    homicidePer100k: 0.27,
    ipvPast12mWomen: 0.122,
    politicalStability: -0.17,
    conflictRisk: 16e-4,
    floodRisk: 0.25,
    droughtRisk: 0.61,
    earthquakeRisk: 0,
    epidemicRisk: 0.64,
    years: {
      inflationRecent: 2025,
      homicide: 2015,
      ipv: 2017,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 6.3,
      drought: 6.1,
      epidemic: 6.4,
      conflictProjected: 3.4,
      conflictCurrent: 3
    }
  },
  SYR: {
    inflationMean: 0.132,
    inflationCrisisShare: 0.067,
    inflationRecent: 0.4,
    homicidePer100k: 2.06,
    ipvPast12mWomen: 0.15,
    politicalStability: -2.32,
    conflictRisk: 1,
    floodRisk: 0.25,
    droughtRisk: 0.86,
    earthquakeRisk: 0.3732,
    epidemicRisk: 0.54,
    years: {
      inflationRecent: null,
      homicide: 2010,
      ipv: null,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [
      "inflationRecent",
      "ipvPast12mWomen"
    ],
    inform: {
      earthquake: 7.2,
      flood: 6.3,
      drought: 8.6,
      epidemic: 5.4,
      conflictProjected: 10,
      conflictCurrent: 10
    }
  },
  ARG: {
    inflationMean: 0.863,
    inflationCrisisShare: 0.857,
    inflationRecent: 2.199,
    homicidePer100k: 4.49,
    ipvPast12mWomen: 0.105733,
    politicalStability: 0.16,
    conflictRisk: 8e-4,
    floodRisk: 0.4565,
    droughtRisk: 0.59,
    earthquakeRisk: 0.1664,
    epidemicRisk: 0.44,
    years: {
      inflationRecent: 2024,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 5.5,
      flood: 7.7,
      drought: 5.9,
      epidemic: 4.4,
      conflictProjected: 9.4,
      conflictCurrent: 2.3
    }
  },
  ZWE: {
    inflationMean: 0.598,
    inflationCrisisShare: 0.308,
    inflationRecent: 1.047,
    homicidePer100k: 6.76,
    ipvPast12mWomen: 0.199,
    politicalStability: -0.87,
    conflictRisk: 14e-4,
    floodRisk: 0.0467,
    droughtRisk: 0.94,
    earthquakeRisk: 58e-4,
    epidemicRisk: 0.52,
    years: {
      inflationRecent: 2022,
      homicide: 2022,
      ipv: 2015,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 1.8,
      flood: 3.6,
      drought: 9.4,
      epidemic: 5.2,
      conflictProjected: 2.6,
      conflictCurrent: 2.9
    }
  },
  GIN: {
    inflationMean: 0.14,
    inflationCrisisShare: 0,
    inflationRecent: 0.036,
    homicidePer100k: 8.52,
    ipvPast12mWomen: 0.196914,
    politicalStability: -0.73,
    conflictRisk: 36e-4,
    floodRisk: 0.1664,
    droughtRisk: 0.07,
    earthquakeRisk: 0,
    epidemicRisk: 0.78,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 5.5,
      drought: 0.7,
      epidemic: 7.8,
      conflictProjected: 3.8,
      conflictCurrent: 3.9
    }
  },
  BEN: {
    inflationMean: 0.022,
    inflationCrisisShare: 0,
    inflationRecent: 0.011,
    homicidePer100k: 1.13,
    ipvPast12mWomen: 0.09476,
    politicalStability: -0.4,
    conflictRisk: 76e-4,
    floodRisk: 0.3008,
    droughtRisk: 0.09,
    earthquakeRisk: 0,
    epidemicRisk: 0.75,
    years: {
      inflationRecent: 2025,
      homicide: 2017,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 6.7,
      drought: 0.9,
      epidemic: 7.5,
      conflictProjected: 9.6,
      conflictCurrent: 4.7
    }
  },
  BDI: {
    inflationMean: 0.105,
    inflationCrisisShare: 0,
    inflationRecent: 0.341,
    homicidePer100k: 5.65,
    ipvPast12mWomen: 0.279,
    politicalStability: -1.23,
    conflictRisk: 0.0363,
    floodRisk: 0.0176,
    droughtRisk: 0.38,
    earthquakeRisk: 0.0973,
    epidemicRisk: 0.68,
    years: {
      inflationRecent: 2025,
      homicide: 2016,
      ipv: 2017,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 4.6,
      flood: 2.6,
      drought: 3.8,
      epidemic: 6.8,
      conflictProjected: 10,
      conflictCurrent: 6.4
    }
  },
  MYS: {
    inflationMean: 0.021,
    inflationCrisisShare: 0,
    inflationRecent: 0.014,
    homicidePer100k: 0.73,
    ipvPast12mWomen: 0.02,
    politicalStability: 0.34,
    conflictRisk: 2e-4,
    floodRisk: 0.3144,
    droughtRisk: 0.31,
    earthquakeRisk: 69e-4,
    epidemicRisk: 0.59,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 1.9,
      flood: 6.8,
      drought: 3.1,
      epidemic: 5.9,
      conflictProjected: 0.9,
      conflictCurrent: 0.9
    }
  },
  VEN: {
    inflationMean: 0.727,
    inflationCrisisShare: 0.5,
    inflationRecent: 2.5195,
    homicidePer100k: 12.65,
    ipvPast12mWomen: 0.106379,
    politicalStability: -1.51,
    conflictRisk: 0.0145,
    floodRisk: 0.3008,
    droughtRisk: 0.19,
    earthquakeRisk: 0.5314,
    epidemicRisk: 0.59,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.1,
      flood: 6.7,
      drought: 1.9,
      epidemic: 5.9,
      conflictProjected: 10,
      conflictCurrent: 5.4
    }
  },
  KAZ: {
    inflationMean: 0.088,
    inflationCrisisShare: 0.065,
    inflationRecent: 0.114,
    homicidePer100k: 2.55,
    ipvPast12mWomen: 0.047048,
    politicalStability: -0.2,
    conflictRisk: 5e-4,
    floodRisk: 0.439,
    droughtRisk: 0.61,
    earthquakeRisk: 0.1756,
    epidemicRisk: 0.36,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 5.6,
      flood: 7.6,
      drought: 6.1,
      epidemic: 3.6,
      conflictProjected: 0.8,
      conflictCurrent: 1.7
    }
  },
  RWA: {
    inflationMean: 0.07,
    inflationCrisisShare: 0,
    inflationRecent: 0.059,
    homicidePer100k: 3.61,
    ipvPast12mWomen: 0.207,
    politicalStability: 0.12,
    conflictRisk: 0.0158,
    floodRisk: 0.0197,
    droughtRisk: 0.42,
    earthquakeRisk: 0.064,
    epidemicRisk: 0.63,
    years: {
      inflationRecent: 2025,
      homicide: 2020,
      ipv: 2015,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 4,
      flood: 2.7,
      drought: 4.2,
      epidemic: 6.3,
      conflictProjected: 9.3,
      conflictCurrent: 5.5
    }
  },
  ITA: {
    inflationMean: 0.02,
    inflationCrisisShare: 0,
    inflationRecent: 0.015,
    homicidePer100k: 0.57,
    ipvPast12mWomen: 0.07,
    politicalStability: 0.46,
    conflictRisk: 3e-4,
    floodRisk: 0.2746,
    droughtRisk: 0.23,
    earthquakeRisk: 0.4565,
    epidemicRisk: 0.19,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 7.7,
      flood: 6.5,
      drought: 2.3,
      epidemic: 1.9,
      conflictProjected: 0,
      conflictCurrent: 1
    }
  },
  GTM: {
    inflationMean: 0.054,
    inflationCrisisShare: 0.029,
    inflationRecent: 0.015,
    homicidePer100k: 23.37,
    ipvPast12mWomen: 0.089,
    politicalStability: -0.21,
    conflictRisk: 17e-4,
    floodRisk: 0.0741,
    droughtRisk: 0.35,
    earthquakeRisk: 0.8574,
    epidemicRisk: 0.55,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2015,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.5,
      flood: 4.2,
      drought: 3.5,
      epidemic: 5.5,
      conflictProjected: 10,
      conflictCurrent: 3.1
    }
  },
  KHM: {
    inflationMean: 0.037,
    inflationCrisisShare: 0,
    inflationRecent: 0.024,
    homicidePer100k: 1.82,
    ipvPast12mWomen: 0.109,
    politicalStability: 0.33,
    conflictRisk: 69e-4,
    floodRisk: 0.6361,
    droughtRisk: 0.42,
    earthquakeRisk: 0,
    epidemicRisk: 0.59,
    years: {
      inflationRecent: 2025,
      homicide: 2011,
      ipv: 2014,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 8.6,
      drought: 4.2,
      epidemic: 5.9,
      conflictProjected: 10,
      conflictCurrent: 4.6
    }
  },
  CAN: {
    inflationMean: 0.022,
    inflationCrisisShare: 0,
    inflationRecent: 0.021,
    homicidePer100k: 1.98,
    ipvPast12mWomen: 0.085406,
    politicalStability: 0.81,
    conflictRisk: 6e-4,
    floodRisk: 0.3579,
    droughtRisk: 0.17,
    earthquakeRisk: 0.1106,
    epidemicRisk: 0.3,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 4.8,
      flood: 7.1,
      drought: 1.7,
      epidemic: 3,
      conflictProjected: 0,
      conflictCurrent: 1.9
    }
  },
  PRK: {
    inflationMean: 0.1,
    inflationCrisisShare: 0,
    inflationRecent: 0.1,
    homicidePer100k: 4,
    ipvPast12mWomen: 0.1,
    politicalStability: 0.08,
    conflictRisk: 0.0437,
    floodRisk: 0.2746,
    droughtRisk: 0.37,
    earthquakeRisk: 0.0852,
    epidemicRisk: 0.31,
    years: {
      inflationRecent: null,
      homicide: null,
      ipv: null,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [
      "homicidePer100k",
      "inflationCrisisShare",
      "inflationMean",
      "inflationRecent",
      "ipvPast12mWomen"
    ],
    inform: {
      earthquake: 4.4,
      flood: 6.5,
      drought: 3.7,
      epidemic: 3.1,
      conflictProjected: 0.5,
      conflictCurrent: 6.6
    }
  },
  SSD: {
    inflationMean: 0.587,
    inflationCrisisShare: 0.5,
    inflationRecent: 0.914,
    homicidePer100k: 13.98,
    ipvPast12mWomen: 0.388974,
    politicalStability: -1.52,
    conflictRisk: 0.1,
    floodRisk: 0.4565,
    droughtRisk: 0.37,
    earthquakeRisk: 0.0197,
    epidemicRisk: 0.72,
    years: {
      inflationRecent: 2024,
      homicide: 2012,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 2.7,
      flood: 7.7,
      drought: 3.7,
      epidemic: 7.2,
      conflictProjected: 10,
      conflictCurrent: 7.5
    }
  },
  ESP: {
    inflationMean: 0.024,
    inflationCrisisShare: 0,
    inflationRecent: 0.027,
    homicidePer100k: 0.69,
    ipvPast12mWomen: 0.02,
    politicalStability: 0.18,
    conflictRisk: 4e-4,
    floodRisk: 0.2621,
    droughtRisk: 0.31,
    earthquakeRisk: 0.0244,
    epidemicRisk: 0.26,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 2.9,
      flood: 6.4,
      drought: 3.1,
      epidemic: 2.6,
      conflictProjected: 0,
      conflictCurrent: 1.4
    }
  },
  AUS: {
    inflationMean: 0.029,
    inflationCrisisShare: 0,
    inflationRecent: 0.029,
    homicidePer100k: 0.85,
    ipvPast12mWomen: 0.018,
    politicalStability: 0.78,
    conflictRisk: 6e-4,
    floodRisk: 0.2383,
    droughtRisk: 0.59,
    earthquakeRisk: 0,
    epidemicRisk: 0.34,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 6.2,
      drought: 5.9,
      epidemic: 3.4,
      conflictProjected: 0,
      conflictCurrent: 1.9
    }
  },
  POL: {
    inflationMean: 0.036,
    inflationCrisisShare: 0.086,
    inflationRecent: 0.038,
    homicidePer100k: 0.8,
    ipvPast12mWomen: 0.03,
    politicalStability: 0.69,
    conflictRisk: 5e-4,
    floodRisk: 0.2054,
    droughtRisk: 0.28,
    earthquakeRisk: 5e-4,
    epidemicRisk: 0.27,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.8,
      flood: 5.9,
      drought: 2.8,
      epidemic: 2.7,
      conflictProjected: 0,
      conflictCurrent: 1.7
    }
  },
  TJK: {
    inflationMean: 0.095,
    inflationCrisisShare: 0,
    inflationRecent: 0.034,
    homicidePer100k: 0.89,
    ipvPast12mWomen: 0.19,
    politicalStability: -0.3,
    conflictRisk: 13e-4,
    floodRisk: 0.2875,
    droughtRisk: 0.76,
    earthquakeRisk: 0.5314,
    epidemicRisk: 0.5,
    years: {
      inflationRecent: 2025,
      homicide: 2020,
      ipv: 2017,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.1,
      flood: 6.6,
      drought: 7.6,
      epidemic: 5,
      conflictProjected: 6.3,
      conflictCurrent: 2.8
    }
  },
  ECU: {
    inflationMean: 0.084,
    inflationCrisisShare: 0.171,
    inflationRecent: 7e-3,
    homicidePer100k: 45.72,
    ipvPast12mWomen: 0.108,
    politicalStability: -0.64,
    conflictRisk: 0.0302,
    floodRisk: 0.2746,
    droughtRisk: 0.34,
    earthquakeRisk: 0.8574,
    epidemicRisk: 0.61,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2011,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.5,
      flood: 6.5,
      drought: 3.4,
      epidemic: 6.1,
      conflictProjected: 10,
      conflictCurrent: 6.2
    }
  },
  TGO: {
    inflationMean: 0.027,
    inflationCrisisShare: 0,
    inflationRecent: 4e-3,
    homicidePer100k: 9,
    ipvPast12mWomen: 0.127,
    politicalStability: -0.85,
    conflictRisk: 83e-4,
    floodRisk: 0.027,
    droughtRisk: 0.13,
    earthquakeRisk: 0,
    epidemicRisk: 0.76,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: 2014,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 3,
      drought: 1.3,
      epidemic: 7.6,
      conflictProjected: 8.6,
      conflictCurrent: 4.8
    }
  },
  BOL: {
    inflationMean: 0.042,
    inflationCrisisShare: 0,
    inflationRecent: 0.195,
    homicidePer100k: 4.42,
    ipvPast12mWomen: 0.271,
    politicalStability: -0.16,
    conflictRisk: 1e-3,
    floodRisk: 0.1664,
    droughtRisk: 0.75,
    earthquakeRisk: 0.3732,
    epidemicRisk: 0.74,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2016,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 7.2,
      flood: 5.5,
      drought: 7.5,
      epidemic: 7.4,
      conflictProjected: 7.6,
      conflictCurrent: 2.5
    }
  },
  SLE: {
    inflationMean: 0.141,
    inflationCrisisShare: 0.056,
    inflationRecent: 0.075,
    homicidePer100k: 2.22,
    ipvPast12mWomen: 0.287,
    politicalStability: -0.39,
    conflictRisk: 7e-4,
    floodRisk: 0.1951,
    droughtRisk: 0.09,
    earthquakeRisk: 0,
    epidemicRisk: 0.77,
    years: {
      inflationRecent: 2025,
      homicide: 2020,
      ipv: 2013,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 5.8,
      drought: 0.9,
      epidemic: 7.7,
      conflictProjected: 2.6,
      conflictCurrent: 2.1
    }
  },
  HTI: {
    inflationMean: 0.14,
    inflationCrisisShare: 0,
    inflationRecent: 0.286,
    homicidePer100k: 41.15,
    ipvPast12mWomen: 0.139,
    politicalStability: -1.38,
    conflictRisk: 0.0479,
    floodRisk: 0.1038,
    droughtRisk: 0.37,
    earthquakeRisk: 0.5927,
    epidemicRisk: 0.66,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2017,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.4,
      flood: 4.7,
      drought: 3.7,
      epidemic: 6.6,
      conflictProjected: 9.5,
      conflictCurrent: 6.7
    }
  },
  PNG: {
    inflationMean: 0.058,
    inflationCrisisShare: 0,
    inflationRecent: 0.044,
    homicidePer100k: 9.34,
    ipvPast12mWomen: 0.453344,
    politicalStability: -0.55,
    conflictRisk: 23e-4,
    floodRisk: 0.25,
    droughtRisk: 0.25,
    earthquakeRisk: 0.7787,
    epidemicRisk: 0.6,
    years: {
      inflationRecent: 2025,
      homicide: 2010,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.2,
      flood: 6.3,
      drought: 2.5,
      epidemic: 6,
      conflictProjected: 9.8,
      conflictCurrent: 3.4
    }
  },
  LKA: {
    inflationMean: 0.095,
    inflationCrisisShare: 0.029,
    inflationRecent: -0.048,
    homicidePer100k: 3.31,
    ipvPast12mWomen: 0.079534,
    politicalStability: -0.04,
    conflictRisk: 12e-4,
    floodRisk: 0.0359,
    droughtRisk: 0.32,
    earthquakeRisk: 0,
    epidemicRisk: 0.5,
    years: {
      inflationRecent: 2025,
      homicide: 2019,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 3.3,
      drought: 3.2,
      epidemic: 5,
      conflictProjected: 2.1,
      conflictCurrent: 2.7
    }
  },
  CAF: {
    inflationMean: 0.038,
    inflationCrisisShare: 0,
    inflationRecent: 0.01,
    homicidePer100k: 20.12,
    ipvPast12mWomen: 0.263,
    politicalStability: -1.69,
    conflictRisk: 0.0275,
    floodRisk: 0.216,
    droughtRisk: 0.26,
    earthquakeRisk: 0,
    epidemicRisk: 0.8,
    years: {
      inflationRecent: 2025,
      homicide: 2016,
      ipv: 2006,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 6,
      drought: 2.6,
      epidemic: 8,
      conflictProjected: 10,
      conflictCurrent: 6.1
    }
  },
  JOR: {
    inflationMean: 0.03,
    inflationCrisisShare: 0,
    inflationRecent: 0.018,
    homicidePer100k: 0.99,
    ipvPast12mWomen: 0.141,
    politicalStability: -0.32,
    conflictRisk: 25e-4,
    floodRisk: 1e-4,
    droughtRisk: 0.67,
    earthquakeRisk: 0.389,
    epidemicRisk: 0.42,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 7.3,
      flood: 0.4,
      drought: 6.7,
      epidemic: 4.2,
      conflictProjected: 3.4,
      conflictCurrent: 3.5
    }
  },
  HND: {
    inflationMean: 0.063,
    inflationCrisisShare: 0,
    inflationRecent: 0.046,
    homicidePer100k: 31.44,
    ipvPast12mWomen: 0.11,
    politicalStability: -0.44,
    conflictRisk: 9e-4,
    floodRisk: 0.1575,
    droughtRisk: 0.49,
    earthquakeRisk: 0.5314,
    epidemicRisk: 0.6,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2012,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 8.1,
      flood: 5.4,
      drought: 4.9,
      epidemic: 6,
      conflictProjected: 8.9,
      conflictCurrent: 2.4
    }
  },
  KOR: {
    inflationMean: 0.025,
    inflationCrisisShare: 0,
    inflationRecent: 0.021,
    homicidePer100k: 0.48,
    ipvPast12mWomen: 0.083881,
    politicalStability: 0.92,
    conflictRisk: 28e-4,
    floodRisk: 0.3579,
    droughtRisk: 0.03,
    earthquakeRisk: 0.3285,
    epidemicRisk: 0.33,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 6.9,
      flood: 7.1,
      drought: 0.3,
      epidemic: 3.3,
      conflictProjected: 0.2,
      conflictCurrent: 3.6
    }
  },
  UKR: {
    inflationMean: 0.124,
    inflationCrisisShare: 0.156,
    inflationRecent: 0.127,
    homicidePer100k: 3.78,
    ipvPast12mWomen: 0.102,
    politicalStability: -0.33,
    conflictRisk: 1,
    floodRisk: 0.227,
    droughtRisk: 0.32,
    earthquakeRisk: 69e-4,
    epidemicRisk: 0.42,
    years: {
      inflationRecent: 2025,
      homicide: 2021,
      ipv: 2007,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 1.9,
      flood: 6.1,
      drought: 3.2,
      epidemic: 4.2,
      conflictProjected: 10,
      conflictCurrent: 10
    }
  },
  DOM: {
    inflationMean: 0.078,
    inflationCrisisShare: 0.086,
    inflationRecent: 0.039,
    homicidePer100k: 10.92,
    ipvPast12mWomen: 0.16,
    politicalStability: 0.61,
    conflictRisk: 3e-3,
    floodRisk: 0.1106,
    droughtRisk: 0.04,
    earthquakeRisk: 0.7787,
    epidemicRisk: 0.74,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: 2013,
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.2,
      flood: 4.8,
      drought: 0.4,
      epidemic: 7.4,
      conflictProjected: 0.7,
      conflictCurrent: 3.7
    }
  },
  COG: {
    inflationMean: 0.026,
    inflationCrisisShare: 0.03,
    inflationRecent: 0.024,
    homicidePer100k: 9.3,
    ipvPast12mWomen: 0.27,
    politicalStability: -0.49,
    conflictRisk: 1e-3,
    floodRisk: 0.439,
    droughtRisk: 0.09,
    earthquakeRisk: 0,
    epidemicRisk: 0.71,
    years: {
      inflationRecent: 2025,
      homicide: null,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 0.1,
      flood: 7.6,
      drought: 0.9,
      epidemic: 7.1,
      conflictProjected: 7.6,
      conflictCurrent: 2.5
    }
  },
  ISR: {
    inflationMean: 0.017,
    inflationCrisisShare: 0,
    inflationRecent: 0.03,
    homicidePer100k: 1.63,
    ipvPast12mWomen: 0.053702,
    politicalStability: -0.91,
    conflictRisk: 0.6918,
    floodRisk: 0.0138,
    droughtRisk: 0.53,
    earthquakeRisk: 0.3285,
    epidemicRisk: 0.47,
    years: {
      inflationRecent: 2025,
      homicide: 2022,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 6.9,
      flood: 2.4,
      drought: 5.3,
      epidemic: 4.7,
      conflictProjected: 10,
      conflictCurrent: 9.6
    }
  },
  CHL: {
    inflationMean: 0.038,
    inflationCrisisShare: 0,
    inflationRecent: 0.042,
    homicidePer100k: 6.35,
    ipvPast12mWomen: 0.039369,
    politicalStability: 0.17,
    conflictRisk: 2e-4,
    floodRisk: 0.1664,
    droughtRisk: 0,
    earthquakeRisk: 0.8847,
    epidemicRisk: 0.33,
    years: {
      inflationRecent: 2025,
      homicide: 2023,
      ipv: "WHO VAW\u30DD\u30FC\u30BF\u30EB\u306E\u6700\u65B0\u63A8\u5B9A\uFF0815\u301C49\u6B73\u30FB\u904E\u53BB1\u5E74\uFF09",
      politicalStability: 2025,
      inform: "Mid 2026 v0.7.3"
    },
    estimated: [],
    inform: {
      earthquake: 9.6,
      flood: 5.5,
      drought: 0,
      epidemic: 3.3,
      conflictProjected: 0.4,
      conflictCurrent: 0.8
    }
  }
};

// data/world/country_events.json
var country_events_default = [
  {
    id: "jpn_tenkin",
    iso3: [
      "JPN"
    ],
    minAge: 25,
    maxAge: 55,
    annualProb: 0.03,
    requires: "working",
    title: "\u8EE2\u52E4\u306E\u8F9E\u4EE4",
    situation: "\u4F1A\u793E\u304B\u3089\u3001\u6765\u6625\u304B\u3089\u9060\u65B9\u306E\u652F\u5E97\u306B\u7570\u52D5\u3059\u308B\u3088\u3046\u5185\u793A\u304C\u51FA\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5358\u8EAB\u8D74\u4EFB\u3059\u308B",
        desc: "\u5BB6\u65CF\u306E\u751F\u6D3B\u306F\u5909\u308F\u3089\u306A\u3044\u3002\u4E8C\u91CD\u751F\u6D3B\u3067\u51FA\u8CBB\u304C\u5897\u3048\u3001\u75B2\u308C\u3082\u305F\u307E\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 6e5
          },
          {
            type: "careerMult",
            value: 1.04
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u9031\u672B\u3054\u3068\u306B\u65B0\u5E79\u7DDA\u3067\u5E30\u308B\u751F\u6D3B\u304C\u59CB\u307E\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u65CF\u3067\u5F15\u3063\u8D8A\u3059",
        desc: "\u5BB6\u65CF\u306F\u4E00\u7DD2\u306B\u3044\u3089\u308C\u308B\u3002\u5F15\u3063\u8D8A\u3057\u8CBB\u7528\u304C\u304B\u304B\u308A\u3001\u914D\u5076\u8005\u306F\u4ED5\u4E8B\u3092\u63A2\u3057\u76F4\u3059\u3002",
        effects: [
          {
            type: "moveCost",
            value: 4e5
          },
          {
            type: "careerMult",
            value: 1.03
          }
        ],
        result: "\u5BB6\u65CF\u3067\u65B0\u3057\u3044\u8857\u306B\u79FB\u3063\u305F\u3002"
      },
      {
        id: "c",
        label: "\u8EE2\u52E4\u3092\u65AD\u308B",
        desc: "\u4ECA\u306E\u66AE\u3089\u3057\u3092\u5B88\u308C\u308B\u3002\u6607\u9032\u306E\u9053\u306F\u72ED\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.95
          }
        ],
        result: "\u7570\u52D5\u3092\u65AD\u308A\u3001\u4ECA\u306E\u90E8\u7F72\u306B\u6B8B\u3063\u305F\u3002"
      }
    ],
    basis: "\u8EE2\u52E4\u306E\u3042\u308B\u4F01\u696D\u306F\u591A\u304F\u3001\u6B63\u793E\u54E1\u306E\u7D043\u5272\u304C\u8EE2\u52E4\u3092\u7D4C\u9A13\uFF08\u52B4\u50CD\u653F\u7B56\u7814\u7A76\u30FB\u7814\u4FEE\u6A5F\u69CB\u306E\u8ABF\u67FB\uFF09\u3002\u5E74\u7387\u306F\u6982\u7B97",
    estimated: true
  },
  {
    id: "jpn_kaigo",
    iso3: [
      "JPN"
    ],
    minAge: 40,
    maxAge: 65,
    annualProb: 0.01,
    requires: "working+parentAway",
    title: "\u89AA\u306E\u4ECB\u8B77",
    situation: "\u96E2\u308C\u3066\u66AE\u3089\u3059\u89AA\u304C\u5012\u308C\u3001\u65E5\u5E38\u751F\u6D3B\u306B\u4ECB\u52A9\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4ECB\u8B77\u30B5\u30FC\u30D3\u30B9\u3092\u4F7F\u3044\u4ED5\u4E8B\u3092\u7D9A\u3051\u308B",
        desc: "\u53CE\u5165\u306F\u4FDD\u3066\u308B\u3002\u8CBB\u7528\u304C\u304B\u304B\u308A\u3001\u4F11\u65E5\u306F\u4ECB\u8B77\u306B\u8FFD\u308F\u308C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e5
          },
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u30B1\u30A2\u30DE\u30CD\u30B8\u30E3\u30FC\u3068\u76F8\u8AC7\u3057\u3001\u4ED5\u4E8B\u3068\u4ECB\u8B77\u3092\u4E21\u7ACB\u3059\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4ED5\u4E8B\u3092\u8F9E\u3081\u3066\u4ECB\u8B77\u306B\u5C02\u5FF5\u3059\u308B",
        desc: "\u89AA\u306E\u305D\u3070\u306B\u3044\u3089\u308C\u308B\u3002\u53CE\u5165\u304C\u9014\u7D76\u3048\u3001\u518D\u5C31\u8077\u306F\u96E3\u3057\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.8
          },
          {
            type: "careerMult",
            value: 0.85
          }
        ],
        result: "\u4F1A\u793E\u3092\u8F9E\u3081\u3001\u5B9F\u5BB6\u306B\u901A\u3046\u6BCE\u65E5\u306B\u306A\u3063\u305F\u3002"
      },
      {
        id: "c",
        label: "\u65BD\u8A2D\u306B\u5165\u3063\u3066\u3082\u3089\u3046",
        desc: "\u4ED5\u4E8B\u3078\u306E\u5F71\u97FF\u306F\u5C0F\u3055\u3044\u3002\u5165\u5C45\u8CBB\u7528\u306E\u8CA0\u62C5\u304C\u91CD\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 15e5
          }
        ],
        result: "\u8FD1\u304F\u306E\u65BD\u8A2D\u306B\u5165\u5C45\u3057\u3066\u3082\u3089\u3063\u305F\u3002"
      }
    ],
    basis: "\u4ECB\u8B77\u3092\u3057\u306A\u304C\u3089\u50CD\u304F\u4EBA\u306F\u7D04365\u4E07\u4EBA\u3001\u4ECB\u8B77\u306E\u305F\u3081\u306E\u96E2\u8077\u306F\u5E7410.6\u4E07\u4EBA\uFF08\u7DCF\u52D9\u7701 \u5C31\u696D\u69CB\u9020\u57FA\u672C\u8ABF\u67FB2022\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "jpn_earthquake",
    iso3: [
      "JPN"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 8e-3,
    requires: null,
    title: "\u5927\u304D\u306A\u5730\u9707",
    situation: "\u4F4F\u3093\u3067\u3044\u308B\u5730\u57DF\u3067\u9707\u5EA66\u5F31\u4EE5\u4E0A\u306E\u5730\u9707\u304C\u8D77\u304D\u305F\u3002\u5BB6\u5177\u304C\u5012\u308C\u3001\u3057\u3070\u3089\u304F\u6C34\u9053\u304C\u6B62\u307E\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u81EA\u5B85\u306B\u3068\u3069\u307E\u3063\u3066\u7247\u4ED8\u3051\u308B",
        desc: "\u4F4F\u307F\u6163\u308C\u305F\u5BB6\u306B\u3044\u3089\u308C\u308B\u3002\u4FEE\u7406\u8CBB\u304C\u304B\u304B\u308A\u3001\u4F59\u9707\u306E\u4E0D\u5B89\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u5272\u308C\u305F\u98DF\u5668\u3092\u7247\u4ED8\u3051\u3001\u7D66\u6C34\u6240\u306B\u4E26\u3076\u65E5\u3005\u304C\u7D9A\u3044\u305F\u3002"
      },
      {
        id: "b",
        label: "\u89AA\u65CF\u306E\u5BB6\u306B\u4E00\u6642\u907F\u96E3\u3059\u308B",
        desc: "\u5B89\u5168\u306B\u904E\u3054\u305B\u308B\u3002\u4ED5\u4E8B\u3092\u4F11\u3080\u3053\u3068\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          },
          {
            type: "incomeDropPct",
            value: 0.05
          }
        ],
        result: "\u3057\u3070\u3089\u304F\u89AA\u65CF\u306E\u5BB6\u3067\u904E\u3054\u3057\u305F\u3002"
      }
    ],
    basis: "\u9707\u5EA66\u5F31\u4EE5\u4E0A\u306E\u5730\u9707\u306F\u5E74\u306B\u6570\u56DE\u767A\u751F\uFF08\u6C17\u8C61\u5E81\uFF09\u30021\u4EBA\u3042\u305F\u308A\u306E\u5E74\u7387\u306F\u6982\u7B97",
    estimated: true
  },
  {
    id: "jpn_heavy_rain",
    iso3: [
      "JPN"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 1e-3,
    requires: null,
    title: "\u8C6A\u96E8\u3067\u6D78\u6C34",
    situation: "\u7DDA\u72B6\u964D\u6C34\u5E2F\u306B\u3088\u308B\u5927\u96E8\u3067\u5DDD\u304C\u3042\u3075\u308C\u3001\u81EA\u5B85\u306E1\u968E\u304C\u6D78\u6C34\u3057\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4FDD\u967A\u3068\u8CAF\u91D1\u3067\u4FEE\u7406\u3059\u308B",
        desc: "\u5143\u306E\u5BB6\u306B\u623B\u308C\u308B\u3002\u51FA\u8CBB\u304C\u5927\u304D\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 8e5
          }
        ],
        result: "\u696D\u8005\u3092\u624B\u914D\u3057\u3001\u6570\u304B\u6708\u304B\u3051\u3066\u5BB6\u3092\u76F4\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u9AD8\u53F0\u306E\u8CC3\u8CB8\u306B\u79FB\u308B",
        desc: "\u6B21\u306E\u6C34\u5BB3\u306E\u5FC3\u914D\u306F\u6E1B\u308B\u3002\u5F15\u3063\u8D8A\u3057\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 5e5
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u6D78\u6C34\u306E\u5FC3\u914D\u306E\u5C11\u306A\u3044\u5730\u57DF\u306B\u5F15\u3063\u8D8A\u3057\u305F\u3002"
      }
    ],
    basis: "2023\u5E74\u306E\u6C34\u5BB3\u306E\u88AB\u5BB3\u5EFA\u7269\u306F\u7D043.1\u4E07\u68DF\u3067\u3001\u5168\u4F4F\u5B856,505\u4E07\u6238\u306E\u7D040.05%\uFF08\u56FD\u571F\u4EA4\u901A\u7701 \u6C34\u5BB3\u7D71\u8A08\uFF09\u3002\u5927\u304D\u306A\u6C34\u5BB3\u306E\u5E74\u3082\u542B\u3081\u3066\u5E740.1%\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "jpn_seishain",
    iso3: [
      "JPN"
    ],
    minAge: 23,
    maxAge: 45,
    annualProb: 0.04,
    requires: "working+nonregular",
    title: "\u6B63\u793E\u54E1\u767B\u7528\u306E\u8A71",
    situation: "\u5951\u7D04\u793E\u54E1\u3068\u3057\u3066\u50CD\u304F\u8077\u5834\u3067\u3001\u6B63\u793E\u54E1\u767B\u7528\u8A66\u9A13\u3092\u53D7\u3051\u306A\u3044\u304B\u3068\u58F0\u3092\u304B\u3051\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u8A66\u9A13\u3092\u53D7\u3051\u308B",
        desc: "\u5B89\u5B9A\u3068\u6607\u7D66\u304C\u898B\u8FBC\u3081\u308B\u3002\u8CAC\u4EFB\u3068\u6B8B\u696D\u304C\u5897\u3048\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "careerMult",
            value: 1.06
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u8A66\u9A13\u306B\u5408\u683C\u3057\u3001\u6B63\u793E\u54E1\u306B\u306A\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4ECA\u306E\u50CD\u304D\u65B9\u3092\u7D9A\u3051\u308B",
        desc: "\u6642\u9593\u306E\u81EA\u7531\u3092\u4FDD\u3066\u308B\u3002\u8CC3\u91D1\u306F\u4E0A\u304C\u308A\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.98
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u5951\u7D04\u793E\u54E1\u306E\u307E\u307E\u50CD\u304F\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u4E0D\u672C\u610F\u975E\u6B63\u898F\u304B\u3089\u6B63\u898F\u3078\u306E\u8EE2\u63DB\u306F\u5E746.3%\uFF08\u30EA\u30AF\u30EB\u30FC\u30C8\u30EF\u30FC\u30AF\u30B9\u7814\u7A76\u6240 \u5168\u56FD\u5C31\u696D\u5B9F\u614B\u30D1\u30CD\u30EB\u8ABF\u67FB\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "jpn_chugaku_juken",
    iso3: [
      "JPN"
    ],
    minAge: 35,
    maxAge: 55,
    annualProb: 0.03,
    requires: "kid:10-12",
    title: "\u4E2D\u5B66\u53D7\u9A13",
    situation: "\u5B50\u3069\u3082\u306E\u540C\u7D1A\u751F\u306E\u591A\u304F\u304C\u587E\u306B\u901A\u3044\u306F\u3058\u3081\u3001\u4E2D\u5B66\u53D7\u9A13\u3092\u3059\u308B\u304B\u5BB6\u65CF\u3067\u8A71\u3057\u5408\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u587E\u306B\u901A\u308F\u305B\u3066\u53D7\u9A13\u3059\u308B",
        desc: "\u9078\u3079\u308B\u5B66\u6821\u304C\u5E83\u304C\u308B\u30023\u5E74\u9593\u306E\u587E\u4EE3\u304C\u91CD\u304F\u3001\u5BB6\u65CF\u306E\u6642\u9593\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 12e5
          }
        ],
        result: "\u90314\u65E5\u306E\u587E\u901A\u3044\u304C\u59CB\u307E\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5730\u5143\u306E\u516C\u7ACB\u4E2D\u5B66\u306B\u9032\u3080",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u5B50\u3069\u3082\u304C\u5468\u308A\u3068\u6BD4\u3079\u3066\u4E0D\u5B89\u3092\u53E3\u306B\u3059\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          }
        ],
        result: "\u5730\u5143\u306E\u4E2D\u5B66\u6821\u306B\u9032\u3080\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u9996\u90FD\u570F\u306E\u5C0F\u5B666\u5E74\u751F\u306E\u4E2D\u5B66\u53D7\u9A13\u7387\u306F18.1%\uFF08\u9996\u90FD\u570F\u6A21\u8A66\u30BB\u30F3\u30BF\u30FC 2026\u5E74\u5165\u8A66\uFF09\u3002\u5168\u56FD\u306F\u305D\u308C\u3088\u308A\u4F4E\u3044\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "usa_medical_bill",
    iso3: [
      "USA"
    ],
    minAge: 0,
    maxAge: 90,
    annualProb: 0.03,
    requires: null,
    title: "\u6551\u6025\u5916\u6765\u306E\u8ACB\u6C42\u66F8",
    situation: "\u6551\u6025\u5916\u6765\u3067\u6CBB\u7642\u3092\u53D7\u3051\u305F\u3042\u3068\u3001\u4FDD\u967A\u3067\u30AB\u30D0\u30FC\u3055\u308C\u306A\u3044\u9AD8\u984D\u306A\u8ACB\u6C42\u66F8\u304C\u5C4A\u3044\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5206\u5272\u6255\u3044\u3067\u652F\u6255\u3046",
        desc: "\u4FE1\u7528\u306F\u5B88\u308C\u308B\u3002\u6570\u5E74\u9593\u3001\u5BB6\u8A08\u304C\u82E6\u3057\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 4e5
          }
        ],
        result: "\u75C5\u9662\u3068\u5206\u5272\u6255\u3044\u306E\u5951\u7D04\u3092\u7D50\u3093\u3060\u3002"
      },
      {
        id: "b",
        label: "\u75C5\u9662\u3068\u4EA4\u6E09\u3057\u652F\u63F4\u5236\u5EA6\u3092\u7533\u8ACB\u3059\u308B",
        desc: "\u652F\u6255\u984D\u3092\u6E1B\u3089\u305B\u308B\u3002\u624B\u7D9A\u304D\u306B\u6642\u9593\u3092\u53D6\u3089\u308C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          },
          {
            type: "incomeDropPct",
            value: 0.03
          }
        ],
        result: "\u4F55\u5EA6\u3082\u96FB\u8A71\u3057\u3066\u6E1B\u984D\u306B\u3053\u304E\u3064\u3051\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB1\u5E74\u306B\u533B\u7642\u8CBB\u306E\u652F\u6255\u3044\u306B\u56F0\u3063\u305F\u5BB6\u65CF\u306E\u4EBA\u306F10.8%\uFF08CDC NHIS\uFF09\u3002\u6551\u6025\u5916\u6765\u306E\u9AD8\u984D\u8ACB\u6C42\u306F\u305D\u306E\u4E00\u90E8\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "usa_student_loan",
    iso3: [
      "USA"
    ],
    minAge: 18,
    maxAge: 19,
    annualProb: 0.15,
    requires: "student",
    title: "\u5927\u5B66\u9032\u5B66\u3068\u5B66\u751F\u30ED\u30FC\u30F3",
    situation: "\u5927\u5B66\u306E\u5408\u683C\u901A\u77E5\u304C\u5C4A\u3044\u305F\u3002\u5B66\u8CBB\u306F\u5E74\u306B\u6570\u4E07\u30C9\u30EB\u304B\u304B\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u5B66\u751F\u30ED\u30FC\u30F3\u30674\u5E74\u5236\u5927\u5B66\u3078",
        desc: "\u5C06\u6765\u306E\u53CE\u5165\u304C\u4F38\u3073\u3084\u3059\u3044\u3002\u5352\u696D\u6642\u306B\u5927\u304D\u306A\u501F\u91D1\u304C\u6B8B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e6
          },
          {
            type: "careerMult",
            value: 1.15
          }
        ],
        result: "\u30ED\u30FC\u30F3\u306E\u66F8\u985E\u306B\u30B5\u30A4\u30F3\u3057\u3001\u5BEE\u306B\u5165\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u30AB\u30EC\u30C3\u30B8\u304B\u3089\u7DE8\u5165\u3059\u308B",
        desc: "\u5B66\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u7DE8\u5165\u306E\u6E96\u5099\u3068\u9060\u56DE\u308A\u304C\u5FC5\u8981\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e6
          },
          {
            type: "careerMult",
            value: 1.08
          }
        ],
        result: "\u5730\u5143\u306E\u77ED\u5927\u30672\u5E74\u5B66\u3093\u3067\u304B\u3089\u7DE8\u5165\u3057\u305F\u3002"
      },
      {
        id: "c",
        label: "\u3059\u3050\u306B\u50CD\u304D\u306F\u3058\u3081\u308B",
        desc: "\u501F\u91D1\u306F\u306A\u3044\u3002\u6607\u9032\u3067\u304D\u308B\u8077\u306F\u9650\u3089\u308C\u3084\u3059\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.95
          },
          {
            type: "income",
            value: 5e5
          }
        ],
        result: "\u9AD8\u6821\u3092\u51FA\u3066\u3059\u3050\u306B\u50CD\u304D\u306F\u3058\u3081\u305F\u3002"
      }
    ],
    basis: "\u9AD8\u6821\u5352\u696D\u5F8C\u3059\u30504\u5E74\u5236\u5927\u5B66\u3078\u9032\u3080\u4EBA\u306F45%\uFF08NCES 2022\uFF09\u3001\u5B66\u90E8\u751F\u306E34%\u304C\u9023\u90A6\u5B66\u751F\u30ED\u30FC\u30F3\u3092\u501F\u308A\u308B\uFF08NPSAS 2019-20\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "usa_layoff",
    iso3: [
      "USA"
    ],
    minAge: 25,
    maxAge: 62,
    annualProb: 0.02,
    requires: "working",
    title: "\u7A81\u7136\u306E\u30EC\u30A4\u30AA\u30D5",
    situation: "\u4F1A\u793E\u306E\u696D\u7E3E\u60AA\u5316\u3067\u3001\u90E8\u7F72\u3054\u3068\u89E3\u96C7\u3055\u308C\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u3059\u3050\u306B\u5225\u306E\u4ED5\u4E8B\u306B\u5C31\u304F",
        desc: "\u53CE\u5165\u306E\u7A7A\u767D\u306F\u77ED\u3044\u3002\u6761\u4EF6\u306F\u524D\u3088\u308A\u4E0B\u304C\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.1
          },
          {
            type: "careerMult",
            value: 0.95
          }
        ],
        result: "2\u9031\u9593\u5F8C\u306B\u306F\u65B0\u3057\u3044\u8077\u5834\u3067\u50CD\u3044\u3066\u3044\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5931\u696D\u4FDD\u967A\u3092\u53D7\u3051\u306A\u304C\u3089\u63A2\u3059",
        desc: "\u6761\u4EF6\u306E\u826F\u3044\u4ED5\u4E8B\u3092\u72D9\u3048\u308B\u3002\u534A\u5E74\u307B\u3069\u53CE\u5165\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.3
          },
          {
            type: "careerMult",
            value: 1.02
          }
        ],
        result: "\u3058\u3063\u304F\u308A\u6C42\u4EBA\u3092\u63A2\u3057\u305F\u3002"
      },
      {
        id: "c",
        label: "\u4ED5\u4E8B\u306E\u591A\u3044\u5DDE\u3078\u79FB\u308B",
        desc: "\u9078\u629E\u80A2\u304C\u5E83\u304C\u308B\u3002\u5F15\u3063\u8D8A\u3057\u8CBB\u7528\u3068\u4EBA\u9593\u95A2\u4FC2\u306E\u65AD\u7D76\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 5e5
          },
          {
            type: "incomeDropPct",
            value: 0.15
          },
          {
            type: "careerMult",
            value: 1.05
          }
        ],
        result: "\u8ECA\u306B\u8377\u7269\u3092\u7A4D\u3093\u3067\u5225\u306E\u5DDE\u3078\u79FB\u3063\u305F\u3002"
      }
    ],
    basis: "\u4F1A\u793E\u306E\u9589\u9396\u3084\u4ED5\u4E8B\u306E\u6E1B\u5C11\u3067\u8077\u3092\u5931\u3063\u305F\u4EBA\u306F3\u5E74\u3067740\u4E07\u4EBA\u300120\u6B73\u4EE5\u4E0A\u306E\u5C31\u696D\u8005\u306E\u5E74\u7D041.5%\uFF08BLS Displaced Worker Survey 2023-25\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "usa_childcare",
    iso3: [
      "USA"
    ],
    minAge: 24,
    maxAge: 45,
    annualProb: 0.08,
    requires: "working+kid:0-2",
    title: "\u4FDD\u80B2\u6599\u306E\u9AD8\u3055",
    situation: "\u7523\u4F11\u304C\u660E\u3051\u305F\u304C\u3001\u8FD1\u304F\u306E\u4FDD\u80B2\u65BD\u8A2D\u306E\u6599\u91D1\u306F\u6708\u306B1,000\u30C9\u30EB\u3092\u8D85\u3048\u3066\u3044\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4FDD\u80B2\u65BD\u8A2D\u306B\u9810\u3051\u3066\u5171\u50CD\u304D\u3092\u7D9A\u3051\u308B",
        desc: "\u30AD\u30E3\u30EA\u30A2\u3092\u4FDD\u3066\u308B\u3002\u7D66\u6599\u306E\u591A\u304F\u304C\u4FDD\u80B2\u6599\u306B\u6D88\u3048\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 15e5
          },
          {
            type: "careerMult",
            value: 1.02
          }
        ],
        result: "\u5B50\u3069\u3082\u3092\u4FDD\u80B2\u65BD\u8A2D\u306B\u9810\u3051\u3066\u8077\u5834\u306B\u623B\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u7247\u65B9\u304C\u4ED5\u4E8B\u3092\u6E1B\u3089\u3059",
        desc: "\u4FDD\u80B2\u6599\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u4E16\u5E2F\u53CE\u5165\u3068\u30AD\u30E3\u30EA\u30A2\u304C\u4E0B\u304C\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.3
          },
          {
            type: "careerMult",
            value: 0.95
          }
        ],
        result: "\u30D1\u30FC\u30C8\u30BF\u30A4\u30E0\u306B\u5207\u308A\u66FF\u3048\u305F\u3002"
      }
    ],
    basis: "\u5E7C\u7A1A\u5712\u524D\u306E5\u6B73\u4EE5\u4E0B\u306E55%\u304C\u89AA\u4EE5\u5916\u306E\u4FDD\u80B2\u3092\u4F7F\u3044\u3001\u305D\u306E\u3046\u306166%\u304C\u4FDD\u80B2\u65BD\u8A2D\uFF08NCES 2023\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "usa_hurricane_wildfire",
    iso3: [
      "USA"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.013,
    requires: null,
    title: "\u30CF\u30EA\u30B1\u30FC\u30F3\u30FB\u5C71\u706B\u4E8B\u3067\u907F\u96E3",
    situation: "\u5927\u578B\u306E\u30CF\u30EA\u30B1\u30FC\u30F3\u3084\u5C71\u706B\u4E8B\u304C\u8FEB\u308A\u3001\u5730\u57DF\u306B\u907F\u96E3\u547D\u4EE4\u304C\u51FA\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u623B\u3063\u3066\u4FDD\u967A\u3067\u5BB6\u3092\u76F4\u3059",
        desc: "\u5730\u5143\u306E\u66AE\u3089\u3057\u3092\u7D9A\u3051\u3089\u308C\u308B\u3002\u4FDD\u967A\u6599\u306F\u7FCC\u5E74\u304B\u3089\u5927\u304D\u304F\u4E0A\u304C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 4e5
          }
        ],
        result: "\u4FDD\u967A\u306E\u67FB\u5B9A\u3092\u5F85\u3063\u3066\u5BB6\u3092\u4FEE\u7406\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u707D\u5BB3\u306E\u5C11\u306A\u3044\u5730\u57DF\u306B\u5F15\u3063\u8D8A\u3059",
        desc: "\u5C06\u6765\u306E\u88AB\u5BB3\u3092\u907F\u3051\u3089\u308C\u308B\u3002\u4ED5\u4E8B\u3068\u53CB\u4EBA\u3092\u5931\u3046\u3002",
        effects: [
          {
            type: "moveCost",
            value: 7e5
          },
          {
            type: "careerMult",
            value: 0.98
          }
        ],
        result: "\u5225\u306E\u5DDE\u3067\u66AE\u3089\u3057\u76F4\u3059\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u6210\u4EBA\u306E1.37%\u304C\u904E\u53BB1\u5E74\u306B\u81EA\u7136\u707D\u5BB3\u3067\u907F\u96E3\u3057\u305F\uFF08\u56FD\u52E2\u8ABF\u67FB\u5C40 Household Pulse Survey 2023\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "chn_unfinished_flat",
    iso3: [
      "CHN"
    ],
    minAge: 25,
    maxAge: 50,
    annualProb: 0.01,
    requires: "notOwner",
    title: "\u5DE5\u4E8B\u304C\u6B62\u307E\u3063\u305F\u30DE\u30F3\u30B7\u30E7\u30F3",
    situation: "\u982D\u91D1\u3092\u6255\u3063\u3066\u4E88\u7D04\u8CFC\u5165\u3057\u305F\u30DE\u30F3\u30B7\u30E7\u30F3\u306E\u5DE5\u4E8B\u304C\u3001\u958B\u767A\u4F1A\u793E\u306E\u8CC7\u91D1\u96E3\u3067\u6B62\u307E\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30ED\u30FC\u30F3\u3092\u6255\u3044\u7D9A\u3051\u5B8C\u6210\u3092\u5F85\u3064",
        desc: "\u3044\u305A\u308C\u5BB6\u304C\u624B\u306B\u5165\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002\u4ECA\u306E\u5BB6\u8CC3\u3068\u30ED\u30FC\u30F3\u306E\u4E8C\u91CD\u6255\u3044\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 8e5
          }
        ],
        result: "\u5DE5\u4E8B\u306E\u518D\u958B\u3092\u5F85\u3061\u306A\u304C\u3089\u3001\u5BB6\u8CC3\u3068\u30ED\u30FC\u30F3\u3092\u6255\u3044\u7D9A\u3051\u305F\u3002"
      },
      {
        id: "b",
        label: "\u982D\u91D1\u3092\u3042\u304D\u3089\u3081\u3066\u8CC3\u8CB8\u3092\u7D9A\u3051\u308B",
        desc: "\u6BCE\u6708\u306E\u652F\u6255\u3044\u306F\u8EFD\u304F\u306A\u308B\u3002\u8CAF\u91D1\u306E\u4E00\u90E8\u3092\u5931\u3046\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.2
          }
        ],
        result: "\u8CFC\u5165\u5951\u7D04\u3092\u6574\u7406\u3057\u3001\u8CC3\u8CB8\u66AE\u3089\u3057\u3092\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u5DE5\u4E8B\u304C\u9045\u308C\u305F\u4F4F\u5B85\u306E\u5F15\u304D\u6E21\u3057\u652F\u63F4\u306F2024\u5E74\u672B\u307E\u3067\u306B373\u4E07\u6238\u3067\u3001\u5168\u56FD\u306E\u4E16\u5E2F\u306E\u7D040.8%\uFF08\u4F4F\u623F\u548C\u57CE\u4E61\u5EFA\u8BBE\u90E8\u30FB\u56FD\u52E2\u8ABF\u67FB\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "chn_hukou_school",
    iso3: [
      "CHN"
    ],
    minAge: 25,
    maxAge: 50,
    annualProb: 0.015,
    requires: "urban+kid:5-14",
    title: "\u6238\u7C4D\u3068\u5B50\u3069\u3082\u306E\u5B66\u6821",
    situation: "\u50CD\u3044\u3066\u3044\u308B\u90FD\u5E02\u306B\u6238\u7C4D\u304C\u306A\u3044\u305F\u3081\u3001\u5B50\u3069\u3082\u304C\u5730\u5143\u306E\u516C\u7ACB\u6821\u306B\u5165\u308B\u306B\u306F\u591A\u304F\u306E\u66F8\u985E\u3068\u6761\u4EF6\u304C\u5FC5\u8981\u3060\u3068\u5206\u304B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5B50\u3069\u3082\u3092\u6545\u90F7\u306E\u7956\u7236\u6BCD\u306B\u9810\u3051\u308B",
        desc: "\u5B66\u8CBB\u306F\u5B89\u304F\u6E08\u3080\u3002\u5B50\u3069\u3082\u3068\u96E2\u308C\u3066\u66AE\u3089\u3059\u3053\u3068\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u5B50\u3069\u3082\u306F\u6545\u90F7\u306E\u7956\u7236\u6BCD\u3068\u66AE\u3089\u3057\u59CB\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u90FD\u5E02\u306E\u79C1\u7ACB\u5B66\u6821\u306B\u901A\u308F\u305B\u308B",
        desc: "\u5BB6\u65CF\u3067\u66AE\u3089\u305B\u308B\u3002\u5B66\u8CBB\u304C\u91CD\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 8e5
          }
        ],
        result: "\u79C1\u7ACB\u306E\u5C0F\u5B66\u6821\u306B\u5165\u5B66\u3055\u305B\u305F\u3002"
      },
      {
        id: "c",
        label: "\u5BB6\u65CF\u3067\u6545\u90F7\u306B\u623B\u308B",
        desc: "\u6238\u7C4D\u306E\u3042\u308B\u5730\u5143\u3067\u901A\u5B66\u3067\u304D\u308B\u3002\u53CE\u5165\u306E\u826F\u3044\u4ED5\u4E8B\u3092\u624B\u653E\u3059\u3002",
        effects: [
          {
            type: "moveCost",
            value: 2e5
          },
          {
            type: "careerMult",
            value: 0.92
          }
        ],
        result: "\u5BB6\u65CF\u3067\u6545\u90F7\u306E\u753A\u306B\u623B\u3063\u305F\u3002"
      }
    ],
    basis: "\u7FA9\u52D9\u6559\u80B2\u306E\u5B50\u306E8.4%\u304C\u6238\u7C4D\u304C\u5225\u306E\u5730\u57DF\u306B\u3042\u308B\u968F\u9077\u5B50\u5973\uFF08\u6559\u80B2\u90E8 2023\u5E74\u7D71\u8A08\u516C\u5831\uFF09\u3002\u4E00\u5EA6\u304D\u308A\u306E\u51FA\u6765\u4E8B\u3068\u3057\u306610\u5E74\u3067\u7D041\u5272\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "chn_gaokao",
    iso3: [
      "CHN"
    ],
    minAge: 17,
    maxAge: 18,
    annualProb: 0.2,
    requires: "student",
    title: "\u9AD8\u8003\u306E\u7D50\u679C",
    situation: "\u5168\u56FD\u7D71\u4E00\u306E\u5927\u5B66\u5165\u8A66\u300C\u9AD8\u8003\u300D\u306E\u70B9\u6570\u304C\u767A\u8868\u3055\u308C\u3001\u5FD7\u671B\u6821\u306B\u306F\u5C4A\u304B\u306A\u304B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "1\u5E74\u6D6A\u4EBA\u3057\u3066\u518D\u6311\u6226\u3059\u308B",
        desc: "\u4E0A\u306E\u5927\u5B66\u3092\u72D9\u3048\u308B\u30021\u5E74\u9045\u308C\u3001\u5BB6\u65CF\u306E\u8CA0\u62C5\u304C\u5897\u3048\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          },
          {
            type: "careerMult",
            value: 1.04
          }
        ],
        result: "\u5FA9\u8AAD\uFF08\u6D6A\u4EBA\uFF09\u30AF\u30E9\u30B9\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u70B9\u6570\u306B\u5408\u3046\u5927\u5B66\u30FB\u5C02\u79D1\u306B\u9032\u3080",
        desc: "\u65E9\u304F\u793E\u4F1A\u306B\u51FA\u3089\u308C\u308B\u3002\u5E0C\u671B\u306E\u5206\u91CE\u3067\u306F\u306A\u3044\u304B\u3082\u3057\u308C\u306A\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          },
          {
            type: "cost",
            value: 5e4
          }
        ],
        result: "\u70B9\u6570\u3067\u5165\u308C\u308B\u5B66\u6821\u306B\u9032\u5B66\u3057\u305F\u3002"
      }
    ],
    basis: "\u9AD8\u8003\u53D7\u9A13\u80051,291\u4E07\u4EBA\u306B\u5BFE\u30574\u5E74\u5236\u5927\u5B66\uFF08\u672C\u79D1\uFF09\u306E\u5B9A\u54E1\u306F\u7D04478\u4E07\u4EBA\u306737%\uFF08\u6559\u80B2\u90E8 2023\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "chn_996",
    iso3: [
      "CHN"
    ],
    minAge: 22,
    maxAge: 40,
    annualProb: 0.05,
    requires: "urban+working",
    title: "\u9577\u6642\u9593\u52B4\u50CD\u306E\u8077\u5834",
    situation: "\u52E4\u3081\u5148\u3067\u3001\u671D9\u6642\u304B\u3089\u591C9\u6642\u307E\u3067\u90316\u65E5\u50CD\u304F\u3053\u3068\u304C\u5F53\u305F\u308A\u524D\u306B\u306A\u3063\u3066\u304D\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u53D7\u3051\u5165\u308C\u3066\u50CD\u304D\u7D9A\u3051\u308B",
        desc: "\u8A55\u4FA1\u3068\u53CE\u5165\u304C\u4E0A\u304C\u308B\u3002\u4F53\u3092\u58CA\u3057\u3084\u3059\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 1.05
          },
          {
            type: "health",
            value: 1.04
          }
        ],
        result: "\u591C\u9045\u304F\u307E\u3067\u50CD\u304F\u65E5\u3005\u304C\u7D9A\u3044\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6B8B\u696D\u306E\u5C11\u306A\u3044\u4F1A\u793E\u306B\u79FB\u308B",
        desc: "\u4F53\u3068\u5BB6\u5EAD\u306E\u6642\u9593\u3092\u5B88\u308C\u308B\u3002\u7D66\u6599\u306F\u4E0B\u304C\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.95
          },
          {
            type: "health",
            value: 0.98
          }
        ],
        result: "\u5B9A\u6642\u306B\u5E30\u308C\u308B\u4F1A\u793E\u306B\u8EE2\u8077\u3057\u305F\u3002"
      }
    ],
    basis: "IT\u4F01\u696D\u306A\u3069\u306E\u300C996\u300D\u52E4\u52D9\u304C\u793E\u4F1A\u554F\u984C\u5316\uFF082019\u5E74\u4EE5\u964D\u306E\u5831\u9053\uFF09",
    estimated: true
  },
  {
    id: "chn_flood",
    iso3: [
      "CHN"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.02,
    requires: "rural",
    title: "\u590F\u306E\u5927\u96E8\u3068\u6D2A\u6C34",
    situation: "\u590F\u306E\u8C6A\u96E8\u3067\u5DDD\u304C\u5897\u6C34\u3057\u3001\u6751\u306E\u7530\u7551\u3068\u5BB6\u304C\u6C34\u306B\u3064\u304B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6751\u306B\u6B8B\u3063\u3066\u5FA9\u65E7\u3059\u308B",
        desc: "\u571F\u5730\u3068\u5BB6\u3092\u5B88\u308C\u308B\u3002\u4ECA\u5E74\u306E\u53CE\u5165\u306F\u5927\u304D\u304F\u6E1B\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.3
          },
          {
            type: "cost",
            value: 1e5
          }
        ],
        result: "\u6C34\u304C\u5F15\u3044\u305F\u3042\u3068\u3001\u6CE5\u3092\u304B\u304D\u51FA\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u753A\u306E\u5DE5\u5834\u306B\u51FA\u7A3C\u304E\u306B\u884C\u304F",
        desc: "\u73FE\u91D1\u53CE\u5165\u304C\u5F97\u3089\u308C\u308B\u3002\u5BB6\u65CF\u3068\u96E2\u308C\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 1e5
          },
          {
            type: "careerMult",
            value: 1.03
          }
        ],
        result: "\u753A\u306E\u5DE5\u5834\u3067\u50CD\u304F\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB10\u5E74\u306E\u5E74\u5E73\u5747\u306E\u88AB\u707D\u4EBA\u53E3\u306F\u7D046,200\u4E07\u4EBA\u3067\u8FB2\u6751\u4EBA\u53E3\u306E13%\uFF08\u5FDC\u6025\u7BA1\u7406\u90E8\uFF09\u3002\u8EFD\u3044\u5F71\u97FF\u3084\u307B\u304B\u306E\u707D\u5BB3\u3082\u542B\u3080\u6570\u3048\u65B9\u306A\u306E\u3067\u3001\u5BB6\u304C\u6C34\u306B\u3064\u304B\u308B\u5834\u9762\u3068\u3057\u3066\u5E742%\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ind_monsoon_flood",
    iso3: [
      "IND"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.02,
    requires: null,
    title: "\u30E2\u30F3\u30B9\u30FC\u30F3\u306E\u6D2A\u6C34",
    situation: "\u30E2\u30F3\u30B9\u30FC\u30F3\u306E\u5927\u96E8\u3067\u8FD1\u304F\u306E\u5DDD\u304C\u3042\u3075\u308C\u3001\u5BB6\u306E\u4E2D\u307E\u3067\u6C34\u304C\u5165\u3063\u3066\u304D\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5BB6\u306B\u3068\u3069\u307E\u308B",
        desc: "\u5BB6\u8CA1\u3092\u898B\u5F35\u308C\u308B\u3002\u4E0D\u885B\u751F\u306A\u6C34\u3067\u4F53\u8ABF\u3092\u5D29\u3057\u3084\u3059\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          },
          {
            type: "health",
            value: 1.05
          }
        ],
        result: "\u6C34\u304C\u5F15\u304F\u307E\u30672\u968E\u3067\u904E\u3054\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u89AA\u621A\u306E\u6751\u3078\u4E00\u6642\u907F\u96E3\u3059\u308B",
        desc: "\u5B89\u5168\u306B\u904E\u3054\u305B\u308B\u3002\u305D\u306E\u9593\u306F\u50CD\u3051\u306A\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 5e4
          },
          {
            type: "incomeDropPct",
            value: 0.1
          }
        ],
        result: "\u89AA\u621A\u306E\u5BB6\u306B\u8EAB\u3092\u5BC4\u305B\u305F\u3002"
      }
    ],
    basis: "\u6D2A\u6C34\u306E\u88AB\u707D\u4EBA\u53E3\u306F\u5E74\u5E73\u5747\u7D043,234\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E2.3%\uFF08\u4E2D\u592E\u6C34\u59D4\u54E1\u4F1A\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ind_entrance_exam",
    iso3: [
      "IND"
    ],
    minAge: 16,
    maxAge: 18,
    annualProb: 0.07,
    requires: "student",
    title: "\u5DE5\u5B66\u30FB\u533B\u5B66\u90E8\u306E\u5165\u8A66\u6E96\u5099",
    situation: "\u5468\u308A\u306E\u591A\u304F\u304C\u5DE5\u5B66\u7CFB\u5165\u8A66\uFF08JEE\uFF09\u3084\u533B\u5B66\u90E8\u5165\u8A66\uFF08NEET\uFF09\u306E\u4E88\u5099\u6821\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4E88\u5099\u6821\u306E\u753A\u306B\u4E0B\u5BBF\u3057\u3066\u6E96\u5099\u3059\u308B",
        desc: "\u96E3\u95A2\u6821\u3092\u72D9\u3048\u308B\u3002\u8CBB\u7528\u304C\u5927\u304D\u304F\u3001\u91CD\u5727\u3082\u5F37\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 6e5
          },
          {
            type: "careerMult",
            value: 1.08
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u30B3\u30BF\u306E\u4E88\u5099\u6821\u306B\u5165\u308A\u3001\u4E0B\u5BBF\u751F\u6D3B\u3092\u59CB\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5730\u5143\u306E\u5927\u5B66\u306B\u9032\u3080",
        desc: "\u5BB6\u65CF\u306E\u8CA0\u62C5\u306F\u8EFD\u3044\u3002\u5C31\u8077\u5148\u306E\u9078\u629E\u80A2\u306F\u9650\u3089\u308C\u3084\u3059\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 1
          }
        ],
        result: "\u5730\u5143\u306E\u5927\u5B66\u306B\u9032\u5B66\u3057\u305F\u3002"
      }
    ],
    basis: "JEE Main\u30FBNEET \u306E\u53D7\u9A13\u8005\u306F12\u5E74\u751F\u306E\u7D042\u5272\uFF08NTA\u30FBUDISE+\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ind_wedding_cost",
    iso3: [
      "IND"
    ],
    minAge: 20,
    maxAge: 35,
    annualProb: 0.08,
    requires: "newlywed",
    title: "\u7D50\u5A5A\u5F0F\u306E\u8CBB\u7528",
    situation: "\u7D50\u5A5A\u304C\u6C7A\u307E\u308A\u3001\u89AA\u65CF\u304B\u3089\u76DB\u5927\u306A\u5F0F\u3092\u6319\u3052\u308B\u3088\u3046\u671F\u5F85\u3055\u308C\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u89AA\u65CF\u306E\u671F\u5F85\u3069\u304A\u308A\u76DB\u5927\u306B\u6319\u3052\u308B",
        desc: "\u5BB6\u540C\u58EB\u306E\u95A2\u4FC2\u304C\u826F\u304F\u306A\u308B\u3002\u501F\u91D1\u3092\u3059\u308B\u5BB6\u5EAD\u3082\u591A\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 15e5
          }
        ],
        result: "\u6570\u767E\u4EBA\u3092\u62DB\u3044\u30663\u65E5\u9593\u306E\u5F0F\u3092\u6319\u3052\u305F\u3002"
      },
      {
        id: "b",
        label: "\u7C21\u7D20\u306A\u5F0F\u306B\u3059\u308B",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u89AA\u65CF\u306E\u4E00\u90E8\u304B\u3089\u4E0D\u6E80\u304C\u51FA\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          }
        ],
        result: "\u8FD1\u3057\u3044\u4EBA\u3060\u3051\u3067\u5F0F\u3092\u6319\u3052\u305F\u3002"
      }
    ],
    basis: "\u7D50\u5A5A\u5F0F\u8CBB\u7528\u306F\u5E74\u53CE\u306E\u6570\u500D\u306B\u306A\u308B\u3053\u3068\u3082\u591A\u3044\uFF08\u696D\u754C\u63A8\u8A08\u30FB\u5831\u9053\uFF09",
    estimated: true
  },
  {
    id: "ind_gulf_work",
    iso3: [
      "IND"
    ],
    minAge: 20,
    maxAge: 45,
    annualProb: 3e-3,
    requires: "working",
    title: "\u6E7E\u5CB8\u8AF8\u56FD\u3078\u306E\u51FA\u7A3C\u304E",
    situation: "\u77E5\u4EBA\u304B\u3089\u3001\u30C9\u30D0\u30A4\u306E\u5EFA\u8A2D\u73FE\u5834\u306E\u4ED5\u4E8B\u3092\u7D39\u4ECB\u3059\u308B\u3068\u6301\u3061\u304B\u3051\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4EF2\u4ECB\u6599\u3092\u6255\u3063\u3066\u51FA\u7A3C\u304E\u306B\u884C\u304F",
        desc: "\u53CE\u5165\u306F\u6570\u500D\u306B\u306A\u308B\u3002\u5BB6\u65CF\u3068\u96E2\u308C\u3001\u6691\u3055\u306E\u4E2D\u3067\u306E\u91CD\u52B4\u50CD\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          },
          {
            type: "careerMult",
            value: 1.15
          },
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "2\u5E74\u5951\u7D04\u3067\u30C9\u30D0\u30A4\u306B\u6E21\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u65CF\u306E\u305D\u3070\u306B\u6B8B\u308B",
        desc: "\u5BB6\u65CF\u3068\u66AE\u3089\u305B\u308B\u3002\u53CE\u5165\u306F\u4F38\u3073\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u5730\u5143\u3067\u50CD\u304D\u7D9A\u3051\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u6E7E\u5CB8\u306A\u3069\u3078\u306E\u51FA\u56FD\u8A31\u53EF\u306F\u5E7439.8\u4E07\u4EBA\uFF08\u5916\u52D9\u7701 2023\u5E74\uFF09\u300220\u301C45\u6B73\u306E\u5C31\u696D\u8005\u7D043\u5104\u4EBA\u306E\u7D040.13%\u3002\u8A98\u3044\u306E\u5834\u9762\u306A\u306E\u3067\u305D\u306E2\u500D\u307B\u3069\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ind_crop_failure",
    iso3: [
      "IND"
    ],
    minAge: 18,
    maxAge: 70,
    annualProb: 0.06,
    requires: "rural",
    title: "\u96E8\u4E0D\u8DB3\u3067\u4E0D\u4F5C",
    situation: "\u30E2\u30F3\u30B9\u30FC\u30F3\u306E\u96E8\u304C\u5C11\u306A\u304F\u3001\u80B2\u3066\u3066\u3044\u305F\u4F5C\u7269\u306E\u53CE\u7A6B\u304C\u5927\u304D\u304F\u6E1B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u91D1\u8CB8\u3057\u304B\u3089\u501F\u308A\u3066\u6B21\u306E\u4F5C\u4ED8\u3051\u3092\u3059\u308B",
        desc: "\u7551\u3092\u7D9A\u3051\u3089\u308C\u308B\u3002\u9AD8\u3044\u5229\u606F\u3092\u6255\u3046\u3053\u3068\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          }
        ],
        result: "\u5229\u606F\u306E\u9AD8\u3044\u501F\u91D1\u3092\u3057\u3066\u7A2E\u3068\u80A5\u6599\u3092\u8CB7\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u753A\u306E\u5EFA\u8A2D\u73FE\u5834\u3067\u65E5\u96C7\u3044\u3067\u50CD\u304F",
        desc: "\u73FE\u91D1\u53CE\u5165\u304C\u5165\u308B\u3002\u7551\u306E\u624B\u5165\u308C\u304C\u3067\u304D\u306A\u3044\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.2
          },
          {
            type: "careerMult",
            value: 1.01
          }
        ],
        result: "\u53CE\u7A6B\u671F\u307E\u3067\u753A\u3067\u50CD\u3044\u305F\u3002"
      }
    ],
    basis: "\u30A4\u30F3\u30C9\u306E\u8FB2\u5730\u306E\u7D04\u534A\u5206\u306F\u5929\u6C34\u8FB2\u696D\uFF08\u8FB2\u696D\u30FB\u8FB2\u6C11\u798F\u7949\u7701\uFF09",
    estimated: true
  },
  {
    id: "ind_private_hospital",
    iso3: [
      "IND"
    ],
    minAge: 0,
    maxAge: 90,
    annualProb: 0.03,
    requires: null,
    title: "\u5BB6\u65CF\u306E\u5165\u9662",
    situation: "\u5BB6\u65CF\u304C\u5165\u9662\u3059\u308B\u3053\u3068\u306B\u306A\u308A\u3001\u516C\u7ACB\u75C5\u9662\u3068\u79C1\u7ACB\u75C5\u9662\u306E\u3069\u3061\u3089\u306B\u3059\u308B\u304B\u8FF7\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u79C1\u7ACB\u75C5\u9662\u306B\u5165\u9662\u3059\u308B",
        desc: "\u3059\u3050\u306B\u6CBB\u7642\u304C\u53D7\u3051\u3089\u308C\u308B\u3002\u8CBB\u7528\u304C\u9AD8\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          },
          {
            type: "health",
            value: 0.96
          }
        ],
        result: "\u79C1\u7ACB\u75C5\u9662\u3067\u624B\u8853\u3092\u53D7\u3051\u305F\u3002"
      },
      {
        id: "b",
        label: "\u516C\u7ACB\u75C5\u9662\u3067\u9806\u756A\u3092\u5F85\u3064",
        desc: "\u8CBB\u7528\u306F\u307B\u3068\u3093\u3069\u304B\u304B\u3089\u306A\u3044\u3002\u5F85\u3061\u6642\u9593\u304C\u9577\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 1.04
          }
        ],
        result: "\u6DF7\u96D1\u3059\u308B\u516C\u7ACB\u75C5\u9662\u3067\u9806\u756A\u3092\u5F85\u3063\u305F\u3002"
      }
    ],
    basis: "1\u5E74\u306B\u4EBA\u53E3\u306E2.9%\u304C\u5165\u9662\u3057\u3001\u305D\u306E65%\u304C\u79C1\u7ACB\u75C5\u9662\uFF08NSS 75th round 2017-18\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "nga_fuel_price",
    iso3: [
      "NGA"
    ],
    minAge: 18,
    maxAge: 70,
    annualProb: 0.1,
    requires: "working",
    title: "\u30AC\u30BD\u30EA\u30F3\u4EE3\u306E\u9AD8\u9A30",
    situation: "\u71C3\u6599\u88DC\u52A9\u91D1\u304C\u6253\u3061\u5207\u3089\u308C\u3001\u30AC\u30BD\u30EA\u30F3\u3068\u4EA4\u901A\u8CBB\u304C\u4E00\u6C17\u306B\u5024\u4E0A\u304C\u308A\u3057\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30D0\u30A4\u30AF\u901A\u52E4\u3092\u3084\u3081\u3066\u6B69\u304F",
        desc: "\u51FA\u8CBB\u306F\u6291\u3048\u3089\u308C\u308B\u3002\u901A\u52E4\u306B\u6642\u9593\u304C\u304B\u304B\u308A\u3001\u4ED5\u4E8B\u306B\u97FF\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "careerMult",
            value: 0.98
          }
        ],
        result: "1\u6642\u9593\u6B69\u3044\u3066\u901A\u3046\u3053\u3068\u306B\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4E57\u308A\u5408\u3044\u30D0\u30B9\u3092\u4F7F\u3044\u7D9A\u3051\u308B",
        desc: "\u4ED5\u4E8B\u306F\u7D9A\u3051\u3084\u3059\u3044\u3002\u4EA4\u901A\u8CBB\u304C\u5BB6\u8A08\u3092\u5727\u8FEB\u3059\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          }
        ],
        result: "\u98DF\u8CBB\u3092\u524A\u3063\u3066\u4EA4\u901A\u8CBB\u306B\u56DE\u3057\u305F\u3002"
      }
    ],
    basis: "\u71C3\u6599\u88DC\u52A9\u91D1\u306E\u6253\u3061\u5207\u308A\u306A\u3069\u3067\u3001\u30AC\u30BD\u30EA\u30F3\u4FA1\u683C\u304C1\u5E74\u306B5\u5272\u4EE5\u4E0A\u4E0A\u304C\u3063\u305F\u5E74\u304C20\u5E74\u3067\u5C11\u306A\u304F\u3068\u30823\u56DE\uFF082016\u30FB2023\u30FB2024\u5E74\u3001NBS \u307B\u304B\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "nga_naira_drop",
    iso3: [
      "NGA"
    ],
    minAge: 20,
    maxAge: 80,
    annualProb: 0.04,
    requires: null,
    title: "\u30CA\u30A4\u30E9\u306E\u6025\u843D",
    situation: "\u70BA\u66FF\u306E\u81EA\u7531\u5316\u3067\u30CA\u30A4\u30E9\u304C\u6025\u843D\u3057\u3001\u8F38\u5165\u54C1\u3092\u4E2D\u5FC3\u306B\u7269\u4FA1\u304C\u4E0A\u304C\u308A\u7D9A\u3051\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u30CA\u30A4\u30E9\u306E\u307E\u307E\u8CAF\u91D1\u3092\u6301\u3064",
        desc: "\u624B\u9593\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u8CAF\u91D1\u306E\u4FA1\u5024\u304C\u5927\u304D\u304F\u76EE\u6E1B\u308A\u3059\u308B\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.3
          }
        ],
        result: "\u9280\u884C\u306E\u9810\u91D1\u3067\u8CB7\u3048\u308B\u7269\u304C\u3069\u3093\u3069\u3093\u6E1B\u3063\u3066\u3044\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u624B\u6570\u6599\u3092\u6255\u3063\u3066\u30C9\u30EB\u306B\u66FF\u3048\u308B",
        desc: "\u8CAF\u91D1\u306E\u4FA1\u5024\u3092\u5B88\u308C\u308B\u3002\u4E21\u66FF\u306E\u624B\u6570\u6599\u3068\u624B\u9593\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "protectCash",
            value: true
          }
        ],
        result: "\u8CAF\u91D1\u306E\u4E00\u90E8\u3092\u7C73\u30C9\u30EB\u306B\u66FF\u3048\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB30\u5E74\u306E\u3046\u30615\u5E74\u3067\u30CA\u30A4\u30E9\u304C1\u5E74\u306B30%\u4EE5\u4E0A\u4E0B\u843D\uFF08\u4E2D\u592E\u9280\u884C\u30FBIMF\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "nga_generator",
    iso3: [
      "NGA"
    ],
    minAge: 18,
    maxAge: 80,
    annualProb: 0.02,
    requires: "urban",
    title: "\u505C\u96FB\u3068\u767A\u96FB\u6A5F",
    situation: "\u9001\u96FB\u7DB2\u306E\u505C\u96FB\u304C\u7D9A\u304D\u30011\u65E5\u306B\u6570\u6642\u9593\u3057\u304B\u96FB\u6C17\u304C\u6765\u306A\u3044\u3002",
    options: [
      {
        id: "a",
        label: "\u767A\u96FB\u6A5F\u3092\u8CB7\u3046",
        desc: "\u4ED5\u4E8B\u3084\u52C9\u5F37\u3092\u7D9A\u3051\u3089\u308C\u308B\u3002\u71C3\u6599\u4EE3\u304C\u304B\u3055\u3080\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 1.02
          }
        ],
        result: "\u5C0F\u3055\u306A\u767A\u96FB\u6A5F\u3092\u8CB7\u3063\u3066\u5E97\u306E\u96FB\u6C17\u3092\u307E\u304B\u306A\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u505C\u96FB\u306B\u5408\u308F\u305B\u3066\u66AE\u3089\u3059",
        desc: "\u51FA\u8CBB\u306F\u306A\u3044\u3002\u4ED5\u4E8B\u306E\u52B9\u7387\u304C\u843D\u3061\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.98
          }
        ],
        result: "\u96FB\u6C17\u304C\u6765\u308B\u6642\u9593\u306B\u5408\u308F\u305B\u3066\u52D5\u304F\u3088\u3046\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u90FD\u5E02\u306E\u4E16\u5E2F\u306E52%\u304C\u81EA\u5BB6\u7528\u767A\u96FB\u6A5F\u3092\u6301\u3064\uFF08\u4E16\u754C\u9280\u884C LSMS 2018-19\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "nga_japa",
    iso3: [
      "NGA"
    ],
    minAge: 22,
    maxAge: 40,
    annualProb: 5e-3,
    requires: "working",
    title: "\u6D77\u5916\u79FB\u4F4F\uFF08\u30B8\u30E3\u30D1\uFF09",
    situation: "\u540C\u50DA\u304C\u6B21\u3005\u3068\u82F1\u56FD\u3084\u30AB\u30CA\u30C0\u306B\u79FB\u4F4F\u3057\u3001\u81EA\u5206\u3082\u5C31\u52B4\u30D3\u30B6\u3092\u53D6\u308B\u304B\u8003\u3048\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u8CAF\u91D1\u3092\u306F\u305F\u3044\u3066\u79FB\u4F4F\u3059\u308B",
        desc: "\u53CE\u5165\u3068\u751F\u6D3B\u306E\u5B89\u5B9A\u304C\u898B\u8FBC\u3081\u308B\u3002\u8CBB\u7528\u304C\u5927\u304D\u304F\u3001\u5BB6\u65CF\u3068\u96E2\u308C\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 15e5
          },
          {
            type: "careerMult",
            value: 1.3
          }
        ],
        result: "\u30D3\u30B6\u304C\u4E0B\u308A\u3001\u82F1\u56FD\u306E\u75C5\u9662\u3067\u50CD\u304F\u3053\u3068\u306B\u306A\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u56FD\u5185\u3067\u50CD\u304D\u7D9A\u3051\u308B",
        desc: "\u5BB6\u65CF\u3084\u53CB\u4EBA\u3068\u66AE\u3089\u305B\u308B\u3002\u7269\u4FA1\u9AD8\u306E\u4E2D\u3067\u53CE\u5165\u306F\u4F38\u3073\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u30E9\u30B4\u30B9\u3067\u306E\u4ED5\u4E8B\u3092\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u82F1\u56FD\u306E\u5C31\u52B4\u30FB\u4ECB\u8B77\u30FB\u7559\u5B66\u30D3\u30B6\u306F\u5E74\u7D047\u4E07\u4EF6\uFF08Home Office 2022\u301C23\u5E74\uFF09\u3001\u30AB\u30CA\u30C0\u306E\u7559\u5B66\u8A31\u53EF\u306F\u5E74\u7D043.3\u4E07\u4EF6\uFF08IRCC 2023\u5E74\uFF09\u300220\u301C39\u6B736,526\u4E07\u4EBA\u306E\u5E740.2%\u524D\u5F8C\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "nga_asuu_strike",
    iso3: [
      "NGA"
    ],
    minAge: 18,
    maxAge: 24,
    annualProb: 0.2,
    requires: "inUniv",
    title: "\u5927\u5B66\u6559\u54E1\u306E\u30B9\u30C8\u30E9\u30A4\u30AD",
    situation: "\u56FD\u7ACB\u5927\u5B66\u306E\u6559\u54E1\u7D44\u5408\u304C\u30B9\u30C8\u30E9\u30A4\u30AD\u306B\u5165\u308A\u3001\u6388\u696D\u304C\u4F55\u304B\u6708\u3082\u6B62\u307E\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u518D\u958B\u3092\u5F85\u3064",
        desc: "\u5B66\u8CBB\u306F\u5B89\u3044\u307E\u307E\u3002\u5352\u696D\u304C\u9045\u308C\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.97
          }
        ],
        result: "8\u304B\u6708\u5F8C\u306B\u6388\u696D\u304C\u518D\u958B\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u79C1\u7ACB\u5927\u5B66\u306B\u79FB\u308B",
        desc: "\u4E88\u5B9A\u3069\u304A\u308A\u5352\u696D\u3067\u304D\u308B\u3002\u5B66\u8CBB\u304C\u5927\u304D\u304F\u4E0A\u304C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 8e5
          },
          {
            type: "careerMult",
            value: 1.01
          }
        ],
        result: "\u79C1\u7ACB\u5927\u5B66\u306B\u7DE8\u5165\u3057\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB20\u5E74\u306E\u3046\u306110\u5E74\u3067\u5927\u5B66\u6559\u54E1\u7D44\u5408\u306E\u30B9\u30C8\u30E9\u30A4\u30AD\u304C\u3042\u3063\u305F\uFF08\u4E8C\u6B21\u60C5\u5831\uFF09\u3002\u5728\u5B66\u4E2D\u306B\u4E00\u5EA6\u306F\u307B\u307C\u5FC5\u305A\u51FA\u4F1A\u3046\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "pak_flood",
    iso3: [
      "PAK"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.02,
    requires: "rural",
    title: "\u5927\u6D2A\u6C34",
    situation: "\u8A18\u9332\u7684\u306A\u96E8\u3067\u6751\u4E00\u5E2F\u304C\u6C34\u306B\u3064\u304B\u308A\u3001\u5BB6\u755C\u3068\u7551\u304C\u6D41\u3055\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u907F\u96E3\u30AD\u30E3\u30F3\u30D7\u306B\u8EAB\u3092\u5BC4\u305B\u308B",
        desc: "\u5B89\u5168\u3068\u98DF\u6599\u3092\u5F97\u3089\u308C\u308B\u3002\u885B\u751F\u72B6\u614B\u304C\u60AA\u3044\u3002",
        effects: [
          {
            type: "health",
            value: 1.05
          },
          {
            type: "incomeDropPct",
            value: 0.3
          }
        ],
        result: "\u9053\u8DEF\u6CBF\u3044\u306E\u30C6\u30F3\u30C8\u3067\u6570\u304B\u6708\u3092\u904E\u3054\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u90FD\u5E02\u306E\u89AA\u621A\u3092\u983C\u3063\u3066\u79FB\u308B",
        desc: "\u4ED5\u4E8B\u3092\u63A2\u305B\u308B\u3002\u6751\u306E\u571F\u5730\u3092\u96E2\u308C\u308B\u3053\u3068\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 1.02
          }
        ],
        result: "\u30AB\u30E9\u30C1\u306E\u89AA\u621A\u306E\u5BB6\u306B\u79FB\u3063\u305F\u3002"
      }
    ],
    basis: "\u6D2A\u6C34\u306E\u88AB\u707D\u8005\u306F2010\u5E742,025\u4E07\u4EBA\u30012022\u5E743,300\u4E07\u4EBA\u306A\u3069\u3001\u5E74\u5E73\u5747\u7D04460\u4E07\u4EBA\u3067\u8FB2\u6751\u4EBA\u53E3\u306E\u7D043%\uFF08NDMA\u30FB2023\u5E74\u56FD\u52E2\u8ABF\u67FB\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "pak_inflation",
    iso3: [
      "PAK"
    ],
    minAge: 18,
    maxAge: 80,
    annualProb: 0.04,
    requires: null,
    title: "\u7269\u4FA1\u306E\u6025\u4E0A\u6607",
    situation: "\u30EB\u30D4\u30FC\u304C\u4E0B\u843D\u3057\u3001\u5C0F\u9EA6\u7C89\u3084\u96FB\u6C17\u4EE3\u306A\u3069\u306E\u5024\u6BB5\u304C1\u5E74\u30673\u5272\u8FD1\u304F\u4E0A\u304C\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u73FE\u91D1\u3067\u6301\u3061\u7D9A\u3051\u308B",
        desc: "\u4F7F\u3044\u3084\u3059\u3044\u3002\u8CAF\u91D1\u306E\u4FA1\u5024\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.25
          }
        ],
        result: "\u540C\u3058\u304A\u91D1\u3067\u8CB7\u3048\u308B\u5C0F\u9EA6\u7C89\u304C\u76EE\u306B\u898B\u3048\u3066\u6E1B\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u91D1\uFF08\u30B4\u30FC\u30EB\u30C9\uFF09\u306B\u66FF\u3048\u308B",
        desc: "\u4FA1\u5024\u3092\u5B88\u308A\u3084\u3059\u3044\u3002\u58F2\u308B\u3068\u304D\u306B\u624B\u9593\u3068\u5DEE\u984D\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          },
          {
            type: "protectCash",
            value: true
          }
        ],
        result: "\u8CAF\u91D1\u306E\u4E00\u90E8\u3067\u91D1\u306E\u88C5\u8EAB\u5177\u3092\u8CB7\u3063\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB30\u5E74\u306E\u3046\u30613\u5E74\u3067\u7269\u4FA1\u4E0A\u6607\u7387\u304C\u5E7420%\u3092\u8D85\u3048\u305F\uFF08\u4E16\u754C\u9280\u884C WDI\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "pak_electricity_bill",
    iso3: [
      "PAK"
    ],
    minAge: 20,
    maxAge: 80,
    annualProb: 0.06,
    requires: "urban",
    title: "\u96FB\u6C17\u4EE3\u306E\u8ACB\u6C42\u984D",
    situation: "\u6599\u91D1\u6539\u5B9A\u3067\u3001\u6BCE\u6708\u306E\u96FB\u6C17\u4EE3\u304C\u53CE\u5165\u306E1\u5272\u3092\u8D85\u3048\u308B\u307B\u3069\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u592A\u967D\u5149\u30D1\u30CD\u30EB\u3092\u4ED8\u3051\u308B",
        desc: "\u9577\u3044\u76EE\u3067\u898B\u308C\u3070\u96FB\u6C17\u4EE3\u304C\u4E0B\u304C\u308B\u3002\u521D\u671F\u8CBB\u7528\u304C\u5927\u304D\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 25e4
          },
          {
            type: "careerMult",
            value: 1
          }
        ],
        result: "\u5C4B\u6839\u306B\u592A\u967D\u5149\u30D1\u30CD\u30EB\u3092\u4ED8\u3051\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6247\u98A8\u6A5F\u3060\u3051\u3067\u590F\u3092\u904E\u3054\u3059",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u731B\u6691\u3067\u4F53\u304C\u3064\u3089\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u30A8\u30A2\u30B3\u30F3\u3092\u6B62\u3081\u3066\u590F\u3092\u904E\u3054\u3057\u305F\u3002"
      }
    ],
    basis: "2023\u5E74\u306B\u96FB\u6C17\u6599\u91D1\u306E\u5024\u4E0A\u3052\u3078\u306E\u6297\u8B70\u304C\u5404\u5730\u3067\u8D77\u304D\u305F\u3002\u5BB6\u5EAD\u7528\u592A\u967D\u5149\u306E\u5C0E\u5165\u304C\u6025\u5897\uFF08\u5831\u9053\uFF09",
    estimated: true
  },
  {
    id: "pak_gulf_work",
    iso3: [
      "PAK"
    ],
    minAge: 20,
    maxAge: 45,
    annualProb: 0.015,
    requires: "working",
    title: "\u30B5\u30A6\u30B8\u30A2\u30E9\u30D3\u30A2\u3078\u306E\u51FA\u7A3C\u304E",
    situation: "\u89AA\u621A\u306E\u7D39\u4ECB\u3067\u3001\u30B5\u30A6\u30B8\u30A2\u30E9\u30D3\u30A2\u306E\u904B\u8EE2\u624B\u306E\u4ED5\u4E8B\u306B\u5FDC\u52DF\u3067\u304D\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u51FA\u7A3C\u304E\u306B\u884C\u304F",
        desc: "\u53CE\u5165\u304C\u5927\u304D\u304F\u5897\u3048\u3001\u4ED5\u9001\u308A\u304C\u3067\u304D\u308B\u3002\u5BB6\u65CF\u3068\u4F55\u5E74\u3082\u96E2\u308C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          },
          {
            type: "careerMult",
            value: 1.15
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u30EA\u30E4\u30C9\u3067\u904B\u8EE2\u624B\u3068\u3057\u3066\u50CD\u304D\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u56FD\u5185\u306B\u6B8B\u308B",
        desc: "\u5BB6\u65CF\u3068\u66AE\u3089\u305B\u308B\u3002\u53CE\u5165\u306F\u4F38\u3073\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u56FD\u5185\u3067\u4ED5\u4E8B\u3092\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u6D77\u5916\u5C31\u52B4\u306E\u767B\u9332\u306F\u5E74\u7D0486\u4E07\u4EBA\u3067\u5C31\u696D\u80057,121\u4E07\u4EBA\u306E1.2%\uFF08BEOE 2023\u5E74\u30FB\u7D71\u8A08\u5C40\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "pak_heatwave",
    iso3: [
      "PAK"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.05,
    requires: null,
    title: "\u71B1\u6CE2",
    situation: "\u6C17\u6E29\u304C45\u5EA6\u3092\u8D85\u3048\u308B\u65E5\u304C\u7D9A\u304D\u3001\u505C\u96FB\u3082\u91CD\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u65E5\u4E2D\u306E\u5916\u4ED5\u4E8B\u3092\u4F11\u3080",
        desc: "\u4F53\u3092\u5B88\u308C\u308B\u3002\u65E5\u7D66\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.05
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u6691\u3044\u663C\u9593\u306F\u4F11\u307F\u3001\u671D\u306E\u6DBC\u3057\u3044\u3046\u3061\u306B\u50CD\u3044\u305F\u3002"
      },
      {
        id: "b",
        label: "\u3044\u3064\u3082\u3069\u304A\u308A\u50CD\u304F",
        desc: "\u53CE\u5165\u306F\u4FDD\u3066\u308B\u3002\u71B1\u4E2D\u75C7\u306E\u5371\u967A\u304C\u9AD8\u3044\u3002",
        effects: [
          {
            type: "health",
            value: 1.04
          }
        ],
        result: "\u6C34\u3092\u6301\u3063\u3066\u73FE\u5834\u306B\u51FA\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u30B7\u30F3\u30C9\u5DDE\u306A\u3069\u306745\u5EA6\u8D85\u306E\u71B1\u6CE2\u304C\u983B\u767A\uFF08\u30D1\u30AD\u30B9\u30BF\u30F3\u6C17\u8C61\u5C40\uFF09",
    estimated: true
  },
  {
    id: "bgd_garment_job",
    iso3: [
      "BGD"
    ],
    minAge: 16,
    maxAge: 35,
    annualProb: 0.02,
    requires: null,
    title: "\u7E2B\u88FD\u5DE5\u5834\u306E\u6C42\u4EBA",
    situation: "\u30C0\u30C3\u30AB\u8FD1\u90CA\u306E\u7E2B\u88FD\u5DE5\u5834\u3067\u50CD\u304D\u624B\u3092\u52DF\u96C6\u3057\u3066\u3044\u308B\u3068\u3001\u6751\u3067\u8A71\u304C\u5E83\u307E\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u90FD\u5E02\u306B\u51FA\u3066\u5DE5\u5834\u3067\u50CD\u304F",
        desc: "\u6BCE\u6708\u306E\u73FE\u91D1\u53CE\u5165\u304C\u5F97\u3089\u308C\u308B\u3002\u9577\u6642\u9593\u52B4\u50CD\u3067\u5BB6\u65CF\u3068\u96E2\u308C\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 5e4
          },
          {
            type: "careerMult",
            value: 1.06
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u30AC\u30B8\u30D7\u30FC\u30EB\u306E\u5DE5\u5834\u3067\u50CD\u304D\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6751\u306B\u6B8B\u308B",
        desc: "\u5BB6\u65CF\u306E\u8FD1\u304F\u306B\u3044\u3089\u308C\u308B\u3002\u73FE\u91D1\u53CE\u5165\u306F\u5C11\u306A\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.98
          }
        ],
        result: "\u6751\u3067\u5BB6\u696D\u3092\u624B\u4F1D\u3044\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u7E2B\u88FD\u5DE5\u5834\u3067\u50CD\u304F\u4EBA\u306F\u7D04400\u4E07\u4EBA\u3067\u300115\u301C34\u6B73\u4EBA\u53E3\u306E\u7D047%\uFF08BGMEA\u30FB2022\u5E74\u56FD\u52E2\u8ABF\u67FB\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bgd_flood",
    iso3: [
      "BGD"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.04,
    requires: null,
    title: "\u96E8\u5B63\u306E\u6D2A\u6C34",
    situation: "\u4E0A\u6D41\u304B\u3089\u306E\u5927\u6C34\u3067\u5DDD\u304C\u6C3E\u6FEB\u3057\u3001\u9053\u3082\u7551\u3082\u6C34\u306B\u3064\u304B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u9AD8\u5E8A\u306B\u3057\u305F\u5BB6\u306B\u3068\u3069\u307E\u308B",
        desc: "\u5BB6\u3068\u5BB6\u755C\u3092\u5B88\u308C\u308B\u3002\u98DF\u6599\u3068\u6C34\u304C\u4E0D\u8DB3\u3059\u308B\u3002",
        effects: [
          {
            type: "health",
            value: 1.04
          },
          {
            type: "incomeDropPct",
            value: 0.1
          }
        ],
        result: "\u30DC\u30FC\u30C8\u3067\u98DF\u6599\u3092\u53D7\u3051\u53D6\u308A\u306A\u304C\u3089\u6C34\u304C\u5F15\u304F\u306E\u3092\u5F85\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u907F\u96E3\u6240\u306B\u79FB\u308B",
        desc: "\u5B89\u5168\u306B\u904E\u3054\u305B\u308B\u3002\u5BB6\u8CA1\u306E\u4E00\u90E8\u3092\u5931\u3046\u3002",
        effects: [
          {
            type: "cost",
            value: 8e4
          }
        ],
        result: "\u30B5\u30A4\u30AF\u30ED\u30F3\u30B7\u30A7\u30EB\u30BF\u30FC\u306B\u907F\u96E3\u3057\u305F\u3002"
      }
    ],
    basis: "1\u56DE\u306E\u6D2A\u6C34\u306E\u88AB\u707D\u8005\u306F580\u4E07\u301C730\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E3\u301C4%\uFF08OCHA\u30FBUNICEF 2022\u30FB2024\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bgd_cyclone",
    iso3: [
      "BGD"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.015,
    requires: "rural",
    title: "\u30B5\u30A4\u30AF\u30ED\u30F3",
    situation: "\u6CBF\u5CB8\u90E8\u306B\u30B5\u30A4\u30AF\u30ED\u30F3\u306E\u8B66\u5831\u304C\u51FA\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u3059\u3050\u306B\u30B7\u30A7\u30EB\u30BF\u30FC\u3078\u907F\u96E3\u3059\u308B",
        desc: "\u547D\u3092\u5B88\u308C\u308B\u3002\u5BB6\u3092\u7A7A\u3051\u3066\u3044\u308B\u9593\u306B\u5BB6\u8CA1\u304C\u50B7\u3080\u3002",
        effects: [
          {
            type: "cost",
            value: 6e4
          }
        ],
        result: "\u5BB6\u65CF\u3067\u30B7\u30A7\u30EB\u30BF\u30FC\u306B\u907F\u96E3\u3057\u3001\u4E00\u6669\u3092\u904E\u3054\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u306B\u3068\u3069\u307E\u308A\u88DC\u5F37\u3059\u308B",
        desc: "\u5BB6\u3092\u5B88\u308C\u308B\u3053\u3068\u3082\u3042\u308B\u3002\u5371\u967A\u304C\u5927\u304D\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          },
          {
            type: "health",
            value: 1.05
          }
        ],
        result: "\u5C4B\u6839\u3092\u30ED\u30FC\u30D7\u3067\u7E1B\u3063\u3066\u5D50\u3092\u3084\u308A\u904E\u3054\u3057\u305F\u3002"
      }
    ],
    basis: "\u5927\u304D\u306A\u30B5\u30A4\u30AF\u30ED\u30F31\u56DE\u306E\u88AB\u707D\u8005\u306F240\u4E07\u301C260\u4E07\u4EBA\u3067\u3001\u304A\u304A\u3080\u306D2\u5E74\u306B\u4E00\u5EA6\uFF08OCHA 2020\u30FB2024\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bgd_microcredit",
    iso3: [
      "BGD"
    ],
    minAge: 20,
    maxAge: 60,
    annualProb: 0.05,
    requires: "rural",
    title: "\u30DE\u30A4\u30AF\u30ED\u30AF\u30EC\u30B8\u30C3\u30C8",
    situation: "\u6751\u306E\u30DE\u30A4\u30AF\u30ED\u30D5\u30A1\u30A4\u30CA\u30F3\u30B9\u306E\u96C6\u307E\u308A\u3067\u3001\u5C0F\u3055\u306A\u5546\u58F2\u306E\u305F\u3081\u306E\u878D\u8CC7\u3092\u52E7\u3081\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u501F\u308A\u3066\u5546\u58F2\u3092\u59CB\u3081\u308B",
        desc: "\u53CE\u5165\u304C\u5897\u3048\u308B\u53EF\u80FD\u6027\u304C\u3042\u308B\u3002\u6BCE\u9031\u306E\u8FD4\u6E08\u304C\u91CD\u8377\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e4
          },
          {
            type: "careerMult",
            value: 1.05
          }
        ],
        result: "\u30DF\u30B7\u30F3\u3092\u8CB7\u3063\u3066\u4ED5\u7ACB\u3066\u306E\u4ED5\u4E8B\u3092\u59CB\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u501F\u308A\u306A\u3044",
        desc: "\u501F\u91D1\u306E\u5FC3\u914D\u306F\u306A\u3044\u3002\u66AE\u3089\u3057\u306F\u4ECA\u306E\u307E\u307E\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u4ECA\u306E\u66AE\u3089\u3057\u3092\u7D9A\u3051\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u30DE\u30A4\u30AF\u30ED\u30D5\u30A1\u30A4\u30CA\u30F3\u30B9\u306E\u501F\u308A\u624B\u306F\u7D043,217\u4E07\u4EBA\u306715\u301C64\u6B73\u306E28%\uFF08MRA 2024\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bgd_gulf_work",
    iso3: [
      "BGD"
    ],
    minAge: 20,
    maxAge: 40,
    annualProb: 0.025,
    requires: "working",
    title: "\u6D77\u5916\u3078\u306E\u51FA\u7A3C\u304E",
    situation: "\u4EF2\u4ECB\u696D\u8005\u304B\u3089\u3001\u30DE\u30EC\u30FC\u30B7\u30A2\u3084\u4E2D\u6771\u306E\u5DE5\u5834\u306E\u4ED5\u4E8B\u3092\u7D39\u4ECB\u3055\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u501F\u91D1\u3092\u3057\u3066\u6E21\u822A\u3059\u308B",
        desc: "\u4ED5\u9001\u308A\u3067\u5BB6\u65CF\u306E\u66AE\u3089\u3057\u304C\u826F\u304F\u306A\u308B\u3002\u4EF2\u4ECB\u6599\u304C\u9AD8\u304F\u3001\u6761\u4EF6\u304C\u8AAC\u660E\u3068\u9055\u3046\u3053\u3068\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 4e5
          },
          {
            type: "careerMult",
            value: 1.15
          }
        ],
        result: "\u30DE\u30EC\u30FC\u30B7\u30A2\u306E\u5DE5\u5834\u3067\u50CD\u304F\u3053\u3068\u306B\u306A\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u56FD\u5185\u306B\u6B8B\u308B",
        desc: "\u501F\u91D1\u306E\u30EA\u30B9\u30AF\u306F\u306A\u3044\u3002\u53CE\u5165\u306F\u4F38\u3073\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u56FD\u5185\u3067\u50CD\u304D\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u6D77\u5916\u5C31\u52B4\u306E\u51FA\u56FD\u8005\u306F\u5E74113\u4E07\u301C131\u4E07\u4EBA\u3067\u5C31\u696D\u80057,080\u4E07\u4EBA\u306E\u7D041.7%\uFF08BMET\u30FB\u7D71\u8A08\u5C40 2022-23\u5E74\uFF09\u300220\u301C40\u6B73\u306B\u9650\u308C\u3070\u305D\u308C\u4EE5\u4E0A\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "idn_earthquake",
    iso3: [
      "IDN"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 4e-3,
    requires: null,
    title: "\u5730\u9707\u3068\u6D25\u6CE2\u8B66\u5831",
    situation: "\u5F37\u3044\u5730\u9707\u304C\u8D77\u304D\u3001\u6CBF\u5CB8\u306B\u6D25\u6CE2\u8B66\u5831\u304C\u51FA\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u9AD8\u53F0\u306B\u907F\u96E3\u3057\u3066\u5BB6\u3092\u5EFA\u3066\u76F4\u3059",
        desc: "\u5730\u5143\u306B\u6B8B\u308C\u308B\u3002\u518D\u5EFA\u306B\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          },
          {
            type: "incomeDropPct",
            value: 0.1
          }
        ],
        result: "\u9AD8\u53F0\u306B\u907F\u96E3\u3057\u3001\u305D\u306E\u5F8C\u5BB6\u3092\u76F4\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5225\u306E\u5CF6\u306E\u89AA\u621A\u3092\u983C\u308B",
        desc: "\u5B89\u5168\u306B\u66AE\u3089\u305B\u308B\u3002\u4ED5\u4E8B\u3092\u4E00\u304B\u3089\u63A2\u3059\u3002",
        effects: [
          {
            type: "moveCost",
            value: 2e5
          },
          {
            type: "careerMult",
            value: 0.97
          }
        ],
        result: "\u89AA\u621A\u306E\u3044\u308B\u753A\u306B\u79FB\u3063\u305F\u3002"
      }
    ],
    basis: "2022\u5E74\u30C1\u30A2\u30F3\u30B8\u30E5\u30FC\u30EB\u5730\u9707\u306E\u88AB\u707D\u8005\u306F\u7D0450\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E0.2%\uFF08BNPB\uFF09\u3002\u307B\u304B\u306E\u5730\u9707\u3082\u542B\u3081\u3066\u5E740.4%\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "idn_jakarta_flood",
    iso3: [
      "IDN"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.02,
    requires: "urban+working",
    title: "\u96E8\u5B63\u306E\u51A0\u6C34",
    situation: "\u5927\u96E8\u3067\u4F4F\u3093\u3067\u3044\u308B\u5730\u533A\u304C\u51A0\u6C34\u3057\u3001\u6570\u65E5\u9593\u4ED5\u4E8B\u306B\u884C\u3051\u306A\u304B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5BB6\u8CA1\u3092\u9AD8\u3044\u6240\u306B\u4E0A\u3052\u3066\u8010\u3048\u308B",
        desc: "\u8CBB\u7528\u306F\u5C0F\u3055\u3044\u3002\u6BCE\u5E74\u540C\u3058\u3053\u3068\u304C\u8D77\u304D\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e4
          },
          {
            type: "incomeDropPct",
            value: 0.02
          }
        ],
        result: "\u6C34\u304C\u5F15\u304F\u306E\u3092\u5F85\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u51A0\u6C34\u3057\u306A\u3044\u5730\u533A\u3078\u5F15\u3063\u8D8A\u3059",
        desc: "\u88AB\u5BB3\u3092\u907F\u3051\u3089\u308C\u308B\u3002\u5BB6\u8CC3\u3068\u901A\u52E4\u6642\u9593\u304C\u5897\u3048\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 2e5
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u5C11\u3057\u9AD8\u3044\u571F\u5730\u306E\u30A2\u30D1\u30FC\u30C8\u306B\u79FB\u3063\u305F\u3002"
      }
    ],
    basis: "2020\u5E74\u306E\u30B8\u30E3\u30AB\u30EB\u30BF\u6D2A\u6C34\u306E\u907F\u96E3\u8005\u306F\u4EBA\u53E3\u306E0.3%\uFF08BNPB\uFF09\u3002\u51A0\u6C34\u3067\u4ED5\u4E8B\u306B\u884C\u3051\u306A\u3044\u4EBA\u306F\u305D\u308C\u3088\u308A\u591A\u3044\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "idn_haze",
    iso3: [
      "IDN"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.04,
    requires: "rural",
    title: "\u68EE\u6797\u706B\u707D\u306E\u7159\u5BB3",
    situation: "\u4E7E\u5B63\u306E\u68EE\u6797\u706B\u707D\u306E\u7159\u3067\u3001\u7A7A\u304C\u4F55\u9031\u9593\u3082\u971E\u3093\u3067\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u30DE\u30B9\u30AF\u3068\u7A7A\u6C17\u6E05\u6D44\u6A5F\u3092\u8CB7\u3046",
        desc: "\u4F53\u3092\u5B88\u308C\u308B\u3002\u51FA\u8CBB\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u30DE\u30B9\u30AF\u3092\u8CB7\u3044\u3001\u7A93\u3092\u9589\u3081\u3066\u904E\u3054\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u3044\u3064\u3082\u3069\u304A\u308A\u904E\u3054\u3059",
        desc: "\u51FA\u8CBB\u306F\u306A\u3044\u3002\u547C\u5438\u5668\u306E\u4E0D\u8ABF\u304C\u51FA\u3084\u3059\u3044\u3002",
        effects: [
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u305B\u304D\u3092\u3057\u306A\u304C\u3089\u7551\u4ED5\u4E8B\u3092\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "2015\u5E74\u306E\u68EE\u6797\u706B\u707D\u306E\u7159\u306F\u7D044,300\u4E07\u4EBA\u306B\u5F71\u97FF\uFF08\u4E16\u754C\u9280\u884C\uFF09\u3002\u5927\u304D\u306A\u7159\u5BB3\u306F\u7D044\u5E74\u306B\u4E00\u5EA6\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "idn_jkn",
    iso3: [
      "IDN"
    ],
    minAge: 18,
    maxAge: 60,
    annualProb: 0.05,
    requires: null,
    title: "\u56FD\u6C11\u5065\u5EB7\u4FDD\u967A\u306E\u52A0\u5165",
    situation: "\u5C4B\u53F0\u306E\u5546\u58F2\u3092\u59CB\u3081\u305F\u306E\u3067\u3001\u56FD\u6C11\u5065\u5EB7\u4FDD\u967A\uFF08JKN\uFF09\u306B\u81EA\u5206\u3067\u4FDD\u967A\u6599\u3092\u6255\u3063\u3066\u5165\u308B\u304B\u8003\u3048\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4FDD\u967A\u6599\u3092\u6255\u3063\u3066\u52A0\u5165\u3059\u308B",
        desc: "\u75C5\u6C17\u306E\u3068\u304D\u306B\u5B89\u5FC3\u3067\u304D\u308B\u3002\u6BCE\u6708\u306E\u51FA\u8CBB\u304C\u5897\u3048\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 0.97
          }
        ],
        result: "JKN\u306B\u52A0\u5165\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u52A0\u5165\u3057\u306A\u3044",
        desc: "\u624B\u5143\u306B\u304A\u91D1\u304C\u6B8B\u308B\u3002\u75C5\u6C17\u306B\u306A\u308B\u3068\u5168\u984D\u3092\u6255\u3046\u3002",
        effects: [
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u4FDD\u967A\u6599\u306E\u5206\u3092\u5546\u58F2\u306B\u56DE\u3057\u305F\u3002"
      }
    ],
    basis: "\u4FDD\u967A\u6599\u306E\u6EDE\u7D0D\u306A\u3069\u3067\u4F7F\u3048\u306A\u3044 JKN \u52A0\u5165\u8005\u306F\u7D046,300\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E\u7D0423%\uFF08\u4FDD\u5065\u7701\u3001\u4E8C\u6B21\u60C5\u5831\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "idn_online_loan",
    iso3: [
      "IDN"
    ],
    minAge: 20,
    maxAge: 50,
    annualProb: 0.01,
    requires: null,
    title: "\u30B9\u30DE\u30DB\u306E\u5373\u65E5\u30ED\u30FC\u30F3",
    situation: "\u6025\u306A\u51FA\u8CBB\u304C\u3042\u308A\u3001\u30B9\u30DE\u30DB\u30A2\u30D7\u30EA\u306E\u5373\u65E5\u30ED\u30FC\u30F3\u306E\u5E83\u544A\u304C\u76EE\u306B\u5165\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30A2\u30D7\u30EA\u3067\u501F\u308A\u308B",
        desc: "\u3059\u3050\u306B\u304A\u91D1\u304C\u624B\u306B\u5165\u308B\u3002\u5229\u606F\u304C\u9AD8\u304F\u3001\u53D6\u308A\u7ACB\u3066\u304C\u53B3\u3057\u3044\u3053\u3068\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 6e4
          }
        ],
        result: "\u30A2\u30D7\u30EA\u3067\u501F\u308A\u3066\u652F\u6255\u3044\u3092\u6E08\u307E\u305B\u305F\u3002"
      },
      {
        id: "b",
        label: "\u89AA\u65CF\u306B\u982D\u3092\u4E0B\u3052\u3066\u501F\u308A\u308B",
        desc: "\u5229\u606F\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u6C17\u307E\u305A\u3055\u304C\u6B8B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e4
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u53D4\u7236\u306B\u304A\u91D1\u3092\u501F\u308A\u305F\u3002"
      }
    ],
    basis: "\u30AA\u30F3\u30E9\u30A4\u30F3\u8CB8\u91D1\u306E\u501F\u308A\u624B\u306F\u7D041,657\u4E07\u53E3\u5EA7\u3067\u6210\u4EBA\u7D042\u5104\u4EBA\u306E8%\uFF08OJK\u3001\u4E8C\u6B21\u60C5\u5831\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bra_price_rise",
    iso3: [
      "BRA"
    ],
    minAge: 20,
    maxAge: 80,
    annualProb: 0.04,
    requires: null,
    title: "\u7269\u4FA1\u306E\u4E0A\u6607",
    situation: "\u98DF\u6599\u54C1\u306E\u5024\u6BB5\u304C\u4E0A\u304C\u308A\u3001\u6BCE\u6708\u306E\u8CB7\u3044\u7269\u3067\u540C\u3058\u984D\u3067\u306F\u8DB3\u308A\u306A\u304F\u306A\u3063\u3066\u304D\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30EC\u30A2\u30EB\u306E\u666E\u901A\u9810\u91D1\u306E\u307E\u307E",
        desc: "\u624B\u9593\u306F\u306A\u3044\u3002\u76EE\u6E1B\u308A\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.08
          }
        ],
        result: "\u5B89\u58F2\u308A\u306E\u5E97\u3092\u63A2\u3057\u3066\u56DE\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u7269\u4FA1\u9023\u52D5\u306E\u56FD\u50B5\u306B\u79FB\u3059",
        desc: "\u4FA1\u5024\u3092\u5B88\u308A\u3084\u3059\u3044\u3002\u3059\u3050\u306B\u306F\u5F15\u304D\u51FA\u3057\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 5e3
          },
          {
            type: "protectCash",
            value: true
          }
        ],
        result: "Tesouro Direto\u3067\u7269\u4FA1\u9023\u52D5\u50B5\u3092\u8CB7\u3063\u305F\u3002"
      }
    ],
    basis: "2005\u301C2024\u5E74\u306E\u3046\u30615\u5E74\u3067IPCA\u306E\u4E0A\u6607\u7387\u304C6%\u3092\u8D85\u3048\u305F\uFF08IBGE\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bra_security",
    iso3: [
      "BRA"
    ],
    minAge: 20,
    maxAge: 70,
    annualProb: 0.04,
    requires: "urban",
    title: "\u9632\u72AF\u306E\u305F\u3081\u306E\u51FA\u8CBB",
    situation: "\u8FD1\u6240\u3067\u5F37\u76D7\u304C\u76F8\u6B21\u304E\u3001\u5BB6\u65CF\u3067\u9632\u72AF\u5BFE\u7B56\u3092\u8A71\u3057\u5408\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u8B66\u5099\u4ED8\u304D\u306E\u96C6\u5408\u4F4F\u5B85\u306B\u5F15\u3063\u8D8A\u3059",
        desc: "\u5B89\u5FC3\u3057\u3066\u66AE\u3089\u305B\u308B\u3002\u5BB6\u8CC3\u304C\u4E0A\u304C\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 4e5
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u9580\u3068\u5B88\u885B\u306E\u3042\u308B\u30DE\u30F3\u30B7\u30E7\u30F3\u306B\u79FB\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4ECA\u306E\u5BB6\u306B\u9244\u683C\u5B50\u3068\u30AB\u30E1\u30E9\u3092\u4ED8\u3051\u308B",
        desc: "\u8CBB\u7528\u306F\u6291\u3048\u3089\u308C\u308B\u3002\u4E0D\u5B89\u306F\u6B8B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          }
        ],
        result: "\u7A93\u306B\u683C\u5B50\u3092\u4ED8\u3051\u305F\u3002"
      }
    ],
    basis: "\u5168\u4E16\u5E2F\u306E4%\u304C\u904E\u53BB1\u5E74\u306B\u7A83\u76D7\u306E\u88AB\u5BB3\uFF08IBGE PNAD 2021\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bra_phone_theft",
    iso3: [
      "BRA"
    ],
    minAge: 15,
    maxAge: 70,
    annualProb: 0.1,
    requires: "urban+working",
    title: "\u30B9\u30DE\u30DB\u306E\u3072\u3063\u305F\u304F\u308A",
    situation: "\u901A\u52E4\u4E2D\u306B\u30B9\u30DE\u30DB\u3092\u3072\u3063\u305F\u304F\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u540C\u3058\u6A5F\u7A2E\u3092\u8CB7\u3044\u76F4\u3059",
        desc: "\u4ED5\u4E8B\u306B\u3059\u3050\u623B\u308C\u308B\u3002\u51FA\u8CBB\u304C\u5927\u304D\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          }
        ],
        result: "\u5206\u5272\u6255\u3044\u3067\u65B0\u3057\u3044\u30B9\u30DE\u30DB\u3092\u8CB7\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5B89\u3044\u4E2D\u53E4\u3092\u8CB7\u3046",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u4F7F\u3044\u52DD\u624B\u306F\u843D\u3061\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "careerMult",
            value: 0.995
          }
        ],
        result: "\u4E2D\u53E4\u306E\u30B9\u30DE\u30DB\u3067\u5F53\u9762\u3057\u306E\u3050\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "16\u6B73\u4EE5\u4E0A\u306E\u7D0410%\u304C\u904E\u53BB1\u5E74\u306B\u643A\u5E2F\u96FB\u8A71\u3092\u76D7\u307E\u308C\u305F\uFF08\u30D6\u30E9\u30B8\u30EB\u516C\u5171\u5B89\u5168\u30D5\u30A9\u30FC\u30E9\u30E0\u30FBDatafolha 2024\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bra_sus_wait",
    iso3: [
      "BRA"
    ],
    minAge: 0,
    maxAge: 90,
    annualProb: 0.04,
    requires: null,
    title: "\u516C\u7ACB\u75C5\u9662\u306E\u5F85\u3061\u6642\u9593",
    situation: "\u5C02\u9580\u533B\u306E\u8A3A\u5BDF\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u304C\u3001\u516C\u7684\u533B\u7642\uFF08SUS\uFF09\u3067\u306F\u6570\u304B\u6708\u5F85\u3061\u3060\u3068\u8A00\u308F\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6C11\u9593\u306E\u533B\u7642\u4FDD\u967A\u306B\u5165\u308B",
        desc: "\u3059\u3050\u306B\u8A3A\u3066\u3082\u3089\u3048\u308B\u3002\u4FDD\u967A\u6599\u304C\u9AD8\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          },
          {
            type: "health",
            value: 0.97
          }
        ],
        result: "\u6C11\u9593\u306E\u533B\u7642\u4FDD\u967A\u306B\u52A0\u5165\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "SUS\u3067\u9806\u756A\u3092\u5F85\u3064",
        desc: "\u8CBB\u7528\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u75C7\u72B6\u304C\u9032\u3080\u304A\u305D\u308C\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u4E88\u7D04\u306E\u65E5\u307E\u3067\u5F85\u3063\u305F\u3002"
      }
    ],
    basis: "SUS\u3067\u624B\u8853\u3092\u5F85\u3064\u4EBA\u306F\u7D0468\u4E07\u4EBA\uFF08\u4FDD\u5065\u7701\u3001\u4E8C\u6B21\u60C5\u5831\uFF09\u3002\u5C02\u9580\u533B\u306E\u53D7\u8A3A\u5F85\u3061\u306F\u3055\u3089\u306B\u591A\u3044\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "bra_enem",
    iso3: [
      "BRA"
    ],
    minAge: 17,
    maxAge: 18,
    annualProb: 0.15,
    requires: "student",
    title: "\u5168\u56FD\u9AD8\u6821\u8A66\u9A13\uFF08ENEM\uFF09",
    situation: "ENEM\u306E\u70B9\u6570\u3067\u56FD\u7ACB\u5927\u5B66\u306B\u5165\u308C\u308B\u304B\u304C\u6C7A\u307E\u308B\u3002\u7D50\u679C\u306F\u5C11\u3057\u8DB3\u308A\u306A\u304B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4E88\u5099\u6821\uFF08cursinho\uFF09\u30671\u5E74\u52C9\u5F37\u3059\u308B",
        desc: "\u5B66\u8CBB\u7121\u6599\u306E\u56FD\u7ACB\u5927\u5B66\u3092\u72D9\u3048\u308B\u30021\u5E74\u9045\u308C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 1.04
          }
        ],
        result: "\u4E88\u5099\u6821\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u79C1\u7ACB\u5927\u5B66\u306B\u5968\u5B66\u91D1\u3067\u5165\u308B",
        desc: "\u3059\u3050\u306B\u9032\u5B66\u3067\u304D\u308B\u3002\u5B66\u8CBB\u306E\u501F\u91D1\u304C\u6B8B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 6e5
          },
          {
            type: "careerMult",
            value: 1.03
          }
        ],
        result: "\u79C1\u7ACB\u5927\u5B66\u306B\u5165\u5B66\u3057\u305F\u3002"
      }
    ],
    basis: "\u9AD8\u68213\u5E74\u751F\u7D04200\u4E07\u4EBA\u306E\u3046\u3061\u7D04130\u4E07\u4EBA\u304CENEM\u3092\u53D7\u9A13\uFF08INEP 2024\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "deu_ausbildung",
    iso3: [
      "DEU"
    ],
    minAge: 16,
    maxAge: 19,
    annualProb: 0.18,
    requires: "student",
    title: "\u8077\u696D\u8A13\u7DF4\u304B\u5927\u5B66\u304B",
    situation: "\u5B66\u6821\u3092\u51FA\u305F\u3042\u3068\u3001\u8077\u696D\u8A13\u7DF4\uFF08\u30C7\u30E5\u30A2\u30EB\u30B7\u30B9\u30C6\u30E0\uFF09\u306B\u9032\u3080\u304B\u3001\u5927\u5B66\u3092\u76EE\u6307\u3059\u304B\u3092\u6C7A\u3081\u308B\u6642\u671F\u304C\u6765\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4F01\u696D\u3067\u8077\u696D\u8A13\u7DF4\u3092\u53D7\u3051\u308B",
        desc: "\u8A13\u7DF4\u624B\u5F53\u3092\u3082\u3089\u3044\u306A\u304C\u3089\u8CC7\u683C\u304C\u53D6\u308C\u308B\u3002\u8077\u7A2E\u306E\u5E45\u306F\u6C7A\u307E\u308A\u3084\u3059\u3044\u3002",
        effects: [
          {
            type: "income",
            value: 3e5
          },
          {
            type: "careerMult",
            value: 1.03
          }
        ],
        result: "\u81EA\u52D5\u8ECA\u5DE5\u5834\u306E\u8A13\u7DF4\u751F\u306B\u306A\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u30A2\u30D3\u30C8\u30A5\u30FC\u30A2\u3092\u53D6\u3063\u3066\u5927\u5B66\u3078",
        desc: "\u5C02\u9580\u8077\u3078\u306E\u9053\u304C\u958B\u3051\u308B\u3002\u50CD\u304D\u306F\u3058\u3081\u308B\u306E\u304C\u9045\u308C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          },
          {
            type: "careerMult",
            value: 1.07
          }
        ],
        result: "\u5927\u5B66\u9032\u5B66\u3092\u76EE\u6307\u3059\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u5B66\u6821\u3092\u51FA\u305F\u82E5\u8005\u306E\u7D04\u534A\u6570\u304C\u30C7\u30E5\u30A2\u30EB\u8077\u696D\u8A13\u7DF4\u306B\u9032\u3080\uFF08BIBB\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "deu_energy_price",
    iso3: [
      "DEU"
    ],
    minAge: 20,
    maxAge: 90,
    annualProb: 0.05,
    requires: null,
    title: "\u6696\u623F\u8CBB\u306E\u5024\u4E0A\u304C\u308A",
    situation: "\u30AC\u30B9\u6599\u91D1\u306E\u6539\u5B9A\u3067\u3001\u51AC\u306E\u6696\u623F\u8CBB\u304C\u524D\u5E74\u306E2\u500D\u8FD1\u304F\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6696\u623F\u3092\u63A7\u3048\u3066\u91CD\u306D\u7740\u3059\u308B",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u5BB6\u306E\u4E2D\u304C\u5BD2\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u5BA4\u6E29\u309218\u5EA6\u306B\u4E0B\u3052\u3066\u51AC\u3092\u904E\u3054\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u30D2\u30FC\u30C8\u30DD\u30F3\u30D7\u306B\u66FF\u3048\u308B",
        desc: "\u9577\u3044\u76EE\u3067\u898B\u308C\u3070\u5149\u71B1\u8CBB\u304C\u4E0B\u304C\u308B\u3002\u521D\u671F\u8CBB\u7528\u304C\u5927\u304D\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 5e5
          }
        ],
        result: "\u88DC\u52A9\u91D1\u3092\u4F7F\u3063\u3066\u30D2\u30FC\u30C8\u30DD\u30F3\u30D7\u3092\u5165\u308C\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB20\u5E74\u3067\u5BB6\u5EAD\u7528\u30A8\u30CD\u30EB\u30AE\u30FC\u4FA1\u683C\u304C1\u5E74\u306B30%\u4EE5\u4E0A\u4E0A\u304C\u3063\u305F\u306E\u306F2022\u5E74\u306E\u307F\uFF08\u9023\u90A6\u7D71\u8A08\u5C40\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "deu_kita",
    iso3: [
      "DEU"
    ],
    minAge: 25,
    maxAge: 45,
    annualProb: 0.08,
    requires: "kid:0-2",
    title: "\u4FDD\u80B2\u6240\u306E\u7A7A\u304D\u5F85\u3061",
    situation: "\u80B2\u5150\u4F11\u696D\u304C\u7D42\u308F\u308B\u304C\u3001\u8FD1\u304F\u306E\u4FDD\u80B2\u6240\uFF08Kita\uFF09\u306B\u7A7A\u304D\u304C\u306A\u3044\u3002",
    options: [
      {
        id: "a",
        label: "\u80B2\u4F11\u3092\u5EF6\u3070\u3057\u3066\u5F85\u3064",
        desc: "\u5B50\u3069\u3082\u3068\u904E\u3054\u305B\u308B\u3002\u53CE\u5165\u3068\u30AD\u30E3\u30EA\u30A2\u304C\u6B62\u307E\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.4
          },
          {
            type: "careerMult",
            value: 0.97
          }
        ],
        result: "\u80B2\u4F11\u3092\u5EF6\u9577\u3057\u3066\u7A7A\u304D\u3092\u5F85\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6C11\u9593\u306E\u30D9\u30D3\u30FC\u30B7\u30C3\u30BF\u30FC\u3092\u96C7\u3046",
        desc: "\u4ED5\u4E8B\u306B\u623B\u308C\u308B\u3002\u8CBB\u7528\u304C\u9AD8\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 6e5
          },
          {
            type: "careerMult",
            value: 1.01
          }
        ],
        result: "\u30D9\u30D3\u30FC\u30B7\u30C3\u30BF\u30FC\u3092\u96C7\u3063\u3066\u8077\u5834\u306B\u623B\u3063\u305F\u3002"
      }
    ],
    basis: "3\u6B73\u672A\u6E80\u306E\u4FDD\u80B2\u6240\u306E\u4E0D\u8DB3\u306F\u7D0430\u4E07\u4EBA\u5206\u3067\u30013\u6B73\u672A\u6E80\u306E\u5B50\u306E\u7D0415%\uFF08IW\u30FB\u9023\u90A6\u7D71\u8A08\u5C40 2025\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "deu_flood",
    iso3: [
      "DEU"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 3e-3,
    requires: null,
    title: "\u8C6A\u96E8\u306B\u3088\u308B\u6D2A\u6C34",
    situation: "\u8A18\u9332\u7684\u306A\u5927\u96E8\u3067\u8FD1\u304F\u306E\u5DDD\u304C\u6C3E\u6FEB\u3057\u3001\u5BB6\u306E1\u968E\u304C\u6CE5\u306B\u57CB\u307E\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4FDD\u967A\u3067\u76F4\u3057\u3066\u4F4F\u307F\u7D9A\u3051\u308B",
        desc: "\u5730\u5143\u306B\u6B8B\u308C\u308B\u3002\u7247\u4ED8\u3051\u306B\u4F55\u304B\u6708\u3082\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e5
          }
        ],
        result: "\u753A\u306E\u4EBA\u305F\u3061\u3068\u4E00\u7DD2\u306B\u6CE5\u3092\u304B\u304D\u51FA\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5DDD\u304B\u3089\u96E2\u308C\u305F\u753A\u306B\u5F15\u3063\u8D8A\u3059",
        desc: "\u6B21\u306E\u6C34\u5BB3\u3092\u907F\u3051\u3089\u308C\u308B\u3002\u5F15\u3063\u8D8A\u3057\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 6e5
          }
        ],
        result: "\u5225\u306E\u753A\u3067\u66AE\u3089\u3057\u76F4\u3059\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u6D2A\u6C34\u30FB\u5927\u96E8\u306A\u3069\u306E\u4FDD\u967A\u91D1\u306E\u4EF6\u6570\u306F2022\u301C2025\u5E74\u306E\u5E73\u5747\u3067\u5E74\u7D0414.5\u4E07\u4EF6\u3001\u4F4F\u5B854,290\u4E07\u6238\u306E\u7D040.3%\uFF08GDV\u30FB\u9023\u90A6\u7D71\u8A08\u5C40\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "deu_wohnung",
    iso3: [
      "DEU"
    ],
    minAge: 20,
    maxAge: 50,
    annualProb: 0.06,
    requires: "urban+renting+kid:0-17",
    title: "\u90FD\u5E02\u306E\u4F4F\u307E\u3044\u63A2\u3057",
    situation: "\u5BB6\u65CF\u304C\u5897\u3048\u3066\u5F15\u3063\u8D8A\u3057\u305F\u3044\u304C\u3001\u90FD\u5E02\u90E8\u306E\u8CC3\u8CB8\u7269\u4EF6\u306E\u5185\u898B\u306B\u306F\u4F55\u5341\u4EBA\u3082\u96C6\u307E\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u90CA\u5916\u306B\u79FB\u308B",
        desc: "\u5E83\u3044\u5BB6\u306B\u4F4F\u3081\u308B\u3002\u901A\u52E4\u6642\u9593\u304C\u9577\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 3e5
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u96FB\u8ECA\u30671\u6642\u9593\u306E\u90CA\u5916\u306B\u5F15\u3063\u8D8A\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4ECA\u306E\u72ED\u3044\u90E8\u5C4B\u3067\u66AE\u3089\u3059",
        desc: "\u5BB6\u8CC3\u306F\u636E\u3048\u7F6E\u304D\u3002\u624B\u72ED\u3067\u5BB6\u65CF\u306E\u30B9\u30C8\u30EC\u30B9\u304C\u5897\u3048\u308B\u3002",
        effects: [
          {
            type: "health",
            value: 1.01
          },
          {
            type: "cost",
            value: 2e4
          }
        ],
        result: "\u5BB6\u5177\u3092\u5DE5\u592B\u3057\u3066\u4ECA\u306E\u90E8\u5C4B\u3067\u66AE\u3089\u3057\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u501F\u5BB6\u4E16\u5E2F\u306E38%\u304C\u904E\u53BB1\u5E74\u306B\u5F15\u3063\u8D8A\u3057\u3092\u5177\u4F53\u7684\u306B\u691C\u8A0E\uFF08\u30C9\u30A4\u30C4\u501F\u5BB6\u4EBA\u5354\u4F1A 2025\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gbr_cost_of_living",
    iso3: [
      "GBR"
    ],
    minAge: 18,
    maxAge: 90,
    annualProb: 0.06,
    requires: null,
    title: "\u751F\u6D3B\u8CBB\u306E\u9AD8\u9A30",
    situation: "\u5149\u71B1\u8CBB\u3068\u98DF\u6599\u54C1\u306E\u5024\u4E0A\u304C\u308A\u3067\u3001\u6BCE\u6708\u306E\u5BB6\u8A08\u304C\u8D64\u5B57\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30D5\u30FC\u30C9\u30D0\u30F3\u30AF\u3084\u652F\u63F4\u5236\u5EA6\u3092\u4F7F\u3046",
        desc: "\u5F53\u9762\u306E\u751F\u6D3B\u3092\u3057\u306E\u3052\u308B\u3002\u624B\u7D9A\u304D\u306B\u6C17\u307E\u305A\u3055\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          },
          {
            type: "health",
            value: 1
          }
        ],
        result: "\u5730\u57DF\u306E\u652F\u63F4\u7A93\u53E3\u306B\u76F8\u8AC7\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6B8B\u696D\u3084\u526F\u696D\u3092\u5897\u3084\u3059",
        desc: "\u53CE\u5165\u3092\u88DC\u3048\u308B\u3002\u75B2\u308C\u304C\u305F\u307E\u308B\u3002",
        effects: [
          {
            type: "income",
            value: 15e4
          },
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u9031\u672B\u306B\u914D\u9054\u306E\u4ED5\u4E8B\u3092\u59CB\u3081\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB20\u5E74\u306E\u3046\u30612\u5E74\uFF082022\u30FB2023\u5E74\uFF09\u3067\u7269\u4FA1\u4E0A\u6607\u7387\u304C5%\u3092\u8D85\u3048\u305F\uFF08ONS\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gbr_nhs_wait",
    iso3: [
      "GBR"
    ],
    minAge: 0,
    maxAge: 90,
    annualProb: 0.04,
    requires: null,
    title: "NHS\u306E\u5F85\u6A5F\u30EA\u30B9\u30C8",
    situation: "\u624B\u8853\u304C\u5FC5\u8981\u3068\u8A00\u308F\u308C\u305F\u304C\u3001\u56FD\u6C11\u4FDD\u5065\u30B5\u30FC\u30D3\u30B9\uFF08NHS\uFF09\u3067\u306F1\u5E74\u8FD1\u304F\u5F85\u3064\u898B\u8FBC\u307F\u3060\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6C11\u9593\u75C5\u9662\u3067\u81EA\u8CBB\u3067\u53D7\u3051\u308B",
        desc: "\u3059\u3050\u306B\u6CBB\u7642\u3067\u304D\u308B\u3002\u8CBB\u7528\u304C\u5927\u304D\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 1e6
          },
          {
            type: "health",
            value: 0.96
          }
        ],
        result: "\u8CAF\u91D1\u3092\u5D29\u3057\u3066\u6C11\u9593\u75C5\u9662\u3067\u624B\u8853\u3092\u53D7\u3051\u305F\u3002"
      },
      {
        id: "b",
        label: "NHS\u3067\u5F85\u3064",
        desc: "\u8CBB\u7528\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u305D\u306E\u9593\u3001\u75DB\u307F\u3068\u4F11\u696D\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "health",
            value: 1.03
          },
          {
            type: "incomeDropPct",
            value: 0.05
          }
        ],
        result: "\u9806\u756A\u3092\u5F85\u3064\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "NHS England \u306E\u65B0\u898F\u7D39\u4ECB\u306F\u5E74\u7D042,360\u4E07\u4EF6\uFF082023\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gbr_mortgage_rate",
    iso3: [
      "GBR"
    ],
    minAge: 28,
    maxAge: 65,
    annualProb: 0.08,
    requires: "mortgage",
    title: "\u4F4F\u5B85\u30ED\u30FC\u30F3\u91D1\u5229\u306E\u66F4\u65B0",
    situation: "2\u5E74\u56FA\u5B9A\u306E\u4F4F\u5B85\u30ED\u30FC\u30F3\u91D1\u5229\u304C\u7D42\u308F\u308A\u3001\u65B0\u3057\u3044\u91D1\u5229\u306F\u4EE5\u524D\u306E2\u500D\u4EE5\u4E0A\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u65B0\u3057\u3044\u56FA\u5B9A\u91D1\u5229\u3067\u501F\u308A\u63DB\u3048\u308B",
        desc: "\u8FD4\u6E08\u984D\u304C\u8AAD\u3081\u308B\u3002\u6BCE\u6708\u306E\u652F\u6255\u3044\u304C\u5927\u304D\u304F\u5897\u3048\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 4e5
          }
        ],
        result: "5\u5E74\u56FA\u5B9A\u3067\u501F\u308A\u63DB\u3048\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u3092\u58F2\u3063\u3066\u5C0F\u3055\u306A\u5BB6\u306B\u79FB\u308B",
        desc: "\u8FD4\u6E08\u304C\u8EFD\u304F\u306A\u308B\u3002\u5F15\u3063\u8D8A\u3057\u306E\u8CBB\u7528\u3068\u624B\u9593\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 5e5
          }
        ],
        result: "\u5BB6\u3092\u58F2\u308A\u3001\u8CC3\u8CB8\u306B\u79FB\u3063\u305F\u3002"
      }
    ],
    basis: "\u4F4F\u5B85\u30ED\u30FC\u30F3\u4E16\u5E2F\u306E\u7D0418%\u304C\u6BCE\u5E74\u56FA\u5B9A\u91D1\u5229\u306E\u671F\u9593\u306E\u7D42\u308F\u308A\u3092\u8FCE\u3048\u308B\uFF08\u30A4\u30F3\u30B0\u30E9\u30F3\u30C9\u9280\u884C 2024\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gbr_tuition",
    iso3: [
      "GBR"
    ],
    minAge: 18,
    maxAge: 19,
    annualProb: 0.15,
    requires: "student",
    title: "\u5927\u5B66\u306E\u5B66\u8CBB\u3068\u5B66\u751F\u30ED\u30FC\u30F3",
    situation: "\u30A4\u30F3\u30B0\u30E9\u30F3\u30C9\u306E\u5927\u5B66\u306E\u5B66\u8CBB\u306F\u5E749,000\u30DD\u30F3\u30C9\u8D85\u3002\u5B66\u751F\u30ED\u30FC\u30F3\u3092\u4F7F\u3063\u3066\u9032\u5B66\u3059\u308B\u304B\u8003\u3048\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5B66\u751F\u30ED\u30FC\u30F3\u3067\u5927\u5B66\u3078",
        desc: "\u5B66\u4F4D\u304C\u53D6\u308C\u308B\u3002\u5352\u696D\u5F8C\u3001\u9577\u304F\u8FD4\u6E08\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 15e5
          },
          {
            type: "careerMult",
            value: 1.1
          }
        ],
        result: "\u5B66\u751F\u30ED\u30FC\u30F3\u3092\u7533\u3057\u8FBC\u307F\u3001\u5927\u5B66\u306B\u5165\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u898B\u7FD2\u3044\uFF08\u30A2\u30D7\u30EC\u30F3\u30C6\u30A3\u30B9\u30B7\u30C3\u30D7\uFF09\u3068\u3057\u3066\u50CD\u304F",
        desc: "\u7D66\u6599\u3092\u3082\u3089\u3044\u306A\u304C\u3089\u5B66\u3079\u308B\u3002\u9032\u3081\u308B\u8077\u7A2E\u306F\u9650\u3089\u308C\u308B\u3002",
        effects: [
          {
            type: "income",
            value: 3e5
          },
          {
            type: "careerMult",
            value: 1.04
          }
        ],
        result: "\u4F1A\u793E\u306E\u898B\u7FD2\u3044\u5236\u5EA6\u306B\u5165\u3063\u305F\u3002"
      }
    ],
    basis: "18\u6B73\u306E\u5927\u5B66\u9032\u5B66\u7387\u306F\u7D0432%\uFF08UCAS\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gbr_rent_rise",
    iso3: [
      "GBR"
    ],
    minAge: 20,
    maxAge: 60,
    annualProb: 0.15,
    requires: "urban+renting",
    title: "\u5BB6\u8CC3\u306E\u5024\u4E0A\u3052",
    situation: "\u5927\u5BB6\u304B\u3089\u3001\u6765\u6708\u304B\u3089\u5BB6\u8CC3\u309215%\u4E0A\u3052\u308B\u3068\u901A\u77E5\u304C\u6765\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u53D7\u3051\u5165\u308C\u3066\u4F4F\u307F\u7D9A\u3051\u308B",
        desc: "\u5F15\u3063\u8D8A\u3057\u306E\u624B\u9593\u306F\u306A\u3044\u3002\u5BB6\u8A08\u304C\u82E6\u3057\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          }
        ],
        result: "\u5024\u4E0A\u3052\u3092\u53D7\u3051\u5165\u308C\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u8CC3\u306E\u5B89\u3044\u5730\u57DF\u306B\u79FB\u308B",
        desc: "\u6BCE\u6708\u306E\u51FA\u8CBB\u304C\u6E1B\u308B\u3002\u901A\u52E4\u6642\u9593\u304C\u9577\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 3e5
          },
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u90CA\u5916\u306E\u753A\u306B\u5F15\u3063\u8D8A\u3057\u305F\u3002"
      }
    ],
    basis: "\u6C11\u9593\u8CC3\u8CB8\u306E63%\u304C\u904E\u53BB1\u5E74\u306B\u5BB6\u8CC3\u3092\u4E0A\u3052\u3089\u308C\u305F\uFF08English Housing Survey\uFF09\u3002\u5834\u9762\u306F\u5927\u304D\u306A\u5024\u4E0A\u3052\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "fra_strike",
    iso3: [
      "FRA"
    ],
    minAge: 18,
    maxAge: 70,
    annualProb: 0.2,
    requires: "urban+working",
    title: "\u4EA4\u901A\u6A5F\u95A2\u306E\u30B9\u30C8\u30E9\u30A4\u30AD",
    situation: "\u5E74\u91D1\u6539\u9769\u306B\u53CD\u5BFE\u3059\u308B\u30B9\u30C8\u30E9\u30A4\u30AD\u3067\u3001\u96FB\u8ECA\u3068\u5730\u4E0B\u9244\u304C\u307B\u3068\u3093\u3069\u52D5\u304B\u306A\u3044\u65E5\u304C\u7D9A\u3044\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u81EA\u8EE2\u8ECA\u3067\u901A\u52E4\u3059\u308B",
        desc: "\u4ED5\u4E8B\u3092\u4F11\u307E\u305A\u306B\u6E08\u3080\u3002\u671D\u65E9\u304F\u51FA\u308B\u5FC5\u8981\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u81EA\u8EE2\u8ECA\u3092\u8CB7\u3063\u3066\u901A\u52E4\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5728\u5B85\u52E4\u52D9\u3084\u4F11\u6687\u306B\u3059\u308B",
        desc: "\u4F53\u306F\u697D\u3002\u4ED5\u4E8B\u304C\u9045\u308C\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.02
          }
        ],
        result: "\u5728\u5B85\u3067\u3067\u304D\u306A\u3044\u4ED5\u4E8B\u306E\u65E5\u306F\u3001\u4F11\u307F\u3092\u53D6\u3063\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB20\u5E74\u306E\u3046\u306114\u5E74\u3067\u5168\u56FD\u898F\u6A21\u306E\u4EA4\u901A\u30B9\u30C8\u30E9\u30A4\u30AD\uFF08INSEE\u30FBSNCF\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "fra_pension_age",
    iso3: [
      "FRA"
    ],
    minAge: 55,
    maxAge: 62,
    annualProb: 0.2,
    requires: "working",
    title: "\u5E74\u91D1\u306E\u652F\u7D66\u958B\u59CB\u5E74\u9F62",
    situation: "\u5E74\u91D1\u6539\u9769\u3067\u3001\u5E74\u91D1\u3092\u6E80\u984D\u53D7\u3051\u53D6\u308C\u308B\u5E74\u9F62\u304C2\u5E74\u9045\u304F\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "64\u6B73\u307E\u3067\u50CD\u304F",
        desc: "\u5E74\u91D1\u3068\u53CE\u5165\u304C\u5897\u3048\u308B\u3002\u4F53\u529B\u7684\u306B\u304D\u3064\u3044\u3002",
        effects: [
          {
            type: "income",
            value: 1e6
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u3042\u30682\u5E74\u50CD\u304F\u3053\u3068\u306B\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6E1B\u984D\u3092\u53D7\u3051\u5165\u308C\u3066\u65E9\u3081\u306B\u9000\u8077\u3059\u308B",
        desc: "\u81EA\u7531\u306A\u6642\u9593\u304C\u5897\u3048\u308B\u3002\u5E74\u91D1\u984D\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.5
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u4E88\u5B9A\u3069\u304A\u308A\u9000\u8077\u3057\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB30\u5E74\u30676\u56DE\u306E\u5E74\u91D1\u6539\u9769\uFF081995\u30FB2003\u30FB2010\u30FB2014\u30FB2020\u30FB2023\u5E74\u3001\u52B4\u50CD\u7701\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "fra_heatwave",
    iso3: [
      "FRA"
    ],
    minAge: 60,
    maxAge: 100,
    annualProb: 0.15,
    requires: null,
    title: "\u590F\u306E\u731B\u6691",
    situation: "\u6C17\u6E2940\u5EA6\u8FD1\u3044\u71B1\u6CE2\u304C\u7D9A\u304D\u3001\u81EA\u5B85\u306B\u306F\u30A8\u30A2\u30B3\u30F3\u304C\u306A\u3044\u3002",
    options: [
      {
        id: "a",
        label: "\u30A8\u30A2\u30B3\u30F3\u3092\u8CB7\u3046",
        desc: "\u4F53\u3092\u5B88\u308C\u308B\u3002\u8CBB\u7528\u3068\u96FB\u6C17\u4EE3\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          },
          {
            type: "health",
            value: 0.97
          }
        ],
        result: "\u79FB\u52D5\u5F0F\u306E\u30A8\u30A2\u30B3\u30F3\u3092\u8CB7\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6DBC\u3057\u3044\u516C\u5171\u65BD\u8A2D\u3067\u904E\u3054\u3059",
        desc: "\u51FA\u8CBB\u306F\u306A\u3044\u3002\u6BCE\u65E5\u306E\u79FB\u52D5\u304C\u8CA0\u62C5\u3002",
        effects: [
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u663C\u9593\u306F\u56F3\u66F8\u9928\u3067\u904E\u3054\u3057\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB20\u5E74\u306E\u3046\u306119\u5E74\u3067\u71B1\u6CE2\u8B66\u5831\uFF08M\xE9t\xE9o-France\u30FB\u516C\u8846\u885B\u751F\u5E81\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "fra_prepa",
    iso3: [
      "FRA"
    ],
    minAge: 18,
    maxAge: 19,
    annualProb: 0.05,
    requires: "student",
    title: "\u30B0\u30E9\u30F3\u30BC\u30B3\u30FC\u30EB\u6E96\u5099\u7D1A",
    situation: "\u30D0\u30AB\u30ED\u30EC\u30A2\u306B\u5408\u683C\u3057\u3001\u5927\u5B66\u306B\u9032\u3080\u304B\u3001\u96E3\u95A2\u6821\u3092\u76EE\u6307\u3059\u6E96\u5099\u7D1A\uFF08\u30D7\u30EC\u30D1\uFF09\u306B\u9032\u3080\u304B\u9078\u3076\u3053\u3068\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6E96\u5099\u7D1A\u306B\u9032\u3080",
        desc: "\u96E3\u95A2\u6821\u3078\u306E\u9053\u304C\u958B\u3051\u308B\u30022\u5E74\u9593\u3001\u52C9\u5F37\u6F2C\u3051\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 1.07
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u6E96\u5099\u7D1A\u306B\u5165\u5B66\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5927\u5B66\u306B\u9032\u3080",
        desc: "\u81EA\u5206\u306E\u30DA\u30FC\u30B9\u3067\u5B66\u3079\u308B\u3002\u5C31\u8077\u3067\u306F\u3084\u3084\u4E0D\u5229\u306B\u306A\u308B\u3053\u3068\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 1.02
          },
          {
            type: "cost",
            value: 3e4
          }
        ],
        result: "\u5927\u5B66\u306B\u5165\u5B66\u3057\u305F\u3002"
      }
    ],
    basis: "\u30D0\u30AB\u30ED\u30EC\u30A2\u5408\u683C\u8005\u7D0473\u4E07\u4EBA\u306E\u3046\u3061\u6E96\u5099\u7D1A\uFF08CPGE\uFF09\u306B\u9032\u3080\u306E\u306F\u7D044.3\u4E07\u4EBA\u3067\u7D046%\uFF08\u9AD8\u7B49\u6559\u80B2\u7701\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "fra_creche",
    iso3: [
      "FRA"
    ],
    minAge: 25,
    maxAge: 45,
    annualProb: 0.08,
    requires: "kid:0-2",
    title: "\u4FDD\u80B2\u6240\u306E\u7533\u3057\u8FBC\u307F",
    situation: "\u516C\u7ACB\u4FDD\u80B2\u6240\uFF08\u30AF\u30EC\u30C3\u30B7\u30E5\uFF09\u306B\u7533\u3057\u8FBC\u3093\u3060\u304C\u3001\u7A7A\u304D\u304C\u51FA\u308B\u306E\u306F1\u5E74\u5F8C\u3068\u8A00\u308F\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u8A8D\u5B9A\u4FDD\u80B2\u30DE\u30DE\u306B\u9810\u3051\u308B",
        desc: "\u4ED5\u4E8B\u306B\u623B\u308C\u308B\u3002\u8CBB\u7528\u304C\u5C11\u3057\u9AD8\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          },
          {
            type: "careerMult",
            value: 1.01
          }
        ],
        result: "\u8FD1\u6240\u306E\u4FDD\u80B2\u30DE\u30DE\u306B\u9810\u3051\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u80B2\u5150\u4F11\u696D\u3092\u5EF6\u3070\u3059",
        desc: "\u5B50\u3069\u3082\u3068\u904E\u3054\u305B\u308B\u3002\u7D66\u4ED8\u306F\u5C11\u306A\u304F\u3001\u53CE\u5165\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.4
          },
          {
            type: "careerMult",
            value: 0.98
          }
        ],
        result: "\u80B2\u5150\u4F11\u696D\u3092\u5EF6\u9577\u3057\u305F\u3002"
      }
    ],
    basis: "\u6BCD\u89AA\u306E37%\u304C\u4FDD\u80B2\u6240\u63A2\u3057\u306B\u5236\u7D04\u30FB\u4E0D\u6E80\u3092\u7D4C\u9A13\uFF08DREES\u30FB\u4E0A\u9662\u306E\u5831\u544A\u66F8\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "mex_migrate_us",
    iso3: [
      "MEX"
    ],
    minAge: 18,
    maxAge: 40,
    annualProb: 7e-3,
    requires: null,
    title: "\u7C73\u56FD\u3078\u50CD\u304D\u306B\u884C\u304F\u8A71",
    situation: "\u7C73\u56FD\u3067\u50CD\u304F\u3044\u3068\u3053\u304B\u3089\u3001\u8FB2\u5834\u306E\u4ED5\u4E8B\u304C\u3042\u308B\u3068\u9023\u7D61\u304C\u6765\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u7C73\u56FD\u3078\u50CD\u304D\u306B\u884C\u304F",
        desc: "\u53CE\u5165\u304C\u5927\u304D\u304F\u5897\u3048\u3001\u5BB6\u65CF\u306B\u9001\u91D1\u3067\u304D\u308B\u3002\u5BB6\u65CF\u3068\u96E2\u308C\u3001\u79FB\u52D5\u306B\u3082\u5371\u967A\u304C\u4F34\u3046\u3002",
        effects: [
          {
            type: "moveCost",
            value: 8e5
          },
          {
            type: "careerMult",
            value: 1.3
          },
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u56FD\u5883\u3092\u8D8A\u3048\u3001\u8FB2\u5834\u3067\u50CD\u304D\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5730\u5143\u306B\u6B8B\u308A\u3001\u3044\u3068\u3053\u306E\u9001\u91D1\u3092\u983C\u308A\u306B\u3059\u308B",
        desc: "\u5BB6\u65CF\u3068\u66AE\u3089\u305B\u308B\u3002\u4ED5\u4E8B\u306E\u9078\u629E\u80A2\u306F\u5C11\u306A\u3044\u3002",
        effects: [
          {
            type: "income",
            value: 2e5
          },
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u5730\u5143\u3067\u50CD\u304D\u306A\u304C\u3089\u3001\u6642\u3005\u306E\u9001\u91D1\u3092\u53D7\u3051\u53D6\u3063\u305F\u3002"
      }
    ],
    basis: "2018\u301C2023\u5E74\u306E\u7D045\u5E74\u3067\u7D04107\u4E07\u4EBA\u304C\u7C73\u56FD\u3078\u79FB\u4F4F\u3001\u5E740.17%\uFF08INEGI ENADID 2023\uFF09\u300218\u301C40\u6B73\u306B\u9650\u308B\u3068\u5E740.4%\u524D\u5F8C\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "mex_security",
    iso3: [
      "MEX"
    ],
    minAge: 20,
    maxAge: 70,
    annualProb: 0.05,
    requires: null,
    title: "\u5730\u57DF\u306E\u6CBB\u5B89\u306E\u60AA\u5316",
    situation: "\u5730\u5143\u3067\u72AF\u7F6A\u7D44\u7E54\u306B\u3088\u308B\u4E8B\u4EF6\u304C\u5897\u3048\u3001\u591C\u306E\u5916\u51FA\u3084\u5546\u58F2\u306B\u4E0D\u5B89\u3092\u611F\u3058\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5225\u306E\u753A\u306B\u5F15\u3063\u8D8A\u3059",
        desc: "\u5B89\u5FC3\u3057\u3066\u66AE\u3089\u305B\u308B\u3002\u4ED5\u4E8B\u3068\u4EBA\u9593\u95A2\u4FC2\u3092\u5931\u3046\u3002",
        effects: [
          {
            type: "moveCost",
            value: 3e5
          },
          {
            type: "health",
            value: 0.98
          }
        ],
        result: "\u89AA\u621A\u306E\u3044\u308B\u753A\u306B\u79FB\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5E97\u306E\u55B6\u696D\u6642\u9593\u3092\u77ED\u304F\u3059\u308B",
        desc: "\u5730\u5143\u306B\u6B8B\u308C\u308B\u3002\u58F2\u308A\u4E0A\u3052\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.15
          }
        ],
        result: "\u65E5\u304C\u66AE\u308C\u308B\u524D\u306B\u5E97\u3092\u9589\u3081\u308B\u3088\u3046\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "18\u6B73\u4EE5\u4E0A\u306E24%\u304C\u904E\u53BB1\u5E74\u306B\u72AF\u7F6A\u306E\u88AB\u5BB3\u3092\u53D7\u3051\u305F\uFF08INEGI ENVIPE 2025\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "mex_formal_job",
    iso3: [
      "MEX"
    ],
    minAge: 18,
    maxAge: 45,
    annualProb: 0.12,
    requires: "working",
    title: "\u793E\u4F1A\u4FDD\u967A\u306E\u3042\u308B\u4ED5\u4E8B",
    situation: "\u5C4B\u53F0\u306E\u4ED5\u4E8B\u3088\u308A\u7D66\u6599\u306F\u5C11\u3057\u4F4E\u3044\u304C\u3001\u793E\u4F1A\u4FDD\u967A\uFF08IMSS\uFF09\u306B\u5165\u308C\u308B\u5DE5\u5834\u306E\u4ED5\u4E8B\u3092\u7D39\u4ECB\u3055\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5DE5\u5834\u306E\u6B63\u898F\u306E\u4ED5\u4E8B\u306B\u5C31\u304F",
        desc: "\u533B\u7642\u3068\u5E74\u91D1\u306E\u4FDD\u969C\u304C\u3042\u308B\u3002\u624B\u53D6\u308A\u306F\u6E1B\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 1.02
          },
          {
            type: "health",
            value: 0.98
          },
          {
            type: "incomeDropPct",
            value: 0.05
          }
        ],
        result: "\u5DE5\u5834\u3067\u50CD\u304D\u306F\u3058\u3081\u3001IMSS\u306B\u52A0\u5165\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5C4B\u53F0\u306E\u4ED5\u4E8B\u3092\u7D9A\u3051\u308B",
        desc: "\u624B\u53D6\u308A\u306F\u591A\u3044\u3002\u75C5\u6C17\u3084\u8001\u5F8C\u306E\u4FDD\u969C\u304C\u306A\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u5C4B\u53F0\u3092\u7D9A\u3051\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u30A4\u30F3\u30D5\u30A9\u30FC\u30DE\u30EB\u304B\u3089\u30D5\u30A9\u30FC\u30DE\u30EB\u306E\u4ED5\u4E8B\u3078\u5E7427%\u304C\u79FB\u308B\uFF08ENOE \u306E\u5206\u6790\uFF09\u3002\u50CD\u304F\u4EBA\u306E\u7D0455%\u304C\u30A4\u30F3\u30D5\u30A9\u30FC\u30DE\u30EB\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "mex_earthquake",
    iso3: [
      "MEX"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 1e-3,
    requires: "urban",
    title: "\u5927\u5730\u9707",
    situation: "\u5F37\u3044\u5730\u9707\u304C\u8D77\u304D\u3001\u4F4F\u3093\u3067\u3044\u308B\u5EFA\u7269\u306E\u58C1\u306B\u3072\u3073\u304C\u5165\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u88DC\u4FEE\u3057\u3066\u4F4F\u307F\u7D9A\u3051\u308B",
        desc: "\u4F4F\u307F\u6163\u308C\u305F\u5BB6\u306B\u3044\u3089\u308C\u308B\u3002\u5B89\u5168\u9762\u306E\u4E0D\u5B89\u304C\u6B8B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u58C1\u3092\u88DC\u4FEE\u3057\u3066\u4F4F\u307F\u7D9A\u3051\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5225\u306E\u4F4F\u307E\u3044\u306B\u79FB\u308B",
        desc: "\u5B89\u5FC3\u3067\u304D\u308B\u3002\u5F15\u3063\u8D8A\u3057\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 4e5
          }
        ],
        result: "\u65B0\u3057\u3044\u5EFA\u7269\u306B\u79FB\u3063\u305F\u3002"
      }
    ],
    basis: "2017\u5E749\u6708\u306E\u5730\u9707\u306E\u88AB\u5BB3\u4F4F\u5B85\u306F17.1\u4E07\u6238\u3067\u5168\u4F4F\u5B85\u306E0.5%\uFF08CENAPRED\uFF09\u3002\u5927\u304D\u306A\u88AB\u5BB3\u306F\u6570\u5341\u5E74\u306B\u4E00\u5EA6\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "mex_hurricane",
    iso3: [
      "MEX"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.015,
    requires: null,
    title: "\u30CF\u30EA\u30B1\u30FC\u30F3",
    situation: "\u5927\u578B\u306E\u30CF\u30EA\u30B1\u30FC\u30F3\u304C\u4E0A\u9678\u3057\u3001\u5C4B\u6839\u3068\u5BB6\u8CA1\u304C\u88AB\u5BB3\u3092\u53D7\u3051\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u501F\u91D1\u3092\u3057\u3066\u5BB6\u3092\u76F4\u3059",
        desc: "\u3059\u3050\u306B\u5143\u306E\u66AE\u3089\u3057\u306B\u623B\u308C\u308B\u3002\u8FD4\u6E08\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          }
        ],
        result: "\u5C4B\u6839\u3092\u76F4\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u652F\u63F4\u3092\u5F85\u3061\u306A\u304C\u3089\u4EEE\u4F4F\u307E\u3044\u3059\u308B",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u4E0D\u4FBF\u306A\u751F\u6D3B\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 8e4
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u652F\u63F4\u7269\u8CC7\u3092\u53D7\u3051\u53D6\u308A\u306A\u304C\u3089\u4EEE\u4F4F\u307E\u3044\u3092\u3057\u305F\u3002"
      }
    ],
    basis: "2023\u5E74\u306B\u81EA\u7136\u707D\u5BB3\uFF08\u4E3B\u306B\u30CF\u30EA\u30B1\u30FC\u30F3\u30FB\u8C6A\u96E8\uFF09\u306E\u88AB\u5BB3\u3092\u53D7\u3051\u305F\u4EBA\u306F315\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E2.5%\uFF08CENAPRED\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "phl_ofw",
    iso3: [
      "PHL"
    ],
    minAge: 22,
    maxAge: 45,
    annualProb: 0.01,
    requires: "working",
    title: "\u6D77\u5916\u5C31\u52B4\uFF08OFW\uFF09",
    situation: "\u4E2D\u6771\u306E\u75C5\u9662\u3084\u9999\u6E2F\u306E\u5BB6\u5EAD\u3067\u50CD\u304F\u4ED5\u4E8B\u306E\u52DF\u96C6\u304C\u3042\u308A\u3001\u5FDC\u52DF\u3059\u308B\u304B\u8003\u3048\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6D77\u5916\u3067\u50CD\u304F",
        desc: "\u53CE\u5165\u306F\u56FD\u5185\u306E\u6570\u500D\u3067\u3001\u5BB6\u65CF\u306B\u4ED5\u9001\u308A\u3067\u304D\u308B\u3002\u4F55\u5E74\u3082\u5BB6\u65CF\u3068\u96E2\u308C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 1.25
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u5951\u7D04\u66F8\u306B\u30B5\u30A4\u30F3\u3057\u3001\u6D77\u5916\u3078\u6E21\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u56FD\u5185\u3067\u50CD\u304D\u7D9A\u3051\u308B",
        desc: "\u5BB6\u65CF\u3068\u66AE\u3089\u305B\u308B\u3002\u53CE\u5165\u306F\u4F38\u3073\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u30DE\u30CB\u30E9\u3067\u50CD\u304D\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u6D77\u5916\u3067\u50CD\u304F\u30D5\u30A3\u30EA\u30D4\u30F3\u4EBA\u306F\u7D04216\u4E07\u4EBA\u3067\u3001\u5C31\u696D\u8005\u306E\u7D044.5%\uFF08PSA Survey on Overseas Filipinos 2023\u3001\u4E8C\u6B21\u60C5\u5831\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "phl_typhoon",
    iso3: [
      "PHL"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.06,
    requires: null,
    title: "\u53F0\u98A8",
    situation: "\u5F37\u3044\u53F0\u98A8\u304C\u76F4\u6483\u3057\u3001\u5BB6\u306E\u5C4B\u6839\u304C\u98DB\u3070\u3055\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u501F\u91D1\u3092\u3057\u3066\u5BB6\u3092\u76F4\u3059",
        desc: "\u3059\u3050\u306B\u5143\u306E\u66AE\u3089\u3057\u306B\u623B\u308C\u308B\u3002\u8FD4\u6E08\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          }
        ],
        result: "\u30C8\u30BF\u30F3\u677F\u3092\u8CB7\u3063\u3066\u5C4B\u6839\u3092\u76F4\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u907F\u96E3\u6240\u3067\u652F\u63F4\u3092\u5F85\u3064",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u4E0D\u4FBF\u306A\u751F\u6D3B\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u4F53\u80B2\u9928\u3067\u652F\u63F4\u7269\u8CC7\u3092\u53D7\u3051\u53D6\u308A\u306A\u304C\u3089\u904E\u3054\u3057\u305F\u3002"
      }
    ],
    basis: "2023\u5E74\u306B\u53F0\u98A8\u306E\u88AB\u5BB3\u3092\u53D7\u3051\u305F\u4EBA\u306F\u7D04864\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E\u7D048%\uFF08EM-DAT\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "phl_commute",
    iso3: [
      "PHL"
    ],
    minAge: 20,
    maxAge: 60,
    annualProb: 0.05,
    requires: "urban+working",
    title: "\u30DE\u30CB\u30E9\u306E\u901A\u52E4",
    situation: "\u6E0B\u6EDE\u304C\u3072\u3069\u304F\u3001\u7247\u90532\u6642\u9593\u4EE5\u4E0A\u304B\u3051\u3066\u901A\u52E4\u3057\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u8077\u5834\u306E\u8FD1\u304F\u306B\u90E8\u5C4B\u3092\u501F\u308A\u308B",
        desc: "\u6642\u9593\u3068\u4F53\u529B\u304C\u623B\u308B\u3002\u5BB6\u8CC3\u304C\u4E8C\u91CD\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u5E73\u65E5\u3060\u3051\u8077\u5834\u8FD1\u304F\u306E\u90E8\u5C4B\u306B\u4F4F\u3080\u3053\u3068\u306B\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4ECA\u306E\u307E\u307E\u901A\u3046",
        desc: "\u51FA\u8CBB\u306F\u5897\u3048\u306A\u3044\u3002\u75B2\u308C\u304C\u629C\u3051\u306A\u3044\u3002",
        effects: [
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u30B8\u30FC\u30D7\u30CB\u30FC\u3068\u30D0\u30B9\u3092\u4E57\u308A\u7D99\u3044\u3067\u901A\u3044\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u30DE\u30CB\u30E9\u9996\u90FD\u570F\u306F\u4E16\u754C\u3067\u3082\u6E0B\u6EDE\u306E\u6FC0\u3057\u3044\u90FD\u5E02\u306E\u4E00\u3064\uFF08TomTom Traffic Index\uFF09",
    estimated: true
  },
  {
    id: "phl_hospital_deposit",
    iso3: [
      "PHL"
    ],
    minAge: 0,
    maxAge: 90,
    annualProb: 0.05,
    requires: null,
    title: "\u5165\u9662\u306E\u524D\u6255\u3044\u91D1",
    situation: "\u5BB6\u65CF\u304C\u5165\u9662\u3059\u308B\u3053\u3068\u306B\u306A\u308A\u3001\u75C5\u9662\u304B\u3089\u524D\u6255\u3044\u91D1\u3092\u6C42\u3081\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u89AA\u621A\u304B\u3089\u501F\u308A\u3066\u79C1\u7ACB\u75C5\u9662\u3078",
        desc: "\u3059\u3050\u306B\u6CBB\u7642\u304C\u53D7\u3051\u3089\u308C\u308B\u3002\u501F\u91D1\u304C\u6B8B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          },
          {
            type: "health",
            value: 0.97
          }
        ],
        result: "\u89AA\u621A\u306B\u501F\u308A\u3066\u524D\u6255\u3044\u91D1\u3092\u6255\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u516C\u7ACB\u75C5\u9662\u3067\u9806\u756A\u3092\u5F85\u3064",
        desc: "\u8CBB\u7528\u306F\u5B89\u3044\u3002\u6DF7\u96D1\u3057\u3066\u3044\u3066\u5F85\u3061\u6642\u9593\u304C\u9577\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u516C\u7ACB\u75C5\u9662\u306E\u5ECA\u4E0B\u3067\u9806\u756A\u3092\u5F85\u3063\u305F\u3002"
      }
    ],
    basis: "\u516C\u7684\u533B\u7642\u4FDD\u967A\uFF08PhilHealth\uFF09\u306E\u8ACB\u6C42\u306F\u5E74\u7D04940\u4E07\u4EF6\u3067\u4EBA\u53E3\u306E\u7D048%\uFF082024\u5E74\uFF09\u3002\u5BB6\u65CF\u306E\u8AB0\u304B\u306E\u5165\u9662\u306E\u5834\u9762\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "egy_pound_drop",
    iso3: [
      "EGY"
    ],
    minAge: 20,
    maxAge: 80,
    annualProb: 0.04,
    requires: null,
    title: "\u30DD\u30F3\u30C9\u306E\u5207\u308A\u4E0B\u3052",
    situation: "\u30A8\u30B8\u30D7\u30C8\u30FB\u30DD\u30F3\u30C9\u304C\u5207\u308A\u4E0B\u3052\u3089\u308C\u3001\u8F38\u5165\u54C1\u306E\u5024\u6BB5\u304C\u4E00\u6C17\u306B\u4E0A\u304C\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30DD\u30F3\u30C9\u306E\u307E\u307E\u9810\u91D1\u3059\u308B",
        desc: "\u9AD8\u3044\u91D1\u5229\u304C\u4ED8\u304F\u3002\u7269\u4FA1\u4E0A\u6607\u306B\u8FFD\u3044\u3064\u304B\u306A\u3044\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.3
          }
        ],
        result: "\u9810\u91D1\u3067\u8CB7\u3048\u308B\u7269\u304C\u6E1B\u3063\u3066\u3044\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u91D1\uFF08\u30B4\u30FC\u30EB\u30C9\uFF09\u3092\u8CB7\u3046",
        desc: "\u4FA1\u5024\u3092\u5B88\u308A\u3084\u3059\u3044\u3002\u58F2\u308A\u8CB7\u3044\u306E\u5DEE\u984D\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          },
          {
            type: "protectCash",
            value: true
          }
        ],
        result: "\u8CAF\u91D1\u306E\u4E00\u90E8\u3067\u91D1\u3092\u8CB7\u3063\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB30\u5E74\u306E\u3046\u30613\u5E74\u3067\u30A8\u30B8\u30D7\u30C8\u30FB\u30DD\u30F3\u30C9\u304C1\u5E74\u306B30%\u4EE5\u4E0A\u4E0B\u843D\uFF082016\u30FB2022\u30FB2024\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "egy_bread_subsidy",
    iso3: [
      "EGY"
    ],
    minAge: 18,
    maxAge: 90,
    annualProb: 0.02,
    requires: null,
    title: "\u88DC\u52A9\u91D1\u4ED8\u304D\u30D1\u30F3\u306E\u5024\u4E0A\u3052",
    situation: "\u914D\u7D66\u30AB\u30FC\u30C9\u3067\u8CB7\u3048\u308B\u88DC\u52A9\u91D1\u4ED8\u304D\u30D1\u30F3\u306E\u5024\u6BB5\u304C\u5927\u304D\u304F\u5F15\u304D\u4E0A\u3052\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u307B\u304B\u306E\u98DF\u8CBB\u3092\u524A\u308B",
        desc: "\u30D1\u30F3\u306F\u4ECA\u307E\u3067\u3069\u304A\u308A\u8CB7\u3048\u308B\u3002\u98DF\u4E8B\u306E\u8CEA\u304C\u843D\u3061\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u8089\u3092\u8CB7\u3046\u56DE\u6570\u3092\u6E1B\u3089\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u526F\u696D\u3092\u59CB\u3081\u308B",
        desc: "\u53CE\u5165\u3092\u88DC\u3048\u308B\u3002\u4F11\u3080\u6642\u9593\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "income",
            value: 5e4
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u591C\u306B\u914D\u9054\u306E\u4ED5\u4E8B\u3092\u59CB\u3081\u305F\u3002"
      }
    ],
    basis: "\u4EBA\u53E3\u306E\u7D0455%\u304C\u88DC\u52A9\u91D1\u4ED8\u304D\u30D1\u30F3\u3092\u53D7\u7D66\u3002\u5024\u4E0A\u3052\u306F2024\u5E74\u304C36\u5E74\u3076\u308A\uFF08\u7C73\u56FD\u8FB2\u52D9\u7701\u306E\u5831\u544A\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "egy_tutoring",
    iso3: [
      "EGY"
    ],
    minAge: 40,
    maxAge: 60,
    annualProb: 0.2,
    requires: "kid:16-18",
    title: "\u9AD8\u6821\u5352\u696D\u8A66\u9A13\u3068\u5BB6\u5EAD\u6559\u5E2B",
    situation: "\u5B50\u3069\u3082\u304C\u9AD8\u6821\u5352\u696D\u8A66\u9A13\uFF08\u30B5\u30CA\u30A6\u30A7\u30A4\u30E4\u30FB\u30A2\u30F3\u30DE\uFF09\u3092\u63A7\u3048\u3001\u307B\u3068\u3093\u3069\u306E\u540C\u7D1A\u751F\u304C\u79C1\u587E\u306B\u901A\u3063\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u79C1\u587E\u3068\u5BB6\u5EAD\u6559\u5E2B\u3092\u4ED8\u3051\u308B",
        desc: "\u5FD7\u671B\u306E\u5B66\u90E8\u3092\u72D9\u3044\u3084\u3059\u3044\u3002\u5BB6\u8A08\u306E\u8CA0\u62C5\u304C\u91CD\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          }
        ],
        result: "\u6BCE\u6669\u306E\u79C1\u587E\u901A\u3044\u304C\u59CB\u307E\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5B66\u6821\u306E\u6388\u696D\u3068\u72EC\u5B66\u3067\u81E8\u3080",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u70B9\u6570\u3067\u4E0D\u5229\u306B\u306A\u308B\u304A\u305D\u308C\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          }
        ],
        result: "\u5BB6\u3067\u4E00\u7DD2\u306B\u904E\u53BB\u554F\u3092\u89E3\u3044\u305F\u3002"
      }
    ],
    basis: "\u9AD8\u6821\u751F\u306E42\u301C60%\u304C\u79C1\u587E\u30FB\u5BB6\u5EAD\u6559\u5E2B\u3092\u4F7F\u3046\uFF08CAPMAS \u306E\u5831\u544A\u3001\u4E8C\u6B21\u60C5\u5831\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "egy_gulf_work",
    iso3: [
      "EGY"
    ],
    minAge: 22,
    maxAge: 45,
    annualProb: 0.03,
    requires: "working",
    title: "\u6E7E\u5CB8\u8AF8\u56FD\u3067\u306E\u4ED5\u4E8B",
    situation: "\u30B5\u30A6\u30B8\u30A2\u30E9\u30D3\u30A2\u306E\u4F1A\u793E\u304B\u3089\u3001\u6280\u8853\u8005\u3068\u3057\u3066\u50CD\u304B\u306A\u3044\u304B\u3068\u8A98\u308F\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6E7E\u5CB8\u3067\u50CD\u304F",
        desc: "\u53CE\u5165\u304C\u5927\u304D\u304F\u5897\u3048\u308B\u3002\u5BB6\u65CF\u3068\u96E2\u308C\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 2e5
          },
          {
            type: "careerMult",
            value: 1.2
          }
        ],
        result: "\u30B8\u30C3\u30C0\u306E\u4F1A\u793E\u3067\u50CD\u304D\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u56FD\u5185\u306B\u6B8B\u308B",
        desc: "\u5BB6\u65CF\u3068\u66AE\u3089\u305B\u308B\u3002\u7269\u4FA1\u9AD8\u306E\u4E2D\u3067\u53CE\u5165\u306F\u4F38\u3073\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u30AB\u30A4\u30ED\u3067\u50CD\u304D\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u30A2\u30E9\u30D6\u8AF8\u56FD\u3067\u50CD\u304F\u305F\u3081\u306E\u8A31\u53EF\u306F\u5E7488.8\u4E07\u4EF6\u3067\u3001\u8CC3\u91D1\u3067\u50CD\u304F\u4EBA2,104\u4E07\u4EBA\u306E\u7D044%\uFF08CAPMAS 2023\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "egy_marriage_home",
    iso3: [
      "EGY"
    ],
    minAge: 22,
    maxAge: 33,
    annualProb: 0.08,
    requires: "newlywed",
    title: "\u7D50\u5A5A\u3068\u65B0\u5C45\u306E\u6E96\u5099",
    situation: "\u5A5A\u7D04\u304C\u6C7A\u307E\u308A\u3001\u6163\u7FD2\u3068\u3057\u3066\u65B0\u90CE\u5074\u304C\u4F4F\u307E\u3044\u3068\u5BB6\u5177\u3092\u305D\u308D\u3048\u308B\u3053\u3068\u3092\u671F\u5F85\u3055\u308C\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u5BB6\u65CF\u306E\u63F4\u52A9\u3092\u53D7\u3051\u3066\u65B0\u5C45\u3092\u7528\u610F\u3059\u308B",
        desc: "\u6163\u7FD2\u3069\u304A\u308A\u306B\u7D50\u5A5A\u3067\u304D\u308B\u3002\u5BB6\u65CF\u306B\u501F\u91D1\u304C\u6B8B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e6
          }
        ],
        result: "\u89AA\u65CF\u306E\u63F4\u52A9\u3067\u90E8\u5C4B\u3092\u501F\u308A\u3001\u5BB6\u5177\u3092\u305D\u308D\u3048\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4E21\u89AA\u306E\u5BB6\u306B\u540C\u5C45\u3057\u3066\u59CB\u3081\u308B",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u6C17\u3092\u3064\u304B\u3046\u751F\u6D3B\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u3057\u3070\u3089\u304F\u4E21\u89AA\u306E\u5BB6\u3067\u66AE\u3089\u3059\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u7D50\u5A5A\u8CBB\u7528\u306E\u9AD8\u9A30\u304C\u6669\u5A5A\u5316\u306E\u4E00\u56E0\u3068\u3055\u308C\u308B\uFF08CAPMAS\u3001\u5831\u9053\uFF09",
    estimated: true
  },
  {
    id: "eth_birr_float",
    iso3: [
      "ETH"
    ],
    minAge: 20,
    maxAge: 80,
    annualProb: 0.04,
    requires: null,
    title: "\u30D6\u30EB\u306E\u5207\u308A\u4E0B\u3052",
    situation: "\u70BA\u66FF\u304C\u81EA\u7531\u5316\u3055\u308C\u3001\u30D6\u30EB\u306E\u4FA1\u5024\u304C\u534A\u5206\u4EE5\u4E0B\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30D6\u30EB\u306E\u307E\u307E\u6301\u3064",
        desc: "\u624B\u9593\u306F\u306A\u3044\u3002\u8CAF\u91D1\u306E\u4FA1\u5024\u304C\u5927\u304D\u304F\u6E1B\u308B\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.35
          }
        ],
        result: "\u8F38\u5165\u54C1\u306E\u5024\u6BB5\u304C\u500D\u306B\u306A\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u755C\u3084\u5EFA\u6750\u306B\u66FF\u3048\u308B",
        desc: "\u4FA1\u5024\u3092\u5B88\u308A\u3084\u3059\u3044\u3002\u3059\u3050\u306B\u306F\u73FE\u91D1\u306B\u3067\u304D\u306A\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          },
          {
            type: "protectCash",
            value: true
          }
        ],
        result: "\u8CAF\u91D1\u3067\u725B\u3092\u8CB7\u3063\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB30\u5E74\u3067\u30D6\u30EB\u304C1\u5E74\u306B30%\u4EE5\u4E0A\u4E0B\u304C\u3063\u305F\u306E\u306F2024\u5E74\u306E\u5909\u52D5\u76F8\u5834\u5236\u3078\u306E\u79FB\u884C\u306E\u307F\uFF08\u4E2D\u592E\u9280\u884C\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "eth_drought",
    iso3: [
      "ETH"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.03,
    requires: "rural",
    title: "\u5E72\u3070\u3064",
    situation: "\u96E8\u5B63\u306E\u96E8\u304C\u307B\u3068\u3093\u3069\u964D\u3089\u305A\u3001\u5BB6\u755C\u304C\u5F31\u308A\u3001\u7551\u306F\u4E7E\u304D\u304D\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5BB6\u755C\u3092\u58F2\u3063\u3066\u98DF\u6599\u3092\u8CB7\u3046",
        desc: "\u5BB6\u65CF\u306E\u98DF\u3079\u7269\u3092\u78BA\u4FDD\u3067\u304D\u308B\u3002\u8CA1\u7523\u3092\u5931\u3046\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.3
          }
        ],
        result: "\u725B\u3092\u5B89\u5024\u3067\u624B\u653E\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u98DF\u6599\u652F\u63F4\u3092\u53D7\u3051\u306A\u304C\u3089\u8010\u3048\u308B",
        desc: "\u5BB6\u755C\u3092\u6B8B\u305B\u308B\u3002\u98DF\u4E8B\u304C\u8DB3\u308A\u306A\u3044\u65E5\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "health",
            value: 1.05
          }
        ],
        result: "\u914D\u7D66\u6240\u306B\u4E26\u3093\u3067\u7A40\u7269\u3092\u53D7\u3051\u53D6\u3063\u305F\u3002"
      }
    ],
    basis: "2023\u5E74\u306B\u5E72\u3070\u3064\u3067\u98DF\u6599\u652F\u63F4\u3092\u53D7\u3051\u305F\u4EBA\u306F\u7D041,100\u4E07\u4EBA\u3067\u8FB2\u6751\u4EBA\u53E3\u306E\u7D0410%\uFF08OCHA\uFF09\u3002\u5927\u304D\u306A\u5E72\u3070\u3064\u306F\u6570\u5E74\u306B\u4E00\u5EA6\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "eth_conflict_move",
    iso3: [
      "ETH"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 8e-3,
    requires: null,
    title: "\u5730\u57DF\u306E\u885D\u7A81\u306B\u3088\u308B\u907F\u96E3",
    situation: "\u4F4F\u3093\u3067\u3044\u308B\u5730\u57DF\u3067\u6B66\u529B\u885D\u7A81\u304C\u8D77\u304D\u3001\u591A\u304F\u306E\u5BB6\u65CF\u304C\u753A\u3092\u96E2\u308C\u306F\u3058\u3081\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u89AA\u621A\u306E\u3044\u308B\u753A\u3078\u907F\u96E3\u3059\u308B",
        desc: "\u5B89\u5168\u3092\u78BA\u4FDD\u3067\u304D\u308B\u3002\u5BB6\u3068\u4ED5\u4E8B\u3092\u6B8B\u3057\u3066\u3044\u304F\u3002",
        effects: [
          {
            type: "moveCost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 0.92
          }
        ],
        result: "\u8377\u7269\u3092\u307E\u3068\u3081\u3066\u89AA\u621A\u306E\u753A\u3078\u79FB\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u306B\u3068\u3069\u307E\u308B",
        desc: "\u5BB6\u3068\u7551\u3092\u5B88\u308C\u308B\u3002\u7269\u8CC7\u304C\u5C4A\u304D\u306B\u304F\u304F\u3001\u4E0D\u5B89\u306A\u65E5\u3005\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "health",
            value: 1.05
          },
          {
            type: "incomeDropPct",
            value: 0.3
          }
        ],
        result: "\u5BB6\u306B\u3068\u3069\u307E\u308A\u3001\u72B6\u6CC1\u304C\u843D\u3061\u7740\u304F\u306E\u3092\u5F85\u3063\u305F\u3002"
      }
    ],
    basis: "2022\u5E74\u306B\u7D1B\u4E89\u3067\u65B0\u305F\u306B\u907F\u96E3\u3057\u305F\u4EBA\u306F\u7D04200\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E\u7D041.5%\uFF08IDMC\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "eth_cbhi",
    iso3: [
      "ETH"
    ],
    minAge: 18,
    maxAge: 70,
    annualProb: 0.05,
    requires: "rural",
    title: "\u5730\u57DF\u533B\u7642\u4FDD\u967A\u3078\u306E\u52A0\u5165",
    situation: "\u6751\u3067\u5730\u57DF\u533B\u7642\u4FDD\u967A\uFF08CBHI\uFF09\u306E\u52A0\u5165\u53D7\u4ED8\u304C\u3042\u308A\u3001\u5E74\u4F1A\u8CBB\u3092\u6255\u3046\u304B\u5BB6\u65CF\u3067\u76F8\u8AC7\u3057\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u52A0\u5165\u3059\u308B",
        desc: "\u8A3A\u7642\u6240\u3067\u307B\u307C\u7121\u6599\u3067\u8A3A\u3066\u3082\u3089\u3048\u308B\u3002\u5E74\u4F1A\u8CBB\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e4
          },
          {
            type: "health",
            value: 0.97
          }
        ],
        result: "\u5BB6\u65CF\u5168\u54E1\u3067\u52A0\u5165\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u52A0\u5165\u3057\u306A\u3044",
        desc: "\u624B\u5143\u306B\u304A\u91D1\u304C\u6B8B\u308B\u3002\u75C5\u6C17\u306E\u3068\u304D\u306F\u5168\u984D\u81EA\u5DF1\u8CA0\u62C5\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u4F1A\u8CBB\u306E\u5206\u3092\u7A2E\u306E\u8CFC\u5165\u306B\u56DE\u3057\u305F\u3002"
      }
    ],
    basis: "\u5730\u57DF\u533B\u7642\u4FDD\u967A\u306E\u5B9F\u65BD\u5730\u57DF\u3067\u306E\u52A0\u5165\u7387\u306F\u7D0440%\uFF08\u7CFB\u7D71\u7684\u30EC\u30D3\u30E5\u30FC 2023\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "eth_gulf_work",
    iso3: [
      "ETH"
    ],
    minAge: 18,
    maxAge: 35,
    annualProb: 0.015,
    requires: null,
    title: "\u4E2D\u6771\u3078\u306E\u51FA\u7A3C\u304E",
    situation: "\u4EF2\u4ECB\u696D\u8005\u304B\u3089\u3001\u30B5\u30A6\u30B8\u30A2\u30E9\u30D3\u30A2\u3067\u5BB6\u4E8B\u3084\u5EFA\u8A2D\u306E\u4ED5\u4E8B\u304C\u3042\u308B\u3068\u52E7\u3081\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6B63\u898F\u306E\u624B\u7D9A\u304D\u3067\u51FA\u7A3C\u304E\u306B\u884C\u304F",
        desc: "\u4ED5\u9001\u308A\u3067\u5BB6\u65CF\u3092\u652F\u3048\u3089\u308C\u308B\u3002\u8A00\u8449\u3068\u6163\u7FD2\u306E\u9055\u3046\u56FD\u3067\u9577\u304F\u50CD\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          },
          {
            type: "careerMult",
            value: 1.15
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u653F\u5E9C\u306E\u767B\u9332\u3092\u6E08\u307E\u305B\u3066\u6E21\u822A\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u56FD\u5185\u3067\u50CD\u304D\u53E3\u3092\u63A2\u3059",
        desc: "\u5BB6\u65CF\u306E\u8FD1\u304F\u306B\u3044\u3089\u308C\u308B\u3002\u53CE\u5165\u306F\u5C11\u306A\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u30A2\u30C7\u30A3\u30B9\u30A2\u30D9\u30D0\u3067\u4ED5\u4E8B\u3092\u63A2\u3057\u305F\u3002"
      }
    ],
    basis: "\u6B63\u898F\u306E\u6D77\u5916\u5C31\u52B4\u306E\u51FA\u56FD\u306F\u5E74\u7D0418.8\u4E07\u4EBA\u306715\u301C34\u6B73\u4EBA\u53E3\u306E\u7D040.7%\uFF08\u52B4\u50CD\u30FB\u793E\u4F1A\u7701 2012\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "cod_displacement",
    iso3: [
      "COD"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.015,
    requires: null,
    title: "\u6771\u90E8\u306E\u885D\u7A81\u306B\u3088\u308B\u907F\u96E3",
    situation: "\u4F4F\u3093\u3067\u3044\u308B\u5730\u57DF\u306E\u8FD1\u304F\u3067\u6B66\u88C5\u52E2\u529B\u306E\u885D\u7A81\u304C\u8D77\u304D\u3001\u4F4F\u6C11\u306E\u591A\u304F\u304C\u907F\u96E3\u3092\u306F\u3058\u3081\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u907F\u96E3\u6C11\u30AD\u30E3\u30F3\u30D7\u3078\u79FB\u308B",
        desc: "\u5B89\u5168\u3068\u652F\u63F4\u3092\u5F97\u3089\u308C\u308B\u3002\u751F\u6D3B\u306E\u5834\u3092\u5931\u3046\u3002",
        effects: [
          {
            type: "moveCost",
            value: 5e4
          },
          {
            type: "health",
            value: 1.05
          },
          {
            type: "careerMult",
            value: 0.92
          }
        ],
        result: "\u30B4\u30DE\u8FD1\u90CA\u306E\u30AD\u30E3\u30F3\u30D7\u306B\u8EAB\u3092\u5BC4\u305B\u305F\u3002"
      },
      {
        id: "b",
        label: "\u9060\u304F\u306E\u89AA\u621A\u3092\u983C\u308B",
        desc: "\u30AD\u30E3\u30F3\u30D7\u3088\u308A\u843D\u3061\u7740\u3044\u3066\u66AE\u3089\u305B\u308B\u3002\u79FB\u52D5\u306B\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 0.95
          }
        ],
        result: "\u5225\u306E\u5DDE\u306E\u89AA\u621A\u306E\u5BB6\u306B\u79FB\u3063\u305F\u3002"
      }
    ],
    basis: "\u7D1B\u4E89\u306B\u3088\u308B\u65B0\u305F\u306A\u56FD\u5185\u907F\u96E3\u306F\u5E74\u5E73\u5747148\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E1.6%\uFF08IDMC\u3001\u904E\u53BB10\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "cod_epidemic",
    iso3: [
      "COD"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.02,
    requires: null,
    title: "\u611F\u67D3\u75C7\u306E\u6D41\u884C",
    situation: "\u5730\u57DF\u3067\u3001\u30B3\u30EC\u30E9\u306A\u3069\u306E\u611F\u67D3\u75C7\u306E\u6D41\u884C\u304C\u5831\u544A\u3055\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6D44\u6C34\u5264\u3092\u8CB7\u3044\u3001\u4EBA\u6DF7\u307F\u3092\u907F\u3051\u308B",
        desc: "\u611F\u67D3\u3092\u9632\u304E\u3084\u3059\u3044\u3002\u51FA\u8CBB\u3068\u5546\u58F2\u3078\u306E\u5F71\u97FF\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e4
          },
          {
            type: "incomeDropPct",
            value: 0.05
          },
          {
            type: "health",
            value: 0.97
          }
        ],
        result: "\u6C34\u3092\u716E\u6CB8\u3057\u3066\u4F7F\u3046\u3088\u3046\u306B\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u3044\u3064\u3082\u3069\u304A\u308A\u66AE\u3089\u3059",
        desc: "\u53CE\u5165\u306F\u4FDD\u3066\u308B\u3002\u611F\u67D3\u306E\u5371\u967A\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "health",
            value: 1.05
          }
        ],
        result: "\u3044\u3064\u3082\u3069\u304A\u308A\u5E02\u5834\u306B\u901A\u3063\u305F\u3002"
      }
    ],
    basis: "\u306F\u3057\u304B\u306A\u3069\u306E\u611F\u67D3\u75C7\u306E\u60A3\u8005\u306F\u5E7410\u4E07\u301C30\u4E07\u4EF6\uFF08WHO\u30FBCDC\uFF09\u3002\u6D41\u884C\u306E\u5831\u544A\u306F\u305D\u308C\u3088\u308A\u5E83\u304F\u8D77\u304D\u308B\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "cod_school_fees",
    iso3: [
      "COD"
    ],
    minAge: 25,
    maxAge: 55,
    annualProb: 0.1,
    requires: "kid:6-14",
    title: "\u5B66\u6821\u306E\u8CBB\u7528",
    situation: "\u5C0F\u5B66\u6821\u306F\u7121\u511F\u5316\u3055\u308C\u305F\u304C\u3001\u5236\u670D\u3084\u6559\u6750\u3001\u6559\u54E1\u3078\u306E\u8B1D\u793C\u306A\u3069\u306E\u51FA\u8CBB\u304C\u7D9A\u304F\u3002",
    options: [
      {
        id: "a",
        label: "\u5B50\u3069\u3082\u5168\u54E1\u3092\u5B66\u6821\u306B\u901A\u308F\u305B\u308B",
        desc: "\u5B50\u3069\u3082\u306E\u5C06\u6765\u304C\u958B\u3051\u308B\u3002\u5BB6\u8A08\u304C\u82E6\u3057\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 6e4
          }
        ],
        result: "\u5236\u670D\u3068\u6559\u79D1\u66F8\u3092\u305D\u308D\u3048\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4E0A\u306E\u5B50\u306B\u5BB6\u306E\u4ED5\u4E8B\u3092\u624B\u4F1D\u3063\u3066\u3082\u3089\u3046",
        desc: "\u51FA\u8CBB\u304C\u6E1B\u308A\u3001\u4EBA\u624B\u304C\u5897\u3048\u308B\u3002\u305D\u306E\u5B50\u306F\u5B66\u6821\u3092\u4F11\u307F\u304C\u3061\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          },
          {
            type: "careerMult",
            value: 1
          }
        ],
        result: "\u4E0A\u306E\u5B50\u306F\u5E02\u5834\u306E\u624B\u4F1D\u3044\u3092\u3059\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002"
      }
    ],
    basis: "\u7121\u511F\u5316\u5F8C\u3082\u5C0F\u5B66\u751F\u306E\u3044\u308B\u4E16\u5E2F\u306E\u7D047\u5272\u304C\u5B66\u6821\u306E\u8CBB\u7528\u3092\u8CA0\u62C5\uFF08\u4E16\u754C\u9280\u884C\u30FB\u30E6\u30CD\u30B9\u30B3\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "cod_mining",
    iso3: [
      "COD"
    ],
    minAge: 16,
    maxAge: 50,
    annualProb: 0.02,
    requires: "rural",
    title: "\u624B\u6398\u308A\u9271\u5C71\u306E\u4ED5\u4E8B",
    situation: "\u8FD1\u304F\u3067\u30B3\u30D0\u30EB\u30C8\u3084\u91D1\u306E\u624B\u6398\u308A\u9271\u5C71\u304C\u898B\u3064\u304B\u308A\u3001\u82E5\u8005\u304C\u50CD\u304D\u306B\u884C\u3063\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u9271\u5C71\u3067\u50CD\u304F",
        desc: "\u8FB2\u696D\u3088\u308A\u73FE\u91D1\u53CE\u5165\u304C\u591A\u3044\u3002\u4E8B\u6545\u3084\u5065\u5EB7\u88AB\u5BB3\u306E\u304A\u305D\u308C\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 1.08
          },
          {
            type: "health",
            value: 1.06
          }
        ],
        result: "\u9271\u5C71\u3067\u6398\u308B\u4ED5\u4E8B\u3092\u59CB\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u7551\u3092\u7D9A\u3051\u308B",
        desc: "\u4F53\u3092\u5B88\u308C\u308B\u3002\u73FE\u91D1\u53CE\u5165\u306F\u5C11\u306A\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u7551\u4ED5\u4E8B\u3092\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u624B\u6398\u308A\u9271\u5C71\u3067\u50CD\u304F\u4EBA\u306F\u7D04200\u4E07\u4EBA\u3067\u3001\u8FB2\u6751\u306E15\u301C64\u6B73\u306E\u7D041\u5272\uFF08\u4E16\u754C\u9280\u884C\uFF09\u3002\u9271\u5C71\u306F\u6771\u90E8\u30FB\u5357\u90E8\u306B\u96C6\u4E2D\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "cod_franc_drop",
    iso3: [
      "COD"
    ],
    minAge: 20,
    maxAge: 80,
    annualProb: 0.1,
    requires: null,
    title: "\u30B3\u30F3\u30B4\u30FB\u30D5\u30E9\u30F3\u306E\u4E0B\u843D",
    situation: "\u30D5\u30E9\u30F3\u306E\u4FA1\u5024\u304C\u4E0B\u304C\u308A\u3001\u5E02\u5834\u306E\u5024\u6BB5\u304C\u30C9\u30EB\u5EFA\u3066\u3067\u6C7A\u307E\u308B\u3088\u3046\u306B\u306A\u3063\u3066\u304D\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30D5\u30E9\u30F3\u306E\u307E\u307E\u6301\u3064",
        desc: "\u624B\u9593\u306F\u306A\u3044\u3002\u4FA1\u5024\u304C\u76EE\u6E1B\u308A\u3059\u308B\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.2
          }
        ],
        result: "\u540C\u3058\u984D\u3067\u8CB7\u3048\u308B\u7C73\u306E\u91CF\u304C\u6E1B\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u30C9\u30EB\u3067\u8CAF\u3081\u308B",
        desc: "\u4FA1\u5024\u3092\u5B88\u308C\u308B\u3002\u4E21\u66FF\u306E\u624B\u6570\u6599\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e3
          },
          {
            type: "protectCash",
            value: true
          }
        ],
        result: "\u5C11\u3057\u305A\u3064\u30C9\u30EB\u672D\u3092\u8CAF\u3081\u306F\u3058\u3081\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB30\u5E74\u306E\u3046\u306111\u5E74\u3067\u30B3\u30F3\u30B4\u30FB\u30D5\u30E9\u30F3\u304C1\u5E74\u306B20%\u4EE5\u4E0A\u4E0B\u843D\uFF08\u4E2D\u592E\u9280\u884C\u30FBIMF\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "vnm_motorbike",
    iso3: [
      "VNM"
    ],
    minAge: 18,
    maxAge: 30,
    annualProb: 0.1,
    requires: null,
    title: "\u30D0\u30A4\u30AF\u3092\u8CB7\u3046",
    situation: "\u901A\u52E4\u3084\u901A\u5B66\u306E\u305F\u3081\u306B\u3001\u81EA\u5206\u306E\u30D0\u30A4\u30AF\u3092\u8CB7\u3046\u3053\u3068\u306B\u3057\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u65B0\u8ECA\u3092\u5206\u5272\u3067\u8CB7\u3046",
        desc: "\u6545\u969C\u304C\u5C11\u306A\u304F\u5B89\u5FC3\u3002\u6708\u3005\u306E\u8FD4\u6E08\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 1.02
          }
        ],
        result: "\u65B0\u3057\u3044\u30D0\u30A4\u30AF\u3067\u901A\u3044\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4E2D\u53E4\u3092\u73FE\u91D1\u3067\u8CB7\u3046",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u4FEE\u7406\u304C\u591A\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 6e4
          }
        ],
        result: "\u4E2D\u53E4\u306E\u30D0\u30A4\u30AF\u3092\u624B\u306B\u5165\u308C\u305F\u3002"
      }
    ],
    basis: "\u4E16\u5E2F\u306E88.5%\u304C\u30D0\u30A4\u30AF\u3092\u6301\u3064\uFF08\u7D71\u8A08\u7DCF\u5C40 2019\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "vnm_land",
    iso3: [
      "VNM"
    ],
    minAge: 30,
    maxAge: 60,
    annualProb: 0.03,
    requires: null,
    title: "\u571F\u5730\u3078\u306E\u6295\u8CC7",
    situation: "\u90CA\u5916\u306E\u571F\u5730\u306E\u5024\u6BB5\u304C\u4E0A\u304C\u3063\u3066\u3044\u308B\u3068\u805E\u304D\u3001\u8CAF\u91D1\u3067\u571F\u5730\u3092\u8CB7\u3046\u304B\u8FF7\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u571F\u5730\u3092\u8CB7\u3046",
        desc: "\u5024\u4E0A\u304C\u308A\u3059\u308C\u3070\u8CC7\u7523\u304C\u5897\u3048\u308B\u3002\u5024\u4E0B\u304C\u308A\u3084\u624B\u7D9A\u304D\u306E\u554F\u984C\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e5
          },
          {
            type: "protectCash",
            value: true
          }
        ],
        result: "\u90CA\u5916\u306B\u5C0F\u3055\u306A\u571F\u5730\u3092\u8CB7\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u8CAF\u91D1\u306E\u307E\u307E\u6301\u3064",
        desc: "\u3059\u3050\u306B\u4F7F\u3048\u308B\u3002\u7269\u4FA1\u4E0A\u6607\u3067\u76EE\u6E1B\u308A\u3059\u308B\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.03
          }
        ],
        result: "\u9280\u884C\u306B\u9810\u3051\u305F\u307E\u307E\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u571F\u5730\u3068\u4F4F\u5B85\u306E\u53D6\u5F15\u306F\u5E74\u7D0454\u4E07\u4EF6\u3067\u3001\u5168\u56FD\u306E\u4E16\u5E2F\u306E\u7D041.9%\uFF08\u5EFA\u8A2D\u7701\u30FB\u7D71\u8A08\u7DCF\u5C40 2024\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "vnm_typhoon_flood",
    iso3: [
      "VNM"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.015,
    requires: null,
    title: "\u53F0\u98A8\u3068\u6D2A\u6C34",
    situation: "\u53F0\u98A8\u306E\u3042\u3068\u306E\u5927\u96E8\u3067\u3001\u4E2D\u90E8\u306E\u6751\u304C\u6C34\u306B\u3064\u304B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5BB6\u3092\u9AD8\u5E8A\u306B\u5EFA\u3066\u76F4\u3059",
        desc: "\u6B21\u306E\u6D2A\u6C34\u306B\u5099\u3048\u3089\u308C\u308B\u3002\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          }
        ],
        result: "\u5BB6\u306E\u5E8A\u3092\u9AD8\u304F\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u305D\u306E\u307E\u307E\u4F4F\u307F\u7D9A\u3051\u308B",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u6BCE\u5E74\u88AB\u5BB3\u3092\u53D7\u3051\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e4
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u6CE5\u3092\u304B\u304D\u51FA\u3057\u3066\u5143\u306E\u66AE\u3089\u3057\u306B\u623B\u3063\u305F\u3002"
      }
    ],
    basis: "\u53F0\u98A8\u30FB\u6D2A\u6C34\u306A\u3069\u306E\u88AB\u5BB3\u3092\u53D7\u3051\u308B\u4EBA\u306F\u5E74\u5E73\u5747\u7D04120\u4E07\u4EBA\u3067\u4EBA\u53E3\u306E\u7D041.2%\uFF08\u7D71\u8A08\u7DCF\u5C40\u30FB\u9632\u707D\u5F53\u5C40\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "vnm_factory",
    iso3: [
      "VNM"
    ],
    minAge: 18,
    maxAge: 35,
    annualProb: 0.04,
    requires: "rural",
    title: "\u5DE5\u696D\u56E3\u5730\u3078\u306E\u51FA\u7A3C\u304E",
    situation: "\u6751\u306E\u53CB\u4EBA\u304C\u30D3\u30F3\u30BA\u30AA\u30F3\u306E\u5DE5\u696D\u56E3\u5730\u3067\u50CD\u304D\u3001\u4ED5\u9001\u308A\u3092\u3057\u3066\u3044\u308B\u3068\u805E\u3044\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5DE5\u696D\u56E3\u5730\u3067\u50CD\u304F",
        desc: "\u5B89\u5B9A\u3057\u305F\u7D66\u6599\u304C\u5F97\u3089\u308C\u308B\u3002\u5BB6\u65CF\u3068\u96E2\u308C\u3001\u5BEE\u751F\u6D3B\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 5e4
          },
          {
            type: "careerMult",
            value: 1.07
          }
        ],
        result: "\u96FB\u5B50\u90E8\u54C1\u306E\u5DE5\u5834\u3067\u50CD\u304D\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6751\u3067\u8FB2\u696D\u3092\u7D9A\u3051\u308B",
        desc: "\u5BB6\u65CF\u3068\u66AE\u3089\u305B\u308B\u3002\u53CE\u5165\u306F\u4E0D\u5B89\u5B9A\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u6751\u306B\u6B8B\u3063\u3066\u7530\u3093\u307C\u3092\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u8FB2\u6751\u306E18\u301C35\u6B73\u306E4.2%\u304C1\u5E74\u306B\u50CD\u304F\u305F\u3081\u306B\u307B\u304B\u306E\u7701\u3078\u79FB\u308B\uFF08\u7D71\u8A08\u7DCF\u5C40\u30FBUNFPA \u56FD\u5185\u79FB\u4F4F\u8ABF\u67FB\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "vnm_extra_class",
    iso3: [
      "VNM"
    ],
    minAge: 30,
    maxAge: 55,
    annualProb: 0.1,
    requires: "kid:7-17",
    title: "\u88DC\u7FD2\u6388\u696D",
    situation: "\u5B50\u3069\u3082\u306E\u62C5\u4EFB\u306E\u5148\u751F\u304C\u653E\u8AB2\u5F8C\u306E\u88DC\u7FD2\u6388\u696D\u3092\u958B\u3044\u3066\u304A\u308A\u3001\u307B\u3068\u3093\u3069\u306E\u540C\u7D1A\u751F\u304C\u901A\u3063\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u88DC\u7FD2\u306B\u901A\u308F\u305B\u308B",
        desc: "\u6210\u7E3E\u304C\u4E0A\u304C\u308A\u3084\u3059\u3044\u3002\u6BCE\u6708\u306E\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 8e4
          }
        ],
        result: "\u653E\u8AB2\u5F8C\u306E\u88DC\u7FD2\u306B\u901A\u308F\u305B\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u3067\u52C9\u5F37\u3092\u898B\u308B",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u89AA\u306E\u6642\u9593\u304C\u53D6\u3089\u308C\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e4
          },
          {
            type: "careerMult",
            value: 0.995
          }
        ],
        result: "\u591C\u306B\u4E00\u7DD2\u306B\u5BBF\u984C\u3092\u3057\u305F\u3002"
      }
    ],
    basis: "\u88DC\u7FD2\u6388\u696D\u306E\u53C2\u52A0\u306F\u5C0F\u5B66\u682132%\u3001\u4E2D\u5B66\u682146%\u3001\u9AD8\u682163%\uFF08Young Lives \u8ABF\u67FB\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "kor_hagwon",
    iso3: [
      "KOR"
    ],
    minAge: 30,
    maxAge: 55,
    annualProb: 0.12,
    requires: "kid:7-17",
    title: "\u5B66\u7FD2\u587E\uFF08\u30CF\u30B0\u30A9\u30F3\uFF09",
    situation: "\u5B50\u3069\u3082\u306E\u53CB\u4EBA\u306E\u307B\u3068\u3093\u3069\u304C\u653E\u8AB2\u5F8C\u306B\u8907\u6570\u306E\u587E\u306B\u901A\u3063\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u587E\u3092\u3044\u304F\u3064\u3082\u639B\u3051\u6301\u3061\u3055\u305B\u308B",
        desc: "\u53D7\u9A13\u3067\u6709\u5229\u306B\u306A\u308A\u3084\u3059\u3044\u3002\u6559\u80B2\u8CBB\u304C\u5BB6\u8A08\u3092\u5727\u8FEB\u3059\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 6e5
          }
        ],
        result: "\u82F1\u8A9E\u3068\u6570\u5B66\u306E\u587E\u306B\u901A\u308F\u305B\u59CB\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u587E\u3092\u4E00\u3064\u306B\u7D5E\u308B",
        desc: "\u51FA\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u5B50\u3069\u3082\u304C\u4E0D\u5B89\u3092\u611F\u3058\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e5
          }
        ],
        result: "\u6570\u5B66\u306E\u587E\u3060\u3051\u306B\u901A\u308F\u305B\u305F\u3002"
      }
    ],
    basis: "\u5C0F\u4E2D\u9AD8\u751F\u306E\u79C1\u6559\u80B2\u53C2\u52A0\u7387\u306F78.5%\uFF08\u7D71\u8A08\u5E81 2023\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "kor_jeonse",
    iso3: [
      "KOR"
    ],
    minAge: 25,
    maxAge: 45,
    annualProb: 0.05,
    requires: "notOwner",
    title: "\u30C1\u30E7\u30F3\u30BB\uFF08\u4F1D\u8CB0\uFF09\u5951\u7D04",
    situation: "\u65B0\u3057\u3044\u90E8\u5C4B\u3092\u3001\u307E\u3068\u307E\u3063\u305F\u4FDD\u8A3C\u91D1\u3092\u9810\u3051\u3066\u5BB6\u8CC3\u306E\u304B\u304B\u3089\u306A\u3044\u300C\u30C1\u30E7\u30F3\u30BB\u300D\u3067\u501F\u308A\u308B\u304B\u3001\u6708\u6255\u3044\u306E\u5BB6\u8CC3\u306B\u3059\u308B\u304B\u8FF7\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u30C1\u30E7\u30F3\u30BB\u3067\u501F\u308A\u308B",
        desc: "\u6BCE\u6708\u306E\u5BB6\u8CC3\u304C\u304B\u304B\u3089\u306A\u3044\u3002\u5927\u5BB6\u304C\u4FDD\u8A3C\u91D1\u3092\u8FD4\u305B\u306A\u3044\u30EA\u30B9\u30AF\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e4
          },
          {
            type: "cashLossPct",
            value: 0.05
          }
        ],
        result: "\u4FDD\u8A3C\u4FDD\u967A\u306B\u5165\u308A\u3001\u30C1\u30E7\u30F3\u30BB\u3067\u5951\u7D04\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6708\u6255\u3044\u306E\u5BB6\u8CC3\u306B\u3059\u308B",
        desc: "\u4FDD\u8A3C\u91D1\u306E\u30EA\u30B9\u30AF\u306F\u5C0F\u3055\u3044\u3002\u6BCE\u6708\u306E\u5BB6\u8CC3\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 4e5
          }
        ],
        result: "\u6708\u6255\u3044\u306E\u90E8\u5C4B\u3092\u501F\u308A\u305F\u3002"
      }
    ],
    basis: "\u8CC3\u8CB8\u4E16\u5E2F\u306E\u7D044\u5272\u304C\u30C1\u30E7\u30F3\u30BB\uFF082020\u5E74\uFF09\u3002\u4ECA\u306E\u5BB6\u306B\u4F4F\u3093\u30672\u5E74\u4EE5\u4E0B\u306E\u4E16\u5E2F\u306F30%\uFF08\u56FD\u571F\u4EA4\u901A\u90E8 \u4F4F\u5C45\u5B9F\u614B\u8ABF\u67FB 2024\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "kor_suneung",
    iso3: [
      "KOR"
    ],
    minAge: 18,
    maxAge: 19,
    annualProb: 0.15,
    requires: "student",
    title: "\u4FEE\u5B66\u80FD\u529B\u8A66\u9A13\uFF08\u30B9\u30CC\u30F3\uFF09",
    situation: "\u5927\u5B66\u4FEE\u5B66\u80FD\u529B\u8A66\u9A13\u306E\u7D50\u679C\u304C\u51FA\u3066\u3001\u5FD7\u671B\u5927\u5B66\u306B\u306F\u5C4A\u304B\u306A\u304B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6D6A\u4EBA\u3057\u3066\u518D\u6311\u6226\u3059\u308B",
        desc: "\u4E0A\u4F4D\u5927\u5B66\u3092\u72D9\u3048\u308B\u30021\u5E74\u9045\u308C\u3001\u4E88\u5099\u6821\u4EE3\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 4e5
          },
          {
            type: "careerMult",
            value: 1.04
          }
        ],
        result: "\u4E88\u5099\u6821\u306E\u6D6A\u4EBA\u30AF\u30E9\u30B9\u306B\u5165\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u70B9\u6570\u306B\u5408\u3046\u5927\u5B66\u306B\u9032\u3080",
        desc: "\u65E9\u304F\u793E\u4F1A\u306B\u51FA\u3089\u308C\u308B\u3002\u5C31\u8077\u3067\u4E0D\u5229\u3092\u611F\u3058\u308B\u3053\u3068\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          },
          {
            type: "cost",
            value: 3e4
          }
        ],
        result: "\u5165\u308C\u308B\u5927\u5B66\u306B\u9032\u5B66\u3057\u305F\u3002"
      }
    ],
    basis: "\u30B9\u30CC\u30F3\u53D7\u9A13\u8005\u306E35.4%\u304C\u5352\u696D\u751F\u306A\u3069\uFF08\u6559\u80B2\u90E8 2024\u5E74\u5EA6\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "kor_early_retire",
    iso3: [
      "KOR"
    ],
    minAge: 48,
    maxAge: 56,
    annualProb: 0.02,
    requires: "working",
    title: "\u65E9\u671F\u9000\u8077\u306E\u52E7\u3081",
    situation: "\u4F1A\u793E\u304B\u3089\u5E0C\u671B\u9000\u8077\u306E\u52DF\u96C6\u304C\u3042\u308A\u3001\u4E0A\u53F8\u304B\u3089\u5FDC\u52DF\u3092\u52E7\u3081\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u9000\u8077\u91D1\u3092\u53D7\u3051\u53D6\u3063\u3066\u81EA\u55B6\u696D\u3092\u59CB\u3081\u308B",
        desc: "\u81EA\u5206\u306E\u5E97\u304C\u6301\u3066\u308B\u3002\u7AF6\u4E89\u304C\u6FC0\u3057\u304F\u3001\u5931\u6557\u306E\u30EA\u30B9\u30AF\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "income",
            value: 15e5
          },
          {
            type: "careerMult",
            value: 0.9
          }
        ],
        result: "\u30C1\u30AD\u30F3\u5E97\u3092\u958B\u3044\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4F1A\u793E\u306B\u6B8B\u308B",
        desc: "\u53CE\u5165\u306F\u7D9A\u304F\u3002\u5C45\u5FC3\u5730\u306E\u60AA\u3055\u304C\u7D9A\u304F\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.97
          },
          {
            type: "health",
            value: 1.02
          }
        ],
        result: "\u4F1A\u793E\u306B\u6B8B\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "55\u301C64\u6B73\u3067\u4E00\u756A\u9577\u304F\u52E4\u3081\u305F\u8077\u5834\u3092\u96E2\u308C\u305F\u4EBA\u306E11.8%\u304C\u3001\u52E7\u544A\u9000\u8077\u30FB\u540D\u8A89\u9000\u8077\u30FB\u6574\u7406\u89E3\u96C7\uFF08\u7D71\u8A08\u5E81 2025\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "kor_wedding_home",
    iso3: [
      "KOR"
    ],
    minAge: 28,
    maxAge: 36,
    annualProb: 0.06,
    requires: "dating",
    title: "\u7D50\u5A5A\u3068\u65B0\u5C45",
    situation: "\u7D50\u5A5A\u3092\u8003\u3048\u3066\u3044\u308B\u304C\u3001\u30BD\u30A6\u30EB\u306E\u4F4F\u5B85\u4FA1\u683C\u304C\u9AD8\u304F\u3001\u65B0\u5C45\u306E\u6E96\u5099\u304C\u96E3\u3057\u3044\u3002",
    options: [
      {
        id: "a",
        label: "\u30BD\u30A6\u30EB\u90CA\u5916\u3067\u65B0\u5C45\u3092\u63A2\u3059",
        desc: "\u7D50\u5A5A\u306E\u6E96\u5099\u304C\u9032\u3080\u3002\u901A\u52E4\u6642\u9593\u304C\u9577\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 5e5
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u4EAC\u757F\u9053\u306E\u30DE\u30F3\u30B7\u30E7\u30F3\u3092\u501F\u308A\u305F\u3002"
      },
      {
        id: "b",
        label: "\u7D50\u5A5A\u3092\u3057\u3070\u3089\u304F\u5148\u306B\u5EF6\u3070\u3059",
        desc: "\u8CAF\u91D1\u3092\u5897\u3084\u305B\u308B\u3002\u5BB6\u65CF\u304B\u3089\u5FC3\u914D\u3055\u308C\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 1.01
          },
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u3042\u3068\u6570\u5E74\u304A\u91D1\u3092\u8CAF\u3081\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u7D50\u5A5A\u3057\u306A\u3044\u7406\u7531\u306B\u300C\u7D50\u5A5A\u8CC7\u91D1\u306E\u4E0D\u8DB3\u300D\u3092\u6319\u3052\u305F\u4EBA\u306F31%\uFF08\u7D71\u8A08\u5E81 \u793E\u4F1A\u8ABF\u67FB 2024\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ken_mpesa_loan",
    iso3: [
      "KEN"
    ],
    minAge: 18,
    maxAge: 60,
    annualProb: 0.08,
    requires: null,
    title: "\u30E2\u30D0\u30A4\u30EB\u30DE\u30CD\u30FC\u306E\u5C11\u984D\u30ED\u30FC\u30F3",
    situation: "\u643A\u5E2F\u96FB\u8A71\u306E\u30E2\u30D0\u30A4\u30EB\u30DE\u30CD\u30FC\uFF08M-Pesa\uFF09\u3067\u3001\u3059\u3050\u306B\u501F\u308A\u3089\u308C\u308B\u5C11\u984D\u30ED\u30FC\u30F3\u306E\u6848\u5185\u304C\u5C4A\u3044\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u501F\u308A\u3066\u5546\u54C1\u3092\u4ED5\u5165\u308C\u308B",
        desc: "\u5546\u58F2\u3092\u5E83\u3052\u3089\u308C\u308B\u3002\u8FD4\u6E08\u304C\u9045\u308C\u308B\u3068\u4FE1\u7528\u60C5\u5831\u306B\u50B7\u304C\u3064\u304F\u3002",
        effects: [
          {
            type: "cost",
            value: 2e4
          },
          {
            type: "careerMult",
            value: 1.04
          }
        ],
        result: "\u501F\u308A\u305F\u304A\u91D1\u3067\u91CE\u83DC\u3092\u591A\u3081\u306B\u4ED5\u5165\u308C\u305F\u3002"
      },
      {
        id: "b",
        label: "\u501F\u308A\u305A\u306B\u8CAF\u3081\u3066\u304B\u3089\u4ED5\u5165\u308C\u308B",
        desc: "\u501F\u91D1\u306E\u5FC3\u914D\u306F\u306A\u3044\u3002\u5546\u58F2\u306E\u6A5F\u4F1A\u3092\u9003\u3059\u3053\u3068\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u5C11\u3057\u305A\u3064\u8CAF\u3081\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u6210\u4EBA\u306E28%\u304C\u904E\u53BB1\u5E74\u306B\u653F\u5E9C\u306E\u30E2\u30D0\u30A4\u30EB\u878D\u8CC7\u3092\u5229\u7528\uFF08\u4E2D\u592E\u9280\u884C FinAccess 2024\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ken_drought",
    iso3: [
      "KEN"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.06,
    requires: "rural",
    title: "\u5E72\u3070\u3064",
    situation: "\u96E8\u5B63\u306E\u96E8\u304C\u4F55\u5EA6\u3082\u964D\u3089\u305A\u3001\u5BB6\u755C\u306E\u7267\u8349\u3068\u6C34\u304C\u8DB3\u308A\u306A\u304F\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u5BB6\u755C\u3092\u58F2\u308B",
        desc: "\u73FE\u91D1\u3092\u78BA\u4FDD\u3067\u304D\u308B\u3002\u8CA1\u7523\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.3
          }
        ],
        result: "\u725B\u3092\u5B89\u5024\u3067\u58F2\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u6C34\u3068\u7267\u8349\u3092\u6C42\u3081\u3066\u9060\u304F\u3078\u79FB\u52D5\u3059\u308B",
        desc: "\u5BB6\u755C\u3092\u5B88\u308C\u308B\u3002\u5BB6\u65CF\u3068\u96E2\u308C\u3001\u5371\u967A\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 1.03
          }
        ],
        result: "\u5BB6\u755C\u3092\u9023\u308C\u3066\u4F55\u65E5\u3082\u6B69\u3044\u305F\u3002"
      }
    ],
    basis: "\u4E7E\u71E5\u30FB\u534A\u4E7E\u71E5\u5730\u57DF\u306E\u4EBA\u53E3\u306E16%\u304C\u6025\u6027\u306E\u98DF\u6599\u4E0D\u8DB3\uFF08IPC\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ken_school_fees",
    iso3: [
      "KEN"
    ],
    minAge: 35,
    maxAge: 60,
    annualProb: 0.1,
    requires: "kid:13-14",
    title: "\u4E2D\u7B49\u5B66\u6821\u306E\u8CBB\u7528",
    situation: "\u5B50\u3069\u3082\u304C\u5168\u5BEE\u5236\u306E\u4E2D\u7B49\u5B66\u6821\u306B\u5408\u683C\u3057\u305F\u304C\u3001\u5BEE\u8CBB\u3084\u5236\u670D\u306E\u8CBB\u7528\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u501F\u91D1\u3092\u3057\u3066\u901A\u308F\u305B\u308B",
        desc: "\u826F\u3044\u5B66\u6821\u3067\u5B66\u3079\u308B\u3002\u8FD4\u6E08\u304C\u91CD\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 15e4
          }
        ],
        result: "\u89AA\u621A\u3068\u5730\u57DF\u306E\u5BC4\u4ED8\u3067\u8CBB\u7528\u3092\u96C6\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u8FD1\u304F\u306E\u901A\u5B66\u5236\u306E\u5B66\u6821\u306B\u901A\u308F\u305B\u308B",
        desc: "\u8CBB\u7528\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u5B66\u6821\u306E\u74B0\u5883\u306F\u52A3\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 4e4
          }
        ],
        result: "\u8FD1\u304F\u306E\u5B66\u6821\u306B\u901A\u308F\u305B\u305F\u3002"
      }
    ],
    basis: "\u4E2D\u7B49\u5B66\u6821\u306E\u751F\u5F92\u306E\u7D043\u5272\u304C\u5168\u5BEE\u5236\u306E\u5B66\u6821\u306B\u901A\u3046\uFF082014\u5E74\u306E\u5831\u544A\u3001\u4E8C\u6B21\u60C5\u5831\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ken_fuel_tax",
    iso3: [
      "KEN"
    ],
    minAge: 18,
    maxAge: 70,
    annualProb: 0.15,
    requires: "urban",
    title: "\u71C3\u6599\u3068\u4EA4\u901A\u8CBB\u306E\u5024\u4E0A\u304C\u308A",
    situation: "\u71C3\u6599\u7A0E\u306E\u5F15\u304D\u4E0A\u3052\u3067\u3001\u4E57\u308A\u5408\u3044\u30D0\u30B9\uFF08\u30DE\u30BF\u30C4\uFF09\u306E\u904B\u8CC3\u304C\u4E0A\u304C\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6B69\u3051\u308B\u8DDD\u96E2\u306F\u6B69\u304F",
        desc: "\u4EA4\u901A\u8CBB\u3092\u6291\u3048\u3089\u308C\u308B\u3002\u6642\u9593\u3068\u4F53\u529B\u3092\u4F7F\u3046\u3002",
        effects: [
          {
            type: "cost",
            value: 1e4
          },
          {
            type: "careerMult",
            value: 0.995
          }
        ],
        result: "\u671D\u65E9\u304F\u5BB6\u3092\u51FA\u3066\u6B69\u304F\u3053\u3068\u306B\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u904B\u8CC3\u3092\u6255\u3044\u7D9A\u3051\u308B",
        desc: "\u6642\u9593\u3092\u5B88\u308C\u308B\u3002\u98DF\u8CBB\u3092\u524A\u308B\u3053\u3068\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 4e4
          }
        ],
        result: "\u98DF\u8CBB\u3092\u524A\u3063\u3066\u901A\u52E4\u3092\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "\u30AC\u30BD\u30EA\u30F3\u306E\u5E74\u5E73\u5747\u4FA1\u683C\u304C1\u5E74\u306B2\u5272\u4EE5\u4E0A\u4E0A\u304C\u3063\u305F\u5E74\u306F\u30012007\u301C2024\u5E74\u306E17\u56DE\u306E\u3046\u30615\u56DE\uFF08KNBS\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "ken_harambee",
    iso3: [
      "KEN"
    ],
    minAge: 25,
    maxAge: 70,
    annualProb: 0.06,
    requires: null,
    title: "\u5730\u57DF\u306E\u5BC4\u4ED8\u96C6\u3081\uFF08\u30CF\u30E9\u30F3\u30D9\u30FC\uFF09",
    situation: "\u89AA\u621A\u306E\u5165\u9662\u8CBB\u306E\u305F\u3081\u306B\u3001\u5730\u57DF\u3067\u5BC4\u4ED8\u3092\u96C6\u3081\u308B\u4F1A\u304C\u958B\u304B\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u591A\u3081\u306B\u5BC4\u4ED8\u3059\u308B",
        desc: "\u89AA\u621A\u3068\u306E\u7D46\u304C\u6DF1\u307E\u308A\u3001\u56F0\u3063\u305F\u3068\u304D\u306B\u52A9\u3051\u3066\u3082\u3089\u3048\u308B\u3002\u624B\u5143\u306E\u304A\u91D1\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 3e4
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u96C6\u4F1A\u3067\u5BC4\u4ED8\u3092\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5C11\u984D\u306B\u3068\u3069\u3081\u308B",
        desc: "\u5BB6\u8A08\u3092\u5B88\u308C\u308B\u3002\u5468\u56F2\u306E\u76EE\u304C\u6C17\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e3
          },
          {
            type: "health",
            value: 1
          }
        ],
        result: "\u5C11\u3057\u3060\u3051\u5BC4\u4ED8\u3057\u305F\u3002"
      }
    ],
    basis: "\u6210\u4EBA\u306E28.5%\u304C\u904E\u53BB1\u5E74\u306B\u52A9\u3051\u5408\u3044\u30B0\u30EB\u30FC\u30D7\u3084\u5730\u57DF\u306E\u5BC4\u4ED8\u306B\u304A\u91D1\u3092\u51FA\u3057\u305F\uFF08\u4E2D\u592E\u9280\u884C FinAccess 2024\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gen_lic_malaria",
    iso3: [
      "*LIC"
    ],
    minAge: 0,
    maxAge: 100,
    annualProb: 0.12,
    requires: null,
    title: "\u30DE\u30E9\u30EA\u30A2\u306B\u304B\u304B\u308B",
    situation: "\u9AD8\u71B1\u304C\u51FA\u3066\u3001\u8A3A\u7642\u6240\u3067\u30DE\u30E9\u30EA\u30A2\u3068\u8A3A\u65AD\u3055\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u3059\u3050\u306B\u8A3A\u7642\u6240\u3067\u6CBB\u7642\u3092\u53D7\u3051\u308B",
        desc: "\u65E9\u304F\u56DE\u5FA9\u3067\u304D\u308B\u3002\u85AC\u4EE3\u3068\u901A\u9662\u8CBB\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e4
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u85AC\u3092\u98F2\u3093\u30671\u9031\u9593\u3067\u56DE\u5FA9\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5E02\u5834\u306E\u85AC\u3067\u69D8\u5B50\u3092\u898B\u308B",
        desc: "\u51FA\u8CBB\u304C\u5C11\u306A\u3044\u3002\u3053\u3058\u3089\u305B\u308B\u304A\u305D\u308C\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 2e3
          },
          {
            type: "health",
            value: 1.04
          }
        ],
        result: "\u5E02\u5834\u3067\u8CB7\u3063\u305F\u85AC\u3092\u98F2\u3093\u3067\u4F11\u3093\u3060\u3002"
      }
    ],
    basis: "\u30DE\u30E9\u30EA\u30A2\u306F\u5E74\u7D042\u51046,300\u4E07\u4EF6\u3067\u3001\u5371\u967A\u306E\u3042\u308B\u5730\u57DF\u306E\u4EBA\u53E322\u5104\u4EBA\u306E\u7D0412%\uFF08WHO World Malaria Report 2024\uFF09\u3002\u4F4E\u6240\u5F97\u56FD\u306F\u3055\u3089\u306B\u9AD8\u3044\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gen_savings_group",
    iso3: [
      "*LIC",
      "*LMC"
    ],
    minAge: 18,
    maxAge: 70,
    annualProb: 0.06,
    requires: null,
    title: "\u983C\u6BCD\u5B50\u8B1B\uFF08\u7A4D\u7ACB\u30B0\u30EB\u30FC\u30D7\uFF09",
    situation: "\u8FD1\u6240\u306E\u4EBA\u305F\u3061\u304B\u3089\u3001\u6BCE\u6708\u304A\u91D1\u3092\u51FA\u3057\u5408\u3063\u3066\u9806\u756A\u306B\u53D7\u3051\u53D6\u308B\u7A4D\u7ACB\u30B0\u30EB\u30FC\u30D7\u306B\u8A98\u308F\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u53C2\u52A0\u3059\u308B",
        desc: "\u307E\u3068\u307E\u3063\u305F\u304A\u91D1\u3092\u53D7\u3051\u53D6\u308C\u308B\u3002\u8AB0\u304B\u304C\u6255\u308F\u306A\u304F\u306A\u308B\u3068\u640D\u3092\u3059\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e4
          },
          {
            type: "careerMult",
            value: 1.02
          }
        ],
        result: "\u6708\u306B\u4E00\u5EA6\u306E\u96C6\u307E\u308A\u306B\u53C2\u52A0\u3057\u306F\u3058\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u81EA\u5206\u3067\u8CAF\u3081\u308B",
        desc: "\u4ED6\u4EBA\u306B\u5DE6\u53F3\u3055\u308C\u306A\u3044\u3002\u8CAF\u91D1\u304C\u7D9A\u304D\u306B\u304F\u3044\u3002",
        effects: [
          {
            type: "careerMult",
            value: 1
          },
          {
            type: "cashLossPct",
            value: 0.02
          }
        ],
        result: "\u5BB6\u306E\u7F36\u306B\u8CAF\u3081\u308B\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB1\u5E74\u306B\u7A4D\u7ACB\u30B0\u30EB\u30FC\u30D7\u3067\u8CAF\u3081\u305F\u6210\u4EBA\u306F\u4F4E\u6240\u5F97\u56FD21%\u3001\u4F4E\u4E2D\u6240\u5F97\u56FD13%\uFF08\u4E16\u754C\u9280\u884C Global Findex 2021\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gen_rural_harvest",
    iso3: [
      "*RURAL"
    ],
    minAge: 18,
    maxAge: 70,
    annualProb: 0.1,
    requires: "rural",
    title: "\u4E0D\u4F5C\u306E\u5E74",
    situation: "\u5929\u5019\u4E0D\u9806\u3067\u53CE\u7A6B\u304C\u4F8B\u5E74\u3088\u308A\u5927\u304D\u304F\u6E1B\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u8CAF\u3048\u3092\u53D6\u308A\u5D29\u3059",
        desc: "\u66AE\u3089\u3057\u306E\u6C34\u6E96\u3092\u4FDD\u3066\u308B\u3002\u84C4\u3048\u304C\u6E1B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 5e4
          }
        ],
        result: "\u8CAF\u3081\u3066\u3044\u305F\u304A\u91D1\u3067\u98DF\u6599\u3092\u8CB7\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u753A\u3067\u81E8\u6642\u306E\u4ED5\u4E8B\u3092\u3059\u308B",
        desc: "\u53CE\u5165\u3092\u88DC\u3048\u308B\u3002\u7551\u306E\u624B\u5165\u308C\u304C\u9045\u308C\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.1
          },
          {
            type: "careerMult",
            value: 1.01
          }
        ],
        result: "\u53CE\u7A6B\u671F\u307E\u3067\u753A\u3067\u50CD\u3044\u305F\u3002"
      }
    ],
    basis: "1\u5E74\u306B\u5E72\u3070\u3064\u30FB\u4E0D\u898F\u5247\u306A\u96E8\u306B\u3042\u3063\u305F\u8FB2\u5BB6\u306F\u3001\u30DE\u30E9\u30A6\u30A461%\u3001\u30A6\u30AC\u30F3\u30C036%\u3001\u30CA\u30A4\u30B8\u30A7\u30EA\u30A23%\uFF08\u4E16\u754C\u9280\u884C LSMS-ISA\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gen_urban_rent",
    iso3: [
      "*URBAN"
    ],
    minAge: 20,
    maxAge: 60,
    annualProb: 0.04,
    requires: "urban+renting",
    title: "\u5927\u5BB6\u304B\u3089\u306E\u9000\u53BB\u901A\u77E5",
    situation: "\u5EFA\u7269\u306E\u5EFA\u3066\u66FF\u3048\u306E\u305F\u3081\u3001\u534A\u5E74\u4EE5\u5185\u306B\u90E8\u5C4B\u3092\u51FA\u308B\u3088\u3046\u5927\u5BB6\u304B\u3089\u544A\u3052\u3089\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u8FD1\u304F\u3067\u540C\u3058\u5E83\u3055\u306E\u90E8\u5C4B\u3092\u63A2\u3059",
        desc: "\u751F\u6D3B\u570F\u3092\u5909\u3048\u305A\u306B\u6E08\u3080\u3002\u5BB6\u8CC3\u304C\u4E0A\u304C\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 2e5
          }
        ],
        result: "\u8FD1\u6240\u306E\u90E8\u5C4B\u306B\u79FB\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u5BB6\u8CC3\u306E\u5B89\u3044\u90CA\u5916\u306B\u79FB\u308B",
        desc: "\u5BB6\u8CC3\u304C\u4E0B\u304C\u308B\u3002\u901A\u52E4\u304C\u9577\u304F\u306A\u308B\u3002",
        effects: [
          {
            type: "moveCost",
            value: 15e4
          },
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u90CA\u5916\u306B\u5F15\u3063\u8D8A\u3057\u305F\u3002"
      }
    ],
    basis: "\u90FD\u5E02\u90E8\u306E\u8CC3\u8CB8\u4F4F\u5B85\u3067\u306F\u5EFA\u3066\u66FF\u3048\u30FB\u5951\u7D04\u7D42\u4E86\u306B\u3088\u308B\u8EE2\u5C45\u304C\u4E00\u822C\u7684\uFF08\u6982\u7B97\uFF09",
    estimated: true
  },
  {
    id: "gen_scam_call",
    iso3: [
      "*ALL"
    ],
    minAge: 20,
    maxAge: 90,
    annualProb: 0.02,
    requires: null,
    title: "\u5DE7\u5999\u306A\u8A50\u6B3A\u306E\u96FB\u8A71",
    situation: "\u9280\u884C\u3092\u540D\u4E57\u308B\u76F8\u624B\u304B\u3089\u3001\u53E3\u5EA7\u304C\u4E0D\u6B63\u5229\u7528\u3055\u308C\u3066\u3044\u308B\u306E\u3067\u624B\u7D9A\u304D\u3092\u3057\u3066\u307B\u3057\u3044\u3068\u96FB\u8A71\u304C\u3042\u3063\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u3044\u3063\u305F\u3093\u5207\u3063\u3066\u9280\u884C\u306B\u78BA\u304B\u3081\u308B",
        desc: "\u88AB\u5BB3\u3092\u9632\u3052\u308B\u3002\u624B\u9593\u304C\u304B\u304B\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e3
          }
        ],
        result: "\u9280\u884C\u306E\u7A93\u53E3\u306B\u554F\u3044\u5408\u308F\u305B\u3001\u8A50\u6B3A\u3060\u3068\u5206\u304B\u3063\u305F\u3002"
      },
      {
        id: "b",
        label: "\u8A00\u308F\u308C\u305F\u3068\u304A\u308A\u624B\u7D9A\u304D\u3059\u308B",
        desc: "\u305D\u306E\u5834\u306F\u65E9\u304F\u6E08\u3080\u3002\u8CAF\u91D1\u3092\u5931\u3046\u304A\u305D\u308C\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "cashLossPct",
            value: 0.15
          }
        ],
        result: "\u5F8C\u306B\u306A\u3063\u3066\u8A50\u6B3A\u3060\u3068\u6C17\u3065\u3044\u305F\u3002"
      }
    ],
    basis: "16\u6B73\u4EE5\u4E0A\u306E7.1%\u304C1\u5E74\u306B\u8A50\u6B3A\u306E\u88AB\u5BB3\u306B\u3042\u3046\uFF08\u82F1\u56FD\u7D71\u8A08\u5C40 \u30A4\u30F3\u30B0\u30E9\u30F3\u30C9\u30FB\u30A6\u30A7\u30FC\u30EB\u30BA\u72AF\u7F6A\u8ABF\u67FB 2025\u5E74\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gen_relative_loan",
    iso3: [
      "*ALL"
    ],
    minAge: 25,
    maxAge: 75,
    annualProb: 0.06,
    requires: null,
    title: "\u89AA\u621A\u304B\u3089\u306E\u501F\u91D1\u306E\u983C\u307F",
    situation: "\u89AA\u621A\u304B\u3089\u3001\u5546\u58F2\u306E\u8CC7\u91D1\u3092\u5C11\u3057\u8CB8\u3057\u3066\u307B\u3057\u3044\u3068\u983C\u307E\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u8CB8\u3059",
        desc: "\u95A2\u4FC2\u304C\u6DF1\u307E\u308B\u3002\u8FD4\u3063\u3066\u3053\u306A\u3044\u3053\u3068\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 1e5
          },
          {
            type: "health",
            value: 0.99
          }
        ],
        result: "\u304A\u91D1\u3092\u8CB8\u3057\u305F\u3002"
      },
      {
        id: "b",
        label: "\u65AD\u308B",
        desc: "\u304A\u91D1\u306F\u5B88\u308C\u308B\u3002\u95A2\u4FC2\u304C\u304E\u304F\u3057\u3083\u304F\u3059\u308B\u3002",
        effects: [
          {
            type: "health",
            value: 1.01
          }
        ],
        result: "\u4E8B\u60C5\u3092\u8A71\u3057\u3066\u65AD\u3063\u305F\u3002"
      }
    ],
    basis: "\u904E\u53BB1\u5E74\u306B\u5BB6\u65CF\u30FB\u53CB\u4EBA\u304B\u3089\u304A\u91D1\u3092\u501F\u308A\u305F\u6210\u4EBA\u306F\u4F4E\u6240\u5F97\u56FD44%\u3001\u4F4E\u4E2D\u6240\u5F97\u56FD32%\uFF08\u4E16\u754C\u9280\u884C Global Findex 2021\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gen_hic_pension",
    iso3: [
      "*HIC"
    ],
    minAge: 25,
    maxAge: 55,
    annualProb: 0.05,
    requires: "working",
    title: "\u8001\u5F8C\u8CC7\u91D1\u306E\u7A4D\u7ACB",
    situation: "\u8077\u5834\u3067\u3001\u7A0E\u306E\u512A\u9047\u304C\u3042\u308B\u7A4D\u7ACB\u6295\u8CC7\u306E\u5236\u5EA6\u3092\u6848\u5185\u3055\u308C\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u6BCE\u6708\u7A4D\u307F\u7ACB\u3066\u308B",
        desc: "\u8001\u5F8C\u306E\u8CC7\u7523\u304C\u5897\u3048\u3084\u3059\u3044\u3002\u624B\u5143\u306E\u304A\u91D1\u304C\u6E1B\u308A\u3001\u76F8\u5834\u3067\u76EE\u6E1B\u308A\u3059\u308B\u5E74\u3082\u3042\u308B\u3002",
        effects: [
          {
            type: "cost",
            value: 12e4
          },
          {
            type: "protectCash",
            value: true
          }
        ],
        result: "\u6BCE\u6708\u306E\u7A4D\u7ACB\u3092\u59CB\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u4ECA\u306F\u4F7F\u3046",
        desc: "\u4ECA\u306E\u751F\u6D3B\u306B\u3086\u3068\u308A\u304C\u3067\u304D\u308B\u3002\u8001\u5F8C\u306E\u5099\u3048\u304C\u624B\u8584\u306B\u306A\u308B\u3002",
        effects: [
          {
            type: "health",
            value: 1
          },
          {
            type: "cashLossPct",
            value: 0.01
          }
        ],
        result: "\u7A4D\u7ACB\u306F\u3057\u306A\u3044\u3053\u3068\u306B\u3057\u305F\u3002"
      }
    ],
    basis: "\u9AD8\u6240\u5F97\u56FD\u306E\u50CD\u304F\u4EBA\u306E\u7D0451%\u304C\u8077\u5834\u306E\u7A4D\u7ACB\u5E74\u91D1\u306B\u52A0\u5165\uFF08OECD Pensions at a Glance 2023\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gen_hic_burnout",
    iso3: [
      "*HIC",
      "*UMC"
    ],
    minAge: 25,
    maxAge: 60,
    annualProb: 0.05,
    requires: "working",
    title: "\u4ED5\u4E8B\u306E\u71C3\u3048\u5C3D\u304D",
    situation: "\u4ED5\u4E8B\u306E\u91CF\u304C\u5897\u3048\u7D9A\u3051\u3001\u671D\u8D77\u304D\u308B\u306E\u304C\u3064\u3089\u304F\u306A\u3063\u3066\u304D\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u4F11\u8077\u3057\u3066\u4F11\u3080",
        desc: "\u5FC3\u3068\u4F53\u3092\u56DE\u5FA9\u3067\u304D\u308B\u3002\u53CE\u5165\u3068\u8A55\u4FA1\u304C\u4E0B\u304C\u308B\u3002",
        effects: [
          {
            type: "incomeDropPct",
            value: 0.3
          },
          {
            type: "health",
            value: 0.97
          },
          {
            type: "careerMult",
            value: 0.97
          }
        ],
        result: "\u533B\u5E2B\u3068\u76F8\u8AC7\u3057\u30663\u304B\u6708\u4F11\u3093\u3060\u3002"
      },
      {
        id: "b",
        label: "\u50CD\u304D\u65B9\u3092\u5909\u3048\u305A\u306B\u7D9A\u3051\u308B",
        desc: "\u53CE\u5165\u306F\u4FDD\u3066\u308B\u3002\u4F53\u8ABF\u3092\u5D29\u3059\u304A\u305D\u308C\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "health",
            value: 1.05
          }
        ],
        result: "\u306A\u3093\u3068\u304B\u6BCE\u65E5\u51FA\u52E4\u3092\u7D9A\u3051\u305F\u3002"
      }
    ],
    basis: "EU\u306E\u50CD\u304F\u4EBA\u306E44%\u304C\u904E\u53BB1\u5E74\u306B\u4ED5\u4E8B\u306E\u30B9\u30C8\u30EC\u30B9\u3084\u4E0D\u8ABF\u3092\u7D4C\u9A13\uFF08Eurofound 2022\uFF09\u3002\u71C3\u3048\u5C3D\u304D\u306F\u305D\u306E\u4E00\u90E8\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  },
  {
    id: "gen_umc_lmc_gig",
    iso3: [
      "*UMC",
      "*LMC"
    ],
    minAge: 18,
    maxAge: 45,
    annualProb: 0.02,
    requires: "urban",
    title: "\u914D\u9054\u30A2\u30D7\u30EA\u306E\u4ED5\u4E8B",
    situation: "\u30B9\u30DE\u30DB\u306E\u914D\u9054\u30A2\u30D7\u30EA\u306B\u767B\u9332\u3059\u308C\u3070\u3001\u3059\u3050\u306B\u50CD\u3051\u308B\u3068\u805E\u3044\u305F\u3002",
    options: [
      {
        id: "a",
        label: "\u914D\u9054\u306E\u4ED5\u4E8B\u3092\u59CB\u3081\u308B",
        desc: "\u3059\u3050\u306B\u73FE\u91D1\u53CE\u5165\u304C\u5F97\u3089\u308C\u308B\u3002\u793E\u4F1A\u4FDD\u967A\u304C\u306A\u304F\u3001\u4E8B\u6545\u306E\u304A\u305D\u308C\u304C\u3042\u308B\u3002",
        effects: [
          {
            type: "income",
            value: 2e5
          },
          {
            type: "health",
            value: 1.02
          },
          {
            type: "careerMult",
            value: 0.99
          }
        ],
        result: "\u30D0\u30A4\u30AF\u3067\u914D\u9054\u3092\u59CB\u3081\u305F\u3002"
      },
      {
        id: "b",
        label: "\u8077\u696D\u8A13\u7DF4\u3092\u53D7\u3051\u3066\u5225\u306E\u4ED5\u4E8B\u3092\u63A2\u3059",
        desc: "\u9577\u304F\u4F7F\u3048\u308B\u6280\u80FD\u304C\u8EAB\u306B\u3064\u304F\u3002\u8A13\u7DF4\u4E2D\u306F\u53CE\u5165\u304C\u5C11\u306A\u3044\u3002",
        effects: [
          {
            type: "cost",
            value: 5e4
          },
          {
            type: "careerMult",
            value: 1.04
          }
        ],
        result: "\u8077\u696D\u8A13\u7DF4\u6821\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002"
      }
    ],
    basis: "\u30A2\u30D7\u30EA\u3092\u901A\u3057\u3066\u50CD\u304F\u4EBA\u306F\u3001\u30D6\u30E9\u30B8\u30EB\u3067\u6C11\u9593\u306E\u50CD\u304F\u4EBA\u306E1.9%\uFF08IBGE 2024\u5E74\uFF09\u3001\u30A4\u30F3\u30C9\u30671.5%\uFF08NITI Aayog\uFF09\uFF08\u7D71\u8A08\u3067\u78BA\u8A8D\uFF09",
    estimated: false
  }
];

// data/world/cpi_annual.json
var cpi_annual_default = { AFG: { "2005": 12.69, "2006": 6.78, "2007": 8.68, "2008": 26.42, "2009": -6.81, "2010": 2.18, "2011": 11.8, "2012": 6.44, "2013": 7.39, "2014": 4.67, "2015": -0.66, "2016": 4.38, "2017": 4.98, "2018": 0.63, "2019": 2.3, "2020": 5.6, "2021": 5.13, "2022": 13.71, "2023": -4.64, "2024": -6.6 }, AGO: { "2000": 325, "2001": 152.56, "2002": 108.9, "2003": 98.22, "2004": 43.54, "2005": 22.95, "2006": 13.31, "2007": 12.25, "2008": 12.48, "2009": 13.73, "2010": 14.47, "2011": 13.48, "2012": 10.28, "2013": 8.78, "2014": 7.28, "2015": 9.36, "2016": 30.69, "2017": 29.84, "2018": 19.63, "2019": 17.08, "2020": 22.27, "2021": 25.75, "2022": 21.36, "2023": 13.64, "2024": 28.24, "2025": 20.16 }, ARG: { "2018": 34.28, "2019": 53.55, "2020": 42.02, "2021": 48.41, "2022": 72.43, "2023": 133.49, "2024": 219.88 }, AUS: { "2000": 4.46, "2001": 4.41, "2002": 2.98, "2003": 2.73, "2004": 2.34, "2005": 2.69, "2006": 3.56, "2007": 2.33, "2008": 4.35, "2009": 1.77, "2010": 2.92, "2011": 3.3, "2012": 1.76, "2013": 2.45, "2014": 2.49, "2015": 1.51, "2016": 1.28, "2017": 1.95, "2018": 1.91, "2019": 1.61, "2020": 0.85, "2021": 2.86, "2022": 6.59, "2023": 5.6, "2024": 3.17, "2025": 2.87 }, BDI: { "2000": 24.43, "2001": 9.3, "2002": -1.37, "2003": 10.65, "2004": 8.18, "2005": 13.25, "2006": 2.75, "2007": 8.41, "2008": 24.41, "2009": 10.56, "2010": 6.49, "2011": 9.59, "2012": 18.16, "2013": 7.94, "2014": 4.41, "2015": 5.54, "2016": 5.56, "2017": 16.05, "2018": -2.81, "2019": -0.69, "2020": 7.32, "2021": 8.4, "2022": 18.8, "2023": 26.94, "2024": 20.21, "2025": 34.13 }, BEN: { "2000": 4.17, "2001": 3.98, "2002": 2.49, "2003": 1.49, "2004": 0.87, "2005": 5.36, "2006": 3.78, "2007": 1.3, "2008": 7.95, "2009": 0.9, "2010": 2.21, "2011": 2.7, "2012": 6.74, "2013": 0.43, "2014": -0.55, "2015": 0.22, "2016": -0.79, "2017": 0.04, "2018": 0.92, "2019": 0.73, "2020": 3.02, "2021": 1.73, "2022": 1.35, "2023": 2.74, "2024": 1.16, "2025": 1.1 }, BFA: { "2000": -0.3, "2001": 5.01, "2002": 2.18, "2003": 2.03, "2004": -0.4, "2005": 6.42, "2006": 2.33, "2007": -0.23, "2008": 10.66, "2009": 2.61, "2010": -0.76, "2011": 2.76, "2012": 3.82, "2013": 0.53, "2014": -0.26, "2015": 0.72, "2016": 0.44, "2017": 1.48, "2018": 1.96, "2019": -3.23, "2020": 1.88, "2021": 3.65, "2022": 14.29, "2023": 0.74, "2024": 4.19, "2025": -0.59 }, BGD: { "2000": 2.21, "2001": 2.01, "2002": 3.33, "2003": 5.67, "2004": 7.59, "2005": 7.05, "2006": 6.77, "2007": 9.11, "2008": 8.9, "2009": 5.42, "2010": 8.13, "2011": 11.4, "2012": 6.22, "2013": 7.53, "2014": 6.99, "2015": 6.19, "2016": 5.51, "2017": 5.7, "2018": 5.54, "2019": 5.59, "2020": 5.69, "2021": 5.55, "2022": 7.7, "2023": 9.88, "2024": 10.47, "2025": 8.77 }, BOL: { "2000": 4.61, "2001": 1.59, "2002": 0.93, "2003": 3.34, "2004": 4.44, "2005": 5.39, "2006": 4.28, "2007": 8.71, "2008": 14.01, "2009": 3.35, "2010": 2.5, "2011": 9.88, "2012": 4.52, "2013": 5.74, "2014": 5.77, "2015": 4.06, "2016": 3.62, "2017": 2.82, "2018": 2.27, "2019": 1.84, "2020": 0.94, "2021": 0.74, "2022": 1.75, "2023": 2.58, "2024": 5.1, "2025": 19.52 }, BRA: { "2000": 7.04, "2001": 6.84, "2002": 8.45, "2003": 14.71, "2004": 6.6, "2005": 6.87, "2006": 4.18, "2007": 3.64, "2008": 5.68, "2009": 4.89, "2010": 5.04, "2011": 6.64, "2012": 5.4, "2013": 6.2, "2014": 6.33, "2015": 9.03, "2016": 8.74, "2017": 3.45, "2018": 3.66, "2019": 3.73, "2020": 3.21, "2021": 8.3, "2022": 9.28, "2023": 4.59, "2024": 4.37, "2025": 5.02 }, CAF: { "2000": 3.2, "2001": 3.83, "2002": 2.33, "2003": 4.13, "2004": -2.07, "2005": 2.88, "2006": 6.7, "2007": 0.96, "2008": 9.26, "2009": 3.52, "2010": 1.49, "2011": 1.19, "2012": 5.48, "2013": 6.99, "2014": 14.9, "2015": 1.4, "2016": 4.95, "2017": 4.18, "2018": 1.61, "2019": 2.69, "2020": 1.71, "2021": 4.26, "2022": 5.58, "2023": 2.98, "2024": 1.48, "2025": 1 }, CAN: { "2000": 2.72, "2001": 2.53, "2002": 2.26, "2003": 2.76, "2004": 1.86, "2005": 2.21, "2006": 2, "2007": 2.14, "2008": 2.37, "2009": 0.3, "2010": 1.78, "2011": 2.91, "2012": 1.52, "2013": 0.94, "2014": 1.91, "2015": 1.13, "2016": 1.43, "2017": 1.6, "2018": 2.27, "2019": 1.95, "2020": 0.72, "2021": 3.4, "2022": 6.8, "2023": 3.88, "2024": 2.38, "2025": 2.07 }, CHL: { "2000": 3.84, "2001": 3.57, "2002": 2.49, "2003": 2.81, "2004": 1.05, "2005": 3.05, "2006": 3.39, "2007": 4.41, "2008": 8.72, "2009": 0.35, "2010": 1.41, "2011": 3.34, "2012": 3.01, "2013": 1.79, "2014": 4.72, "2015": 4.35, "2016": 3.79, "2017": 2.18, "2018": 2.43, "2019": 2.56, "2020": 3.05, "2021": 4.52, "2022": 11.64, "2023": 7.58, "2024": 4.3, "2025": 4.21 }, CHN: { "2000": 0.35, "2001": 0.72, "2002": -0.73, "2003": 1.13, "2004": 3.82, "2005": 1.78, "2006": 1.65, "2007": 4.82, "2008": 5.93, "2009": -0.73, "2010": 3.18, "2011": 5.55, "2012": 2.62, "2013": 2.62, "2014": 1.92, "2015": 1.44, "2016": 2, "2017": 1.59, "2018": 2.07, "2019": 2.9, "2020": 2.42, "2021": 0.98, "2022": 1.97, "2023": 0.23, "2024": 0.22, "2025": 0.06 }, CIV: { "2000": 2.53, "2001": 4.36, "2002": 3.08, "2003": 3.3, "2004": 1.46, "2005": 3.89, "2006": 2.47, "2007": 1.89, "2008": 6.31, "2009": 1.02, "2010": 1.23, "2011": 4.91, "2012": 1.3, "2013": 2.58, "2014": 0.45, "2015": 1.25, "2016": 0.72, "2017": 0.69, "2018": 0.4, "2019": 0.79, "2020": 2.41, "2021": 4.16, "2022": 5.23, "2023": 4.37, "2024": 3.45, "2025": 0.13 }, CMR: { "2000": 1.23, "2001": 4.42, "2002": 2.83, "2003": 0.62, "2004": 0.23, "2005": 2.01, "2006": 5.12, "2007": 0.92, "2008": 5.34, "2009": 3.04, "2010": 1.28, "2011": 2.94, "2012": 2.74, "2013": 2.05, "2014": 1.85, "2015": 2.68, "2016": 0.87, "2017": 0.64, "2018": 1.07, "2019": 2.45, "2020": 2.44, "2021": 2.27, "2022": 6.25, "2023": 7.38, "2024": 4.53, "2025": 3.4 }, COD: { "2000": 513.91, "2001": 359.94, "2002": 31.52, "2003": 12.87, "2004": 3.99, "2005": 21.32, "2006": 13.05, "2007": 16.95, "2008": 17.3, "2009": 2.8, "2010": 7.1, "2011": 15.32, "2012": 9.72, "2013": 0.81, "2014": 1.24, "2015": 0.74, "2016": 2.89, "2022": 9.27, "2023": 19.89, "2024": 17.65, "2025": 7.41 }, COG: { "2000": -0.88, "2001": 0.06, "2002": 4.38, "2003": -0.63, "2004": 2.43, "2005": 3.09, "2006": 6.54, "2007": 2.65, "2008": 4.96, "2009": 4.42, "2010": 0.39, "2011": 1.76, "2012": 5.01, "2013": 4.63, "2014": 0.91, "2015": 3.17, "2016": 3.19, "2017": 0.45, "2018": 1.15, "2019": 2.21, "2020": 1.8, "2021": 1.72, "2022": 3.04, "2023": 4.3, "2024": 3.09, "2025": 2.4 }, COL: { "2000": 9.23, "2001": 7.97, "2002": 6.35, "2003": 7.13, "2004": 5.9, "2005": 5.05, "2006": 4.29, "2007": 5.54, "2008": 7, "2009": 4.2, "2010": 2.27, "2011": 3.42, "2012": 3.17, "2013": 2.02, "2014": 2.9, "2015": 4.99, "2016": 7.51, "2017": 4.31, "2018": 3.24, "2019": 3.52, "2020": 2.53, "2021": 3.5, "2022": 10.18, "2023": 11.74, "2024": 6.61, "2025": 5.14 }, DEU: { "2000": 1.44, "2001": 1.98, "2002": 1.42, "2003": 1.03, "2004": 1.67, "2005": 1.55, "2006": 1.58, "2007": 2.3, "2008": 2.63, "2009": 0.31, "2010": 1.1, "2011": 2.08, "2012": 2.01, "2013": 1.5, "2014": 0.91, "2015": 0.51, "2016": 0.49, "2017": 1.51, "2018": 1.73, "2019": 1.45, "2020": 0.14, "2021": 3.07, "2022": 6.87, "2023": 5.95, "2024": 2.26, "2025": 2.17 }, DOM: { "2000": 7.72, "2001": 8.88, "2002": 5.22, "2003": 27.45, "2004": 51.46, "2005": 4.19, "2006": 7.57, "2007": 6.14, "2008": 10.64, "2009": 1.44, "2010": 6.33, "2011": 5.8, "2012": 3.69, "2013": 4.83, "2014": 3, "2015": 0.84, "2016": 1.61, "2017": 3.28, "2018": 3.56, "2019": 1.81, "2020": 3.78, "2021": 8.24, "2022": 8.81, "2023": 4.79, "2024": 3.3, "2025": 3.87 }, DZA: { "2000": 0.34, "2001": 4.23, "2002": 1.42, "2003": 4.27, "2004": 3.96, "2005": 1.38, "2006": 2.31, "2007": 3.68, "2008": 4.86, "2009": 5.74, "2010": 3.91, "2011": 4.52, "2012": 8.89, "2013": 3.25, "2014": 2.92, "2015": 4.78, "2016": 6.4, "2017": 5.59, "2018": 4.27, "2019": 1.95, "2020": 2.42, "2021": 7.23, "2022": 9.27, "2023": 9.32, "2024": 4.05, "2025": 1.42 }, ECU: { "2000": 96.1, "2001": 37.68, "2002": 12.48, "2003": 7.93, "2004": 2.74, "2005": 2.17, "2006": 3.3, "2007": 2.28, "2008": 8.4, "2009": 5.16, "2010": 3.55, "2011": 4.47, "2012": 5.1, "2013": 2.72, "2014": 3.59, "2015": 3.97, "2016": 1.73, "2017": 0.42, "2018": -0.22, "2019": 0.27, "2020": -0.34, "2021": 0.13, "2022": 3.47, "2023": 2.22, "2024": 1.55, "2025": 0.71 }, EGY: { "2000": 2.68, "2001": 2.27, "2002": 2.74, "2003": 4.51, "2004": 11.27, "2005": 4.87, "2006": 7.64, "2007": 9.32, "2008": 18.32, "2009": 11.76, "2010": 11.27, "2011": 10.06, "2012": 7.11, "2013": 9.47, "2014": 10.07, "2015": 10.37, "2016": 13.81, "2017": 29.51, "2018": 14.4, "2019": 9.15, "2020": 5.04, "2021": 5.21, "2022": 13.9, "2023": 33.88, "2024": 28.27, "2025": 14.07 }, ESP: { "2000": 3.43, "2001": 3.59, "2002": 3.07, "2003": 3.04, "2004": 3.04, "2005": 3.37, "2006": 3.52, "2007": 2.79, "2008": 4.08, "2009": -0.29, "2010": 1.8, "2011": 3.2, "2012": 2.45, "2013": 1.41, "2014": -0.15, "2015": -0.5, "2016": -0.2, "2017": 1.96, "2018": 1.68, "2019": 0.7, "2020": -0.32, "2021": 3.09, "2022": 8.39, "2023": 3.53, "2024": 2.77, "2025": 2.67 }, ETH: { "2000": 0.66, "2001": -8.24, "2002": 0.68, "2003": 13.67, "2004": 3.33, "2005": 9.97, "2006": 12.3, "2007": 17.24, "2008": 44.36, "2009": 8.48, "2010": 8.15, "2011": 33.25, "2012": 23.6, "2013": 7.46, "2014": 6.89, "2015": 9.57, "2016": 6.63, "2017": 10.69, "2018": 13.83, "2019": 15.81, "2020": 20.36, "2021": 26.84, "2022": 33.89, "2023": 30.22, "2024": 21.04, "2025": 13.23 }, FRA: { "2000": 1.67, "2001": 1.64, "2002": 1.92, "2003": 2.1, "2004": 2.15, "2005": 1.74, "2006": 1.68, "2007": 1.49, "2008": 2.81, "2009": 0.09, "2010": 1.53, "2011": 2.11, "2012": 1.96, "2013": 0.86, "2014": 0.51, "2015": 0.04, "2016": 0.18, "2017": 1.03, "2018": 1.85, "2019": 1.11, "2020": 0.48, "2021": 1.64, "2022": 5.22, "2023": 4.88, "2024": 2, "2025": 0.94 }, GBR: { "2000": 1.18, "2001": 1.53, "2002": 1.52, "2003": 1.38, "2004": 1.39, "2005": 2.09, "2006": 2.46, "2007": 2.39, "2008": 3.52, "2009": 1.96, "2010": 2.49, "2011": 3.86, "2012": 2.57, "2013": 2.29, "2014": 1.45, "2015": 0.37, "2016": 1.01, "2017": 2.56, "2018": 2.29, "2019": 1.74, "2020": 0.99, "2021": 2.52, "2022": 7.92, "2023": 6.79, "2024": 3.27, "2025": 3.88 }, GHA: { "2000": 40.24, "2001": 41.51, "2002": 9.36, "2003": 29.77, "2004": 18.04, "2005": 15.44, "2006": 11.68, "2007": 10.73, "2008": 16.49, "2009": 19.25, "2010": 10.73, "2011": 8.73, "2012": 11.19, "2013": 11.67, "2014": 15.49, "2015": 17.15, "2016": 17.45, "2017": 12.37, "2018": 7.81, "2019": 7.14, "2020": 9.89, "2021": 9.97, "2022": 31.26, "2023": 38.11, "2024": 22.85, "2025": 14.2 }, GIN: { "2005": 31.37, "2006": 34.7, "2007": 18.18, "2008": 23.07, "2009": 4.68, "2010": 15.05, "2011": 21.32, "2012": 15.23, "2013": 11.89, "2014": 6.15, "2015": 11.78, "2016": 8.17, "2017": 8.91, "2018": 9.83, "2019": 9.47, "2020": 10.6, "2021": 12.6, "2022": 10.49, "2023": 7.8, "2024": 8.12, "2025": 3.57 }, GTM: { "2000": 5.98, "2001": 7.29, "2002": 8.13, "2003": 5.6, "2004": 7.58, "2005": 9.11, "2006": 6.56, "2007": 6.82, "2008": 11.36, "2009": 1.86, "2010": 3.86, "2011": 6.21, "2012": 3.78, "2013": 4.34, "2014": 3.42, "2015": 2.39, "2016": 4.45, "2017": 4.42, "2018": 3.75, "2019": 3.7, "2020": 3.21, "2021": 4.26, "2022": 6.89, "2023": 6.21, "2024": 2.87, "2025": 1.49 }, HND: { "2000": 11.05, "2001": 9.67, "2002": 7.69, "2003": 7.67, "2004": 8.11, "2005": 8.81, "2006": 5.58, "2007": 6.94, "2008": 11.4, "2009": 5.5, "2010": 4.7, "2011": 6.76, "2012": 5.2, "2013": 5.16, "2014": 6.13, "2015": 3.16, "2016": 2.72, "2017": 3.93, "2018": 4.35, "2019": 4.37, "2020": 3.47, "2021": 4.48, "2022": 9.09, "2023": 6.66, "2024": 4.61, "2025": 4.6 }, HTI: { "2000": 9.33, "2001": 13.32, "2002": 7.03, "2003": 28.7, "2004": 21.03, "2005": 13.97, "2006": 11.35, "2007": 6.56, "2008": 15.28, "2009": 0.39, "2010": 4.83, "2011": 6.33, "2012": 5.02, "2013": 4.77, "2014": 3.44, "2015": 6.73, "2016": 11.5, "2017": 10.68, "2018": 12.48, "2019": 18.7, "2020": 22.8, "2021": 16.84, "2022": 33.98, "2023": 36.81, "2024": 26.95, "2025": 28.64 }, IDN: { "2000": 3.69, "2001": 11.5, "2002": 11.9, "2003": 6.76, "2004": 6.06, "2005": 10.45, "2006": 13.11, "2007": 6.41, "2008": 10.23, "2009": 4.39, "2010": 5.13, "2011": 5.36, "2012": 4.28, "2013": 6.41, "2014": 6.39, "2015": 6.36, "2016": 3.53, "2017": 3.81, "2018": 3.2, "2019": 3.03, "2020": 1.92, "2021": 1.56, "2022": 4.21, "2023": 3.67, "2024": 2.18, "2025": 1.91 }, IND: { "2000": 4.01, "2001": 3.78, "2002": 4.3, "2003": 3.81, "2004": 3.77, "2005": 4.25, "2006": 5.8, "2007": 6.37, "2008": 8.35, "2009": 10.88, "2010": 11.99, "2011": 8.91, "2012": 9.48, "2013": 10.02, "2014": 6.67, "2015": 4.91, "2016": 4.95, "2017": 3.33, "2018": 3.94, "2019": 3.73, "2020": 6.62, "2021": 5.13, "2022": 6.7, "2023": 5.65, "2024": 4.95, "2025": 2.4 }, IRN: { "2000": 14.48, "2001": 11.27, "2002": 14.34, "2003": 16.47, "2004": 14.76, "2005": 13.43, "2006": 10.02, "2007": 17.34, "2008": 25.41, "2009": 13.55, "2010": 10.09, "2011": 26.29, "2012": 27.26, "2013": 36.6, "2014": 16.61, "2015": 12.48, "2016": 7.25, "2017": 8.04, "2018": 18.01, "2019": 39.91, "2020": 30.59, "2021": 43.39, "2022": 43.49, "2023": 44.58, "2024": 32.46, "2025": 42.17 }, IRQ: { "2000": 4.98, "2001": 16.37, "2002": 19.32, "2003": 33.62, "2004": 26.96, "2005": 36.96, "2006": 53.23, "2007": -10.07, "2008": 12.66, "2009": 6.87, "2010": 2.43, "2011": 5.6, "2012": 6.09, "2013": 1.88, "2014": 2.24, "2015": 1.39, "2016": 0.56, "2017": 0.18, "2018": 0.37, "2019": -0.2, "2020": 0.57, "2021": 6.04, "2022": 4.99, "2023": 4.36, "2024": 2.61, "2025": 0.3 }, ISR: { "2000": 1.03, "2001": 1.12, "2002": 5.8, "2003": 0.71, "2004": -0.42, "2005": 1.34, "2006": 2.05, "2007": 0.47, "2008": 4.53, "2009": 3.37, "2010": 2.7, "2011": 3.49, "2012": 1.68, "2013": 1.59, "2014": 0.47, "2015": -0.62, "2016": -0.54, "2017": 0.25, "2018": 0.81, "2019": 0.82, "2020": -0.58, "2021": 1.48, "2022": 4.41, "2023": 4.23, "2024": 3.07, "2025": 3.04 }, ITA: { "2000": 2.54, "2001": 2.79, "2002": 2.47, "2003": 2.67, "2004": 2.21, "2005": 1.99, "2006": 2.09, "2007": 1.83, "2008": 3.35, "2009": 0.77, "2010": 1.53, "2011": 2.78, "2012": 3.04, "2013": 1.22, "2014": 0.24, "2015": 0.04, "2016": -0.09, "2017": 1.23, "2018": 1.14, "2019": 0.61, "2020": -0.14, "2021": 1.87, "2022": 8.2, "2023": 5.62, "2024": 0.98, "2025": 1.53 }, JOR: { "2000": 0.67, "2001": 1.77, "2002": 1.83, "2003": 1.63, "2004": 3.36, "2005": 3.49, "2006": 6.25, "2007": 4.74, "2008": 13.97, "2009": -0.74, "2010": 4.85, "2011": 4.16, "2012": 4.52, "2013": 4.82, "2014": 2.9, "2015": -0.88, "2016": -0.78, "2017": 3.32, "2018": 4.46, "2019": 0.76, "2020": 0.33, "2021": 1.35, "2022": 4.23, "2023": 2.08, "2024": 1.56, "2025": 1.77 }, JPN: { "2000": -0.68, "2001": -0.74, "2002": -0.92, "2003": -0.26, "2004": -0.01, "2005": -0.28, "2006": 0.25, "2007": 0.06, "2008": 1.38, "2009": -1.35, "2010": -0.73, "2011": -0.27, "2012": -0.04, "2013": 0.34, "2014": 2.76, "2015": 0.8, "2016": -0.13, "2017": 0.48, "2018": 0.99, "2019": 0.47, "2020": -0.03, "2021": -0.23, "2022": 2.5, "2023": 3.27, "2024": 2.74, "2025": 3.17 }, KAZ: { "2000": 13.18, "2001": 8.35, "2002": 5.84, "2003": 6.44, "2004": 6.88, "2005": 7.58, "2006": 8.72, "2007": 10.85, "2008": 17.14, "2009": 7.32, "2010": 7.4, "2011": 8.45, "2012": 5.2, "2013": 5.94, "2014": 6.85, "2015": 6.68, "2016": 14.36, "2017": 7.44, "2018": 6.16, "2019": 5.33, "2020": 6.8, "2021": 7.96, "2022": 14.99, "2023": 14.52, "2024": 8.68, "2025": 11.38 }, KEN: { "2000": 9.98, "2001": 5.74, "2002": 1.96, "2003": 9.82, "2004": 11.62, "2005": 10.31, "2006": 14.45, "2007": 9.76, "2008": 26.24, "2009": 9.23, "2010": 3.96, "2011": 14.02, "2012": 9.38, "2013": 5.72, "2014": 6.88, "2015": 6.58, "2016": 6.3, "2017": 8.01, "2018": 4.69, "2019": 5.24, "2020": 5.41, "2021": 6.11, "2022": 7.66, "2023": 7.67, "2024": 4.49, "2025": 4.07 }, KHM: { "2000": -0.79, "2001": -0.6, "2002": 0.21, "2003": 0.94, "2004": 4.32, "2005": 6.62, "2006": 5.81, "2007": 8.71, "2008": 24.1, "2009": -1.24, "2010": 4, "2011": 5.48, "2012": 2.93, "2013": 2.94, "2014": 3.86, "2015": 1.22, "2016": 3.02, "2017": 2.91, "2018": 2.46, "2019": 1.94, "2020": 2.94, "2021": 2.92, "2022": 5.34, "2023": 2.13, "2024": 0.81, "2025": 2.35 }, KOR: { "2000": 2.26, "2001": 4.07, "2002": 2.76, "2003": 3.51, "2004": 3.59, "2005": 2.75, "2006": 2.24, "2007": 2.53, "2008": 4.67, "2009": 2.76, "2010": 2.94, "2011": 4.03, "2012": 2.19, "2013": 1.3, "2014": 1.27, "2015": 0.71, "2016": 0.97, "2017": 1.94, "2018": 1.48, "2019": 0.38, "2020": 0.54, "2021": 2.5, "2022": 5.09, "2023": 3.6, "2024": 2.32, "2025": 2.12 }, LKA: { "2000": 6.18, "2001": 14.16, "2002": 9.55, "2003": 6.31, "2004": 7.58, "2005": 11.64, "2006": 10.02, "2007": 15.84, "2008": 22.56, "2009": 3.46, "2010": 6.22, "2011": 6.72, "2012": 7.54, "2013": 6.91, "2014": 3.18, "2015": 3.77, "2016": 3.96, "2017": 7.7, "2018": 2.14, "2019": 3.53, "2020": 6.15, "2021": 7.01, "2022": 49.72, "2023": 16.54, "2024": -0.43, "2025": -4.76 }, MAR: { "2000": 1.89, "2001": 0.62, "2002": 2.8, "2003": 1.17, "2004": 1.49, "2005": 0.98, "2006": 3.28, "2007": 2.04, "2008": 3.71, "2009": 0.97, "2010": 0.99, "2011": 0.91, "2012": 1.29, "2013": 1.88, "2014": 0.44, "2015": 1.56, "2016": 1.64, "2017": 0.75, "2018": 1.8, "2019": 0.3, "2020": 0.71, "2021": 1.4, "2022": 6.66, "2023": 6.09, "2024": 0.99, "2025": 0.7 }, MDG: { "2000": 11.86, "2001": 7.92, "2002": 16.5, "2003": -1.7, "2004": 13.96, "2005": 18.36, "2006": 10.77, "2007": 10.29, "2008": 9.3, "2009": 8.95, "2010": 9.25, "2011": 9.48, "2012": 5.71, "2013": 5.83, "2014": 6.08, "2015": 7.4, "2016": 6.04, "2017": 8.59, "2018": 8.6, "2019": 5.63, "2020": 4.19, "2021": 5.81, "2022": 8.16, "2023": 9.87, "2024": 7.61, "2025": 8.05 }, MEX: { "2000": 9.49, "2001": 6.37, "2002": 5.03, "2003": 4.55, "2004": 4.69, "2005": 3.99, "2006": 3.63, "2007": 3.97, "2008": 5.12, "2009": 5.3, "2010": 4.16, "2011": 3.41, "2012": 4.11, "2013": 3.81, "2014": 4.02, "2015": 2.72, "2016": 2.82, "2017": 6.04, "2018": 4.9, "2019": 3.64, "2020": 3.4, "2021": 5.69, "2022": 7.9, "2023": 5.53, "2024": 4.72, "2025": 3.81 }, MLI: { "2000": -0.68, "2001": 5.19, "2002": 5.03, "2003": -1.35, "2004": -3.1, "2005": 6.4, "2006": 1.54, "2007": 1.41, "2008": 9.17, "2009": 2.46, "2010": 1.11, "2011": 2.96, "2012": 5.32, "2013": -0.61, "2014": 0.88, "2015": 1.45, "2016": -1.8, "2017": 1.76, "2018": 0.3, "2019": -1.66, "2020": 0.44, "2021": 3.93, "2022": 9.62, "2023": 2.06, "2024": 3.21, "2025": 3.28 }, MMR: { "2000": -0.11, "2001": 21.1, "2002": 57.07, "2003": 36.59, "2004": 4.53, "2005": 9.37, "2006": 20, "2007": 35.02, "2008": 26.8, "2009": 1.47, "2010": 7.72, "2011": 5.02, "2012": 1.47, "2013": 5.64, "2014": 4.95, "2015": 9.45, "2016": 6.93, "2017": 4.57, "2018": 6.87, "2019": 8.83, "2022": 27.2, "2023": 27.6, "2024": 29.6, "2025": 21.1 }, MOZ: { "2005": 6.43, "2006": 13.25, "2007": 8.49, "2008": 14.5, "2009": 3.79, "2010": 12.43, "2011": 11.17, "2012": 2.6, "2013": 4.26, "2014": 2.56, "2015": 3.55, "2016": 17.42, "2017": 15.11, "2018": 3.91, "2019": 2.8, "2020": 3.48, "2021": 6.41, "2022": 10.28, "2023": 7.13, "2024": 4.08, "2025": 4.37 }, MWI: { "2000": 29.58, "2001": 22.7, "2002": 14.74, "2003": 9.58, "2004": 11.43, "2005": 15.41, "2006": 13.97, "2007": 7.95, "2008": 8.71, "2009": 8.42, "2010": 7.41, "2011": 7.62, "2012": 21.27, "2013": 27.28, "2014": 23.79, "2015": 21.87, "2016": 21.71, "2017": 11.54, "2018": 12.42, "2019": 9.37, "2020": 8.63, "2021": 9.33, "2022": 20.95, "2023": 28.79, "2024": 32.18, "2025": 28.37 }, MYS: { "2000": 1.53, "2001": 1.42, "2002": 1.81, "2003": 1.09, "2004": 1.42, "2005": 2.98, "2006": 3.61, "2007": 2.03, "2008": 5.44, "2009": 0.58, "2010": 1.62, "2011": 3.17, "2012": 1.66, "2013": 2.11, "2014": 3.14, "2015": 2.1, "2016": 2.09, "2017": 3.87, "2018": 0.88, "2019": 0.66, "2020": -1.14, "2021": 2.48, "2022": 3.38, "2023": 2.49, "2024": 1.83, "2025": 1.38 }, NER: { "2000": 2.9, "2001": 4.01, "2002": 2.63, "2003": -1.61, "2004": 0.26, "2005": 7.8, "2006": 0.04, "2007": 0.05, "2008": 11.31, "2009": 0.58, "2010": 0.8, "2011": 2.94, "2012": 0.46, "2013": 2.3, "2014": -0.93, "2015": -0.58, "2016": 1.65, "2017": 2.8, "2018": 2.97, "2019": -2.49, "2020": 2.9, "2021": 3.84, "2022": 4.23, "2023": 3.7, "2024": 9.07, "2025": -4.45 }, NGA: { "2000": 6.93, "2001": 18.87, "2002": 12.88, "2003": 14.03, "2004": 15, "2005": 17.86, "2006": 8.23, "2007": 5.39, "2008": 11.58, "2009": 12.54, "2010": 13.74, "2011": 10.83, "2012": 12.22, "2013": 8.5, "2014": 8.05, "2015": 9.01, "2016": 15.7, "2017": 16.5, "2018": 12.1, "2019": 11.4, "2020": 13.25, "2021": 16.95, "2022": 18.85, "2023": 24.66, "2024": 33.24, "2025": 23.01 }, NPL: { "2000": 2.48, "2001": 2.69, "2002": 3.03, "2003": 5.71, "2004": 2.84, "2005": 6.84, "2006": 6.92, "2007": 2.27, "2008": 9.91, "2009": 11.09, "2010": 9.33, "2011": 9.23, "2012": 9.46, "2013": 9.04, "2014": 8.36, "2015": 7.87, "2016": 8.79, "2017": 2.78, "2018": 4.41, "2019": 5.57, "2020": 5.06, "2021": 4.13, "2022": 7.67, "2023": 7.12, "2024": 4.69, "2025": 2.65 }, PAK: { "2000": 4.37, "2001": 3.15, "2002": 3.29, "2003": 2.91, "2004": 7.44, "2005": 9.06, "2006": 7.92, "2007": 7.6, "2008": 20.29, "2009": 13.65, "2010": 12.94, "2011": 11.92, "2012": 9.68, "2013": 7.69, "2014": 7.19, "2015": 2.53, "2016": 3.77, "2017": 4.09, "2018": 5.08, "2019": 10.58, "2020": 9.74, "2021": 9.5, "2022": 19.87, "2023": 30.77, "2024": 12.63, "2025": 3.55 }, PER: { "2000": 3.76, "2001": 1.98, "2002": 0.19, "2003": 2.26, "2004": 3.66, "2005": 1.62, "2006": 2, "2007": 1.78, "2008": 5.79, "2009": 2.94, "2010": 1.53, "2011": 3.37, "2012": 3.61, "2013": 2.77, "2014": 3.41, "2015": 3.4, "2016": 3.56, "2017": 2.99, "2018": 1.51, "2019": 2.25, "2020": 2, "2021": 4.27, "2022": 8.33, "2023": 6.46, "2024": 2.01, "2025": 1.53 }, PHL: { "2000": 3.98, "2001": 5.35, "2002": 2.72, "2003": 2.29, "2004": 4.83, "2005": 6.52, "2006": 5.49, "2007": 2.9, "2008": 8.26, "2009": 4.22, "2010": 3.79, "2011": 4.72, "2012": 3.03, "2013": 2.58, "2014": 3.6, "2015": 0.67, "2016": 1.25, "2017": 2.85, "2018": 5.31, "2019": 2.39, "2020": 2.39, "2021": 3.93, "2022": 5.82, "2023": 5.98, "2024": 3.21, "2025": 1.66 }, PNG: { "2000": 15.6, "2001": 9.3, "2002": 11.8, "2003": 14.71, "2004": 2.16, "2005": 1.78, "2006": 2.37, "2007": 0.91, "2008": 10.76, "2009": 6.92, "2010": 6.01, "2011": 4.44, "2012": 4.54, "2013": 4.96, "2014": 5.22, "2015": 6, "2016": 6.67, "2017": 5.42, "2018": 4.37, "2019": 3.93, "2020": 4.87, "2021": 4.48, "2022": 5.25, "2023": 2.3, "2024": 0.6, "2025": 4.42 }, POL: { "2000": 9.9, "2001": 5.41, "2002": 1.91, "2003": 0.68, "2004": 3.38, "2005": 2.18, "2006": 1.28, "2007": 2.46, "2008": 4.16, "2009": 3.8, "2010": 2.58, "2011": 4.24, "2012": 3.56, "2013": 0.99, "2014": 0.05, "2015": -0.87, "2016": -0.66, "2017": 2.08, "2018": 1.81, "2019": 2.23, "2020": 3.37, "2021": 5.06, "2022": 14.43, "2023": 11.53, "2024": 3.79, "2025": 3.81 }, PRK: {}, RUS: { "2000": 20.8, "2001": 21.48, "2002": 15.79, "2003": 13.66, "2004": 10.89, "2005": 12.69, "2006": 9.67, "2007": 9.01, "2008": 14.11, "2009": 11.65, "2010": 6.85, "2011": 8.44, "2012": 5.07, "2013": 6.75, "2014": 7.82, "2015": 15.53, "2016": 7.04, "2017": 3.68, "2018": 2.88, "2019": 4.47, "2020": 3.38, "2021": 6.69, "2022": 13.74, "2023": 5.87, "2024": 8.43, "2025": 8.72 }, RWA: { "2000": 3.9, "2001": 3.34, "2002": 1.99, "2003": 7.45, "2004": 12.25, "2005": 9.01, "2006": 8.88, "2007": 9.08, "2008": 15.44, "2009": 12.94, "2010": -0.25, "2011": 3.08, "2012": 10.27, "2013": 5.92, "2014": 2.35, "2015": 2.53, "2016": 7.17, "2017": 8.28, "2018": -0.31, "2019": 3.35, "2020": 9.85, "2021": -0.39, "2022": 17.69, "2023": 19.79, "2024": 1.77, "2025": 5.91 }, SAU: { "2000": -1.12, "2001": -1.12, "2002": 0.25, "2003": 0.61, "2004": 0.52, "2005": 0.48, "2006": 2.21, "2007": 4.17, "2008": 9.87, "2009": 5.06, "2010": 5.34, "2011": 5.83, "2012": 2.87, "2013": 3.12, "2014": 1.84, "2015": 1.18, "2016": 2.92, "2017": -0.86, "2018": 2.47, "2019": -2.04, "2020": 3.19, "2021": 3.13, "2022": 2.54, "2023": 2.47, "2024": 1.5, "2025": 2.04 }, SDN: { "2000": 7.12, "2001": 1.94, "2002": 22.22, "2003": 6.49, "2004": 9.66, "2005": 8.51, "2006": 7.2, "2007": 14.75, "2008": 14.3, "2009": 11.26, "2010": 12.98, "2011": 18.1, "2012": 35.56, "2013": 36.52, "2014": 36.91, "2015": 16.91, "2016": 17.75, "2017": 32.35, "2018": 63.29, "2019": 50.99, "2020": 163.26, "2021": 359.09, "2022": 138.81 }, SEN: { "2000": 0.73, "2001": 2.97, "2002": 2.34, "2003": -0.05, "2004": 0.51, "2005": 1.71, "2006": 2.11, "2007": 5.85, "2008": 7.35, "2009": -2.25, "2010": 1.23, "2011": 3.4, "2012": 1.42, "2013": 0.71, "2014": -1.09, "2015": 0.14, "2016": 0.84, "2017": 1.32, "2018": 0.46, "2019": 1.76, "2020": 2.54, "2021": 2.18, "2022": 9.7, "2023": 5.94, "2024": 0.8, "2025": 1.46 }, SLE: { "2007": 11.65, "2008": 8.21, "2009": 7.47, "2010": 7.19, "2011": 6.79, "2012": 6.59, "2013": 5.52, "2014": 4.64, "2015": 6.69, "2016": 10.89, "2017": 18.22, "2018": 16.03, "2019": 14.8, "2020": 13.45, "2021": 11.87, "2022": 27.21, "2023": 47.64, "2024": 28.63, "2025": 7.49 }, SOM: { "2013": 4.5, "2014": 1.3, "2015": 0.8, "2016": 1.3, "2017": 6.1, "2018": 3.2, "2019": 3.1, "2020": 4.3, "2021": 4.6, "2022": 6.8, "2023": 6.2, "2024": 5.5, "2025": 3.7 }, SSD: { "2009": 5.01, "2010": 1.17, "2011": 46.85, "2012": 45.53, "2013": -0.06, "2014": 1.67, "2015": 52.77, "2016": 380, "2017": 187.85, "2018": 83.5, "2019": 87.24, "2020": 29.68, "2021": 10.52, "2022": -6.69, "2023": 2.38, "2024": 91.44 }, SYR: { "1995": 7.6, "1996": 8.8, "1997": 2.2, "1998": -0.4, "1999": -2.1, "2000": -0.6, "2001": 3, "2002": 1, "2003": 5.8, "2004": 4.4, "2005": 7.2, "2006": 10, "2007": 3.9, "2008": 15.7, "2009": 2.8, "2010": 4.4, "2011": 4.75, "2012": 36.7, "2013": 40.03, "2014": 10.93, "2015": 38.46, "2016": 47.71, "2017": 18.08, "2018": 0.94, "2019": 13.42 }, TCD: { "2000": 3.82, "2001": 12.43, "2002": 5.19, "2003": -1.75, "2004": -5.36, "2005": 7.89, "2006": 8.04, "2007": -8.97, "2008": 10.3, "2009": 9.95, "2010": -2.08, "2011": 2.03, "2012": 7.52, "2013": 0.22, "2014": 1.68, "2015": 4.38, "2016": -0.79, "2017": -1.54, "2018": 4.27, "2019": -0.97, "2020": 4.46, "2021": -0.77, "2022": 5.79, "2023": 10.84, "2024": 8.9, "2025": -3.91 }, TGO: { "2000": 1.86, "2001": 3.92, "2002": 3.06, "2003": -0.93, "2004": 0.39, "2005": 6.78, "2006": 2.23, "2007": 0.95, "2008": 8.69, "2009": 3.71, "2010": 1.45, "2011": 3.56, "2012": 2.58, "2013": 1.83, "2014": 0.19, "2015": 2.58, "2016": 1.29, "2017": -0.98, "2018": 0.93, "2019": 0.67, "2020": 1.7, "2021": 4.19, "2022": 7.97, "2023": 5.49, "2024": 2.86, "2025": 0.43 }, THA: { "2000": 1.59, "2001": 1.63, "2002": 0.7, "2003": 1.8, "2004": 2.76, "2005": 4.54, "2006": 4.64, "2007": 2.24, "2008": 5.47, "2009": -0.85, "2010": 3.25, "2011": 3.81, "2012": 3.01, "2013": 2.19, "2014": 1.89, "2015": -0.9, "2016": 0.19, "2017": 0.66, "2018": 1.07, "2019": 0.71, "2020": -0.85, "2021": 1.23, "2022": 6.08, "2023": 1.23, "2024": 0.4, "2025": -0.13 }, TJK: { "2001": 38.59, "2002": 12.25, "2003": 16.3, "2004": 7.14, "2005": 7.09, "2006": 10.01, "2007": 13.15, "2008": 20.47, "2009": 6.45, "2010": 6.45, "2011": 12.43, "2012": 5.83, "2013": 5.01, "2014": 6.1, "2015": 5.71, "2016": 6, "2017": 7.31, "2018": 3.84, "2019": 7.77, "2020": 8.58, "2021": 8.97, "2022": 6.61, "2023": 3.58, "2024": 3.48, "2025": 3.39 }, TUR: { "2000": 54.92, "2001": 54.4, "2002": 44.96, "2003": 21.6, "2004": 8.6, "2005": 8.18, "2006": 9.6, "2007": 8.76, "2008": 10.44, "2009": 6.25, "2010": 8.57, "2011": 6.47, "2012": 8.89, "2013": 7.49, "2014": 8.85, "2015": 7.67, "2016": 7.78, "2017": 11.14, "2018": 16.33, "2019": 15.18, "2020": 12.28, "2021": 19.6, "2022": 72.31, "2023": 53.86, "2024": 58.51, "2025": 34.88 }, TZA: { "2000": 5.92, "2001": 5.15, "2002": 5.32, "2003": 5.3, "2004": 4.74, "2005": 5.03, "2006": 7.25, "2007": 7.03, "2008": 10.28, "2009": 12.14, "2010": 6.2, "2011": 12.69, "2012": 16, "2013": 7.87, "2014": 6.13, "2015": 5.59, "2016": 5.17, "2017": 5.32, "2018": 3.49, "2019": 3.46, "2020": 3.29, "2021": 3.69, "2022": 4.35, "2023": 3.8, "2024": 3.06, "2025": 3.33 }, UGA: { "2000": 3.39, "2001": 1.87, "2002": -0.29, "2003": 8.68, "2004": 3.72, "2005": 8.45, "2006": 7.31, "2007": 6.14, "2008": 12.05, "2009": 13.02, "2010": 3.98, "2011": 16.56, "2012": 12.68, "2013": 4.91, "2014": 3.08, "2015": 5.59, "2016": 5.71, "2017": 5.21, "2018": 2.62, "2019": 2.87, "2020": 3.31, "2021": 2.2, "2022": 7.2, "2023": 5.35, "2024": 3.32, "2025": 3.58 }, UKR: { "2000": 28.2, "2001": 11.96, "2002": 0.76, "2003": 5.18, "2004": 9.05, "2005": 13.57, "2006": 9.05, "2007": 12.84, "2008": 25.23, "2009": 15.88, "2010": 9.37, "2011": 7.96, "2012": 0.57, "2013": -0.24, "2014": 12.07, "2015": 48.7, "2016": 13.91, "2017": 14.44, "2018": 10.95, "2019": 7.89, "2020": 2.73, "2021": 9.36, "2022": 20.18, "2023": 12.85, "2024": 6.5, "2025": 12.73 }, USA: { "2000": 3.38, "2001": 2.83, "2002": 1.59, "2003": 2.27, "2004": 2.68, "2005": 3.39, "2006": 3.23, "2007": 2.85, "2008": 3.84, "2009": -0.36, "2010": 1.64, "2011": 3.16, "2012": 2.07, "2013": 1.46, "2014": 1.62, "2015": 0.12, "2016": 1.26, "2017": 2.13, "2018": 2.44, "2019": 1.81, "2020": 1.23, "2021": 4.7, "2022": 8, "2023": 4.12, "2024": 2.95 }, UZB: { "2011": 13.78, "2012": 13.21, "2013": 11.84, "2014": 9.28, "2015": 8.75, "2016": 8.13, "2017": 13.88, "2018": 17.52, "2019": 14.53, "2020": 12.87, "2021": 10.85, "2022": 11.45, "2023": 9.96, "2024": 9.63, "2025": 8.8 }, VEN: { "2009": 27.08, "2010": 28.19, "2011": 26.09, "2012": 21.07, "2013": 40.64, "2014": 62.17, "2015": 121.74, "2016": 254.95, "2022": 186.54, "2023": 337.46, "2024": 49.36, "2025": 251.95 }, VNM: { "2000": -1.71, "2001": -0.43, "2002": 3.83, "2003": 3.23, "2004": 7.75, "2005": 8.28, "2006": 7.42, "2007": 8.34, "2008": 23.12, "2009": 6.72, "2010": 9.21, "2011": 18.68, "2012": 9.09, "2013": 6.59, "2014": 4.08, "2015": 0.63, "2016": 2.67, "2017": 3.52, "2018": 3.54, "2019": 2.8, "2020": 3.22, "2021": 1.83, "2022": 3.16, "2023": 3.25, "2024": 3.62, "2025": 3.31 }, YEM: { "2000": 4.59, "2001": 11.91, "2002": 12.24, "2003": 10.83, "2004": 12.52, "2005": 11.81, "2006": 10.84, "2007": 7.91, "2008": 18.98, "2009": 5.41, "2010": 11.17, "2011": 19.54, "2012": 9.89, "2013": 10.97, "2014": 8.1, "2022": 36.44, "2023": 17.58, "2024": 26.56, "2025": 20.18 }, ZAF: { "2000": 5.34, "2001": 5.7, "2002": 9.49, "2003": 5.68, "2004": -0.69, "2005": 2.06, "2006": 3.24, "2007": 6.18, "2008": 9.91, "2009": 7.24, "2010": 4.07, "2011": 5, "2012": 5.74, "2013": 5.78, "2014": 6.13, "2015": 4.52, "2016": 6.6, "2017": 5.19, "2018": 4.51, "2019": 4.1, "2020": 3.23, "2021": 4.62, "2022": 7.04, "2023": 6.08, "2024": 4.36, "2025": 3.21 }, ZMB: { "2000": 26.03, "2001": 21.39, "2002": 22.23, "2003": 21.4, "2004": 17.97, "2005": 18.32, "2006": 9.02, "2007": 10.66, "2008": 12.45, "2009": 13.4, "2010": 8.5, "2011": 6.43, "2012": 6.58, "2013": 6.98, "2014": 7.81, "2015": 10.11, "2016": 17.87, "2017": 6.58, "2018": 7.49, "2019": 9.15, "2020": 15.73, "2021": 22.02, "2022": 10.99, "2023": 10.88, "2024": 14.99, "2025": 13.91 }, ZWE: { "2010": 3.02, "2011": 3.47, "2012": 3.73, "2013": 1.63, "2014": -0.2, "2015": -2.43, "2016": -1.54, "2017": 0.89, "2018": 10.62, "2019": 255.3, "2020": 557.2, "2021": 98.55, "2022": 104.71 } };

// src/engine/risks.ts
var RISKS = risks_default;
var DEFAULT = {
  inflationMean: 0.05,
  inflationCrisisShare: 0,
  homicidePer100k: 5,
  ipvPast12mWomen: 0.1,
  politicalStability: 0,
  conflictRisk: 0,
  floodRisk: 0.3,
  droughtRisk: 0.3,
  earthquakeRisk: 0.1,
  epidemicRisk: 0.2
};
var num2 = (x, d) => typeof x === "number" && isFinite(x) ? x : d;
function riskOf(iso3) {
  const r = RISKS[iso3] ?? {};
  const out = { ...DEFAULT };
  for (const k of Object.keys(DEFAULT)) out[k] = num2(r[k], DEFAULT[k]);
  return out;
}
function ipvHazard(iso3, sex) {
  const raw = RISKS[iso3];
  const women = num2(raw?.ipvLifetimeWomen, Math.min(0.6, riskOf(iso3).ipvPast12mWomen * 2.2));
  const lifetime = sex === "female" ? women : num2(raw?.ipvLifetimeMen, women * 0.35);
  return 1 - Math.pow(1 - Math.min(0.6, lifetime), 1 / 40);
}
var CPI = cpi_annual_default;
var cpiYears = /* @__PURE__ */ new Map();
function yearsOf(iso3) {
  let ys = cpiYears.get(iso3);
  if (!ys) {
    ys = Object.keys(CPI[iso3] ?? {}).map(Number).sort((a, b) => a - b);
    cpiYears.set(iso3, ys);
  }
  return ys;
}
function inflationOf(l, r) {
  const ys = yearsOf(l.D.iso3);
  if (ys.length < 5) return null;
  const next = l.inflSrcYear === null ? null : ys.find((y) => y > l.inflSrcYear);
  const jump = r.chance(1 / 8);
  const year = next === void 0 || next === null || jump ? ys[Math.floor(r.next() * ys.length)] : next;
  l.inflSrcYear = year;
  return { rate: Math.min(3, CPI[l.D.iso3][String(year)] / 100), year };
}
function riskYear(l, r) {
  const a = l.age;
  if (a < 18) return;
  const k = riskOf(l.D.iso3);
  const cash = Math.max(0, l.cash);
  const infl = inflationOf(l, r);
  if (infl) {
    const p = infl.rate;
    l.lastInflation = p;
    const lossRate = Math.min(0.75, Math.max(0, p - 0.05) / (1 + p) * 0.8) * (l.protectCash ? 0.3 : 1);
    const loss = cash * lossRate;
    if (loss > 0) l.spend("inflation", loss);
    if (p >= 0.25) {
      if (l.inflSpell === 0) {
        l.inflSpellFrom = infl.year;
        if (cash > 0) l.mark("inflation");
        const tenths = Math.round(lossRate * 10);
        l.log(
          "money",
          `\u7269\u4FA1\u304C1\u5E74\u3067${Math.round(p * 100)}%\u4E0A\u304C\u3063\u305F\uFF08${l.D.nameJa}\u3067${infl.year}\u5E74\u306B\u5B9F\u969B\u306B\u8A18\u9332\u3055\u308C\u305F\u4E0A\u6607\u7387\uFF09\u3002` + (cash <= 0 ? "" : tenths >= 1 ? `\u8CAF\u91D1\u306E\u4FA1\u5024\u304C${tenths}\u5272\u307B\u3069\u6E1B\u3063\u305F\u3002` : "\u8CAF\u91D1\u306E\u4FA1\u5024\u304C\u5C11\u3057\u6E1B\u3063\u305F\u3002") + (l.protectCash && cash > 0 ? "\u30C9\u30EB\u3084\u91D1\u3067\u6301\u3063\u3066\u3044\u305F\u5206\u306F\u5B88\u3089\u308C\u305F\u3002" : ""),
          loss > 0 ? -loss : void 0,
          true
        );
      }
      l.inflSpell++;
    } else {
      if (l.inflSpell >= 2) {
        l.log("money", `\u7269\u4FA1\u306E\u6FC0\u3057\u3044\u4E0A\u6607\u304C${l.inflSpell}\u5E74\u7D9A\u304D\u3001\u3088\u3046\u3084\u304F\u843D\u3061\u7740\u3044\u305F\uFF08${l.D.nameJa}\u306E${l.inflSpellFrom}\u5E74\u304B\u3089\u306E\u52D5\u304D\u3068\u540C\u3058\uFF09\u3002`);
      }
      l.inflSpell = 0;
      if (p >= 0.08 && cash > 0 && !l.inflationNoticed) {
        l.inflationNoticed = true;
        l.log("money", "\u7269\u4FA1\u304C\u6BCE\u5E74\u306E\u3088\u3046\u306B\u4E0A\u304C\u308A\u3001\u624B\u5143\u306E\u304A\u91D1\u306E\u4FA1\u5024\u304C\u5C11\u3057\u305A\u3064\u76EE\u6E1B\u308A\u3057\u3066\u3044\u304F\u3002");
      }
    }
  } else if (cash > 0 && r.chance(k.inflationCrisisShare * 0.5)) {
    const loss = cash * r.range(0.3, 0.7) * (l.protectCash ? 0.4 : 1);
    l.spend("inflation", loss);
    l.log("money", `\u7269\u4FA1\u304C\u6025\u306B\u8DF3\u306D\u4E0A\u304C\u308A\u3001\u901A\u8CA8\u306E\u4FA1\u5024\u304C\u4E0B\u304C\u3063\u305F\u3002\u8CAF\u91D1\u306E\u4FA1\u5024\u304C${Math.round(loss / cash * 10)}\u5272\u307B\u3069\u6E1B\u3063\u305F\u3002`, -loss, true);
    l.mark("inflation");
  } else if (cash > 0 && k.inflationMean > 0.08) {
    const rate = Math.min(0.2, (k.inflationMean - 0.05) * 0.6) * (l.protectCash ? 0.3 : 1);
    l.spend("inflation", cash * rate);
    if (!l.inflationNoticed) {
      l.inflationNoticed = true;
      l.log("money", "\u7269\u4FA1\u304C\u6BCE\u5E74\u306E\u3088\u3046\u306B\u4E0A\u304C\u308A\u3001\u624B\u5143\u306E\u304A\u91D1\u306E\u4FA1\u5024\u304C\u5C11\u3057\u305A\u3064\u76EE\u6E1B\u308A\u3057\u3066\u3044\u304F\u3002");
    }
  }
  if (r.chance(Math.min(0.08, 6e-3 + k.homicidePer100k * 18e-4))) {
    const c = l.y(r.range(3e4, 3e5));
    l.spend("other", c);
    l.log(
      "money",
      r.pick([
        l.vary("theft1", ["\u5BB6\u306B\u6CE5\u68D2\u304C\u5165\u308A\u3001\u5BB6\u96FB\u3068\u73FE\u91D1\u3092\u76D7\u307E\u308C\u305F\u3002", "\u7559\u5B88\u306E\u3042\u3044\u3060\u306B\u7A7A\u304D\u5DE3\u306B\u5165\u3089\u308C\u305F\u3002"]),
        l.vary("theft2", ["\u9053\u3067\u30B9\u30DE\u30DB\u3068\u8CA1\u5E03\u3092\u596A\u308F\u308C\u305F\u3002", "\u30D0\u30B9\u306E\u4E2D\u3067\u8CA1\u5E03\u3092\u3059\u3089\u308C\u305F\u3002"]),
        l.vary("theft3", ["\u4ED5\u4E8B\u9053\u5177\u3092\u76D7\u307E\u308C\u3001\u8CB7\u3044\u76F4\u3057\u305F\u3002", "\u81EA\u8EE2\u8ECA\u3092\u76D7\u307E\u308C\u3001\u8CB7\u3044\u76F4\u3057\u305F\u3002"])
      ]),
      -c
    );
    l.mark("theft");
  }
  if (k.politicalStability < -0.5 && l.job !== "none" && l.job !== "retired" && r.chance(0.02 * -k.politicalStability)) {
    const lost = l.salaryOf(a) * 0.25;
    l.spend("other", lost);
    l.log("work", l.vary("unrest", ["\u653F\u60C5\u304C\u4E0D\u5B89\u5B9A\u306B\u306A\u308A\u3001\u30C7\u30E2\u3084\u5C01\u9396\u3067\u4ED5\u4E8B\u304C\u6570\u304B\u6708\u6B62\u307E\u3063\u305F\u3002", "\u6297\u8B70\u30C7\u30E2\u3067\u9053\u8DEF\u304C\u5C01\u9396\u3055\u308C\u3001\u3057\u3070\u3089\u304F\u50CD\u304D\u306B\u51FA\u3089\u308C\u306A\u304B\u3063\u305F\u3002", "\u653F\u6CBB\u306E\u6DF7\u4E71\u3067\u3001\u52E4\u3081\u5148\u304C\u6570\u304B\u6708\u9589\u307E\u3063\u305F\u3002"]), -lost, true);
    l.mark("unrest");
  }
  if (k.conflictRisk > 0 && r.chance(k.conflictRisk * 0.012)) {
    const c = l.y(r.range(2e5, 8e5)) + Math.max(0, l.cash) * 0.3;
    l.spend("housing", c);
    if (l.home === "own") l.home = "rent";
    l.log("disaster", "\u5730\u57DF\u3067\u6B66\u529B\u885D\u7A81\u304C\u8D77\u304D\u3001\u5BB6\u65CF\u3067\u907F\u96E3\u3057\u305F\u3002\u66AE\u3089\u3057\u3092\u7ACB\u3066\u76F4\u3059\u306E\u306B\u6642\u9593\u304C\u304B\u304B\u3063\u305F\u3002", -c, true);
    l.mark("displaced");
  }
  if (r.chance(k.epidemicRisk * 0.015)) {
    const c = l.y(r.range(2e4, 15e4)) + (l.job !== "none" && l.job !== "retired" ? l.salaryOf(a) * 0.15 : 0);
    l.spend("medical", c);
    l.log("health", "\u611F\u67D3\u75C7\u304C\u6D41\u884C\u3057\u3001\u5BB6\u65CF\u304C\u5BDD\u8FBC\u3093\u3060\u3002\u3057\u3070\u3089\u304F\u50CD\u3051\u306A\u304B\u3063\u305F\u3002", -c);
    l.mark("epidemic");
  }
  if (l.region.urban === false && !l.D.isJapan && r.chance(k.droughtRisk * 0.035)) {
    const c = Math.max(l.salaryOf(a), l.y(5e5)) * 0.3;
    l.spend("other", c);
    l.log("disaster", l.vary("drought", ["\u96E8\u304C\u964D\u3089\u305A\u3001\u4F5C\u7269\u304C\u307B\u3068\u3093\u3069\u80B2\u305F\u306A\u304B\u3063\u305F\u3002\u98DF\u3079\u7269\u306E\u5024\u6BB5\u3082\u4E0A\u304C\u3063\u305F\u3002", "\u65E5\u7167\u308A\u304C\u7D9A\u304D\u3001\u7551\u304C\u67AF\u308C\u305F\u3002\u5BB6\u755C\u306E\u6C34\u306B\u3082\u56F0\u3063\u305F\u3002", "\u96E8\u5B63\u306B\u96E8\u304C\u5C11\u306A\u304F\u3001\u53CE\u7A6B\u304C\u534A\u5206\u307B\u3069\u306B\u306A\u3063\u305F\u3002"]), -c, true);
    l.mark("drought");
  }
  if (!l.D.isJapan) {
    if (r.chance(k.floodRisk * 0.015)) {
      const c = l.y(r.range(1e5, 6e5));
      l.spend("events", c);
      l.log("disaster", "\u5927\u96E8\u3067\u5DDD\u304C\u3042\u3075\u308C\u3001\u5BB6\u304C\u6D78\u6C34\u3057\u305F\u3002", -c, true);
      l.mark("disaster");
    } else if (r.chance(k.earthquakeRisk * 4e-3)) {
      const c = l.y(r.range(3e5, 2e6));
      l.spend("events", c);
      l.log("disaster", "\u5927\u304D\u306A\u5730\u9707\u3067\u5BB6\u304C\u58CA\u308C\u3001\u4FEE\u7406\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3002", -c, true);
      l.mark("disaster");
    }
  }
  const rr = streamRng(l.seed, "road", a);
  if (rr.chance(roadInjuryRate(l.D.iso3))) {
    const cost = l.y(rr.range(3e5, 12e5));
    l.spend("medical", cost);
    const working2 = l.job !== "none" && l.job !== "retired";
    const covered = working2 && sickPayCovered(l.D.iso3, l.job, l.D.inst?.informalShare ?? 0);
    const lost = working2 ? l.salaryOf(a) * (2 / 12) * (covered ? 1 / 3 : 1) : 0;
    if (lost > 0) l.spend("other", lost);
    l.log(
      "health",
      l.vary("road", ["\u4EA4\u901A\u4E8B\u6545\u306B\u3042\u3044\u3001\u5927\u3051\u304C\u3092\u3057\u305F\u30021\u304B\u6708\u4EE5\u4E0A\u3001\u6CBB\u7642\u306B\u901A\u3063\u305F\u3002", "\u9053\u3092\u6E21\u3063\u3066\u3044\u308B\u3068\u304D\u306B\u8ECA\u306B\u306F\u306D\u3089\u308C\u3001\u5165\u9662\u3057\u305F\u3002", working2 ? "\u901A\u52E4\u306E\u9014\u4E2D\u3067\u4E8B\u6545\u306B\u5DFB\u304D\u8FBC\u307E\u308C\u3001\u9AA8\u3092\u6298\u3063\u305F\u3002" : "\u51FA\u304B\u3051\u305F\u5148\u3067\u4E8B\u6545\u306B\u5DFB\u304D\u8FBC\u307E\u308C\u3001\u9AA8\u3092\u6298\u3063\u305F\u3002"]) + (!working2 ? "" : covered ? "\u4F11\u3093\u3067\u3044\u308B\u9593\u306F\u3001\u56FD\u306E\u5236\u5EA6\u3067\u7D66\u6599\u306E3\u5206\u306E2\u304C\u51FA\u305F\u3002" : "\u4F11\u3093\u3067\u3044\u308B\u9593\u306E\u7D66\u6599\u306F\u51FA\u306A\u304B\u3063\u305F\u3002"),
      -(cost + lost),
      true
    );
    l.mark("road");
  }
}
var EVENTS = country_events_default;
function matches(e, l) {
  const ig = l.D.inst?.incomeGroup ?? "HIC";
  const tags = new Set(e.iso3);
  const place = tags.has(l.D.iso3) || tags.has("*ALL") || tags.has("*" + ig) || tags.has("*RURAL") && l.region.urban === false || tags.has("*URBAN") && l.region.urban !== false;
  if (!place) return false;
  if (l.age < e.minAge || l.age > e.maxAge) return false;
  return (e.requires ?? "").split("+").every((q) => requirement(q, l));
}
function requirement(q, l) {
  const kid = /^kid:(\d+)-(\d+)$/.exec(q);
  if (kid) return l.kids.some((x) => l.age - x.born >= Number(kid[1]) && l.age - x.born <= Number(kid[2]) && !l.kidWithEx(x));
  switch (q) {
    case "":
      return true;
    case "working":
      return l.job !== "none" && l.job !== "retired" && l.school === "done";
    case "nonregular":
      return l.job === "nonregular";
    case "married":
      return !!l.partner?.alive;
    case "newlywed":
      return !!l.partner?.alive && l.age - l.partnerSince <= 1;
    case "dating":
      return l.dating && !l.partner;
    case "hasKids":
      return l.kids.some((x) => l.age - x.born < 18 && !l.kidWithEx(x));
    case "rural":
      return l.region.urban === false;
    case "urban":
      return l.region.urban !== false;
    case "ownsHome":
      return l.home === "own";
    case "mortgage":
      return l.home === "own" && l.loan > 0;
    case "renting":
      return l.home === "rent";
    case "notOwner":
      return l.home !== "own";
    // 高校などに在学中（大学入試・進路の話）
    case "student":
      return l.school === "hs" || l.school === "hs_night" || l.school === "kosen";
    case "inUniv":
      return l.school === "univ" || l.school === "univ_work" || l.school === "univ_night" || l.school === "grad";
    // 離れて暮らす親が生きている
    case "parentAway":
      return l.home !== "parents" && l.parents.some((p) => p.alive);
    default:
      throw new Error(`\u56FD\u3054\u3068\u306E\u51FA\u6765\u4E8B\u306E\u6761\u4EF6\u304C\u5206\u304B\u3089\u306A\u3044: ${q}`);
  }
}
function applyEffects(l, effects) {
  let money = 0;
  for (const ef of effects) {
    const v = typeof ef.value === "number" ? ef.value : 0;
    switch (ef.type) {
      case "cost":
        l.spend("other", l.y(v));
        money -= l.y(v);
        break;
      case "income":
        l.addIncome("windfall", l.y(v));
        money += l.y(v);
        break;
      case "cashLossPct": {
        const loss = Math.max(0, l.cash) * Math.min(1, v) * (l.protectCash ? 0.5 : 1);
        l.spend("other", loss);
        money -= loss;
        break;
      }
      case "incomeDropPct": {
        const loss = l.salaryOf(l.age) * Math.min(1, v);
        l.spend("other", loss);
        money -= loss;
        break;
      }
      case "careerMult":
        l.careerMult = Math.min(2.6, Math.max(0.5, l.careerMult * (v || 1)));
        break;
      case "health":
        l.illMult = Math.min(2, Math.max(0.6, l.illMult * (v || 1)));
        break;
      case "moveCost":
        l.spend("housing", l.y(v));
        money -= l.y(v);
        if (l.home === "own") l.home = "rent";
        break;
      case "protectCash":
        l.protectCash = ef.value === true || v > 0;
        break;
    }
  }
  return money;
}
function countryEventScene(l, r) {
  if (l.age < 6) return null;
  const pool = EVENTS.filter((e) => !l.usedEvents.has(e.id) && matches(e, l));
  for (const e of pool) {
    if (!r.chance(Math.min(0.2, e.annualProb))) continue;
    l.usedEvents.add(e.id);
    return {
      id: `c_${e.id}`,
      title: e.title,
      situation: e.situation,
      stillValid: (l2) => (e.requires ?? "").split("+").every((q) => requirement(q, l2)),
      options: e.options.map((o) => ({
        id: o.id,
        label: o.label,
        desc: o.desc,
        apply: (l2) => {
          const nothing = (o.effects ?? []).some((x) => x.type === "cashLossPct") && l2.cash <= 0;
          const m = applyEffects(l2, o.effects ?? []);
          const result = o.result || `${o.label}\u3053\u3068\u306B\u3057\u305F\u3002`;
          const note = !nothing ? "" : /詐欺|だまさ|取られ/.test(result) ? "\u305F\u3060\u3001\u624B\u5143\u306B\u304A\u91D1\u304C\u306A\u304F\u3001\u53D6\u3089\u308C\u305A\u306B\u6E08\u3093\u3060\u3002" : /減|値段|値上|物価|倍/.test(result) ? "\u305F\u3060\u3001\u3082\u3068\u3082\u3068\u8CAF\u91D1\u306F\u307B\u3068\u3093\u3069\u306A\u304B\u3063\u305F\u3002" : "";
          l2.logPre("life", result + note, m || void 0);
        }
      }))
    };
  }
  return null;
}
var COUNTRY_EVENT_COUNT = EVENTS.length;

// src/engine/micro.ts
function hashPick(key, n) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return (h >>> 0) % Math.max(1, n);
}
var working = (l) => l.job !== "none" && l.job !== "retired" && l.school === "done";
var alone = (l) => !(l.partner && l.partner.alive) && l.kids.length === 0;
var company = (l) => l.job === "big" || l.job === "sme" || l.job === "civil";
var poorCountry = (l) => l.D.inst !== null && (l.D.inst.incomeGroup === "LIC" || l.D.inst.incomeGroup === "LMC");
var hasKids = (l) => l.kids.some((k) => l.age - k.born < 18);
var parentsAlive = (l) => l.parents.some((p) => p.alive);
var MICROS = [
  // ── 子ども時代（6〜14歳）
  {
    id: "study",
    min: 7,
    max: 11,
    title: "\u653E\u8AB2\u5F8C\u306E\u904E\u3054\u3057\u65B9",
    situation: () => "\u53CB\u3060\u3061\u306B\u904A\u3073\u306B\u8A98\u308F\u308C\u305F\u3002\u5BBF\u984C\u306F\u307E\u3060\u7D42\u308F\u3063\u3066\u3044\u306A\u3044\u3002",
    options: [
      { id: "a", label: "\u5BBF\u984C\u3092\u5148\u306B\u3084\u308B", desc: "\u52C9\u5F37\u306E\u529B\u304C\u3064\u304F\u3002\u8A98\u3044\u3092\u65AD\u308B\u3053\u3068\u306B\u306A\u308B\u3002", apply: (l) => {
        l.aptitude = Math.min(1, l.aptitude + 0.05);
        l.logPre("school", "\u5BBF\u984C\u3092\u7D42\u308F\u3089\u305B\u3066\u304B\u3089\u904A\u3093\u3060\u3002\u52C9\u5F37\u304C\u5C11\u3057\u5F97\u610F\u306B\u306A\u3063\u305F\u3002");
      } },
      { id: "b", label: "\u904A\u3073\u306B\u884C\u304F", desc: "\u53CB\u3060\u3061\u304C\u5897\u3048\u308B\u3002\u52C9\u5F37\u306F\u5C11\u3057\u9045\u308C\u308B\u3002", apply: (l) => {
        l.aptitude = Math.max(0, l.aptitude - 0.02);
        l.social += 0.08;
        l.logPre("life", "\u65E5\u304C\u66AE\u308C\u308B\u307E\u3067\u904A\u3093\u3060\u3002\u53CB\u3060\u3061\u304C\u5897\u3048\u305F\u3002");
      } }
    ]
  },
  {
    id: "otoshidama",
    min: 6,
    max: 12,
    title: "\u3082\u3089\u3063\u305F\u304A\u5C0F\u9063\u3044",
    situation: (l) => `\u89AA\u621A\u304B\u3089${l.D.fmt(l.y(1e4), false)}\u306E\u304A\u5C0F\u9063\u3044\u3092\u3082\u3089\u3063\u305F\u3002`,
    options: [
      { id: "a", label: "\u8CAF\u91D1\u7BB1\u306B\u5165\u308C\u308B", desc: "\u5C11\u3057\u305A\u3064\u8CAF\u307E\u308B\u3002\u6B32\u3057\u3044\u7269\u306F\u304C\u307E\u3093\u3002", apply: (l) => {
        l.addIncome("windfall", l.y(1e4));
        l.thrift *= 0.98;
        l.logPre("money", "\u8CAF\u91D1\u7BB1\u306B\u5165\u308C\u305F\u3002\u304A\u91D1\u3092\u8CAF\u3081\u308B\u304F\u305B\u304C\u3064\u3044\u305F\u3002", l.y(1e4));
      } },
      { id: "b", label: "\u6B32\u3057\u304B\u3063\u305F\u7269\u3092\u8CB7\u3046", desc: "\u4ECA\u3059\u3050\u3046\u308C\u3057\u3044\u3002\u624B\u5143\u306B\u306F\u6B8B\u3089\u306A\u3044\u3002", apply: (l) => {
        l.logPre("life", "\u305A\u3063\u3068\u6B32\u3057\u304B\u3063\u305F\u7269\u3092\u8CB7\u3063\u305F\u3002");
      } }
    ]
  },
  {
    id: "help",
    min: 9,
    max: 14,
    when: poorCountry,
    title: "\u5BB6\u306E\u624B\u4F1D\u3044",
    situation: () => "\u5BB6\u8A08\u304C\u82E6\u3057\u304F\u3001\u89AA\u304C\u4ED5\u4E8B\u3092\u624B\u4F1D\u3063\u3066\u307B\u3057\u3044\u3068\u8A00\u3063\u3066\u3044\u308B\u3002",
    options: [
      { id: "a", label: "\u653E\u8AB2\u5F8C\u306B\u624B\u4F1D\u3046", desc: "\u5BB6\u8A08\u304C\u52A9\u304B\u308B\u3002\u52C9\u5F37\u306E\u6642\u9593\u306F\u6E1B\u308B\u3002", apply: (l) => {
        l.aptitude = Math.max(0, l.aptitude - 0.06);
        l.familyHelped = true;
        l.logPre("family", "\u653E\u8AB2\u5F8C\u306F\u5BB6\u306E\u4ED5\u4E8B\u3092\u624B\u4F1D\u3063\u305F\u3002\u89AA\u306B\u611F\u8B1D\u3055\u308C\u305F\u3002");
      } },
      { id: "b", label: "\u52C9\u5F37\u3092\u7D9A\u3051\u305F\u3044\u3068\u4F1D\u3048\u308B", desc: "\u5B66\u6821\u306B\u96C6\u4E2D\u3067\u304D\u308B\u3002\u5BB6\u306F\u5C11\u3057\u82E6\u3057\u304F\u306A\u308B\u3002", apply: (l) => {
        l.aptitude = Math.min(1, l.aptitude + 0.04);
        l.logPre("school", "\u52C9\u5F37\u3092\u7D9A\u3051\u305F\u3044\u3068\u4F1D\u3048\u3001\u89AA\u306F\u6298\u308C\u3066\u304F\u308C\u305F\u3002");
      } }
    ]
  },
  {
    id: "club",
    min: 12,
    max: 14,
    title: "\u90E8\u6D3B\u52D5",
    situation: () => "\u4E2D\u5B66\u3067\u5165\u308B\u90E8\u6D3B\u3092\u6C7A\u3081\u308B\u65E5\u3002",
    options: [
      { id: "a", label: "\u904B\u52D5\u90E8\u306B\u5165\u308B", desc: "\u4F53\u304C\u4E08\u592B\u306B\u306A\u308B\u3002\u52C9\u5F37\u306E\u6642\u9593\u306F\u6E1B\u308B\u3002", apply: (l) => {
        l.illMult *= 0.94;
        l.aptitude = Math.max(0, l.aptitude - 0.02);
        l.logPre("school", "\u904B\u52D5\u90E8\u306B\u5165\u3063\u305F\u3002\u6BCE\u65E5\u3078\u3068\u3078\u3068\u3060\u304C\u4F53\u529B\u304C\u3064\u3044\u305F\u3002");
      } },
      { id: "b", label: "\u52C9\u5F37\u306B\u96C6\u4E2D\u3059\u308B", desc: "\u6210\u7E3E\u304C\u4E0A\u304C\u308A\u3084\u3059\u3044\u3002\u4F53\u529B\u306F\u3064\u304B\u306A\u3044\u3002", apply: (l) => {
        l.aptitude = Math.min(1, l.aptitude + 0.05);
        l.logPre("school", "\u90E8\u6D3B\u306B\u306F\u5165\u3089\u305A\u3001\u52C9\u5F37\u306B\u96C6\u4E2D\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "phone",
    min: 13,
    max: 16,
    title: "\u306F\u3058\u3081\u3066\u306E\u30B9\u30DE\u30DB",
    situation: () => "\u5468\u308A\u306F\u307F\u3093\u306A\u30B9\u30DE\u30DB\u3092\u6301\u3063\u3066\u3044\u308B\u3002",
    options: [
      { id: "a", label: "\u89AA\u306B\u306D\u3060\u308B", desc: "\u53CB\u3060\u3061\u3068\u3064\u306A\u304C\u308C\u308B\u3002\u591C\u3075\u304B\u3057\u304C\u5897\u3048\u308B\u304B\u3082\u3002", apply: (l, r) => {
        if (r.chance(0.4)) {
          l.aptitude = Math.max(0, l.aptitude - 0.04);
          l.logPre("life", "\u30B9\u30DE\u30DB\u3092\u8CB7\u3063\u3066\u3082\u3089\u3063\u305F\u3002\u591C\u3075\u304B\u3057\u304C\u5897\u3048\u3001\u6210\u7E3E\u304C\u5C11\u3057\u843D\u3061\u305F\u3002");
        } else {
          l.social += 0.05;
          l.logPre("life", "\u30B9\u30DE\u30DB\u3092\u8CB7\u3063\u3066\u3082\u3089\u3063\u305F\u3002\u53CB\u3060\u3061\u3068\u306E\u3084\u308A\u3068\u308A\u304C\u5897\u3048\u305F\u3002");
        }
      } },
      { id: "b", label: "\u9AD8\u6821\u307E\u3067\u5F85\u3064", desc: "\u52C9\u5F37\u306B\u96C6\u4E2D\u3067\u304D\u308B\u3002\u8A71\u984C\u306B\u3064\u3044\u3066\u3044\u3051\u306A\u3044\u3053\u3068\u3082\u3002", apply: (l) => {
        l.aptitude = Math.min(1, l.aptitude + 0.02);
        l.logPre("life", "\u30B9\u30DE\u30DB\u306F\u3082\u3046\u5C11\u3057\u5F85\u3064\u3053\u3068\u306B\u3057\u305F\u3002");
      } }
    ]
  },
  // ── 10代後半〜20代
  {
    id: "parttime",
    min: 16,
    max: 21,
    when: (l) => l.school !== "done" && l.school !== "child",
    title: "\u30A2\u30EB\u30D0\u30A4\u30C8",
    situation: () => "\u8FD1\u6240\u306E\u5E97\u3067\u30A2\u30EB\u30D0\u30A4\u30C8\u3092\u52DF\u96C6\u3057\u3066\u3044\u308B\u3002",
    options: [
      { id: "a", label: "\u90314\u3067\u50CD\u304F", desc: "\u304A\u91D1\u304C\u8CAF\u307E\u308B\u3002\u52C9\u5F37\u306E\u6642\u9593\u304C\u6E1B\u308B\u3002", apply: (l) => {
        l.addIncome("salary", l.y(4e5));
        l.aptitude = Math.max(0, l.aptitude - 0.04);
        l.logPre("work", "\u30A2\u30EB\u30D0\u30A4\u30C8\u3092\u59CB\u3081\u305F\u3002\u81EA\u5206\u3067\u7A3C\u3050\u697D\u3057\u3055\u3092\u77E5\u3063\u305F\u3002", l.y(4e5));
      } },
      { id: "b", label: "\u5B66\u696D\u3092\u512A\u5148\u3059\u308B", desc: "\u6210\u7E3E\u304C\u5B89\u5B9A\u3059\u308B\u3002\u304A\u91D1\u306F\u306A\u3044\u3002", apply: (l) => {
        l.aptitude = Math.min(1, l.aptitude + 0.03);
        l.logPre("school", "\u30A2\u30EB\u30D0\u30A4\u30C8\u306F\u305B\u305A\u3001\u5B66\u696D\u306B\u96C6\u4E2D\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "credit",
    min: 19,
    max: 30,
    when: working,
    title: "\u6B32\u3057\u304B\u3063\u305F\u7269",
    situation: (l) => `\u6B32\u3057\u304B\u3063\u305F\u7269\u304C${l.D.fmt(l.y(25e4), false)}\u3002\u5206\u5272\u6255\u3044\u306A\u3089\u4ECA\u3059\u3050\u8CB7\u3048\u308B\u3002`,
    options: [
      { id: "a", label: "\u5206\u5272\u3067\u4ECA\u3059\u3050\u8CB7\u3046", desc: "\u3059\u3050\u624B\u306B\u5165\u308B\u3002\u5229\u606F\u304C\u9AD8\u304F\u3064\u304F\u3002", apply: (l) => {
        l.spend("fun", l.y(33e4));
        l.logPre("money", "\u5206\u5272\u6255\u3044\u3067\u8CB7\u3063\u305F\u3002\u5229\u606F\u3092\u542B\u3081\u308B\u3068\u601D\u3063\u305F\u3088\u308A\u9AD8\u304F\u3064\u3044\u305F\u3002", -l.y(33e4));
      } },
      { id: "b", label: "\u304A\u91D1\u3092\u8CAF\u3081\u3066\u304B\u3089\u8CB7\u3046", desc: "\u5229\u606F\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u624B\u306B\u5165\u308B\u306E\u306F1\u5E74\u5F8C\u3002", apply: (l) => {
        l.spend("fun", l.y(25e4));
        l.thrift *= 0.98;
        l.logPre("money", "1\u5E74\u304B\u3051\u3066\u8CAF\u3081\u3066\u304B\u3089\u8CB7\u3063\u305F\u3002", -l.y(25e4));
      } }
    ]
  },
  {
    id: "migrate",
    min: 20,
    max: 40,
    when: (l) => poorCountry(l) && working(l) && !l.abroad,
    title: "\u6D77\u5916\u3078\u306E\u51FA\u7A3C\u304E",
    situation: () => "\u77E5\u308A\u5408\u3044\u304C\u3001\u4E2D\u6771\u306E\u5EFA\u8A2D\u73FE\u5834\u3084\u5916\u56FD\u306E\u5DE5\u5834\u3067\u306E\u4ED5\u4E8B\u3092\u7D39\u4ECB\u3059\u308B\u3068\u8A00\u3046\u3002",
    options: [
      { id: "a", label: "\u6D77\u5916\u306B\u50CD\u304D\u306B\u51FA\u308B", desc: "\u53CE\u5165\u304C\u6570\u500D\u306B\u306A\u308B\u3002\u5BB6\u65CF\u3068\u96E2\u308C\u3001\u4EF2\u4ECB\u6599\u3084\u5951\u7D04\u30C8\u30E9\u30D6\u30EB\u306E\u5371\u967A\u3082\u3002", apply: (l, r) => {
        const fee = l.y(3e5);
        l.spend("other", fee);
        if (r.chance(0.18)) {
          l.logPre("work", "\u4EF2\u4ECB\u696D\u8005\u306B\u624B\u6570\u6599\u3060\u3051\u53D6\u3089\u308C\u3001\u4ED5\u4E8B\u306F\u7D39\u4ECB\u3055\u308C\u306A\u304B\u3063\u305F\u3002", -fee, true);
          return;
        }
        l.abroadUntil = l.age + r.int(3, 8);
        l.abroad = true;
        l.logPre("work", "\u6D77\u5916\u3078\u51FA\u7A3C\u304E\u306B\u51FA\u305F\u3002\u7D66\u6599\u306E\u591A\u304F\u3092\u5BB6\u65CF\u306B\u9001\u3063\u305F\u3002", -fee, true);
      } },
      { id: "b", label: "\u5730\u5143\u306B\u6B8B\u308B", desc: "\u5BB6\u65CF\u3068\u66AE\u3089\u305B\u308B\u3002\u53CE\u5165\u306F\u4ECA\u306E\u307E\u307E\u3002", apply: (l) => {
        l.social += 0.05;
        l.logPre("family", "\u5730\u5143\u306B\u6B8B\u308A\u3001\u5BB6\u65CF\u3068\u66AE\u3089\u3059\u3053\u3068\u306B\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "livestock",
    min: 22,
    max: 55,
    when: (l) => poorCountry(l) && !l.region.urban,
    title: "\u5BB6\u755C\u3092\u8CB7\u3046",
    situation: (l) => `\u8CAF\u3081\u305F\u304A\u91D1\u3067\u725B\u30921\u982D\u8CB7\u3048\u305D\u3046\u3060\uFF08${l.D.fmt(l.y(25e4))}\uFF09\u3002`,
    options: [
      { id: "a", label: "\u725B\u3092\u8CB7\u3046", desc: "\u4E73\u3084\u5B50\u725B\u3067\u53CE\u5165\u304C\u5897\u3048\u308B\u3002\u75C5\u6C17\u3067\u5931\u3046\u3053\u3068\u3082\u3042\u308B\u3002", apply: (l, r) => {
        l.spend("other", l.y(25e4));
        if (r.chance(0.2)) l.logPre("money", "\u725B\u3092\u8CB7\u3063\u305F\u304C\u3001\u75C5\u6C17\u3067\u6B7B\u3093\u3067\u3057\u307E\u3063\u305F\u3002", -l.y(25e4), true);
        else {
          l.sideIncome += l.y(9e4);
          l.logPre("money", "\u725B\u3092\u8CB7\u3063\u305F\u3002\u4E73\u3092\u58F2\u3063\u3066\u5C11\u3057\u305A\u3064\u7A3C\u3052\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", -l.y(25e4));
        }
      } },
      { id: "b", label: "\u73FE\u91D1\u3067\u6301\u3063\u3066\u304A\u304F", desc: "\u3044\u3056\u3068\u3044\u3046\u6642\u306B\u4F7F\u3048\u308B\u3002\u5897\u3048\u306F\u3057\u306A\u3044\u3002", apply: (l) => {
        l.logPre("money", "\u304A\u91D1\u306F\u624B\u5143\u306B\u6B8B\u3057\u3066\u304A\u3044\u305F\u3002");
      } }
    ]
  },
  {
    id: "dollar",
    min: 22,
    max: 70,
    when: (l) => !l.protectCash && l.cash > l.y(3e5) && (riskOf(l.D.iso3).inflationMean > 0.08 || l.lastInflation > 0.15),
    title: "\u8CAF\u91D1\u3092\u3069\u3046\u6301\u3064\u304B",
    situation: () => "\u7269\u4FA1\u304C\u4E0A\u304C\u308A\u7D9A\u3051\u3066\u3044\u308B\u3002\u5468\u308A\u3067\u306F\u30C9\u30EB\u3084\u91D1\u3067\u8CAF\u3081\u308B\u4EBA\u304C\u5897\u3048\u3066\u304D\u305F\u3002",
    options: [
      { id: "a", label: "\u30C9\u30EB\u3084\u91D1\u306B\u66FF\u3048\u3066\u304A\u304F", desc: "\u901A\u8CA8\u304C\u4E0B\u304C\u3063\u3066\u3082\u5B88\u3089\u308C\u3084\u3059\u3044\u3002\u4E21\u66FF\u306E\u624B\u6570\u6599\u304C\u304B\u304B\u308A\u3001\u3059\u3050\u306B\u306F\u4F7F\u3044\u306B\u304F\u3044\u3002", apply: (l) => {
        const fee = l.cash * 0.04;
        l.spend("other", fee);
        l.protectCash = true;
        l.logPre("money", "\u8CAF\u91D1\u306E\u591A\u304F\u3092\u30C9\u30EB\u3068\u91D1\u306B\u66FF\u3048\u305F\u3002", -fee);
      } },
      { id: "b", label: "\u73FE\u5730\u306E\u304A\u91D1\u306E\u307E\u307E\u6301\u3064", desc: "\u624B\u6570\u6599\u304C\u304B\u304B\u3089\u305A\u3001\u3059\u3050\u4F7F\u3048\u308B\u3002\u7269\u4FA1\u304C\u4E0A\u304C\u308B\u3068\u76EE\u6E1B\u308A\u3059\u308B\u3002", apply: (l) => {
        l.logPre("money", "\u8CAF\u91D1\u306F\u305D\u306E\u307E\u307E\u9280\u884C\u306B\u7F6E\u3044\u3066\u304A\u3044\u305F\u3002");
      } }
    ]
  },
  {
    id: "friendWedding",
    repeat: true,
    min: 23,
    max: 35,
    title: "\u53CB\u4EBA\u306E\u7D50\u5A5A\u5F0F",
    situation: (l) => `\u53CB\u4EBA\u304B\u3089\u7D50\u5A5A\u5F0F\u306E\u62DB\u5F85\u72B6\u304C\u5C4A\u3044\u305F\u3002\u3054\u795D\u5100\u3068\u79FB\u52D5\u3067${l.D.fmt(l.y(5e4), false)}\u307B\u3069\u304B\u304B\u308B\u3002`,
    options: [
      { id: "a", label: "\u51FA\u5E2D\u3059\u308B", desc: "\u51FA\u8CBB\u306F\u75DB\u3044\u3002\u65B0\u3057\u3044\u51FA\u4F1A\u3044\u304C\u3042\u308B\u304B\u3082\u3002", apply: (l) => {
        l.spend("events", l.y(5e4));
        l.social += 0.1;
        l.logPre("life", "\u53CB\u4EBA\u306E\u7D50\u5A5A\u5F0F\u306B\u51FA\u5E2D\u3057\u305F\u3002\u4E45\u3057\u3076\u308A\u306E\u4EF2\u9593\u3068\u76DB\u308A\u4E0A\u304C\u3063\u305F\u3002", -l.y(5e4));
      } },
      { id: "b", label: "\u304A\u795D\u3044\u3060\u3051\u9001\u308B", desc: "\u5B89\u304F\u6E08\u3080\u3002\u5C11\u3057\u6C17\u307E\u305A\u3044\u3002", apply: (l) => {
        l.spend("events", l.y(1e4));
        l.logPre("life", "\u304A\u795D\u3044\u306E\u54C1\u3060\u3051\u9001\u3063\u305F\u3002", -l.y(1e4));
      } }
    ]
  },
  {
    id: "gym",
    repeat: true,
    min: 25,
    max: 55,
    when: working,
    title: "\u5065\u5EB7\u3065\u304F\u308A",
    situation: () => "\u5065\u5EB7\u8A3A\u65AD\u3067\u300C\u904B\u52D5\u4E0D\u8DB3\u300D\u3068\u66F8\u304B\u308C\u305F\u3002",
    options: [
      { id: "a", label: "\u30B8\u30E0\u306B\u901A\u3046", desc: "\u6BCE\u6708\u306E\u4F1A\u8CBB\u304C\u304B\u304B\u308B\u3002\u75C5\u6C17\u306B\u306A\u308A\u306B\u304F\u304F\u306A\u308B\u3002", apply: (l, r) => {
        l.gymUntil = l.age + 10;
        if (r.chance(0.35)) {
          l.logPre("health", "\u30B8\u30E0\u306B\u5165\u4F1A\u3057\u305F\u304C\u30013\u304B\u6708\u3067\u884C\u304B\u306A\u304F\u306A\u3063\u305F\u3002");
          l.gymUntil = l.age + 1;
        } else {
          l.illMult *= 0.9;
          l.logPre("health", "\u30B8\u30E0\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002\u4F53\u304C\u8EFD\u304F\u306A\u3063\u305F\u3002");
        }
      } },
      { id: "b", label: "\u4ECA\u306E\u307E\u307E\u3067\u3044\u3044", desc: "\u304A\u91D1\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u4F53\u306F\u5C11\u3057\u305A\u3064\u8870\u3048\u308B\u3002", apply: (l) => {
        l.illMult *= 1.03;
        l.logPre("health", "\u5FD9\u3057\u3055\u3092\u7406\u7531\u306B\u3001\u904B\u52D5\u306F\u5148\u9001\u308A\u306B\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "insurance",
    min: 25,
    max: 50,
    when: working,
    title: "\u533B\u7642\u4FDD\u967A\u306E\u52E7\u8A98",
    situation: (l) => `\u4FDD\u967A\u306E\u55B6\u696D\u304C\u6765\u305F\u3002\u6708${l.D.fmt(l.y(5e3), false)}\u3067\u5165\u9662\u3084\u624B\u8853\u306B\u5099\u3048\u3089\u308C\u308B\u3068\u3044\u3046\u3002`,
    options: [
      { id: "a", label: "\u52A0\u5165\u3059\u308B", desc: "\u5927\u304D\u306A\u75C5\u6C17\u306E\u3068\u304D\u306B\u52A9\u304B\u308B\u3002\u4F55\u3082\u306A\u3051\u308C\u3070\u6255\u3044\u640D\u3002", apply: (l) => {
        l.insured = true;
        l.logPre("money", "\u533B\u7642\u4FDD\u967A\u306B\u5165\u3063\u305F\u3002");
      } },
      { id: "b", label: "\u8CAF\u91D1\u3067\u5099\u3048\u308B", desc: "\u6BCE\u6708\u306E\u51FA\u8CBB\u306F\u306A\u3044\u3002\u5927\u75C5\u306E\u3068\u304D\u306F\u91CD\u3044\u3002", apply: (l) => {
        l.logPre("money", "\u4FDD\u967A\u306B\u306F\u5165\u3089\u305A\u3001\u8CAF\u91D1\u3067\u5099\u3048\u308B\u3053\u3068\u306B\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "bonus",
    repeat: true,
    min: 24,
    max: 58,
    when: company,
    title: "\u30DC\u30FC\u30CA\u30B9\u306E\u4F7F\u3044\u9053",
    situation: (l) => `\u30DC\u30FC\u30CA\u30B9\u304C${l.D.fmt(l.salaryOf(l.age) * 0.12, false)}\u51FA\u305F\u3002`,
    options: [
      { id: "a", label: "\u65C5\u884C\u306B\u884C\u304F", desc: "\u4E00\u751F\u306E\u601D\u3044\u51FA\u3002\u8CAF\u91D1\u306F\u5897\u3048\u306A\u3044\u3002", apply: (l) => {
        const c = l.salaryOf(l.age) * 0.1;
        l.spend("fun", c);
        l.logPre("life", "\u601D\u3044\u5207\u3063\u3066\u65C5\u884C\u306B\u51FA\u305F\u3002\u5FD8\u308C\u3089\u308C\u306A\u3044\u666F\u8272\u3092\u898B\u305F\u3002", -c);
      } },
      { id: "b", label: "\u5168\u90E8\u8CAF\u91D1\u3059\u308B", desc: "\u3044\u3056\u3068\u3044\u3046\u6642\u306B\u5F37\u3044\u3002\u5C11\u3057\u5473\u6C17\u306A\u3044\u3002", apply: (l) => {
        l.logPre("money", "\u30DC\u30FC\u30CA\u30B9\u306F\u5168\u90E8\u8CAF\u91D1\u306B\u56DE\u3057\u305F\u3002");
      } },
      { id: "c", label: "\u6295\u8CC7\u306B\u56DE\u3059", desc: "\u5897\u3048\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002\u6E1B\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002", apply: (l) => {
        const c = Math.max(0, Math.min(l.cash, l.salaryOf(l.age) * 0.1));
        l.cash -= c;
        l.invest += c;
        l.logPre("money", "\u30DC\u30FC\u30CA\u30B9\u3092\u6295\u8CC7\u306B\u56DE\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "side",
    repeat: true,
    min: 24,
    max: 50,
    when: working,
    title: "\u526F\u696D\u306E\u8A98\u3044",
    situation: () => "SNS\u3067\u300C\u30B9\u30AD\u30DE\u6642\u9593\u3067\u7A3C\u3052\u308B\u300D\u526F\u696D\u306E\u8A71\u304C\u56DE\u3063\u3066\u304D\u305F\u3002",
    options: [
      { id: "a", label: "\u3084\u3063\u3066\u307F\u308B", desc: "\u53CE\u5165\u304C\u5897\u3048\u308B\u304B\u3082\u3002\u602A\u3057\u3044\u8A71\u306E\u3053\u3068\u3082\u3042\u308B\u3002", apply: (l, r) => {
        const x = r.next();
        if (x < 0.25) {
          const c = l.y(2e5);
          l.spend("other", c);
          l.logPre("money", "\u300C\u521D\u671F\u8CBB\u7528\u300D\u3092\u6255\u3063\u305F\u304C\u3001\u9023\u7D61\u304C\u53D6\u308C\u306A\u304F\u306A\u3063\u305F\u3002", -c, true);
        } else if (x < 0.75) {
          l.sideIncome += l.y(25e4);
          l.logPre("work", "\u526F\u696D\u3092\u59CB\u3081\u305F\u3002\u4F11\u65E5\u304C\u6E1B\u3063\u305F\u304C\u3001\u5C11\u3057\u7A3C\u3052\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002");
        } else {
          l.logPre("work", "\u3084\u3063\u3066\u307F\u305F\u304C\u3001\u6642\u9593\u306E\u308F\u308A\u306B\u7A3C\u3052\u305A\u3084\u3081\u305F\u3002");
        }
      } },
      { id: "b", label: "\u65AD\u308B", desc: "\u6642\u9593\u3092\u5B88\u308C\u308B\u3002\u53CE\u5165\u306F\u4ECA\u306E\u307E\u307E\u3002", apply: (l) => {
        l.logPre("life", "\u526F\u696D\u306E\u8A71\u306F\u65AD\u3063\u305F\u3002");
      } }
    ]
  },
  {
    id: "overtime",
    repeat: true,
    min: 25,
    max: 55,
    when: company,
    title: "\u6B8B\u696D",
    situation: () => "\u5927\u304D\u306A\u6848\u4EF6\u3067\u4EBA\u624B\u304C\u8DB3\u308A\u306A\u3044\u3002\u6B8B\u696D\u3092\u983C\u307E\u308C\u305F\u3002",
    options: [
      { id: "a", label: "\u5F15\u304D\u53D7\u3051\u308B", desc: "\u6B8B\u696D\u4EE3\u3068\u8A55\u4FA1\u304C\u4E0A\u304C\u308B\u3002\u4F53\u3092\u58CA\u3059\u3053\u3068\u3082\u3002", apply: (l, r) => {
        l.careerMult *= 1.04;
        l.addIncome("salary", l.salaryOf(l.age) * 0.06);
        if (r.chance(0.2)) {
          l.illMult *= 1.12;
          l.logPre("health", "\u6B8B\u696D\u7D9A\u304D\u3067\u4F53\u8ABF\u3092\u5D29\u3057\u305F\u3002", void 0, true);
        } else l.logPre("work", "\u6B8B\u696D\u3092\u5F15\u304D\u53D7\u3051\u3001\u6848\u4EF6\u3092\u3084\u308A\u9042\u3052\u305F\u3002\u8A55\u4FA1\u304C\u4E0A\u304C\u3063\u305F\u3002");
      } },
      { id: "b", label: "\u5B9A\u6642\u3067\u5E30\u308B", desc: "\u5BB6\u65CF\u3084\u4F53\u3092\u5B88\u308C\u308B\u3002\u8A55\u4FA1\u306F\u4E0A\u304C\u308A\u306B\u304F\u3044\u3002", apply: (l) => {
        l.social += 0.03;
        l.logPre("life", "\u5B9A\u6642\u3067\u5E30\u3063\u305F\u3002\u5BB6\u65CF\u3068\u306E\u6642\u9593\u3092\u5927\u4E8B\u306B\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "transfer",
    min: 28,
    max: 52,
    when: (l) => l.job === "big" || l.job === "civil",
    title: "\u8EE2\u52E4\u306E\u8F9E\u4EE4",
    situation: () => "\u9060\u304F\u306E\u652F\u5E97\u3078\u306E\u8EE2\u52E4\u3092\u6253\u8A3A\u3055\u308C\u305F\u3002",
    options: [
      { id: "a", label: "\u53D7\u3051\u308B", desc: "\u51FA\u4E16\u306E\u9053\u304C\u958B\u3051\u308B\u3002\u5F15\u3063\u8D8A\u3057\u4EE3\u3068\u5BB6\u65CF\u306E\u8CA0\u62C5\u3002", apply: (l) => {
        l.careerMult *= 1.06;
        l.spend("other", l.y(3e5));
        l.logPre("work", "\u8EE2\u52E4\u3092\u53D7\u3051\u305F\u3002\u77E5\u3089\u306A\u3044\u753A\u3067\u306E\u66AE\u3089\u3057\u304C\u59CB\u307E\u3063\u305F\u3002", -l.y(3e5));
      } },
      { id: "b", label: "\u65AD\u308B", desc: "\u4ECA\u306E\u66AE\u3089\u3057\u3092\u5B88\u308C\u308B\u3002\u51FA\u4E16\u306F\u9060\u306E\u304F\u3002", apply: (l) => {
        l.careerMult *= 0.97;
        l.logPre("work", "\u8EE2\u52E4\u306F\u65AD\u3063\u305F\u3002\u4E0A\u53F8\u306E\u8996\u7DDA\u304C\u5C11\u3057\u51B7\u305F\u304F\u306A\u3063\u305F\u3002");
      } }
    ]
  },
  {
    id: "cram",
    min: 30,
    max: 60,
    when: hasKids,
    title: "\u5B50\u3069\u3082\u306E\u587E",
    situation: () => "\u5B50\u3069\u3082\u304C\u300C\u53CB\u3060\u3061\u3068\u540C\u3058\u587E\u306B\u884C\u304D\u305F\u3044\u300D\u3068\u8A00\u3063\u3066\u3044\u308B\u3002",
    options: [
      { id: "a", label: "\u901A\u308F\u305B\u308B", desc: "\u9032\u5B66\u306B\u6709\u5229\u3002\u6BCE\u5E74\u306E\u51FA\u8CBB\u304C\u5897\u3048\u308B\u3002", apply: (l) => {
        l.cramUntil = l.age + 4;
        const k = l.kids.find((x) => l.age - x.born < 18);
        if (k) k.univ = true;
        l.logPre("family", "\u5B50\u3069\u3082\u3092\u587E\u306B\u901A\u308F\u305B\u305F\u3002\u5BB6\u8A08\u306F\u5C11\u3057\u82E6\u3057\u304F\u306A\u3063\u305F\u3002");
      } },
      { id: "b", label: "\u5BB6\u3067\u6559\u3048\u308B", desc: "\u304A\u91D1\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u89AA\u306E\u6642\u9593\u304C\u3068\u3089\u308C\u308B\u3002", apply: (l) => {
        l.logPre("family", "\u591C\u306F\u5B50\u3069\u3082\u306E\u52C9\u5F37\u3092\u898B\u3066\u3084\u308B\u3053\u3068\u306B\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "crypto",
    repeat: true,
    min: 25,
    max: 60,
    when: (l) => l.cash > l.y(1e6),
    title: "\u8A71\u984C\u306E\u6697\u53F7\u8CC7\u7523",
    situation: () => "\u540C\u50DA\u304C\u6697\u53F7\u8CC7\u7523\u3067\u5927\u304D\u304F\u5132\u3051\u305F\u3089\u3057\u3044\u3002",
    options: [
      { id: "a", label: "\u5C11\u3057\u8CB7\u3063\u3066\u307F\u308B", desc: "\u4F55\u500D\u306B\u3082\u306A\u308B\u304B\u3082\u3002\u534A\u5206\u4EE5\u4E0B\u306B\u306A\u308B\u304B\u3082\u3002", apply: (l, r) => {
        const c = Math.min(l.cash * 0.2, l.y(1e6));
        const m = r.chance(0.08) ? r.range(4, 12) : r.chance(0.45) ? r.range(1, 2.2) : r.range(0.1, 0.8);
        const g = c * (m - 1);
        if (g >= 0) l.addIncome("invest", g);
        else l.spend("other", -g);
        l.logPre("money", m >= 1 ? `\u8CB7\u3063\u305F\u6697\u53F7\u8CC7\u7523\u304C\u5024\u4E0A\u304C\u308A\u3057\u305F\uFF08${m.toFixed(1)}\u500D\uFF09\u3002` : "\u8CB7\u3063\u305F\u6697\u53F7\u8CC7\u7523\u304C\u66B4\u843D\u3057\u305F\u3002", g, Math.abs(g) > l.y(1e6));
      } },
      { id: "b", label: "\u898B\u9001\u308B", desc: "\u640D\u306F\u3057\u306A\u3044\u3002\u5132\u3051\u3082\u306A\u3044\u3002", apply: (l) => {
        l.logPre("money", "\u6697\u53F7\u8CC7\u7523\u306B\u306F\u624B\u3092\u51FA\u3055\u306A\u304B\u3063\u305F\u3002");
      } }
    ]
  },
  {
    id: "lendParent",
    min: 30,
    max: 60,
    when: parentsAlive,
    title: "\u89AA\u304B\u3089\u306E\u76F8\u8AC7",
    situation: (l) => `\u89AA\u304B\u3089\u300C\u5BB6\u306E\u4FEE\u7406\u4EE3\u304C\u8DB3\u308A\u306A\u3044\u300D\u3068${l.D.fmt(l.y(8e5), false)}\u3092\u983C\u307E\u308C\u305F\u3002`,
    options: [
      { id: "a", label: "\u51FA\u3057\u3066\u3042\u3052\u308B", desc: "\u89AA\u306F\u52A9\u304B\u308B\u3002\u304A\u91D1\u306F\u623B\u3089\u306A\u3044\u304B\u3082\u3057\u308C\u306A\u3044\u3002", apply: (l, r) => {
        l.spend("events", l.y(8e5));
        l.parentDebt = r.chance(0.4);
        l.logPre("family", "\u89AA\u306B\u4FEE\u7406\u4EE3\u3092\u6E21\u3057\u305F\u3002\u3068\u3066\u3082\u559C\u3070\u308C\u305F\u3002", -l.y(8e5));
      } },
      { id: "c", label: "\u4ECA\u306F\u51FA\u305B\u306A\u3044\u3068\u65AD\u308B", desc: "\u81EA\u5206\u306E\u5BB6\u8A08\u3092\u5B88\u308C\u308B\u3002\u89AA\u306F\u56F0\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002", apply: (l) => {
        l.logPre("family", "\u4ECA\u306F\u4F59\u88D5\u304C\u306A\u3044\u3068\u4F1D\u3048\u305F\u3002\u89AA\u306F\u9ED9\u3063\u3066\u3046\u306A\u305A\u3044\u305F\u3002");
      } },
      { id: "b", label: "\u304D\u3087\u3046\u3060\u3044\u3068\u76F8\u8AC7\u3059\u308B", when: (l) => l.siblingsNow > 0, desc: "\u8CA0\u62C5\u3092\u5206\u3051\u3089\u308C\u308B\u3002\u8A71\u304C\u3053\u3058\u308C\u308B\u3053\u3068\u3082\u3002", apply: (l, r) => {
        l.spend("events", l.y(8e5) / (l.siblings + 1));
        l.logPre("family", r.chance(0.3) ? "\u304D\u3087\u3046\u3060\u3044\u3068\u63C9\u3081\u305F\u304C\u3001\u4F55\u3068\u304B\u5206\u62C5\u3057\u305F\u3002" : "\u304D\u3087\u3046\u3060\u3044\u3067\u5206\u62C5\u3057\u3066\u51FA\u3057\u305F\u3002", -l.y(8e5) / (l.siblings + 1));
      } }
    ]
  },
  {
    id: "renovate",
    min: 40,
    max: 70,
    when: (l) => l.home === "own",
    title: "\u5BB6\u306E\u4FEE\u7E55",
    situation: () => "\u5916\u58C1\u306B\u3072\u3073\u304C\u5165\u308A\u3001\u5C4B\u6839\u3082\u53E4\u304F\u306A\u3063\u3066\u304D\u305F\u3002",
    options: [
      { id: "a", label: "\u4ECA\u306E\u3046\u3061\u306B\u76F4\u3059", desc: "\u307E\u3068\u307E\u3063\u305F\u51FA\u8CBB\u3002\u5BB6\u304C\u9577\u6301\u3061\u3059\u308B\u3002", apply: (l) => {
        const c = l.y(15e5);
        l.spend("housing", c);
        l.boughtAge += 8;
        l.logPre("money", "\u5BB6\u3092\u4FEE\u7E55\u3057\u305F\u3002\u898B\u9055\u3048\u308B\u3088\u3046\u306B\u304D\u308C\u3044\u306B\u306A\u3063\u305F\u3002", -c);
      } },
      { id: "b", label: "\u307E\u3060\u69D8\u5B50\u3092\u898B\u308B", desc: "\u4ECA\u306F\u6255\u308F\u305A\u306B\u6E08\u3080\u3002\u3042\u3068\u3067\u9AD8\u304F\u3064\u304F\u3053\u3068\u3082\u3002", apply: (l) => {
        l.repairLater = true;
        l.logPre("money", "\u4FEE\u7E55\u306F\u5148\u9001\u308A\u306B\u3057\u305F\u3002");
      } }
    ]
  },
  {
    id: "carUpgrade",
    repeat: true,
    min: 30,
    max: 65,
    when: (l) => working(l) && (l.D.k > 0.25 || l.region.urban === true),
    // 車を持っていない人には「買うかどうか」、持っている人には「買い替えるかどうか」として出す
    title: "\u8ECA\u306E\u8CB7\u3044\u66FF\u3048",
    titleOf: (l) => l.carSince < 0 ? "\u8ECA\u3092\u8CB7\u3046\uFF1F" : "\u8ECA\u306E\u8CB7\u3044\u66FF\u3048",
    situation: (l) => l.carSince < 0 ? "\u901A\u52E4\u3084\u8CB7\u3044\u7269\u306B\u3001\u8ECA\u304C\u3042\u308C\u3070\u4FBF\u5229\u3060\u3068\u611F\u3058\u308B\u3002\u65B0\u8ECA\u306E\u30AB\u30BF\u30ED\u30B0\u3092\u898B\u3066\u3044\u308B\u3002" : "\u8ECA\u304C\u53E4\u304F\u306A\u3063\u3066\u304D\u305F\u3002\u65B0\u8ECA\u306E\u30AB\u30BF\u30ED\u30B0\u3092\u898B\u3066\u3044\u308B\u3002",
    options: [
      {
        id: "a",
        label: "\u65B0\u8ECA\u3092\u8CB7\u3046",
        desc: "\u5FEB\u9069\u3067\u5B89\u5168\u3002\u5927\u304D\u306A\u51FA\u8CBB\u3002",
        apply: (l) => {
          const c = l.y(28e5);
          l.spend("car", c);
          const first = l.carSince < 0;
          if (first) l.carSince = l.age;
          l.logPre("money", first ? "\u65B0\u8ECA\u3092\u8CB7\u3063\u305F\u3002" : "\u65B0\u8ECA\u306B\u8CB7\u3044\u66FF\u3048\u305F\u3002", -c);
        }
      },
      {
        id: "b",
        label: "\u4E57\u308A\u3064\u3076\u3059",
        labelOf: (l) => l.carSince < 0 ? "\u4ECA\u306F\u8CB7\u308F\u306A\u3044" : "\u4E57\u308A\u3064\u3076\u3059",
        desc: "\u304A\u91D1\u304C\u6D6E\u304F\u3002\u6545\u969C\u306E\u4FEE\u7406\u4EE3\u304C\u304B\u304B\u308B\u304B\u3082\u3002",
        descOf: (l) => l.carSince < 0 ? "\u304A\u91D1\u304C\u6D6E\u304F\u3002\u96FB\u8ECA\u3084\u30D0\u30B9\u3001\u81EA\u8EE2\u8ECA\u3067\u3084\u308A\u304F\u308A\u3059\u308B\u3002" : "\u304A\u91D1\u304C\u6D6E\u304F\u3002\u6545\u969C\u306E\u4FEE\u7406\u4EE3\u304C\u304B\u304B\u308B\u304B\u3082\u3002",
        apply: (l, r) => {
          const broke = r.chance(0.4);
          if (l.carSince < 0) l.logPre("money", "\u8ECA\u306F\u8CB7\u308F\u305A\u306B\u66AE\u3089\u3059\u3053\u3068\u306B\u3057\u305F\u3002");
          else if (broke) {
            l.spend("car", l.y(25e4));
            l.logPre("money", "\u53E4\u3044\u8ECA\u304C\u6545\u969C\u3057\u3001\u4FEE\u7406\u4EE3\u304C\u304B\u304B\u3063\u305F\u3002", -l.y(25e4));
          } else l.logPre("money", "\u53E4\u3044\u8ECA\u3092\u5927\u4E8B\u306B\u4E57\u308A\u7D9A\u3051\u305F\u3002");
        }
      }
    ]
  },
  {
    id: "dock",
    repeat: true,
    min: 40,
    max: 80,
    title: "\u7CBE\u5BC6\u691C\u67FB",
    situation: (l) => `\u7CBE\u5BC6\u691C\u67FB\uFF08${l.D.fmt(l.y(4e4), false)}\uFF09\u3092\u53D7\u3051\u308B\u304B\u8FF7\u3063\u3066\u3044\u308B\u3002`,
    options: [
      { id: "a", label: "\u53D7\u3051\u308B", desc: "\u75C5\u6C17\u3092\u65E9\u304F\u898B\u3064\u3051\u3089\u308C\u308B\u3002\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002", apply: (l, r) => {
        l.spend("medical", l.y(4e4));
        l.earlyCheckUntil = l.age + 5;
        if (r.chance(0.08)) {
          l.illMult *= 0.92;
          l.logPre("health", "\u691C\u67FB\u3067\u5C0F\u3055\u306A\u7570\u5E38\u304C\u898B\u3064\u304B\u308A\u3001\u65E9\u3081\u306B\u6CBB\u7642\u3067\u304D\u305F\u3002", -l.y(4e4), true);
        } else l.logPre("health", l.vary("dockOk", ["\u691C\u67FB\u3092\u53D7\u3051\u305F\u3002\u7570\u5E38\u306F\u306A\u304B\u3063\u305F\u3002", "\u7CBE\u5BC6\u691C\u67FB\u306E\u7D50\u679C\u306F\u3001\u7570\u5E38\u306A\u3057\u3060\u3063\u305F\u3002", "\u691C\u67FB\u3092\u53D7\u3051\u305F\u3002\u5C11\u3057\u6570\u5024\u304C\u6C17\u306B\u306A\u308B\u304C\u3001\u6CBB\u7642\u306F\u3044\u3089\u306A\u3044\u3068\u8A00\u308F\u308C\u305F\u3002"]), -l.y(4e4));
      } },
      { id: "b", label: "\u53D7\u3051\u306A\u3044", desc: "\u304A\u91D1\u3068\u6642\u9593\u304C\u6D6E\u304F\u3002\u898B\u9003\u3059\u304B\u3082\u3057\u308C\u306A\u3044\u3002", apply: (l) => {
        l.logPre("health", l.vary("dockNo", ["\u691C\u67FB\u306F\u53D7\u3051\u306A\u304B\u3063\u305F\u3002", "\u5FD9\u3057\u3055\u3092\u7406\u7531\u306B\u3001\u691C\u67FB\u306F\u898B\u9001\u3063\u305F\u3002", "\u4ECA\u5E74\u3082\u691C\u67FB\u306B\u306F\u884C\u304B\u306A\u304B\u3063\u305F\u3002"]));
      } }
    ]
  },
  {
    id: "scamCall",
    min: 60,
    max: 90,
    when: (l) => l.kids.length > 0,
    title: "\u77E5\u3089\u306A\u3044\u756A\u53F7\u304B\u3089\u306E\u96FB\u8A71",
    // 名乗る続柄は、実際にいる子どもに合わせる（本当に子どもからの電話のこともあるため）
    situation: (l) => [
      l.kids.some((_, i) => !kidFemale(l.seed, i)) ? "\u300C\u606F\u5B50\u3060\u3051\u3069\u3001\u4F1A\u793E\u306E\u304A\u91D1\u3092\u306A\u304F\u3057\u3066\u2026\u4ECA\u65E5\u4E2D\u306B\u5FC5\u8981\u306A\u3093\u3060\u300D\u3068\u3001\u77E5\u3089\u306A\u3044\u756A\u53F7\u304B\u3089\u96FB\u8A71\u304C\u304B\u304B\u3063\u3066\u304D\u305F\u3002" : "\u300C\u5A18\u3060\u3051\u3069\u3001\u4F1A\u793E\u306E\u304A\u91D1\u3092\u306A\u304F\u3057\u3066\u2026\u4ECA\u65E5\u4E2D\u306B\u5FC5\u8981\u306A\u306E\u300D\u3068\u3001\u77E5\u3089\u306A\u3044\u756A\u53F7\u304B\u3089\u96FB\u8A71\u304C\u304B\u304B\u3063\u3066\u304D\u305F\u3002",
      `\u300C${l.sex === "female" ? "\u304A\u6BCD\u3055\u3093" : "\u304A\u7236\u3055\u3093"}\uFF1F \u79C1\u3002\u30B9\u30DE\u30DB\u304C\u58CA\u308C\u3066\u53CB\u3060\u3061\u306E\u96FB\u8A71\u304B\u3089\u2026\u5BB6\u8CC3\u304C\u6255\u3048\u306A\u304F\u3066\u300D\u3068\u96FB\u8A71\u304C\u304B\u304B\u3063\u3066\u304D\u305F\u3002`,
      "\u300C\u4E8B\u6545\u3092\u8D77\u3053\u3057\u3066\u3057\u307E\u3063\u3066\u3001\u793A\u8AC7\u91D1\u304C\u3059\u3050\u8981\u308B\u3093\u3060\u300D\u3068\u3001\u6CE3\u304D\u305D\u3046\u306A\u58F0\u3067\u96FB\u8A71\u304C\u304B\u304B\u3063\u3066\u304D\u305F\u3002"
    ][hashPick(l.seed + "call" + l.age, 3)],
    // 詐欺がほとんどだが、本当に困った子どもからの電話のこともある
    options: [
      {
        id: "a",
        label: "\u5BB6\u65CF\u306B\u78BA\u8A8D\u3057\u3066\u304B\u3089",
        desc: "\u843D\u3061\u7740\u3044\u3066\u78BA\u304B\u3081\u308B\u3002\u672C\u5F53\u306B\u56F0\u3063\u3066\u3044\u305F\u3089\u3001\u9045\u308C\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002",
        apply: (l, r) => {
          if (r.chance(0.8)) l.logPre("life", "\u5BB6\u65CF\u306B\u78BA\u8A8D\u3059\u308B\u3068\u3001\u307E\u3063\u305F\u304F\u306E\u4F5C\u308A\u8A71\u3060\u3063\u305F\u3002\u8A50\u6B3A\u306E\u96FB\u8A71\u3060\u3063\u305F\u3002");
          else {
            const c = Math.min(Math.max(0, l.cash) * 0.3, l.y(3e5));
            if (c > 0) l.spend("kids", c);
            l.logPre("family", c > 0 ? "\u78BA\u304B\u3081\u308B\u3068\u3001\u672C\u5F53\u306B\u5B50\u3069\u3082\u304C\u56F0\u3063\u3066\u3044\u305F\u3002\u5FC5\u8981\u306A\u5206\u3060\u3051\u9001\u3063\u305F\u3002" : "\u78BA\u304B\u3081\u308B\u3068\u3001\u672C\u5F53\u306B\u5B50\u3069\u3082\u304C\u56F0\u3063\u3066\u3044\u305F\u3002\u9001\u308C\u308B\u304A\u91D1\u306F\u306A\u304F\u3001\u8A71\u3092\u805E\u304F\u3053\u3068\u3057\u304B\u3067\u304D\u306A\u304B\u3063\u305F\u3002", c > 0 ? -c : void 0, true);
          }
        }
      },
      {
        id: "b",
        label: "\u6025\u3044\u3067\u304A\u91D1\u3092\u7528\u610F\u3059\u308B",
        desc: "\u672C\u5F53\u306A\u3089\u52A9\u3051\u306B\u306A\u308B\u3002\u3060\u307E\u3055\u308C\u308B\u3053\u3068\u3082\u3002",
        apply: (l, r) => {
          if (r.chance(0.8)) {
            const c = Math.min(Math.max(0, l.cash), l.y(2e6));
            if (c > 0) {
              l.spend("other", c);
              l.logPre("money", "\u96FB\u8A71\u306F\u8A50\u6B3A\u3060\u3063\u305F\u3002\u6E21\u3057\u305F\u304A\u91D1\u306F\u623B\u3089\u306A\u304B\u3063\u305F\u3002", -c, true);
              l.mark("scam");
            } else l.logPre("money", "\u7528\u610F\u3067\u304D\u308B\u304A\u91D1\u304C\u306A\u304F\u3001\u6E21\u3055\u305A\u306B\u6E08\u3093\u3060\u3002\u3042\u3068\u3067\u8A50\u6B3A\u306E\u96FB\u8A71\u3060\u3063\u305F\u3068\u5206\u304B\u3063\u305F\u3002");
          } else {
            const c = Math.min(Math.max(0, l.cash) * 0.5, l.y(5e5));
            if (c > 0) l.spend("kids", c);
            l.logPre("family", c > 0 ? "\u672C\u5F53\u306B\u56F0\u3063\u3066\u3044\u305F\u5B50\u3069\u3082\u3092\u3001\u6025\u3044\u3067\u52A9\u3051\u308B\u3053\u3068\u304C\u3067\u304D\u305F\u3002" : "\u672C\u5F53\u306B\u56F0\u3063\u3066\u3044\u305F\u5B50\u3069\u3082\u3060\u3063\u305F\u304C\u3001\u7528\u610F\u3067\u304D\u308B\u304A\u91D1\u304C\u306A\u304B\u3063\u305F\u3002", c > 0 ? -c : void 0, true);
          }
        }
      }
    ]
  },
  {
    id: "kidLoan",
    min: 48,
    max: 85,
    repeat: true,
    when: (l) => l.kids.some((k) => l.age - k.born >= 22),
    title: "\u5B50\u3069\u3082\u304B\u3089\u306E\u96FB\u8A71",
    situation: (l) => {
      const grown = l.kids.map((k2, i) => ({ i, age: l.age - k2.born })).filter((k2) => k2.age >= 22);
      const k = grown[hashPick(l.seed + "loanKid" + l.age, grown.length)];
      const who = kidFemale(l.seed, k.i) ? "\u5A18" : "\u606F\u5B50";
      const why = ["\u4ED5\u4E8B\u3092\u5931\u3063\u3066\u3001\u5BB6\u8CC3\u304C\u6255\u3048\u306A\u3044", "\u5B50\u3069\u3082\u304C\u5165\u9662\u3057\u3066\u3001\u304A\u91D1\u304C\u8DB3\u308A\u306A\u3044", "\u59CB\u3081\u305F\u5E97\u306E\u8CC7\u91D1\u304C\u8DB3\u308A\u306A\u3044"][hashPick(l.seed + "loanWhy" + l.age, 3)];
      return `${who}\uFF08${k.age}\u6B73\uFF09\u304B\u3089\u96FB\u8A71\u304C\u3042\u3063\u305F\u3002\u300C${why}\u3002\u5C11\u3057\u3060\u3051\u304A\u91D1\u3092\u8CB8\u3057\u3066\u307B\u3057\u3044\u300D`;
    },
    options: [
      {
        id: "a",
        label: "\u304A\u91D1\u3092\u8CB8\u3059",
        desc: "\u5B50\u3069\u3082\u306F\u52A9\u304B\u308B\u3002\u8FD4\u3063\u3066\u304F\u308B\u304B\u306F\u5206\u304B\u3089\u306A\u3044\u3002",
        apply: (l, r) => {
          const c = Math.min(Math.max(0, l.cash) * 0.3, l.y(1e6));
          if (c <= 0) {
            l.logPre("family", "\u8CB8\u305B\u308B\u304A\u91D1\u304C\u306A\u304F\u3001\u6C17\u6301\u3061\u3060\u3051\u4F1D\u3048\u305F\u3002");
            return;
          }
          l.spend("kids", c);
          if (r.chance(0.45)) {
            l.addIncome("windfall", c * 0.7);
            l.logPre("family", "\u5B50\u3069\u3082\u306B\u304A\u91D1\u3092\u8CB8\u3057\u305F\u3002\u4F55\u5E74\u304B\u304B\u3051\u3066\u3001\u5C11\u3057\u305A\u3064\u8FD4\u3057\u3066\u304F\u308C\u305F\u3002", -c * 0.3, true);
          } else l.logPre("family", "\u5B50\u3069\u3082\u306B\u304A\u91D1\u3092\u8CB8\u3057\u305F\u3002\u8FD4\u3063\u3066\u306F\u3053\u306A\u304B\u3063\u305F\u304C\u3001\u5B50\u3069\u3082\u306F\u7ACB\u3061\u76F4\u3063\u305F\u3002", -c, true);
        }
      },
      {
        id: "b",
        label: "\u4E8B\u60C5\u3092\u8A71\u3057\u3066\u65AD\u308B",
        desc: "\u81EA\u5206\u306E\u8001\u5F8C\u306E\u304A\u91D1\u3092\u5B88\u308C\u308B\u3002\u5B50\u3069\u3082\u3068\u306E\u9593\u306B\u6C17\u307E\u305A\u3055\u304C\u6B8B\u308B\u304B\u3082\u3002",
        apply: (l, r) => {
          l.logPre("family", r.chance(0.5) ? "\u81EA\u5206\u305F\u3061\u306E\u8001\u5F8C\u3082\u3042\u308B\u3068\u8A71\u3057\u3066\u3001\u65AD\u3063\u305F\u3002\u5B50\u3069\u3082\u306F\u81EA\u5206\u3067\u306A\u3093\u3068\u304B\u3057\u305F\u3002" : "\u65AD\u3063\u305F\u3042\u3068\u3001\u3057\u3070\u3089\u304F\u5B50\u3069\u3082\u304B\u3089\u306E\u96FB\u8A71\u304C\u6E1B\u3063\u305F\u3002");
        }
      }
    ]
  },
  {
    id: "grandkids",
    min: 55,
    max: 85,
    when: (l) => l.kids.some((k) => l.age - k.born >= 25),
    title: "\u5B50\u3069\u3082\u592B\u5A66\u3078\u306E\u63F4\u52A9",
    situation: () => "\u5B50\u3069\u3082\u592B\u5A66\u304C\u5BB6\u3092\u8CB7\u3046\u3089\u3057\u3044\u3002\u63F4\u52A9\u3057\u3066\u307B\u3057\u305D\u3046\u3060\u3002",
    options: [
      { id: "a", label: "\u307E\u3068\u307E\u3063\u305F\u984D\u3092\u63F4\u52A9\u3059\u308B", desc: "\u5B50\u3069\u3082\u306F\u52A9\u304B\u308B\u3002\u81EA\u5206\u306E\u8001\u5F8C\u8CC7\u91D1\u304C\u6E1B\u308B\u3002", apply: (l) => {
        const c = Math.min(Math.max(0, l.cash) * 0.3, l.y(3e6));
        l.spend("kids", c);
        l.logPre("family", "\u5B50\u3069\u3082\u592B\u5A66\u306B\u4F4F\u5B85\u8CC7\u91D1\u3092\u63F4\u52A9\u3057\u305F\u3002", -c);
      } },
      { id: "b", label: "\u6C17\u6301\u3061\u3060\u3051\u6E21\u3059", desc: "\u8001\u5F8C\u8CC7\u91D1\u3092\u5B88\u308C\u308B\u3002\u5C11\u3057\u5BC2\u3057\u304C\u3089\u308C\u308B\u3002", apply: (l) => {
        l.spend("kids", l.y(1e5));
        l.logPre("family", "\u304A\u795D\u3044\u3092\u6E21\u3057\u305F\u3002", -l.y(1e5));
      } }
    ]
  },
  {
    id: "oldTravel",
    min: 62,
    max: 80,
    when: (l) => l.cash + l.invest > l.y(5e6),
    title: "\u8001\u5F8C\u306E\u65C5",
    situation: () => "\u305A\u3063\u3068\u884C\u304D\u305F\u304B\u3063\u305F\u9060\u304F\u306E\u56FD\u3078\u306E\u65C5\u884C\u3092\u8003\u3048\u3066\u3044\u308B\u3002",
    options: [
      { id: "a", label: "\u601D\u3044\u5207\u3063\u3066\u884C\u304F", desc: "\u4E00\u751F\u306B\u4E00\u5EA6\u306E\u65C5\u3002\u8001\u5F8C\u8CC7\u91D1\u304C\u6E1B\u308B\u3002", apply: (l) => {
        const c = l.y(12e5);
        l.spend("fun", c);
        l.logPre("life", "\u5FF5\u9858\u306E\u65C5\u306B\u51FA\u305F\u3002\u5199\u771F\u3092\u898B\u8FD4\u3059\u305F\u3073\u306B\u7B11\u9854\u306B\u306A\u308B\u3002", -c, true);
      } },
      { id: "b", label: "\u8FD1\u5834\u3067\u697D\u3057\u3080", desc: "\u304A\u91D1\u3092\u5B88\u308C\u308B\u3002\u5C11\u3057\u5FC3\u6B8B\u308A\u3002", apply: (l) => {
        l.spend("fun", l.y(1e5));
        l.logPre("life", "\u8FD1\u304F\u306E\u6E29\u6CC9\u3067\u306E\u3093\u3073\u308A\u3057\u305F\u3002", -l.y(1e5));
      } }
    ]
  },
  {
    id: "endPlan",
    min: 65,
    max: 90,
    when: (l) => !alone(l),
    title: "\u4EBA\u751F\u306E\u3057\u307E\u3044\u65B9",
    situation: () => "\u53CB\u4EBA\u306E\u846C\u5100\u306B\u51FA\u3066\u3001\u81EA\u5206\u306E\u6700\u671F\u306E\u3053\u3068\u3092\u8003\u3048\u305F\u3002",
    options: [
      { id: "a", label: "\u846C\u5100\u3084\u304A\u5893\u3092\u6E96\u5099\u3057\u3066\u304A\u304F", desc: "\u5BB6\u65CF\u306E\u8CA0\u62C5\u304C\u6E1B\u308B\u3002\u4ECA\u304A\u91D1\u304C\u304B\u304B\u308B\u3002", apply: (l) => {
        l.spend("events", l.y(5e5));
        l.prepaidFuneral = true;
        l.logPre("life", "\u846C\u5100\u306E\u6E96\u5099\u3068\u907A\u8A00\u3092\u6E08\u307E\u305B\u305F\u3002", -l.y(5e5));
      } },
      { id: "b", label: "\u307E\u3060\u8003\u3048\u306A\u3044", desc: "\u4ECA\u306F\u6255\u308F\u305A\u306B\u6E08\u3080\u3002\u5BB6\u65CF\u304C\u3042\u3068\u3067\u56F0\u308B\u304B\u3082\u3002", apply: (l) => {
        l.logPre("life", "\u307E\u3060\u5148\u306E\u3053\u3068\u3060\u3068\u3001\u8003\u3048\u308B\u306E\u3092\u3084\u3081\u305F\u3002");
      } }
    ]
  },
  {
    id: "scamCallSolo",
    min: 60,
    max: 90,
    when: (l) => l.kids.length === 0,
    title: "\u77E5\u3089\u306A\u3044\u756A\u53F7\u304B\u3089\u306E\u96FB\u8A71",
    situation: () => "\u300C\u5F79\u6240\u306E\u8005\u3067\u3059\u3002\u533B\u7642\u8CBB\u306E\u6255\u3044\u623B\u3057\u304C\u3042\u308B\u306E\u3067\u3001\u4ECA\u304B\u3089ATM\u3078\u884C\u3063\u3066\u304F\u3060\u3055\u3044\u300D\u3068\u96FB\u8A71\u304C\u304B\u304B\u3063\u3066\u304D\u305F\u3002",
    options: [
      { id: "a", label: "\u96FB\u8A71\u3092\u5207\u3063\u3066\u5F79\u6240\u306B\u78BA\u304B\u3081\u308B", desc: "\u843D\u3061\u7740\u3044\u3066\u78BA\u304B\u3081\u308B\u3002\u624B\u9593\u306F\u304B\u304B\u308B\u3002", apply: (l) => {
        l.logPre("life", "\u5F79\u6240\u306B\u78BA\u304B\u3081\u308B\u3068\u3001\u305D\u3093\u306A\u6255\u3044\u623B\u3057\u306F\u306A\u304B\u3063\u305F\u3002\u8A50\u6B3A\u306E\u96FB\u8A71\u3060\u3063\u305F\u3002");
      } },
      { id: "b", label: "\u8A00\u308F\u308C\u305F\u3068\u304A\u308AATM\u3078\u884C\u304F", desc: "\u672C\u5F53\u306A\u3089\u304A\u91D1\u304C\u623B\u308B\u3002\u3060\u307E\u3055\u308C\u308B\u3053\u3068\u3082\u3002", apply: (l, r) => {
        if (r.chance(0.9)) {
          const c = Math.min(Math.max(0, l.cash), l.y(1e6));
          if (c > 0) {
            l.spend("other", c);
            l.logPre("money", "\u96FB\u8A71\u306F\u8A50\u6B3A\u3060\u3063\u305F\u3002\u632F\u308A\u8FBC\u3093\u3060\u304A\u91D1\u306F\u623B\u3089\u306A\u304B\u3063\u305F\u3002", -c, true);
            l.mark("scam");
          } else l.logPre("money", "\u53E3\u5EA7\u306B\u304A\u91D1\u304C\u306A\u304F\u3001\u632F\u308A\u8FBC\u3081\u306A\u304B\u3063\u305F\u3002\u3042\u3068\u3067\u8A50\u6B3A\u306E\u96FB\u8A71\u3060\u3063\u305F\u3068\u5206\u304B\u3063\u305F\u3002");
        } else l.logPre("money", "\u672C\u5F53\u306B\u6255\u3044\u623B\u3057\u306E\u624B\u7D9A\u304D\u3060\u3063\u305F\u3002");
      } }
    ]
  },
  {
    id: "endPlanSolo",
    min: 65,
    max: 90,
    when: (l) => alone(l),
    title: "\u4EBA\u751F\u306E\u3057\u307E\u3044\u65B9",
    situation: () => "\u3072\u3068\u308A\u3067\u66AE\u3089\u3057\u3066\u3044\u308B\u3002\u3082\u3057\u3082\u306E\u3068\u304D\u3001\u8AB0\u304C\u5F8C\u306E\u3053\u3068\u3092\u3057\u3066\u304F\u308C\u308B\u306E\u304B\u8003\u3048\u305F\u3002",
    options: [
      { id: "a", label: "\u846C\u5100\u3084\u8EAB\u306E\u56DE\u308A\u306E\u6574\u7406\u3092\u5951\u7D04\u3057\u3066\u304A\u304F", desc: "\u4EA1\u304F\u306A\u3063\u305F\u3042\u3068\u306E\u624B\u7D9A\u304D\u3092\u4EFB\u305B\u3089\u308C\u308B\u3002\u4ECA\u304A\u91D1\u304C\u304B\u304B\u308B\u3002", apply: (l) => {
        l.spend("events", l.y(5e5));
        l.prepaidFuneral = true;
        l.logPre("life", "\u846C\u5100\u3068\u8EAB\u306E\u56DE\u308A\u306E\u6574\u7406\u3092\u3001\u524D\u3082\u3063\u3066\u5951\u7D04\u3057\u3066\u304A\u3044\u305F\u3002", -l.y(5e5));
      } },
      { id: "b", label: "\u307E\u3060\u8003\u3048\u306A\u3044", desc: "\u4ECA\u306F\u6255\u308F\u305A\u306B\u6E08\u3080\u3002\u3042\u3068\u306E\u624B\u7D9A\u304D\u306F\u5468\u308A\u306E\u4EBA\u304C\u56F0\u308B\u304B\u3082\u3002", apply: (l) => {
        l.logPre("life", "\u307E\u3060\u5148\u306E\u3053\u3068\u3060\u3068\u3001\u8003\u3048\u308B\u306E\u3092\u3084\u3081\u305F\u3002");
      } }
    ]
  },
  {
    id: "seniorWork",
    min: 66,
    max: 78,
    when: (l) => l.job === "retired" || l.job === "none",
    title: "\u8FD1\u6240\u306E\u4ED5\u4E8B",
    situation: () => "\u8FD1\u6240\u306E\u4EBA\u304B\u3089\u300C\u9031\u306B\u4F55\u65E5\u304B\u624B\u4F1D\u3063\u3066\u304F\u308C\u306A\u3044\u304B\u300D\u3068\u983C\u307E\u308C\u305F\u3002",
    options: [
      { id: "a", label: "\u5F15\u304D\u53D7\u3051\u308B", desc: "\u5C11\u3057\u7A3C\u3052\u3066\u3001\u4EBA\u3068\u306E\u3064\u306A\u304C\u308A\u3082\u3067\u304D\u308B\u3002\u4F53\u306F\u75B2\u308C\u308B\u3002", apply: (l) => {
        l.sideIncome += l.y(5e5);
        l.seniorWorkUntil = l.age + 5;
        l.logPre("work", "\u90313\u65E5\u3001\u8FD1\u6240\u3067\u50CD\u304F\u3053\u3068\u306B\u3057\u305F\u3002", void 0);
      } },
      { id: "b", label: "\u306E\u3093\u3073\u308A\u904E\u3054\u3059", desc: "\u6642\u9593\u306F\u81EA\u7531\u3002\u53CE\u5165\u306F\u5897\u3048\u306A\u3044\u3002", apply: (l) => {
        l.logPre("life", "\u306E\u3093\u3073\u308A\u904E\u3054\u3059\u3053\u3068\u306B\u3057\u305F\u3002");
      } }
    ]
  }
];

// src/engine/scenes.ts
function kidsScene(l) {
  return {
    id: "kids",
    title: "\u5B50\u3069\u3082\u306E\u3053\u3068",
    situation: "\u7D50\u5A5A\u3057\u3066\u3001\u3075\u305F\u308A\u3067\u5C06\u6765\u306E\u8A71\u3092\u3057\u305F\u3002\u5B50\u3069\u3082\u306F\u3069\u3046\u3059\u308B\uFF1F",
    options: [
      {
        id: "want",
        label: "\u5B50\u3069\u3082\u304C\u307B\u3057\u3044",
        desc: "\u5BB6\u65CF\u304C\u306B\u304E\u3084\u304B\u306B\u306A\u308B\u3002\u6559\u80B2\u8CBB\u3084\u50CD\u304D\u65B9\u306E\u8CA0\u62C5\u306F\u5927\u304D\u3044\u3002",
        apply: (l2, r) => {
          l2.kidsPlan = "want";
          l2.kidsFrom = l2.age;
          l2.infertile = r.chance(0.12);
          l2.logPre("family", "\u5B50\u3069\u3082\u304C\u307B\u3057\u3044\u3068\u3001\u3075\u305F\u308A\u3067\u6C7A\u3081\u305F\u3002");
        }
      },
      {
        id: "later",
        label: "\u3057\u3070\u3089\u304F\u306F\u3075\u305F\u308A\u3067",
        desc: "\u4ED5\u4E8B\u3084\u8CAF\u91D1\u306B\u96C6\u4E2D\u3067\u304D\u308B\u3002\u5148\u306B\u5EF6\u3070\u3059\u307B\u3069\u6388\u304B\u308A\u306B\u304F\u304F\u306A\u308B\u3002",
        apply: (l2, r) => {
          l2.kidsPlan = "later";
          l2.kidsFrom = l2.age + r.int(3, 5);
          l2.logPre("family", "\u5B50\u3069\u3082\u306F\u3082\u3046\u5C11\u3057\u5148\u306B\u3057\u3088\u3046\u3068\u6C7A\u3081\u305F\u3002");
        }
      },
      {
        id: "none",
        label: "\u5B50\u3069\u3082\u306F\u6301\u305F\u306A\u3044",
        desc: "\u6642\u9593\u3068\u304A\u91D1\u3092\u81EA\u5206\u305F\u3061\u306E\u305F\u3081\u306B\u4F7F\u3048\u308B\u3002\u8001\u5F8C\u306B\u983C\u308C\u308B\u5BB6\u65CF\u306F\u5C11\u306A\u304F\u306A\u308B\u3002",
        apply: (l2) => {
          l2.kidsPlan = "none";
          l2.logPre("family", "\u5B50\u3069\u3082\u306F\u6301\u305F\u305A\u3001\u3075\u305F\u308A\u3067\u751F\u304D\u3066\u3044\u304F\u3068\u6C7A\u3081\u305F\u3002");
        }
      }
    ]
  };
}
function kidsAgainScene() {
  return {
    id: "kidsAgain",
    title: "\u305D\u308D\u305D\u308D\u5B50\u3069\u3082\u306E\u3053\u3068",
    situation: "\u7D50\u5A5A\u3057\u3066\u6570\u5E74\u3002\u3075\u305F\u308A\u306E\u66AE\u3089\u3057\u3082\u843D\u3061\u7740\u3044\u3066\u304D\u305F\u3002",
    options: [
      {
        id: "now",
        label: "\u5B50\u3069\u3082\u3092\u8003\u3048\u306F\u3058\u3081\u308B",
        desc: "\u5BB6\u65CF\u304C\u5897\u3048\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002\u5E74\u9F62\u7684\u306B\u6388\u304B\u308A\u306B\u304F\u3044\u3053\u3068\u3082\u3042\u308B\u3002",
        apply: (l, r) => {
          l.kidsPlan = "want";
          l.kidsFrom = l.age;
          l.infertile = r.chance(0.18);
          l.logPre("family", "\u5B50\u3069\u3082\u3092\u8003\u3048\u306F\u3058\u3081\u305F\u3002");
        }
      },
      {
        id: "none",
        label: "\u3084\u3063\u3071\u308A\u3075\u305F\u308A\u3067\u751F\u304D\u308B",
        desc: "\u4ECA\u306E\u66AE\u3089\u3057\u3092\u7D9A\u3051\u3089\u308C\u308B\u3002\u3042\u3068\u3067\u6C17\u6301\u3061\u304C\u5909\u308F\u308B\u3053\u3068\u3082\u3042\u308B\u3002",
        apply: (l) => {
          l.kidsPlan = "none";
          l.logPre("family", "\u5B50\u3069\u3082\u306F\u6301\u305F\u306A\u3044\u3068\u6C7A\u3081\u305F\u3002");
        }
      }
    ]
  };
}
function fertilityScene(l) {
  return {
    id: "fertility",
    title: "\u306A\u304B\u306A\u304B\u6388\u304B\u3089\u306A\u3044",
    situation: `\u5B50\u3069\u3082\u3092\u671B\u3093\u30672\u5E74\u3002\u307E\u3060\u6388\u304B\u3063\u3066\u3044\u306A\u3044\u3002\u4E0D\u598A\u6CBB\u7642\u306B\u306F${l.D.fmt(l.y(1e6), false)}\u307B\u3069\u304B\u304B\u308B\u3068\u3044\u3046\u3002`,
    options: [
      {
        id: "treat",
        label: "\u4E0D\u598A\u6CBB\u7642\u3092\u53D7\u3051\u308B",
        desc: "\u6388\u304B\u308B\u53EF\u80FD\u6027\u304C\u4E0A\u304C\u308B\u3002\u8CBB\u7528\u3068\u5FC3\u8EAB\u306E\u8CA0\u62C5\u304C\u3042\u308B\u3002",
        apply: (l2, r) => {
          l2.spend("medical", l2.y(1e6));
          if (r.chance(0.5)) {
            l2.infertile = false;
            l2.logPre("family", "\u6CBB\u7642\u3092\u7D9A\u3051\u3001\u598A\u5A20\u304C\u308F\u304B\u3063\u305F\u3002", -l2.y(1e6), true);
          } else l2.logPre("family", "\u6CBB\u7642\u3092\u7D9A\u3051\u305F\u304C\u3001\u6388\u304B\u3089\u306A\u304B\u3063\u305F\u3002", -l2.y(1e6), true);
        }
      },
      {
        id: "wait",
        label: "\u81EA\u7136\u306B\u4EFB\u305B\u308B",
        desc: "\u304A\u91D1\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u6388\u304B\u3089\u306A\u3044\u307E\u307E\u6642\u9593\u304C\u904E\u304E\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002",
        apply: (l2) => {
          l2.naturalHope = true;
          l2.logPre("family", "\u7126\u3089\u305A\u3001\u81EA\u7136\u306B\u4EFB\u305B\u308B\u3053\u3068\u306B\u3057\u305F\u3002");
        }
      },
      {
        id: "stop",
        label: "\u3075\u305F\u308A\u3067\u751F\u304D\u308B\u3068\u6C7A\u3081\u308B",
        desc: "\u6C17\u6301\u3061\u304C\u697D\u306B\u306A\u308B\u3002\u5B50\u3069\u3082\u306E\u3044\u306A\u3044\u4EBA\u751F\u3092\u9078\u3076\u3053\u3068\u306B\u306A\u308B\u3002",
        apply: (l2) => {
          l2.kidsPlan = "none";
          l2.logPre("family", "\u5B50\u3069\u3082\u3092\u6301\u305F\u306A\u3044\u4EBA\u751F\u3092\u3001\u3075\u305F\u308A\u3067\u53D7\u3051\u5165\u308C\u305F\u3002");
        }
      }
    ]
  };
}
function strainScene(l) {
  const reasons = ["\u5BB6\u4E8B\u306E\u5206\u62C5", "\u304A\u91D1\u306E\u4F7F\u3044\u65B9", "\u4ED5\u4E8B\u306E\u5FD9\u3057\u3055", "\u89AA\u3068\u306E\u4ED8\u304D\u5408\u3044\u65B9", "\u5B50\u80B2\u3066\u306E\u65B9\u91DD"];
  const reason = l.kids.length ? reasons[(l.age + l.kids.length) % reasons.length] : reasons[l.age % 4];
  return {
    id: "strain",
    title: "\u592B\u5A66\u306E\u3059\u308C\u9055\u3044",
    situation: `${reason}\u3092\u3081\u3050\u3063\u3066\u3001\u30D1\u30FC\u30C8\u30CA\u30FC\u3068\u306E\u8A00\u3044\u4E89\u3044\u304C\u5897\u3048\u3066\u304D\u305F\u3002`,
    options: [
      {
        id: "talk",
        label: "\u3068\u3053\u3068\u3093\u8A71\u3057\u5408\u3046",
        desc: "\u304A\u91D1\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u3046\u307E\u304F\u3044\u304F\u304B\u306F\u4E8C\u4EBA\u3057\u3060\u3044\u3002",
        apply: (l2, r) => {
          if (r.chance(0.55)) {
            l2.strained = false;
            l2.logPre("family", "\u4F55\u5EA6\u3082\u8A71\u3057\u5408\u3044\u3001\u3082\u3046\u4E00\u5EA6\u3084\u308A\u76F4\u3059\u3053\u3068\u306B\u3057\u305F\u3002");
          } else {
            l2.strained = true;
            l2.logPre("family", "\u8A71\u3057\u5408\u3063\u305F\u304C\u3001\u308F\u3060\u304B\u307E\u308A\u306F\u6B8B\u3063\u305F\u3002");
          }
        }
      },
      {
        id: "counsel",
        label: "\u592B\u5A66\u30AB\u30A6\u30F3\u30BB\u30EA\u30F3\u30B0\u306B\u901A\u3046",
        desc: "\u5C02\u9580\u5BB6\u306E\u52A9\u3051\u3067\u95A2\u4FC2\u3092\u7ACB\u3066\u76F4\u3057\u3084\u3059\u3044\u3002\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        apply: (l2, r) => {
          l2.spend("other", l2.y(15e4));
          if (r.chance(0.7)) {
            l2.strained = false;
            l2.logPre("family", "\u30AB\u30A6\u30F3\u30BB\u30EA\u30F3\u30B0\u306B\u901A\u3044\u3001\u304A\u4E92\u3044\u306E\u6C17\u6301\u3061\u304C\u308F\u304B\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", -l2.y(15e4));
          } else {
            l2.strained = true;
            l2.logPre("family", "\u30AB\u30A6\u30F3\u30BB\u30EA\u30F3\u30B0\u306B\u901A\u3063\u305F\u304C\u3001\u6E9D\u306F\u57CB\u307E\u3089\u306A\u304B\u3063\u305F\u3002", -l2.y(15e4));
          }
        }
      },
      {
        id: "separate",
        label: "\u5225\u308C\u308B",
        desc: "\u6C17\u6301\u3061\u306E\u533A\u5207\u308A\u304C\u3064\u304F\u3002\u8CA1\u7523\u3092\u5206\u3051\u3001\u66AE\u3089\u3057\u3092\u7ACB\u3066\u76F4\u3059\u3053\u3068\u306B\u306A\u308B\u3002",
        apply: (l2, r) => {
          l2.divorce(r, "\u8A71\u3057\u5408\u3044\u306E\u672B\u3001\u96E2\u5A5A\u3057\u305F\u3002\u8CA1\u7523\u306F\u5206\u3051\u5408\u3063\u305F\u3002");
        }
      }
    ]
  };
}
function dvScene(l) {
  const jp2 = l.D.isJapan;
  return {
    id: "dv",
    title: "\u30D1\u30FC\u30C8\u30CA\u30FC\u306E\u66B4\u529B",
    situation: `\u30D1\u30FC\u30C8\u30CA\u30FC\u304B\u3089\u66B4\u529B\u3092\u53D7\u3051\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002${jp2 ? "\uFF08\u76F8\u8AC7\u5148\uFF1ADV\u76F8\u8AC7\u30CA\u30D3 #8008\u3001DV\u76F8\u8AC7\uFF0B 0120-279-889\uFF09" : "\u5730\u57DF\u306B\u306F\u76F8\u8AC7\u3067\u304D\u308B\u7A93\u53E3\u3084\u652F\u63F4\u56E3\u4F53\u304C\u3042\u308B\u3002"}`,
    options: [
      {
        id: "leave",
        label: "\u76F8\u8AC7\u7A93\u53E3\u306E\u652F\u63F4\u3092\u53D7\u3051\u3066\u5BB6\u3092\u51FA\u308B",
        desc: "\u5B89\u5168\u3092\u53D6\u308A\u623B\u305B\u308B\u3002\u5F15\u3063\u8D8A\u3057\u3084\u751F\u6D3B\u306E\u7ACB\u3066\u76F4\u3057\u306B\u304A\u91D1\u304C\u304B\u304B\u308B\u3002",
        apply: (l2, r) => {
          l2.spend("housing", l2.y(5e5));
          l2.divorce(r, "\u76F8\u8AC7\u7A93\u53E3\u306E\u652F\u63F4\u3092\u53D7\u3051\u3066\u5BB6\u3092\u51FA\u305F\u3002\u305D\u306E\u5F8C\u3001\u96E2\u5A5A\u3057\u305F\u3002", true);
          if (l2.home === "own" || l2.home === "parents") l2.home = "rent";
        }
      },
      {
        id: "family",
        label: "\u5BB6\u65CF\u3084\u53CB\u4EBA\u306B\u76F8\u8AC7\u3059\u308B",
        desc: "\u8EAB\u8FD1\u306A\u4EBA\u306E\u652F\u3048\u304C\u5F97\u3089\u308C\u308B\u3002\u72B6\u6CC1\u304C\u5909\u308F\u308B\u3068\u306F\u9650\u3089\u306A\u3044\u3002",
        apply: (l2, r) => {
          if (r.chance(0.45)) l2.logPre("family", "\u5BB6\u65CF\u304C\u9593\u306B\u5165\u308A\u3001\u66B4\u529B\u306F\u304A\u3055\u307E\u3063\u305F\u3002");
          else {
            l2.dvOngoing = true;
            l2.logPre("family", "\u5BB6\u65CF\u306B\u76F8\u8AC7\u3057\u305F\u304C\u3001\u72B6\u6CC1\u306F\u3042\u307E\u308A\u5909\u308F\u3089\u306A\u304B\u3063\u305F\u3002");
          }
        }
      },
      {
        id: "wait",
        label: "\u3057\u3070\u3089\u304F\u69D8\u5B50\u3092\u898B\u308B",
        desc: "\u4ECA\u306E\u66AE\u3089\u3057\u306F\u5909\u3048\u305A\u306B\u6E08\u3080\u3002\u5FC3\u3068\u4F53\u3078\u306E\u8CA0\u62C5\u304C\u7D9A\u304F\u304B\u3082\u3057\u308C\u306A\u3044\u3002",
        apply: (l2) => {
          l2.dvOngoing = true;
          l2.logPre("health", "\u3057\u3070\u3089\u304F\u69D8\u5B50\u3092\u898B\u308B\u3053\u3068\u306B\u3057\u305F\u3002\u7720\u308C\u306A\u3044\u591C\u304C\u5897\u3048\u305F\u3002");
        }
      }
    ]
  };
}
function heldHouseScene(l) {
  const atHome = l.home === "parents";
  const owns = l.home === "own";
  return {
    id: "heldHouse",
    title: "\u89AA\u304C\u6B8B\u3057\u305F\u5BB6",
    situation: `\u89AA\u304C\u6B8B\u3057\u305F\u5BB6\uFF08\u81EA\u5206\u306E\u5206\u306F${l.D.fmt(l.heldHouse)}\uFF09\u3092\u3069\u3046\u3059\u308B\uFF1F`,
    options: [
      ...owns ? [] : [
        {
          id: "live",
          label: atHome ? "\u3053\u306E\u307E\u307E\u4F4F\u307F\u7D9A\u3051\u308B" : "\u5B9F\u5BB6\u306B\u79FB\u3063\u3066\u4F4F\u3080",
          desc: "\u5BB6\u8CC3\u304C\u304B\u304B\u3089\u306A\u3044\u3002\u53E4\u3044\u5BB6\u306A\u306E\u3067\u3001\u4FEE\u7E55\u3084\u7A0E\u91D1\u306E\u304A\u91D1\u306F\u304B\u304B\u308B\u3002",
          apply: (l2) => {
            l2.moveIntoHeldHouse();
            l2.logPre("life", atHome ? "\u89AA\u304C\u6B8B\u3057\u305F\u5BB6\u306B\u3001\u305D\u306E\u307E\u307E\u4F4F\u307F\u7D9A\u3051\u308B\u3053\u3068\u306B\u3057\u305F\u3002" : "\u89AA\u304C\u6B8B\u3057\u305F\u5BB6\u306B\u79FB\u308A\u4F4F\u3093\u3060\u3002\u5BB6\u8CC3\u304C\u304B\u304B\u3089\u306A\u304F\u306A\u3063\u305F\u3002", void 0, true);
          }
        }
      ],
      {
        id: "sell",
        label: "\u58F2\u3063\u3066\u304A\u91D1\u306B\u3059\u308B",
        desc: "\u307E\u3068\u307E\u3063\u305F\u304A\u91D1\u304C\u624B\u306B\u5165\u308B\u3002\u4F4F\u3080\u5834\u6240\u306F\u81EA\u5206\u3067\u7528\u610F\u3059\u308B\u3002",
        apply: (l2) => {
          const v = l2.sellHeldHouse();
          if (l2.home === "parents") l2.home = "rent";
          l2.logPre("money", l2.siblings ? "\u89AA\u304C\u6B8B\u3057\u305F\u5BB6\u3092\u58F2\u3063\u3066\u3001\u304D\u3087\u3046\u3060\u3044\u3067\u5206\u3051\u305F\u3002" : "\u89AA\u304C\u6B8B\u3057\u305F\u5BB6\u3092\u58F2\u3063\u3066\u3001\u304A\u91D1\u306B\u63DB\u3048\u305F\u3002", v, true);
        }
      }
    ]
  };
}

// data/world/marriage.json
var marriage_default = {
  IND: {
    arranged: 0.58,
    betrothal: 0.08,
    payment: "dowry",
    paymentYears: 0.67,
    estimated: [
      "betrothal"
    ],
    region: "south_asia_dowry",
    sources: {
      arranged_marriage_share: {
        source: "India Human Development Survey (IHDS), Partner Choice Map\uFF08\u7B2C7\u90E8\u306E\u884C\u304B\u3089\u7D44\u307F\u76F4\u3057\uFF09",
        url: "https://ihds.umd.edu/partner-choice-map",
        year: "2005"
      },
      marriage_payment_years: {
        source: "Household Responses to Expected Marriage Payments",
        url: "https://www.dartmouth.edu/neudc2012/docs/paper_50.pdf",
        year: "2008"
      }
    }
  },
  CHN: {
    arranged: 0.1,
    betrothal: 0,
    payment: "brideprice",
    paymentYears: 1.25,
    estimated: [
      "arranged",
      "betrothal"
    ],
    region: "china",
    sources: {
      marriage_payment_years: {
        source: "Between money and intimacy: Brideprice, marriage, and women\u2019s position in contemporary China",
        url: "https://www.demographic-research.org/volumes/vol50/46/50-46.pdf",
        year: "2020"
      }
    }
  },
  NGA: {
    arranged: 0.216,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa",
    sources: {
      arranged_marriage_share: {
        source: "Form of Marriage as a Predictor of Intimate Partner Violence among Married Women in North-Central Nigeria",
        url: "https://journals.sagepub.com/doi/10.1177/21582440241305648",
        year: "2024"
      }
    }
  },
  PAK: {
    arranged: 0.81,
    betrothal: 0.08,
    payment: "dowry",
    paymentYears: 0.94,
    estimated: [
      "betrothal"
    ],
    region: "south_asia_dowry",
    sources: {
      arranged_marriage_share: {
        source: "Gallup & Gilani Pakistan, Press release 2 on Marriage and Social Behavior",
        url: "https://gallup.com.pk/wp/wp-content/uploads/2024/08/23.08.2024.Daily-poll-English.pdf",
        year: "2024"
      },
      marriage_payment_years: {
        source: "Makino, Marriage, dowry, and women's status in rural Punjab, Pakistan",
        url: "https://www.ide.go.jp/library/Japanese/Publish/Reports/InterimReport/2013/pdf/C23_ch2.pdf",
        year: "2004"
      }
    }
  },
  IDN: {
    arranged: 0.15,
    betrothal: 0.02,
    payment: "mahr",
    paymentYears: 0.2,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "se_asia_mahr"
  },
  COD: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  ETH: {
    arranged: 0.702,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa",
    sources: {
      arranged_marriage_share: {
        source: "Ethiopia gender survey: A study in seven regions",
        url: "https://knowledgecommons.popcouncil.org/cgi/viewcontent.cgi?article=1025&context=departments_sbsr-pgy",
        year: "2010"
      }
    }
  },
  USA: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  BGD: {
    arranged: 0.942,
    betrothal: 0.08,
    payment: "dowry",
    paymentYears: 1.5,
    estimated: [
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "south_asia_dowry",
    sources: {
      arranged_marriage_share: {
        source: "The impact of market integration on arranged marriages in Matlab, Bangladesh\uFF08\u7B2C7\u90E8\u306E\u8981\u7D04\u304B\u3089\u8EE2\u8A18\uFF09",
        url: "https://www.cambridge.org/core/journals/evolutionary-human-sciences/article/impact-of-market-integration-on-arranged-marriages-in-matlab-bangladesh/A3AE66C81512788833528FFB5A8C468A",
        year: "2010"
      }
    }
  },
  BRA: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  EGY: {
    arranged: 0.5,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 2.45,
    estimated: [
      "arranged",
      "betrothal"
    ],
    region: "mena",
    sources: {
      marriage_payment_years: {
        source: "Returns to Education in the Marriage Market: Bride Price and School Reform in Egypt",
        url: "https://openknowledge.worldbank.org/bitstreams/bb9cd83f-2acf-416f-b77e-9eaae412b9e1/download",
        year: "2000-2018 (constant 2018 EGP)"
      }
    }
  },
  TZA: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  MEX: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  PHL: {
    arranged: 0.05,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "se_asia"
  },
  UGA: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  SDN: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  KEN: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  AFG: {
    arranged: 0.9,
    betrothal: 0.3,
    payment: "brideprice",
    paymentYears: 2,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "afg"
  },
  VNM: {
    arranged: 0.05,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "se_asia"
  },
  YEM: {
    arranged: 0.75,
    betrothal: 0.15,
    payment: "mahr",
    paymentYears: 1.5,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "gulf_yemen"
  },
  AGO: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  MOZ: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  RUS: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  ZAF: {
    arranged: 0.05,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  IRN: {
    arranged: 0.5,
    betrothal: 0.05,
    payment: "mahr",
    paymentYears: 1,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "mena"
  },
  IRQ: {
    arranged: 0.5,
    betrothal: 0.05,
    payment: "mahr",
    paymentYears: 1,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "mena"
  },
  NER: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  MDG: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  CIV: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  CMR: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  TUR: {
    arranged: 0.45,
    betrothal: 0.05,
    payment: "mahr",
    paymentYears: 1,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "mena"
  },
  MLI: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  UZB: {
    arranged: 0.45,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "central_asia"
  },
  DZA: {
    arranged: 0.5,
    betrothal: 0.05,
    payment: "mahr",
    paymentYears: 1,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "mena"
  },
  MMR: {
    arranged: 0.15,
    betrothal: 0.02,
    payment: "brideprice",
    paymentYears: 0.4,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "se_asia_brideprice"
  },
  GHA: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  TCD: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  SOM: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  JPN: {
    arranged: 0.098,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "east_asia",
    sources: {
      arranged_marriage_share: {
        source: "National Institute of Population and Social Security Research (IPSS), 16th Japanese National Fertility Survey, Figure 5-2",
        url: "https://www.ipss.go.jp/ps-doukou/e/doukou16/Nfs16R_summary_eng.pdf",
        year: "2021"
      }
    }
  },
  BFA: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  COL: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  DEU: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  GBR: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  ZMB: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  FRA: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  MWI: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  MAR: {
    arranged: 0.5,
    betrothal: 0.05,
    payment: "mahr",
    paymentYears: 1,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "mena"
  },
  THA: {
    arranged: 0.15,
    betrothal: 0.02,
    payment: "brideprice",
    paymentYears: 0.4,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "se_asia_brideprice"
  },
  NPL: {
    arranged: 0.8,
    betrothal: 0.08,
    payment: "dowry",
    paymentYears: 1.5,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "south_asia_dowry"
  },
  SAU: {
    arranged: 0.75,
    betrothal: 0.15,
    payment: "mahr",
    paymentYears: 1.5,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "gulf_yemen"
  },
  PER: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  SEN: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  SYR: {
    arranged: 0.5,
    betrothal: 0.05,
    payment: "mahr",
    paymentYears: 1,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "mena"
  },
  ARG: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  ZWE: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  GIN: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  BEN: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  BDI: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  MYS: {
    arranged: 0.15,
    betrothal: 0.02,
    payment: "mahr",
    paymentYears: 0.2,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "se_asia_mahr"
  },
  VEN: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  KAZ: {
    arranged: 0.15,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "central_asia"
  },
  RWA: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  ITA: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  GTM: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  KHM: {
    arranged: 0.15,
    betrothal: 0.02,
    payment: "brideprice",
    paymentYears: 0.4,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "se_asia_brideprice"
  },
  CAN: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  PRK: {
    arranged: 0.3,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "east_asia"
  },
  SSD: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  ESP: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  AUS: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  POL: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  TJK: {
    arranged: 0.45,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "central_asia"
  },
  ECU: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  TGO: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  BOL: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  SLE: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  HTI: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  PNG: {
    arranged: 0.3,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 1,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "png"
  },
  LKA: {
    arranged: 0.3,
    betrothal: 0.08,
    payment: "dowry",
    paymentYears: 1.5,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "south_asia_dowry"
  },
  CAF: {
    arranged: 0.7,
    betrothal: 0.25,
    payment: "brideprice",
    paymentYears: 0.8,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "sahel"
  },
  JOR: {
    arranged: 0.5,
    betrothal: 0.05,
    payment: "mahr",
    paymentYears: 1,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "mena"
  },
  HND: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  KOR: {
    arranged: 0.05,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "east_asia"
  },
  UKR: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  DOM: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  },
  COG: {
    arranged: 0.35,
    betrothal: 0.05,
    payment: "brideprice",
    paymentYears: 0.6,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "ssa"
  },
  ISR: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "west"
  },
  CHL: {
    arranged: 0.02,
    betrothal: 0,
    payment: "none",
    paymentYears: 0,
    estimated: [
      "arranged",
      "betrothal",
      "payment",
      "paymentYears"
    ],
    region: "latam"
  }
};

// src/engine/marriage.ts
var NORMS = marriage_default;
function marriageNorm(iso3) {
  const n = NORMS[iso3] ?? {};
  return {
    arranged: n.arranged ?? 0.02,
    betrothal: n.betrothal ?? 0,
    payment: n.payment ?? "none",
    paymentYears: n.paymentYears ?? 0
  };
}
function drawMarriageMode(iso3, r) {
  const n = marriageNorm(iso3);
  if (!r.chance(n.arranged)) return "love";
  return r.chance(n.betrothal) ? "betrothed" : "arranged";
}
var PAY_WORD = {
  dowry: "\u59BB\u306E\u5BB6\u304B\u3089\u592B\u306E\u5BB6\u3078\u6301\u53C2\u91D1\uFF08\u30C0\u30A6\u30EA\u30FC\uFF09\u3092\u6E21\u3059\u306E\u304C\u7FD2\u308F\u3057",
  brideprice: "\u592B\u306E\u5074\u304B\u3089\u59BB\u306E\u5BB6\u3078\u5A5A\u8CC7\uFF08\u30D6\u30E9\u30A4\u30C9\u30D7\u30E9\u30A4\u30B9\uFF09\u3092\u6255\u3046\u306E\u304C\u7FD2\u308F\u3057",
  mahr: "\u592B\u304B\u3089\u59BB\u3078\u5A5A\u8CC7\uFF08\u30DE\u30D5\u30EB\uFF09\u3092\u8D08\u308B\u306E\u304C\u7FD2\u308F\u3057"
};
function payForMarriage(l, r) {
  const n = marriageNorm(l.D.iso3);
  if (n.payment === "none" || n.paymentYears <= 0) return;
  const amount = n.paymentYears * l.D.regularWage("male", "high_school", 35) * r.range(0.6, 1.4);
  const male = l.sex === "male";
  if (n.payment === "dowry") {
    if (male) {
      l.addIncome("windfall", amount * 0.5);
      l.log("money", "\u59BB\u306E\u5BB6\u304B\u3089\u6301\u53C2\u91D1\uFF08\u30C0\u30A6\u30EA\u30FC\uFF09\u304C\u5C4A\u3044\u305F\u3002\u65B0\u3057\u3044\u66AE\u3089\u3057\u306E\u5BB6\u8CA1\u306B\u306A\u3063\u305F\u3002", amount * 0.5);
    } else {
      l.spend("love", amount * 0.35);
      l.log("money", "\u7D50\u5A5A\u306B\u3042\u305F\u308A\u3001\u5BB6\u65CF\u3068\u51FA\u3057\u5408\u3063\u3066\u6301\u53C2\u91D1\uFF08\u30C0\u30A6\u30EA\u30FC\uFF09\u3092\u7528\u610F\u3057\u305F\u3002", -amount * 0.35, true);
    }
  } else if (n.payment === "brideprice") {
    if (male) {
      l.spend("love", amount);
      l.log("money", "\u59BB\u306E\u5BB6\u3078\u5A5A\u8CC7\uFF08\u30D6\u30E9\u30A4\u30C9\u30D7\u30E9\u30A4\u30B9\uFF09\u3092\u6255\u3063\u305F\u3002\u4F55\u5E74\u5206\u3082\u306E\u7A3C\u304E\u304C\u4E00\u5EA6\u306B\u51FA\u3066\u3044\u3063\u305F\u3002", -amount, true);
    } else {
      l.addIncome("windfall", amount * 0.2);
      l.log("money", "\u592B\u306E\u5074\u304B\u3089\u5A5A\u8CC7\uFF08\u30D6\u30E9\u30A4\u30C9\u30D7\u30E9\u30A4\u30B9\uFF09\u304C\u5B9F\u5BB6\u306B\u5C4A\u3044\u305F\u3002\u4E00\u90E8\u306F\u65B0\u3057\u3044\u66AE\u3089\u3057\u306E\u652F\u5EA6\u306B\u56DE\u3063\u305F\u3002", amount * 0.2);
    }
  } else if (n.payment === "mahr") {
    if (male) {
      l.spend("love", amount);
      l.log("money", "\u59BB\u3078\u5A5A\u8CC7\uFF08\u30DE\u30D5\u30EB\uFF09\u3092\u8D08\u3063\u305F\u3002", -amount, true);
    } else {
      l.addIncome("windfall", amount * 0.8);
      l.log("money", "\u592B\u304B\u3089\u5A5A\u8CC7\uFF08\u30DE\u30D5\u30EB\uFF09\u3092\u53D7\u3051\u53D6\u3063\u305F\u3002\u81EA\u5206\u306E\u8CA1\u7523\u3068\u3057\u3066\u6301\u3063\u3066\u304A\u3051\u308B\u3002", amount * 0.8);
    }
  }
}
function marryWith(l, r, text, ceremony) {
  l.marry(r, text, ceremony);
  payForMarriage(l, r);
}
function customLine(l) {
  const n = marriageNorm(l.D.iso3);
  return n.payment === "none" || n.paymentYears <= 0 ? "" : `${l.D.isJapan ? "" : `${l.D.nameJa}\u3067\u306F`}${PAY_WORD[n.payment]}\u3002`;
}
function meetScene(l) {
  return { ...meetSceneAt(l), situationOf: (l2) => meetSceneAt(l2).situation };
}
function meetSceneAt(l) {
  const a = l.age;
  const again = l.widowed || l.partnerSince >= 0;
  const where = again ? "\u3072\u3068\u308A\u306E\u66AE\u3089\u3057\u306B\u3082\u6163\u308C\u305F\u3053\u308D\u3001\u6C17\u306B\u306A\u308B\u4EBA\u304C\u3067\u304D\u305F\u3002" : l.noMarry ? "\u7D50\u5A5A\u306F\u3057\u306A\u3044\u3068\u6C7A\u3081\u3066\u3044\u305F\u304C\u3001\u3042\u308B\u65E5\u3001\u3044\u3044\u4EBA\u306B\u51FA\u4F1A\u3063\u305F\u3002" : a < 23 && l.school !== "done" ? "\u540C\u3058\u5B66\u6821\u306B\u3001\u6C17\u306B\u306A\u308B\u4EBA\u304C\u3067\u304D\u305F\u3002" : l.job !== "none" && l.job !== "retired" ? ["\u8077\u5834\u306B\u3001\u6C17\u306E\u5408\u3046\u4EBA\u304C\u3067\u304D\u305F\u3002", "\u53CB\u3060\u3061\u306E\u7D39\u4ECB\u3067\u4F1A\u3063\u305F\u4EBA\u3068\u3001\u8A71\u304C\u5F3E\u3093\u3060\u3002", "\u8DA3\u5473\u306E\u96C6\u307E\u308A\u3067\u3001\u6C17\u306B\u306A\u308B\u4EBA\u304C\u3067\u304D\u305F\u3002"][a % 3] : ["\u53CB\u3060\u3061\u306E\u7D39\u4ECB\u3067\u4F1A\u3063\u305F\u4EBA\u3068\u3001\u8A71\u304C\u5F3E\u3093\u3060\u3002", "\u8DA3\u5473\u306E\u96C6\u307E\u308A\u3067\u3001\u6C17\u306B\u306A\u308B\u4EBA\u304C\u3067\u304D\u305F\u3002", "\u8FD1\u6240\u306B\u3001\u3088\u304F\u8A71\u3059\u4EBA\u304C\u3067\u304D\u305F\u3002"][a % 3];
  return {
    id: "meet",
    title: "\u51FA\u4F1A\u3044",
    situation: where,
    options: [
      {
        id: "ask",
        label: "\u98DF\u4E8B\u306B\u8A98\u3063\u3066\u307F\u308B",
        desc: "\u3046\u307E\u304F\u3044\u3051\u3070\u4ED8\u304D\u5408\u3048\u308B\u3002\u65AD\u3089\u308C\u308B\u3053\u3068\u3082\u3042\u308B\u3002",
        apply: (l2, r) => {
          if (r.chance(0.75)) {
            l2.dating = true;
            l2.datingSince = l2.age;
            l2.logPre("family", "\u98DF\u4E8B\u306B\u8A98\u3044\u3001\u4ED8\u304D\u5408\u3044\u306F\u3058\u3081\u305F\u3002");
          } else {
            l2.marriageDelayUntil = l2.age + 1;
            l2.logPre("family", "\u52C7\u6C17\u3092\u51FA\u3057\u3066\u8A98\u3063\u305F\u304C\u3001\u3046\u307E\u304F\u3044\u304B\u306A\u304B\u3063\u305F\u3002");
          }
        }
      },
      {
        id: "friend",
        label: "\u53CB\u3060\u3061\u306E\u307E\u307E\u3067\u3044\u308B",
        desc: "\u6C17\u697D\u306A\u95A2\u4FC2\u306E\u307E\u307E\u3002\u3053\u306E\u5148\u3069\u3046\u306A\u308B\u304B\u306F\u5206\u304B\u3089\u306A\u3044\u3002",
        apply: (l2, r) => {
          l2.marriageDelayUntil = l2.age + r.int(1, 2);
          l2.logPre("family", l2.vary("friends", ["\u53CB\u3060\u3061\u306E\u307E\u307E\u3067\u3044\u308B\u3053\u3068\u306B\u3057\u305F\u3002", "\u3044\u3044\u4EBA\u3060\u3063\u305F\u304C\u3001\u4ED8\u304D\u5408\u3046\u307E\u3067\u306B\u306F\u81F3\u3089\u306A\u304B\u3063\u305F\u3002", "\u6C17\u6301\u3061\u3092\u4F1D\u3048\u305A\u3001\u53CB\u3060\u3061\u306E\u307E\u307E\u3067\u3044\u305F\u3002"]));
        }
      },
      {
        id: "focus",
        label: "\u4ECA\u306F\u81EA\u5206\u306E\u3053\u3068\u3092\u512A\u5148\u3059\u308B",
        desc: "\u4ED5\u4E8B\u3084\u52C9\u5F37\u3001\u8DA3\u5473\u306B\u6253\u3061\u8FBC\u3081\u308B\u3002\u51FA\u4F1A\u3044\u306F\u3057\u3070\u3089\u304F\u9060\u306E\u304F\u3002",
        apply: (l2, r) => {
          l2.marriageDelayUntil = l2.age + r.int(3, 5);
          l2.logPre("family", l2.vary("self", ["\u4ECA\u306F\u604B\u611B\u3088\u308A\u81EA\u5206\u306E\u3053\u3068\u3092\u512A\u5148\u3059\u308B\u3068\u6C7A\u3081\u305F\u3002", "\u4ECA\u306F\u4ED5\u4E8B\u3084\u81EA\u5206\u306E\u6642\u9593\u3092\u5927\u4E8B\u306B\u3057\u305F\u3044\u3068\u601D\u3063\u305F\u3002", "\u8A98\u3044\u306F\u65AD\u308A\u3001\u81EA\u5206\u306E\u30DA\u30FC\u30B9\u3067\u66AE\u3089\u3059\u3053\u3068\u306B\u3057\u305F\u3002"]));
        }
      }
    ]
  };
}
function loveScene(l) {
  const years = Math.max(1, l.age - l.datingSince);
  return {
    id: "propose",
    title: "\u7D50\u5A5A\u306E\u3053\u3068",
    situation: `\u4ED8\u304D\u5408\u3063\u3066${years}\u5E74\u306B\u306A\u308B\u604B\u4EBA\u3068\u3001\u7D50\u5A5A\u306E\u8A71\u304C\u51FA\u305F\u3002${customLine(l)}`,
    options: [
      {
        id: "wedding",
        label: "\u7D50\u5A5A\u3059\u308B\uFF08\u5F0F\u3092\u6319\u3052\u308B\uFF09",
        desc: "\u5BB6\u65CF\u3084\u53CB\u4EBA\u306B\u795D\u3063\u3066\u3082\u3089\u3048\u308B\u3002\u5F0F\u306E\u8CBB\u7528\u304C\u304B\u304B\u308B\u3002",
        apply: (l2, r) => marryWith(l2, r, "\u7D50\u5A5A\u3057\u305F\u3002", true)
      },
      {
        id: "simple",
        label: "\u7D50\u5A5A\u3059\u308B\uFF08\u5F0F\u306F\u6319\u3052\u306A\u3044\uFF09",
        desc: "\u5C4A\u3051\u3060\u3051\u3067\u6E08\u307E\u305B\u3001\u304A\u91D1\u3092\u66AE\u3089\u3057\u306B\u56DE\u3059\u3002",
        apply: (l2, r) => marryWith(l2, r, "\u5F0F\u306F\u6319\u3052\u305A\u3001\u5C4A\u3051\u3060\u3051\u3067\u7D50\u5A5A\u3057\u305F\u3002", false)
      },
      {
        id: "wait",
        label: "\u7D50\u5A5A\u306F\u307E\u3060\u5148\u306B\u3059\u308B",
        desc: "\u604B\u4EBA\u306E\u307E\u307E\u4ED8\u304D\u5408\u3044\u3092\u7D9A\u3051\u308B\u3002\u5F85\u305F\u305B\u308B\u3046\u3061\u306B\u3001\u6C17\u6301\u3061\u304C\u96E2\u308C\u308B\u3053\u3068\u3082\u3042\u308B\u3002",
        apply: (l2, r) => {
          l2.marriageDelayUntil = l2.age + r.int(2, 3);
          if (r.chance(0.3)) {
            l2.dating = false;
            l2.logPre("family", "\u7D50\u5A5A\u306F\u307E\u3060\u5148\u306B\u3057\u305F\u3044\u3068\u4F1D\u3048\u305F\u3002\u3057\u3070\u3089\u304F\u3057\u3066\u3001\u604B\u4EBA\u3068\u306F\u5225\u308C\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002");
          } else l2.logPre("family", "\u7D50\u5A5A\u306F\u307E\u3060\u5148\u306B\u3057\u305F\u3044\u3068\u4F1D\u3048\u3001\u604B\u4EBA\u306E\u307E\u307E\u4ED8\u304D\u5408\u3044\u3092\u7D9A\u3051\u308B\u3053\u3068\u306B\u3057\u305F\u3002");
        }
      },
      {
        id: "breakup",
        label: "\u5225\u308C\u308B",
        desc: "\u3053\u306E\u4EBA\u3068\u306F\u7D50\u5A5A\u3057\u306A\u3044\u3068\u6C7A\u3081\u308B\u3002\u307E\u305F\u5225\u306E\u51FA\u4F1A\u3044\u304C\u3042\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002",
        apply: (l2, r) => {
          l2.dating = false;
          l2.marriageDelayUntil = l2.age + r.int(1, 2);
          l2.logPre("family", "\u3053\u306E\u4EBA\u3068\u306F\u7D50\u5A5A\u3057\u306A\u3044\u3068\u6C7A\u3081\u3001\u5225\u308C\u305F\u3002");
        }
      }
    ]
  };
}
function arrangedScene(l) {
  const jp2 = l.D.isJapan;
  const who = l.sex === "male" ? "\u5973\u6027" : "\u7537\u6027";
  const job = l.sex === "male" ? "\u8FD1\u304F\u306E\u753A\u3067\u50CD\u304F" : "\u89AA\u621A\u306E\u7D39\u4ECB\u3067\u3001\u4ED5\u4E8B\u304C\u5B89\u5B9A\u3057\u3066\u3044\u308B";
  return {
    id: "arranged",
    title: jp2 ? "\u304A\u898B\u5408\u3044\u306E\u8A71" : "\u7E01\u8AC7",
    situation: jp2 ? `\u89AA\u306E\u77E5\u308A\u5408\u3044\u304B\u3089\u3001\u304A\u898B\u5408\u3044\u306E\u8A71\u304C\u6765\u305F\u3002\u76F8\u624B\u306F${job}${who}\u3002` : `\u5BB6\u65CF\u304C\u7E01\u8AC7\u3092\u6301\u3063\u3066\u304D\u305F\u3002\u76F8\u624B\u306F${job}${who}\u3002\u5BB6\u3069\u3046\u3057\u306E\u8A71\u306F\u3001\u307E\u3068\u307E\u308A\u304B\u3051\u3066\u3044\u308B\u3002${customLine(l)}`,
    options: [
      {
        id: "accept",
        label: jp2 ? "\u304A\u898B\u5408\u3044\u3092\u3057\u3066\u7D50\u5A5A\u3059\u308B" : "\u7E01\u8AC7\u3092\u53D7\u3051\u3066\u7D50\u5A5A\u3059\u308B",
        desc: "\u5BB6\u65CF\u306B\u795D\u798F\u3055\u308C\u3001\u89AA\u621A\u306E\u652F\u3048\u3082\u5F97\u3084\u3059\u3044\u3002\u76F8\u624B\u306E\u3053\u3068\u306F\u3088\u304F\u77E5\u3089\u306A\u3044\u307E\u307E\u59CB\u307E\u308B\u3002",
        apply: (l2, r) => marryWith(l2, r, jp2 ? "\u304A\u898B\u5408\u3044\u3067\u51FA\u4F1A\u3063\u305F\u76F8\u624B\u3068\u7D50\u5A5A\u3057\u305F\u3002" : "\u5BB6\u65CF\u304C\u6C7A\u3081\u305F\u76F8\u624B\u3068\u7D50\u5A5A\u3057\u305F\u3002", true)
      },
      {
        id: "meet",
        label: "\u4F1A\u3063\u3066\u304B\u3089\u6C7A\u3081\u305F\u3044\u3068\u4F1D\u3048\u308B",
        desc: "\u76F8\u624B\u3092\u77E5\u3063\u3066\u304B\u3089\u6C7A\u3081\u3089\u308C\u308B\u3002\u8A71\u304C\u6D41\u308C\u308B\u3053\u3068\u3082\u3042\u308B\u3002",
        apply: (l2, r) => {
          if (r.chance(0.6)) marryWith(l2, r, "\u4F55\u5EA6\u304B\u4F1A\u3063\u3066\u8A71\u3057\u3001\u3053\u306E\u4EBA\u3068\u306A\u3089\u3001\u3068\u7D50\u5A5A\u3092\u6C7A\u3081\u305F\u3002", true);
          else {
            l2.marriageDelayUntil = l2.age + r.int(1, 3);
            l2.logPre("family", "\u4F55\u5EA6\u304B\u4F1A\u3063\u305F\u304C\u3001\u8A71\u306F\u307E\u3068\u307E\u3089\u306A\u304B\u3063\u305F\u3002");
          }
        }
      },
      {
        id: "refuse",
        label: "\u65AD\u3063\u3066\u3001\u76F8\u624B\u306F\u81EA\u5206\u3067\u63A2\u3059",
        desc: jp2 ? "\u81EA\u5206\u306E\u30DA\u30FC\u30B9\u3067\u76F8\u624B\u3092\u63A2\u305B\u308B\u3002" : "\u81EA\u5206\u3067\u9078\u3093\u3060\u4EBA\u3068\u7D50\u5A5A\u3067\u304D\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002\u5BB6\u65CF\u3068\u306E\u9593\u306B\u3057\u3053\u308A\u304C\u6B8B\u308B\u3053\u3068\u3082\u3042\u308B\u3002",
        apply: (l2, r) => {
          l2.marriageMode = "love";
          l2.marriageDelayUntil = l2.age + r.int(1, 3);
          if (!jp2) l2.social = Math.max(-0.5, l2.social - 0.2);
          l2.logPre("family", jp2 ? "\u304A\u898B\u5408\u3044\u306F\u65AD\u3063\u305F\u3002" : "\u7E01\u8AC7\u3092\u65AD\u3063\u305F\u3002\u5BB6\u65CF\u306F\u3057\u3070\u3089\u304F\u53E3\u3092\u304D\u3044\u3066\u304F\u308C\u306A\u304B\u3063\u305F\u3002");
        }
      }
    ]
  };
}
function betrothedScene(l) {
  return {
    id: "betrothed",
    title: "\u8A31\u5AC1\u3068\u306E\u7D50\u5A5A",
    situation: `\u5B50\u3069\u3082\u306E\u3053\u308D\u306B\u89AA\u3069\u3046\u3057\u3067\u6C7A\u3081\u305F\u8A31\u5AC1\u3068\u306E\u7D50\u5A5A\u306E\u65E5\u53D6\u308A\u304C\u6C7A\u307E\u3063\u305F\u3002${customLine(l)}`,
    options: [
      {
        id: "keep",
        label: "\u7D04\u675F\u3069\u304A\u308A\u7D50\u5A5A\u3059\u308B",
        desc: "\u5BB6\u3069\u3046\u3057\u306E\u3064\u306A\u304C\u308A\u304C\u5F37\u307E\u308A\u3001\u89AA\u621A\u306E\u652F\u3048\u3082\u5F97\u3084\u3059\u3044\u3002",
        apply: (l2, r) => marryWith(l2, r, "\u8A31\u5AC1\u3068\u3001\u7D04\u675F\u3069\u304A\u308A\u7D50\u5A5A\u3057\u305F\u3002", true)
      },
      {
        id: "break",
        label: "\u7D04\u675F\u3092\u65AD\u308B",
        desc: "\u81EA\u5206\u3067\u76F8\u624B\u3092\u9078\u3079\u308B\u3002\u5BB6\u3069\u3046\u3057\u3067\u53D7\u3051\u53D6\u3063\u305F\u3082\u306E\u3092\u8FD4\u3059\u304A\u91D1\u304C\u304B\u304B\u308A\u3001\u5BB6\u65CF\u3068\u3082\u3081\u308B\u3002",
        apply: (l2, r) => {
          const n = marriageNorm(l2.D.iso3);
          const cost = Math.max(n.paymentYears, 0.3) * l2.D.regularWage("male", "high_school", 35) * 0.3;
          l2.spend("events", cost);
          l2.marriageMode = "love";
          l2.marriageDelayUntil = l2.age + r.int(2, 4);
          l2.social = Math.max(-0.5, l2.social - 0.3);
          l2.logPre("family", "\u8A31\u5AC1\u3068\u306E\u7D04\u675F\u3092\u65AD\u3063\u305F\u3002\u5BB6\u3069\u3046\u3057\u306E\u8A71\u3057\u5408\u3044\u306F\u9577\u5F15\u304D\u3001\u53D7\u3051\u53D6\u3063\u3066\u3044\u305F\u3082\u306E\u3092\u8FD4\u3057\u305F\u3002", -cost);
        }
      }
    ]
  };
}

// src/engine/home.ts
function kidAtHome(k, age) {
  if (k.leftAge !== void 0) return false;
  const ka = age - k.born;
  return ka < (k.univ ? 22 : 18) || !!k.stayHome;
}
function kidShownHome(l, k, age) {
  if (k.leftAge !== void 0 || l.kidWithEx(k)) return false;
  const ka = age - k.born;
  if (ka < 0) return false;
  const t = k.univ ? 22 : 18;
  return ka < t || !!k.stayHome || !k.leaveAsked && ka <= t + 2;
}
function leaveHomeScene(l, later) {
  return {
    id: "leaveHome",
    title: "\u5B9F\u5BB6\u3092\u51FA\u308B\uFF1F",
    situation: later ? `\u5B9F\u5BB6\u304B\u3089\u4ED5\u4E8B\u306B\u901A\u3063\u3066\u3001\u8CAF\u91D1\u304C${l.D.fmt(Math.max(0, l.cash), false)}\u306B\u306A\u3063\u305F\u3002\u305D\u308D\u305D\u308D\u5BB6\u3092\u51FA\u308B\uFF1F` : "\u50CD\u304D\u306F\u3058\u3081\u305F\u3002\u3053\u306E\u307E\u307E\u5B9F\u5BB6\u304B\u3089\u901A\u3046\u304B\u3001\u5BB6\u3092\u51FA\u3066\u4E00\u4EBA\u3067\u66AE\u3089\u3059\u304B\u3002",
    options: [
      {
        id: "leave",
        label: later ? "\u8CAF\u3081\u305F\u304A\u91D1\u3067\u5BB6\u3092\u51FA\u308B" : "\u5B9F\u5BB6\u3092\u51FA\u3066\u4E00\u4EBA\u66AE\u3089\u3057\u3092\u59CB\u3081\u308B",
        desc: "\u81EA\u5206\u306E\u30DA\u30FC\u30B9\u3067\u66AE\u3089\u305B\u308B\u3002\u5BB6\u8CC3\u3068\u751F\u6D3B\u8CBB\u304C\u5168\u90E8\u304B\u304B\u308B\u3002",
        apply: (l2) => {
          l2.home = "rent";
          l2.logPre("life", later ? "\u8CAF\u3081\u305F\u304A\u91D1\u3067\u5B9F\u5BB6\u3092\u51FA\u3066\u3001\u4E00\u4EBA\u66AE\u3089\u3057\u3092\u59CB\u3081\u305F\u3002" : "\u5B9F\u5BB6\u3092\u51FA\u3066\u4E00\u4EBA\u66AE\u3089\u3057\u3092\u59CB\u3081\u305F\u3002", void 0, true);
        }
      },
      {
        id: "stay",
        label: later ? "\u3082\u3046\u3057\u3070\u3089\u304F\u5B9F\u5BB6\u306B\u3044\u308B" : "\u5B9F\u5BB6\u304B\u3089\u901A\u3063\u3066\u304A\u91D1\u3092\u8CAF\u3081\u308B",
        desc: "\u5BB6\u306B\u304A\u91D1\u3092\u5165\u308C\u3066\u3082\u3001\u5BB6\u8CC3\u3088\u308A\u5B89\u304F\u6E08\u3093\u3067\u8CAF\u91D1\u3057\u3084\u3059\u3044\u3002\u89AA\u306E\u8001\u3044\u3084\u4ECB\u8B77\u304C\u8EAB\u8FD1\u306B\u306A\u308B\u3002",
        apply: (l2, r) => {
          l2.leaveAskAfter = l2.age + r.int(2, 4);
          l2.logPre("life", later ? "\u3082\u3046\u3057\u3070\u3089\u304F\u5B9F\u5BB6\u3067\u66AE\u3089\u3059\u3053\u3068\u306B\u3057\u305F\u3002" : "\u5B9F\u5BB6\u304B\u3089\u4ED5\u4E8B\u306B\u901A\u3044\u3001\u6BCE\u6708\u5BB6\u306B\u304A\u91D1\u3092\u5165\u308C\u308B\u3053\u3068\u306B\u3057\u305F\u3002");
        }
      }
    ]
  };
}
function kidLeaveScene(l, idx) {
  const k = l.kids[idx];
  const word = k.univ ? "\u5927\u5B66\u3092\u5352\u696D\u3057\u3066\u50CD\u304D\u306F\u3058\u3081\u305F" : "\u9AD8\u6821\u3092\u51FA\u3066\u50CD\u304D\u306F\u3058\u3081\u305F";
  const ex = l.kidWithEx(k);
  const stillValid = (l2) => k.leftAge === void 0 && !k.leaveAsked && l2.kidWithEx(k) === ex;
  if (ex)
    return {
      id: "kidLeave",
      stillValid,
      title: "\u96E2\u308C\u3066\u66AE\u3089\u3059\u5B50\u3069\u3082\u306E\u5DE3\u7ACB\u3061",
      situation: `\u5225\u308C\u305F\u76F8\u624B\u306E\u3082\u3068\u3067\u80B2\u3063\u305F\u5B50\u3069\u3082\u304C\u3001${word}\u3068\u77E5\u3089\u305B\u3066\u304D\u305F\u3002`,
      options: [
        {
          id: "leave",
          label: "\u304A\u795D\u3044\u306E\u8A00\u8449\u3092\u9001\u308B",
          desc: "\u304A\u91D1\u306F\u304B\u304B\u3089\u306A\u3044\u3002",
          apply: (l2) => {
            k.leftAge = l2.age;
            k.leaveAsked = true;
            l2.logPre("family", "\u96E2\u308C\u3066\u66AE\u3089\u3059\u5B50\u3069\u3082\u306B\u3001\u304A\u795D\u3044\u306E\u8A00\u8449\u3092\u9001\u3063\u305F\u3002", void 0, true);
          }
        },
        {
          id: "stay",
          label: "\u5C31\u8077\u795D\u3044\u3092\u9001\u308B",
          desc: "\u5C11\u3057\u304A\u91D1\u304C\u304B\u304B\u308B\u3002",
          apply: (l2) => {
            const c = l2.y(5e4);
            l2.spend("kids", c);
            k.leftAge = l2.age;
            k.leaveAsked = true;
            l2.logPre("family", "\u96E2\u308C\u3066\u66AE\u3089\u3059\u5B50\u3069\u3082\u306B\u3001\u5C31\u8077\u795D\u3044\u3092\u9001\u3063\u305F\u3002", -c);
          }
        },
        {
          id: "help",
          label: "\u5F15\u3063\u8D8A\u3057\u3068\u5F53\u9762\u306E\u751F\u6D3B\u8CBB\u3092\u51FA\u3057\u3066\u3042\u3052\u308B",
          desc: "\u5B50\u3069\u3082\u306F\u5B89\u5FC3\u3057\u3066\u4E00\u4EBA\u7ACB\u3061\u3067\u304D\u308B\u3002\u307E\u3068\u307E\u3063\u305F\u304A\u91D1\u304C\u304B\u304B\u308B\u3002",
          apply: (l2) => {
            const c = l2.y(5e5);
            l2.spend("kids", c);
            k.leftAge = l2.age;
            k.leaveAsked = true;
            l2.logPre("family", "\u96E2\u308C\u3066\u66AE\u3089\u3059\u5B50\u3069\u3082\u306E\u3001\u5F15\u3063\u8D8A\u3057\u3068\u5F53\u9762\u306E\u751F\u6D3B\u8CBB\u3092\u51FA\u3057\u305F\u3002", -c, true);
          }
        }
      ]
    };
  return {
    id: "kidLeave",
    stillValid,
    title: "\u5B50\u3069\u3082\u306E\u5DE3\u7ACB\u3061",
    situation: `\u5B50\u3069\u3082\u304C${word}\u3002\u3053\u308C\u304B\u3089\u3069\u3053\u3067\u66AE\u3089\u3059\uFF1F`,
    options: [
      {
        id: "leave",
        label: "\u4E00\u4EBA\u7ACB\u3061\u3092\u898B\u9001\u308B",
        desc: "\u5B50\u3069\u3082\u306F\u81EA\u5206\u306E\u529B\u3067\u66AE\u3089\u3057\u306F\u3058\u3081\u308B\u3002\u5BB6\u8A08\u306F\u8EFD\u304F\u306A\u308B\u3002",
        apply: (l2) => {
          k.leftAge = l2.age;
          k.leaveAsked = true;
          l2.logPre("family", "\u5B50\u3069\u3082\u304C\u5BB6\u3092\u51FA\u3066\u3001\u4E00\u4EBA\u7ACB\u3061\u3057\u305F\u3002", void 0, true);
        }
      },
      {
        id: "stay",
        label: "\u5B9F\u5BB6\u304B\u3089\u901A\u3063\u3066\u3082\u3089\u3046",
        desc: "\u5B50\u3069\u3082\u306F\u8CAF\u91D1\u3057\u3084\u3059\u304F\u3001\u5BB6\u306B\u3082\u304A\u91D1\u3092\u5165\u308C\u3066\u304F\u308C\u308B\u3002\u66AE\u3089\u3057\u306E\u8CBB\u7528\u306F\u305D\u306E\u3076\u3093\u304B\u304B\u308B\u3002",
        apply: (l2) => {
          k.stayHome = true;
          k.leaveAsked = true;
          l2.logPre("family", "\u5B50\u3069\u3082\u306F\u5B9F\u5BB6\u304B\u3089\u4ED5\u4E8B\u306B\u901A\u3044\u3001\u5BB6\u306B\u304A\u91D1\u3092\u5165\u308C\u3066\u304F\u308C\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002");
        }
      },
      {
        id: "help",
        label: "\u5F15\u3063\u8D8A\u3057\u3068\u5F53\u9762\u306E\u751F\u6D3B\u8CBB\u3092\u51FA\u3057\u3066\u3042\u3052\u308B",
        desc: "\u5B50\u3069\u3082\u306F\u5B89\u5FC3\u3057\u3066\u4E00\u4EBA\u7ACB\u3061\u3067\u304D\u308B\u3002\u307E\u3068\u307E\u3063\u305F\u304A\u91D1\u304C\u304B\u304B\u308B\u3002",
        apply: (l2) => {
          const c = l2.y(5e5);
          l2.spend("kids", c);
          k.leftAge = l2.age;
          k.leaveAsked = true;
          l2.logPre("family", "\u5F15\u3063\u8D8A\u3057\u3068\u5F53\u9762\u306E\u751F\u6D3B\u8CBB\u3092\u51FA\u3057\u3066\u3001\u5B50\u3069\u3082\u306E\u4E00\u4EBA\u7ACB\u3061\u3092\u652F\u3048\u305F\u3002", -c, true);
        }
      }
    ]
  };
}

// src/engine/rites.ts
var RITES = {
  IND: [
    { age: 0, p: 0.45, texts: ["\u751F\u5F8C12\u65E5\u76EE\u3054\u308D\u3001\u30CA\u30FC\u30DE\u30AB\u30E9\u30CA\uFF08\u547D\u540D\u5F0F\uFF09\u304C\u958B\u304B\u308C\u3001\u89AA\u65CF\u306E\u524D\u3067\u540D\u524D\u304C\u6388\u3051\u3089\u308C\u305F\u3002", "\u547D\u540D\u5F0F\uFF08\u30CA\u30FC\u30DE\u30AB\u30E9\u30CA\uFF09\u3067\u3001\u7956\u7236\u6BCD\u304C\u795E\u3055\u307E\u306E\u540D\u524D\u306B\u3061\u306A\u3093\u3060\u540D\u524D\u3092\u9078\u3093\u3067\u304F\u308C\u305F\u3002"] },
    { age: 0, p: 0.35, texts: ["\u751F\u5F8C6\u304B\u6708\u3054\u308D\u3001\u30A2\u30F3\u30CA\u30D7\u30E9\u30B7\u30E3\u30CA\uFF08\u521D\u3081\u3066\u3054\u306F\u3093\u3092\u98DF\u3079\u308B\u5100\u5F0F\uFF09\u3067\u3001\u7518\u3044\u304A\u7C73\u306E\u304A\u304B\u3086\u3092\u53E3\u306B\u3057\u305F\u3002", "\u521D\u98DF\u5F0F\uFF08\u30A2\u30F3\u30CA\u30D7\u30E9\u30B7\u30E3\u30CA\uFF09\u3067\u3001\u5BB6\u65CF\u306B\u898B\u5B88\u3089\u308C\u306A\u304C\u3089\u3001\u521D\u3081\u3066\u304A\u304B\u3086\u3092\u98DF\u3079\u305F\u3002"] },
    { age: 0, p: 0.2, texts: ["\u521D\u3081\u3066\u5BB6\u306E\u5916\u3078\u9023\u308C\u51FA\u3055\u308C\u3001\u304A\u5BFA\u3067\u5065\u5EB7\u3092\u7948\u3063\u3066\u3082\u3089\u3063\u305F\uFF08\u30CB\u30B7\u30E5\u30AF\u30E9\u30DE\u30CA\uFF09\u3002"] },
    { age: 2, p: 0.3, texts: ["\u304A\u5BFA\u3067\u9AEA\u3092\u305D\u3063\u3066\u3082\u3089\u3046\u5100\u5F0F\uFF08\u30E0\u30F3\u30C0\u30F3\uFF09\u3092\u53D7\u3051\u3001\u9577\u751F\u304D\u3092\u7948\u3063\u3066\u3082\u3089\u3063\u305F\u3002", "\u7236\u89AA\u306E\u3072\u3056\u306B\u5EA7\u3063\u3066\u3001\u521D\u3081\u3066\u9AEA\u3092\u305D\u308B\u5100\u5F0F\u3092\u53D7\u3051\u305F\u3002"] }
  ],
  CHN: [
    { age: 0, p: 0.6, texts: ["\u751F\u5F8C1\u304B\u6708\u306E\u300C\u6E80\u6708\u9152\u300D\u3067\u3001\u89AA\u621A\u3084\u53CB\u4EBA\u306B\u521D\u3081\u3066\u304A\u62AB\u9732\u76EE\u3055\u308C\u305F\u3002", "\u751F\u5F8C1\u304B\u6708\u306E\u304A\u795D\u3044\u3067\u3001\u89AA\u621A\u304B\u3089\u670D\u3092\u305F\u304F\u3055\u3093\u3082\u3089\u3063\u305F\u3002"] },
    { age: 0, p: 0.5, texts: ["\u751F\u5F8C100\u65E5\u306E\u304A\u795D\u3044\uFF08\u767E\u65E5\uFF09\u3067\u3001\u5065\u5EB7\u3068\u9577\u751F\u304D\u3092\u9858\u3063\u3066\u3082\u3089\u3063\u305F\u3002", "\u767E\u65E5\u306E\u304A\u795D\u3044\u306B\u3001\u89AA\u621A\u304B\u3089\u300C\u767E\u5BB6\u8863\u300D\u306E\u5E03\u3084\u9280\u306E\u9577\u547D\u9396\u3092\u8D08\u3089\u308C\u305F\u3002"] },
    { age: 1, p: 0.5, tag: "bday1", texts: ["1\u6B73\u306E\u300C\u6293\u5468\u300D\u3067\u3001\u4E26\u3079\u3089\u308C\u305F\u54C1\u7269\u306E\u4E2D\u304B\u3089\u7B46\u3092\u3064\u304B\u3093\u3060\u3002\u5BB6\u65CF\u304C\u300C\u5B66\u8005\u306B\u306A\u308B\u300D\u3068\u559C\u3093\u3060\u3002", "1\u6B73\u306E\u300C\u6293\u5468\u300D\u3067\u3001\u4E26\u3079\u3089\u308C\u305F\u54C1\u7269\u306E\u4E2D\u304B\u3089\u304A\u91D1\u3092\u3064\u304B\u3093\u3060\u3002\u5BB6\u65CF\u304C\u5927\u7B11\u3044\u3057\u305F\u3002", "1\u6B73\u306E\u300C\u6293\u5468\u300D\u3067\u3001\u4E26\u3079\u3089\u308C\u305F\u54C1\u7269\u306E\u4E2D\u304B\u3089\u672C\u3092\u3064\u304B\u3093\u3060\u3002"] }
  ],
  NGA: [
    { age: 0, p: 0.15, texts: ["\u751F\u5F8C12\u65E5\u76EE\u3001\u30A4\u30DC\u306E\u547D\u540D\u5F0F\uFF08\u30A4\u30D0\u30FB\u30F3\u30EF\u30FB\u30A2\u30D5\u30A1\uFF09\u3067\u3001\u89AA\u65CF\u306E\u524D\u3067\u540D\u524D\u304C\u6388\u3051\u3089\u308C\u305F\u3002", "\u547D\u540D\u5F0F\u3067\u3001\u7236\u65B9\u306E\u89AA\u65CF\u304C\u3044\u304F\u3064\u3082\u306E\u540D\u524D\u3092\u8003\u3048\u3066\u304F\u308C\u305F\u3002"] },
    { age: 0, p: 0.35, texts: ["\u751F\u5F8C7\u65E5\u76EE\u306E\u30A2\u30AD\u30FC\u30AB\u3067\u540D\u524D\u304C\u4ED8\u3051\u3089\u308C\u3001\u89AA\u621A\u3084\u8FD1\u6240\u306E\u4EBA\u304C\u795D\u3044\u306E\u98DF\u4E8B\u306B\u96C6\u307E\u3063\u305F\u3002", "\u30A2\u30AD\u30FC\u30AB\u306E\u304A\u795D\u3044\u3067\u3001\u89AA\u621A\u3084\u8FD1\u6240\u306E\u4EBA\u306B\u3054\u3061\u305D\u3046\u304C\u3075\u308B\u307E\u308F\u308C\u305F\u3002"] }
  ],
  PAK: [
    { age: 0, p: 0.75, texts: ["\u751F\u307E\u308C\u3066\u3059\u3050\u3001\u7236\u89AA\u304C\u8033\u5143\u3067\u30A2\u30B6\u30FC\u30F3\uFF08\u7948\u308A\u306E\u547C\u3073\u304B\u3051\uFF09\u3092\u9759\u304B\u306B\u5531\u3048\u305F\u3002", "\u751F\u307E\u308C\u3066\u3059\u3050\u3001\u7956\u7236\u304C\u8033\u5143\u3067\u77ED\u3044\u7948\u308A\u3092\u5531\u3048\u3066\u304F\u308C\u305F\u3002"] },
    { age: 0, p: 0.7, texts: ["\u5BB6\u65CF\u304C\u96C6\u307E\u308A\u3001\u540D\u524D\u304C\u4ED8\u3051\u3089\u308C\u305F\u3002\u89AA\u621A\u304B\u3089\u6B21\u3005\u306B\u304A\u795D\u3044\u306E\u8A00\u8449\u304C\u5C4A\u3044\u305F\u3002"] },
    { age: 0, p: 0.55, texts: ["\u751F\u5F8C7\u65E5\u76EE\u306E\u30A2\u30AD\u30FC\u30AB\u3067\u3001\u304A\u795D\u3044\u306E\u8089\u304C\u89AA\u621A\u3084\u8FD1\u6240\u3001\u56F0\u3063\u3066\u3044\u308B\u4EBA\u306B\u914D\u3089\u308C\u305F\u3002", "\u30A2\u30AD\u30FC\u30AB\u306E\u304A\u795D\u3044\u306B\u3001\u89AA\u621A\u304C\u305F\u304F\u3055\u3093\u96C6\u307E\u3063\u305F\u3002"] }
  ],
  IDN: [
    { age: 0, p: 0.35, texts: ["\u751F\u5F8C7\u65E5\u76EE\u306E\u30A2\u30AD\u30AB\u3067\u540D\u524D\u304C\u4ED8\u3051\u3089\u308C\u3001\u9AEA\u3092\u305D\u3063\u3066\u3082\u3089\u3063\u305F\u3002\u8FD1\u6240\u306B\u6599\u7406\u304C\u914D\u3089\u308C\u305F\u3002", "\u30A2\u30AD\u30AB\u306E\u304A\u795D\u3044\u3067\u3001\u8FD1\u6240\u306E\u4EBA\u305F\u3061\u306B\u6599\u7406\u304C\u914D\u3089\u308C\u305F\u3002"] },
    { age: 0, p: 0.2, texts: ["\u521D\u3081\u3066\u5730\u9762\u306B\u8DB3\u3092\u3064\u3051\u308B\u304A\u795D\u3044\uFF08\u30C6\u30C0\u30C3\u30AF\u30FB\u30B7\u30C6\u30F3\uFF09\u3067\u3001\u98FE\u308A\u306E\u304B\u3054\u306E\u4E2D\u304B\u3089\u672C\u3092\u9078\u3093\u3060\u3002", "\u30C6\u30C0\u30C3\u30AF\u30FB\u30B7\u30C6\u30F3\u306E\u304A\u795D\u3044\u3067\u3001\u304B\u3054\u306E\u4E2D\u304B\u3089\u91D1\u8272\u306E\u304A\u3082\u3061\u3083\u3092\u9078\u3073\u3001\u5BB6\u65CF\u304C\u7B11\u3063\u305F\u3002"] },
    { age: 0, p: 0.02, texts: ["\u751F\u5F8C210\u65E5\u306E\u30AA\u30C8\u30CA\u30F3\u3067\u3001\u304A\u4F9B\u3048\u7269\u3068\u7948\u308A\u3067\u5065\u5EB7\u3092\u9858\u3063\u3066\u3082\u3089\u3063\u305F\u3002"] }
  ],
  COD: [
    { age: 0, p: 0.35, texts: ["\u6559\u4F1A\u3067\u6D17\u793C\u3092\u53D7\u3051\u3001\u6559\u4F1A\u306E\u4EBA\u305F\u3061\u306B\u8FCE\u3048\u3089\u308C\u305F\u3002", "\u6D17\u793C\u5F0F\u306E\u3042\u3068\u3001\u5BB6\u65CF\u3068\u6559\u4F1A\u306E\u4EBA\u305F\u3061\u3067\u6B4C\u3063\u3066\u304A\u795D\u3044\u3057\u305F\u3002"] }
  ],
  ETH: [
    { age: 0, p: 0.35, texts: ["\u6559\u4F1A\u3067\u6D17\u793C\uFF08\u30C6\u30A3\u30E0\u30B1\u30C8\uFF09\u3092\u53D7\u3051\u3001\u6D17\u793C\u540D\u3092\u3082\u3089\u3063\u305F\u3002", "\u6559\u4F1A\u3067\u6D17\u793C\u3092\u53D7\u3051\u3001\u4EE3\u7236\u6BCD\u304C\u6C7A\u307E\u3063\u305F\u3002"] },
    { age: 0, p: 0.03, texts: ["\u547D\u540D\u306E\u5100\u5F0F\u3067\u3001\u96C6\u307E\u3063\u305F\u4EBA\u305F\u3061\u304C\u30B3\u30FC\u30D2\u30FC\u3092\u9806\u306B\u5206\u3051\u5408\u3044\u3001\u540D\u524D\u304C\u6388\u3051\u3089\u308C\u305F\u3002"] },
    { age: 0, p: 0.02, texts: ["\u89AA\u65CF\u304C\u96C6\u307E\u308A\u3001\u6BCD\u89AA\u3068\u3044\u3063\u3057\u3087\u306B\u795D\u798F\u3092\u53D7\u3051\u305F\u3002\u6B4C\u3068\u8E0A\u308A\u3067\u306B\u304E\u3084\u304B\u306B\u795D\u308F\u308C\u305F\u3002"] }
  ],
  USA: [
    { age: 0, p: 0.3, texts: ["\u6559\u4F1A\u3067\u6D17\u793C\u3092\u53D7\u3051\u3001\u30B4\u30C3\u30C9\u30DA\u30A2\u30EC\u30F3\u30C8\uFF08\u4EE3\u7236\u6BCD\uFF09\u304C\u6C7A\u307E\u3063\u305F\u3002"] },
    { age: 3, p: 0.7, texts: ["\u30CF\u30ED\u30A6\u30A3\u30FC\u30F3\u3067\u521D\u3081\u3066\u4EEE\u88C5\u3057\u3001\u5BB6\u3005\u3092\u56DE\u3063\u3066\u304A\u83D3\u5B50\u3092\u3082\u3089\u3063\u305F\u3002", "\u30CF\u30ED\u30A6\u30A3\u30FC\u30F3\u306B\u304B\u307C\u3061\u3083\u306E\u8863\u88C5\u3092\u7740\u3066\u3001\u300C\u30C8\u30EA\u30C3\u30AF\u30FB\u30AA\u30A2\u30FB\u30C8\u30EA\u30FC\u30C8\uFF01\u300D\u3068\u8A00\u3048\u305F\u3002"] },
    { age: 5, p: 0.6, texts: ["\u53CB\u3060\u3061\u3092\u547C\u3093\u3067\u8A95\u751F\u65E5\u30D1\u30FC\u30C6\u30A3\u30FC\u3092\u958B\u3044\u3066\u3082\u3089\u3063\u305F\u3002\u308D\u3046\u305D\u304F\u3092\u4E00\u606F\u3067\u5439\u304D\u6D88\u3057\u305F\u3002", "\u8A95\u751F\u65E5\u30D1\u30FC\u30C6\u30A3\u30FC\u3067\u3001\u307F\u3093\u306A\u306B\u300C\u30CF\u30C3\u30D4\u30FC\u30D0\u30FC\u30B9\u30C7\u30FC\u300D\u3092\u6B4C\u3063\u3066\u3082\u3089\u3063\u305F\u3002"] }
  ],
  BGD: [
    { age: 0, p: 0.8, texts: ["\u751F\u307E\u308C\u3066\u3059\u3050\u3001\u7236\u89AA\u304C\u8033\u5143\u3067\u30A2\u30B6\u30FC\u30F3\uFF08\u7948\u308A\u306E\u547C\u3073\u304B\u3051\uFF09\u3092\u9759\u304B\u306B\u5531\u3048\u305F\u3002"] },
    { age: 0, p: 0.6, texts: ["\u751F\u5F8C7\u65E5\u76EE\u306E\u30A2\u30AD\u30FC\u30AB\u3067\u540D\u524D\u304C\u4ED8\u3051\u3089\u308C\u3001\u89AA\u621A\u304C\u96C6\u307E\u3063\u3066\u795D\u3063\u305F\u3002", "\u30A2\u30AD\u30FC\u30AB\u306E\u304A\u795D\u3044\u3067\u9AEA\u3092\u305D\u3063\u3066\u3082\u3089\u3044\u3001\u305D\u306E\u91CD\u3055\u5206\u306E\u304A\u91D1\u304C\u8CA7\u3057\u3044\u4EBA\u306B\u65BD\u3055\u308C\u305F\u3002"] },
    { age: 0, p: 0.06, texts: ["\u751F\u5F8C10\u65E5\u3054\u308D\u306E\u547D\u540D\u5F0F\uFF08\u30CA\u30FC\u30E0\u30B3\u30ED\u30F3\uFF09\u3067\u3001\u661F\u5EA7\u306B\u3061\u306A\u3093\u3060\u540D\u524D\u3068\u3001\u3075\u3060\u3093\u4F7F\u3046\u540D\u524D\u306E2\u3064\u3092\u3082\u3089\u3063\u305F\u3002"] }
  ],
  BRA: [
    { age: 1, p: 0.65, tag: "bday1", texts: ["1\u6B73\u306E\u8A95\u751F\u65E5\u306B\u3001\u89AA\u621A\u3084\u8FD1\u6240\u306E\u5B50\u3069\u3082\u3092\u62DB\u3044\u3066\u3001\u30B1\u30FC\u30AD\u3068\u304A\u83D3\u5B50\u3067\u306B\u304E\u3084\u304B\u306A\u30D1\u30FC\u30C6\u30A3\u30FC\u3092\u958B\u3044\u3066\u3082\u3089\u3063\u305F\u3002", "1\u6B73\u306E\u8A95\u751F\u65E5\u306B\u3001\u5BB6\u65CF\u3084\u53CB\u3060\u3061\u304C\u30B1\u30FC\u30AD\u3068\u8D08\u308A\u7269\u3092\u7528\u610F\u3057\u3066\u304F\u308C\u305F\u3002"] },
    { age: 4, p: 0.6, texts: ["10\u670812\u65E5\u306E\u300C\u5B50\u3069\u3082\u306E\u65E5\u300D\u306B\u3001\u304A\u3082\u3061\u3083\u3092\u8CB7\u3063\u3066\u3082\u3089\u3063\u305F\u3002", "\u300C\u5B50\u3069\u3082\u306E\u65E5\u300D\u306B\u3001\u516C\u5712\u306E\u304A\u796D\u308A\u3067\u904A\u3093\u3060\u3002"] }
  ],
  EGY: [
    { age: 0, p: 0.7, texts: ["\u751F\u5F8C7\u65E5\u76EE\u306E\u30BB\u30D6\u30FC\u3067\u3001\u5BB6\u65CF\u3084\u89AA\u621A\u304C\u96C6\u307E\u308A\u3001\u540D\u524D\u3068\u8A95\u751F\u3092\u795D\u3063\u3066\u3082\u3089\u3063\u305F\u3002", "\u751F\u5F8C7\u65E5\u76EE\u306E\u30BB\u30D6\u30FC\u3067\u3001\u5BB6\u65CF\u306E\u4EF2\u9593\u5165\u308A\u3092\u89AA\u621A\u307F\u3093\u306A\u306B\u795D\u3063\u3066\u3082\u3089\u3063\u305F\u3002"] },
    { age: 0, p: 0.45, texts: ["\u30A2\u30AD\u30FC\u30AB\u306E\u304A\u795D\u3044\u3067\u3001\u5BB6\u65CF\u3084\u53CB\u4EBA\u3068\u98DF\u4E8B\u3092\u5206\u3051\u5408\u3063\u305F\u3002"] },
    { age: 0, p: 0.08, texts: ["\u751F\u5F8C40\u65E5\uFF08\u5973\u306E\u5B50\u306F80\u65E5\uFF09\u3054\u308D\u3001\u30B3\u30D7\u30C8\u6559\u4F1A\u3067\u6D17\u793C\u3092\u53D7\u3051\u305F\u3002"] }
  ],
  MEX: [
    { age: 0, p: 0.6, texts: ["\u6559\u4F1A\u3067\u30D0\u30A6\u30C6\u30A3\u30BD\uFF08\u6D17\u793C\uFF09\u3092\u53D7\u3051\u3001\u30D1\u30C9\u30EA\u30FC\u30CE\uFF08\u4EE3\u7236\u6BCD\uFF09\u304C\u6C7A\u307E\u3063\u305F\u3002", "\u6D17\u793C\u5F0F\u306E\u3042\u3068\u3001\u5BB6\u65CF\u3068\u4EE3\u7236\u6BCD\u3067\u304A\u795D\u3044\u306E\u98DF\u4E8B\u3092\u3057\u305F\u3002"] },
    { age: 3, p: 0.2, texts: ["3\u6B73\u306B\u306A\u308A\u3001\u6559\u4F1A\u3067\u795E\u3055\u307E\u306B\u7D39\u4ECB\u3055\u308C\u308B\u300C\u30D7\u30EC\u30BB\u30F3\u30BF\u30B7\u30AA\u30F3\u300D\u3092\u53D7\u3051\u3001\u795D\u798F\u3055\u308C\u305F\u3002"] },
    { age: 4, p: 0.35, texts: ["\u6B7B\u8005\u306E\u65E5\u306B\u3001\u5BB6\u65CF\u3068\u3044\u3063\u3057\u3087\u306B\u796D\u58C7\u3092\u30DE\u30EA\u30FC\u30B4\u30FC\u30EB\u30C9\u3067\u98FE\u308A\u3001\u4EA1\u304F\u306A\u3063\u305F\u89AA\u65CF\u3092\u8FCE\u3048\u305F\u3002"] }
  ],
  PHL: [
    { age: 0, p: 0.75, texts: ["\u6559\u4F1A\u3067\u6D17\u793C\uFF08\u30D3\u30CB\u30E3\u30B0\uFF09\u3092\u53D7\u3051\u3001\u4EE3\u7236\u6BCD\u304C\u6C7A\u307E\u3063\u305F\u3002"] },
    { age: 1, p: 0.65, tag: "bday1", texts: ["1\u6B73\u306E\u8A95\u751F\u65E5\u306B\u3001\u89AA\u621A\u304C\u5927\u52E2\u96C6\u307E\u308A\u3001\u3054\u3061\u305D\u3046\u3068\u30B1\u30FC\u30AD\u3067\u76DB\u5927\u306B\u795D\u3063\u3066\u3082\u3089\u3063\u305F\u3002", "1\u6B73\u306E\u8A95\u751F\u65E5\u30D1\u30FC\u30C6\u30A3\u30FC\u306B\u3001\u4EE3\u7236\u6BCD\u304C\u30D7\u30EC\u30BC\u30F3\u30C8\u3092\u6301\u3063\u3066\u6765\u3066\u304F\u308C\u305F\u3002"] }
  ],
  KEN: [
    { age: 0, p: 0.55, texts: ["\u6559\u4F1A\u3067\u6D17\u793C\u3092\u53D7\u3051\u3001\u6D17\u793C\u540D\u3092\u3082\u3089\u3063\u305F\u3002", "\u6559\u4F1A\u3067\u3001\u307F\u3093\u306A\u306E\u524D\u3067\u7948\u3063\u3066\u3082\u3089\u3044\u3001\u6D17\u793C\u540D\u3092\u6388\u304B\u3063\u305F\u3002"] },
    { age: 0, p: 0.12, texts: ["\u89AA\u65CF\u304C\u96C6\u307E\u308A\u3001\u751F\u307E\u308C\u305F\u6642\u523B\u3084\u5929\u6C17\u306B\u3061\u306A\u3093\u3060\u540D\u524D\u3092\u4ED8\u3051\u3066\u304F\u308C\u305F\u3002"] },
    { age: 0, p: 0.08, texts: ["\u751F\u5F8C7\u65E5\u76EE\u306E\u30A2\u30AD\u30FC\u30AB\u3067\u3001\u304A\u795D\u3044\u306E\u8089\u304C\u89AA\u621A\u3084\u8FD1\u6240\u306E\u4EBA\u306B\u914D\u3089\u308C\u305F\u3002"] }
  ],
  VNM: [
    { age: 0, p: 0.6, texts: ["\u751F\u5F8C1\u304B\u6708\u306E\u300C\u30C0\u30A4\u30BF\u30F3\u300D\u3067\u3001\u3054\u5148\u7956\u3055\u307E\u306B\u304A\u4F9B\u3048\u3092\u3057\u3001\u5065\u5EB7\u3092\u7948\u3063\u3066\u3082\u3089\u3063\u305F\u3002", "\u751F\u5F8C1\u304B\u6708\u306E\u304A\u795D\u3044\u306B\u3001\u89AA\u621A\u304C\u96C6\u307E\u3063\u3066\u98DF\u4E8B\u3092\u3057\u305F\u3002"] },
    { age: 1, p: 0.6, tag: "bday1", texts: ["1\u6B73\u306E\u300C\u30C8\u30A4\u30CE\u30A4\u300D\u3067\u3001\u4E26\u3079\u3089\u308C\u305F\u54C1\u7269\u306E\u4E2D\u304B\u3089\u7B46\u3092\u3064\u304B\u3093\u3060\u3002", "1\u6B73\u306E\u300C\u30C8\u30A4\u30CE\u30A4\u300D\u306E\u304A\u795D\u3044\u3067\u3001\u89AA\u621A\u304C\u96C6\u307E\u308A\u6210\u9577\u3092\u795D\u3063\u3066\u304F\u308C\u305F\u3002"] },
    { age: 4, p: 0.7, texts: ["\u4E2D\u79CB\u7BC0\u306B\u3001\u661F\u5F62\u306E\u706F\u7C60\u3092\u6301\u3063\u3066\u591C\u9053\u3092\u6B69\u304D\u3001\u6708\u9905\u3092\u98DF\u3079\u305F\u3002", "\u4E2D\u79CB\u7BC0\u306B\u3001\u592A\u9F13\u3092\u305F\u305F\u3044\u3066\u904A\u3073\u3001\u6708\u9905\u3092\u5206\u3051\u3066\u3082\u3089\u3063\u305F\u3002"] }
  ],
  DEU: [
    { age: 0, p: 0.3, texts: ["\u6559\u4F1A\u3067\u6D17\u793C\uFF08\u30BF\u30A6\u30D5\u30A7\uFF09\u3092\u53D7\u3051\u3001\u30D1\u30FC\u30C6\u30F3\uFF08\u7ACB\u4F1A\u4EBA\uFF09\u304C\u6C7A\u307E\u3063\u305F\u3002"] },
    { age: 4, p: 0.6, texts: ["\u30B6\u30F3\u30AF\u30C8\u30FB\u30DE\u30EB\u30C6\u30A3\u30F3\u306E\u65E5\u3001\u624B\u4F5C\u308A\u306E\u30E9\u30F3\u30BF\u30F3\u3092\u6301\u3063\u3066\u3001\u6B4C\u3044\u306A\u304C\u3089\u884C\u5217\u3057\u305F\u3002"] },
    { age: 6, p: 0.85, texts: ["\u5165\u5B66\u306E\u65E5\u3001\u304A\u83D3\u5B50\u3068\u6587\u623F\u5177\u304C\u8A70\u307E\u3063\u305F\u5927\u304D\u306A\u5186\u3059\u3044\u5F62\u306E\u888B\uFF08\u30B7\u30E5\u30FC\u30EB\u30C6\u30E5\u30FC\u30C6\uFF09\u3092\u3082\u3089\u3063\u305F\u3002", "\u5165\u5B66\u5F0F\u3067\u3001\u81EA\u5206\u306E\u80CC\u4E08\u307B\u3069\u3082\u3042\u308B\u30B7\u30E5\u30FC\u30EB\u30C6\u30E5\u30FC\u30C6\u3092\u62B1\u3048\u3066\u5199\u771F\u3092\u64AE\u3063\u305F\u3002"] }
  ],
  GBR: [
    { age: 0, p: 0.2, texts: ["\u6559\u4F1A\u3067\u30AF\u30EA\u30B9\u30C6\u30CB\u30F3\u30B0\uFF08\u5E7C\u5150\u6D17\u793C\uFF09\u3092\u53D7\u3051\u3001\u30B4\u30C3\u30C9\u30DA\u30A2\u30EC\u30F3\u30C8\u304C\u6C7A\u307E\u3063\u305F\u3002"] },
    { age: 4, p: 1, texts: ["4\u6B73\u306E9\u6708\u3001\u5C0F\u5B66\u6821\u306E\u6E96\u5099\u30AF\u30E9\u30B9\uFF08\u30EC\u30BB\u30D7\u30B7\u30E7\u30F3\uFF09\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002\u5236\u670D\u304C\u307E\u3060\u5927\u304D\u304B\u3063\u305F\u3002", "4\u6B73\u3067\u3001\u5C0F\u5B66\u6821\u306E\u6E96\u5099\u30AF\u30E9\u30B9\uFF08\u30EC\u30BB\u30D7\u30B7\u30E7\u30F3\uFF09\u306B\u5165\u3063\u305F\u3002"] }
  ],
  FRA: [
    { age: 0, p: 0.25, texts: ["\u6559\u4F1A\u3067\u6D17\u793C\uFF08\u30D0\u30C6\u30FC\u30E0\uFF09\u3092\u53D7\u3051\u3001\u4EE3\u7236\u6BCD\uFF08\u30D1\u30E9\u30F3\u30FB\u30DE\u30E9\u30F3\uFF09\u304C\u6C7A\u307E\u3063\u305F\u3002"] },
    { age: 3, p: 0.985, tag: "nursery", texts: ["3\u6B73\u3067\u5E7C\u7A1A\u5712\uFF08\u30A8\u30B3\u30FC\u30EB\u30FB\u30DE\u30C6\u30EB\u30CD\u30EB\uFF09\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002\u6700\u521D\u306E\u65E5\u306F\u5927\u6CE3\u304D\u3057\u305F\u3002", "3\u6B73\u3067\u5E7C\u7A1A\u5712\uFF08\u30DE\u30C6\u30EB\u30CD\u30EB\uFF09\u306E\u5E74\u5C11\u30AF\u30E9\u30B9\u306B\u5165\u3063\u305F\u3002"] }
  ],
  KOR: [
    { age: 0, p: 0.65, texts: ["\u751F\u5F8C100\u65E5\u306E\u300C\u30DA\u30AE\u30EB\u300D\u3067\u3001\u767D\u3044\u84B8\u3057\u9905\u3092\u8FD1\u6240\u306B\u914D\u3063\u3066\u3001\u5065\u5EB7\u3068\u9577\u751F\u304D\u3092\u9858\u3063\u3066\u3082\u3089\u3063\u305F\u3002"] },
    { age: 1, p: 0.7, tag: "bday1", texts: ["1\u6B73\u306E\u300C\u30C8\u30EB\u30B8\u30E3\u30F3\u30C1\u300D\u3067\u3001\u4E26\u3079\u3089\u308C\u305F\u54C1\u7269\u306E\u4E2D\u304B\u3089\u7CF8\u3092\u3064\u304B\u3093\u3060\u3002\u5BB6\u65CF\u304C\u300C\u9577\u751F\u304D\u3059\u308B\u300D\u3068\u559C\u3093\u3060\u3002", "1\u6B73\u306E\u300C\u30C8\u30EB\u30B8\u30E3\u30F3\u30C1\u300D\u3067\u3001\u4E26\u3079\u3089\u308C\u305F\u54C1\u7269\u306E\u4E2D\u304B\u3089\u304A\u91D1\u3092\u3064\u304B\u3093\u3060\u3002", "1\u6B73\u306E\u300C\u30C8\u30EB\u30B8\u30E3\u30F3\u30C1\u300D\u3067\u3001\u97D3\u670D\u3092\u7740\u3066\u304A\u795D\u3044\u3057\u3066\u3082\u3089\u3063\u305F\u3002"] },
    { age: 3, p: 0.75, texts: ["\u30BD\u30EB\u30E9\u30EB\uFF08\u65E7\u6B63\u6708\uFF09\u306B\u3001\u7956\u7236\u6BCD\u306B\u6DF1\u304F\u304A\u8F9E\u5100\uFF08\u30BB\u30D9\uFF09\u3092\u3057\u3066\u3001\u304A\u5E74\u7389\u3092\u3082\u3089\u3063\u305F\u3002"] },
    { age: 4, p: 0.75, texts: ["5\u67085\u65E5\u306E\u3053\u3069\u3082\u306E\u65E5\u306B\u3001\u52D5\u7269\u5712\u3078\u9023\u308C\u3066\u884C\u3063\u3066\u3082\u3089\u3063\u305F\u3002"] }
  ]
};

// src/engine/early.ts
var jp = (l) => l.D.isJapan;
var rural = (l) => l.region.urban === false;
var poor = (l) => !l.D.isJapan && (l.D.inst?.incomeGroup === "LIC" || l.D.inst?.incomeGroup === "LMC");
var girl = (l) => l.sex === "female";
var EARLY = [
  // 0歳
  { age: 0, text: (_l, r) => r.pick(["\u521D\u3081\u3066\u7B11\u3063\u305F\u3002\u5BB6\u65CF\u307F\u3093\u306A\u304C\u9854\u3092\u306E\u305E\u304D\u3053\u3093\u3060\u3002", "\u3042\u3084\u3055\u308C\u3066\u3001\u58F0\u3092\u51FA\u3057\u3066\u7B11\u3046\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u5BB6\u65CF\u306E\u9854\u3092\u898B\u308B\u3068\u3001\u306B\u3063\u3053\u308A\u7B11\u3046\u3088\u3046\u306B\u306A\u3063\u305F\u3002"]) },
  { age: 0, text: (_l, r) => r.pick(["\u591C\u6CE3\u304D\u304C\u7D9A\u304D\u3001\u5BB6\u65CF\u306F\u5BDD\u4E0D\u8DB3\u306E\u65E5\u3005\u304C\u7D9A\u3044\u305F\u3002", "\u591C\u4E2D\u306B\u4F55\u5EA6\u3082\u76EE\u3092\u899A\u307E\u3057\u3001\u5BB6\u65CF\u304C\u4EA4\u4EE3\u3067\u62B1\u3063\u3053\u3057\u305F\u3002"]) },
  { age: 0, text: () => "\u5BDD\u8FD4\u308A\u3092\u6253\u3066\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002" },
  { age: 0, text: () => "\u4E88\u9632\u63A5\u7A2E\u3092\u53D7\u3051\u305F\u3002\u5927\u6CE3\u304D\u3057\u305F\u3002" },
  { age: 0, text: () => "\u304A\u5BAE\u53C2\u308A\u306B\u51FA\u304B\u3051\u3001\u5BB6\u65CF\u3067\u5199\u771F\u3092\u64AE\u3063\u305F\u3002", when: jp },
  // 1歳
  { age: 1, text: (_l, r) => r.pick(["\u521D\u3081\u3066\u81EA\u5206\u306E\u8DB3\u3067\u6B69\u3044\u305F\u3002", "\u3088\u3061\u3088\u3061\u3068\u3001\u6570\u6B69\u3060\u3051\u6B69\u3051\u305F\u3002\u5BB6\u65CF\u304C\u5927\u559C\u3073\u3057\u305F\u3002", "\u3064\u304B\u307E\u308A\u7ACB\u3061\u304B\u3089\u3001\u3064\u3044\u306B\u4E00\u4EBA\u3067\u6B69\u304D\u51FA\u3057\u305F\u3002"]) },
  { age: 1, text: (_l, r) => `\u521D\u3081\u3066\u8A00\u8449\u3092\u8A71\u3057\u305F\u3002\u6700\u521D\u306E\u8A00\u8449\u306F\u300C${r.pick(["\u30DE\u30DE", "\u30D1\u30D1", "\u307E\u3093\u307E", "\u30EF\u30F3\u30EF\u30F3"])}\u300D\u3060\u3063\u305F\u3002` },
  { age: 1, text: () => "\u4E00\u5347\u9905\u3092\u80CC\u8CA0\u3063\u3066\u30011\u6B73\u306E\u8A95\u751F\u65E5\u3092\u795D\u3063\u3066\u3082\u3089\u3063\u305F\u3002", when: jp },
  { age: 1, text: () => "1\u6B73\u306E\u8A95\u751F\u65E5\u3092\u3001\u89AA\u621A\u304C\u96C6\u307E\u3063\u3066\u795D\u3063\u3066\u304F\u308C\u305F\u3002", when: (l) => !jp(l), tag: "bday1" },
  // 2歳
  { age: 2, text: (_l, r) => r.pick(["\u300C\u3044\u3084\u3060\uFF01\u300D\u304C\u53E3\u3050\u305B\u306B\u306A\u3063\u305F\u3002", "\u4F55\u3067\u3082\u300C\u81EA\u5206\u3067\u3084\u308B\uFF01\u300D\u3068\u8A00\u3046\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u300C\u306A\u3093\u3067\uFF1F\u300D\u3068\u4F55\u5EA6\u3082\u805E\u304F\u3088\u3046\u306B\u306A\u3063\u305F\u3002"]) },
  { age: 2, text: (_l, r) => r.pick(["\u71B1\u3092\u51FA\u3057\u3066\u3001\u591C\u4E2D\u306B\u75C5\u9662\u3078\u9023\u308C\u3066\u884C\u304B\u308C\u305F\u3002", "\u98A8\u90AA\u3092\u3053\u3058\u3089\u305B\u3066\u3001\u4F55\u65E5\u304B\u5BDD\u8FBC\u3093\u3060\u3002", "\u8EE2\u3093\u3067\u304A\u3067\u3053\u3092\u3076\u3064\u3051\u3001\u5927\u6CE3\u304D\u3057\u305F\u3002"]) },
  { age: 2, text: () => "\u516C\u5712\u306E\u7802\u5834\u3067\u3001\u6BCE\u65E5\u306E\u3088\u3046\u306B\u6CE5\u3060\u3089\u3051\u306B\u306A\u3063\u3066\u904A\u3093\u3060\u3002", when: (l) => !rural(l) },
  { age: 2, text: () => "\u7551\u306B\u51FA\u308B\u89AA\u306B\u3064\u3044\u3066\u884C\u304D\u3001\u866B\u3092\u3064\u304B\u307E\u3048\u3066\u904A\u3093\u3060\u3002", when: rural },
  // 3歳
  { age: 3, text: (_l, r) => r.chance(0.5) ? r.pick(["\u4FDD\u80B2\u5712\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002\u6700\u521D\u306E\u65E5\u306F\u5927\u6CE3\u304D\u3057\u305F\u3002", "\u4FDD\u80B2\u5712\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002\u3059\u3050\u306B\u53CB\u3060\u3061\u304C\u3067\u304D\u305F\u3002"]) : r.pick(["\u5E7C\u7A1A\u5712\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002\u5236\u670D\u304C\u5C11\u3057\u5927\u304D\u304B\u3063\u305F\u3002", "\u5E7C\u7A1A\u5712\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002\u9EC4\u8272\u3044\u5E3D\u5B50\u304C\u304A\u6C17\u306B\u5165\u308A\u306B\u306A\u3063\u305F\u3002"]), when: jp, rite: 0.85 },
  { age: 3, text: () => "\u4E03\u4E94\u4E09\u306E\u304A\u795D\u3044\u3067\u3001\u7740\u7269\u3092\u7740\u3066\u5199\u771F\u3092\u64AE\u3063\u305F\u3002", when: (l) => jp(l) && girl(l), rite: 0.75 },
  { age: 3, text: () => "\u4FDD\u80B2\u5712\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002", when: (l) => !jp(l) && !poor(l), tag: "nursery" },
  { age: 3, text: () => "\u89AA\u304C\u50CD\u3044\u3066\u3044\u308B\u3042\u3044\u3060\u3001\u7956\u6BCD\u3084\u8FD1\u6240\u306E\u5BB6\u306B\u9810\u3051\u3089\u308C\u3066\u904E\u3054\u3057\u305F\u3002", when: poor, tag: "nursery" },
  { age: 3, text: () => "\u4E09\u8F2A\u8ECA\u306B\u4E57\u308C\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002" },
  // 4歳
  { age: 4, text: (_l, r) => r.pick(["\u304A\u6C17\u306B\u5165\u308A\u306E\u7D75\u672C\u3092\u3001\u4F55\u5EA6\u3082\u300C\u8AAD\u3093\u3067\u300D\u3068\u305B\u304C\u3093\u3060\u3002", "\u304A\u7D75\u304B\u304D\u306B\u5922\u4E2D\u306B\u306A\u308A\u3001\u5BB6\u306E\u58C1\u306B\u307E\u3067\u63CF\u3044\u3066\u3057\u307E\u3063\u305F\u3002", "\u6B4C\u3063\u3066\u8E0A\u308B\u306E\u304C\u5927\u597D\u304D\u306B\u306A\u3063\u305F\u3002"]) },
  { age: 4, text: () => "\u96FB\u8ECA\u3084\u8ECA\u306E\u540D\u524D\u3092\u3001\u5168\u90E8\u899A\u3048\u3066\u3057\u307E\u3063\u305F\u3002", when: (l) => !rural(l) },
  { age: 4, text: () => "\u5BB6\u306E\u5BB6\u755C\u306E\u4E16\u8A71\u3092\u3001\u898B\u3088\u3046\u898B\u307E\u306D\u3067\u624B\u4F1D\u3063\u305F\u3002", when: (l) => rural(l) && !jp(l) },
  { age: 4, text: () => "\u5BB6\u65CF\u306B\u3064\u3044\u3066\u3001\u6C34\u304F\u307F\u3084\u85AA\u62FE\u3044\u3092\u624B\u4F1D\u3044\u306F\u3058\u3081\u305F\u3002", when: (l) => poor(l) && rural(l) },
  { age: 4, text: (_l, r) => r.pick(["\u53CB\u3060\u3061\u3068\u3051\u3093\u304B\u3057\u3066\u3001\u521D\u3081\u3066\u300C\u3054\u3081\u3093\u306D\u300D\u3092\u8A00\u3048\u305F\u3002", "\u4EF2\u3088\u3057\u306E\u53CB\u3060\u3061\u304C\u3067\u304D\u305F\u3002\u6BCE\u65E5\u3044\u3063\u3057\u3087\u306B\u904A\u3093\u3060\u3002", "\u521D\u3081\u3066\u304A\u3064\u304B\u3044\u306B\u884C\u304D\u3001\u30D1\u30F3\u3092\u8CB7\u3063\u3066\u3053\u3089\u308C\u305F\u3002"]) },
  // 5歳
  { age: 5, text: () => "\u4E03\u4E94\u4E09\u306E\u304A\u795D\u3044\u3067\u3001\u306F\u304B\u307E\u3092\u7740\u3066\u5199\u771F\u3092\u64AE\u3063\u305F\u3002", when: (l) => jp(l) && !girl(l), rite: 0.75 },
  { age: 5, text: (_l, r) => r.pick(["\u5C0F\u5B66\u6821\u306E\u5165\u5B66\u3092\u524D\u306B\u3001\u30E9\u30F3\u30C9\u30BB\u30EB\u3092\u8CB7\u3063\u3066\u3082\u3089\u3063\u305F\u3002", "\u7956\u7236\u6BCD\u304B\u3089\u30E9\u30F3\u30C9\u30BB\u30EB\u3092\u8D08\u3063\u3066\u3082\u3089\u3063\u305F\u3002\u4F55\u5EA6\u3082\u80CC\u8CA0\u3063\u3066\u307F\u305F\u3002"]), when: jp, rite: 1 },
  { age: 5, text: () => "\u3072\u3089\u304C\u306A\u304C\u8AAD\u3081\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", when: jp },
  { age: 5, text: () => "\u521D\u3081\u3066\u306E\u904B\u52D5\u4F1A\u3067\u3001\u304B\u3051\u3063\u3053\u3092\u8D70\u308A\u304D\u3063\u305F\u3002", when: jp },
  { age: 5, text: () => "\u5C0F\u5B66\u6821\u306B\u5165\u308B\u524D\u306B\u3001\u6587\u5B57\u3084\u6570\u3092\u899A\u3048\u306F\u3058\u3081\u305F\u3002", when: (l) => !jp(l) && l.D.iso3 !== "GBR" },
  // イギリスは4歳で小学校の準備クラスに入る（rites.ts）
  { age: 5, text: (_l, r) => r.pick(["\u88DC\u52A9\u8F2A\u306A\u3057\u3067\u81EA\u8EE2\u8ECA\u306B\u4E57\u308C\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u9244\u68D2\u306E\u524D\u56DE\u308A\u304C\u3067\u304D\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u521D\u3081\u3066\u6B6F\u304C\u629C\u3051\u305F\u3002"]) }
];
function earlyEvents(l, r) {
  const a = l.age;
  const rites = (RITES[l.D.iso3] ?? []).filter((x) => x.age === a && r.chance(x.p));
  while (rites.length > 2) rites.splice(Math.floor(r.next() * rites.length), 1);
  const tags = new Set(rites.map((x) => x.tag).filter(Boolean));
  const ok = EARLY.filter((e) => e.age === a && (!e.when || e.when(l)) && !(e.tag && tags.has(e.tag)));
  const fixed = ok.filter((e) => e.rite !== void 0 && r.chance(e.rite));
  const rest = ok.filter((e) => e.rite === void 0);
  const out = [...rites.map((x) => r.pick(x.texts)), ...fixed.map((e) => e.text(l, r))];
  const nFixed = rites.length + fixed.length;
  let n = Math.max(0, r.int(1, 2) - nFixed);
  if (nFixed && n === 0 && r.chance(0.5)) n = 1;
  while (n-- > 0 && rest.length) out.push(rest.splice(Math.floor(r.next() * rest.length), 1)[0].text(l, r));
  return out;
}

// src/engine/sim.ts
var MAX_AGE = 110;
var BIRTH_YEAR = 2026;
function kidFemale(seed, i) {
  const key = seed + "kid" + i;
  let h = 2166136261;
  for (let j = 0; j < key.length; j++) h = Math.imul(h ^ key.charCodeAt(j), 16777619);
  return (h >>> 0) % 2 === 0;
}
var CAUSE_LABEL = {
  accident: "\u4E0D\u616E\u306E\u4E8B\u6545",
  cancer: "\u304C\u3093",
  heart: "\u5FC3\u75BE\u60A3",
  stroke: "\u8133\u8840\u7BA1\u75BE\u60A3",
  senility: "\u8001\u8870",
  pneumonia: "\u80BA\u708E",
  other: "\u305D\u306E\u4ED6\u306E\u75C5\u6C17"
};
var BAND_MORTALITY = { low: 1.15, lower_mid: 1.06, mid: 1, upper_mid: 0.93, high: 0.86 };
var BAND_DROPOUT = { low: 2.6, lower_mid: 1.5, mid: 1, upper_mid: 0.7, high: 0.5 };
var BAND_INHERIT = {
  low: { p: 0.25, mult: 0.25 },
  lower_mid: { p: 0.45, mult: 0.5 },
  mid: { p: 0.6, mult: 1 },
  upper_mid: { p: 0.75, mult: 1.8 },
  high: { p: 0.9, mult: 3.5 }
};
var REGION_LIVING = { tokyo: 1.08, osaka: 1, nagoya: 1, city: 0.97, rural: 0.93 };
var REGION_HOUSE = { tokyo: 1, osaka: 0.8, nagoya: 0.78, city: 0.7, rural: 0.58 };
var REGION_CAR = { tokyo: 0.25, osaka: 0.45, nagoya: 0.8, city: 0.85, rural: 0.95 };
function yen2(n) {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1e8) return `${sign}${(a / 1e8).toFixed(a >= 1e9 ? 1 : 2)}\u5104\u5186`;
  if (a >= 1e4) return `${sign}${Math.round(a / 1e4).toLocaleString("ja-JP")}\u4E07\u5186`;
  return `${sign}${Math.round(a).toLocaleString("ja-JP")}\u5186`;
}
var Life = class {
  constructor(seed, country = JAPAN, mode = "j", birthYear = BIRTH_YEAR, heir) {
    this.age = 0;
    this.dead = false;
    this.deathCause = "";
    this.pending = null;
    this.records = [];
    this.choiceLog = [];
    /** お金の振り分け（25〜60歳、5年に一度決める。決めるまでは null で、今までどおり余ったお金は貯金になる） */
    this.alloc = null;
    /** 去年の「自由に使えるお金」（手取りから、出ていったお金を引いた残り） */
    this.lastFree = 0;
    /** 自分の学びに回したお金のたまり（一定の額ごとに、給料が上がるかどうかが決まる） */
    this.selfFund = 0;
    /** 振り分けの「自分」で給料が上がった回数（一生で3回まで） */
    this.selfRaises = 0;
    /** きょうだい一人ずつ。born は本人が何歳のときに生まれたか（兄姉はマイナス） */
    this.sibs = [];
    // 学校と仕事
    this.school = "child";
    this.schoolEnd = 15;
    this.edu = "junior_high";
    this.job = "none";
    this.jobStart = 0;
    this.careerMult = 1;
    this.regularYears = 0;
    this.workYears = 0;
    this.unemployedUntil = -1;
    this.manager = false;
    this.founderYear = -1;
    this.founderBig = false;
    this.retireAge = 65;
    this.postRetireWork = false;
    this.pensionStart = 65;
    this.pensionMult = 1;
    this.lastRegularWage = 0;
    // 家族と住まい
    this.partner = null;
    this.partnerSince = -1;
    this.marriageBoostUntil = -1;
    this.marriageBoost = 1;
    this.noMarry = false;
    /** 結婚のしかた（自分で見つける／縁談／許嫁）。国の割合で生まれたときに決まる */
    this.marriageMode = "love";
    /** 縁談や許嫁との結婚の話が来る年齢 */
    this.arrangedAge = 25;
    /** この年齢までは結婚の話が来ない（「まだ結婚しない」を選んだあとなど） */
    this.marriageDelayUntil = -1;
    /** 恋人と付き合っている（結婚の前の段階） */
    this.dating = false;
    this.datingSince = -1;
    this.kids = [];
    /** パートナーが亡くなった年（一緒になった年 → 亡くなった年。どちらも自分の年齢） */
    this.partnerDeaths = {};
    /** 前の代から受け継いだもの（1代目は null） */
    this.heir = null;
    /** 親から受け継いだお金 */
    this.inherited = 0;
    /** 親が残した家のうち自分の分（住むか売るかを決めるまで持っておく） */
    this.heldHouse = 0;
    /** 実家から通って働いている間、「そろそろ家を出る？」と考えるのはこの年齢から */
    this.leaveAskAfter = 0;
    this.home = "parents";
    this.loan = 0;
    this.loanAnnual = 0;
    this.housePrice = 0;
    this.coLiveParents = false;
    // お金
    this.cash = 0;
    this.invest = 0;
    this.investStyle = "none";
    this.investRate = 0;
    this.scholarship = 0;
    this.scholarshipAnnual = 0;
    this.selfStudyUntil = -1;
    // 健康
    this.cancerAge = -100;
    this.illMult = 1;
    this.selfCare = false;
    this.frugal = false;
    // 親の介護
    this.careMode = "";
    this.careUntil = -1;
    this.careTriggered = false;
    this.cur = null;
    this.keepHouseCost = false;
    this.preIncome = {};
    this.preExpense = {};
    this.boughtAge = 0;
    this.ownedBefore = false;
    this.welfare = false;
    this.tight = false;
    this.reverseMortgage = false;
    /** 出来事がきっかけで出る選択場面の待ち行列 */
    this.sceneQueue = [];
    // 家族計画・夫婦関係
    this.kidsPlan = "undecided";
    this.kidsFrom = 0;
    this.infertile = false;
    this.naturalHope = false;
    this.strained = false;
    this.dvOngoing = false;
    this.dvHappened = false;
    /** 1年あたり、パートナーからの暴力が始まる確率の目安（国の統計から設定） */
    this.ipvRate = 4e-3;
    /** ドルや金で貯めている（物価の暴騰に強い） */
    this.protectCash = false;
    this.inflationNoticed = false;
    /** 今年の物価の動きを借りている、その国の過去の年（data/world/cpi_annual.json）。null はまだ選んでいない */
    this.inflSrcYear = null;
    /** 直近の1年の物価上昇率（割合） */
    this.lastInflation = 0;
    /** 物価の激しい上昇（年25%以上）が続いている年数と、借りている過去の最初の年 */
    this.inflSpell = 0;
    this.inflSpellFrom = 0;
    /** 一度起きた「国ごとの出来事」 */
    this.usedEvents = /* @__PURE__ */ new Set();
    /** 暮らしに困ったとき、国の給付を受けられた（親戚の援助ではなく） */
    this.publicAid = false;
    /** 子どものうちから家の仕事や外の仕事で働いた（児童労働） */
    this.childWorked = false;
    /** 学校に行けない時期があった年齢（日本、不登校）。-1 はなし */
    this.futokoAge = -1;
    /** お酒がやめられなくなった */
    this.alcoholProblem = false;
    /** 銀行やモバイルマネーの口座を持っている（ない人は貯金に利息がつかず、投資もできない） */
    this.banked = true;
    /** 自己破産した年齢。-1 はなし */
    this.bankruptAge = -1;
    this.bankruptAsked = false;
    /** 次に小さな選択を出す年齢 */
    this.nextMicro = 6;
    /** 小さな選択ごとの、最後に出た年齢 */
    this.usedMicro = /* @__PURE__ */ new Map();
    // 小さな選択がもたらす状態
    this.social = 0;
    this.familyHelped = false;
    this.abroad = false;
    this.abroadUntil = -1;
    this.sideIncome = 0;
    this.gymUntil = -1;
    this.insured = false;
    this.cramUntil = -1;
    this.parentDebt = false;
    this.repairLater = false;
    this.earlyCheckUntil = -1;
    this.prepaidFuneral = false;
    this.seniorWorkUntil = -1;
    /** 選択前後に起きた出来事を、その年の記録に入れるためのバッファ */
    this.preEvents = [];
    /** 前にその知らせを出した年齢。within 年以内に出していれば true（「また」をつけるため） */
    this.saidAt = /* @__PURE__ */ new Map();
    /** 章のまとめで「同い年の人と比べる」ための出来事の印（[印, 年齢]）。乱数や記録には影響しない */
    this.tags = [];
    this.hsGraduated = false;
    this.privateUni = false;
    this.childSupport = false;
    /** 車を初めて買った年齢（持っていなければ -1） */
    this.carSince = -1;
    this.widowed = false;
    this._kidsTarget = -1;
    this.careParent = 0;
    this.pensionCovered = null;
    this.seed = seed;
    this.D = country;
    this.mode = mode;
    this.birthYear = birthYear;
    const r = this.rng("birth", 0);
    this.sex = r.chance(0.512) ? "male" : "female";
    const regions = this.D.household.regions;
    this.region = r.weighted(regions, regions.map((x) => x.birthShare));
    const bands = this.D.household.incomeBandsWithChildren;
    this.band = r.weighted(bands, bands.map((b) => b.share));
    if (heir) {
      this.heir = heir;
      this.sex = heir.sex;
      this.region = regions.find((x) => x.id === heir.regionId) ?? this.region;
      this.band = bands.find((b) => b.id === heir.bandId) ?? this.band;
    }
    const bandIdx = bands.indexOf(this.band);
    this.aptitude = Math.min(1, Math.max(0, r.normal(0.42 + bandIdx * 0.04, 0.22) + (heir?.eduBoost ?? 0)));
    this.thrift = r.range(0.88, 1.22);
    const tfr = this.D.inst?.tfr ?? 1.9;
    this.siblings = tfr < 2.2 ? r.weighted([0, 1, 2], [0.22, 0.55, 0.23]) : Math.min(7, Math.max(0, Math.round(r.normal(tfr - 1, 1.3))));
    this.lottery = r.chance(this.D.ev.lotteryParticipationRate);
    this.parents = [
      { age: Math.round(r.normal(33 - (this.D.inst?.marriageAgeShift.male ?? 0), 4.5)), alive: true },
      { age: Math.max(17, Math.round(r.normal(31.5 - (this.D.inst?.marriageAgeShift.female ?? 0), 4))), alive: true }
    ];
    this.sibs = this.makeSiblings();
    if (heir) {
      this.parents = [
        { age: heir.parentAges[0], alive: true },
        { age: heir.parentAges[1], alive: true }
      ];
      this.sibs = heir.sibs.map((x) => ({ ...x }));
      this.siblings = this.sibs.length;
    }
    this.ipvRate = ipvHazard(this.D.iso3, this.sex);
    const mr = this.rng("marriageMode", 0);
    this.marriageMode = drawMarriageMode(this.D.iso3, mr);
    const smam = (this.sex === "male" ? 31.1 : 29.7) - (this.D.inst?.marriageAgeShift[this.sex] ?? 0);
    this.arrangedAge = Math.max(18, Math.round(mr.normal(smam - 1.5, 2)));
  }
  /** きょうだいを兄姉と弟妹に振り分ける。母の年齢（17〜44歳で出産）に収まるようにする */
  makeSiblings() {
    const r = this.rng("sib", 0);
    const mother = this.parents[1].age;
    const out = [];
    let older = 0;
    let younger = 0;
    for (let i = 0; i < this.siblings; i++) {
      const sex = r.chance(0.512) ? "male" : "female";
      const gap = Math.max(1, Math.round(r.normal(3, 1.4)));
      const canOlder = mother - (older + gap) >= 17;
      const canYounger = mother + younger + gap <= 44;
      const goOlder = canOlder && (!canYounger || r.chance(0.5));
      if (goOlder) {
        older += gap;
        out.push({ sex, born: -older });
      } else if (canYounger) {
        younger += gap;
        out.push({ sex, born: younger });
      }
    }
    this.siblings = out.length;
    return out.sort((a, b) => a.born - b.born);
  }
  /** いま一緒にいるきょうだいの数（まだ生まれていない弟妹は数えない） */
  get siblingsNow() {
    return this.sibs.filter((x) => x.born <= this.age).length;
  }
  /** いま一緒に暮らしている家族（自分を含む）。実家にいる間は親ときょうだい、家を出たあとはパートナーと巣立つ前の子ども */
  get household() {
    const a = this.age;
    const out = ["\u81EA\u5206"];
    const p = this.partner;
    if (p && p.alive) out.push(p.sex === "male" ? "\u592B" : "\u59BB");
    const kidsHome = this.kids.filter((k) => kidShownHome(this, k, a)).length;
    if (kidsHome) out.push(`\u5B50\u3069\u3082${kidsHome}\u4EBA`);
    if (this.home === "parents") {
      if (this.parents[0].alive) out.push("\u7236");
      if (this.parents[1].alive) out.push("\u6BCD");
      const counts = /* @__PURE__ */ new Map();
      for (const x of this.sibs) {
        const sa = a - x.born;
        if (x.born > a || sa >= 22) continue;
        const w = x.born < 0 ? x.sex === "male" ? "\u5144" : "\u59C9" : x.sex === "male" ? "\u5F1F" : "\u59B9";
        counts.set(w, (counts.get(w) ?? 0) + 1);
      }
      for (const w of ["\u5144", "\u59C9", "\u5F1F", "\u59B9"]) {
        const n = counts.get(w);
        if (n) out.push(n > 1 ? `${w}${n}\u4EBA` : w);
      }
    }
    return out;
  }
  /** household の人数 */
  get householdSize() {
    return this.household.reduce((t, w) => t + (/(\d+)人$/.test(w) ? Number(/(\d+)人$/.exec(w)[1]) : 1), 0);
  }
  /** 円で考えた金額を、この国の通貨の目安に直す */
  y(n) {
    return n * this.D.k;
  }
  rng(stream, age = this.age) {
    return streamRng(this.seed, stream, age);
  }
  /** 地域の係数。日本は地域ごとの表、他の国は都市部か農村部かで決める */
  regionFactor(map, urban, rural2) {
    if (this.D.isJapan) return map[this.region.id] ?? 1;
    return this.region.urban ? urban : rural2;
  }
  get year() {
    return this.birthYear + this.age;
  }
  /** 純資産：金融資産 − 負債 ＋ 持ち家の評価額（古くなるほど下がる） */
  get balance() {
    return this.cash + this.invest - this.loan - this.scholarship + this.homeValue + this.heldHouse;
  }
  get homeValue() {
    if (this.home !== "own" && !this.ownedBefore) return 0;
    const yrs = this.age - this.boughtAge;
    return this.housePrice * Math.max(0.25, 1 - yrs * 0.02);
  }
  get regionLabel() {
    return this.region.label;
  }
  get bandIdx() {
    return this.D.household.incomeBandsWithChildren.indexOf(this.band);
  }
  // ───────────────────────── 進行 ─────────────────────────
  /** 1年進める。選択が必要なら pending をセットして null を返す。 */
  advance() {
    if (this.dead) return null;
    if (this.pending) return null;
    const due = this.dueChoice();
    if (due) {
      this.pending = due;
      return null;
    }
    this.simulateYear();
    const rec = this.cur;
    this.cur = null;
    this.records.push(rec);
    if (!this.dead) this.age++;
    return rec;
  }
  /** お金の振り分けを決める（割合は10%きざみ、合計10） */
  chooseAlloc(al, optionId = "custom") {
    const c = this.pending;
    if (!c || !c.alloc) throw new Error("\u632F\u308A\u5206\u3051\u306E\u5834\u9762\u3067\u306F\u3042\u308A\u307E\u305B\u3093");
    let v = normAlloc(al);
    if (!this.banked && v.invest) v = noInvestAlloc(v);
    this.pending = null;
    const label = allocLabel(v);
    this.choiceLog.push({ id: "alloc", optionId, label, age: this.age, pickIndex: -1, alloc: v });
    this.preEvents.push({ age: this.age, kind: "choice", text: `\u3010\u9078\u629E\u3011\u304A\u91D1\u306E\u632F\u308A\u5206\u3051\uFF1A${label}`, major: false });
    this.alloc = v;
  }
  choose(optionId) {
    const c = this.pending;
    if (!c) throw new Error("\u9078\u629E\u5834\u9762\u3067\u306F\u3042\u308A\u307E\u305B\u3093");
    if (c.alloc) {
      const i = c.options.findIndex((o) => o.id === optionId);
      if (i < 0) throw new Error(`\u4E0D\u660E\u306A\u9078\u629E\u80A2: ${optionId}`);
      return this.chooseAlloc(optionId === "same" && c.alloc.last ? c.alloc.last : c.alloc.presets[i], optionId);
    }
    const opt2 = c.options.find((o) => o.id === optionId);
    if (!opt2) throw new Error(`\u4E0D\u660E\u306A\u9078\u629E\u80A2: ${optionId}`);
    this.pending = null;
    this.choiceLog.push({ id: c.id, optionId, label: opt2.label, age: this.age, pickIndex: c.options.indexOf(opt2) });
    const micro = c.id.startsWith("micro:");
    this.preEvents.push({ age: this.age, kind: "choice", text: `\u3010\u9078\u629E\u3011${c.title}\uFF1A${opt2.label}`, major: !micro });
    if (c.id.startsWith("ev:")) {
      const sc = this.sceneQueue.shift();
      sc.options.find((o) => o.id === optionId).apply(this, this.rng("c:" + c.id));
    } else if (micro) {
      const m = MICROS.find((x) => "micro:" + x.id === c.id);
      this.usedMicro.set(m.id, this.age);
      m.options.find((o) => o.id === optionId).apply(this, this.rng("c:" + c.id));
    } else applyChoice(this, c.id, optionId, this.rng("c:" + c.id));
  }
  queueScene(sc) {
    if (!this.sceneQueue.some((x) => x.id === sc.id)) this.sceneQueue.push(sc);
  }
  /** 離婚する。財産を分け、子どもがいれば養育費などが続く */
  divorce(r, text, dv = false) {
    const a = this.age;
    const share = Math.max(0, this.cash) * 0.5;
    this.log("family", text, -share, true);
    this.mark("divorce");
    this.spend("events", share);
    if (this.kids.some((k) => a - k.born < 18) && this.sex === "male") this.childSupport = true;
    else if (this.kids.some((k) => a - k.born < 18)) this.singleParentNote();
    this.partner = null;
    this.strained = false;
    this.dvOngoing = false;
    this.noMarry = r.chance(dv ? 0.7 : 0.5);
  }
  microReady(id, repeat) {
    const last = this.usedMicro.get(id);
    return last === void 0 || !!repeat && this.age - last >= 10;
  }
  microChoice() {
    const a = this.age;
    if (a < this.nextMicro || this.choiceLog.some((c) => c.age === a)) return null;
    const r = this.rng("micro");
    const pool = MICROS.filter((m2) => a >= m2.min && a <= m2.max && this.microReady(m2.id, m2.repeat) && (!m2.when || m2.when(this)));
    if (!pool.length) {
      this.nextMicro = a + 1;
      return null;
    }
    const m = r.weighted(pool, pool.map((x) => 1 / (1 + Math.max(0, x.max - a) * 0.15)));
    this.nextMicro = a + r.int(2, 3);
    return {
      id: `micro:${m.id}`,
      age: a,
      title: m.titleOf?.(this) ?? m.title,
      situation: m.situation(this),
      options: m.options.filter((o) => !o.when || o.when(this)).map((o) => ({ id: o.id, label: o.labelOf?.(this) ?? o.label, desc: o.descOf?.(this) ?? o.desc }))
    };
  }
  made(id) {
    return this.choiceLog.some((c) => c.id === id);
  }
  dueChoice() {
    const a = this.age;
    if (!this.made("afterJHS") && a === 15) return buildChoice(this, "afterJHS");
    if (!this.made("afterHS") && this.made("afterJHS")) {
      const kosenDone = this.school === "kosen" && a === this.schoolEnd;
      const hsDone = (this.school === "hs" || this.school === "hs_night") && a >= this.schoolEnd;
      const working18 = this.school === "done" && a === 18;
      if (kosenDone || hsDone || working18) return buildChoice(this, "afterHS");
    }
    if (!this.made("firstJob") && this.school === "done" && this.job === "none" && a >= 15 && this.made("afterJHS"))
      return buildChoice(this, "firstJob");
    if (!this.made("invest") && a >= 25 && this.made("firstJob")) return buildChoice(this, "invest");
    if (!this.made("marriageHome") && a >= 30 && this.made("invest")) return buildChoice(this, "marriageHome");
    if (!this.made("careerShift") && a >= 38 && this.made("marriageHome")) return buildChoice(this, "careerShift");
    if (!this.made("parentCare") && this.made("careerShift") && (this.careTriggered || a >= 58))
      return buildChoice(this, "parentCare");
    if (!this.made("retire") && a >= 60 && this.made("parentCare")) return buildChoice(this, "retire");
    if (a >= 25 && a <= 60 && a % 5 === 0 && this.school === "done" && !this.choiceLog.some((c) => c.id === "alloc" && c.age === a)) return allocChoice(this);
    while (this.sceneQueue.length && (this.partner && ["meet", "propose", "arranged", "betrothed"].includes(this.sceneQueue[0].id) || this.sceneQueue[0].stillValid?.(this) === false)) this.sceneQueue.shift();
    const sc = this.sceneQueue[0];
    if (sc)
      return {
        id: `ev:${sc.id}`,
        age: a,
        title: sc.title,
        situation: sc.situationOf?.(this) ?? sc.situation,
        options: sc.options.map(({ id, label, desc }) => ({ id, label, desc }))
      };
    return this.microChoice();
  }
  // ───────────────────────── 1年の計算 ─────────────────────────
  simulateYear() {
    const a = this.age;
    this.cur = { age: a, year: this.year, income: this.preIncome, expense: this.preExpense, balance: 0, invested: 0, debt: 0, events: this.preEvents };
    this.preEvents = [];
    this.preIncome = {};
    this.preExpense = {};
    if (a === 0) this.birthEvents();
    if (a <= 6) for (const t of earlyEvents(this, this.rng("early"))) this.log("life", t);
    const r = this.rng("year");
    this.schoolYear(r);
    this.familyYear(r);
    this.workYear(r);
    this.parentsYear(r);
    this.healthYear(r);
    this.luckYear(r);
    riskYear(this, this.rng("risk"));
    this.moneyYear(r);
    this.mortality();
    if (!this.dead) {
      const sc = countryEventScene(this, this.rng("cevent"));
      if (sc) this.queueScene(sc);
    }
    const c = this.cur;
    c.balance = Math.round(this.balance);
    c.invested = Math.round(this.invest);
    c.debt = Math.round(this.loan + this.scholarship);
  }
  /** 乱数を使わずに言い回しを選ぶ（同じ文ばかりにならないように）。記録の中身や共有URLには影響しない */
  vary(key, lines) {
    return lines[hashStr(`${this.seed}|${key}|${this.age}`) % lines.length];
  }
  again(key, within) {
    const p = this.saidAt.get(key);
    this.saidAt.set(key, this.age);
    return p !== void 0 && this.age - p <= within;
  }
  mark(tag) {
    this.tags.push([tag, this.age]);
  }
  log(kind, text, amount, major = false) {
    this.cur ? this.cur.events.push({ age: this.age, kind, text, amount, major }) : this.preEvents.push({ age: this.age, kind, text, amount, major });
  }
  /** 選択の直後（年の計算前）用 */
  logPre(kind, text, amount, major = false) {
    this.preEvents.push({ age: this.age, kind, text, amount, major });
  }
  addIncome(cat, v) {
    if (!isFinite(v) || v === 0) return;
    const t = this.cur ? this.cur.income : this.preIncome;
    t[cat] = (t[cat] ?? 0) + v;
    this.cash += v;
  }
  spend(cat, v) {
    if (!isFinite(v) || v <= 0) return;
    if (cat === "medical" && this.D.inst) v *= this.D.inst.medicalBurden;
    if (cat === "medical" && this.insured && v > this.y(2e5)) v *= 0.5;
    const t = this.cur ? this.cur.expense : this.preExpense;
    t[cat] = (t[cat] ?? 0) + v;
    this.cash -= v;
  }
  birthEvents() {
    const s = this.sex === "male" ? "\u7537\u306E\u5B50" : "\u5973\u306E\u5B50";
    const h = this.heir;
    if (h) this.log("life", `${this.year}\u5E74\u3001${this.region.label}\u306B\u3001${h.gen - 1}\u4EE3\u76EE\u306E\u3042\u306A\u305F\u306E${h.nth}\uFF08${s}\uFF09\u3068\u3057\u3066\u751F\u307E\u308C\u305F\u3002${this.bandSentence()}`, void 0, true);
    else this.log("life", `${this.year}\u5E74\u3001${this.region.label}\u306B${s}\u3068\u3057\u3066\u751F\u307E\u308C\u305F\u3002${this.bandSentence()}`, void 0, true);
    if (h && (h.eduBoost ?? 0) >= 0.03) this.log("family", `${h.gen - 1}\u4EE3\u76EE\u306E\u3042\u306A\u305F\u306F\u3001\u6559\u80B2\u306E\u305F\u3081\u306E\u304A\u91D1\u3092\u7528\u610F\u3057\u3066\u304F\u308C\u3066\u3044\u305F\u3002`, void 0, true);
    const olders = this.sibs.filter((x) => x.born < 0).sort((a, b) => a.born - b.born);
    const group = (sex, word) => {
      const g = olders.filter((x) => x.sex === sex);
      if (!g.length) return "";
      return g.length === 1 ? `${word}\uFF08${-g[0].born}\u6B73\uFF09` : `${word}${g.length}\u4EBA\uFF08${g.map((x) => `${-x.born}\u6B73`).join("\u30FB")}\uFF09`;
    };
    const words = [group("male", "\u5144"), group("female", "\u59C9")].filter(Boolean);
    if (words.length) this.log("family", `\u5BB6\u306B\u306F${words.join("\u3068\u3001")}\u304C\u3044\u308B\u3002`);
  }
  /** 生まれた家庭の年収の文（日本は「家庭の年収は400万円未満。」、ほかの国は「ふつうの家庭で、年収は約30万ペソ。」） */
  bandSentence() {
    const m = /^(.*?)（年収 (.*)）$/.exec(this.band.label);
    if (m) return `${m[1]}\u3067\u3001\u5E74\u53CE\u306F${m[2]}\u3002`;
    return `\u5BB6\u5EAD\u306E\u5E74\u53CE\u306F${this.band.label.replace(/^年収/, "")}\u3002`;
  }
  schoolYear(r) {
    const a = this.age;
    if (a === 6) this.log("school", "\u5C0F\u5B66\u6821\u306B\u5165\u5B66\u3057\u305F\u3002");
    if (a === 12) this.log("school", "\u4E2D\u5B66\u6821\u306B\u5165\u5B66\u3057\u305F\u3002");
    this.childhoodYear();
    if (this.school === "child" || this.school === "done") return;
    const drop = BAND_DROPOUT[this.band.id] ?? 1;
    if (this.school === "hs_night" || this.school === "univ_night") {
      this.addIncome("salary", this.D.nonRegularWage(this.sex, Math.max(a, 20)) * 0.65 * this.region.wageIndex);
    } else if (this.school === "univ_work") {
      this.addIncome("salary", this.y(9e5) * this.region.wageIndex);
    } else if ((this.school === "univ" || this.school === "vocational" || this.school === "grad") && r.chance(0.7)) {
      this.addIncome("salary", r.range(this.y(3e5), this.y(9e5)));
    }
    if (this.school === "univ_night") this.spend("selfEdu", this.y(6e5));
    if (this.school === "univ_work") {
      const loan = this.y(12e5);
      this.scholarship += loan;
      this.cash += loan;
      this.spend("selfEdu", this.privateUni ? this.y(13e5) : this.y(7e5));
      this.spend("other", this.y(7e5));
    }
    let pDrop = 0;
    if (this.school === "hs" || this.school === "hs_night" || this.school === "kosen")
      pDrop = this.D.education.highSchoolDropoutRate * drop * (this.school === "hs_night" ? 4 : 1);
    if (this.school === "univ" || this.school === "univ_work" || this.school === "univ_night" || this.school === "vocational")
      pDrop = this.D.education.universityDropoutRate / 4 * drop * (this.school === "univ_work" ? 1.8 : this.school === "univ_night" ? 2.5 : 1);
    if (r.chance(pDrop)) {
      const famReason = r.chance(Math.min(0.75, 0.25 * drop));
      const what = this.schoolName();
      this.log("school", famReason ? `\u5BB6\u306E\u4E8B\u60C5\u3067${what}\u3092\u4E2D\u9000\u3057\u305F\u3002` : `${what}\u304C\u5408\u308F\u305A\u4E2D\u9000\u3057\u305F\u3002`, void 0, true);
      this.school = "done";
      this.schoolEnd = a;
      if (this.job === "none" && this.made("firstJob")) this.job = "nonregular";
      return;
    }
    if (a + 1 >= this.schoolEnd) {
      const what = this.schoolName();
      const next = {
        hs: "high_school",
        hs_night: "high_school",
        kosen: "vocational",
        vocational: "vocational",
        univ: "university",
        univ_work: "university",
        univ_night: "university",
        grad: "graduate"
      };
      this.edu = next[this.school] ?? this.edu;
      this.log("school", `${what}\u3092\u5352\u696D\u3057\u305F\u3002`);
      if ((this.school === "univ" || this.school === "univ_work") && r.chance(this.D.education.graduateSchoolEntryRate * (0.6 + this.aptitude))) {
        this.school = "grad";
        this.schoolEnd = a + 3;
        this.log("school", "\u5927\u5B66\u9662\u306B\u9032\u3093\u3060\u3002", void 0, true);
        return;
      }
      if (this.school === "univ_work" || this.school === "univ_night" || this.school === "grad") {
        if (this.scholarship > 0) this.scholarshipAnnual = this.scholarship / 15;
      }
      if (this.school === "hs" || this.school === "hs_night" || this.school === "kosen") {
        this.school = this.school === "kosen" ? "kosen" : this.school;
        this.schoolEnd = a + 1;
        this.hsGraduated = true;
        return;
      }
      this.school = "done";
      this.schoolEnd = a + 1;
    }
  }
  schoolName() {
    return {
      hs: "\u9AD8\u6821",
      hs_night: "\u5B9A\u6642\u5236\u9AD8\u6821",
      kosen: "\u9AD8\u5C02",
      vocational: "\u5C02\u9580\u5B66\u6821",
      univ: "\u5927\u5B66",
      univ_work: "\u5927\u5B66",
      univ_night: "\u591C\u9593\u306E\u5927\u5B66",
      grad: "\u5927\u5B66\u9662",
      child: "\u5B66\u6821",
      done: "\u5B66\u6821"
    }[this.school];
  }
  // ── 家族
  familyYear(r) {
    const a = this.age;
    for (const x of this.sibs) if (x.born === a && a > 0) this.log("family", `${x.sex === "male" ? "\u5F1F" : "\u59B9"}\u304C\u751F\u307E\u308C\u305F\u3002`, void 0, true);
    if (this.marriageMode === "betrothed" && a === 10) this.log("family", "\u89AA\u3069\u3046\u3057\u306E\u7D04\u675F\u3067\u3001\u5C06\u6765\u7D50\u5A5A\u3059\u308B\u76F8\u624B\uFF08\u8A31\u5AC1\uFF09\u304C\u6C7A\u307E\u3063\u305F\u3002", void 0, true);
    const p = this.partner;
    if (p && p.alive) {
      p.age++;
      const maxKids = Math.max(this.kidsPlan === "want" ? 1 : 0, this.kidsTarget(r));
      const motherAge = this.sex === "female" ? a : p.age;
      if (this.kidsPlan === "later" && a >= this.kidsFrom) this.queueScene(kidsAgainScene());
      if (this.kidsPlan === "want" && this.infertile && !this.naturalHope && a === this.kidsFrom + 2) this.queueScene(fertilityScene(this));
      if (this.naturalHope && this.infertile && r.chance(0.12)) this.infertile = false;
      const canHave = this.kidsPlan === "want" && !this.infertile && a >= this.kidsFrom;
      if (canHave && this.kids.length < maxKids && motherAge >= 18 && motherAge <= 44 && r.chance(0.32 - Math.max(0, motherAge - 35) * 0.035)) {
        const kr = this.rng("kid" + this.kids.length);
        const hh = this.householdIncomeGuess();
        const kid = {
          born: a,
          privateSchool: kr.chance(hh > this.y(1e7) ? 0.45 : hh > this.y(7e6) ? 0.15 : 0.05),
          univ: kr.chance(this.D.univRateForIncome(hh)),
          away: kr.chance(0.4),
          otherAge: p.age,
          otherSince: this.partnerSince
        };
        this.kids.push(kid);
        const nth = ["\u7B2C\u4E00\u5B50", "\u7B2C\u4E8C\u5B50", "\u7B2C\u4E09\u5B50", "\u7B2C\u56DB\u5B50"][this.kids.length - 1] ?? "\u5B50\u3069\u3082";
        this.log("family", `${nth}\u304C\u751F\u307E\u308C\u305F\u3002` + (this.kids.length === 1 ? this.birthRiskNote() : ""), -this.D.living.childbirthNetCost, this.kids.length === 1);
        this.spend("kids", this.D.living.childbirthNetCost);
        if (this.sex === "female" && (this.job === "big" || this.job === "sme" || this.job === "civil") && r.chance(0.3)) {
          this.log("work", "\u51FA\u7523\u3092\u6A5F\u306B\u4ED5\u4E8B\u3092\u8F9E\u3081\u305F\u3002", void 0, true);
          this.job = "none";
          this.unemployedUntil = a + 3;
        }
      }
      const pStrain = this.D.ev.divorceRateAnnual * (a - this.partnerSince < 10 ? 1.4 : 0.7) * 2.2;
      if (this.strained && r.chance(0.35)) {
        this.divorce(r, "\u8A71\u3057\u5408\u3044\u306F\u307E\u3068\u307E\u3089\u305A\u3001\u96E2\u5A5A\u3057\u305F\u3002\u8CA1\u7523\u306F\u5206\u3051\u5408\u3063\u305F\u3002");
      } else if (!this.strained && r.chance(pStrain)) {
        this.queueScene(strainScene(this));
      } else if (!this.dvHappened && r.chance(this.ipvRate)) {
        this.dvHappened = true;
        this.queueScene(dvScene(this));
      } else if (this.dvOngoing) {
        this.illMult = Math.min(2, this.illMult * 1.04);
        if (r.chance(0.2)) this.queueScene({ ...dvScene(this), id: "dv" });
      } else if (r.chance(this.D.qx(p.sex, p.age) * 0.9)) {
        p.alive = false;
        this.log("family", `\u30D1\u30FC\u30C8\u30CA\u30FC\u304C${p.age}\u6B73\u3067\u4EA1\u304F\u306A\u3063\u305F\u3002`, -this.D.living.funeralCost, true);
        this.mark("partnerDeath");
        this.spend("events", this.D.living.funeralCost);
        if (this.kids.some((k) => a - k.born < 18)) this.singleParentNote();
        this.widowed = true;
        this.partnerDeaths[this.partnerSince] = a;
        this.partner = null;
        this.strained = false;
        this.dvOngoing = false;
      }
    } else if (!this.partner && a >= 18 && a < 60 && a >= this.marriageDelayUntil) {
      if (!this.noMarry && this.marriageMode === "betrothed" && a >= this.arrangedAge) this.queueScene(betrothedScene(this));
      else if (!this.noMarry && this.marriageMode === "arranged" && a >= this.arrangedAge && a < 45 && !this.dating && r.chance(0.5))
        this.queueScene(arrangedScene(this));
      else if (this.dating) {
        this.spend("love", this.y(15e4));
        if (r.chance(0.12)) {
          this.dating = false;
          this.log("family", "\u604B\u4EBA\u3068\u5225\u308C\u305F\u3002");
        } else if (a - this.datingSince >= 1 && r.chance(0.55)) this.queueScene(loveScene(this));
      } else if (a >= 30 || this.school === "done" && !this.made("marriageHome")) {
        const boost = a < this.marriageBoostUntil ? this.marriageBoost : 1;
        const mode = this.marriageMode === "love" ? 4 : 0.9;
        const again = this.partnerSince >= 0 ? a >= 50 ? 0.2 : 0.45 : 1;
        if (r.chance(this.marriageHazard(a + 2) * mode * boost * again * (this.noMarry ? 0.25 : 1))) this.queueScene(meetScene(this));
      }
    }
    if (this.home === "parents" && this.school === "done" && this.job !== "none" && this.job !== "retired" && !this.partner && !this.coLiveParents) {
      if (a >= Math.max(22, this.leaveAskAfter) && a < 45 && this.cash > this.y(1e6) && r.chance(0.3)) this.queueScene(leaveHomeScene(this, true));
    }
    for (const k of this.kids) {
      const ka = a - k.born;
      const em = ka === 27 && !this.kidWithEx(k) ? emigration(this.D.iso3) : null;
      if (em && em.dest.length && streamRng(this.seed, "kidAbroad" + this.kids.indexOf(k), 0).chance(Math.min(0.15, em.share))) {
        const rr = streamRng(this.seed, "kidAbroadTo" + this.kids.indexOf(k), 0);
        let x = rr.next() * em.dest.reduce((t, [, c]) => t + c, 0);
        const to = em.dest.find(([, c]) => (x -= c) < 0)?.[0] ?? em.dest[0][0];
        k.abroad = to;
        if (k.leftAge === void 0) k.leftAge = a;
        k.stayHome = false;
        this.log("family", `${this.kidLabel(this.kids.indexOf(k))}\u304C${to}\u3078\u79FB\u308A\u4F4F\u307F\u3001\u5411\u3053\u3046\u3067\u50CD\u304D\u306F\u3058\u3081\u305F\u3002${this.D.nameJa}\u3067\u751F\u307E\u308C\u305F\u4EBA\u306E${Math.round(em.share * 1e3) / 10}%\u304C\u3001\u5916\u56FD\u3067\u66AE\u3089\u3057\u3066\u3044\u308B\u3002`, void 0, true);
        this.mark("kidAbroad");
      }
      if (ka === 22 && k.univ || ka === 18 && !k.univ) this.queueScene(kidLeaveScene(this, this.kids.indexOf(k)));
      else if (k.stayHome && k.leftAge === void 0 && ka > 18) {
        if (r.chance(0.18) || ka >= 35) {
          k.leftAge = a;
          this.log("family", `\u5B9F\u5BB6\u304B\u3089\u901A\u3063\u3066\u3044\u305F\u5B50\u3069\u3082\uFF08${ka}\u6B73\uFF09\u304C\u3001\u8CAF\u3081\u305F\u304A\u91D1\u3067\u5BB6\u3092\u51FA\u305F\u3002`);
        } else this.addIncome("windfall", this.y(36e4));
      }
    }
  }
  /** 離婚した相手のもとで暮らしている子どもか（養育費を払っている父親の、前の結婚の子ども） */
  kidWithEx(k) {
    return this.childSupport && !(this.partner?.alive && k.otherSince === this.partnerSince);
  }
  kidsTarget(r) {
    if (this._kidsTarget >= 0) return this._kidsTarget;
    const kr = this.rng("kidsTarget", 0);
    const m = this.D.inst?.tfr ?? this.D.ev.birthsPerCouple;
    this._kidsTarget = m < 2.4 ? kr.weighted([0, 1, 2, 3], [0.08, 0.2, Math.max(0.3, 0.72 - m * 0.05), Math.max(0.05, (m - 1.6) * 0.8)]) : Math.min(8, Math.max(0, Math.round(kr.normal(m * 1.05, 1.4))));
    void r;
    return this._kidsTarget;
  }
  marriageHazard(a) {
    const base = this.D.marriageHazard(a, this.sex) * (1 + Math.min(0.5, this.social));
    const stab = this.job === "nonregular" || this.job === "none" ? this.sex === "male" ? 0.6 : 1 : 1.05;
    return base * stab;
  }
  /** ceremony を省くと、式を挙げるかは半々で決まる */
  marry(r, text, ceremony) {
    const other = this.sex === "male" ? "female" : "male";
    const pAge = Math.max(18, Math.round(this.age + r.normal(this.sex === "male" ? -1.8 : 1.8, 2.5)));
    const work = other === "female" ? r.weighted(["regular", "part", "none"], [0.4, 0.38, 0.22]) : r.weighted(["regular", "part", "none"], [0.86, 0.09, 0.05]);
    const edu = r.weighted(["high_school", "vocational", "university"], [0.35, 0.25, 0.4]);
    this.partner = { sex: other, age: pAge, edu, work, alive: true };
    this.partnerSince = this.age;
    this.dating = false;
    this.noMarry = false;
    this.kidsPlan = "undecided";
    this.log("family", `${text.replace(/。$/, "")}\uFF08\u76F8\u624B\u306F${pAge}\u6B73\uFF09\u3002`, void 0, true);
    this.queueScene(kidsScene(this));
    if (ceremony ?? r.chance(0.5)) {
      const net = this.D.living.weddingCost * 0.45;
      this.spend("love", net);
      this.log("money", "\u7D50\u5A5A\u5F0F\u3092\u6319\u3052\u305F\u3002\u8CBB\u7528\u306E\u534A\u5206\u307B\u3069\u306F\u3001\u3054\u795D\u5100\u3067\u623B\u3063\u3066\u304D\u305F\u3002", -net);
    }
    if (this.home === "parents" && this.school === "done") this.home = "rent";
  }
  householdIncomeGuess() {
    return this.salaryOf(this.age) + (this.partner?.alive ? this.partnerIncome() : 0);
  }
  // ── 仕事
  salaryOf(a) {
    const w = this.region.wageIndex;
    const m = this.careerMult;
    switch (this.job) {
      case "big":
        return this.D.regularWage(this.sex, this.edu, a) * 1.18 * m * w;
      case "sme":
        return this.D.regularWage(this.sex, this.edu, a) * 0.86 * m * w;
      case "civil":
        return this.D.regularWage(this.sex, this.edu, a) * 1.02 * Math.min(m, 1.2) * Math.min(w, 1.05);
      case "nonregular":
        return this.D.nonRegularWage(this.sex, a) * Math.min(m, 1.3) * w;
      case "freelance":
        return this.D.income.selfEmployedMedianAnnual * m * Math.min(w, 1.1);
      case "founder":
        return this.D.income.selfEmployedMedianAnnual * m * (this.founderBig ? 6 : 1);
      default:
        return 0;
    }
  }
  partnerIncome() {
    const p = this.partner;
    if (!p || !p.alive || p.age >= 65) return 0;
    if (p.work === "regular") return this.D.regularWage(p.sex, p.edu, p.age) * 0.95 * this.region.wageIndex;
    if (p.work === "part") return this.D.nonRegularWage(p.sex, p.age) * 0.55 * this.region.wageIndex;
    return 0;
  }
  workYear(r) {
    const a = this.age;
    if (!this.banked && (this.job === "big" || this.job === "sme" || this.job === "civil")) {
      this.banked = true;
      this.log("money", "\u7D66\u6599\u306E\u632F\u308A\u8FBC\u307F\u306E\u305F\u3081\u3001\u9280\u884C\u306B\u53E3\u5EA7\u3092\u4F5C\u3063\u305F\u3002");
    }
    const world = streamRng("world", "economy", this.year);
    const recession = world.chance(0.1);
    if (recession && a >= 18) {
      const working2 = this.job !== "none" && this.job !== "retired";
      this.log(
        "money",
        this.again("recession", 1) ? this.vary("recession2", ["\u4E0D\u666F\u6C17\u304C\u7D9A\u3044\u3066\u3044\u308B\u3002", "\u666F\u6C17\u306F\u3001\u306A\u304B\u306A\u304B\u4E0A\u5411\u304B\u306A\u3044\u3002", "\u4ECA\u5E74\u3082\u666F\u6C17\u306F\u60AA\u3044\u307E\u307E\u3060\u3063\u305F\u3002"]) : this.vary("recession", [
          "\u666F\u6C17\u304C\u5F8C\u9000\u3057\u305F\u3002",
          "\u666F\u6C17\u304C\u60AA\u304F\u306A\u308A\u3001\u6C42\u4EBA\u304C\u6E1B\u3063\u305F\u3002",
          "\u4E0D\u666F\u6C17\u306E\u30CB\u30E5\u30FC\u30B9\u304C\u7D9A\u3044\u305F\u3002",
          "\u666F\u6C17\u304C\u51B7\u3048\u3053\u307F\u3001\u8857\u306E\u4EBA\u901A\u308A\u304C\u6E1B\u3063\u305F\u3002",
          "\u7269\u304C\u58F2\u308C\u306A\u304F\u306A\u308A\u3001\u666F\u6C17\u304C\u5F8C\u9000\u3057\u305F\u3002",
          "\u666F\u6C17\u306E\u5148\u884C\u304D\u304C\u6697\u304F\u306A\u308A\u3001\u307F\u3093\u306A\u8CA1\u5E03\u306E\u3072\u3082\u3092\u56FA\u304F\u3057\u305F\u3002",
          working2 ? "\u666F\u6C17\u304C\u5F8C\u9000\u3057\u3001\u52E4\u3081\u5148\u306E\u696D\u7E3E\u3082\u843D\u3061\u3053\u3093\u3060\u3002" : "\u666F\u6C17\u304C\u5F8C\u9000\u3057\u3001\u307E\u308F\u308A\u3067\u3082\u4ED5\u4E8B\u3092\u5931\u3046\u4EBA\u304C\u51FA\u305F\u3002",
          working2 ? "\u4E0D\u666F\u6C17\u3067\u3001\u30DC\u30FC\u30CA\u30B9\u3084\u6B8B\u696D\u4EE3\u304C\u6E1B\u308B\u3068\u3044\u3046\u8A71\u304C\u51FA\u305F\u3002" : "\u4E0D\u666F\u6C17\u3067\u3001\u5E97\u3058\u307E\u3044\u3059\u308B\u5E97\u304C\u5897\u3048\u305F\u3002"
        ])
      );
    }
    if (this.job === "none" && this.school === "done" && this.made("firstJob") && a < this.retireAge) {
      if (a >= this.unemployedUntil && this.unemployedUntil >= 0) {
        const back = r.chance(0.35) ? "sme" : "nonregular";
        this.job = back;
        this.careerMult = Math.max(0.65, this.careerMult * 0.85);
        this.unemployedUntil = -1;
        this.log(
          "work",
          back === "sme" ? this.vary("backSme", ["\u4E2D\u5C0F\u4F01\u696D\u306E\u6B63\u793E\u54E1\u3068\u3057\u3066\u50CD\u304D\u306F\u3058\u3081\u305F\u3002", "\u4ED5\u4E8B\u304C\u898B\u3064\u304B\u308A\u3001\u4E2D\u5C0F\u4F01\u696D\u306E\u6B63\u793E\u54E1\u306B\u306A\u3063\u305F\u3002"]) : this.vary("backNonreg", ["\u975E\u6B63\u898F\u306E\u4ED5\u4E8B\u3067\u50CD\u304D\u306F\u3058\u3081\u305F\u3002", "\u6D3E\u9063\u3084\u30D1\u30FC\u30C8\u306E\u4ED5\u4E8B\u3092\u898B\u3064\u3051\u3066\u3001\u50CD\u304D\u306F\u3058\u3081\u305F\u3002", "\u5951\u7D04\u793E\u54E1\u3068\u3057\u3066\u3001\u307E\u305F\u50CD\u304D\u306F\u3058\u3081\u305F\u3002", "\u77ED\u671F\u306E\u4ED5\u4E8B\u3092\u3064\u306A\u3044\u3067\u3001\u50CD\u304D\u306F\u3058\u3081\u305F\u3002"])
        );
      }
    }
    if (this.job !== "none" && this.job !== "retired") {
      let sal = this.salaryOf(a);
      if (this.job === "freelance" || this.job === "founder") sal *= Math.max(0.2, r.normal(1, 0.28));
      if (recession && (this.job === "big" || this.job === "sme")) sal *= 0.94;
      if (this.careMode === "home" && a < this.careUntil) sal *= 0.85;
      if (this.careMode === "liveIn" && a < this.careUntil) sal *= 0.9;
      if (this.postRetireWork) sal = this.lastRegularWage > 0 ? this.lastRegularWage * 0.62 : sal;
      this.addIncome("salary", sal);
      this.workYears++;
      if (this.job === "big" || this.job === "sme" || this.job === "civil") {
        this.regularYears++;
        if (!this.postRetireWork) this.lastRegularWage = sal;
      }
      this.careerMult = Math.min(2.6, Math.max(0.55, this.careerMult * Math.exp(r.normal(4e-3, 0.03))));
      if ((this.job === "big" || this.job === "sme" || this.job === "civil") && !this.manager && a >= 35 && a <= 55 && !this.postRetireWork) {
        const p = 1 - Math.pow(1 - this.D.ev.promotionToManagerBy45, 1 / 10);
        if (r.chance(p * (this.edu === "university" || this.edu === "graduate" ? 1.3 : 0.7))) {
          this.manager = true;
          this.careerMult *= 1.18;
          this.log("work", "\u7BA1\u7406\u8077\u306B\u6607\u9032\u3057\u305F\u3002\u7D66\u6599\u304C\u4E0A\u304C\u3063\u305F\u3002", void 0, true);
        }
      }
      const layoffMult = recession ? 2.2 : 1;
      if ((this.job === "big" || this.job === "sme") && a >= 30 && a < 60 && !this.postRetireWork) {
        const p = this.D.ev.layoffAnnual * layoffMult * (this.job === "big" ? a >= 45 ? 1.3 : 0.6 : 1) * (this.manager ? 0.8 : 1);
        if (r.chance(p)) {
          const sev = this.job === "big" ? this.salaryOf(a) * r.range(0.5, 1.5) : this.salaryOf(a) * 0.3;
          this.log("work", this.job === "big" ? "\u65E9\u671F\u9000\u8077\u3092\u8FEB\u3089\u308C\u3001\u4F1A\u793E\u3092\u8F9E\u3081\u305F\u3002\u5272\u5897\u9000\u8077\u91D1\u304C\u51FA\u305F\u3002" : "\u52E4\u3081\u5148\u304C\u7D4C\u55B6\u4E0D\u632F\u3067\u4EBA\u54E1\u524A\u6E1B\u3002\u8077\u3092\u5931\u3063\u305F\u3002", sev, true);
          this.addIncome("windfall", sev);
          this.loseJob(a);
          this.mark("jobLoss");
        }
      } else if (this.job === "nonregular" && !this.postRetireWork) {
        if (r.chance(0.06 * layoffMult)) {
          this.log("work", this.vary("noRenew", ["\u5951\u7D04\u304C\u66F4\u65B0\u3055\u308C\u305A\u3001\u6B21\u306E\u4ED5\u4E8B\u3092\u63A2\u3057\u305F\u3002", "\u5951\u7D04\u671F\u9593\u304C\u7D42\u308F\u308A\u3001\u4ED5\u4E8B\u304C\u306A\u304F\u306A\u3063\u305F\u3002", "\u4EBA\u624B\u304C\u8DB3\u308A\u305F\u304B\u3089\u3068\u3001\u5951\u7D04\u3092\u6253\u3061\u5207\u3089\u308C\u305F\u3002"]));
          this.mark("jobLoss");
          this.unemployedUntil = a + 1;
          this.job = "none";
        } else if (a < 45 && r.chance(0.025)) {
          this.job = "sme";
          this.log("work", "\u6B63\u793E\u54E1\u306B\u767B\u7528\u3055\u308C\u305F\u3002", void 0, true);
        }
      } else if (this.job === "founder") {
        const years = a - this.founderYear;
        if (!this.founderBig && years >= 1 && years <= 5) {
          const fail = 1 - Math.pow(this.D.ev.startupFiveYearSurvival, 1 / 5);
          if (r.chance(fail * (recession ? 1.6 : 1))) {
            const debt = r.range(this.y(1e6), this.y(8e6));
            this.log("work", "\u4F1A\u793E\u3092\u305F\u305F\u3093\u3060\u3002\u501F\u5165\u306E\u8FD4\u6E08\u304C\u6B8B\u3063\u305F\u3002", -debt, true);
            this.spend("other", debt);
            this.job = "none";
            this.unemployedUntil = a + 1;
          } else if (r.chance(this.D.ev.startupBigSuccessRate / 5)) {
            this.founderBig = true;
            this.log("luck", "\u4E8B\u696D\u304C\u5927\u304D\u304F\u5F53\u305F\u3063\u305F\u3002\u4F1A\u793E\u304C\u6025\u6210\u9577\u3057\u3066\u3044\u308B\u3002", void 0, true);
          }
        }
        if (this.founderBig && r.chance(0.04)) {
          const exit = this.D.income.selfEmployedMedianAnnual * r.range(20, 120);
          this.log("luck", "\u4F1A\u793E\u3092\u58F2\u5374\u3057\u305F\u3002", exit, true);
          this.addIncome("windfall", exit);
          this.job = "freelance";
          this.founderBig = false;
        }
      } else if (this.job === "freelance") {
        if (r.chance(0.03 * layoffMult)) {
          this.log("work", this.vary("lostClient", ["\u5927\u53E3\u306E\u53D6\u5F15\u5148\u3092\u5931\u3044\u3001\u53CE\u5165\u304C\u6E1B\u3063\u305F\u3002", "\u9577\u304F\u7D9A\u3044\u305F\u53D6\u5F15\u304C\u7D42\u308F\u308A\u3001\u53CE\u5165\u304C\u6E1B\u3063\u305F\u3002", "\u6CE8\u6587\u304C\u6E1B\u308A\u3001\u58F2\u308A\u4E0A\u3052\u304C\u843D\u3061\u305F\u3002"]));
          this.careerMult *= 0.8;
        }
      }
      if ((this.job === "sme" || this.job === "big") && a < 55 && r.chance(this.D.ev.jobChangeRateAnnual * 0.35)) {
        const ch = Math.exp(r.normal(0.02, 0.12));
        this.careerMult *= ch;
        this.log("work", ch >= 1 ? "\u3088\u308A\u6761\u4EF6\u306E\u3044\u3044\u4F1A\u793E\u306B\u8EE2\u8077\u3057\u305F\u3002" : "\u50CD\u304D\u3084\u3059\u3055\u3092\u512A\u5148\u3057\u3066\u8EE2\u8077\u3057\u305F\u3002\u7D66\u6599\u306F\u5C11\u3057\u4E0B\u304C\u3063\u305F\u3002");
      }
    }
    if (this.seniorWorkUntil >= 0 && a >= this.seniorWorkUntil) {
      this.seniorWorkUntil = -1;
      this.sideIncome = 0;
    }
    if (this.sideIncome > 0 && a < 80) this.addIncome("salary", this.sideIncome);
    if (this.abroad) {
      if (a < this.abroadUntil && this.job !== "none") {
        this.addIncome("salary", this.salaryOf(a) * 2.2);
      } else {
        this.abroad = false;
        this.abroadUntil = -1;
        this.log("work", "\u51FA\u7A3C\u304E\u304B\u3089\u5E30\u3063\u3066\u304D\u305F\u3002\u5BB6\u65CF\u3068\u66AE\u3089\u3059\u65E5\u3005\u306B\u623B\u3063\u305F\u3002", void 0, true);
      }
    }
    if (a + 1 === this.retireAge && this.job !== "none" && this.job !== "retired") {
      this.retire(r);
    }
    if (this.job === "none" && this.unemployedUntil > a && this.lastRegularWage > 0 && a < 65) {
      this.addIncome("windfall", this.lastRegularWage * 0.25);
    }
  }
  loseJob(a) {
    this.job = "none";
    this.manager = false;
    this.unemployedUntil = a + 1;
  }
  retire(r) {
    if (this.job === "big" || this.job === "sme" || this.job === "civil" || this.regularYears >= 10) {
      const base = this.edu === "university" || this.edu === "graduate" ? this.D.ev.retirementAllowance.university : this.D.ev.retirementAllowance.high_school;
      const jm = this.job === "big" ? 1.15 : this.job === "civil" ? 1.05 : this.job === "sme" ? 0.55 : 0.3;
      const amt = base * jm * Math.min(1, this.regularYears / 35) * r.range(0.85, 1.15);
      if (amt > 0) {
        this.addIncome("pension", amt);
        this.log("money", `\u9000\u8077\u91D1\u3092\u53D7\u3051\u53D6\u3063\u305F\u3002`, amt, true);
      }
    }
    this.log("work", `${this.age + 1}\u6B73\u3067\u4ED5\u4E8B\u3092\u5F15\u9000\u3057\u305F\u3002`, void 0, true);
    this.job = "retired";
    this.postRetireWork = false;
  }
  // ── 親
  parentsYear(r) {
    const a = this.age;
    if (this.heir) this.heirParentsYear(a);
    if (this.heldHouse > 0 && a >= 18) this.queueScene(heldHouseScene(this));
    if (a < 18) return;
    for (const [i, p] of this.parents.entries()) {
      if (!p.alive) continue;
      const pa = p.age + a;
      const sex = i === 0 ? "male" : "female";
      const careEnding = this.careUntil === a && this.careMode !== "" && i === this.careParent;
      const h = this.heir;
      if (h && (i === h.parentIdx || h.otherDies !== null || a < h.otherSafeUntil)) {
        if (careEnding) this.careMode = "";
        continue;
      }
      if (careEnding || r.chance(this.D.qx(sex, pa))) {
        p.alive = false;
        this.log("family", `${i === 0 ? "\u7236" : "\u6BCD"}\u304C${pa}\u6B73\u3067\u4EA1\u304F\u306A\u3063\u305F\u3002`, -this.D.living.funeralCost / (this.siblings + 1), true);
        this.mark("parentDeath");
        this.spend("events", this.D.living.funeralCost / (this.siblings + 1));
        if (careEnding) this.careMode = "";
        if (!this.parents.some((x) => x.alive) && !this.heir) {
          this.inherit(r);
          if (this.home === "parents") {
            this.home = "own";
            this.housePrice = (this.region.id === "tokyo" ? this.y(3e7) : this.y(12e6)) / (this.siblings + 1);
            this.boughtAge = a - 30;
            this.log("life", "\u4F4F\u3093\u3067\u3044\u305F\u5B9F\u5BB6\u3092\u53D7\u3051\u7D99\u3044\u3060\u3002");
          }
        }
      }
    }
    if (!this.careTriggered && !this.made("parentCare") && a >= 45 && this.parents.some((p) => p.alive)) {
      const pc = this.D.ev.parentCareStartProbByChildAge;
      const pr = a < 50 ? pc["40s"] : a < 60 ? pc["50s"] : pc["60s"];
      if (r.chance(pr)) {
        this.careTriggered = true;
        this.careParent = this.parents.findIndex((p) => p.alive);
        this.log("family", `${this.careParent === 0 ? "\u7236" : "\u6BCD"}\u306B\u4ECB\u8B77\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3002`, void 0, true);
      }
    }
    if (this.careMode && a < this.careUntil) {
      const cost = this.careMode === "facility" ? this.y(18e5) : this.careMode === "home" ? this.y(6e5) : this.careMode === "liveIn" ? this.y(35e4) : this.careMode === "quit" ? this.y(4e5) : this.y(7e5);
      const share = this.careMode === "share" ? 1 : 1 / Math.max(1, this.siblings * (this.livesWithParents ? 0.25 : 0.5) + 1);
      this.spend("care", cost * share * (this.cash + this.invest < 0 ? 0.5 : 1));
    }
  }
  /** 親と同じ家で暮らしている（実家暮らし・二世帯） */
  get livesWithParents() {
    return (this.home === "parents" || this.coLiveParents) && this.parents.some((p) => p.alive);
  }
  /** 前の代のあなた（と、そのパートナー）が、前の代の人生で決まった年に亡くなる。遺産もここで受け継ぐ */
  heirParentsYear(a) {
    const h = this.heir;
    const word = (i) => i === 0 ? "\u7236" : "\u6BCD";
    const other = h.parentIdx === 0 ? 1 : 0;
    if (h.otherDies === a && this.parents[other].alive) {
      this.parents[other].alive = false;
      this.log("family", `${word(other)}\u304C${this.parents[other].age + a}\u6B73\u3067\u4EA1\u304F\u306A\u3063\u305F\u3002`, void 0, true);
      this.mark("parentDeath");
    }
    const me = this.parents[h.parentIdx];
    if (h.parentDies !== a || !me.alive) return;
    me.alive = false;
    const share = this.D.living.funeralCost / (this.siblings + 1);
    this.log("family", `${word(h.parentIdx)}\uFF08${h.gen - 1}\u4EE3\u76EE\u306E\u3042\u306A\u305F\uFF09\u304C${me.age + a}\u6B73\u3067\u4EA1\u304F\u306A\u3063\u305F\u3002`, a >= 18 ? -share : void 0, true);
    this.mark("parentDeath");
    if (a >= 18) this.spend("events", share);
    if (h.estate > 0) {
      this.addIncome("windfall", h.estate);
      this.inherited += h.estate;
      this.log("money", `${h.gen - 1}\u4EE3\u76EE\u306E\u3042\u306A\u305F\u304C\u6B8B\u3057\u305F\u304A\u91D1\u3092\u76F8\u7D9A\u3057\u305F\u3002`, h.estate, true);
    }
    if (h.debt > 0) {
      this.addIncome("windfall", -h.debt);
      this.inherited -= h.debt;
      this.log("money", h.homeShare === 0 && h.hadHome ? "\u5B9F\u5BB6\u3092\u58F2\u3063\u3066\u3082\u8FD4\u3057\u304D\u308C\u305A\u3001\u89AA\u304C\u6B8B\u3057\u305F\u501F\u91D1\u3092\u5F15\u304D\u7D99\u3044\u3060\u3002" : "\u89AA\u304C\u6B8B\u3057\u305F\u501F\u91D1\u3092\u5F15\u304D\u7D99\u3044\u3060\u3002", -h.debt, true);
    }
    if (h.homeShare > 0) {
      this.heldHouse = h.homeShare;
      if (a < 18) {
        const other2 = this.parents[h.parentIdx === 0 ? 1 : 0].alive;
        this.log("life", other2 ? "\u89AA\u304C\u6B8B\u3057\u305F\u5BB6\u3067\u3001\u305D\u306E\u307E\u307E\u66AE\u3089\u3057\u7D9A\u3051\u305F\u3002" : "\u89AA\u304C\u6B8B\u3057\u305F\u5BB6\u306B\u3001\u89AA\u621A\u306B\u898B\u5B88\u3089\u308C\u306A\u304C\u3089\u4F4F\u307F\u7D9A\u3051\u305F\u3002", void 0, true);
      } else this.queueScene(heldHouseScene(this));
    }
    if (!h.estate && !h.homeShare && !h.debt) this.log("money", "\u89AA\u306E\u907A\u7523\u306F\u307B\u3068\u3093\u3069\u306A\u304B\u3063\u305F\u3002");
  }
  /**
   * お金の振り分け：その年に余ったお金（手取りから、出ていったお金を引いた残り）を、決めた割合で使う。
   * 効き目はゲームがすでに使っている統計の範囲だけにする（投資は国の株式の利回り、貯金は預金金利と物価、
   * 学びは「学び直し」と同じ確率、家族は子どもの教育費・親への仕送り）。
   */
  allocYear() {
    const c = this.cur;
    const inc = (c.income.salary ?? 0) + (c.income.partner ?? 0) + (c.income.pension ?? 0);
    const out = Object.values(c.expense).reduce((t, v) => t + (v ?? 0), 0);
    const free = inc - out;
    this.lastFree = free;
    const al = this.alloc;
    if (!al || free <= 0 || this.cash <= 0) return;
    const pot = Math.min(free, this.cash);
    const part = (n) => pot * n / 10;
    if (al.living) this.spend("fun", part(al.living));
    if (al.invest && this.banked) {
      const v = Math.min(this.cash, part(al.invest));
      this.cash -= v;
      this.invest += v;
    }
    if (al.family) {
      const v = part(al.family);
      const a = this.age;
      const kids = this.kids.filter((k) => a - k.born >= 0 && a - k.born < 22);
      if (kids.length) {
        this.spend("kids", v);
        for (const k of kids) k.eduSpend = (k.eduSpend ?? 0) + v / kids.length;
      } else if (this.parents.some((p) => p.alive)) {
        this.spend("care", v);
      }
    }
    if (al.self && this.age < 65) {
      this.spend("selfEdu", part(al.self));
      this.selfFund += part(al.self);
      const unit = Math.max(this.y(12e5), this.salaryOf(this.age) * 0.5);
      if (this.selfFund >= unit && this.selfRaises < 3) {
        this.selfFund -= unit;
        if (this.rng("allocSelf").chance(0.5)) {
          this.selfRaises++;
          this.careerMult *= 1.15;
          this.log("work", "\u5B66\u3073\u306B\u4F7F\u3063\u305F\u304A\u91D1\u3067\u8EAB\u306B\u3064\u3051\u305F\u3053\u3068\u304C\u8A55\u4FA1\u3055\u308C\u3001\u7D66\u6599\u304C\u4E0A\u304C\u3063\u305F\u3002", void 0, true);
        } else this.log("work", this.vary("studyNo", ["\u5B66\u3073\u7D9A\u3051\u305F\u304C\u3001\u3059\u3050\u306B\u306F\u7D66\u6599\u306B\u7D50\u3073\u3064\u304B\u306A\u304B\u3063\u305F\u3002", "\u52C9\u5F37\u306F\u7D9A\u3051\u3066\u3044\u308B\u304C\u3001\u307E\u3060\u4ED5\u4E8B\u306B\u306F\u751F\u304B\u305B\u3066\u3044\u306A\u3044\u3002", "\u8CC7\u683C\u306E\u52C9\u5F37\u3092\u7D9A\u3051\u305F\u3002\u7D66\u6599\u306F\u5909\u308F\u3089\u306A\u304B\u3063\u305F\u3002"]));
      }
      this.selfFund = Math.min(this.selfFund, unit);
    }
  }
  /** 親が残した家に住む（家賃がかからなくなる） */
  moveIntoHeldHouse() {
    this.home = "own";
    this.housePrice = this.heldHouse;
    this.boughtAge = this.age;
    this.heldHouse = 0;
  }
  /** 親が残した家を売って、お金にする */
  sellHeldHouse() {
    const v = this.heldHouse;
    this.addIncome("windfall", v);
    this.inherited += v;
    this.heldHouse = 0;
    return v;
  }
  inherit(r) {
    const b = BAND_INHERIT[this.band.id] ?? BAND_INHERIT.mid;
    if (r.chance(b.p)) {
      const amt = this.D.ev.inheritanceAverage * b.mult * Math.exp(r.normal(-0.2, 0.7)) / (this.siblings + 1);
      this.addIncome("windfall", amt);
      this.log("money", "\u89AA\u306E\u907A\u7523\u3092\u76F8\u7D9A\u3057\u305F\u3002", amt, true);
    } else {
      this.log("money", "\u89AA\u306E\u907A\u7523\u306F\u307B\u3068\u3093\u3069\u306A\u304B\u3063\u305F\u3002");
    }
  }
  // ── 健康
  healthYear(r) {
    const a = this.age;
    if (a < 20) return;
    if (this.gymUntil > a) this.spend("fun", this.y(96e3));
    if (this.insured && a < 70) this.spend("other", this.y(6e4));
    if (this.cramUntil > a) this.spend("kids", this.y(4e5));
    if (this.repairLater && this.home === "own" && r.chance(0.12)) {
      this.repairLater = false;
      this.spend("housing", this.y(25e5));
      this.log("money", "\u5148\u9001\u308A\u306B\u3057\u3066\u3044\u305F\u5BB6\u306E\u50B7\u307F\u304C\u5E83\u304C\u308A\u3001\u5927\u304D\u306A\u4FEE\u7406\u306B\u306A\u3063\u305F\u3002", -this.y(25e5), true);
    }
    const pc = this.D.cancerAnnual(a) * (this.sex === "male" ? 1.1 : 0.9);
    if (a - this.cancerAge > 6 && r.chance(pc)) {
      this.cancerAge = a;
      const cost = r.range(this.y(4e5), this.y(15e5));
      this.spend("medical", cost);
      this.log("health", "\u304C\u3093\u304C\u898B\u3064\u304B\u308A\u3001\u6CBB\u7642\u3092\u53D7\u3051\u305F\u3002" + this.sickLeave(4), -cost, true);
      this.mark("cancer");
      if (this.job !== "none" && this.job !== "retired" && r.chance(0.2)) {
        this.log("work", "\u6CBB\u7642\u306E\u305F\u3081\u4ED5\u4E8B\u3092\u8F9E\u3081\u305F\u3002");
        this.loseJob(a);
        this.unemployedUntil = a + 2;
      }
    } else if (r.chance(2e-3 + Math.max(0, a - 40) * 6e-4)) {
      const cost = r.range(this.y(3e5), this.y(1e6));
      this.spend("medical", cost);
      this.log("health", (r.chance(0.5) ? "\u5FC3\u81D3\u306E\u75C5\u6C17\u3067\u5165\u9662\u3057\u305F\u3002" : "\u8133\u306E\u8840\u7BA1\u306E\u75C5\u6C17\u3067\u5165\u9662\u3057\u305F\u3002") + this.sickLeave(2), -cost, true);
      this.mark("heartBrain");
      this.illMult = Math.min(1.6, this.illMult * 1.12);
    } else if (r.chance(0.012)) {
      const cost = r.range(this.y(5e4), this.y(3e5));
      this.spend("medical", cost);
      this.log("health", r.pick(["\u9AA8\u6298\u3057\u3066\u901A\u9662\u3057\u305F\u3002", "\u624B\u8853\u306E\u305F\u3081\u5165\u9662\u3057\u305F\u3002", "\u6301\u75C5\u306E\u6CBB\u7642\u304C\u7D9A\u3044\u305F\u3002"]), -cost);
    }
    const alc = alcoholDisorderShare(this.D.iso3);
    if (alc !== null && !this.alcoholProblem && a < 60 && streamRng(this.seed, "alcohol", a).chance(1 - Math.pow(1 - alc, 1 / 40))) {
      this.alcoholProblem = true;
      const cost = this.y(streamRng(this.seed, "alcoholCost", a).range(2e5, 6e5));
      this.spend("medical", cost);
      this.illMult = Math.min(1.6, this.illMult * 1.08);
      this.log("health", this.vary("alcohol", ["\u304A\u9152\u306E\u91CF\u304C\u5897\u3048\u3001\u81EA\u5206\u3067\u306F\u3084\u3081\u3089\u308C\u306A\u304F\u306A\u3063\u305F\u3002\u5C02\u9580\u306E\u75C5\u9662\u3067\u6CBB\u7642\u3092\u53D7\u3051\u305F\u3002", "\u6BCE\u6669\u306E\u9152\u304C\u624B\u653E\u305B\u306A\u304F\u306A\u308A\u3001\u5BB6\u65CF\u306B\u52E7\u3081\u3089\u308C\u3066\u6CBB\u7642\u306B\u901A\u3063\u305F\u3002"]), -cost, true);
      this.mark("alcohol");
    }
    if (!this.selfCare && a >= 65 && r.chance(this.D.careNeed(a) / 6)) {
      this.selfCare = true;
      this.log("health", "\u8981\u4ECB\u8B77\u306E\u8A8D\u5B9A\u3092\u53D7\u3051\u305F\u3002\u4ECB\u8B77\u30B5\u30FC\u30D3\u30B9\u3092\u4F7F\u3044\u306F\u3058\u3081\u305F\u3002", void 0, true);
      this.mark("care");
    }
    if (this.selfCare) this.spend("care", r.range(this.y(6e5), this.y(12e5)));
  }
  /**
   * 子ども時代の出来事（ほかの出来事と乱数を分ける）
   * ・児童労働（日本以外）：10歳のとき、その国の5〜17歳の児童労働の割合（UNICEF・ILO）を、家の豊かさで重みづけて決める
   * ・不登校（日本）：その年度に不登校だった子は小学生2.3%、中学生6.8%（文部科学省 2024年度）
   */
  childhoodYear() {
    const a = this.age;
    if (a === 19 && this.job !== "big" && this.job !== "sme" && this.job !== "civil") {
      const acc = accountShare(this.D.iso3);
      const bandF = [2, 1.4, 1, 0.5, 0.2][this.bandIdx] ?? 1;
      if (acc !== null && streamRng(this.seed, "account", 0).chance(Math.min(0.95, (1 - acc) * bandF))) {
        this.banked = false;
        this.log("money", "\u9280\u884C\u3084\u30B9\u30DE\u30DB\u306E\u304A\u91D1\u306E\u53E3\u5EA7\u3092\u6301\u3063\u3066\u3044\u306A\u3044\u3002\u7A3C\u3044\u3060\u304A\u91D1\u306F\u3001\u624B\u5143\u306B\u7F6E\u3044\u3066\u304A\u304F\u3057\u304B\u306A\u3044\u3002");
        this.mark("unbanked");
      }
    }
    if (!this.D.isJapan && a === 10) {
      const share = childLabourShare(this.D.iso3);
      const bandF = [2, 1.4, 1, 0.5, 0.2][this.bandIdx] ?? 1;
      if (share !== null && streamRng(this.seed, "childWork", 0).chance(Math.min(0.9, share * bandF))) {
        this.childWorked = true;
        this.log(
          "school",
          this.region.urban ? "\u5BB6\u8A08\u3092\u52A9\u3051\u308B\u305F\u3081\u3001\u5B66\u6821\u304C\u7D42\u308F\u308B\u3068\u5E02\u5834\u3084\u5E97\u3067\u50CD\u304F\u3088\u3046\u306B\u306A\u3063\u305F\u3002\u5B66\u6821\u3092\u4F11\u3080\u65E5\u3082\u5897\u3048\u305F\u3002" : "\u5BB6\u306E\u7551\u4ED5\u4E8B\u3084\u5BB6\u755C\u306E\u4E16\u8A71\u3092\u4EFB\u3055\u308C\u3001\u5B66\u6821\u3092\u4F11\u3080\u65E5\u304C\u5897\u3048\u305F\u3002",
          void 0,
          true
        );
        this.mark("childWork");
      }
    }
    if (this.D.isJapan && this.futokoAge < 0 && (a === 9 || a === 13) && streamRng(this.seed, "futoko", a).chance(a === 13 ? 0.068 : 0.023)) {
      this.futokoAge = a;
      this.log(
        "school",
        a >= 12 ? "\u4E2D\u5B66\u6821\u306B\u884C\u3051\u306A\u3044\u6642\u671F\u304C\u7D9A\u3044\u305F\u3002\u5BB6\u3084\u30D5\u30EA\u30FC\u30B9\u30AF\u30FC\u30EB\u3067\u904E\u3054\u3057\u305F\u3002" : "\u5C0F\u5B66\u6821\u306B\u884C\u3051\u306A\u3044\u6642\u671F\u304C\u7D9A\u3044\u305F\u3002\u5BB6\u3067\u904E\u3054\u3059\u65E5\u304C\u591A\u304B\u3063\u305F\u3002",
        void 0,
        true
      );
      this.mark("futoko");
    }
  }
  /** 子どもの呼び名（長男・次女など）。家族の声と同じ数え方 */
  kidLabel(i) {
    const f = kidFemale(this.seed, i);
    const nth = this.kids.slice(0, i).filter((_, j) => kidFemale(this.seed, j) === f).length;
    return `${["\u9577", "\u6B21", "\u4E09", "\u56DB", "\u4E94"][nth] ?? "\u672B"}${f ? "\u5973" : "\u7537"}`;
  }
  /** 初めての子が生まれたときに添える、お産の危険の一言（国連の推計） */
  birthRiskNote() {
    const n = maternalDeaths(this.D.iso3);
    if (n === null) return "";
    const jp2 = maternalDeaths("JPN");
    return `${this.D.nameJa}\u3067\u306F\u3001\u304A\u7523\u3067\u547D\u3092\u843D\u3068\u3059\u5973\u6027\u304C10\u4E07\u4EBA\u306B${Math.round(n)}\u4EBA\u3044\u308B` + (this.D.isJapan || jp2 === null ? "\u3002" : `\uFF08\u65E5\u672C\u306F${Math.round(jp2)}\u4EBA\uFF09\u3002`);
  }
  /** 一人で子どもを育てることになったときの一言（ひとり親世帯の貧困率） */
  singleParentNote() {
    const p = singleParentPoverty(this.D.iso3);
    if (p === null) return;
    this.log("family", `\u4E00\u4EBA\u3067\u5B50\u3069\u3082\u3092\u80B2\u3066\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002${this.D.nameJa}\u3067\u306F\u3001\u3072\u3068\u308A\u89AA\u306E\u5BB6\u5EAD\u306E${Math.round(p * 100)}%\u304C\u3001\u8CA7\u56F0\u30E9\u30A4\u30F3\u3088\u308A\u4E0B\u3067\u66AE\u3089\u3057\u3066\u3044\u308B\u3002`);
  }
  /**
   * 病気で何か月か仕事を休む。休んだ分の給料は、国の補償がある人なら3分の2が出る（統計は lifestats.ts）。
   * 休んで減った分を支出に入れ、ログに足す一文を返す
   */
  sickLeave(months) {
    if (this.job === "none" || this.job === "retired") return "";
    const covered = sickPayCovered(this.D.iso3, this.job, this.D.inst?.informalShare ?? 0);
    const lost = this.salaryOf(this.age) * (months / 12) * (covered ? 1 / 3 : 1);
    this.spend("other", lost);
    return covered ? `${months}\u304B\u6708\u4F11\u307F\u3001\u305D\u306E\u9593\u306F\u56FD\u306E\u5236\u5EA6\u3067\u7D66\u6599\u306E3\u5206\u306E2\u304C\u51FA\u305F\u3002` : `${months}\u304B\u6708\u4F11\u307F\u3001\u305D\u306E\u9593\u306E\u7D66\u6599\u306F\u51FA\u306A\u304B\u3063\u305F\u3002`;
  }
  // ── 運
  luckYear(r) {
    const a = this.age;
    if (a < 20) return;
    if (this.lottery) {
      this.spend("fun", this.y(3e4));
      if (r.chance(this.D.ev.lotteryJackpotOdds * 10)) {
        this.addIncome("windfall", this.y(7e8));
        this.log("luck", this.D.isJapan ? "\u5E74\u672B\u30B8\u30E3\u30F3\u30DC\u5B9D\u304F\u3058\u30671\u7B49\u304C\u5F53\u305F\u3063\u305F\u3002" : "\u5B9D\u304F\u3058\u306E1\u7B49\u304C\u5F53\u305F\u3063\u305F\u3002", this.y(7e8), true);
      } else if (r.chance(10 / 1e6)) {
        this.addIncome("windfall", this.y(1e6));
        this.log("luck", `\u5B9D\u304F\u3058\u3067${this.D.fmt(this.y(1e6), false)}\u304C\u5F53\u305F\u3063\u305F\u3002`, this.y(1e6), true);
      } else if (r.chance(0.02)) {
        this.addIncome("windfall", this.y(1e4));
        this.log("luck", `\u5B9D\u304F\u3058\u3067${this.D.fmt(this.y(1e4), false)}\u304C\u5F53\u305F\u3063\u305F\u3002`, this.y(1e4));
      }
    }
    if (a >= 22 && a < 60 && r.chance(15e-4)) {
      const amt = r.range(this.y(3e6), this.y(3e7));
      this.addIncome("windfall", amt);
      this.log("luck", "\u526F\u696D\u3067\u4F5C\u3063\u305F\u3082\u306E\u304C\u601D\u308F\u306C\u30D2\u30C3\u30C8\u306B\u306A\u3063\u305F\u3002", amt, true);
    }
    const dis = this.D.isJapan ? this.D.ev.majorDisasterAnnualByRiskUnit * this.region.disasterRisk : 0;
    if (r.chance(dis)) {
      const own = this.home === "own";
      const dmg = own ? r.range(this.y(15e5), this.y(8e6)) : r.range(this.y(2e5), this.y(8e5));
      this.spend("events", dmg);
      this.log("disaster", own ? "\u5927\u304D\u306A\u5730\u9707\u3067\u5BB6\u304C\u88AB\u5BB3\u3092\u53D7\u3051\u3001\u4FEE\u7406\u3057\u305F\u3002" : "\u5927\u304D\u306A\u707D\u5BB3\u3067\u5BB6\u8CA1\u3092\u5931\u3063\u305F\u3002", -dmg, true);
      this.mark("disaster");
    }
    if (a >= 22 && this.school === "done" && !this.frugal && !this.welfare && r.chance(this.regionFactor(REGION_CAR, 0.35, 0.55) * Math.min(1, this.D.k * 3) / 9) && a < 80) {
      const liquid = this.cash + this.invest;
      const used = liquid < this.y(2e6);
      const c = used ? r.range(this.y(4e5), this.y(1e6)) : r.range(this.y(15e5), this.y(32e5));
      this.spend("car", c);
      const first = this.carSince < 0;
      if (first) this.carSince = a;
      this.log(
        "money",
        first ? used ? "\u4E2D\u53E4\u8ECA\u3092\u8CB7\u3063\u305F\u3002" : "\u8ECA\u3092\u8CB7\u3063\u305F\u3002" : used ? this.vary("carUsed", ["\u4E2D\u53E4\u8ECA\u306B\u8CB7\u3044\u66FF\u3048\u305F\u3002", "\u53E4\u3044\u8ECA\u3092\u4E0B\u53D6\u308A\u306B\u51FA\u3057\u3066\u3001\u4E2D\u53E4\u8ECA\u306B\u4E57\u308A\u63DB\u3048\u305F\u3002", "\u8ECA\u304C\u6545\u969C\u7D9A\u304D\u306B\u306A\u308A\u3001\u4E2D\u53E4\u8ECA\u306B\u8CB7\u3044\u66FF\u3048\u305F\u3002"]) : this.vary("carNew", ["\u8ECA\u3092\u8CB7\u3044\u66FF\u3048\u305F\u3002", "\u9577\u304F\u4E57\u3063\u305F\u8ECA\u3092\u624B\u653E\u3057\u3001\u65B0\u3057\u3044\u8ECA\u306B\u3057\u305F\u3002", "\u5BB6\u65CF\u306E\u66AE\u3089\u3057\u306B\u5408\u308F\u305B\u3066\u3001\u8ECA\u3092\u8CB7\u3044\u66FF\u3048\u305F\u3002"]),
        -c
      );
    }
    if (a >= 25 && !this.tight && !this.frugal && r.chance(0.04)) {
      const c = r.range(this.y(15e4), this.y(6e5));
      this.spend("fun", c);
      this.log(
        "money",
        r.pick([
          this.vary("splurge1", ["\u5BB6\u65CF\u3067\u6D77\u5916\u65C5\u884C\u306B\u884C\u3063\u305F\u3002", "\u601D\u3044\u5207\u3063\u3066\u9060\u304F\u3078\u65C5\u884C\u3057\u305F\u3002", "\u6E29\u6CC9\u65C5\u884C\u3067\u306E\u3093\u3073\u308A\u904E\u3054\u3057\u305F\u3002"]),
          this.vary("splurge2", ["\u8DA3\u5473\u306B\u601D\u3044\u5207\u3063\u3066\u4F7F\u3063\u305F\u3002", "\u305A\u3063\u3068\u6B32\u3057\u304B\u3063\u305F\u3082\u306E\u3092\u8CB7\u3063\u305F\u3002", "\u7FD2\u3044\u3054\u3068\u3092\u59CB\u3081\u3001\u9053\u5177\u3092\u305D\u308D\u3048\u305F\u3002"]),
          this.vary("splurge3", ["\u5BB6\u96FB\u3092\u307E\u3068\u3081\u3066\u8CB7\u3044\u66FF\u3048\u305F\u3002", "\u53E4\u304F\u306A\u3063\u305F\u5BB6\u5177\u3092\u8CB7\u3044\u66FF\u3048\u305F\u3002", "\u51B7\u8535\u5EAB\u3068\u6D17\u6FEF\u6A5F\u304C\u7D9A\u3051\u3066\u58CA\u308C\u3001\u8CB7\u3044\u66FF\u3048\u305F\u3002"])
        ]),
        -c
      );
    }
  }
  // ── お金の流れ
  moneyYear(r) {
    const a = this.age;
    const living = this.school === "child" || this.school !== "done" && this.home === "parents";
    const pInc = this.partnerIncome();
    if (pInc > 0) this.addIncome("partner", pInc);
    if (a >= this.pensionStart) {
      const pen = this.pensionAnnual();
      this.addIncome("pension", pen);
      if (a === this.pensionStart)
        this.log("money", pen > 0 ? `\u5E74\u91D1\u3092\u53D7\u3051\u53D6\u308A\u306F\u3058\u3081\u305F\u3002\u5E74\u306B${this.D.fmt(pen)}\u3002` : "\u5E74\u91D1\u306B\u306F\u5165\u3063\u3066\u3044\u306A\u304B\u3063\u305F\u3002\u3053\u308C\u304B\u3089\u306F\u8CAF\u3048\u3068\u5BB6\u65CF\u304C\u983C\u308A\u3002", void 0, true);
    }
    if (this.partner?.alive && this.partner.age >= 65) this.addIncome("partner", this.partnerPension());
    if (this.widowed && a >= 60 && this.D.isJapan) this.addIncome("pension", this.D.ev.pensionMonthly.kosei_avg * 12 * 0.35);
    const minors = this.kids.filter((k) => a - k.born < 18).length;
    if (minors > 0 && this.D.isJapan) this.addIncome("windfall", minors * 12 * this.y(12e3));
    const gross = (this.cur.income.salary ?? 0) + (this.cur.income.partner ?? 0) * 0;
    const pension = (this.cur.income.pension ?? 0) * (a >= this.pensionStart ? 1 : 0);
    const formal = this.job === "big" || this.job === "sme" || this.job === "civil" || this.job === "retired";
    this.spend(
      "tax",
      this.D.tax(gross, formal) + (this.cur.income.partner ? this.D.tax(this.cur.income.partner, this.partner?.work === "regular") : 0) + this.D.pensionTax(Math.min(pension, this.pensionAnnual() + 1))
    );
    if (!living) this.livingCosts(r);
    if (this.scholarship > 0 && this.school === "done") {
      const pay = Math.min(this.scholarship, this.scholarshipAnnual || this.scholarship / 15);
      this.scholarship -= pay;
      this.cash -= pay;
      this.cur.expense.selfEdu = (this.cur.expense.selfEdu ?? 0) + pay;
      if (this.scholarship <= 1) {
        this.scholarship = 0;
        this.log("money", "\u5968\u5B66\u91D1\u3092\u8FD4\u3057\u7D42\u3048\u305F\u3002", void 0, true);
      }
    }
    if (this.loan > 0) {
      const interest = this.loan * 0.012;
      const pay = Math.min(this.loan + interest, this.loanAnnual);
      this.loan = Math.max(0, this.loan + interest - pay);
      this.cash -= pay;
      this.cur.expense.housing = (this.cur.expense.housing ?? 0) + pay;
      if (this.loan < 1) {
        this.loan = 0;
        this.log("money", "\u4F4F\u5B85\u30ED\u30FC\u30F3\u3092\u5B8C\u6E08\u3057\u305F\u3002", void 0, true);
      }
    }
    if (this.investStyle !== "none" && this.banked && a < 65 && this.cash > 0) {
      const net = (this.cur.income.salary ?? 0) + (this.cur.income.partner ?? 0) - (this.cur.expense.tax ?? 0);
      const c = Math.min(this.cash, Math.max(0, net * this.investRate));
      this.cash -= c;
      this.invest += c;
    }
    if (this.invest > 0) {
      const world = streamRng("world", "market", this.year);
      const m = this.D.ev.investmentReturn;
      const market = world.normal(m.meanAnnual, m.stdevAnnual);
      let ret = this.investStyle === "stocks" ? market * 1.25 + r.normal(-0.025, 0.12) : market;
      if (a >= 65) ret = ret * 0.5 + this.D.ev.depositRate * 0.5;
      const g = this.invest * Math.max(-0.7, ret);
      this.invest += g;
      this.cur.income.invest = (this.cur.income.invest ?? 0) + g;
      if (this.investStyle === "stocks" && ret > 0.45) this.log("luck", this.vary("stockUp", ["\u6301\u3063\u3066\u3044\u305F\u682A\u304C\u5927\u304D\u304F\u5024\u4E0A\u304C\u308A\u3057\u305F\u3002", "\u682A\u304C\u5927\u304D\u304F\u4E0A\u304C\u308A\u3001\u8CC7\u7523\u304C\u3075\u304F\u3089\u3093\u3060\u3002", "\u8CB7\u3063\u3066\u304A\u3044\u305F\u682A\u306E\u5024\u6BB5\u304C\u3001\u4E00\u5E74\u3067\u5927\u304D\u304F\u4F38\u3073\u305F\u3002"]), g, true);
      if (ret < -0.25)
        this.log("money", this.again("stockDown", 2) ? this.vary("stockDown2", ["\u682A\u4FA1\u304C\u307E\u305F\u5927\u304D\u304F\u4E0B\u304C\u3063\u305F\u3002", "\u682A\u4FA1\u306E\u4E0B\u843D\u304C\u7D9A\u304D\u3001\u8CC7\u7523\u304C\u3055\u3089\u306B\u6E1B\u3063\u305F\u3002"]) : this.vary("stockDown", ["\u682A\u4FA1\u304C\u5927\u304D\u304F\u4E0B\u304C\u308A\u3001\u8CC7\u7523\u304C\u76EE\u6E1B\u308A\u3057\u305F\u3002", "\u682A\u304C\u66B4\u843D\u3057\u3001\u8CC7\u7523\u304C\u5927\u304D\u304F\u6E1B\u3063\u305F\u3002", "\u682A\u4FA1\u304C\u6025\u843D\u3057\u305F\u3002\u58F2\u3089\u305A\u306B\u6301\u3061\u7D9A\u3051\u305F\u3002"]), g);
      if (a >= 65 && this.cash < 0) {
        const w = Math.min(this.invest, -this.cash + this.y(5e5));
        this.invest -= w;
        this.cash += w;
      }
    }
    this.allocYear();
    if (this.cash > 0 && this.banked) this.cash += this.cash * this.D.ev.depositRate;
    if (this.cash < 0) {
      if (this.invest > 0) {
        const w = Math.min(this.invest, -this.cash);
        this.invest -= w;
        this.cash += w;
      }
      if (this.cash < 0 && !this.welfare && !this.reverseMortgage) this.cash *= 1.02;
    }
    if (a >= 65 && this.cash + this.invest < 0 && this.home === "own" && !this.reverseMortgage) {
      this.reverseMortgage = true;
      this.log("money", "\u5BB6\u3092\u62C5\u4FDD\u306B\u304A\u91D1\u3092\u501F\u308A\u3066\u66AE\u3089\u3059\u3053\u3068\u306B\u3057\u305F\u3002", void 0, true);
    }
    const creditLimit = this.y(this.D.inst?.incomeGroup === "HIC" ? 5e6 : 15e5);
    const overLimit = !this.D.isJapan && this.cash + this.invest < -creditLimit;
    if ((overLimit || a >= 65) && this.cash + this.invest < 0 && (this.home !== "own" || this.cash + this.invest < -this.homeValue || overLimit)) {
      const c = this.cur;
      const inc = ["salary", "partner", "pension", "windfall"].reduce((t, k) => t + (c.income[k] ?? 0), 0);
      const exp = Object.values(c.expense).reduce((t, v) => t + (v ?? 0), 0);
      const gap = exp - inc;
      if (gap > 0) {
        if (!this.welfare) {
          this.publicAid = this.D.isJapan || streamRng(this.seed, "publicAid", 0).chance(publicAidRate(this.D.iso3));
          const text = this.D.isJapan ? "\u8CAF\u3048\u304C\u5C3D\u304D\u3001\u751F\u6D3B\u4FDD\u8B77\u3092\u53D7\u3051\u306F\u3058\u3081\u305F\u3002" : this.publicAid ? a < 65 ? this.vary("aidPub", ["\u66AE\u3089\u3057\u304C\u7ACB\u3061\u884C\u304B\u306A\u304F\u306A\u308A\u3001\u56FD\u306E\u751F\u6D3B\u652F\u63F4\uFF08\u73FE\u91D1\u306E\u7D66\u4ED8\uFF09\u3092\u53D7\u3051\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002", "\u7A3C\u304E\u3060\u3051\u3067\u306F\u66AE\u3089\u305B\u306A\u304F\u306A\u308A\u3001\u56FD\u306E\u751F\u6D3B\u652F\u63F4\u3092\u53D7\u3051\u306F\u3058\u3081\u305F\u3002"]) : "\u8CAF\u3048\u304C\u5C3D\u304D\u3001\u56FD\u306E\u751F\u6D3B\u652F\u63F4\uFF08\u73FE\u91D1\u306E\u7D66\u4ED8\uFF09\u3092\u53D7\u3051\u3066\u66AE\u3089\u3059\u3088\u3046\u306B\u306A\u3063\u305F\u3002" : a < 65 ? this.again("aid", 8) ? this.vary("aid2", ["\u307E\u305F\u501F\u91D1\u304C\u8FD4\u305B\u306A\u304F\u306A\u308A\u3001\u89AA\u621A\u306E\u63F4\u52A9\u3092\u53D7\u3051\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002", "\u518D\u3073\u66AE\u3089\u3057\u304C\u7ACB\u3061\u884C\u304B\u306A\u304F\u306A\u308A\u3001\u89AA\u621A\u3092\u983C\u3063\u305F\u3002"]) : this.vary("aid", ["\u501F\u91D1\u304C\u8FD4\u305B\u306A\u304F\u306A\u308A\u3001\u89AA\u621A\u306B\u52A9\u3051\u3092\u6C42\u3081\u305F\u3002\u3057\u3070\u3089\u304F\u63F4\u52A9\u3092\u53D7\u3051\u3066\u66AE\u3089\u3059\u3002", "\u8FD4\u6E08\u304C\u8FFD\u3044\u3064\u304B\u306A\u304F\u306A\u308A\u3001\u89AA\u621A\u306E\u63F4\u52A9\u3067\u66AE\u3089\u3059\u3053\u3068\u306B\u306A\u3063\u305F\u3002"]) : this.kids.length ? "\u8CAF\u3048\u304C\u5C3D\u304D\u3001\u5B50\u3069\u3082\u305F\u3061\u306E\u4ED5\u9001\u308A\u306B\u983C\u3063\u3066\u66AE\u3089\u3059\u3088\u3046\u306B\u306A\u3063\u305F\u3002" : "\u8CAF\u3048\u304C\u5C3D\u304D\u3001\u89AA\u621A\u3084\u5730\u57DF\u306E\u652F\u3048\u3067\u66AE\u3089\u3059\u3088\u3046\u306B\u306A\u3063\u305F\u3002";
          this.log("money", text, void 0, true);
        }
        this.welfare = true;
        this.addIncome("windfall", gap);
      }
    }
    if (this.welfare && !this.D.isJapan && a < 65 && this.cash + this.invest > 0) {
      this.welfare = false;
      this.log("money", this.publicAid ? this.vary("welfareOffPub", ["\u56FD\u306E\u652F\u63F4\u3092\u53D7\u3051\u305A\u306B\u66AE\u3089\u305B\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u306A\u3093\u3068\u304B\u81EA\u5206\u306E\u7A3C\u304E\u3067\u66AE\u3089\u305B\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002"]) : this.vary("welfareOff", ["\u63F4\u52A9\u3092\u53D7\u3051\u305A\u306B\u66AE\u3089\u305B\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u306A\u3093\u3068\u304B\u81EA\u5206\u306E\u7A3C\u304E\u3067\u66AE\u3089\u305B\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u89AA\u621A\u306B\u983C\u3089\u305A\u306B\u3084\u3063\u3066\u3044\u3051\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002"]));
    }
    const wasFrugal = this.frugal;
    this.frugal = this.cash + this.invest < -this.y(1e6) && this.school === "done";
    if (this.D.isJapan && !this.bankruptAsked && a >= 20 && a < 65 && -(this.cash + this.invest) > 3 * Math.max(this.y(2e6), this.salaryOf(a))) {
      this.bankruptAsked = true;
      this.queueScene(bankruptScene(this));
    }
    if (this.frugal && !wasFrugal && !this.again("frugalFlip", 2))
      this.log(
        "money",
        this.again("frugal", 6) ? this.vary("frugal2", ["\u307E\u305F\u5BB6\u8A08\u304C\u8D64\u5B57\u306B\u306A\u308A\u3001\u7BC0\u7D04\u751F\u6D3B\u306B\u623B\u3063\u305F\u3002", "\u8CAF\u3048\u304C\u518D\u3073\u30DE\u30A4\u30CA\u30B9\u306B\u306A\u308A\u3001\u51FA\u8CBB\u3092\u524A\u3063\u305F\u3002", "\u5BB6\u8A08\u304C\u307E\u305F\u82E6\u3057\u304F\u306A\u3063\u305F\u3002"]) : this.vary("frugal", ["\u5BB6\u8A08\u304C\u8D64\u5B57\u7D9A\u304D\u306B\u306A\u308A\u3001\u7BC0\u7D04\u751F\u6D3B\u3092\u59CB\u3081\u305F\u3002", "\u8CAF\u3048\u304C\u30DE\u30A4\u30CA\u30B9\u306B\u306A\u308A\u3001\u51FA\u8CBB\u3092\u5927\u304D\u304F\u524A\u308B\u3053\u3068\u306B\u3057\u305F\u3002", "\u501F\u91D1\u304C\u3075\u304F\u3089\u307F\u3001\u66AE\u3089\u3057\u3092\u898B\u76F4\u3057\u305F\u3002"])
      );
    if (!this.frugal && wasFrugal && !this.again("recoverFlip", 2))
      this.log("money", this.again("recover", 6) ? this.vary("recover2", ["\u5BB6\u8A08\u304C\u307E\u305F\u6301\u3061\u76F4\u3057\u305F\u3002", "\u3069\u3046\u306B\u304B\u8D64\u5B57\u304B\u3089\u629C\u3051\u51FA\u3057\u305F\u3002"]) : this.vary("recover", ["\u5BB6\u8A08\u304C\u7ACB\u3061\u76F4\u3063\u305F\u3002", "\u8D64\u5B57\u304B\u3089\u629C\u3051\u51FA\u3057\u3001\u3072\u3068\u606F\u3064\u3044\u305F\u3002", "\u501F\u91D1\u304C\u6E1B\u308A\u3001\u5BB6\u8A08\u304C\u843D\u3061\u7740\u3044\u305F\u3002"]));
  }
  livingCosts(r) {
    const a = this.age;
    const reg = this.regionFactor(REGION_LIVING, 1.05, 0.9);
    const s = this.D.living.singleMonthly;
    const share = (k) => (s[k] ?? 0) / Math.max(1, this.D.singleMonthlyTotal() - (s.housing ?? 0) - (s.education ?? 0));
    const fam = this.partner?.alive;
    let annual;
    const elderly = a >= 65 && (this.job === "retired" || this.job === "none");
    if (elderly) {
      annual = this.D.living.retiredCoupleMonthly.expense * 12 * (fam ? 1 : 0.62) * 0.8;
      annual *= a >= 85 ? 0.82 : a >= 75 ? 0.9 : 1;
    } else if (fam) {
      annual = this.D.familyMonthly(a) * 12 * 0.78;
    } else {
      annual = (this.D.singleMonthlyTotal() - (s.housing ?? 0)) * 12 * (a < 30 ? 1 : 1.08);
    }
    const c = this.cur;
    const disp = ["salary", "partner", "pension", "windfall"].reduce((t, k) => t + (c.income[k] ?? 0), 0) - (c.expense.tax ?? 0) + 0.04 * Math.max(0, this.cash + this.invest);
    const ref = elderly ? fam ? this.y(3e6) : this.y(19e5) : fam ? this.y(56e5) : this.y(3e6);
    const scale = Math.min(1.8, Math.max(elderly ? 0.45 : 0.6, Math.pow(Math.max(1, disp) / ref, 0.55)));
    annual *= scale;
    const kidsLiving = this.kids.filter((k) => kidAtHome(k, a) || a - k.born < 22).length;
    annual *= 1 + (kidsLiving > 0 ? 0.08 * kidsLiving : 0);
    annual *= reg * this.thrift * (this.frugal ? 0.8 : 1) * (this.welfare ? 0.75 : 1);
    if (this.home === "parents") annual *= 0.55;
    const rent = this.D.rentFor(this.region) * 12;
    if (this.home === "rent") this.spend("housing", rent * (fam || this.kids.length ? 1.5 : 1) * Math.min(1.4, Math.max(0.5, scale * scale)) * (this.frugal ? 0.85 : 1));
    else if (this.home === "parents") this.spend("housing", this.y(36e4));
    else if (this.home === "own") this.spend("housing", this.housePrice * 9e-3);
    const e = this.D.living.educationCostPerChild;
    for (const k of this.kids) {
      const ka = a - k.born;
      if (ka >= 3 && ka < 18) this.spend("kids", (k.privateSchool ? e.private_total_k_to_hs : e.public_total_k_to_hs) / 15);
      if (k.univ && ka === 18 && !k.decided) {
        k.decided = true;
        const hh = this.householdIncomeGuess();
        if (hh < this.y(5e6) && this.cash + this.invest < this.y(4e6)) {
          k.loan = true;
          this.log("family", "\u5B50\u3069\u3082\u306F\u5968\u5B66\u91D1\u3092\u501F\u308A\u3066\u5927\u5B66\u306B\u9032\u3093\u3060\u3002");
        }
      }
      if (k.univ && !k.loan && ka >= 18 && ka < 22) {
        const priv = k.privateSchool || this.rng("kidUniv" + k.born, 0).chance(this.D.education.privateUniversityShare);
        this.spend("kids", (priv ? e.university_private_4y : e.university_national_4y) / 4 + (k.away ? this.y(1e6) : 0));
      }
    }
    if (this.childSupport && this.kids.some((k) => a - k.born < 18)) this.spend("kids", this.y(6e5));
    if (this.selfStudyUntil > a) this.spend("selfEdu", this.y(4e5));
    if (this.keepHouseCost) this.spend("housing", this.y(2e5));
    const liquid = this.cash + this.invest;
    if (liquid < annual * 2) {
      const spentSoFar = Object.entries(c.expense).reduce((t, [k, v]) => t + (k === "tax" ? 0 : v ?? 0), 0);
      const upcoming = (this.loan > 0 ? this.loanAnnual : 0) + (this.scholarship > 0 && this.school === "done" ? this.scholarshipAnnual : 0);
      const budget = disp - 0.04 * Math.max(0, liquid) - spentSoFar - upcoming + Math.max(0, liquid) * 0.3;
      const minimum = ((fam ? this.y(17e5) : this.y(1e6)) + kidsLiving * this.y(3e5)) * (this.D.isJapan ? 1 : 0.45);
      const capped = Math.max(minimum * (this.home === "parents" ? 0.55 : 1), Math.min(annual, budget));
      if (capped < annual * 0.97 && !this.tight)
        this.log(
          "money",
          this.again("tight", 6) ? this.vary("tight2", ["\u307E\u305F\u3001\u5BB6\u8A08\u3092\u5207\u308A\u3064\u3081\u308B\u66AE\u3089\u3057\u306B\u623B\u3063\u305F\u3002", "\u51FA\u8CBB\u304C\u304B\u3055\u307F\u3001\u518D\u3073\u3084\u308A\u304F\u308A\u304C\u53B3\u3057\u304F\u306A\u3063\u305F\u3002", "\u4ECA\u5E74\u3082\u307E\u305F\u3001\u5916\u98DF\u3084\u8CB7\u3044\u7269\u3092\u63A7\u3048\u305F\u3002", "\u5B89\u3044\u5E97\u3092\u56DE\u3063\u3066\u3001\u98DF\u8CBB\u3092\u6291\u3048\u305F\u3002", "\u4F7F\u3063\u3066\u3044\u306A\u3044\u5951\u7D04\u3092\u89E3\u7D04\u3057\u3066\u3001\u51FA\u8CBB\u3092\u6E1B\u3089\u3057\u305F\u3002"]) : this.vary("tight", ["\u5BB6\u8A08\u3092\u5207\u308A\u3064\u3081\u3066\u66AE\u3089\u3059\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u5916\u98DF\u3084\u8CB7\u3044\u7269\u3092\u6E1B\u3089\u3057\u3066\u3001\u3084\u308A\u304F\u308A\u3059\u308B\u3088\u3046\u306B\u306A\u3063\u305F\u3002", "\u53CE\u5165\u306B\u5408\u308F\u305B\u3066\u3001\u66AE\u3089\u3057\u3092\u5C0F\u3055\u304F\u3057\u305F\u3002", "\u5BB6\u8A08\u7C3F\u3092\u3064\u3051\u3066\u3001\u51FA\u8CBB\u3092\u898B\u76F4\u3057\u305F\u3002"])
        );
      this.tight = capped < annual * 0.97;
      annual = capped;
    } else this.tight = false;
    this.spend("food", annual * share("food"));
    this.spend("utilities", annual * share("utilities"));
    this.spend("car", annual * share("transport_comm"));
    this.spend("fun", annual * share("culture"));
    this.spend("medical", annual * share("medical") * (1 + Math.max(0, a - 50) * 0.03));
    this.spend("other", annual * (share("furniture") + share("clothing") + share("other")));
    void r;
  }
  pensionAnnual() {
    const inst = this.D.inst;
    if (inst) {
      if (this.pensionCovered === null) {
        const r = this.rng("pension", 0);
        const p = inst.incomeGroup === "HIC" ? inst.pensionCoverage * (this.workYears >= 10 ? 1 : 0.6) : this.regularYears >= 15 ? Math.min(0.98, inst.pensionCoverage * 1.8 + 0.2) : inst.pensionCoverage * 0.5;
        this.pensionCovered = r.chance(p);
      }
      if (!this.pensionCovered) return 0;
      const ref = this.lastRegularWage > 0 ? this.lastRegularWage : this.D.regularWage(this.sex, this.edu, 50) * 0.6;
      const years = inst.incomeGroup === "HIC" ? this.workYears : this.regularYears;
      return Math.max(0, ref * inst.pensionReplacementRate * Math.min(1, Math.max(0.3, years / 35)) * this.pensionMult);
    }
    const pm = this.D.ev.pensionMonthly;
    const basic = pm.kokumin_avg * 12 * Math.min(1, (Math.max(this.workYears, 20) + 5) / 40);
    const kosei = (pm.kosei_avg - pm.kokumin_avg) * 12 * Math.min(1.4, this.regularYears / 38) * Math.min(1.5, Math.max(0.6, this.lastRegularWage / this.y(5e6)));
    return Math.max(0, (basic + kosei) * this.pensionMult);
  }
  partnerPension() {
    const inst = this.D.inst;
    if (inst) {
      const p = this.partner;
      if (!p || p.work !== "regular") return 0;
      return this.D.regularWage(p.sex, p.edu, 55) * inst.pensionReplacementRate * 0.8;
    }
    const pm = this.D.ev.pensionMonthly;
    return this.partner?.work === "regular" ? pm.kosei_avg * 12 * 0.9 : pm.kokumin_avg * 12;
  }
  mortality() {
    const a = this.age;
    if (a < 20) return;
    let q = this.D.qx(this.sex, a);
    q *= BAND_MORTALITY[this.band.id] ?? 1;
    q *= this.illMult;
    if (a - this.cancerAge <= 5) q = q + Math.min(0.06, 0.015 * Math.sqrt(this.D.inst?.medicalBurden ?? 1)) * (this.earlyCheckUntil >= this.cancerAge ? 0.5 : 1);
    if (this.selfCare) q *= 1.6;
    if (a >= MAX_AGE - 1) q = 1;
    const r = this.rng("death");
    if (r.chance(Math.min(1, q))) {
      this.dead = true;
      this.deathCause = this.pickCause(r);
      this.log("death", `${a}\u6B73\u3067\u4EA1\u304F\u306A\u3063\u305F\u3002\u6B7B\u56E0\u306F${this.deathCause}\u3002`, void 0, true);
      const funeral = this.prepaidFuneral ? 0 : this.D.living.funeralCost;
      this.spend("events", funeral);
    }
  }
  pickCause(r) {
    const a = this.age;
    if (a - this.cancerAge <= 5 && r.chance(0.7)) return CAUSE_LABEL.cancer;
    const g = a < 40 ? "under40" : a < 65 ? "40to64" : "65plus";
    const shares = this.D.lifetable.causeShare[g];
    const keys = Object.keys(shares);
    const k = r.weighted(keys, keys.map((x) => shares[x]));
    return CAUSE_LABEL[k] ?? CAUSE_LABEL.other;
  }
  // ───────────────────────── 結果 ─────────────────────────
  summary() {
    const incomeTotal = {};
    const expenseTotal = {};
    for (const y of this.records) {
      for (const [k, v] of Object.entries(y.income)) incomeTotal[k] = (incomeTotal[k] ?? 0) + (v ?? 0);
      for (const [k, v] of Object.entries(y.expense)) expenseTotal[k] = (expenseTotal[k] ?? 0) + (v ?? 0);
    }
    const lifetimeIncome = ["salary", "partner", "pension", "windfall"].reduce((s, k) => s + (incomeTotal[k] ?? 0), 0);
    const lifetimeExpense = Object.values(expenseTotal).reduce((s, v) => s + (v ?? 0), 0);
    return {
      seed: this.seed,
      birthYear: this.birthYear,
      sex: this.sex,
      regionId: this.region.id,
      regionLabel: this.region.label,
      familyBandId: this.band.id,
      familyBandLabel: this.band.label,
      deathAge: this.age,
      deathCause: this.deathCause,
      edu: this.edu,
      incomeTotal,
      expenseTotal,
      lifetimeIncome,
      lifetimeExpense,
      finalBalance: Math.round(this.balance),
      ownsHome: this.home === "own",
      married: !!this.partner || this.widowed || this.partnerSince >= 0,
      kids: this.kids.length,
      choices: this.choiceLog.map(({ id, optionId, label, age }) => ({ id, optionId, label, age }))
    };
  }
};
function bandUnivRate(l) {
  const mid = (l.band.min + Math.min(l.band.max, l.y(15e6))) / 2;
  return l.D.univRateForIncome(mid);
}
var opt = (id, label, desc) => ({ id, label, desc });
function buildChoice(l, id) {
  const r = streamRng(l.seed, "avail:" + id, l.age);
  const a = l.age;
  const low = l.band.id === "low" || l.band.id === "lower_mid";
  let title = "";
  let situation = "";
  const options = [];
  switch (id) {
    case "afterJHS": {
      title = "\u4E2D\u5B66\u5352\u696D\u5F8C\u306E\u9032\u8DEF";
      const jp2 = l.D.isJapan;
      const bandF = [2, 1.4, 1, 0.5, 0.2][l.bandIdx] ?? 1;
      const pNoFull = jp2 ? l.band.id === "low" ? 0.08 : l.band.id === "lower_mid" ? 0.03 : 8e-3 : Math.min(0.92, (1 - l.D.education.highSchoolEntryRate) * bandF);
      const pAdj = l.childWorked ? 1 - (1 - pNoFull) * (2 / 3) : l.futokoAge >= 12 ? Math.max(pNoFull, 0.149) : pNoFull;
      const noFull = r.chance(pAdj);
      if (noFull) {
        situation = jp2 ? "\u5BB6\u8A08\u304C\u82E6\u3057\u304F\u3001\u5168\u65E5\u5236\u306E\u9AD8\u6821\u306B\u901A\u308F\u305B\u308B\u4F59\u88D5\u304C\u306A\u3044\u3068\u89AA\u306B\u8A00\u308F\u308C\u305F\u3002" : "\u5BB6\u8A08\u304C\u82E6\u3057\u304F\u3001\u4E0A\u306E\u5B66\u6821\u306B\u901A\u308F\u305B\u308B\u4F59\u88D5\u306F\u306A\u3044\u3068\u89AA\u306B\u8A00\u308F\u308C\u305F\u3002";
        options.push(
          opt("night", jp2 ? "\u5B9A\u6642\u5236\u9AD8\u6821\u306B\u901A\u3044\u306A\u304C\u3089\u50CD\u304F" : "\u50CD\u304D\u306A\u304C\u3089\u591C\u9593\u306E\u5B66\u6821\u306B\u901A\u3046", "\u5352\u696D\u8CC7\u683C\u3092\u76EE\u6307\u305B\u308B\u3002\u50CD\u304F\u5206\u3001\u4E2D\u9000\u3057\u3084\u3059\u3044\u3002"),
          opt("work", jp2 ? "\u5C31\u8077\u3059\u308B" : "\u50CD\u304D\u306B\u51FA\u308B", "\u65E9\u304F\u304B\u3089\u7A3C\u3052\u308B\u3002\u305F\u3060\u3057\u5B66\u6B74\u304C\u4F4E\u3044\u3068\u7D66\u6599\u306F\u4F38\u3073\u306B\u304F\u3044\u3002")
        );
        if (!jp2 && !l.region.urban) options.push(opt("farm", "\u5BB6\u306E\u8FB2\u4F5C\u696D\u3092\u624B\u4F1D\u3046", "\u5BB6\u65CF\u3068\u4E00\u7DD2\u306B\u3044\u3089\u308C\u308B\u3002\u73FE\u91D1\u53CE\u5165\u306F\u5C11\u306A\u3044\u3002"));
      } else {
        situation = `\u6210\u7E3E\u306F\u30AF\u30E9\u30B9\u3067${l.aptitude > 0.7 ? "\u4E0A\u306E\u307B\u3046" : l.aptitude > 0.4 ? "\u771F\u3093\u4E2D\u304F\u3089\u3044" : "\u4E0B\u306E\u307B\u3046"}\u3002`;
        options.push(opt("public", jp2 ? "\u516C\u7ACB\u9AD8\u6821\u3078" : "\u516C\u7ACB\u306E\u9AD8\u6821\u3078", "\u5B66\u8CBB\u306F\u5B89\u3044\u3002\u9032\u8DEF\u306F\u81EA\u5206\u6B21\u7B2C\u3002"));
        if (!low || r.chance(0.35))
          options.push(opt("private", "\u79C1\u7ACB\u9AD8\u6821\u3078", low ? "\u7279\u5F85\u751F\u306E\u8A71\u304C\u3042\u308B\u3002\u5BB6\u8A08\u306E\u8CA0\u62C5\u306F\u6B8B\u308A\u3001\u4E8B\u60C5\u3067\u4E2D\u9000\u3059\u308B\u30EA\u30B9\u30AF\u3082\u3002" : "\u5927\u5B66\u9032\u5B66\u306B\u306F\u6709\u5229\u3002\u5B66\u8CBB\u306F\u89AA\u306E\u8CA0\u62C5\u306B\u3002"));
        options.push(
          opt("kosen", jp2 ? "\u9AD8\u5C02\u3078\uFF085\u5E74\u5236\uFF09" : "\u8077\u696D\u6280\u8853\u5B66\u6821\u3078\uFF085\u5E74\u5236\uFF09", "\u6280\u8853\u8077\u306E\u5C31\u8077\u306B\u5F37\u3044\u3002\u9032\u8DEF\u304C\u65E9\u304F\u56FA\u307E\u308A\u3001\u5411\u304D\u4E0D\u5411\u304D\u304C\u51FA\u3084\u3059\u3044\u3002"),
          opt("work", jp2 ? "\u5C31\u8077\u3059\u308B" : "\u50CD\u304D\u306B\u51FA\u308B", "\u65E9\u304F\u7A3C\u3052\u3066\u81EA\u7ACB\u3067\u304D\u308B\u3002\u7D66\u6599\u306E\u4F38\u3073\u306F\u5C0F\u3055\u3044\u3002")
        );
        if (low && !options.some((o) => o.id === "private")) situation += "\u79C1\u7ACB\u306B\u884C\u304F\u4F59\u88D5\u306F\u306A\u3044\u3002";
      }
      break;
    }
    case "afterHS": {
      if (l.school === "kosen") {
        title = "\u9AD8\u5C02\u5352\u696D\u5F8C\u306E\u9032\u8DEF";
        situation = "\u9AD8\u5C02\u306E5\u5E74\u9593\u304C\u7D42\u308F\u3063\u305F\u3002";
        options.push(
          opt("job", "\u5C31\u8077\u3059\u308B", "\u30E1\u30FC\u30AB\u30FC\u306E\u6280\u8853\u8077\u306A\u3069\u306B\u5C31\u304D\u3084\u3059\u3044\u3002"),
          opt("transfer", "\u5927\u5B663\u5E74\u306B\u7DE8\u5165\u3059\u308B", "\u5927\u5352\u306B\u306A\u308C\u308B\u3002\u5B66\u8CBB\u304C2\u5E74\u5206\u304B\u304B\u308B\u3002")
        );
        break;
      }
      if (l.school === "done" && !l.hsGraduated) {
        title = "18\u6B73\u306E\u5206\u304B\u308C\u9053";
        situation = "\u50CD\u304D\u306F\u3058\u3081\u3066\u6570\u5E74\u3002\u540C\u7D1A\u751F\u306F\u5927\u5B66\u3084\u5C31\u8077\u3078\u9032\u3093\u3067\u3044\u304F\u3002";
        options.push(
          opt("stay", "\u4ECA\u306E\u4ED5\u4E8B\u3092\u7D9A\u3051\u308B", "\u7D4C\u9A13\u306F\u7A4D\u307F\u4E0A\u304C\u308B\u3002\u5B66\u6B74\u306B\u3088\u308B\u5DEE\u306F\u6B8B\u308B\u3002"),
          opt("night_univ", "\u50CD\u304D\u306A\u304C\u3089\u591C\u9593\u30FB\u901A\u4FE1\u3067\u5B66\u3076", "\u5B66\u8CBB\u3068\u6642\u9593\u306E\u8CA0\u62C5\u306F\u5927\u304D\u3044\u304C\u3001\u5352\u696D\u3067\u304D\u308C\u3070\u5927\u5352\u306B\u3002"),
          opt("license", "\u8CC7\u683C\u3092\u53D6\u3063\u3066\u624B\u306B\u8077\u3092\u3064\u3051\u308B", "\u8CBB\u7528\u306F\u304B\u304B\u308B\u3002\u53D6\u308C\u308C\u3070\u53CE\u5165\u304C\u4E0A\u304C\u308B\u898B\u8FBC\u307F\u3002")
        );
        break;
      }
      title = "\u9AD8\u6821\u5352\u696D\u5F8C\u306E\u9032\u8DEF";
      const pUniv = bandUnivRate(l) / Math.max(0.01, l.D.education.universityEntryByHouseholdIncome.over1000);
      const noSupport = r.chance(Math.max(0.03, 0.85 - pUniv * 0.85));
      if (noSupport) {
        situation = "\u89AA\u304B\u3089\u306F\u300C\u5B66\u8CBB\u306F\u51FA\u305B\u306A\u3044\u300D\u3068\u8A00\u308F\u308C\u305F\u3002";
        options.push(
          opt("univ_loan", "\u5968\u5B66\u91D1\u3092\u501F\u308A\u3066\u5927\u5B66\u3078", "\u5927\u5352\u306E\u9053\u304C\u958B\u304F\u3002\u6570\u767E\u4E07\u5186\u306E\u8FD4\u6E08\u3068\u3001\u30A2\u30EB\u30D0\u30A4\u30C8\u6F2C\u3051\u306E\u65E5\u3005\u3002"),
          opt("univ_night", "\u50CD\u304D\u306A\u304C\u3089\u591C\u9593\u306E\u5927\u5B66\u3078", "\u501F\u91D1\u306F\u5C11\u306A\u3044\u3002\u5352\u696D\u307E\u3067\u305F\u3069\u308A\u7740\u3051\u308B\u304B\u306F\u4F53\u529B\u6B21\u7B2C\u3002"),
          opt("voc_loan", "\u5968\u5B66\u91D1\u3067\u5C02\u9580\u5B66\u6821\u3078", "2\u5E74\u3067\u624B\u306B\u8077\u3002\u696D\u754C\u306B\u3088\u3063\u3066\u7D66\u6599\u306E\u5DEE\u304C\u5927\u304D\u3044\u3002"),
          opt("job", "\u5C31\u8077\u3059\u308B", "\u3059\u3050\u306B\u7A3C\u3052\u308B\u3002\u7D66\u6599\u306F\u9AD8\u5352\u306E\u6C34\u6E96\u3067\u4E0A\u304C\u3063\u3066\u3044\u304F\u3002")
        );
      } else {
        situation = "\u5927\u5B66\u306B\u884C\u304F\u306A\u3089\u5B66\u8CBB\u306F\u89AA\u304C\u51FA\u3057\u3066\u304F\u308C\u308B\u3089\u3057\u3044\u3002";
        options.push(
          opt("national", "\u56FD\u516C\u7ACB\u5927\u5B66\u3092\u76EE\u6307\u3059", "\u5B66\u8CBB\u306F\u5B89\u3044\u3002\u5408\u683C\u3067\u304D\u308B\u304B\u306F\u5206\u304B\u3089\u306A\u3044\u3002"),
          opt("private_univ", "\u79C1\u7ACB\u5927\u5B66\u3078", "\u5408\u683C\u306F\u3057\u3084\u3059\u3044\u3002\u5B66\u8CBB\u306F\u9AD8\u3044\u3002"),
          opt("vocational", "\u5C02\u9580\u5B66\u6821\u3078", "2\u5E74\u3067\u5C31\u8077\u3002\u8CC7\u683C\u8077\u306A\u3089\u5B89\u5B9A\u3002"),
          opt("job", "\u5C31\u8077\u3059\u308B", "\u65E9\u304F\u7A3C\u3052\u308B\u3002\u5927\u5352\u3068\u306E\u7D66\u6599\u5DEE\u306F\u5E83\u304C\u308A\u3084\u3059\u3044\u3002")
        );
      }
      break;
    }
    case "firstJob": {
      title = "\u6700\u521D\u306E\u50CD\u304D\u65B9";
      const eduLabel = {
        junior_high: "\u4E2D\u5352",
        high_school: "\u9AD8\u5352",
        vocational: "\u5C02\u9580\u30FB\u9AD8\u5C02\u5352",
        university: "\u5927\u5352",
        graduate: "\u5927\u5B66\u9662\u5352"
      };
      situation = `${eduLabel[l.edu]}\u3001${a}\u6B73\u3002\u3069\u3046\u50CD\u304F\uFF1F`;
      options.push(
        opt("big", "\u5927\u4F01\u696D\u306E\u6B63\u793E\u54E1\u3092\u76EE\u6307\u3059", "\u7D66\u6599\u306F\u9AD8\u3081\u3002\u8EE2\u52E4\u3084\u6FC0\u52D9\u3001\u4E2D\u9AD8\u5E74\u3067\u306E\u65E9\u671F\u9000\u8077\u3082\u3042\u308A\u3046\u308B\u3002\u53D7\u304B\u308B\u3068\u306F\u9650\u3089\u306A\u3044\u3002"),
        opt("sme", "\u4E2D\u5C0F\u4F01\u696D\u306E\u6B63\u793E\u54E1\u306B\u306A\u308B", "\u5730\u5143\u3067\u50CD\u3051\u308B\u3002\u7D66\u6599\u306F\u63A7\u3048\u3081\u3067\u3001\u4F1A\u793E\u306E\u696D\u7E3E\u306B\u5DE6\u53F3\u3055\u308C\u308B\u3002")
      );
      if (l.edu !== "junior_high") options.push(opt("civil", "\u516C\u52D9\u54E1\u8A66\u9A13\u3092\u53D7\u3051\u308B", "\u5B89\u5B9A\u3057\u3066\u3044\u3066\u89E3\u96C7\u306F\u307E\u305A\u306A\u3044\u3002\u7D66\u6599\u306E\u4F38\u3073\u306F\u7A4F\u3084\u304B\u3002\u843D\u3061\u308B\u3053\u3068\u3082\u3042\u308B\u3002"));
      options.push(opt("nonregular", "\u975E\u6B63\u898F\u3067\u81EA\u7531\u306B\u50CD\u304F", "\u6642\u9593\u306E\u878D\u901A\u304C\u304D\u304F\u3002\u7D66\u6599\u306F\u4E0A\u304C\u308A\u306B\u304F\u304F\u3001\u96C7\u3044\u6B62\u3081\u3082\u3042\u308B\u3002"));
      if (l.edu === "vocational" || l.edu === "university" || l.edu === "graduate" || r.chance(0.4))
        options.push(opt("freelance", "\u30D5\u30EA\u30FC\u30E9\u30F3\u30B9\u306B\u306A\u308B", "\u8155\u6B21\u7B2C\u3067\u7A3C\u3052\u308B\u3002\u53CE\u5165\u306F\u6BCE\u5E74\u3070\u3089\u3064\u304F\u3002"));
      break;
    }
    case "invest": {
      title = "\u6295\u8CC7\u3092\u59CB\u3081\u308B\u304B";
      situation = `${a}\u6B73\u3002\u8CAF\u91D1\u306F${l.D.fmt(Math.max(0, l.cash))}\u3002${l.D.isJapan ? "\u5468\u308A\u3067NISA\u306E\u8A71\u3092\u805E\u304F\u3088\u3046\u306B\u306A\u3063\u305F\u3002" : "\u5468\u308A\u3067\u6295\u8CC7\u306E\u8A71\u3092\u805E\u304F\u3088\u3046\u306B\u306A\u3063\u305F\u3002"}`;
      if (!l.banked) {
        situation += "\u305F\u3060\u3001\u53E3\u5EA7\u3092\u6301\u3063\u3066\u3044\u306A\u3044\u306E\u3067\u3001\u6295\u8CC7\u306F\u3067\u304D\u306A\u3044\u3002";
        options.push(
          opt("deposit", "\u624B\u5143\u306B\u8CAF\u3081\u3066\u304A\u304F", "\u53E3\u5EA7\u304C\u306A\u3044\u306E\u3067\u5229\u606F\u306F\u3064\u304B\u306A\u3044\u3002\u7269\u4FA1\u304C\u4E0A\u304C\u308B\u3068\u76EE\u6E1B\u308A\u3059\u308B\u3002"),
          opt("self", "\u81EA\u5206\u306B\u6295\u8CC7\u3059\u308B\uFF08\u8CC7\u683C\u30FB\u30B9\u30AD\u30EB\uFF09", "\u6570\u5E74\u9593\u306E\u51FA\u8CBB\u3002\u53CE\u5165\u304C\u4E0A\u304C\u308B\u4FDD\u8A3C\u306F\u306A\u3044\u3002")
        );
        break;
      }
      options.push(
        opt("index", "\u6BCE\u6708\u30B3\u30C4\u30B3\u30C4\u7A4D\u7ACB\u6295\u8CC7", "\u9577\u304F\u7D9A\u3051\u308C\u3070\u5897\u3048\u3084\u3059\u3044\u3002\u66B4\u843D\u306E\u5E74\u306F\u8CC7\u7523\u304C\u76EE\u6E1B\u308A\u3059\u308B\u3002"),
        opt("stocks", "\u500B\u5225\u682A\u3067\u653B\u3081\u308B", "\u5927\u304D\u304F\u5897\u3048\u308B\u3053\u3068\u3082\u3001\u5927\u304D\u304F\u6E1B\u308B\u3053\u3068\u3082\u3042\u308B\u3002"),
        opt("deposit", "\u8CAF\u91D1\u3060\u3051\u306B\u3059\u308B", "\u91D1\u984D\u306F\u6E1B\u3089\u306A\u3044\u3002\u7269\u4FA1\u304C\u4E0A\u304C\u308B\u3068\u76EE\u6E1B\u308A\u3057\u3001\u307B\u307C\u5897\u3048\u306A\u3044\u3002"),
        opt("self", "\u81EA\u5206\u306B\u6295\u8CC7\u3059\u308B\uFF08\u8CC7\u683C\u30FB\u30B9\u30AD\u30EB\uFF09", "\u6570\u5E74\u9593\u306E\u51FA\u8CBB\u3002\u53CE\u5165\u304C\u4E0A\u304C\u308B\u4FDD\u8A3C\u306F\u306A\u3044\u3002")
      );
      break;
    }
    case "marriageHome": {
      title = "\u7D50\u5A5A\u3068\u4F4F\u307E\u3044";
      const p = l.partner;
      if (p) {
        situation = `\u7D50\u5A5A\u3057\u3066${a - l.partnerSince}\u5E74\u3002${l.kids.length ? `\u5B50\u3069\u3082\u306F${l.kids.length}\u4EBA\u3002` : ""}\u4F4F\u307E\u3044\u3092\u3069\u3046\u3059\u308B\uFF1F`;
        options.push(
          opt("rent", "\u8CC3\u8CB8\u306E\u307E\u307E\u66AE\u3089\u3059", "\u8EAB\u8EFD\u306B\u5F15\u3063\u8D8A\u305B\u308B\u3002\u5BB6\u8CC3\u306F\u4E00\u751F\u304B\u304B\u308B\u3002"),
          opt("buy", "\u5BB6\u3092\u8CB7\u3046\uFF0835\u5E74\u30ED\u30FC\u30F3\uFF09", "\u8001\u5F8C\u306E\u5BB6\u8CC3\u306F\u304B\u304B\u3089\u306A\u3044\u3002\u707D\u5BB3\u3084\u4FEE\u7E55\u306E\u30EA\u30B9\u30AF\u3001\u30ED\u30FC\u30F3\u8FD4\u6E08\u304C\u7D9A\u304F\u3002")
        );
        if (l.parents.some((x) => x.alive)) options.push(opt("withParents", "\u89AA\u3068\u4E8C\u4E16\u5E2F\u3067\u4F4F\u3080", "\u4F4F\u5C45\u8CBB\u304C\u6D6E\u304D\u3001\u5B50\u80B2\u3066\u306E\u624B\u3082\u501F\u308A\u3089\u308C\u308B\u3002\u6C17\u3092\u3064\u304B\u3046\u66AE\u3089\u3057\u3002"));
      } else {
        const met = l.dating || r.chance(0.32 * l.marriageHazard(a) / Math.max(0.01, l.D.ev.marriageByAge["30s"]));
        if (met) {
          situation = l.dating ? `\u4ED8\u304D\u5408\u3063\u3066${Math.max(1, a - l.datingSince)}\u5E74\u306E\u604B\u4EBA\u304B\u3089\u3001\u5C06\u6765\u306E\u8A71\u3092\u3055\u308C\u305F\u3002` : "\u4ED8\u304D\u5408\u3063\u3066\u3044\u308B\u4EBA\u304B\u3089\u3001\u5C06\u6765\u306E\u8A71\u3092\u3055\u308C\u305F\u3002";
          options.push(
            opt("marryRent", "\u7D50\u5A5A\u3057\u3066\u8CC3\u8CB8\u3067\u66AE\u3089\u3059", "\u3075\u305F\u308A\u306E\u53CE\u5165\u3067\u66AE\u3089\u3057\u304C\u5B89\u5B9A\u3057\u3084\u3059\u3044\u3002\u51FA\u8CBB\u3082\u5897\u3048\u308B\u3002"),
            opt("marryBuy", "\u7D50\u5A5A\u3057\u3066\u5BB6\u3092\u8CB7\u3046", "\u6301\u3061\u5BB6\u3067\u843D\u3061\u7740\u3051\u308B\u3002\u30ED\u30FC\u30F3\u304C\u9577\u304F\u7D9A\u304F\u3002"),
            opt("single", "\u7D50\u5A5A\u306F\u3057\u306A\u3044", "\u81EA\u7531\u306B\u4F7F\u3048\u308B\u304A\u91D1\u3068\u6642\u9593\u3002\u8001\u5F8C\u306F\u4E00\u4EBA\u3067\u5099\u3048\u308B\u3002")
          );
        } else {
          situation = "30\u6B73\u3001\u30D1\u30FC\u30C8\u30CA\u30FC\u306F\u3044\u306A\u3044\u3002";
          options.push(
            opt("konkatsu", "\u5A5A\u6D3B\u306B\u304A\u91D1\u3092\u304B\u3051\u308B", "\u51FA\u4F1A\u3044\u306F\u5897\u3048\u308B\u3002\u7D50\u5A5A\u3067\u304D\u308B\u4FDD\u8A3C\u306F\u306A\u3044\u3002"),
            opt("solo", "\u304A\u3072\u3068\u308A\u3055\u307E\u3067\u751F\u304D\u308B", "\u8EAB\u8EFD\u3067\u81EA\u7531\u3002\u8001\u5F8C\u306E\u4F4F\u307E\u3044\u3068\u304A\u91D1\u306F\u81EA\u5206\u3067\u5099\u3048\u308B\u3002"),
            opt("condo", "\u4E00\u4EBA\u7528\u306E\u30DE\u30F3\u30B7\u30E7\u30F3\u3092\u8CB7\u3046", "\u8001\u5F8C\u306E\u4F4F\u307E\u3044\u304C\u78BA\u4FDD\u3067\u304D\u308B\u3002\u30ED\u30FC\u30F3\u3092\u4E00\u4EBA\u3067\u80CC\u8CA0\u3046\u3002")
          );
          if (l.parents.some((x) => x.alive)) options.push(opt("home", "\u5B9F\u5BB6\u306B\u623B\u308B", "\u4F4F\u5C45\u8CBB\u304C\u6D6E\u3044\u3066\u8CAF\u91D1\u3057\u3084\u3059\u3044\u3002\u89AA\u306E\u4ECB\u8B77\u304C\u8EAB\u8FD1\u306B\u306A\u308B\u3002"));
        }
      }
      if (l.bankruptAge >= 0 && a - l.bankruptAge < 7) {
        const keep = options.filter((o) => o.id !== "buy" && o.id !== "marryBuy" && o.id !== "condo");
        options.length = 0;
        options.push(...keep);
      }
      break;
    }
    case "careerShift": {
      title = "\u8EE2\u8077\u30FB\u72EC\u7ACB";
      const j = l.job;
      if (j === "big" || j === "sme" || j === "civil") {
        situation = `${a}\u6B73\u3001${l.manager ? jobLabel(j).replace(/の正社員$/, "") + "\u306E\u7BA1\u7406\u8077" : jobLabel(j)}\u3002\u5E74\u53CE\u306F${l.D.fmt(l.salaryOf(a))}\u307B\u3069\u3002`;
        options.push(
          opt("stay", "\u4ECA\u306E\u8077\u5834\u306B\u6B8B\u308B", "\u6607\u9032\u306E\u30C1\u30E3\u30F3\u30B9\u306F\u3042\u308B\u3002\u4F1A\u793E\u306E\u90FD\u5408\u306B\u632F\u308A\u56DE\u3055\u308C\u308B\u3053\u3068\u3082\u3002"),
          opt("change", "\u8EE2\u8077\u3059\u308B", "\u7D66\u6599\u304C\u4E0A\u304C\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3057\u3001\u4E0B\u304C\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002"),
          opt("found", "\u72EC\u7ACB\u30FB\u8D77\u696D\u3059\u308B", "\u5F53\u305F\u308C\u3070\u5927\u304D\u3044\u30025\u5E74\u4EE5\u5185\u306B\u305F\u305F\u3080\u4F1A\u793E\u3082\u591A\u3044\u3002")
        );
      } else if (j === "nonregular" || j === "none") {
        situation = `${a}\u6B73\u3001${j === "none" ? "\u3044\u307E\u306F\u4ED5\u4E8B\u3092\u3057\u3066\u3044\u306A\u3044" : "\u975E\u6B63\u898F\u3067\u50CD\u3044\u3066\u3044\u308B"}\u3002`;
        options.push(
          opt("seekRegular", "\u6B63\u793E\u54E1\u3092\u76EE\u6307\u3057\u3066\u8EE2\u8077\u6D3B\u52D5", "\u306A\u308C\u308C\u3070\u7D66\u6599\u3068\u5E74\u91D1\u304C\u5B89\u5B9A\u3002\u306A\u308C\u306A\u3044\u3053\u3068\u3082\u3042\u308B\u3002"),
          opt("keep", "\u4ECA\u306E\u50CD\u304D\u65B9\u3092\u7D9A\u3051\u308B", "\u751F\u6D3B\u306E\u30DA\u30FC\u30B9\u306F\u4FDD\u3066\u308B\u3002\u53CE\u5165\u306F\u5927\u304D\u304F\u5909\u308F\u3089\u306A\u3044\u3002"),
          opt("license", "\u8CC7\u683C\u3092\u53D6\u308A\u306B\u5B66\u6821\u3078", "\u5B66\u8CBB\u3068\u6642\u9593\u304C\u304B\u304B\u308B\u3002\u53D6\u308C\u308C\u3070\u9053\u304C\u5E83\u304C\u308B\u3002"),
          opt("found", "\u5C0F\u3055\u304F\u8D77\u696D\u3059\u308B", "\u5F53\u305F\u308C\u3070\u5927\u304D\u3044\u3002\u5931\u6557\u3059\u308C\u3070\u501F\u91D1\u304C\u6B8B\u308B\u3053\u3068\u3082\u3002")
        );
      } else {
        situation = `${a}\u6B73\u3001${jobLabel(j)}\u3068\u3057\u3066\u50CD\u3044\u3066\u3044\u308B\u3002`;
        options.push(
          opt("keep", "\u3053\u306E\u307E\u307E\u7D9A\u3051\u308B", "\u81EA\u5206\u306E\u30DA\u30FC\u30B9\u3067\u50CD\u3051\u308B\u3002\u53CE\u5165\u306F\u5E74\u306B\u3088\u3063\u3066\u6CE2\u304C\u3042\u308B\u3002"),
          opt("employee", "\u4F1A\u793E\u54E1\u306B\u623B\u308B", "\u53CE\u5165\u304C\u5B89\u5B9A\u3057\u3001\u539A\u751F\u5E74\u91D1\u306B\u5165\u308C\u308B\u3002\u81EA\u7531\u306F\u6E1B\u308B\u3002"),
          opt("expand", "\u4E8B\u696D\u3092\u5E83\u3052\u308B", "\u4EBA\u3092\u96C7\u3063\u3066\u52DD\u8CA0\u3059\u308B\u3002\u5931\u6557\u3059\u308C\u3070\u501F\u91D1\u304C\u6B8B\u308B\u3002")
        );
      }
      break;
    }
    case "parentCare": {
      const alive = l.parents.some((x) => x.alive);
      title = alive ? "\u89AA\u306E\u4ECB\u8B77\u3078\u306E\u5411\u304D\u5408\u3044\u65B9" : l.heir ? "\u3053\u308C\u304B\u3089\u306E\u5099\u3048" : "\u7A7A\u304D\u5BB6\u306B\u306A\u3063\u305F\u5B9F\u5BB6";
      if (!alive && l.heir) {
        situation = "\u4E21\u89AA\u306F\u3059\u3067\u306B\u4ED6\u754C\u3057\u3066\u3044\u308B\u3002\u89AA\u304C\u6B8B\u3057\u305F\u3082\u306E\u306E\u6574\u7406\u306F\u3001\u4EA1\u304F\u306A\u3063\u305F\u3068\u304D\u306B\u6E08\u307E\u305B\u305F\u3002\u3053\u308C\u304B\u3089\u3001\u81EA\u5206\u306E\u8001\u5F8C\u306B\u3069\u3046\u5099\u3048\u308B\uFF1F";
        options.push(
          opt("saveMore", "\u8001\u5F8C\u306B\u5411\u3051\u3066\u8CAF\u91D1\u3092\u5897\u3084\u3059", "\u66AE\u3089\u3057\u3092\u5C11\u3057\u5207\u308A\u3064\u3081\u308B\u3002\u6B8B\u305B\u308B\u304A\u91D1\u306F\u5897\u3048\u308B\u3002"),
          opt("enjoyNow", "\u4ECA\u306E\u66AE\u3089\u3057\u3092\u697D\u3057\u3080", "\u65C5\u884C\u3084\u8DA3\u5473\u306B\u304A\u91D1\u3092\u4F7F\u3046\u3002\u6B8B\u308B\u304A\u91D1\u306F\u6E1B\u308B\u3002"),
          ...l.kids.length ? [opt("helpKids", "\u5B50\u3069\u3082\u306E\u66AE\u3089\u3057\u3092\u624B\u4F1D\u3046", "\u307E\u3068\u307E\u3063\u305F\u304A\u91D1\u3092\u5B50\u3069\u3082\u306B\u6E21\u3059\u3002\u81EA\u5206\u306E\u624B\u5143\u306F\u6E1B\u308B\u3002")] : []
        );
      } else if (!alive) {
        situation = "\u4E21\u89AA\u306F\u3059\u3067\u306B\u4ED6\u754C\u3057\u3066\u3044\u308B\u3002\u5B9F\u5BB6\u304C\u7A7A\u304D\u5BB6\u306E\u307E\u307E\u6B8B\u3063\u3066\u3044\u308B\u3002";
        options.push(
          opt("sellHouse", "\u5B9F\u5BB6\u3092\u58F2\u308B", "\u307E\u3068\u307E\u3063\u305F\u304A\u91D1\u306B\u306A\u308B\u304B\u3082\u3057\u308C\u306A\u3044\u3002\u5730\u57DF\u306B\u3088\u3063\u3066\u306F\u8CB7\u3044\u624B\u304C\u3064\u304B\u306A\u3044\u3002"),
          opt("keepHouse", "\u5B9F\u5BB6\u3092\u6B8B\u3057\u3066\u304A\u304F", "\u601D\u3044\u51FA\u306E\u5834\u6240\u3092\u5B88\u308C\u308B\u3002\u56FA\u5B9A\u8CC7\u7523\u7A0E\u3068\u7BA1\u7406\u306E\u624B\u9593\u304C\u304B\u304B\u308B\u3002"),
          opt("moveIn", "\u5B9F\u5BB6\u306B\u79FB\u308A\u4F4F\u3080", "\u4F4F\u5C45\u8CBB\u304C\u6D6E\u304F\u3002\u4ED5\u4E8B\u3084\u66AE\u3089\u3057\u3092\u5909\u3048\u308B\u5FC5\u8981\u304C\u3042\u308B\u3002")
        );
      } else {
        const who = l.careTriggered ? l.careParent === 0 ? "\u7236" : "\u6BCD" : "\u89AA";
        const together = l.livesWithParents;
        situation = together ? `\u4E00\u7DD2\u306B\u66AE\u3089\u3057\u3066\u3044\u308B${who}\u306B\u4ECB\u8B77\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3002\u540C\u3058\u5BB6\u306B\u3044\u308B\u3076\u3093\u3001\u81EA\u5206\u304C\u898B\u308B\u3053\u3068\u306B\u306A\u308A\u305D\u3046\u3060\u3002\u3069\u3046\u5411\u304D\u5408\u3046\uFF1F` : l.careTriggered ? `${who}\u306B\u4ECB\u8B77\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3002\u3069\u3046\u5411\u304D\u5408\u3046\uFF1F` : `${who}\u304C\u9AD8\u9F62\u306B\u306A\u308A\u3001\u4ECB\u8B77\u304C\u5FC5\u8981\u306B\u306A\u3063\u305F\u3002\u3069\u3046\u5411\u304D\u5408\u3046\uFF1F`;
        if (together) {
          options.push(
            opt("liveIn", "\u540C\u3058\u5BB6\u3067\u3001\u50CD\u304D\u306A\u304C\u3089\u81EA\u5206\u304C\u898B\u308B", "\u901A\u3046\u624B\u9593\u3082\u4EA4\u901A\u8CBB\u3082\u304B\u304B\u3089\u306A\u3044\u3002\u591C\u3084\u4F11\u65E5\u3082\u4ECB\u8B77\u304C\u7D9A\u304D\u3001\u4ED5\u4E8B\u306F\u5C11\u3057\u6E1B\u308B\u3002"),
            opt("facility", "\u65BD\u8A2D\u306B\u5165\u3063\u3066\u3082\u3089\u3046", "\u4ED5\u4E8B\u306F\u7D9A\u3051\u3089\u308C\u308B\u3002\u8CBB\u7528\u306F\u6BCE\u6708\u304B\u304B\u308A\u7D9A\u3051\u308B\u3002"),
            opt("quit", "\u4ED5\u4E8B\u3092\u8F9E\u3081\u3066\u4ECB\u8B77\u306B\u5C02\u5FF5", "\u305D\u3070\u306B\u3044\u3089\u308C\u308B\u3002\u53CE\u5165\u304C\u9014\u7D76\u3048\u3001\u5FA9\u8077\u306F\u7C21\u5358\u3067\u306F\u306A\u3044\u3002")
          );
          if (l.siblingsNow > 0) options.push(opt("share", "\u5BB6\u3092\u51FA\u305F\u304D\u3087\u3046\u3060\u3044\u306B\u3082\u983C\u3080", "\u8CA0\u62C5\u3092\u5206\u3051\u5408\u3048\u308B\u3002\u540C\u5C45\u3057\u3066\u3044\u308B\u81EA\u5206\u306B\u8CA0\u62C5\u304C\u5BC4\u308A\u304C\u3061\u3002"));
        } else {
          options.push(
            opt("facility", "\u65BD\u8A2D\u306B\u5165\u3063\u3066\u3082\u3089\u3046", "\u4ED5\u4E8B\u306F\u7D9A\u3051\u3089\u308C\u308B\u3002\u8CBB\u7528\u306F\u6BCE\u6708\u304B\u304B\u308A\u7D9A\u3051\u308B\u3002"),
            opt("home", "\u5B9F\u5BB6\u306B\u901A\u3044\u306A\u304C\u3089\u4ECB\u8B77", "\u8CBB\u7528\u306F\u6291\u3048\u3089\u308C\u308B\u3002\u901A\u3046\u6642\u9593\u3068\u4EA4\u901A\u8CBB\u304C\u304B\u304B\u308A\u3001\u4ED5\u4E8B\u3092\u6E1B\u3089\u3059\u3053\u3068\u306B\u306A\u308B\u3002"),
            opt("quit", "\u4ED5\u4E8B\u3092\u8F9E\u3081\u3066\u4ECB\u8B77\u306B\u5C02\u5FF5", "\u305D\u3070\u306B\u3044\u3089\u308C\u308B\u3002\u53CE\u5165\u304C\u9014\u7D76\u3048\u3001\u5FA9\u8077\u306F\u7C21\u5358\u3067\u306F\u306A\u3044\u3002")
          );
          if (l.siblingsNow > 0) options.push(opt("share", "\u304D\u3087\u3046\u3060\u3044\u3068\u5206\u62C5\u3059\u308B", "\u8CA0\u62C5\u3092\u5206\u3051\u5408\u3048\u308B\u3002\u8A71\u3057\u5408\u3044\u304C\u307E\u3068\u307E\u3089\u306A\u3044\u3053\u3068\u3082\u3002"));
        }
      }
      break;
    }
    case "retire": {
      title = "\u9000\u8077\u306E\u6642\u671F";
      const working2 = l.job !== "none" && l.job !== "retired";
      situation = working2 ? `${a}\u6B73\u3002\u4F1A\u793E\u54E1\u306A\u3089\u5B9A\u5E74\u306E\u5E74\u3002${savingsText(l)}` : `${a}\u6B73\u3002${savingsText(l)}${l.D.isJapan ? "\u5E74\u91D1\u306F65\u6B73\u304B\u3089\u3002" : ""}`;
      if (working2) {
        options.push(
          opt("r60", "60\u6B73\u3067\u5F15\u9000\u3059\u308B", "\u81EA\u7531\u306A\u6642\u9593\u304C\u5897\u3048\u308B\u3002\u5E74\u91D1\u307E\u30675\u5E74\u306F\u8CAF\u3048\u3067\u66AE\u3089\u3059\u3002"),
          opt("r65", "65\u6B73\u307E\u3067\u50CD\u304F", "\u53CE\u5165\u306E\u3059\u304D\u9593\u304C\u306A\u3044\u3002\u7D66\u6599\u306F\u4E0B\u304C\u308B\u3002"),
          opt("r70", "70\u6B73\u307E\u3067\u50CD\u304D\u3001\u5E74\u91D1\u3092\u9045\u3089\u305B\u308B", "\u5E74\u91D1\u304C4\u5272\u307B\u3069\u5897\u3048\u308B\u3002\u4F53\u529B\u3068\u5065\u5EB7\u6B21\u7B2C\u3002")
        );
        if (l.job === "freelance" || l.job === "founder") options.push(opt("forever", "\u751F\u6DAF\u73FE\u5F79\u3067\u50CD\u304F", "\u53CE\u5165\u304C\u7D9A\u304F\u3002\u3044\u3064\u307E\u3067\u7D9A\u3051\u3089\u308C\u308B\u304B\u306F\u5206\u304B\u3089\u306A\u3044\u3002"));
      } else {
        options.push(
          opt("part", "70\u6B73\u307E\u3067\u30D1\u30FC\u30C8\u3067\u50CD\u304F", "\u5C11\u3057\u3067\u3082\u53CE\u5165\u304C\u5165\u308B\u3002\u4F53\u529B\u3092\u4F7F\u3046\u3002"),
          opt("wait", "\u5E74\u91D1\u3092\u5F85\u3064", "\u306E\u3093\u3073\u308A\u904E\u3054\u3059\u300265\u6B73\u307E\u3067\u8CAF\u3048\u3092\u53D6\u308A\u5D29\u3059\u3002"),
          opt("early", "\u5E74\u91D1\u309260\u6B73\u304B\u3089\u7E70\u308A\u4E0A\u3052\u308B", "\u3059\u3050\u53D7\u3051\u53D6\u308C\u308B\u3002\u4E00\u751F\u3001\u5E74\u91D1\u304C2\u5272\u307B\u3069\u6E1B\u308B\u3002")
        );
      }
      break;
    }
  }
  if (options.length === 0) options.push(opt("default", "\u6D41\u308C\u306B\u4EFB\u305B\u308B", "\u7279\u306B\u4F55\u3082\u5909\u3048\u306A\u3044\u3002"));
  return { id, age: a, title, situation, options };
}
function savingsText(l) {
  return l.balance >= 0 ? `\u8CAF\u3048\u306F${l.D.fmt(l.balance)}\u3002` : `\u8CAF\u3048\u306F\u306A\u304F\u3001\u501F\u91D1\u304C${l.D.fmt(-l.balance)}\u3042\u308B\u3002`;
}
function jobLabel(j) {
  return {
    none: "\u7121\u8077",
    big: "\u5927\u4F01\u696D\u306E\u6B63\u793E\u54E1",
    sme: "\u4E2D\u5C0F\u4F01\u696D\u306E\u6B63\u793E\u54E1",
    civil: "\u516C\u52D9\u54E1",
    nonregular: "\u975E\u6B63\u898F",
    freelance: "\u30D5\u30EA\u30FC\u30E9\u30F3\u30B9",
    founder: "\u7D4C\u55B6\u8005",
    retired: "\u5F15\u9000"
  }[j];
}
function applyChoice(l, id, o, r) {
  const a = l.age;
  switch (id) {
    case "afterJHS":
      if (o === "public" || o === "private") {
        l.school = "hs";
        l.schoolEnd = a + 3;
        if (o === "private") l.aptitude = Math.min(1, l.aptitude + 0.12);
        if (o === "private" && (l.band.id === "low" || l.band.id === "lower_mid")) l.thrift *= 1;
        l.logPre("school", `${o === "public" ? "\u516C\u7ACB" : "\u79C1\u7ACB"}\u9AD8\u6821\u306B\u5165\u5B66\u3057\u305F\u3002`);
      } else if (o === "kosen") {
        l.school = "kosen";
        l.schoolEnd = a + 5;
        l.logPre("school", "\u9AD8\u5C02\u306B\u5165\u5B66\u3057\u305F\u3002");
      } else if (o === "night") {
        l.school = "hs_night";
        l.schoolEnd = a + 4;
        l.logPre("school", "\u5B9A\u6642\u5236\u9AD8\u6821\u306B\u5165\u5B66\u3057\u3001\u663C\u306F\u50CD\u304D\u306F\u3058\u3081\u305F\u3002");
      } else {
        l.school = "done";
        l.schoolEnd = a;
        l.home = "parents";
      }
      break;
    case "afterHS": {
      if (o === "job" || o === "stay") {
        l.school = "done";
        if (o === "stay") l.careerMult *= 1.05;
        break;
      }
      if (o === "transfer") {
        l.school = "univ";
        l.schoolEnd = a + 2;
        l.logPre("school", "\u5927\u5B663\u5E74\u306B\u7DE8\u5165\u3057\u305F\u3002");
        break;
      }
      if (o === "license") {
        l.selfStudyUntil = a + 2;
        if (r.chance(0.55)) {
          l.careerMult *= 1.15;
          l.logPre("work", "\u8CC7\u683C\u3092\u53D6\u3063\u305F\u3002\u4ED5\u4E8B\u306E\u5E45\u304C\u5E83\u304C\u3063\u305F\u3002", void 0, true);
        } else l.logPre("work", "\u8CC7\u683C\u306E\u52C9\u5F37\u3092\u7D9A\u3051\u305F\u304C\u3001\u8A66\u9A13\u306B\u306F\u5C4A\u304B\u306A\u304B\u3063\u305F\u3002");
        break;
      }
      if (o === "night_univ" || o === "univ_night") {
        l.school = "univ_night";
        l.schoolEnd = a + 5;
        l.logPre("school", "\u50CD\u304D\u306A\u304C\u3089\u591C\u9593\u306E\u5927\u5B66\u306B\u901A\u3044\u306F\u3058\u3081\u305F\u3002");
        if (o === "night_univ") l.job = l.job === "none" ? "nonregular" : l.job;
        break;
      }
      if (o === "univ_loan") {
        l.school = "univ_work";
        l.schoolEnd = a + 4;
        l.privateUni = r.chance(l.D.education.privateUniversityShare);
        l.logPre("school", `\u5968\u5B66\u91D1\u3092\u501F\u308A\u3066${l.privateUni ? "\u79C1\u7ACB" : "\u56FD\u516C\u7ACB"}\u5927\u5B66\u306B\u5165\u5B66\u3057\u305F\u3002`);
        break;
      }
      if (o === "voc_loan" || o === "vocational") {
        l.school = "vocational";
        l.schoolEnd = a + 2;
        if (o === "voc_loan") {
          l.scholarship += l.y(22e5);
          l.scholarshipAnnual = l.y(22e5) / 12;
        }
        l.logPre("school", "\u5C02\u9580\u5B66\u6821\u306B\u5165\u5B66\u3057\u305F\u3002");
        break;
      }
      if (o === "national") {
        const pass = r.chance(0.12 + l.aptitude * 0.65);
        l.school = "univ";
        l.schoolEnd = a + 4;
        if (pass) l.logPre("school", "\u56FD\u516C\u7ACB\u5927\u5B66\u306B\u5408\u683C\u3057\u305F\u3002", void 0, true);
        else {
          l.privateUni = true;
          l.logPre("school", "\u56FD\u516C\u7ACB\u306F\u4E0D\u5408\u683C\u3002\u79C1\u7ACB\u5927\u5B66\u306B\u9032\u3093\u3060\u3002", void 0, true);
        }
        break;
      }
      if (o === "private_univ") {
        l.school = "univ";
        l.schoolEnd = a + 4;
        l.privateUni = true;
        l.logPre("school", "\u79C1\u7ACB\u5927\u5B66\u306B\u5165\u5B66\u3057\u305F\u3002");
      }
      break;
    }
    case "firstJob": {
      const e = l.edu;
      let job = o;
      if (o === "big") {
        const p = { junior_high: 0.05, high_school: 0.2, vocational: 0.3, university: 0.42, graduate: 0.55 }[e] * (0.7 + l.aptitude * 0.6);
        if (!r.chance(p)) {
          job = "sme";
          l.logPre("work", "\u5927\u4F01\u696D\u306F\u4E0D\u63A1\u7528\u3002\u4E2D\u5C0F\u4F01\u696D\u306E\u6B63\u793E\u54E1\u306B\u306A\u3063\u305F\u3002", void 0, true);
        } else l.logPre("work", "\u5927\u4F01\u696D\u306B\u63A1\u7528\u3055\u308C\u305F\u3002", void 0, true);
      } else if (o === "civil") {
        if (!r.chance(0.25 + l.aptitude * 0.35)) {
          job = "nonregular";
          l.logPre("work", "\u516C\u52D9\u54E1\u8A66\u9A13\u306B\u843D\u3061\u305F\u3002\u975E\u6B63\u898F\u3067\u50CD\u304D\u306A\u304C\u3089\u6B21\u3092\u8003\u3048\u308B\u3002", void 0, true);
        } else l.logPre("work", "\u516C\u52D9\u54E1\u8A66\u9A13\u306B\u5408\u683C\u3057\u305F\u3002", void 0, true);
      } else if (o === "freelance") {
        l.careerMult = Math.exp(r.normal(-0.1, 0.35));
        l.logPre("work", "\u30D5\u30EA\u30FC\u30E9\u30F3\u30B9\u3068\u3057\u3066\u72EC\u7ACB\u3057\u305F\u3002");
      } else l.logPre("work", o === "sme" ? "\u4E2D\u5C0F\u4F01\u696D\u306E\u6B63\u793E\u54E1\u306B\u306A\u3063\u305F\u3002" : "\u975E\u6B63\u898F\u306E\u4ED5\u4E8B\u3067\u50CD\u304D\u306F\u3058\u3081\u305F\u3002");
      l.job = job;
      l.jobStart = a;
      if (l.home === "parents") l.queueScene(leaveHomeScene(l, false));
      break;
    }
    case "invest":
      if (o === "index") {
        l.investStyle = "index";
        l.investRate = 0.1;
      } else if (o === "stocks") {
        l.investStyle = "stocks";
        l.investRate = 0.15;
      } else if (o === "self") {
        l.selfStudyUntil = a + 3;
        if (r.chance(0.5)) {
          l.careerMult *= 1.15;
          l.logPre("work", "\u8EAB\u306B\u3064\u3051\u305F\u30B9\u30AD\u30EB\u304C\u8A55\u4FA1\u3055\u308C\u3001\u53CE\u5165\u304C\u4E0A\u304C\u308A\u305D\u3046\u3060\u3002");
        } else l.logPre("work", "\u5B66\u3093\u3060\u3053\u3068\u306F\u3001\u3059\u3050\u306B\u306F\u53CE\u5165\u306B\u7D50\u3073\u3064\u304B\u306A\u304B\u3063\u305F\u3002");
      }
      break;
    case "marriageHome": {
      const buy = (single) => {
        const nat = l.D.living.housePriceNewBuilt.national;
        const base = l.region.id === "tokyo" ? l.D.living.housePriceNewBuilt.tokyo : nat * l.regionFactor(REGION_HOUSE, l.region.wageIndex, l.region.wageIndex * 0.7) / 0.85;
        const hh = Math.max(l.y(25e5), l.householdIncomeGuess());
        const price = Math.min(base * (single ? 0.6 : 1) * r.range(0.85, 1.15), hh * 7 + Math.max(0, l.cash) * 0.6);
        const down = Math.max(0, Math.min(l.cash * 0.6, price * 0.1));
        l.spend("housing", down);
        l.housePrice = price;
        l.boughtAge = a;
        l.loan = price - down;
        const i = 0.012;
        l.loanAnnual = l.loan * i / (1 - Math.pow(1 + i, -35));
        l.home = "own";
        l.logPre("money", `${single ? "\u30DE\u30F3\u30B7\u30E7\u30F3" : "\u5BB6"}\u3092${l.D.fmt(price)}\u3067\u8CB7\u3063\u305F\u300235\u5E74\u30ED\u30FC\u30F3\u3092\u7D44\u3093\u3060\u3002`, -down, true);
      };
      if (o === "buy") buy(false);
      else if (o === "rent") l.home = "rent";
      else if (o === "withParents") {
        l.home = "parents";
        l.coLiveParents = true;
        l.logPre("life", "\u89AA\u3068\u4E8C\u4E16\u5E2F\u3067\u66AE\u3089\u3057\u306F\u3058\u3081\u305F\u3002");
      } else if (o === "marryRent" || o === "marryBuy") {
        l.marry(r, "\u7D50\u5A5A\u3057\u305F\u3002");
        if (o === "marryBuy") buy(false);
        else l.home = "rent";
      } else if (o === "single" || o === "solo") {
        l.noMarry = true;
        if (l.dating) l.logPre("family", "\u604B\u4EBA\u3068\u306F\u5225\u3005\u306E\u9053\u3092\u6B69\u3080\u3053\u3068\u306B\u3057\u305F\u3002");
        l.dating = false;
        if (l.home === "parents") l.home = "rent";
      } else if (o === "konkatsu") {
        l.spend("events", l.y(3e5));
        l.marriageBoost = 2.5;
        l.marriageBoostUntil = a + 10;
        l.logPre("life", "\u5A5A\u6D3B\u30B5\u30FC\u30D3\u30B9\u306B\u767B\u9332\u3057\u305F\u3002", -l.y(3e5));
      } else if (o === "condo") {
        l.noMarry = r.chance(0.7);
        buy(true);
      } else if (o === "home") {
        l.home = "parents";
        l.logPre("life", "\u5B9F\u5BB6\u306B\u623B\u3063\u305F\u3002");
      }
      break;
    }
    case "careerShift": {
      if (o === "change") {
        const c = Math.exp(r.normal(0.03, 0.18));
        l.careerMult *= c;
        if (l.job === "civil") l.job = "sme";
        l.manager = false;
        l.logPre("work", c >= 1 ? "\u8EE2\u8077\u3057\u3066\u5E74\u53CE\u304C\u4E0A\u304C\u3063\u305F\u3002" : "\u8EE2\u8077\u3057\u305F\u304C\u3001\u5E74\u53CE\u306F\u4E0B\u304C\u3063\u305F\u3002", void 0, true);
      } else if (o === "found" || o === "expand") {
        l.job = "founder";
        l.founderYear = a;
        l.careerMult = Math.exp(r.normal(-0.15, 0.4));
        const seedMoney = o === "expand" ? l.y(3e6) : l.y(2e6);
        l.spend("other", seedMoney);
        l.logPre("work", o === "expand" ? "\u4EBA\u3092\u96C7\u3063\u3066\u4E8B\u696D\u3092\u5E83\u3052\u305F\u3002" : "\u4F1A\u793E\u3092\u7ACB\u3061\u4E0A\u3052\u305F\u3002", -seedMoney, true);
      } else if (o === "seekRegular") {
        if (r.chance(0.4)) {
          l.job = "sme";
          l.careerMult = Math.max(0.85, l.careerMult);
          l.logPre("work", "\u6B63\u793E\u54E1\u3068\u3057\u3066\u63A1\u7528\u3055\u308C\u305F\u3002", void 0, true);
        } else l.logPre("work", "\u6B63\u793E\u54E1\u306E\u63A1\u7528\u306B\u306F\u5C4A\u304B\u306A\u304B\u3063\u305F\u3002");
      } else if (o === "license") {
        l.selfStudyUntil = a + 2;
        if (r.chance(0.55)) {
          l.careerMult *= 1.2;
          if (l.job === "none") l.job = "nonregular";
          l.logPre("work", "\u8CC7\u683C\u3092\u53D6\u308A\u3001\u4ED5\u4E8B\u306E\u6761\u4EF6\u304C\u3088\u304F\u306A\u3063\u305F\u3002", void 0, true);
        } else l.logPre("work", "\u8CC7\u683C\u306F\u53D6\u308C\u306A\u304B\u3063\u305F\u3002");
      } else if (o === "employee") {
        if (r.chance(0.55)) {
          l.job = "sme";
          l.careerMult = Math.max(0.9, l.careerMult);
          l.logPre("work", "\u4F1A\u793E\u54E1\u306B\u623B\u3063\u305F\u3002", void 0, true);
        } else l.logPre("work", "\u6761\u4EF6\u306E\u5408\u3046\u4F1A\u793E\u304C\u898B\u3064\u304B\u3089\u305A\u3001\u4ECA\u306E\u4ED5\u4E8B\u3092\u7D9A\u3051\u305F\u3002");
      }
      break;
    }
    case "parentCare": {
      if (o === "saveMore") {
        l.thrift *= 0.92;
        l.logPre("money", "\u8001\u5F8C\u306B\u5411\u3051\u3066\u3001\u66AE\u3089\u3057\u3092\u5C11\u3057\u5207\u308A\u3064\u3081\u308B\u3053\u3068\u306B\u3057\u305F\u3002");
      } else if (o === "enjoyNow") {
        l.thrift *= 1.06;
        l.logPre("life", "\u65C5\u884C\u3084\u8DA3\u5473\u306B\u3001\u304A\u91D1\u3092\u4F7F\u3046\u3088\u3046\u306B\u3057\u305F\u3002");
      } else if (o === "helpKids") {
        const gift = l.y(2e6);
        l.spend("kids", gift);
        l.logPre("family", "\u5B50\u3069\u3082\u306E\u4F4F\u307E\u3044\u306E\u982D\u91D1\u3092\u63F4\u52A9\u3057\u305F\u3002", -gift, true);
      } else if (o === "sellHouse") {
        const v = l.region.id === "tokyo" ? r.range(l.y(1e7), l.y(4e7)) : l.region.id === "rural" ? r.chance(0.4) ? 0 : r.range(l.y(1e6), l.y(6e6)) : r.range(l.y(3e6), l.y(15e6));
        const share = v / (l.siblings + 1);
        l.addIncome("windfall", share);
        l.logPre("money", v > 0 ? l.siblings > 0 ? "\u5B9F\u5BB6\u3092\u58F2\u308A\u3001\u304D\u3087\u3046\u3060\u3044\u3067\u5206\u3051\u305F\u3002" : "\u5B9F\u5BB6\u3092\u58F2\u3063\u305F\u3002" : "\u5B9F\u5BB6\u306F\u8CB7\u3044\u624B\u304C\u3064\u304B\u305A\u3001\u89E3\u4F53\u8CBB\u3060\u3051\u304B\u304B\u3063\u305F\u3002", v > 0 ? share : -l.y(15e5), true);
        if (v === 0) l.spend("housing", l.y(15e5));
      } else if (o === "keepHouse") {
        l.keepHouseCost = true;
      } else if (o === "moveIn") {
        if (l.home === "rent") l.home = "parents";
        l.logPre("life", "\u5B9F\u5BB6\u306B\u79FB\u308A\u4F4F\u3093\u3060\u3002");
      } else {
        l.careMode = o;
        if (!l.careTriggered) l.careParent = l.parents.findIndex((x) => x.alive);
        l.careTriggered = true;
        l.careUntil = a + r.int(2, 9);
        if (o === "quit" && l.job !== "none" && l.job !== "retired") {
          l.loseJob(a);
          l.unemployedUntil = l.careUntil;
          l.logPre("work", "\u4ECB\u8B77\u306E\u305F\u3081\u306B\u4ED5\u4E8B\u3092\u8F9E\u3081\u305F\u3002", void 0, true);
        }
        if (o === "liveIn") l.logPre("family", "\u540C\u3058\u5BB6\u3067\u66AE\u3089\u3057\u306A\u304C\u3089\u3001\u50CD\u304D\u3064\u3064\u89AA\u306E\u4ECB\u8B77\u3092\u3059\u308B\u3053\u3068\u306B\u3057\u305F\u3002", void 0, true);
        if (o === "share" && r.chance(l.livesWithParents ? 0.5 : 0.3)) l.logPre("family", "\u304D\u3087\u3046\u3060\u3044\u3068\u306E\u8A71\u3057\u5408\u3044\u306F\u96E3\u822A\u3057\u305F\u3002\u8CA0\u62C5\u306F\u601D\u3063\u305F\u3088\u308A\u6E1B\u3089\u306A\u304B\u3063\u305F\u3002");
      }
      break;
    }
    case "retire": {
      if (o === "r60") {
        l.retireAge = a + 1;
      } else if (o === "r65") {
        l.retireAge = 65;
        if (l.job === "big" || l.job === "sme" || l.job === "civil") {
          l.postRetireWork = true;
          l.logPre("work", "\u518D\u96C7\u7528\u3067\u50CD\u304D\u7D9A\u3051\u308B\u3053\u3068\u306B\u306A\u3063\u305F\u3002\u7D66\u6599\u306F\u4E0B\u304C\u3063\u305F\u3002");
        }
      } else if (o === "r70") {
        l.retireAge = 70;
        l.pensionStart = 70;
        l.pensionMult = 1.42;
        if (l.job === "big" || l.job === "sme" || l.job === "civil") l.postRetireWork = true;
      } else if (o === "forever") {
        l.retireAge = 78;
        l.pensionStart = 70;
        l.pensionMult = 1.42;
      } else if (o === "part") {
        l.job = "nonregular";
        l.retireAge = 70;
        l.careerMult = 0.6;
      } else if (o === "early") {
        l.pensionStart = 60;
        l.pensionMult = 0.76;
        l.retireAge = a;
      } else if (o === "wait") {
        l.retireAge = a;
      }
      if (l.retireAge <= a + 1 && l.job !== "none" && l.job !== "retired" && o === "r60") {
      }
      break;
    }
  }
}
var AUTO_WEIGHTS = {
  "ev:meet": [0.72, 0.18, 0.1],
  "ev:leaveHome": [0.55, 0.45],
  "ev:kidLeave": [0.6, 0.3, 0.1],
  "ev:propose": [0.5, 0.35, 0.12, 0.03],
  "ev:arranged": [0.7, 0.22, 0.08],
  "ev:betrothed": [0.92, 0.08]
};
function autoplay(seed, country = JAPAN, mode = "j") {
  return autoplayLife(new Life(seed, country, mode));
}
function autoplayLife(l) {
  const seed = l.seed;
  let guard = 0;
  while (!l.dead && guard++ < 500) {
    if (l.pending) {
      const r = new Rng(hashStr(`${seed}|auto|${l.pending.id}|${l.age}`));
      const w = AUTO_WEIGHTS[l.pending.id];
      l.choose((w ? r.weighted(l.pending.options, w) : r.pick(l.pending.options)).id);
      continue;
    }
    l.advance();
  }
  return l;
}
var cohortCache = /* @__PURE__ */ new Map();
function cohort(country = JAPAN, n = 300) {
  const hit = cohortCache.get(country.iso3);
  if (hit) return hit;
  const income = [];
  const balance = [];
  const lives = [];
  for (let i = 0; i < n; i++) {
    const l = autoplay(`cohort-${BIRTH_YEAR}-${country.iso3}-${i}`, country);
    const s = l.summary();
    income.push(s.lifetimeIncome);
    balance.push(s.finalBalance);
    lives.push({ tags: l.tags, bal: l.records.map((r) => r.balance), death: l.age });
  }
  income.sort((a, b) => a - b);
  balance.sort((a, b) => a - b);
  const c = { income, balance, lives };
  cohortCache.set(country.iso3, c);
  return c;
}
function rankOf(sorted, v) {
  let lo = 0;
  while (lo < sorted.length && sorted[lo] <= v) lo++;
  return 1 - lo / sorted.length;
}
var ALLOC_PRESETS = [
  { id: "p0", label: "\u5805\u5B9F", desc: "\u66AE\u3089\u30574\u30FB\u8CAF\u91D14\u30FB\u6295\u8CC71\u30FB\u5BB6\u65CF1\u3002\u7269\u4FA1\u304C\u4E0A\u304C\u308B\u3068\u8CAF\u91D1\u306F\u76EE\u6E1B\u308A\u3059\u308B\u3002", a: { living: 4, save: 4, invest: 1, family: 1, self: 0 } },
  { id: "p1", label: "\u6295\u8CC7\u3092\u91CD\u8996", desc: "\u66AE\u3089\u30573\u30FB\u8CAF\u91D11\u30FB\u6295\u8CC75\u30FB\u5BB6\u65CF1\u3002\u5897\u3048\u308B\u5E74\u3082\u6E1B\u308B\u5E74\u3082\u3042\u308B\u3002", a: { living: 3, save: 1, invest: 5, family: 1, self: 0 } },
  { id: "p2", label: "\u5BB6\u65CF\u3092\u91CD\u8996", desc: "\u66AE\u3089\u30573\u30FB\u8CAF\u91D12\u30FB\u6295\u8CC71\u30FB\u5BB6\u65CF4\u3002\u5B50\u3069\u3082\u306E\u6559\u80B2\u3084\u89AA\u3078\u306E\u4ED5\u9001\u308A\u306B\u56DE\u3059\u3002", a: { living: 3, save: 2, invest: 1, family: 4, self: 0 } },
  { id: "p3", label: "\u81EA\u5206\u306B\u6295\u8CC7", desc: "\u66AE\u3089\u30573\u30FB\u8CAF\u91D12\u30FB\u6295\u8CC71\u30FB\u5BB6\u65CF1\u30FB\u81EA\u52063\u3002\u5B66\u3073\u76F4\u3057\u3067\u7D66\u6599\u304C\u4E0A\u304C\u308B\u3053\u3068\u3082\u3001\u4E0A\u304C\u3089\u306A\u3044\u3053\u3068\u3082\u3002", a: { living: 3, save: 2, invest: 1, family: 1, self: 3 } },
  { id: "p4", label: "\u4ECA\u3092\u697D\u3057\u3080", desc: "\u66AE\u3089\u30578\u30FB\u8CAF\u91D11\u30FB\u5BB6\u65CF1\u3002\u65C5\u884C\u3084\u8DA3\u5473\u306B\u304A\u91D1\u3092\u4F7F\u3046\u3002\u6B8B\u308B\u304A\u91D1\u306F\u5C11\u306A\u3044\u3002", a: { living: 8, save: 1, invest: 0, family: 1, self: 0 } }
];
function normAlloc(a) {
  const c = (n) => Math.max(0, Math.min(9, Math.round(n || 0)));
  let save = c(a.save);
  let invest = c(a.invest);
  let family = c(a.family);
  let self = c(a.self);
  for (const k of ["self", "family", "invest", "save"]) {
    const over = save + invest + family + self - 10;
    if (over <= 0) break;
    if (k === "self") self -= Math.min(self, over);
    if (k === "family") family -= Math.min(family, over);
    if (k === "invest") invest -= Math.min(invest, over);
    if (k === "save") save -= Math.min(save, over);
  }
  return { living: 10 - save - invest - family - self, save, invest, family, self };
}
var ALLOC_LABEL = { living: "\u66AE\u3089\u3057", save: "\u8CAF\u91D1", invest: "\u6295\u8CC7", family: "\u5BB6\u65CF", self: "\u81EA\u5206" };
function noInvestAlloc(a) {
  const save = Math.min(9, a.save + a.invest);
  return { living: 10 - save - a.family - a.self, save, invest: 0, family: a.family, self: a.self };
}
function allocLabel(a) {
  return Object.keys(ALLOC_LABEL).filter((k) => a[k] > 0).map((k) => `${ALLOC_LABEL[k]}${a[k] * 10}%`).join("\u30FB");
}
function allocChoice(l) {
  const a = l.age;
  const last = l.alloc;
  const kidsNow = l.kids.some((k) => a - k.born >= 0 && a - k.born < 22);
  const familyTo = kidsNow ? "kids" : l.parents.some((p) => p.alive) ? "parents" : "none";
  const free = l.lastFree;
  const situation = free > 0 ? `${a}\u6B73\u3002\u53BB\u5E74\u3001\u81EA\u7531\u306B\u4F7F\u3048\u305F\u304A\u91D1\uFF08\u624B\u53D6\u308A\u304B\u3089\u3001\u51FA\u3066\u3044\u3063\u305F\u304A\u91D1\u3092\u5F15\u3044\u305F\u6B8B\u308A\uFF09\u306F\u7D04${l.D.fmt(free)}\u3002\u3053\u308C\u304B\u30895\u5E74\u3001\u3069\u3053\u306B\u4F7F\u3046\uFF1F` : `${a}\u6B73\u3002\u53BB\u5E74\u306F\u3001\u624B\u53D6\u308A\u3088\u308A\u51FA\u3066\u3044\u304F\u304A\u91D1\u306E\u307B\u3046\u304C\u591A\u304B\u3063\u305F\u3002\u3053\u308C\u304B\u30895\u5E74\u3001\u4F59\u308A\u304C\u51FA\u305F\u5E74\u306F\u3001\u3069\u3053\u306B\u4F7F\u3046\uFF1F`;
  const noInvest = (x) => l.banked || !x.invest ? x : noInvestAlloc(x);
  const presets = ALLOC_PRESETS.filter((p) => l.banked || p.id !== "p1");
  const options = presets.map(({ id, label, desc, a: x }) => ({ id, label, desc: l.banked ? desc : `${allocLabel(noInvest(x))}\u3002` }));
  if (last) options.push({ id: "same", label: "\u524D\u56DE\u3068\u540C\u3058", desc: allocLabel(noInvest(last)) });
  return {
    id: "alloc",
    age: a,
    title: "\u304A\u91D1\u306E\u632F\u308A\u5206\u3051",
    situation: l.banked ? situation : situation + "\u53E3\u5EA7\u3092\u6301\u3063\u3066\u3044\u306A\u3044\u306E\u3067\u6295\u8CC7\u306F\u3067\u304D\u305A\u3001\u8CAF\u91D1\u306F\u624B\u5143\u306B\u7F6E\u304F\u3002",
    options,
    alloc: { free, last: last && noInvest(last), presets: [...presets.map((p) => noInvest(p.a)), ...last ? [noInvest(last)] : []], familyTo, noInvest: !l.banked }
  };
}
function bankruptScene(l) {
  const debt = () => Math.max(0, -(l.cash + l.invest));
  return {
    id: "bankrupt",
    title: "\u501F\u91D1\u306E\u6574\u7406",
    situation: `\u501F\u91D1\u304C${l.D.fmt(debt())}\u306B\u3075\u304F\u3089\u307F\u3001\u8FD4\u6E08\u304C\u8FFD\u3044\u3064\u304B\u306A\u3044\u3002\u5F01\u8B77\u58EB\u306B\u76F8\u8AC7\u3059\u308B\u3068\u3001\u81EA\u5DF1\u7834\u7523\u3068\u3044\u3046\u65B9\u6CD5\u3082\u3042\u308B\u3068\u8A00\u308F\u308C\u305F\u3002\u65E5\u672C\u3067\u81EA\u5DF1\u7834\u7523\u3059\u308B\u4EBA\u306F\u30011\u5E74\u306B\u5927\u4EBA\u306E\u7D041,200\u4EBA\u306B1\u4EBA\u3002`,
    situationOf: (l2) => `\u501F\u91D1\u304C${l2.D.fmt(Math.max(0, -(l2.cash + l2.invest)))}\u306B\u3075\u304F\u3089\u307F\u3001\u8FD4\u6E08\u304C\u8FFD\u3044\u3064\u304B\u306A\u3044\u3002\u5F01\u8B77\u58EB\u306B\u76F8\u8AC7\u3059\u308B\u3068\u3001\u81EA\u5DF1\u7834\u7523\u3068\u3044\u3046\u65B9\u6CD5\u3082\u3042\u308B\u3068\u8A00\u308F\u308C\u305F\u3002\u65E5\u672C\u3067\u81EA\u5DF1\u7834\u7523\u3059\u308B\u4EBA\u306F\u30011\u5E74\u306B\u5927\u4EBA\u306E\u7D041,200\u4EBA\u306B1\u4EBA\u3002`,
    stillValid: (l2) => l2.cash + l2.invest < 0 && l2.bankruptAge < 0,
    options: [
      {
        id: "file",
        label: "\u81EA\u5DF1\u7834\u7523\u3059\u308B",
        desc: "\u501F\u91D1\u306E\u8FD4\u6E08\u304C\u306A\u304F\u306A\u308B\u3002\u5BB6\u306A\u3069\u306E\u8CA1\u7523\u306F\u624B\u653E\u3057\u30017\u5E74\u307B\u3069\u306F\u4F4F\u5B85\u30ED\u30FC\u30F3\u3092\u7D44\u3081\u306A\u3044\u3002",
        apply: (l2) => {
          l2.bankruptAge = l2.age;
          const lost = l2.home === "own" ? "\u5BB6\u3082\u624B\u653E\u3057\u305F\u3002" : "";
          if (l2.home === "own") {
            l2.home = "rent";
            l2.loan = 0;
            l2.loanAnnual = 0;
            l2.ownedBefore = false;
          }
          l2.invest = 0;
          l2.cash = 0;
          l2.logPre("money", `\u81EA\u5DF1\u7834\u7523\u3057\u305F\u3002\u501F\u91D1\u306E\u8FD4\u6E08\u306F\u306A\u304F\u306A\u3063\u305F\u3002${lost}`, void 0, true);
          l2.mark("bankrupt");
        }
      },
      {
        id: "repay",
        label: "\u50CD\u304D\u306A\u304C\u3089\u8FD4\u3057\u7D9A\u3051\u308B",
        desc: "\u8CA1\u7523\u306F\u624B\u5143\u306B\u6B8B\u308B\u3002\u5229\u606F\u304C\u304B\u3055\u307F\u3001\u8FD4\u3057\u7D42\u3048\u308B\u307E\u3067\u66AE\u3089\u3057\u306F\u82E6\u3057\u3044\u3002",
        apply: (l2) => l2.logPre("money", "\u66AE\u3089\u3057\u3092\u5207\u308A\u3064\u3081\u3001\u501F\u91D1\u3092\u8FD4\u3057\u7D9A\u3051\u308B\u3053\u3068\u306B\u3057\u305F\u3002")
      }
    ]
  };
}

// data/world/countries.json
var countries_default = [
  {
    iso3: "IND",
    nameJa: "\u30A4\u30F3\u30C9",
    major: true,
    incomeGroup: "LMC",
    births: 23219100,
    currency: {
      code: "INR",
      nameJa: "\u30A4\u30F3\u30C9 \u30EB\u30D4\u30FC",
      symbol: "\u20B9",
      jpyPerUnit: 1.67101,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 19.8969,
    gniPerCapitaLCU: 216398,
    consumptionPerCapitaLCU: 123855,
    incomeShareQuintiles: [
      0.111,
      0.148,
      0.179,
      0.22,
      0.342
    ],
    urbanShare: 0.354,
    places: [
      {
        nameJa: "\u30C7\u30EA\u30FC",
        urban: true,
        share: 0.0236,
        incomeIndex: 2.38
      },
      {
        nameJa: "\u30E0\u30F3\u30D0\u30A4",
        urban: true,
        share: 0.015,
        incomeIndex: 2.17
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3154,
        incomeIndex: 1.41
      },
      {
        nameJa: "\u30A6\u30C3\u30BF\u30EB\u30FB\u30D7\u30E9\u30C7\u30FC\u30B7\u30E5\u5DDE\u306E\u8FB2\u6751",
        urban: false,
        share: 0.1874,
        incomeIndex: 0.65
      },
      {
        nameJa: "\u30D3\u30CF\u30FC\u30EB\u5DDE\u306E\u8FB2\u6751",
        urban: false,
        share: 0.0986,
        incomeIndex: 0.54
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.36,
        incomeIndex: 0.81
      }
    ],
    lifeExpectancy: {
      male: 70.5,
      female: 73.6
    },
    under5MortalityPer1000: 28,
    tfr: 1.98,
    meanAgeFirstMarriage: {
      male: 26,
      female: 21.3
    },
    secondaryNetEnrollment: 0.616,
    tertiaryGrossEnrollment: 0.344,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.042,
    informalEmploymentShare: 0.87197,
    pensionCoverage: 0.459,
    pensionReplacementRate: 0.392,
    outOfPocketHealthShare: 0.439,
    effectiveTaxRateAvgWorker: 0.1275,
    rentShareOfIncome: 0.125583351482,
    housePriceToIncome: 11.1,
    disasterRisk: 0.75,
    remittanceShareGdp: 0.0366,
    estimated: [
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/IND/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://ilostat.ilo.org/data/country-profiles/ind/",
        year: ""
      }
    },
    cityPopulationShare: {
      Delhi: 0.023577276829858065,
      "Mumbai (Bombay)": 0.015023476457655253,
      "Kolkata (Calcutta)": 0.010776892621976774,
      Bangalore: 0.009790848801571451,
      "Chennai (Madras)": 0.008390180905587907
    }
  },
  {
    iso3: "CHN",
    nameJa: "\u4E2D\u56FD",
    major: true,
    incomeGroup: "UMC",
    births: 9014400,
    currency: {
      code: "CNY",
      nameJa: "\u4E2D\u56FD\u4EBA\u6C11\u5143",
      symbol: "\uFFE5",
      jpyPerUnit: 23.6305,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 3.55079,
    gniPerCapitaLCU: 95019.2,
    consumptionPerCapitaLCU: 38242.6,
    incomeShareQuintiles: [
      0.073,
      0.114,
      0.157,
      0.219,
      0.437
    ],
    urbanShare: 0.659,
    places: [
      {
        nameJa: "\u4E0A\u6D77",
        urban: true,
        share: 0.0216,
        incomeIndex: 2.32
      },
      {
        nameJa: "\u5317\u4EAC",
        urban: true,
        share: 0.016,
        incomeIndex: 2.42
      },
      {
        nameJa: "\u5E83\u5DDE",
        urban: true,
        share: 0.0105,
        incomeIndex: 2
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.6109,
        incomeIndex: 1.11
      },
      {
        nameJa: "\u6CB3\u5357\u7701\u306E\u8FB2\u6751",
        urban: false,
        share: 0.0814,
        incomeIndex: 0.53
      },
      {
        nameJa: "\u5185\u9678\u90E8\u306E\u8FB2\u6751",
        urban: false,
        share: 0.2596,
        incomeIndex: 0.53
      }
    ],
    lifeExpectancy: {
      male: 75.2,
      female: 80.9
    },
    under5MortalityPer1000: 6.1,
    tfr: 1,
    meanAgeFirstMarriage: {
      male: 27.1,
      female: 25.4
    },
    secondaryNetEnrollment: 1,
    tertiaryGrossEnrollment: 0.769,
    tertiaryAnnualCostShareOfGni: 0.07,
    unemploymentRate: 0.046,
    informalEmploymentShare: 0.544,
    pensionCoverage: 1,
    pensionReplacementRate: 0.806,
    outOfPocketHealthShare: 0.322,
    effectiveTaxRateAvgWorker: 0.18,
    rentShareOfIncome: 0.166829260504,
    housePriceToIncome: 17.4,
    disasterRisk: 0.55,
    remittanceShareGdp: 13e-4,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILO Women and Men in the Informal Economy: A Statistical Picture",
        url: "https://www.ilo.org/sites/default/files/2024-04/Women_men_informal_economy_statistical_picture.pdf",
        year: "2013"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/CHN/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Shanghai: 0.021550394641751226,
      Beijing: 0.015975339092156017,
      Chongqing: 0.012846751836104701,
      "Guangzhou, Guangdong": 0.010519001054475577,
      Tianjin: 0.010395553817543039
    }
  },
  {
    iso3: "NGA",
    nameJa: "\u30CA\u30A4\u30B8\u30A7\u30EA\u30A2",
    major: true,
    incomeGroup: "LMC",
    births: 7509700,
    currency: {
      code: "NGN",
      nameJa: "\u30CA\u30A4\u30B8\u30A7\u30EA\u30A2 \u30CA\u30A4\u30E9",
      symbol: "\u20A6",
      jpyPerUnit: 0.118391,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 265.54,
    gniPerCapitaLCU: 1566420,
    consumptionPerCapitaLCU: 939849,
    incomeShareQuintiles: [
      0.0749,
      0.1199,
      0.1638,
      0.2258,
      0.4156
    ],
    urbanShare: 0.63,
    places: [
      {
        nameJa: "\u30E9\u30B4\u30B9",
        urban: true,
        share: 0.0715,
        incomeIndex: 1.88
      },
      {
        nameJa: "\u30AB\u30CE",
        urban: true,
        share: 0.0194,
        incomeIndex: 1.1
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5391,
        incomeIndex: 1.21
      },
      {
        nameJa: "\u5317\u90E8\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2304,
        incomeIndex: 0.61
      },
      {
        nameJa: "\u5357\u90E8\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.1396,
        incomeIndex: 0.94
      }
    ],
    lifeExpectancy: {
      male: 54.2,
      female: 54.7
    },
    under5MortalityPer1000: 116.8,
    tfr: 4.48,
    meanAgeFirstMarriage: {
      male: 28.6,
      female: 21.3
    },
    secondaryNetEnrollment: 0.616,
    tertiaryGrossEnrollment: 0.0974153350922586,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.03,
    informalEmploymentShare: 0.93145,
    pensionCoverage: 0.196,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.719,
    effectiveTaxRateAvgWorker: 0.1237,
    rentShareOfIncome: 0.0811187328752,
    housePriceToIncome: 116.3,
    disasterRisk: 0.45,
    remittanceShareGdp: 0.0877,
    estimated: [
      "consumptionPerCapitaLCU",
      "pensionReplacementRate",
      "secondaryNetEnrollment",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB\u63A8\u5B9A/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/NGA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      tertiary_gross_enrollment: {
        source: "World Bank WDI (UIS API)",
        url: "https://api.worldbank.org/v2/country/NGA/indicator/SE.TER.ENRR?date=2011&format=json",
        year: "2011"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://ilostat.ilo.org/data/country-profiles/nga/",
        year: "2026"
      }
    },
    cityPopulationShare: {
      Lagos: 0.07149457821517508,
      Kano: 0.019358080489391097,
      Abuja: 0.017543795020555034,
      Ibadan: 0.017269512329342224,
      "Port Harcourt": 0.015809520303497117
    }
  },
  {
    iso3: "PAK",
    nameJa: "\u30D1\u30AD\u30B9\u30BF\u30F3",
    major: true,
    incomeGroup: "LMC",
    births: 6882100,
    currency: {
      code: "PKR",
      nameJa: "\u30D1\u30AD\u30B9\u30BF\u30F3 \u30EB\u30D4\u30FC",
      symbol: "Rs",
      jpyPerUnit: 0.569779,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 64.861,
    gniPerCapitaLCU: 408512,
    consumptionPerCapitaLCU: 354894,
    incomeShareQuintiles: [
      0.082,
      0.123,
      0.16,
      0.213,
      0.422
    ],
    urbanShare: 0.392,
    places: [
      {
        nameJa: "\u30AB\u30E9\u30C1",
        urban: true,
        share: 0.0703,
        incomeIndex: 1.63
      },
      {
        nameJa: "\u30E9\u30DB\u30FC\u30EB",
        urban: true,
        share: 0.0576,
        incomeIndex: 1.52
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2641,
        incomeIndex: 1.2
      },
      {
        nameJa: "\u30D1\u30F3\u30B8\u30E3\u30FC\u30D6\u5DDE\u306E\u8FB2\u6751",
        urban: false,
        share: 0.3138,
        incomeIndex: 0.87
      },
      {
        nameJa: "\u30B7\u30F3\u30C9\u5DDE\u30FB\u30D0\u30ED\u30FC\u30C1\u30B9\u30BF\u30FC\u30F3\u5DDE\u306E\u8FB2\u6751",
        urban: false,
        share: 0.2942,
        incomeIndex: 0.71
      }
    ],
    lifeExpectancy: {
      male: 65.3,
      female: 70.2
    },
    under5MortalityPer1000: 57.8,
    tfr: 3.6,
    meanAgeFirstMarriage: {
      male: 26.9,
      female: 23.2
    },
    secondaryNetEnrollment: 0.374,
    tertiaryGrossEnrollment: 0.109,
    tertiaryAnnualCostShareOfGni: 0.3,
    unemploymentRate: 0.055,
    informalEmploymentShare: 0.88685,
    pensionCoverage: 0.174,
    pensionReplacementRate: 0.411,
    outOfPocketHealthShare: 0.529,
    effectiveTaxRateAvgWorker: 0.01,
    rentShareOfIncome: 0.216529314752,
    housePriceToIncome: 20,
    disasterRisk: 0.6,
    remittanceShareGdp: 0.0939,
    estimated: [
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=PAK&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/PAK/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      pension_replacement_rate: {
        source: "OECD, Pensions at a Glance Asia/Pacific 2024",
        url: "https://www.oecd.org/en/publications/pensions-at-a-glance-asia-pacific-2024_d4146d12-en/full-report/gross-pension-replacement-rates_4d96e8e7.html",
        year: "2022"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://www.pbs.gov.pk/wp-content/uploads/2020/07/LFS-2024-25-Annual-Report.pdf",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Karachi: 0.07027308747097821,
      Lahore: 0.05763503793170835,
      Faisalabad: 0.015133279889102465,
      Peshawar: 0.009908898147221958,
      Gujranwala: 0.009887956318587625
    }
  },
  {
    iso3: "IDN",
    nameJa: "\u30A4\u30F3\u30C9\u30CD\u30B7\u30A2",
    major: true,
    incomeGroup: "UMC",
    births: 4482500,
    currency: {
      code: "IDR",
      nameJa: "\u30A4\u30F3\u30C9\u30CD\u30B7\u30A2 \u30EB\u30D4\u30A2",
      symbol: "Rp",
      jpyPerUnit: 874287e-8,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 5104.98,
    gniPerCapitaLCU: 76071400,
    consumptionPerCapitaLCU: 43266400,
    incomeShareQuintiles: [
      0.0811,
      0.1181,
      0.1542,
      0.2102,
      0.4364
    ],
    urbanShare: 0.588,
    places: [
      {
        nameJa: "\u30B8\u30E3\u30AB\u30EB\u30BF\u9996\u90FD\u570F",
        urban: true,
        share: 0.0655,
        incomeIndex: 1.66
      },
      {
        nameJa: "\u30B9\u30E9\u30D0\u30E4",
        urban: true,
        share: 0.0109,
        incomeIndex: 1.24
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5116,
        incomeIndex: 1.09
      },
      {
        nameJa: "\u30B8\u30E3\u30EF\u5CF6\u306E\u8FB2\u6751",
        urban: false,
        share: 0.2211,
        incomeIndex: 0.72
      },
      {
        nameJa: "\u5916\u5CF6\u306E\u8FB2\u6751",
        urban: false,
        share: 0.1909,
        incomeIndex: 0.67
      }
    ],
    lifeExpectancy: {
      male: 69,
      female: 73.3
    },
    under5MortalityPer1000: 18.4,
    tfr: 2.13,
    meanAgeFirstMarriage: {
      male: 27.1,
      female: 22.5
    },
    secondaryNetEnrollment: 0.787,
    tertiaryGrossEnrollment: 0.449,
    tertiaryAnnualCostShareOfGni: 0.13,
    unemploymentRate: 0.033,
    informalEmploymentShare: 0.80938,
    pensionCoverage: 0.312,
    pensionReplacementRate: 0.534,
    outOfPocketHealthShare: 0.311,
    effectiveTaxRateAvgWorker: 0.04,
    rentShareOfIncome: 0.105012275258,
    housePriceToIncome: 27,
    disasterRisk: 0.8,
    remittanceShareGdp: 0.0115,
    estimated: [
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=IDN&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2023"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/IDN/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://rplumber.ilo.org/data/indicator/?id=EAR_EMTA_SEX_CUR_NB&ref_area=IDN",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Jakarta: 0.04056226099011822,
      Bekasi: 0.013688189537688645,
      Depok: 0.011220581374981978,
      Surabaya: 0.010939339032870391,
      Bandung: 0.009616116580107345
    }
  },
  {
    iso3: "COD",
    nameJa: "\u30B3\u30F3\u30B4\u6C11\u4E3B\u5171\u548C\u56FD",
    major: true,
    incomeGroup: "LIC",
    births: 4369600,
    currency: {
      code: "CDF",
      nameJa: "\u30B3\u30F3\u30B4 \u30D5\u30E9\u30F3",
      symbol: "CDF",
      jpyPerUnit: 0.0682436,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 928.602,
    gniPerCapitaLCU: 1894980,
    consumptionPerCapitaLCU: 1053170,
    incomeShareQuintiles: [
      0.0549,
      0.0959,
      0.1369,
      0.2018,
      0.5105
    ],
    urbanShare: 0.447,
    places: [
      {
        nameJa: "\u30AD\u30F3\u30B7\u30E3\u30B5",
        urban: true,
        share: 0.1551,
        incomeIndex: 1.94
      },
      {
        nameJa: "\u30EB\u30D6\u30F3\u30D0\u30B7",
        urban: true,
        share: 0.0267,
        incomeIndex: 1.51
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2652,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u6771\u90E8\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2514,
        incomeIndex: 0.75
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3016,
        incomeIndex: 0.7
      }
    ],
    lifeExpectancy: {
      male: 59.8,
      female: 64
    },
    under5MortalityPer1000: 91.3,
    tfr: 6.05,
    meanAgeFirstMarriage: {
      male: 25.8,
      female: 20.9
    },
    secondaryNetEnrollment: 0.559,
    tertiaryGrossEnrollment: 0.064,
    tertiaryAnnualCostShareOfGni: 0.4,
    unemploymentRate: 0.044,
    informalEmploymentShare: 0.97344,
    pensionCoverage: 0.01,
    pensionReplacementRate: 0.3,
    outOfPocketHealthShare: 0.38,
    effectiveTaxRateAvgWorker: 0.08,
    rentShareOfIncome: 0.112781328943,
    housePriceToIncome: 15,
    disasterRisk: 0.4,
    remittanceShareGdp: 0.0264,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2021(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2020; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2012"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/COD/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      homicide_rate: {
        source: "WHO Global Health Estimates",
        url: "https://xmart-api-public.who.int/DATA_/RELAY_WHS?$filter=IND_ID%20eq%20%27361734EVIOLENCE_HOMICIDERATE%27%20and%20DIM_GEO_CODE_M49%20eq%20%27180%27&$select=IND_ID,IND_NAME,GEO_NAME_SHORT,DIM_TIME,DIM_SEX,RATE_PER_100000_N,RATE_PER_100000_NL,RATE_PER_100000_NU&$format=csv",
        year: "2021"
      }
    },
    cityPopulationShare: {
      Kinshasa: 0.15509636306369978,
      "Mbuji-Mayi": 0.02755281737446114,
      Lubumbashi: 0.026706605983248435,
      Kananga: 0.0158403008227408,
      Kisangani: 0.013493058728605943
    }
  },
  {
    iso3: "ETH",
    nameJa: "\u30A8\u30C1\u30AA\u30D4\u30A2",
    major: true,
    incomeGroup: "LIC",
    births: 4105700,
    currency: {
      code: "ETB",
      nameJa: "\u30A8\u30C1\u30AA\u30D4\u30A2 \u30D6\u30EB",
      symbol: "ETB",
      jpyPerUnit: 0.966528,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 48.3911,
    gniPerCapitaLCU: 176021,
    consumptionPerCapitaLCU: 141446,
    incomeShareQuintiles: [
      0.083,
      0.128,
      0.168,
      0.224,
      0.397
    ],
    urbanShare: 0.236,
    places: [
      {
        nameJa: "\u30A2\u30C7\u30A3\u30B9\u30A2\u30D9\u30D0",
        urban: true,
        share: 0.0434,
        incomeIndex: 2.48
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1926,
        incomeIndex: 1.47
      },
      {
        nameJa: "\u30AA\u30ED\u30DF\u30A2\u5DDE\u306E\u8FB2\u6751",
        urban: false,
        share: 0.382,
        incomeIndex: 0.85
      },
      {
        nameJa: "\u30A2\u30E0\u30CF\u30E9\u5DDE\u306E\u8FB2\u6751",
        urban: false,
        share: 0.2101,
        incomeIndex: 0.85
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.1719,
        incomeIndex: 0.79
      }
    ],
    lifeExpectancy: {
      male: 64.1,
      female: 70.7
    },
    under5MortalityPer1000: 51.5,
    tfr: 3.99,
    meanAgeFirstMarriage: {
      male: 25.8,
      female: 21.3
    },
    secondaryNetEnrollment: 0.308,
    tertiaryGrossEnrollment: 0.059,
    tertiaryAnnualCostShareOfGni: 0.1,
    unemploymentRate: 0.034,
    informalEmploymentShare: 0.77654,
    pensionCoverage: 0.042,
    pensionReplacementRate: 0.4,
    outOfPocketHealthShare: 0.463,
    effectiveTaxRateAvgWorker: 0.208,
    rentShareOfIncome: 0.187575769068,
    housePriceToIncome: 20,
    disasterRisk: 0.35,
    remittanceShareGdp: 0.0477,
    estimated: [
      "housePriceToIncome",
      "pensionReplacementRate",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "\u91D1\u984D\u306FWDI 2024\u5E74\u5024\u3092\u70BA\u66FF\u5909\u52D5\u3067\u73FE\u884C\u901A\u8CA8\u6C34\u6E96\u306B\u63DB\u7B97(x1.98); GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2024"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2021"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ETH/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://ilostat.ilo.org/data/country-profiles/eth/",
        year: "2025"
      }
    },
    cityPopulationShare: {
      "Addis Ababa": 0.04342248726650955,
      Mekele: 0.004645195396778779,
      "Dire Dawa": 0.0036966213414109206,
      Nazret: 0.0034086849217146668,
      Gondar: 0.0032821500632856542
    }
  },
  {
    iso3: "USA",
    nameJa: "\u30A2\u30E1\u30EA\u30AB\u5408\u8846\u56FD",
    major: true,
    incomeGroup: "HIC",
    births: 3603300,
    currency: {
      code: "USD",
      nameJa: "\u7C73\u30C9\u30EB",
      symbol: "$",
      jpyPerUnit: 157.728,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1,
    gniPerCapitaLCU: 85273.9,
    consumptionPerCapitaLCU: 58517,
    incomeShareQuintiles: [
      0.0511,
      0.1001,
      0.1512,
      0.2262,
      0.4714
    ],
    urbanShare: 0.801,
    places: [
      {
        nameJa: "\u30CB\u30E5\u30FC\u30E8\u30FC\u30AF",
        urban: true,
        share: 0.055,
        incomeIndex: 1.31
      },
      {
        nameJa: "\u30ED\u30B5\u30F3\u30BC\u30EB\u30B9",
        urban: true,
        share: 0.0364,
        incomeIndex: 1.16
      },
      {
        nameJa: "\u30B7\u30AB\u30B4",
        urban: true,
        share: 0.026,
        incomeIndex: 1.11
      },
      {
        nameJa: "\u30D2\u30E5\u30FC\u30B9\u30C8\u30F3",
        urban: true,
        share: 0.0198,
        incomeIndex: 1.06
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.6638,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u4E2D\u897F\u90E8\u30FB\u5357\u90E8\u306E\u8FB2\u6751",
        urban: false,
        share: 0.199,
        incomeIndex: 0.81
      }
    ],
    lifeExpectancy: {
      male: 75.8,
      female: 81.1
    },
    under5MortalityPer1000: 6.5,
    tfr: 1.62,
    meanAgeFirstMarriage: {
      male: 29.2,
      female: 27.5
    },
    secondaryNetEnrollment: 0.925,
    tertiaryGrossEnrollment: 0.794,
    tertiaryAnnualCostShareOfGni: 0.2272,
    unemploymentRate: 0.04,
    informalEmploymentShare: 0.186,
    pensionCoverage: 1,
    pensionReplacementRate: 0.397,
    outOfPocketHealthShare: 0.109,
    effectiveTaxRateAvgWorker: 0.24314295,
    rentShareOfIncome: 0.16393129697,
    housePriceToIncome: 3.4,
    disasterRisk: 0.35,
    remittanceShareGdp: 3e-4,
    estimated: [
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=USA&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2023"
      },
      informal_employment_share: {
        source: "ILO Women and Men in the Informal Economy: A Statistical Picture",
        url: "https://www.ilo.org/sites/default/files/2024-04/Women_men_informal_economy_statistical_picture.pdf",
        year: "2013"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/USA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      tuition_public_annual: {
        source: "OECD Education at a Glance 2025: United States",
        url: "https://www.oecd.org/en/publications/education-at-a-glance-2025_1a3543e2-en/united-states_784df67f-en.html",
        year: "2025"
      },
      tuition_private_annual: {
        source: "OECD Education at a Glance 2025: United States",
        url: "https://www.oecd.org/en/publications/education-at-a-glance-2025_1a3543e2-en/united-states_784df67f-en.html",
        year: "2025"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      }
    },
    tuition: {
      public: 9596,
      private: 34041
    },
    cityPopulationShare: {
      "New York-Newark": 0.055012153336664295,
      "Los Angeles-Long Beach-Santa Ana": 0.03641113844498725,
      Chicago: 0.02596994305025752,
      Houston: 0.019788160393628497,
      "Dallas-Fort Worth": 0.019335084726551325
    }
  },
  {
    iso3: "BGD",
    nameJa: "\u30D0\u30F3\u30B0\u30E9\u30C7\u30B7\u30E5",
    major: true,
    incomeGroup: "LMC",
    births: 3489900,
    currency: {
      code: "BDT",
      nameJa: "\u30D0\u30F3\u30B0\u30E9\u30C7\u30B7\u30E5 \u30BF\u30AB",
      symbol: "\u09F3",
      jpyPerUnit: 1.27564,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 32.9905,
    gniPerCapitaLCU: 300646,
    consumptionPerCapitaLCU: 202152,
    incomeShareQuintiles: [
      0.088,
      0.128,
      0.165,
      0.218,
      0.401
    ],
    urbanShare: 0.327,
    places: [
      {
        nameJa: "\u30C0\u30C3\u30AB",
        urban: true,
        share: 0.1395,
        incomeIndex: 1.86
      },
      {
        nameJa: "\u30C1\u30C3\u30BF\u30B4\u30F3",
        urban: true,
        share: 0.032,
        incomeIndex: 1.34
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1555,
        incomeIndex: 1.03
      },
      {
        nameJa: "\u5317\u90E8\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3256,
        incomeIndex: 0.77
      },
      {
        nameJa: "\u5357\u90E8\u30FB\u30C7\u30EB\u30BF\u5730\u5E2F\u306E\u8FB2\u6751",
        urban: false,
        share: 0.3474,
        incomeIndex: 0.83
      }
    ],
    lifeExpectancy: {
      male: 73,
      female: 76.4
    },
    under5MortalityPer1000: 30.6,
    tfr: 2.16,
    meanAgeFirstMarriage: {
      male: 25.2,
      female: 18.8
    },
    secondaryNetEnrollment: 0.665,
    tertiaryGrossEnrollment: 0.237,
    tertiaryAnnualCostShareOfGni: 0.2,
    unemploymentRate: 0.036,
    informalEmploymentShare: 0.84037,
    pensionCoverage: 0.569,
    pensionReplacementRate: 0.2,
    outOfPocketHealthShare: 0.793,
    effectiveTaxRateAvgWorker: 0,
    rentShareOfIncome: 0.16440843348,
    housePriceToIncome: 16.3,
    disasterRisk: 0.7,
    remittanceShareGdp: 0.0611,
    estimated: [
      "pensionReplacementRate",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/BGD/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://rplumber.ilo.org/data/indicator/?id=EAR_EMTA_SEX_CUR_NB_A&lang=en&type=label&format=json",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Dhaka: 0.13947356142790282,
      Chittagong: 0.03198463282877473,
      Sylhet: 0.005844094967258891,
      Rajshahi: 0.005697186682298639,
      Bogra: 0.00555126845972018
    }
  },
  {
    iso3: "BRA",
    nameJa: "\u30D6\u30E9\u30B8\u30EB",
    major: true,
    incomeGroup: "UMC",
    births: 2601700,
    currency: {
      code: "BRL",
      nameJa: "\u30D6\u30E9\u30B8\u30EB \u30EC\u30A2\u30EB",
      symbol: "R$",
      jpyPerUnit: 31.3907,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 2.5245,
    gniPerCapitaLCU: 53707.6,
    consumptionPerCapitaLCU: 35536,
    incomeShareQuintiles: [
      0.039,
      0.081,
      0.128,
      0.198,
      0.554
    ],
    urbanShare: 0.879,
    places: [
      {
        nameJa: "\u30B5\u30F3\u30D1\u30A6\u30ED",
        urban: true,
        share: 0.1078,
        incomeIndex: 1.54
      },
      {
        nameJa: "\u30EA\u30AA\u30C7\u30B8\u30E3\u30CD\u30A4\u30ED",
        urban: true,
        share: 0.0653,
        incomeIndex: 1.34
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.7059,
        incomeIndex: 1
      },
      {
        nameJa: "\u5317\u6771\u90E8\u306E\u8FB2\u6751",
        urban: false,
        share: 0.121,
        incomeIndex: 0.51
      }
    ],
    lifeExpectancy: {
      male: 72.8,
      female: 79
    },
    under5MortalityPer1000: 14.4,
    tfr: 1.62,
    meanAgeFirstMarriage: {
      male: 26.8,
      female: 23.9
    },
    secondaryNetEnrollment: 0.817,
    tertiaryGrossEnrollment: 0.697,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.068,
    informalEmploymentShare: 0.35615,
    pensionCoverage: 0.886,
    pensionReplacementRate: 0.884,
    outOfPocketHealthShare: 0.262,
    effectiveTaxRateAvgWorker: 0.1237,
    rentShareOfIncome: 0.155156775982,
    housePriceToIncome: 14.7,
    disasterRisk: 0.35,
    remittanceShareGdp: 22e-4,
    estimated: [
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=BRA&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/BRA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://ilostat.ilo.org/data/country-profiles/bra/",
        year: "2025"
      }
    },
    cityPopulationShare: {
      "S\xE3o Paulo": 0.10783198071467592,
      "Rio de Janeiro": 0.06530537752014204,
      "Belo Horizonte": 0.02979183776506614,
      Bras\u00EDlia: 0.023409377808206705,
      Recife: 0.02037524758020583
    }
  },
  {
    iso3: "EGY",
    nameJa: "\u30A8\u30B8\u30D7\u30C8",
    major: true,
    incomeGroup: "LMC",
    births: 2405700,
    currency: {
      code: "EGP",
      nameJa: "\u30A8\u30B8\u30D7\u30C8 \u30DD\u30F3\u30C9",
      symbol: "E\xA3",
      jpyPerUnit: 2.90058,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 6.95183,
    gniPerCapitaLCU: 113919,
    consumptionPerCapitaLCU: 104481,
    incomeShareQuintiles: [
      0.0969,
      0.1349,
      0.1688,
      0.2138,
      0.3856
    ],
    urbanShare: 0.428,
    places: [
      {
        nameJa: "\u30AB\u30A4\u30ED\u90FD\u5E02\u570F",
        urban: true,
        share: 0.1935,
        incomeIndex: 1.47
      },
      {
        nameJa: "\u30A2\u30EC\u30AF\u30B5\u30F3\u30C9\u30EA\u30A2",
        urban: true,
        share: 0.0487,
        incomeIndex: 1.26
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1858,
        incomeIndex: 1.05
      },
      {
        nameJa: "\u4E0A\u30A8\u30B8\u30D7\u30C8\u306E\u8FB2\u6751",
        urban: false,
        share: 0.2908,
        incomeIndex: 0.74
      },
      {
        nameJa: "\u30CA\u30A4\u30EB\u30FB\u30C7\u30EB\u30BF\u306E\u8FB2\u6751",
        urban: false,
        share: 0.2812,
        incomeIndex: 0.89
      }
    ],
    lifeExpectancy: {
      male: 69.5,
      female: 73.8
    },
    under5MortalityPer1000: 22.9,
    tfr: 2.75,
    meanAgeFirstMarriage: {
      male: 28.1,
      female: 22.3
    },
    secondaryNetEnrollment: 0.828,
    tertiaryGrossEnrollment: 0.376,
    tertiaryAnnualCostShareOfGni: 0.1,
    unemploymentRate: 0.068,
    informalEmploymentShare: 0.68613,
    pensionCoverage: 0.585,
    pensionReplacementRate: 0.55,
    outOfPocketHealthShare: 0.572,
    effectiveTaxRateAvgWorker: 0.1215,
    rentShareOfIncome: 0.128110508431,
    housePriceToIncome: 18.3,
    disasterRisk: 0.25,
    remittanceShareGdp: 0.076,
    estimated: [
      "pensionReplacementRate",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/EGY/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://ilostat.ilo.org/data/country-profiles/egy/",
        year: "2026"
      }
    },
    cityPopulationShare: {
      "Al-Qahirah (Cairo)": 0.1935207041776875,
      "Al-Iskandariyah (Alexandria)": 0.04870302680656639,
      "Bur Sa'id": 0.0067775281628629,
      "As-Suways": 0.005855692882198595,
      "Al-Mansurah": 0.005088511627185705
    }
  },
  {
    iso3: "TZA",
    nameJa: "\u30BF\u30F3\u30B6\u30CB\u30A2",
    major: false,
    incomeGroup: "LMC",
    births: 2346400,
    currency: {
      code: "TZS",
      nameJa: "\u30BF\u30F3\u30B6\u30CB\u30A2 \u30B7\u30EA\u30F3\u30B0",
      symbol: "TZS",
      jpyPerUnit: 0.0596322,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 657.47,
    gniPerCapitaLCU: 3024470,
    consumptionPerCapitaLCU: 1580480,
    incomeShareQuintiles: [
      0.0689,
      0.1049,
      0.1419,
      0.2038,
      0.4805
    ],
    urbanShare: 0.362,
    places: [
      {
        nameJa: "\u30C0\u30EB\u30A8\u30B9\u30B5\u30E9\u30FC\u30E0",
        urban: true,
        share: 0.1085,
        incomeIndex: 1.87
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2532,
        incomeIndex: 1.21
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6383,
        incomeIndex: 0.77
      }
    ],
    lifeExpectancy: {
      male: 64.2,
      female: 69.8
    },
    under5MortalityPer1000: 38.5,
    tfr: 4.61,
    meanAgeFirstMarriage: {
      male: 25.2,
      female: 21
    },
    secondaryNetEnrollment: 0.265,
    tertiaryGrossEnrollment: 0.04,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.016,
    informalEmploymentShare: 0.91421,
    pensionCoverage: 0.06,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.279,
    effectiveTaxRateAvgWorker: 0.1706,
    rentShareOfIncome: 0.342400194485,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0142,
    estimated: [
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2018",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/TZA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://www.nbs.go.tz/uploads/statistics/documents/en-1755335179-Tanzania%20Formal%20Sector%20Employment%20and%20Earnings%20Survey%202023-24%20-%20Report.pdf",
        year: "2025"
      }
    }
  },
  {
    iso3: "MEX",
    nameJa: "\u30E1\u30AD\u30B7\u30B3",
    major: true,
    incomeGroup: "UMC",
    births: 2037700,
    currency: {
      code: "MXN",
      nameJa: "\u30E1\u30AD\u30B7\u30B3 \u30DA\u30BD",
      symbol: "$",
      jpyPerUnit: 8.40967,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 10.8013,
    gniPerCapitaLCU: 248904,
    consumptionPerCapitaLCU: 180972,
    incomeShareQuintiles: [
      0.0561,
      0.1001,
      0.1431,
      0.2112,
      0.4895
    ],
    urbanShare: 0.798,
    places: [
      {
        nameJa: "\u30E1\u30AD\u30B7\u30B3\u30B7\u30C6\u30A3\u9996\u90FD\u570F",
        urban: true,
        share: 0.1717,
        incomeIndex: 1.37
      },
      {
        nameJa: "\u30B0\u30A2\u30C0\u30E9\u30CF\u30E9",
        urban: true,
        share: 0.0421,
        incomeIndex: 1.16
      },
      {
        nameJa: "\u30E2\u30F3\u30C6\u30EC\u30A4",
        urban: true,
        share: 0.0398,
        incomeIndex: 1.42
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5444,
        incomeIndex: 1
      },
      {
        nameJa: "\u5357\u90E8\u306E\u8FB2\u6751",
        urban: false,
        share: 0.202,
        incomeIndex: 0.63
      }
    ],
    lifeExpectancy: {
      male: 72.2,
      female: 77.8
    },
    under5MortalityPer1000: 13.4,
    tfr: 1.91,
    meanAgeFirstMarriage: {
      male: 25.9,
      female: 23.2
    },
    secondaryNetEnrollment: 0.812,
    tertiaryGrossEnrollment: 0.482,
    tertiaryAnnualCostShareOfGni: 0.15,
    unemploymentRate: 0.027,
    informalEmploymentShare: 0.56878,
    pensionCoverage: 1,
    pensionReplacementRate: 0.696,
    outOfPocketHealthShare: 0.412,
    effectiveTaxRateAvgWorker: 0.13174865,
    rentShareOfIncome: 0.169848017751,
    housePriceToIncome: 13,
    disasterRisk: 0.65,
    remittanceShareGdp: 0.0371,
    estimated: [
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2019"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2019"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/MEX/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      }
    },
    cityPopulationShare: {
      "Ciudad de M\xE9xico (Mexico City)": 0.1717420156078435,
      Guadalajara: 0.04210880291267708,
      Monterrey: 0.03979733271054837,
      Puebla: 0.02599095102410975,
      "Toluca de Lerdo": 0.020527726467169407
    }
  },
  {
    iso3: "PHL",
    nameJa: "\u30D5\u30A3\u30EA\u30D4\u30F3",
    major: true,
    incomeGroup: "LMC",
    births: 1840400,
    currency: {
      code: "PHP",
      nameJa: "\u30D5\u30A3\u30EA\u30D4\u30F3 \u30DA\u30BD",
      symbol: "\u20B1",
      jpyPerUnit: 2.48673,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 20.7435,
    gniPerCapitaLCU: 257956,
    consumptionPerCapitaLCU: 173863,
    incomeShareQuintiles: [
      0.069,
      0.107,
      0.146,
      0.209,
      0.469
    ],
    urbanShare: 0.555,
    places: [
      {
        nameJa: "\u30DE\u30CB\u30E9\u9996\u90FD\u570F",
        urban: true,
        share: 0.1299,
        incomeIndex: 1.81
      },
      {
        nameJa: "\u30BB\u30D6",
        urban: true,
        share: 91e-4,
        incomeIndex: 1.28
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.416,
        incomeIndex: 1.06
      },
      {
        nameJa: "\u30EB\u30BD\u30F3\u5CF6\u306E\u8FB2\u6751",
        urban: false,
        share: 0.2225,
        incomeIndex: 0.85
      },
      {
        nameJa: "\u30DF\u30F3\u30C0\u30CA\u30AA\u5CF6\u306E\u8FB2\u6751",
        urban: false,
        share: 0.2225,
        incomeIndex: 0.64
      }
    ],
    lifeExpectancy: {
      male: 66.9,
      female: 72.8
    },
    under5MortalityPer1000: 27,
    tfr: 1.92,
    meanAgeFirstMarriage: {
      male: 27.1,
      female: 24
    },
    secondaryNetEnrollment: 0.656,
    tertiaryGrossEnrollment: 0.474,
    tertiaryAnnualCostShareOfGni: 0.2,
    unemploymentRate: 0.022,
    informalEmploymentShare: 0.7,
    pensionCoverage: 0.656,
    pensionReplacementRate: 0.724,
    outOfPocketHealthShare: 0.444,
    effectiveTaxRateAvgWorker: 0.1023,
    rentShareOfIncome: 0.119813098576,
    housePriceToIncome: 34.5,
    disasterRisk: 0.95,
    remittanceShareGdp: 0.0872,
    estimated: [
      "informalEmploymentShare",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/PHL/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      pension_replacement_rate: {
        source: "OECD, Pensions at a Glance Asia/Pacific 2024",
        url: "https://www.oecd.org/en/publications/pensions-at-a-glance-asia-pacific-2024_d4146d12-en/full-report/gross-pension-replacement-rates_4d96e8e7.html",
        year: "2022"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://psa.gov.ph/statistics/occupational-wages-survey/node/1684081185",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Manila: 0.12988970193522498,
      "Davao City": 0.01734629932364403,
      "Cebu City": 0.009053764542560738,
      "Zamboanga City": 0.008485818573533716,
      Antipolo: 0.008441744683691509
    }
  },
  {
    iso3: "UGA",
    nameJa: "\u30A6\u30AC\u30F3\u30C0",
    major: false,
    incomeGroup: "LIC",
    births: 1712800,
    currency: {
      code: "UGX",
      nameJa: "\u30A6\u30AC\u30F3\u30C0 \u30B7\u30EA\u30F3\u30B0",
      symbol: "UGX",
      jpyPerUnit: 0.037517,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1325.72,
    gniPerCapitaLCU: 3960460,
    consumptionPerCapitaLCU: 2691020,
    incomeShareQuintiles: [
      0.066,
      0.11,
      0.152,
      0.219,
      0.453
    ],
    urbanShare: 0.313,
    places: [
      {
        nameJa: "\u30AB\u30F3\u30D1\u30E9",
        urban: true,
        share: 0.0938,
        incomeIndex: 2.19
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2189,
        incomeIndex: 1.27
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6873,
        incomeIndex: 0.75
      }
    ],
    lifeExpectancy: {
      male: 65.3,
      female: 71.1
    },
    under5MortalityPer1000: 49.4,
    tfr: 4.28,
    meanAgeFirstMarriage: {
      male: 24.7,
      female: 20.7
    },
    secondaryNetEnrollment: 0.263,
    tertiaryGrossEnrollment: 0.046,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.027,
    informalEmploymentShare: 0.94479,
    pensionCoverage: 0.183,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.322,
    effectiveTaxRateAvgWorker: 0.2096,
    rentShareOfIncome: 0.284211721697,
    housePriceToIncome: 17.5,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0265,
    estimated: [
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2021"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/UGA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://rplumber.ilo.org/data/indicator/?id=EAR_EMTA_SEX_ECO_CUR_NB_A&lang=en&type=label&format=.csv",
        year: "2025"
      }
    }
  },
  {
    iso3: "SDN",
    nameJa: "\u30B9\u30FC\u30C0\u30F3",
    major: false,
    incomeGroup: "LIC",
    births: 1682e3,
    currency: {
      code: "SDG",
      nameJa: "\u30B9\u30FC\u30C0\u30F3 \u30DD\u30F3\u30C9",
      symbol: "SDG",
      jpyPerUnit: 0.262803,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 224.284,
    gniPerCapitaLCU: 1490440,
    consumptionPerCapitaLCU: 1251350,
    incomeShareQuintiles: [
      0.0779,
      0.1209,
      0.1608,
      0.2168,
      0.4236
    ],
    urbanShare: 0.349,
    places: [
      {
        nameJa: "\u30CF\u30EB\u30C4\u30FC\u30E0",
        urban: true,
        share: 0.1046,
        incomeIndex: 2.13
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2441,
        incomeIndex: 1.24
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6513,
        incomeIndex: 0.73
      }
    ],
    lifeExpectancy: {
      male: 63.3,
      female: 69.6
    },
    under5MortalityPer1000: 63.1,
    tfr: 4.32,
    meanAgeFirstMarriage: {
      male: 28.9,
      female: 21.9
    },
    secondaryNetEnrollment: 0.475,
    tertiaryGrossEnrollment: 0.159,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.075,
    informalEmploymentShare: 0.94194,
    pensionCoverage: 0.106,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.574,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.103981238802,
    housePriceToIncome: 17.5,
    disasterRisk: 0.45,
    remittanceShareGdp: 5e-4,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2022(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2014; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=SDN&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/SDN/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "KEN",
    nameJa: "\u30B1\u30CB\u30A2",
    major: true,
    incomeGroup: "LMC",
    births: 15e5,
    currency: {
      code: "KES",
      nameJa: "\u30B1\u30CB\u30A2 \u30B7\u30EA\u30F3\u30B0",
      symbol: "KES",
      jpyPerUnit: 1.21476,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 44.3917,
    gniPerCapitaLCU: 281133,
    consumptionPerCapitaLCU: 222404,
    incomeShareQuintiles: [
      0.0709,
      0.1089,
      0.1459,
      0.2118,
      0.4625
    ],
    urbanShare: 0.319,
    places: [
      {
        nameJa: "\u30CA\u30A4\u30ED\u30D3",
        urban: true,
        share: 0.0993,
        incomeIndex: 2.13
      },
      {
        nameJa: "\u30E2\u30F3\u30D0\u30B5",
        urban: true,
        share: 0.0267,
        incomeIndex: 1.49
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.193,
        incomeIndex: 1.17
      },
      {
        nameJa: "\u897F\u90E8\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3891,
        incomeIndex: 0.75
      },
      {
        nameJa: "\u4E2D\u592E\u90E8\u306E\u8FB2\u6751",
        urban: false,
        share: 0.1946,
        incomeIndex: 0.96
      },
      {
        nameJa: "\u5317\u90E8\u306E\u4E7E\u71E5\u5730\u5E2F",
        urban: false,
        share: 0.0973,
        incomeIndex: 0.53
      }
    ],
    lifeExpectancy: {
      male: 61.5,
      female: 65.9
    },
    under5MortalityPer1000: 39.6,
    tfr: 3.21,
    meanAgeFirstMarriage: {
      male: 26.3,
      female: 21.9
    },
    secondaryNetEnrollment: 1,
    tertiaryGrossEnrollment: 0.104,
    tertiaryAnnualCostShareOfGni: 0.4,
    unemploymentRate: 0.055,
    informalEmploymentShare: 0.86489,
    pensionCoverage: 0.198,
    pensionReplacementRate: 0.3,
    outOfPocketHealthShare: 0.242,
    effectiveTaxRateAvgWorker: 0.2868,
    rentShareOfIncome: 0.133960278542,
    housePriceToIncome: 17,
    disasterRisk: 0.35,
    remittanceShareGdp: 0.0415,
    estimated: [
      "pensionReplacementRate",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2019"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/KEN/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://ilostat.ilo.org/data/country-profiles/ken/",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Nairobi: 0.0992877506366256,
      Mombasa: 0.026745333750892462,
      Ruiru: 0.008344904300853304,
      Eldoret: 0.008331802493613084,
      Nakuru: 0.0078047861711027155
    }
  },
  {
    iso3: "AFG",
    nameJa: "\u30A2\u30D5\u30AC\u30CB\u30B9\u30BF\u30F3",
    major: false,
    incomeGroup: "LIC",
    births: 1469e3,
    currency: {
      code: "AFN",
      nameJa: "\u30A2\u30D5\u30AC\u30CB\u30B9\u30BF\u30F3 \u30A2\u30D5\u30AC\u30CB\u30FC",
      symbol: "\u060B",
      jpyPerUnit: 2.44669,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 13.988,
    gniPerCapitaLCU: 29716.4,
    consumptionPerCapitaLCU: 33050.5,
    incomeShareQuintiles: [
      0.072,
      0.1119,
      0.1529,
      0.2139,
      0.4493
    ],
    urbanShare: 0.257,
    places: [
      {
        nameJa: "\u30AB\u30D6\u30FC\u30EB",
        urban: true,
        share: 0.0771,
        incomeIndex: 2.3
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1799,
        incomeIndex: 1.33
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.743,
        incomeIndex: 0.79
      }
    ],
    lifeExpectancy: {
      male: 64.5,
      female: 67.5
    },
    under5MortalityPer1000: 54.9,
    tfr: 4.84,
    meanAgeFirstMarriage: {
      male: 24.3,
      female: 21.5
    },
    secondaryNetEnrollment: 0.501,
    tertiaryGrossEnrollment: 0.109,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.137,
    informalEmploymentShare: 0.86135,
    pensionCoverage: 0.247,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.771,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.35,
    housePriceToIncome: 17.5,
    disasterRisk: 0.55,
    remittanceShareGdp: 0.0395,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "incomeShareQuintiles",
      "pensionReplacementRate",
      "places",
      "rentShareOfIncome",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP)",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2019"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2021"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      }
    }
  },
  {
    iso3: "VNM",
    nameJa: "\u30D9\u30C8\u30CA\u30E0",
    major: true,
    incomeGroup: "LMC",
    births: 1388e3,
    currency: {
      code: "VND",
      nameJa: "\u30D9\u30C8\u30CA\u30E0 \u30C9\u30F3",
      symbol: "\u20AB",
      jpyPerUnit: 610357e-8,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 7160.71,
    gniPerCapitaLCU: 110222e3,
    consumptionPerCapitaLCU: 61043200,
    incomeShareQuintiles: [
      0.0681,
      0.1181,
      0.1612,
      0.2202,
      0.4324
    ],
    urbanShare: 0.385,
    places: [
      {
        nameJa: "\u30DB\u30FC\u30C1\u30DF\u30F3",
        urban: true,
        share: 0.0963,
        incomeIndex: 1.64
      },
      {
        nameJa: "\u30CF\u30CE\u30A4",
        urban: true,
        share: 0.055,
        incomeIndex: 1.54
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2337,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u30E1\u30B3\u30F3\u30C7\u30EB\u30BF\u306E\u8FB2\u6751",
        urban: false,
        share: 0.1815,
        incomeIndex: 0.82
      },
      {
        nameJa: "\u5317\u90E8\u5C71\u5CB3\u5730\u5E2F\u306E\u8FB2\u6751",
        urban: false,
        share: 0.1008,
        incomeIndex: 0.56
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3327,
        incomeIndex: 0.87
      }
    ],
    lifeExpectancy: {
      male: 69.9,
      female: 79.3
    },
    under5MortalityPer1000: 17.8,
    tfr: 1.91,
    meanAgeFirstMarriage: {
      male: 26.9,
      female: 22.8
    },
    secondaryNetEnrollment: 0.952,
    tertiaryGrossEnrollment: 0.376,
    tertiaryAnnualCostShareOfGni: 0.15,
    unemploymentRate: 0.016,
    informalEmploymentShare: 0.67032,
    pensionCoverage: 0.409,
    pensionReplacementRate: 0.587,
    outOfPocketHealthShare: 0.392,
    effectiveTaxRateAvgWorker: 0.1,
    rentShareOfIncome: 0.120771124457,
    housePriceToIncome: 32.7,
    disasterRisk: 0.6,
    remittanceShareGdp: 0.061,
    estimated: [
      "remittanceShareGdp",
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2019"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/VNM/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      },
      pension_replacement_rate: {
        source: "OECD, Pensions at a Glance Asia/Pacific 2024",
        url: "https://www.oecd.org/en/publications/pensions-at-a-glance-asia-pacific-2024_d4146d12-en/full-report/gross-pension-replacement-rates_4d96e8e7.html",
        year: "2022"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://ilostat.ilo.org/data/country-profiles/vnm/",
        year: "2026"
      }
    },
    cityPopulationShare: {
      "Th\xE0nh Pho Ho Ch\xED Minh (Ho Chi Minh City)": 0.09633571745060572,
      "H\xE0 Noi": 0.05497908166516389,
      "Can Tho": 0.019701252558307104,
      "Hai Ph\xF2ng": 0.014759133227637685,
      "Da Nang": 0.012620620241584606
    }
  },
  {
    iso3: "YEM",
    nameJa: "\u30A4\u30A8\u30E1\u30F3",
    major: false,
    incomeGroup: "LIC",
    births: 1386900,
    currency: {
      code: "YER",
      nameJa: "\u30A4\u30A8\u30E1\u30F3 \u30EA\u30A2\u30EB",
      symbol: "YER",
      jpyPerUnit: 0.667991,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 77.9206,
    gniPerCapitaLCU: 129868,
    consumptionPerCapitaLCU: 77920.6,
    incomeShareQuintiles: [
      0.073,
      0.115,
      0.153,
      0.212,
      0.447
    ],
    urbanShare: 0.368,
    places: [
      {
        nameJa: "\u30B5\u30CC\u30A2",
        urban: true,
        share: 0.1104,
        incomeIndex: 2.1
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2577,
        incomeIndex: 1.22
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6319,
        incomeIndex: 0.72
      }
    ],
    lifeExpectancy: {
      male: 67.2,
      female: 71.4
    },
    under5MortalityPer1000: 39.5,
    tfr: 4.59,
    meanAgeFirstMarriage: {
      male: 26.1,
      female: 23
    },
    secondaryNetEnrollment: 0.476,
    tertiaryGrossEnrollment: 0.064,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.17,
    informalEmploymentShare: 0.77376,
    pensionCoverage: 0.178,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.691,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.35,
    housePriceToIncome: 17.5,
    disasterRisk: 0.45,
    remittanceShareGdp: 0.1204,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "gniPerCapitaLCU",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "pppPerIntlDollar",
      "rentShareOfIncome",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "GNI\u306FWDI\u6B20\u640D\u306E\u305F\u3081\u63A8\u5B9A(\u7C73\u30C9\u30EB\u63DB\u7B97); GNI2025/\u6D88\u8CBB\u63A8\u5B9A/PPP\u63A8\u5B9A; \u4E94\u5206\u4F4D2014",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2014"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      ipv_past12m_women: {
        source: "WHO Violence Against Women Prevalence Estimates 2018",
        url: "https://www.who.int/publications/i/item/9789240022256",
        year: "2018"
      }
    }
  },
  {
    iso3: "AGO",
    nameJa: "\u30A2\u30F3\u30B4\u30E9",
    major: false,
    incomeGroup: "LMC",
    births: 1381400,
    currency: {
      code: "AOA",
      nameJa: "\u30A2\u30F3\u30B4\u30E9 \u30AF\u30EF\u30F3\u30B6",
      symbol: "Kz",
      jpyPerUnit: 0.172073,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 311.186,
    gniPerCapitaLCU: 2569870,
    consumptionPerCapitaLCU: 1693270,
    incomeShareQuintiles: [
      0.038,
      0.0769,
      0.1259,
      0.2038,
      0.5554
    ],
    urbanShare: 0.707,
    places: [
      {
        nameJa: "\u30EB\u30A2\u30F3\u30C0",
        urban: true,
        share: 0.212,
        incomeIndex: 1.53
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4946,
        incomeIndex: 0.99
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2934,
        incomeIndex: 0.63
      }
    ],
    lifeExpectancy: {
      male: 62.1,
      female: 67.1
    },
    under5MortalityPer1000: 50.5,
    tfr: 5.12,
    meanAgeFirstMarriage: {
      male: 25.8,
      female: 21.7
    },
    secondaryNetEnrollment: 0.421,
    tertiaryGrossEnrollment: 0.1,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.14,
    informalEmploymentShare: 0.94488,
    pensionCoverage: 0.153,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.325,
    effectiveTaxRateAvgWorker: 0.03,
    rentShareOfIncome: 0.0458084149474,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 5e-4,
    estimated: [
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2018; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/AGO/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://rplumber.ilo.org/data/indicator/?id=EAR_EMTA_SEX_NB_A&lang=en&type=label&format=.csv",
        year: "2026"
      }
    }
  },
  {
    iso3: "MOZ",
    nameJa: "\u30E2\u30B6\u30F3\u30D3\u30FC\u30AF",
    major: false,
    incomeGroup: "LIC",
    births: 1260800,
    currency: {
      code: "MZN",
      nameJa: "\u30E2\u30B6\u30F3\u30D3\u30FC\u30AF \u30E1\u30C6\u30A3\u30AB\u30EB",
      symbol: "MZN",
      jpyPerUnit: 2.47101,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 25.0908,
    gniPerCapitaLCU: 37342.1,
    consumptionPerCapitaLCU: 31027.5,
    incomeShareQuintiles: [
      0.047,
      0.0859,
      0.1249,
      0.1878,
      0.5544
    ],
    urbanShare: 0.364,
    places: [
      {
        nameJa: "\u30DE\u30D7\u30C8",
        urban: true,
        share: 0.1093,
        incomeIndex: 2.11
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.255,
        incomeIndex: 1.22
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6357,
        incomeIndex: 0.72
      }
    ],
    lifeExpectancy: {
      male: 60.3,
      female: 66.5
    },
    under5MortalityPer1000: 61.7,
    tfr: 4.76,
    meanAgeFirstMarriage: {
      male: 23.4,
      female: 18.7
    },
    secondaryNetEnrollment: 0.193,
    tertiaryGrossEnrollment: 0.075,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.067,
    informalEmploymentShare: 0.95511,
    pensionCoverage: 0.423,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.104,
    effectiveTaxRateAvgWorker: 0.03,
    rentShareOfIncome: 0.0884811381397,
    housePriceToIncome: 17.5,
    disasterRisk: 0.65,
    remittanceShareGdp: 0.0117,
    estimated: [
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2015"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/MOZ/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://rplumber.ilo.org/data/indicator/?id=EAR_EMTA_SEX_IND_NB_A&lang=en&type=label&format=.csv",
        year: "2025"
      }
    }
  },
  {
    iso3: "RUS",
    nameJa: "\u30ED\u30B7\u30A2",
    major: false,
    incomeGroup: "HIC",
    births: 1236900,
    currency: {
      code: "RUB",
      nameJa: "\u30ED\u30B7\u30A2 \u30EB\u30FC\u30D6\u30EB",
      symbol: "\u20BD",
      jpyPerUnit: 1.93599,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 29.0498,
    gniPerCapitaLCU: 1367060,
    consumptionPerCapitaLCU: 695866,
    incomeShareQuintiles: [
      0.077,
      0.121,
      0.165,
      0.227,
      0.41
    ],
    urbanShare: 0.751,
    places: [
      {
        nameJa: "\u30E2\u30B9\u30AF\u30EF",
        urban: true,
        share: 0.2253,
        incomeIndex: 1.12
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5258,
        incomeIndex: 1.03
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2489,
        incomeIndex: 0.84
      }
    ],
    lifeExpectancy: {
      male: 68,
      female: 78.7
    },
    under5MortalityPer1000: 5.3,
    tfr: 1.41,
    meanAgeFirstMarriage: {
      male: 27,
      female: 24.4
    },
    secondaryNetEnrollment: 0.907,
    tertiaryGrossEnrollment: 0.604,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.024,
    informalEmploymentShare: 0.19226,
    pensionCoverage: 1,
    pensionReplacementRate: 0.41,
    outOfPocketHealthShare: 0.284,
    effectiveTaxRateAvgWorker: 0.13,
    rentShareOfIncome: 0.275,
    housePriceToIncome: 13.1,
    disasterRisk: 0.25,
    remittanceShareGdp: 8e-4,
    estimated: [
      "pensionReplacementRate",
      "places",
      "rentShareOfIncome",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://rosstat.gov.ru/labor_market_employment_salaries",
        year: "2025"
      }
    }
  },
  {
    iso3: "ZAF",
    nameJa: "\u5357\u30A2\u30D5\u30EA\u30AB",
    major: false,
    incomeGroup: "UMC",
    births: 1186800,
    currency: {
      code: "ZAR",
      nameJa: "\u5357\u30A2\u30D5\u30EA\u30AB \u30E9\u30F3\u30C9",
      symbol: "R",
      jpyPerUnit: 9.61652,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 7.70191,
    gniPerCapitaLCU: 112611,
    consumptionPerCapitaLCU: 74252.1,
    incomeShareQuintiles: [
      0.037,
      0.069,
      0.108,
      0.191,
      0.595
    ],
    urbanShare: 0.637,
    places: [
      {
        nameJa: "\u30E8\u30CF\u30CD\u30B9\u30D6\u30EB\u30AF",
        urban: true,
        share: 0.1911,
        incomeIndex: 1.36
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4458,
        incomeIndex: 1.07
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3631,
        incomeIndex: 0.73
      }
    ],
    lifeExpectancy: {
      male: 62.6,
      female: 69.6
    },
    under5MortalityPer1000: 34.8,
    tfr: 2.22,
    meanAgeFirstMarriage: {
      male: 33.2,
      female: 27.2
    },
    secondaryNetEnrollment: 0.719,
    tertiaryGrossEnrollment: 0.235,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.323,
    informalEmploymentShare: 0.4233,
    pensionCoverage: 0.815,
    pensionReplacementRate: 0.078,
    outOfPocketHealthShare: 0.067,
    effectiveTaxRateAvgWorker: 0.1589,
    rentShareOfIncome: 0.138777842859,
    housePriceToIncome: 3.1,
    disasterRisk: 0.3,
    remittanceShareGdp: 21e-4,
    estimated: [
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=ZAF&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2020"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ZAF/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://www.statssa.gov.za/publications/P0277/P0277September2023.pdf",
        year: "2026"
      }
    }
  },
  {
    iso3: "IRN",
    nameJa: "\u30A4\u30E9\u30F3",
    major: false,
    incomeGroup: "UMC",
    births: 1173500,
    currency: {
      code: "IRR",
      nameJa: "\u30A4\u30E9\u30F3 \u30EA\u30A2\u30EB",
      symbol: "IRR",
      jpyPerUnit: 8601e-8,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 113985,
    gniPerCapitaLCU: 234447e4,
    consumptionPerCapitaLCU: 106874e4,
    incomeShareQuintiles: [
      0.07,
      0.117,
      0.16,
      0.22,
      0.433
    ],
    urbanShare: 0.77,
    places: [
      {
        nameJa: "\u30C6\u30D8\u30E9\u30F3",
        urban: true,
        share: 0.2311,
        incomeIndex: 1.29
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5391,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2298,
        incomeIndex: 0.69
      }
    ],
    lifeExpectancy: {
      male: 75.8,
      female: 79.6
    },
    under5MortalityPer1000: 11.7,
    tfr: 1.7,
    meanAgeFirstMarriage: {
      male: 27.5,
      female: 23.1
    },
    secondaryNetEnrollment: 0.814,
    tertiaryGrossEnrollment: 0.587,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.081,
    informalEmploymentShare: 0.572,
    pensionCoverage: 0.872,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.431,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.275,
    housePriceToIncome: 16,
    disasterRisk: 0.5,
    remittanceShareGdp: 0.0316,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "remittanceShareGdp",
      "rentShareOfIncome",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2019"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      ipv_past12m_women: {
        source: "WHO Violence Against Women Prevalence Estimates 2018",
        url: "https://www.who.int/publications/i/item/9789240022256",
        year: "2018"
      }
    }
  },
  {
    iso3: "IRQ",
    nameJa: "\u30A4\u30E9\u30AF",
    major: false,
    incomeGroup: "UMC",
    births: 1159700,
    currency: {
      code: "IQD",
      nameJa: "\u30A4\u30E9\u30AF \u30C7\u30A3\u30CA\u30FC\u30EB",
      symbol: "IQD",
      jpyPerUnit: 0.10403,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 559.022,
    gniPerCapitaLCU: 7933270,
    consumptionPerCapitaLCU: 3664280,
    incomeShareQuintiles: [
      0.0889,
      0.1309,
      0.1688,
      0.2228,
      0.3886
    ],
    urbanShare: 0.699,
    places: [
      {
        nameJa: "\u30D0\u30B0\u30C0\u30C3\u30C9",
        urban: true,
        share: 0.2097,
        incomeIndex: 1.32
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4892,
        incomeIndex: 1.04
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3011,
        incomeIndex: 0.71
      }
    ],
    lifeExpectancy: {
      male: 70.4,
      female: 74.1
    },
    under5MortalityPer1000: 22.5,
    tfr: 3.25,
    meanAgeFirstMarriage: {
      male: 26.2,
      female: 22.7
    },
    secondaryNetEnrollment: 0.826,
    tertiaryGrossEnrollment: 0.482,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.153,
    informalEmploymentShare: 0.67639,
    pensionCoverage: 0.489,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.54,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.219696808729,
    housePriceToIncome: 10.1,
    disasterRisk: 0.3,
    remittanceShareGdp: 25e-4,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "secondaryNetEnrollment",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2021"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2012"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2012"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/IRQ/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      ipv_past12m_women: {
        source: "WHO Violence Against Women Prevalence Estimates 2018 / MICS",
        url: "https://microdata.worldbank.org/index.php/catalog/mics",
        year: "2018"
      }
    }
  },
  {
    iso3: "NER",
    nameJa: "\u30CB\u30B8\u30A7\u30FC\u30EB",
    major: false,
    incomeGroup: "LIC",
    births: 1095900,
    currency: {
      code: "XOF",
      nameJa: "\u897F\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "F\u202FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 214.521,
    gniPerCapitaLCU: 434720,
    consumptionPerCapitaLCU: 317196,
    incomeShareQuintiles: [
      0.087,
      0.124,
      0.159,
      0.208,
      0.422
    ],
    urbanShare: 0.18,
    places: [
      {
        nameJa: "\u30CB\u30A2\u30E1",
        urban: true,
        share: 0.0541,
        incomeIndex: 2.45
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1263,
        incomeIndex: 1.42
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.8196,
        incomeIndex: 0.84
      }
    ],
    lifeExpectancy: {
      male: 60.3,
      female: 62.1
    },
    under5MortalityPer1000: 113.5,
    tfr: 6.06,
    meanAgeFirstMarriage: {
      male: 24,
      female: 17.2
    },
    secondaryNetEnrollment: 0.201,
    tertiaryGrossEnrollment: 0.042,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 4e-3,
    informalEmploymentShare: 0.9847,
    pensionCoverage: 0.058,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.515,
    effectiveTaxRateAvgWorker: 0.0848,
    rentShareOfIncome: 0.107802144868,
    housePriceToIncome: 17.5,
    disasterRisk: 0.45,
    remittanceShareGdp: 0.033,
    estimated: [
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=NER&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2015"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/NER/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://ilostat.ilo.org/fr/data/country-profiles/ner/",
        year: "2025"
      }
    }
  },
  {
    iso3: "MDG",
    nameJa: "\u30DE\u30C0\u30AC\u30B9\u30AB\u30EB",
    major: false,
    incomeGroup: "LIC",
    births: 1001200,
    currency: {
      code: "MGA",
      nameJa: "\u30DE\u30C0\u30AC\u30B9\u30AB\u30EB \u30A2\u30EA\u30A2\u30EA",
      symbol: "Ar",
      jpyPerUnit: 0.0349058,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1250.23,
    gniPerCapitaLCU: 2422310,
    consumptionPerCapitaLCU: 1773410,
    incomeShareQuintiles: [
      0.0719,
      0.1149,
      0.1548,
      0.2118,
      0.4466
    ],
    urbanShare: 0.324,
    places: [
      {
        nameJa: "\u30A2\u30F3\u30BF\u30CA\u30CA\u30EA\u30DC",
        urban: true,
        share: 0.0973,
        incomeIndex: 2.17
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.227,
        incomeIndex: 1.26
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6757,
        incomeIndex: 0.74
      }
    ],
    lifeExpectancy: {
      male: 61.9,
      female: 65.4
    },
    under5MortalityPer1000: 63.6,
    tfr: 3.97,
    meanAgeFirstMarriage: {
      male: 22.4,
      female: 20
    },
    secondaryNetEnrollment: 0.298,
    tertiaryGrossEnrollment: 0.061,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.031,
    informalEmploymentShare: 0.96081,
    pensionCoverage: 0.192,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.274,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.0976263922725,
    housePriceToIncome: 17.5,
    disasterRisk: 0.55,
    remittanceShareGdp: 0.0231,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=MDG&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2009"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2009"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/MDG/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      homicide_rate: {
        source: "UNODC Research Data Portal",
        url: "https://dataunodc.un.org/",
        year: "2015"
      }
    }
  },
  {
    iso3: "CIV",
    nameJa: "\u30B3\u30FC\u30C8\u30B8\u30DC\u30EF\u30FC\u30EB",
    major: false,
    incomeGroup: "LMC",
    births: 997e3,
    currency: {
      code: "XOF",
      nameJa: "\u897F\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "F\u202FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 234.123,
    gniPerCapitaLCU: 1581490,
    consumptionPerCapitaLCU: 1142620,
    incomeShareQuintiles: [
      0.076,
      0.116,
      0.157,
      0.218,
      0.433
    ],
    urbanShare: 0.54,
    places: [
      {
        nameJa: "\u30A2\u30D3\u30B8\u30E3\u30F3",
        urban: true,
        share: 0.1619,
        incomeIndex: 1.68
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3778,
        incomeIndex: 1.09
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4603,
        incomeIndex: 0.69
      }
    ],
    lifeExpectancy: {
      male: 60,
      female: 64.1
    },
    under5MortalityPer1000: 66.5,
    tfr: 4.28,
    meanAgeFirstMarriage: {
      male: 29.2,
      female: 23
    },
    secondaryNetEnrollment: 0.402,
    tertiaryGrossEnrollment: 0.123,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.023,
    informalEmploymentShare: 0.92125,
    pensionCoverage: 0.162,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.32,
    effectiveTaxRateAvgWorker: 0.1552,
    rentShareOfIncome: 0.0772625977772,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0203,
    estimated: [
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/CIV/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://www.cleiss.fr/docs/cotisations/cotedivoire.html",
        year: "2025"
      },
      homicide_rate: {
        source: "UNODC Research Data Portal",
        url: "https://dataunodc.un.org/",
        year: "2021"
      }
    }
  },
  {
    iso3: "CMR",
    nameJa: "\u30AB\u30E1\u30EB\u30FC\u30F3",
    major: false,
    incomeGroup: "LMC",
    births: 957400,
    currency: {
      code: "XAF",
      nameJa: "\u4E2D\u592E\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 207.582,
    gniPerCapitaLCU: 1086590,
    consumptionPerCapitaLCU: 805707,
    incomeShareQuintiles: [
      0.0539,
      0.0959,
      0.1469,
      0.2248,
      0.4785
    ],
    urbanShare: 0.554,
    places: [
      {
        nameJa: "\u30C9\u30A5\u30A2\u30E9",
        urban: true,
        share: 0.1662,
        incomeIndex: 1.66
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3878,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.446,
        incomeIndex: 0.69
      }
    ],
    lifeExpectancy: {
      male: 61.5,
      female: 65.9
    },
    under5MortalityPer1000: 67,
    tfr: 4.32,
    meanAgeFirstMarriage: {
      male: 28.5,
      female: 22.2
    },
    secondaryNetEnrollment: 0.46,
    tertiaryGrossEnrollment: 0.167,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.036,
    informalEmploymentShare: 0.87099,
    pensionCoverage: 0.183,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.677,
    effectiveTaxRateAvgWorker: 0.1025,
    rentShareOfIncome: 0.157451862981,
    housePriceToIncome: 46,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0129,
    estimated: [
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2020"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2014"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/CMR/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      tax_rate_avg_worker: {
        source: "\u8A08\u7B97\u5024\uFF08\u5E73\u5747\u6708\u53CE\u30FB\u7A0E\u7387\u8868\u30FB\u672C\u4EBA\u8CA0\u62C5\u793E\u4F1A\u4FDD\u967A\u6599\u7387\u304B\u3089\uFF09",
        url: "https://www.ssa.gov/policy/docs/progdesc/ssptw/2018-2019/africa/cameroon.html",
        year: "2026"
      }
    }
  },
  {
    iso3: "TUR",
    nameJa: "\u30C8\u30EB\u30B3",
    major: false,
    incomeGroup: "UMC",
    births: 955700,
    currency: {
      code: "TRY",
      nameJa: "\u30C8\u30EB\u30B3 \u30EA\u30E9",
      symbol: "\u20BA",
      jpyPerUnit: 3.1785,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 18.9861,
    gniPerCapitaLCU: 777926,
    consumptionPerCapitaLCU: 428040,
    incomeShareQuintiles: [
      0.055,
      0.097,
      0.142,
      0.209,
      0.497
    ],
    urbanShare: 0.893,
    places: [
      {
        nameJa: "\u30A4\u30B9\u30BF\u30F3\u30D6\u30FC\u30EB",
        urban: true,
        share: 0.268,
        incomeIndex: 1.22
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.6254,
        incomeIndex: 0.96
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.1066,
        incomeIndex: 0.66
      }
    ],
    lifeExpectancy: {
      male: 74.5,
      female: 79.9
    },
    under5MortalityPer1000: 13.8,
    tfr: 1.51,
    meanAgeFirstMarriage: {
      male: 27.9,
      female: 23.8
    },
    secondaryNetEnrollment: 0.872,
    tertiaryGrossEnrollment: 1,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.088,
    informalEmploymentShare: 0.26591,
    pensionCoverage: 0.859,
    pensionReplacementRate: 0.691,
    outOfPocketHealthShare: 0.19,
    effectiveTaxRateAvgWorker: 0.29284214,
    rentShareOfIncome: 0.121232578017,
    housePriceToIncome: 6.6,
    disasterRisk: 0.5,
    remittanceShareGdp: 7e-4,
    estimated: [
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "\u91D1\u984D\u306FWDI 2024\u5E74\u5024\u3092\u70BA\u66FF\u5909\u52D5\u3067\u73FE\u884C\u901A\u8CA8\u6C34\u6E96\u306B\u63DB\u7B97(x1.51); GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023; \u9AD8\u7B49\u6559\u80B2\u7DCF\u5C31\u5B66\u7387106%\u30921.0\u306B\u4E38\u3081",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/TUR/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "MLI",
    nameJa: "\u30DE\u30EA",
    major: false,
    incomeGroup: "LIC",
    births: 951500,
    currency: {
      code: "XOF",
      nameJa: "\u897F\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "F\u202FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 192.362,
    gniPerCapitaLCU: 644932,
    consumptionPerCapitaLCU: 481019,
    incomeShareQuintiles: [
      0.076,
      0.115,
      0.154,
      0.216,
      0.439
    ],
    urbanShare: 0.316,
    places: [
      {
        nameJa: "\u30D0\u30DE\u30B3",
        urban: true,
        share: 0.0948,
        incomeIndex: 2.19
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2213,
        incomeIndex: 1.27
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6839,
        incomeIndex: 0.75
      }
    ],
    lifeExpectancy: {
      male: 59,
      female: 61.9
    },
    under5MortalityPer1000: 76.2,
    tfr: 5.61,
    meanAgeFirstMarriage: {
      male: 25.8,
      female: 19.1
    },
    secondaryNetEnrollment: 0.299,
    tertiaryGrossEnrollment: 0.051,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.029,
    informalEmploymentShare: 0.92768,
    pensionCoverage: 0.056,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.472,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.0782525079937,
    housePriceToIncome: 17.5,
    disasterRisk: 0.4,
    remittanceShareGdp: 0.0399,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/MLI/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      homicide_rate: {
        source: "UNODC Research Data Portal",
        url: "https://dataunodc.un.org/",
        year: "2020"
      }
    }
  },
  {
    iso3: "UZB",
    nameJa: "\u30A6\u30BA\u30D9\u30AD\u30B9\u30BF\u30F3",
    major: false,
    incomeGroup: "LMC",
    births: 943500,
    currency: {
      code: "UZS",
      nameJa: "\u30A6\u30BA\u30D9\u30AD\u30B9\u30BF\u30F3 \u30B9\u30E0",
      symbol: "UZS",
      jpyPerUnit: 0.013196,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 3372.99,
    gniPerCapitaLCU: 42626100,
    consumptionPerCapitaLCU: 27533200,
    incomeShareQuintiles: [
      0.066,
      0.121,
      0.167,
      0.231,
      0.415
    ],
    urbanShare: 0.51,
    places: [
      {
        nameJa: "\u30BF\u30B7\u30B1\u30F3\u30C8",
        urban: true,
        share: 0.153,
        incomeIndex: 1.71
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.357,
        incomeIndex: 1.1
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.49,
        incomeIndex: 0.7
      }
    ],
    lifeExpectancy: {
      male: 69.5,
      female: 75.4
    },
    under5MortalityPer1000: 13.7,
    tfr: 3.5,
    meanAgeFirstMarriage: {
      male: 24,
      female: 22.5
    },
    secondaryNetEnrollment: 0.909,
    tertiaryGrossEnrollment: 0.565,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.044,
    informalEmploymentShare: 0.505,
    pensionCoverage: 1,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.641,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.126992127239,
    housePriceToIncome: 11.8,
    disasterRisk: 0.25,
    remittanceShareGdp: 0.1366,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2002"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2006"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/UZB/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "DZA",
    nameJa: "\u30A2\u30EB\u30B8\u30A7\u30EA\u30A2",
    major: false,
    incomeGroup: "UMC",
    births: 906e3,
    currency: {
      code: "DZD",
      nameJa: "\u30A2\u30EB\u30B8\u30A7\u30EA\u30A2 \u30C7\u30A3\u30CA\u30FC\u30EB",
      symbol: "DZD",
      jpyPerUnit: 1.172,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 42.2629,
    gniPerCapitaLCU: 756623,
    consumptionPerCapitaLCU: 318315,
    incomeShareQuintiles: [
      0.0939,
      0.1369,
      0.1748,
      0.2228,
      0.3716
    ],
    urbanShare: 0.753,
    places: [
      {
        nameJa: "\u30A2\u30EB\u30B8\u30A7",
        urban: true,
        share: 0.2258,
        incomeIndex: 1.29
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.527,
        incomeIndex: 1.02
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2472,
        incomeIndex: 0.69
      }
    ],
    lifeExpectancy: {
      male: 74.9,
      female: 77.7
    },
    under5MortalityPer1000: 22,
    tfr: 2.77,
    meanAgeFirstMarriage: {
      male: 32.4,
      female: 28.2
    },
    secondaryNetEnrollment: 0.819,
    tertiaryGrossEnrollment: 0.544,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.117,
    informalEmploymentShare: 0.422,
    pensionCoverage: 0.886,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.45,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.0479056582244,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 67e-4,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2011; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/DZA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      ipv_past12m_women: {
        source: "WHO Violence Against Women Prevalence Estimates 2018",
        url: "https://www.who.int/publications/i/item/9789240022256",
        year: "2018"
      }
    }
  },
  {
    iso3: "MMR",
    nameJa: "\u30DF\u30E3\u30F3\u30DE\u30FC",
    major: false,
    incomeGroup: "LMC",
    births: 903800,
    currency: {
      code: "MMK",
      nameJa: "\u30DF\u30E3\u30F3\u30DE\u30FC \u30C1\u30E3\u30C3\u30C8",
      symbol: "K",
      jpyPerUnit: 0.0751183,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 499.698,
    gniPerCapitaLCU: 2801270,
    consumptionPerCapitaLCU: 1680760,
    incomeShareQuintiles: [
      0.089,
      0.13,
      0.166,
      0.216,
      0.399
    ],
    urbanShare: 0.304,
    places: [
      {
        nameJa: "\u30E4\u30F3\u30B4\u30F3",
        urban: true,
        share: 0.0913,
        incomeIndex: 1.94
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2131,
        incomeIndex: 1.25
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6956,
        incomeIndex: 0.8
      }
    ],
    lifeExpectancy: {
      male: 63.8,
      female: 70.2
    },
    under5MortalityPer1000: 38.1,
    tfr: 2.12,
    meanAgeFirstMarriage: {
      male: 25.6,
      female: 23.4
    },
    secondaryNetEnrollment: 0.641,
    tertiaryGrossEnrollment: 0.204,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.029,
    informalEmploymentShare: 0.8071,
    pensionCoverage: 9e-3,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.711,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.3,
    housePriceToIncome: 15,
    disasterRisk: 0.7,
    remittanceShareGdp: 0.034,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "rentShareOfIncome",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB\u63A8\u5B9A/PPP2021(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2017",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2016"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2020"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      }
    }
  },
  {
    iso3: "GHA",
    nameJa: "\u30AC\u30FC\u30CA",
    major: false,
    incomeGroup: "LMC",
    births: 889e3,
    currency: {
      code: "GHS",
      nameJa: "\u30AC\u30FC\u30CA \u30BB\u30C7\u30A3",
      symbol: "GH\u20B5",
      jpyPerUnit: 13.5664,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 4.72101,
    gniPerCapitaLCU: 32178.9,
    consumptionPerCapitaLCU: 28507.4,
    incomeShareQuintiles: [
      0.047,
      0.096,
      0.148,
      0.223,
      0.486
    ],
    urbanShare: 0.584,
    places: [
      {
        nameJa: "\u30A2\u30AF\u30E9",
        urban: true,
        share: 0.1751,
        incomeIndex: 1.64
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4086,
        incomeIndex: 1.06
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4163,
        incomeIndex: 0.67
      }
    ],
    lifeExpectancy: {
      male: 63.1,
      female: 67.9
    },
    under5MortalityPer1000: 37.2,
    tfr: 3.4,
    meanAgeFirstMarriage: {
      male: 27.8,
      female: 23.7
    },
    secondaryNetEnrollment: 0.572,
    tertiaryGrossEnrollment: 0.213,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.028,
    informalEmploymentShare: 0.89952,
    pensionCoverage: 0.157,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.267,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.0481769981573,
    housePriceToIncome: 49,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0363,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2016",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/GHA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "TCD",
    nameJa: "\u30C1\u30E3\u30C9",
    major: false,
    incomeGroup: "LIC",
    births: 819100,
    currency: {
      code: "XAF",
      nameJa: "\u4E2D\u592E\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 238.085,
    gniPerCapitaLCU: 572751,
    consumptionPerCapitaLCU: 355292,
    incomeShareQuintiles: [
      0.0689,
      0.1099,
      0.1588,
      0.2138,
      0.4486
    ],
    urbanShare: 0.269,
    places: [
      {
        nameJa: "\u30F3\u30B8\u30E3\u30E1\u30CA",
        urban: true,
        share: 0.0808,
        incomeIndex: 2.27
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1885,
        incomeIndex: 1.32
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.7307,
        incomeIndex: 0.78
      }
    ],
    lifeExpectancy: {
      male: 53.2,
      female: 57
    },
    under5MortalityPer1000: 100.6,
    tfr: 6.12,
    meanAgeFirstMarriage: {
      male: 24.7,
      female: 18.8
    },
    secondaryNetEnrollment: 0.189,
    tertiaryGrossEnrollment: 0.044,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.011,
    informalEmploymentShare: 0.9757,
    pensionCoverage: 0.058,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.517,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.134305751582,
    housePriceToIncome: 17.5,
    disasterRisk: 0.45,
    remittanceShareGdp: 0.0395,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "remittanceShareGdp",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/TCD/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      homicide_rate: {
        source: "WHO Global Health Estimates",
        url: "https://www.who.int/data/gho/data/indicators/indicator-details/GHO/gho-ghe-homicide-rates-per-100-000-population",
        year: "2021"
      }
    }
  },
  {
    iso3: "SOM",
    nameJa: "\u30BD\u30DE\u30EA\u30A2",
    major: false,
    incomeGroup: "LIC",
    births: 788800,
    currency: {
      code: "SOS",
      nameJa: "\u30BD\u30DE\u30EA\u30A2 \u30B7\u30EA\u30F3\u30B0",
      symbol: "SOS",
      jpyPerUnit: 0.276517,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 188.235,
    gniPerCapitaLCU: 342246,
    consumptionPerCapitaLCU: 205347,
    incomeShareQuintiles: [
      0.072,
      0.1119,
      0.1529,
      0.2139,
      0.4493
    ],
    urbanShare: 0.546,
    places: [
      {
        nameJa: "\u30E2\u30AC\u30C7\u30A3\u30B7\u30E5",
        urban: true,
        share: 0.1639,
        incomeIndex: 1.85
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3823,
        incomeIndex: 1.07
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4538,
        incomeIndex: 0.63
      }
    ],
    lifeExpectancy: {
      male: 56.4,
      female: 61.4
    },
    under5MortalityPer1000: 104.3,
    tfr: 6.13,
    meanAgeFirstMarriage: {
      male: 26.5,
      female: 20.4
    },
    secondaryNetEnrollment: 0.31,
    tertiaryGrossEnrollment: 0.064,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.189,
    informalEmploymentShare: 0.81935,
    pensionCoverage: 0,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.308,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.0739467837508,
    housePriceToIncome: 17.5,
    disasterRisk: 0.55,
    remittanceShareGdp: 0.0395,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "gniPerCapitaLCU",
      "housePriceToIncome",
      "incomeShareQuintiles",
      "pensionReplacementRate",
      "places",
      "pppPerIntlDollar",
      "remittanceShareGdp",
      "secondaryNetEnrollment",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "GNI\u306FWDI\u6B20\u640D\u306E\u305F\u3081\u63A8\u5B9A(\u7C73\u30C9\u30EB\u63DB\u7B97); GNI2025/\u6D88\u8CBB\u63A8\u5B9A/PPP\u63A8\u5B9A",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2023"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2019"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "1982"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2006"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/SOM/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      homicide_rate: {
        source: "UNODC Research Data Portal",
        url: "https://dataunodc.un.org/dp-intentional-homicide-victims",
        year: "2015"
      },
      ipv_past12m_women: {
        source: "WHO Violence Against Women Prevalence Estimates 2018",
        url: "https://www.who.int/publications/i/item/9789240022256",
        year: "2018"
      }
    }
  },
  {
    iso3: "JPN",
    nameJa: "\u65E5\u672C",
    major: true,
    incomeGroup: "HIC",
    births: 747100,
    currency: {
      code: "JPY",
      nameJa: "\u65E5\u672C\u5186",
      symbol: "\uFFE5",
      jpyPerUnit: 1,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 99.3848,
    gniPerCapitaLCU: 5427120,
    consumptionPerCapitaLCU: 2714900,
    incomeShareQuintiles: [
      0.068,
      0.13,
      0.176,
      0.232,
      0.394
    ],
    urbanShare: 0.922,
    places: [
      {
        nameJa: "\u6771\u4EAC",
        urban: true,
        share: 0.14,
        incomeIndex: 1.3
      },
      {
        nameJa: "\u5927\u962A",
        urban: true,
        share: 0.08,
        incomeIndex: 1
      },
      {
        nameJa: "\u540D\u53E4\u5C4B",
        urban: true,
        share: 0.07,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u798F\u5CA1",
        urban: true,
        share: 0.05,
        incomeIndex: 0.95
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u5730\u65B9\u90FD\u5E02",
        urban: true,
        share: 0.43,
        incomeIndex: 0.97
      },
      {
        nameJa: "\u5730\u65B9\u306E\u753A",
        urban: false,
        share: 0.23,
        incomeIndex: 0.85
      }
    ],
    lifeExpectancy: {
      male: 81.1,
      female: 87.1
    },
    under5MortalityPer1000: 2.4,
    tfr: 1.2,
    meanAgeFirstMarriage: {
      male: 30.5,
      female: 29.2
    },
    secondaryNetEnrollment: 0.931,
    tertiaryGrossEnrollment: 0.645,
    tertiaryAnnualCostShareOfGni: 0.15,
    unemploymentRate: 0.025,
    informalEmploymentShare: 0.187,
    pensionCoverage: 1,
    pensionReplacementRate: 0.365,
    outOfPocketHealthShare: 0.122,
    effectiveTaxRateAvgWorker: 0.22646641,
    rentShareOfIncome: 0.204917397418,
    housePriceToIncome: 11.7,
    disasterRisk: 0.5,
    remittanceShareGdp: 11e-4,
    estimated: [
      "places",
      "secondaryNetEnrollment",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2020",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2020"
      },
      informal_employment_share: {
        source: "ILO Women and Men in the Informal Economy: A Statistical Picture",
        url: "https://www.ilo.org/sites/default/files/2024-04/Women_men_informal_economy_statistical_picture.pdf",
        year: "2010"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/JPN/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "BFA",
    nameJa: "\u30D6\u30EB\u30AD\u30CA\u30D5\u30A1\u30BD",
    major: false,
    incomeGroup: "LIC",
    births: 728600,
    currency: {
      code: "XOF",
      nameJa: "\u897F\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "F\u202FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 199.487,
    gniPerCapitaLCU: 560751,
    consumptionPerCapitaLCU: 370316,
    incomeShareQuintiles: [
      0.073,
      0.112,
      0.151,
      0.211,
      0.453
    ],
    urbanShare: 0.283,
    places: [
      {
        nameJa: "\u30EF\u30AC\u30C9\u30A5\u30B0\u30FC",
        urban: true,
        share: 0.085,
        incomeIndex: 2.25
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1983,
        incomeIndex: 1.3
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.7167,
        incomeIndex: 0.77
      }
    ],
    lifeExpectancy: {
      male: 58.9,
      female: 63.2
    },
    under5MortalityPer1000: 77.4,
    tfr: 4.19,
    meanAgeFirstMarriage: {
      male: 26.4,
      female: 20
    },
    secondaryNetEnrollment: 0.31,
    tertiaryGrossEnrollment: 0.1,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.034,
    informalEmploymentShare: 0.95093,
    pensionCoverage: 0.067,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.438,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.110038558298,
    housePriceToIncome: 17.5,
    disasterRisk: 0.4,
    remittanceShareGdp: 0.0257,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2023"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/BFA/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "COL",
    nameJa: "\u30B3\u30ED\u30F3\u30D3\u30A2",
    major: false,
    incomeGroup: "UMC",
    births: 705e3,
    currency: {
      code: "COP",
      nameJa: "\u30B3\u30ED\u30F3\u30D3\u30A2 \u30DA\u30BD",
      symbol: "$",
      jpyPerUnit: 0.0494212,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1542.19,
    gniPerCapitaLCU: 31904400,
    consumptionPerCapitaLCU: 23600800,
    incomeShareQuintiles: [
      0.032,
      0.071,
      0.115,
      0.193,
      0.589
    ],
    urbanShare: 0.785,
    places: [
      {
        nameJa: "\u30DC\u30B4\u30BF",
        urban: true,
        share: 0.2356,
        incomeIndex: 1.28
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5496,
        incomeIndex: 1
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2148,
        incomeIndex: 0.68
      }
    ],
    lifeExpectancy: {
      male: 75,
      female: 80.5
    },
    under5MortalityPer1000: 11.9,
    tfr: 1.65,
    meanAgeFirstMarriage: {
      male: 26.2,
      female: 23.4
    },
    secondaryNetEnrollment: 0.775,
    tertiaryGrossEnrollment: 0.593,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.096,
    informalEmploymentShare: 0.56012,
    pensionCoverage: 0.596,
    pensionReplacementRate: 0.748,
    outOfPocketHealthShare: 0.146,
    effectiveTaxRateAvgWorker: 0,
    rentShareOfIncome: 0.159390199372,
    housePriceToIncome: 14.9,
    disasterRisk: 0.65,
    remittanceShareGdp: 0.0282,
    estimated: [
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2025"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/COL/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "DEU",
    nameJa: "\u30C9\u30A4\u30C4",
    major: true,
    incomeGroup: "HIC",
    births: 691300,
    currency: {
      code: "EUR",
      nameJa: "\u30E6\u30FC\u30ED",
      symbol: "\u20AC",
      jpyPerUnit: 177.334,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 0.70155,
    gniPerCapitaLCU: 53619.3,
    consumptionPerCapitaLCU: 27335.4,
    incomeShareQuintiles: [
      0.0691,
      0.1281,
      0.1702,
      0.2232,
      0.4094
    ],
    urbanShare: 0.82,
    places: [
      {
        nameJa: "\u30D9\u30EB\u30EA\u30F3",
        urban: true,
        share: 0.0428,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u30CF\u30F3\u30D6\u30EB\u30AF",
        urban: true,
        share: 0.0213,
        incomeIndex: 1.16
      },
      {
        nameJa: "\u30DF\u30E5\u30F3\u30D8\u30F3",
        urban: true,
        share: 0.019,
        incomeIndex: 1.31
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.7369,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u5730\u65B9\u306E\u753A\u6751",
        urban: false,
        share: 0.18,
        incomeIndex: 0.93
      }
    ],
    lifeExpectancy: {
      male: 78.7,
      female: 83.5
    },
    under5MortalityPer1000: 3.7,
    tfr: 1.39,
    meanAgeFirstMarriage: {
      male: 33.9,
      female: 31.7
    },
    secondaryNetEnrollment: 0.853,
    tertiaryGrossEnrollment: 0.767,
    tertiaryAnnualCostShareOfGni: 0.01,
    unemploymentRate: 0.034,
    informalEmploymentShare: 0.03949,
    pensionCoverage: 1,
    pensionReplacementRate: 0.421,
    outOfPocketHealthShare: 0.111,
    effectiveTaxRateAvgWorker: 0.38677081,
    rentShareOfIncome: 0.18951185532,
    housePriceToIncome: 7.8,
    disasterRisk: 0.15,
    remittanceShareGdp: 47e-4,
    estimated: [
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/DEU/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Berlin: 0.04275299139391651,
      Hamburg: 0.021347991218853394,
      "M\xFCnchen (Munich)": 0.018997703257946013,
      "K\xF6ln (Cologne)": 0.013771364804920224,
      "Frankfurt am Main": 0.00959811575727072
    }
  },
  {
    iso3: "GBR",
    nameJa: "\u82F1\u56FD",
    major: true,
    incomeGroup: "HIC",
    births: 686800,
    currency: {
      code: "GBP",
      nameJa: "\u82F1\u56FD\u30DD\u30F3\u30C9",
      symbol: "\xA3",
      jpyPerUnit: 211.319,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 0.68274,
    gniPerCapitaLCU: 41325.1,
    consumptionPerCapitaLCU: 25359.9,
    incomeShareQuintiles: [
      0.076,
      0.125,
      0.17,
      0.229,
      0.4
    ],
    urbanShare: 0.832,
    places: [
      {
        nameJa: "\u30ED\u30F3\u30C9\u30F3",
        urban: true,
        share: 0.1411,
        incomeIndex: 1.33
      },
      {
        nameJa: "\u30DE\u30F3\u30C1\u30A7\u30B9\u30BF\u30FC",
        urban: true,
        share: 0.0406,
        incomeIndex: 0.88
      },
      {
        nameJa: "\u30D0\u30FC\u30DF\u30F3\u30AC\u30E0",
        urban: true,
        share: 0.0388,
        incomeIndex: 0.87
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.6115,
        incomeIndex: 0.93
      },
      {
        nameJa: "\u5730\u65B9\u306E\u753A\u6751",
        urban: false,
        share: 0.168,
        incomeIndex: 0.93
      }
    ],
    lifeExpectancy: {
      male: 79.4,
      female: 83.2
    },
    under5MortalityPer1000: 4.6,
    tfr: 1.56,
    meanAgeFirstMarriage: {
      male: 28.7,
      female: 27
    },
    secondaryNetEnrollment: 0.971,
    tertiaryGrossEnrollment: 0.804,
    tertiaryAnnualCostShareOfGni: 0.2307,
    unemploymentRate: 0.044,
    informalEmploymentShare: 0.1981,
    pensionCoverage: 1,
    pensionReplacementRate: 0.447,
    outOfPocketHealthShare: 0.146,
    effectiveTaxRateAvgWorker: 0.23141636,
    rentShareOfIncome: 0.2155415276,
    housePriceToIncome: 7.7,
    disasterRisk: 0.12,
    remittanceShareGdp: 13e-4,
    estimated: [
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2023"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2018"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/GBR/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      tuition_public_annual: {
        source: "UK Department for Education, Changes to tuition fees: 2025 to 2026 academic year",
        url: "https://www.gov.uk/government/publications/tuition-fees-and-student-support-2025-to-2026-academic-year/changes-to-tuition-fees-2025-to-2026-academic-year",
        year: "2025"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      }
    },
    tuition: {
      public: 9535
    },
    cityPopulationShare: {
      London: 0.14108727621628678,
      Manchester: 0.04061093180789728,
      "Birmingham (West Midlands)": 0.03877624733361213,
      "West Yorkshire": 0.028050078708290845,
      Glasgow: 0.024644554614530103
    }
  },
  {
    iso3: "ZMB",
    nameJa: "\u30B6\u30F3\u30D3\u30A2",
    major: false,
    incomeGroup: "LMC",
    births: 685600,
    currency: {
      code: "ZMW",
      nameJa: "\u30B6\u30F3\u30D3\u30A2 \u30AF\u30EF\u30C1\u30E3",
      symbol: "ZK",
      jpyPerUnit: 7.86709,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 7.56648,
    gniPerCapitaLCU: 27686.3,
    consumptionPerCapitaLCU: 14919.6,
    incomeShareQuintiles: [
      0.039,
      0.073,
      0.119,
      0.205,
      0.564
    ],
    urbanShare: 0.455,
    places: [
      {
        nameJa: "\u30EB\u30B5\u30AB",
        urban: true,
        share: 0.1364,
        incomeIndex: 1.76
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3183,
        incomeIndex: 1.14
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.5453,
        incomeIndex: 0.73
      }
    ],
    lifeExpectancy: {
      male: 63.9,
      female: 68.7
    },
    under5MortalityPer1000: 49.1,
    tfr: 4.1,
    meanAgeFirstMarriage: {
      male: 25.9,
      female: 22
    },
    secondaryNetEnrollment: 0.553,
    tertiaryGrossEnrollment: 0.04,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.059,
    informalEmploymentShare: 0.82732,
    pensionCoverage: 0.258,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.103,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.162064885067,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0132,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ZMB/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "FRA",
    nameJa: "\u30D5\u30E9\u30F3\u30B9",
    major: true,
    incomeGroup: "HIC",
    births: 676900,
    currency: {
      code: "EUR",
      nameJa: "\u30E6\u30FC\u30ED",
      symbol: "\u20AC",
      jpyPerUnit: 177.334,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 0.71693,
    gniPerCapitaLCU: 43412,
    consumptionPerCapitaLCU: 23271.4,
    incomeShareQuintiles: [
      0.077,
      0.129,
      0.172,
      0.225,
      0.397
    ],
    urbanShare: 0.788,
    places: [
      {
        nameJa: "\u30D1\u30EA\u90FD\u5E02\u570F",
        urban: true,
        share: 0.1701,
        incomeIndex: 1.29
      },
      {
        nameJa: "\u30EA\u30E8\u30F3",
        urban: true,
        share: 0.0268,
        incomeIndex: 1.04
      },
      {
        nameJa: "\u30DE\u30EB\u30BB\u30A4\u30E6",
        urban: true,
        share: 0.0247,
        incomeIndex: 0.89
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5664,
        incomeIndex: 0.94
      },
      {
        nameJa: "\u5730\u65B9\u306E\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.212,
        incomeIndex: 0.87
      }
    ],
    lifeExpectancy: {
      male: 80.1,
      female: 85.7
    },
    under5MortalityPer1000: 4.3,
    tfr: 1.66,
    meanAgeFirstMarriage: {
      male: 33.7,
      female: 32
    },
    secondaryNetEnrollment: 0.947,
    tertiaryGrossEnrollment: 0.715,
    tertiaryAnnualCostShareOfGni: 0.03,
    unemploymentRate: 0.074,
    informalEmploymentShare: 0.03394,
    pensionCoverage: 1,
    pensionReplacementRate: 0.566,
    outOfPocketHealthShare: 0.093,
    effectiveTaxRateAvgWorker: 0.27979399,
    rentShareOfIncome: 0.213309002148,
    housePriceToIncome: 8.3,
    disasterRisk: 0.15,
    remittanceShareGdp: 0.0129,
    estimated: [
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/FRA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Paris: 0.1701151683444675,
      Lyon: 0.026794708487872552,
      "Marseille-Aix-en-Provence": 0.024656500267680823,
      Lille: 0.01636546371240113,
      Toulouse: 0.01619449101191686
    }
  },
  {
    iso3: "MWI",
    nameJa: "\u30DE\u30E9\u30A6\u30A4",
    major: false,
    incomeGroup: "LIC",
    births: 662300,
    currency: {
      code: "MWK",
      nameJa: "\u30DE\u30E9\u30A6\u30A3 \u30AF\u30EF\u30C1\u30E3",
      symbol: "MWK",
      jpyPerUnit: 0.0909938,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 501.744,
    gniPerCapitaLCU: 893122,
    consumptionPerCapitaLCU: 774723,
    incomeShareQuintiles: [
      0.0699,
      0.1099,
      0.1489,
      0.2098,
      0.4615
    ],
    urbanShare: 0.173,
    places: [
      {
        nameJa: "\u30EA\u30ED\u30F3\u30B0\u30A6\u30A7",
        urban: true,
        share: 0.0518,
        incomeIndex: 2.47
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1209,
        incomeIndex: 1.43
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.8273,
        incomeIndex: 0.85
      }
    ],
    lifeExpectancy: {
      male: 64.1,
      female: 70.6
    },
    under5MortalityPer1000: 49.6,
    tfr: 3.65,
    meanAgeFirstMarriage: {
      male: 24.5,
      female: 20.4
    },
    secondaryNetEnrollment: 0.342,
    tertiaryGrossEnrollment: 0.027,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.051,
    informalEmploymentShare: 0.92554,
    pensionCoverage: 0.089,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.12,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.283503615712,
    housePriceToIncome: 17.5,
    disasterRisk: 0.45,
    remittanceShareGdp: 0.0198,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2019",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/MWI/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "MAR",
    nameJa: "\u30E2\u30ED\u30C3\u30B3",
    major: false,
    incomeGroup: "LMC",
    births: 629800,
    currency: {
      code: "MAD",
      nameJa: "\u30E2\u30ED\u30C3\u30B3 \u30C7\u30A3\u30EB\u30CF\u30E0",
      symbol: "MAD",
      jpyPerUnit: 16.1158,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 4.03814,
    gniPerCapitaLCU: 40678.8,
    consumptionPerCapitaLCU: 25227.6,
    incomeShareQuintiles: [
      0.067,
      0.107,
      0.147,
      0.209,
      0.47
    ],
    urbanShare: 0.628,
    places: [
      {
        nameJa: "\u30AB\u30B5\u30D6\u30E9\u30F3\u30AB",
        urban: true,
        share: 0.1884,
        incomeIndex: 1.6
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4396,
        incomeIndex: 1.03
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.372,
        incomeIndex: 0.66
      }
    ],
    lifeExpectancy: {
      male: 73.2,
      female: 77.6
    },
    under5MortalityPer1000: 16.3,
    tfr: 2.23,
    meanAgeFirstMarriage: {
      male: 31.3,
      female: 24.4
    },
    secondaryNetEnrollment: 0.645,
    tertiaryGrossEnrollment: 0.482,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.091,
    informalEmploymentShare: 0.799,
    pensionCoverage: 0.234,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.373,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.167432504464,
    housePriceToIncome: 13.6,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0779,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2013",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=MAR&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2019"
      },
      informal_employment_share: {
        source: "ILO Women and Men in the Informal Economy: A Statistical Picture",
        url: "https://www.ilo.org/sites/default/files/2024-04/Women_men_informal_economy_statistical_picture.pdf",
        year: "2010"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/MAR/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "THA",
    nameJa: "\u30BF\u30A4",
    major: false,
    incomeGroup: "UMC",
    births: 591200,
    currency: {
      code: "THB",
      nameJa: "\u30BF\u30A4 \u30D0\u30FC\u30C4",
      symbol: "\u0E3F",
      jpyPerUnit: 4.68623,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 10.907,
    gniPerCapitaLCU: 252380,
    consumptionPerCapitaLCU: 150774,
    incomeShareQuintiles: [
      0.079,
      0.12,
      0.162,
      0.224,
      0.415
    ],
    urbanShare: 0.619,
    places: [
      {
        nameJa: "\u30D0\u30F3\u30B3\u30AF",
        urban: true,
        share: 0.1856,
        incomeIndex: 1.37
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4331,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3813,
        incomeIndex: 0.73
      }
    ],
    lifeExpectancy: {
      male: 72.2,
      female: 80.9
    },
    under5MortalityPer1000: 9.2,
    tfr: 1.21,
    meanAgeFirstMarriage: {
      male: 28.5,
      female: 22.5
    },
    secondaryNetEnrollment: 0.773,
    tertiaryGrossEnrollment: 0.45,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 8e-3,
    informalEmploymentShare: 0.63168,
    pensionCoverage: 0.826,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.099,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.0884688030126,
    housePriceToIncome: 23.8,
    disasterRisk: 0.4,
    remittanceShareGdp: 0.0179,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=THA&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2020"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/THA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "NPL",
    nameJa: "\u30CD\u30D1\u30FC\u30EB",
    major: false,
    incomeGroup: "LMC",
    births: 574300,
    currency: {
      code: "NPR",
      nameJa: "\u30CD\u30D1\u30FC\u30EB \u30EB\u30D4\u30FC",
      symbol: "Rs",
      jpyPerUnit: 1.04389,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 35.2857,
    gniPerCapitaLCU: 197440,
    consumptionPerCapitaLCU: 166238,
    incomeShareQuintiles: [
      0.087,
      0.131,
      0.17,
      0.222,
      0.39
    ],
    urbanShare: 0.668,
    places: [
      {
        nameJa: "\u30AB\u30C8\u30DE\u30F3\u30BA",
        urban: true,
        share: 0.2003,
        incomeIndex: 1.56
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4674,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3323,
        incomeIndex: 0.64
      }
    ],
    lifeExpectancy: {
      male: 68.8,
      female: 71.8
    },
    under5MortalityPer1000: 26.1,
    tfr: 1.98,
    meanAgeFirstMarriage: {
      male: 23.6,
      female: 20.2
    },
    secondaryNetEnrollment: 0.619,
    tertiaryGrossEnrollment: 0.213,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.105,
    informalEmploymentShare: 0.78276,
    pensionCoverage: 0.772,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.594,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.128858580852,
    housePriceToIncome: 39.5,
    disasterRisk: 0.55,
    remittanceShareGdp: 0.2599,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/NPL/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "SAU",
    nameJa: "\u30B5\u30A6\u30B8\u30A2\u30E9\u30D3\u30A2",
    major: false,
    incomeGroup: "HIC",
    births: 553200,
    currency: {
      code: "SAR",
      nameJa: "\u30B5\u30A6\u30B8 \u30EA\u30E4\u30EB",
      symbol: "SAR",
      jpyPerUnit: 42.0608,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1.88288,
    gniPerCapitaLCU: 134154,
    consumptionPerCapitaLCU: 59424.6,
    incomeShareQuintiles: [
      0.0762,
      0.1273,
      0.1703,
      0.2255,
      0.4007
    ],
    urbanShare: 0.845,
    places: [
      {
        nameJa: "\u30EA\u30E4\u30C9",
        urban: true,
        share: 0.2534,
        incomeIndex: 1.1
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5912,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.1554,
        incomeIndex: 0.82
      }
    ],
    lifeExpectancy: {
      male: 77.1,
      female: 81.2
    },
    under5MortalityPer1000: 6.2,
    tfr: 2.28,
    meanAgeFirstMarriage: {
      male: 30,
      female: 26.6
    },
    secondaryNetEnrollment: 0.964,
    tertiaryGrossEnrollment: 0.839,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.035,
    informalEmploymentShare: 0.164,
    pensionCoverage: 0.245,
    pensionReplacementRate: 0.702,
    outOfPocketHealthShare: 0.141,
    effectiveTaxRateAvgWorker: 0.24,
    rentShareOfIncome: 0.190948355434,
    housePriceToIncome: 4.7,
    disasterRisk: 0.15,
    remittanceShareGdp: 3e-4,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "incomeShareQuintiles",
      "informalEmploymentShare",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP)",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/SAU/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "PER",
    nameJa: "\u30DA\u30EB\u30FC",
    major: false,
    incomeGroup: "UMC",
    births: 539600,
    currency: {
      code: "PEN",
      nameJa: "\u30DA\u30EB\u30FC \u30BD\u30EB",
      symbol: "PEN",
      jpyPerUnit: 45.8948,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1.94918,
    gniPerCapitaLCU: 30149,
    consumptionPerCapitaLCU: 19465,
    incomeShareQuintiles: [
      0.0561,
      0.1061,
      0.1542,
      0.2212,
      0.4624
    ],
    urbanShare: 0.852,
    places: [
      {
        nameJa: "\u30EA\u30DE",
        urban: true,
        share: 0.2556,
        incomeIndex: 1.24
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5963,
        incomeIndex: 0.98
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.1481,
        incomeIndex: 0.67
      }
    ],
    lifeExpectancy: {
      male: 75.4,
      female: 80.1
    },
    under5MortalityPer1000: 13.3,
    tfr: 1.98,
    meanAgeFirstMarriage: {
      male: 27.5,
      female: 23.3
    },
    secondaryNetEnrollment: 0.893,
    tertiaryGrossEnrollment: 0.712,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.052,
    informalEmploymentShare: 0.70463,
    pensionCoverage: 0.537,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.27,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.0916903341207,
    housePriceToIncome: 14.7,
    disasterRisk: 0.55,
    remittanceShareGdp: 0.0169,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2024"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2012"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/PER/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "SEN",
    nameJa: "\u30BB\u30CD\u30AC\u30EB",
    major: false,
    incomeGroup: "LMC",
    births: 531900,
    currency: {
      code: "XOF",
      nameJa: "\u897F\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "F\u202FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 229.281,
    gniPerCapitaLCU: 994992,
    consumptionPerCapitaLCU: 697333,
    incomeShareQuintiles: [
      0.0731,
      0.1151,
      0.1562,
      0.2162,
      0.4394
    ],
    urbanShare: 0.552,
    places: [
      {
        nameJa: "\u30C0\u30AB\u30FC\u30EB",
        urban: true,
        share: 0.1657,
        incomeIndex: 1.67
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3867,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4476,
        incomeIndex: 0.69
      }
    ],
    lifeExpectancy: {
      male: 66.8,
      female: 70.8
    },
    under5MortalityPer1000: 38.2,
    tfr: 3.82,
    meanAgeFirstMarriage: {
      male: 30.6,
      female: 22.5
    },
    secondaryNetEnrollment: 0.377,
    tertiaryGrossEnrollment: 0.153,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.028,
    informalEmploymentShare: 0.90546,
    pensionCoverage: 0.253,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.443,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.122743291853,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.1064,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/SEN/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "SYR",
    nameJa: "\u30B7\u30EA\u30A2",
    major: false,
    incomeGroup: "LIC",
    births: 521600,
    currency: {
      code: "SYP",
      nameJa: "\u30B7\u30EA\u30A2 \u30DD\u30F3\u30C9",
      symbol: "\xA3",
      jpyPerUnit: 0.0121214,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 5251.18,
    gniPerCapitaLCU: 19883e3,
    consumptionPerCapitaLCU: 23512300,
    incomeShareQuintiles: [
      0.0929,
      0.1409,
      0.1788,
      0.2368,
      0.3506
    ],
    urbanShare: 0.721,
    places: [
      {
        nameJa: "\u30C0\u30DE\u30B9\u30AB\u30B9",
        urban: true,
        share: 0.2162,
        incomeIndex: 1.66
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5045,
        incomeIndex: 0.96
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2793,
        incomeIndex: 0.57
      }
    ],
    lifeExpectancy: {
      male: 69.8,
      female: 74.4
    },
    under5MortalityPer1000: 20.1,
    tfr: 2.71,
    meanAgeFirstMarriage: {
      male: 29.3,
      female: 25.4
    },
    secondaryNetEnrollment: 0.485,
    tertiaryGrossEnrollment: 0.438,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.134,
    informalEmploymentShare: 0.701,
    pensionCoverage: 0.167,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.724,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.199466652816,
    housePriceToIncome: 17.5,
    disasterRisk: 0.35,
    remittanceShareGdp: 0.0264,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "\u91D1\u984D\u306FWDI 2022\u5E74\u5024\u3092\u70BA\u66FF\u5909\u52D5\u3067\u73FE\u884C\u901A\u8CA8\u6C34\u6E96\u306B\u63DB\u7B97(x5.19); GNI2022/\u6D88\u8CBB2022/PPP2021(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2006"
      },
      informal_employment_share: {
        source: "ILO Women and Men in the Informal Economy: A Statistical Picture",
        url: "https://www.ilo.org/sites/default/files/2024-04/Women_men_informal_economy_statistical_picture.pdf",
        year: "2003"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2001"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2006"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/SYR/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "ARG",
    nameJa: "\u30A2\u30EB\u30BC\u30F3\u30C1\u30F3",
    major: false,
    incomeGroup: "UMC",
    births: 503800,
    currency: {
      code: "ARS",
      nameJa: "\u30A2\u30EB\u30BC\u30F3\u30C1\u30F3 \u30DA\u30BD",
      symbol: "$",
      jpyPerUnit: 0.103379,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 690.438,
    gniPerCapitaLCU: 20874300,
    consumptionPerCapitaLCU: 14213300,
    incomeShareQuintiles: [
      0.051,
      0.097,
      0.148,
      0.225,
      0.479
    ],
    urbanShare: 0.923,
    places: [
      {
        nameJa: "\u30D6\u30A8\u30CE\u30B9\u30A2\u30A4\u30EC\u30B9",
        urban: true,
        share: 0.2768,
        incomeIndex: 1.21
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.6459,
        incomeIndex: 0.95
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.0773,
        incomeIndex: 0.65
      }
    ],
    lifeExpectancy: {
      male: 74.8,
      female: 79.9
    },
    under5MortalityPer1000: 9.7,
    tfr: 1.5,
    meanAgeFirstMarriage: {
      male: 26.6,
      female: 24.6
    },
    secondaryNetEnrollment: 0.908,
    tertiaryGrossEnrollment: 1,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.072,
    informalEmploymentShare: 0.52818,
    pensionCoverage: 0.908,
    pensionReplacementRate: 0.687,
    outOfPocketHealthShare: 0.245,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.0655947074984,
    housePriceToIncome: 12,
    disasterRisk: 0.25,
    remittanceShareGdp: 17e-4,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "\u91D1\u984D\u306FWDI 2024\u5E74\u5024\u3092\u70BA\u66FF\u5909\u52D5\u3067\u73FE\u884C\u901A\u8CA8\u6C34\u6E96\u306B\u63DB\u7B97(x1.67); GNI2024/\u6D88\u8CBB2024/PPP2021(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024; \u9AD8\u7B49\u6559\u80B2\u7DCF\u5C31\u5B66\u7387108%\u30921.0\u306B\u4E38\u3081",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=ARG&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ARG/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "ZWE",
    nameJa: "\u30B8\u30F3\u30D0\u30D6\u30A8",
    major: false,
    incomeGroup: "LMC",
    births: 496900,
    currency: {
      code: "ZWG",
      nameJa: "\u30B8\u30F3\u30D0\u30D6\u30A8 \u30B4\u30FC\u30EB\u30C9",
      symbol: "ZWG",
      jpyPerUnit: 5.92625,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 9.58145,
    gniPerCapitaLCU: 55891.8,
    consumptionPerCapitaLCU: 33535.1,
    incomeShareQuintiles: [
      0.048,
      0.079,
      0.12,
      0.192,
      0.561
    ],
    urbanShare: 0.399,
    places: [
      {
        nameJa: "\u30CF\u30E9\u30EC",
        urban: true,
        share: 0.1197,
        incomeIndex: 1.83
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2793,
        incomeIndex: 1.18
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.601,
        incomeIndex: 0.75
      }
    ],
    lifeExpectancy: {
      male: 60.2,
      female: 65
    },
    under5MortalityPer1000: 64.2,
    tfr: 3.72,
    meanAgeFirstMarriage: {
      male: 26,
      female: 21.1
    },
    secondaryNetEnrollment: 0.487,
    tertiaryGrossEnrollment: 0.077,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.094,
    informalEmploymentShare: 0.84306,
    pensionCoverage: 0.196,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.106,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.298634170989,
    housePriceToIncome: 9.1,
    disasterRisk: 0.35,
    remittanceShareGdp: 0.0845,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "gniPerCapitaLCU",
      "pensionReplacementRate",
      "places",
      "pppPerIntlDollar",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI\u306FWDI\u6B20\u640D\u306E\u305F\u3081\u63A8\u5B9A(\u7C73\u30C9\u30EB\u63DB\u7B97); GNI2025/\u6D88\u8CBB\u63A8\u5B9A/PPP\u63A8\u5B9A; \u4E94\u5206\u4F4D2019",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ZWE/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "GIN",
    nameJa: "\u30AE\u30CB\u30A2",
    major: false,
    incomeGroup: "LMC",
    births: 487600,
    currency: {
      code: "GNF",
      nameJa: "\u30AE\u30CB\u30A2 \u30D5\u30E9\u30F3",
      symbol: "FG",
      jpyPerUnit: 0.0178186,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 3583.77,
    gniPerCapitaLCU: 13166300,
    consumptionPerCapitaLCU: 10037900,
    incomeShareQuintiles: [
      0.085,
      0.131,
      0.173,
      0.229,
      0.382
    ],
    urbanShare: 0.381,
    places: [
      {
        nameJa: "\u30B3\u30CA\u30AF\u30EA",
        urban: true,
        share: 0.1142,
        incomeIndex: 1.85
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2665,
        incomeIndex: 1.19
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.6193,
        incomeIndex: 0.76
      }
    ],
    lifeExpectancy: {
      male: 59.5,
      female: 61.9
    },
    under5MortalityPer1000: 95,
    tfr: 4.22,
    meanAgeFirstMarriage: {
      male: 28,
      female: 19.8
    },
    secondaryNetEnrollment: 0.322,
    tertiaryGrossEnrollment: 0.109,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.051,
    informalEmploymentShare: 0.97,
    pensionCoverage: 0.025,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.544,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.0657704948439,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0246,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2018",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=GIN&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/GIN/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      homicide_rate: {
        source: "WHO Global Health Estimates",
        url: "https://www.who.int/data/gho/data/indicators/indicator-details/GHO/gho-ghe-homicide-rates-per-100-000-population",
        year: "2020"
      }
    }
  },
  {
    iso3: "BEN",
    nameJa: "\u30D9\u30CA\u30F3",
    major: false,
    incomeGroup: "LMC",
    births: 478100,
    currency: {
      code: "XOF",
      nameJa: "\u897F\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "F\u202FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 199.279,
    gniPerCapitaLCU: 891864,
    consumptionPerCapitaLCU: 530329,
    incomeShareQuintiles: [
      0.076,
      0.119,
      0.161,
      0.221,
      0.423
    ],
    urbanShare: 0.525,
    places: [
      {
        nameJa: "\u30B3\u30C8\u30CC\u30FC",
        urban: true,
        share: 0.1576,
        incomeIndex: 1.69
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3678,
        incomeIndex: 1.09
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4746,
        incomeIndex: 0.7
      }
    ],
    lifeExpectancy: {
      male: 59.3,
      female: 62.2
    },
    under5MortalityPer1000: 77.2,
    tfr: 4.56,
    meanAgeFirstMarriage: {
      male: 25.8,
      female: 20.7
    },
    secondaryNetEnrollment: 0.466,
    tertiaryGrossEnrollment: 0.102,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.016,
    informalEmploymentShare: 0.96347,
    pensionCoverage: 0.091,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.424,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.0897165628709,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0172,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=BEN&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2020"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/BEN/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "BDI",
    nameJa: "\u30D6\u30EB\u30F3\u30B8",
    major: false,
    incomeGroup: "LIC",
    births: 460900,
    currency: {
      code: "BIF",
      nameJa: "\u30D6\u30EB\u30F3\u30B8 \u30D5\u30E9\u30F3",
      symbol: "BIF",
      jpyPerUnit: 0.0525887,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1029.51,
    gniPerCapitaLCU: 1034580,
    consumptionPerCapitaLCU: 563972,
    incomeShareQuintiles: [
      0.071,
      0.112,
      0.153,
      0.214,
      0.45
    ],
    urbanShare: 0.248,
    places: [
      {
        nameJa: "\u30D6\u30B8\u30E5\u30F3\u30D6\u30E9",
        urban: true,
        share: 0.0745,
        incomeIndex: 2.31
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1738,
        incomeIndex: 1.34
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.7517,
        incomeIndex: 0.79
      }
    ],
    lifeExpectancy: {
      male: 61.6,
      female: 65.7
    },
    under5MortalityPer1000: 48.7,
    tfr: 4.88,
    meanAgeFirstMarriage: {
      male: 26.1,
      female: 23.1
    },
    secondaryNetEnrollment: 0.275,
    tertiaryGrossEnrollment: 0.06,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 9e-3,
    informalEmploymentShare: 0.98044,
    pensionCoverage: 0.133,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.245,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.112714079484,
    housePriceToIncome: 17.5,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.078,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2020",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2014"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/BDI/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "MYS",
    nameJa: "\u30DE\u30EC\u30FC\u30B7\u30A2",
    major: false,
    incomeGroup: "UMC",
    births: 436e3,
    currency: {
      code: "MYR",
      nameJa: "\u30DE\u30EC\u30FC\u30B7\u30A2 \u30EA\u30F3\u30AE\u30C3\u30C8",
      symbol: "RM",
      jpyPerUnit: 38.6378,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1.44923,
    gniPerCapitaLCU: 52483.2,
    consumptionPerCapitaLCU: 33019.4,
    incomeShareQuintiles: [
      0.0589,
      0.1019,
      0.1499,
      0.2208,
      0.4685
    ],
    urbanShare: 0.769,
    places: [
      {
        nameJa: "\u30AF\u30A2\u30E9\u30EB\u30F3\u30D7\u30FC\u30EB",
        urban: true,
        share: 0.2308,
        incomeIndex: 1.29
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5384,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2308,
        incomeIndex: 0.69
      }
    ],
    lifeExpectancy: {
      male: 74.3,
      female: 79.4
    },
    under5MortalityPer1000: 8.3,
    tfr: 1.55,
    meanAgeFirstMarriage: {
      male: 28,
      female: 25.7
    },
    secondaryNetEnrollment: 0.722,
    tertiaryGrossEnrollment: 0.385,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.038,
    informalEmploymentShare: 0.382,
    pensionCoverage: 0.185,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.371,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.148841239803,
    housePriceToIncome: 8.4,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.018,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2023"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/MYS/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      ipv_past12m_women: {
        source: "WHO Violence Against Women Prevalence Estimates 2018",
        url: "https://www.who.int/publications/i/item/9789240022256",
        year: "2018"
      }
    }
  },
  {
    iso3: "VEN",
    nameJa: "\u30D9\u30CD\u30BA\u30A8\u30E9",
    major: false,
    incomeGroup: "UMC",
    births: 427e3,
    currency: {
      code: "VES",
      nameJa: "\u30D9\u30CD\u30BA\u30A8\u30E9 \u30DC\u30EA\u30D0\u30EB",
      symbol: "VES",
      jpyPerUnit: 0.179087,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 396.331,
    gniPerCapitaLCU: 3346790,
    consumptionPerCapitaLCU: 2008080,
    incomeShareQuintiles: [
      0.043,
      0.0959,
      0.1459,
      0.2208,
      0.4944
    ],
    urbanShare: 0.893,
    places: [
      {
        nameJa: "\u30AB\u30E9\u30AB\u30B9",
        urban: true,
        share: 0.2679,
        incomeIndex: 1.22
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.625,
        incomeIndex: 0.96
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.1071,
        incomeIndex: 0.66
      }
    ],
    lifeExpectancy: {
      male: 68.7,
      female: 76.5
    },
    under5MortalityPer1000: 24.2,
    tfr: 2.08,
    meanAgeFirstMarriage: {
      male: 25.8,
      female: 22.9
    },
    secondaryNetEnrollment: 0.732,
    tertiaryGrossEnrollment: 0.482,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.053,
    informalEmploymentShare: 0.5831,
    pensionCoverage: 1,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.297,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.275,
    housePriceToIncome: 14.2,
    disasterRisk: 0.35,
    remittanceShareGdp: 0.0316,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "gniPerCapitaLCU",
      "pensionReplacementRate",
      "places",
      "pppPerIntlDollar",
      "rentShareOfIncome",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "GNI\u306FWDI\u6B20\u640D\u306E\u305F\u3081\u63A8\u5B9A(\u7C73\u30C9\u30EB\u63DB\u7B97); GNI2025/\u6D88\u8CBB\u63A8\u5B9A/PPP\u63A8\u5B9A; \u4E94\u5206\u4F4D2006",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=VEN&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2019"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2017"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "KAZ",
    nameJa: "\u30AB\u30B6\u30D5\u30B9\u30BF\u30F3",
    major: false,
    incomeGroup: "UMC",
    births: 409400,
    currency: {
      code: "KZT",
      nameJa: "\u30AB\u30B6\u30D5\u30B9\u30BF\u30F3 \u30C6\u30F3\u30B2",
      symbol: "\u20B8",
      jpyPerUnit: 0.352053,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 176,
    gniPerCapitaLCU: 6106490,
    consumptionPerCapitaLCU: 3470040,
    incomeShareQuintiles: [
      0.098,
      0.131,
      0.163,
      0.215,
      0.393
    ],
    urbanShare: 0.621,
    places: [
      {
        nameJa: "\u30A2\u30EB\u30DE\u30C8\u30A4",
        urban: true,
        share: 0.1862,
        incomeIndex: 1.37
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4345,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3793,
        incomeIndex: 0.73
      }
    ],
    lifeExpectancy: {
      male: 70.1,
      female: 78.4
    },
    under5MortalityPer1000: 9.6,
    tfr: 3.01,
    meanAgeFirstMarriage: {
      male: 26.3,
      female: 22.4
    },
    secondaryNetEnrollment: 0.998,
    tertiaryGrossEnrollment: 0.535,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.048,
    informalEmploymentShare: 0.412,
    pensionCoverage: 0.957,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.276,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.198392672795,
    housePriceToIncome: 9.5,
    disasterRisk: 0.2,
    remittanceShareGdp: 8e-4,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=KAZ&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2023"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/KAZ/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "RWA",
    nameJa: "\u30EB\u30EF\u30F3\u30C0",
    major: false,
    incomeGroup: "LIC",
    births: 395600,
    currency: {
      code: "RWF",
      nameJa: "\u30EB\u30EF\u30F3\u30C0 \u30D5\u30E9\u30F3",
      symbol: "RF",
      jpyPerUnit: 0.106906,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 361.395,
    gniPerCapitaLCU: 1365550,
    consumptionPerCapitaLCU: 885631,
    incomeShareQuintiles: [
      0.0739,
      0.1089,
      0.1439,
      0.1978,
      0.4755
    ],
    urbanShare: 0.299,
    places: [
      {
        nameJa: "\u30AD\u30AC\u30EA",
        urban: true,
        share: 0.0897,
        incomeIndex: 2.22
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2092,
        incomeIndex: 1.28
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.7011,
        incomeIndex: 0.76
      }
    ],
    lifeExpectancy: {
      male: 65.5,
      female: 69.9
    },
    under5MortalityPer1000: 38.8,
    tfr: 3.7,
    meanAgeFirstMarriage: {
      male: 27,
      female: 24.7
    },
    secondaryNetEnrollment: 0.359,
    tertiaryGrossEnrollment: 0.094,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.113,
    informalEmploymentShare: 0.90055,
    pensionCoverage: 0.167,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.041,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.146045649939,
    housePriceToIncome: 17.5,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0342,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/RWA/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "ITA",
    nameJa: "\u30A4\u30BF\u30EA\u30A2",
    major: false,
    incomeGroup: "HIC",
    births: 377500,
    currency: {
      code: "EUR",
      nameJa: "\u30E6\u30FC\u30ED",
      symbol: "\u20AC",
      jpyPerUnit: 177.334,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 0.62516,
    gniPerCapitaLCU: 37271.6,
    consumptionPerCapitaLCU: 21506.5,
    incomeShareQuintiles: [
      0.0659,
      0.1229,
      0.1698,
      0.2308,
      0.4106
    ],
    urbanShare: 0.696,
    places: [
      {
        nameJa: "\u30ED\u30FC\u30DE",
        urban: true,
        share: 0.2088,
        incomeIndex: 1.13
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4872,
        incomeIndex: 1.04
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.304,
        incomeIndex: 0.85
      }
    ],
    lifeExpectancy: {
      male: 81.4,
      female: 85.4
    },
    under5MortalityPer1000: 2.8,
    tfr: 1.21,
    meanAgeFirstMarriage: {
      male: 35.3,
      female: 32.2
    },
    secondaryNetEnrollment: 0.947,
    tertiaryGrossEnrollment: 0.759,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.065,
    informalEmploymentShare: 0.08353,
    pensionCoverage: 1,
    pensionReplacementRate: 0.706,
    outOfPocketHealthShare: 0.236,
    effectiveTaxRateAvgWorker: 0.28627574,
    rentShareOfIncome: 0.203056632532,
    housePriceToIncome: 7.8,
    disasterRisk: 0.3,
    remittanceShareGdp: 51e-4,
    estimated: [
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ITA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "GTM",
    nameJa: "\u30B0\u30A2\u30C6\u30DE\u30E9",
    major: false,
    incomeGroup: "UMC",
    births: 377200,
    currency: {
      code: "GTQ",
      nameJa: "\u30B0\u30A2\u30C6\u30DE\u30E9 \u30B1\u30C4\u30A1\u30EB",
      symbol: "Q",
      jpyPerUnit: 20.6388,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 3.47309,
    gniPerCapitaLCU: 47039.9,
    consumptionPerCapitaLCU: 42099.3,
    incomeShareQuintiles: [
      0.046,
      0.0931,
      0.1401,
      0.2142,
      0.5066
    ],
    urbanShare: 0.56,
    places: [
      {
        nameJa: "\u30B0\u30A2\u30C6\u30DE\u30E9\u30B7\u30C6\u30A3",
        urban: true,
        share: 0.1679,
        incomeIndex: 1.41
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3917,
        incomeIndex: 1.1
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4404,
        incomeIndex: 0.75
      }
    ],
    lifeExpectancy: {
      male: 70.3,
      female: 74.9
    },
    under5MortalityPer1000: 21.2,
    tfr: 2.31,
    meanAgeFirstMarriage: {
      male: 25,
      female: 22.7
    },
    secondaryNetEnrollment: 0.438,
    tertiaryGrossEnrollment: 0.273,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.026,
    informalEmploymentShare: 0.73518,
    pensionCoverage: 0.233,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.572,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.117631442242,
    housePriceToIncome: 13.5,
    disasterRisk: 0.6,
    remittanceShareGdp: 0.1912,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/GTM/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "KHM",
    nameJa: "\u30AB\u30F3\u30DC\u30B8\u30A2",
    major: false,
    incomeGroup: "LMC",
    births: 361600,
    currency: {
      code: "KHR",
      nameJa: "\u30AB\u30F3\u30DC\u30B8\u30A2 \u30EA\u30A8\u30EB",
      symbol: "\u17DB",
      jpyPerUnit: 0.0387732,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1477.79,
    gniPerCapitaLCU: 10619100,
    consumptionPerCapitaLCU: 6397310,
    incomeShareQuintiles: [
      0.0704,
      0.1147,
      0.1579,
      0.2213,
      0.4357
    ],
    urbanShare: 0.409,
    places: [
      {
        nameJa: "\u30D7\u30CE\u30F3\u30DA\u30F3",
        urban: true,
        share: 0.1226,
        incomeIndex: 1.81
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2861,
        incomeIndex: 1.17
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.5913,
        incomeIndex: 0.75
      }
    ],
    lifeExpectancy: {
      male: 68,
      female: 73.2
    },
    under5MortalityPer1000: 19.1,
    tfr: 2.58,
    meanAgeFirstMarriage: {
      male: 24.5,
      female: 21.8
    },
    secondaryNetEnrollment: 0.616,
    tertiaryGrossEnrollment: 0.214,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 3e-3,
    informalEmploymentShare: 0.78545,
    pensionCoverage: 0.081,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.606,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.136616755621,
    housePriceToIncome: 35,
    disasterRisk: 0.5,
    remittanceShareGdp: 0.061,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "incomeShareQuintiles",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2020"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/KHM/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "CAN",
    nameJa: "\u30AB\u30CA\u30C0",
    major: false,
    incomeGroup: "HIC",
    births: 352400,
    currency: {
      code: "CAD",
      nameJa: "\u30AB\u30CA\u30C0 \u30C9\u30EB",
      symbol: "$",
      jpyPerUnit: 112.381,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1.2409,
    gniPerCapitaLCU: 74156.9,
    consumptionPerCapitaLCU: 41885.3,
    incomeShareQuintiles: [
      0.077,
      0.13,
      0.172,
      0.226,
      0.395
    ],
    urbanShare: 0.827,
    places: [
      {
        nameJa: "\u30C8\u30ED\u30F3\u30C8",
        urban: true,
        share: 0.2481,
        incomeIndex: 1.1
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5789,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.173,
        incomeIndex: 0.83
      }
    ],
    lifeExpectancy: {
      male: 79.5,
      female: 83.9
    },
    under5MortalityPer1000: 5.4,
    tfr: 1.27,
    meanAgeFirstMarriage: {
      male: 28.7,
      female: 27.2
    },
    secondaryNetEnrollment: 0.998,
    tertiaryGrossEnrollment: 0.763,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.064,
    informalEmploymentShare: 0.249,
    pensionCoverage: 1,
    pensionReplacementRate: 0.371,
    outOfPocketHealthShare: 0.152,
    effectiveTaxRateAvgWorker: 0.25608721,
    rentShareOfIncome: 0.212749663305,
    housePriceToIncome: 7.2,
    disasterRisk: 0.15,
    remittanceShareGdp: 4e-4,
    estimated: [
      "informalEmploymentShare",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=CAN&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/CAN/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "PRK",
    nameJa: "\u5317\u671D\u9BAE",
    major: false,
    incomeGroup: "LIC",
    births: 342e3,
    currency: {
      code: "KPW",
      nameJa: "\u5317\u671D\u9BAE\u30A6\u30A9\u30F3",
      symbol: "\u20A9",
      jpyPerUnit: 0.175114,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 297.236,
    gniPerCapitaLCU: 1080860,
    consumptionPerCapitaLCU: 648516,
    incomeShareQuintiles: [
      0.072,
      0.1119,
      0.1529,
      0.2139,
      0.4493
    ],
    urbanShare: 0.639,
    places: [
      {
        nameJa: "\u5E73\u58CC",
        urban: true,
        share: 0.1916,
        incomeIndex: 1.74
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.447,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3614,
        incomeIndex: 0.6
      }
    ],
    lifeExpectancy: {
      male: 71.5,
      female: 75.7
    },
    under5MortalityPer1000: 18,
    tfr: 1.78,
    meanAgeFirstMarriage: {
      male: 29.4,
      female: 26.1
    },
    secondaryNetEnrollment: 0.31,
    tertiaryGrossEnrollment: 0.267,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.035,
    informalEmploymentShare: 0.754,
    pensionCoverage: 0.075,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.463,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.35,
    housePriceToIncome: 17.5,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0395,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "gniPerCapitaLCU",
      "housePriceToIncome",
      "incomeShareQuintiles",
      "informalEmploymentShare",
      "meanAgeFirstMarriage",
      "outOfPocketHealthShare",
      "pensionCoverage",
      "pensionReplacementRate",
      "places",
      "pppPerIntlDollar",
      "remittanceShareGdp",
      "rentShareOfIncome",
      "secondaryNetEnrollment",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI\u306FWDI\u6B20\u640D\u306E\u305F\u3081\u63A8\u5B9A(\u7C73\u30C9\u30EB\u63DB\u7B97); GNI2025/\u6D88\u8CBB\u63A8\u5B9A/PPP\u63A8\u5B9A"
  },
  {
    iso3: "SSD",
    nameJa: "\u5357\u30B9\u30FC\u30C0\u30F3",
    major: false,
    incomeGroup: "LIC",
    births: 328300,
    currency: {
      code: "SSP",
      nameJa: "\u5357\u30B9\u30FC\u30C0\u30F3 \u30DD\u30F3\u30C9",
      symbol: "\xA3",
      jpyPerUnit: 0.0274539,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 2964.02,
    gniPerCapitaLCU: 2298080,
    consumptionPerCapitaLCU: 1378850,
    incomeShareQuintiles: [
      0.049,
      0.0959,
      0.1419,
      0.2188,
      0.4944
    ],
    urbanShare: 0.214,
    places: [
      {
        nameJa: "\u30B8\u30E5\u30D0",
        urban: true,
        share: 0.0641,
        incomeIndex: 2.38
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1496,
        incomeIndex: 1.38
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.7863,
        incomeIndex: 0.82
      }
    ],
    lifeExpectancy: {
      male: 54.6,
      female: 60.6
    },
    under5MortalityPer1000: 96.7,
    tfr: 3.86,
    meanAgeFirstMarriage: {
      male: 25.6,
      female: 18.4
    },
    secondaryNetEnrollment: 0.055,
    tertiaryGrossEnrollment: 0.064,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.124,
    informalEmploymentShare: 0.97,
    pensionCoverage: 0,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.271,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.0541116661542,
    housePriceToIncome: 17.5,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0949,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "gniPerCapitaLCU",
      "housePriceToIncome",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "GNI\u306FWDI\u6B20\u640D\u306E\u305F\u3081\u63A8\u5B9A(\u7C73\u30C9\u30EB\u63DB\u7B97); GNI2025/\u6D88\u8CBB\u63A8\u5B9A/PPP2021(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2016",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=SSD&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2023"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/SSD/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "ESP",
    nameJa: "\u30B9\u30DA\u30A4\u30F3",
    major: false,
    incomeGroup: "HIC",
    births: 319100,
    currency: {
      code: "EUR",
      nameJa: "\u30E6\u30FC\u30ED",
      symbol: "\u20AC",
      jpyPerUnit: 177.334,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 0.58848,
    gniPerCapitaLCU: 32555.7,
    consumptionPerCapitaLCU: 18068.2,
    incomeShareQuintiles: [
      0.065,
      0.126,
      0.173,
      0.234,
      0.402
    ],
    urbanShare: 0.803,
    places: [
      {
        nameJa: "\u30DE\u30C9\u30EA\u30FC\u30C9",
        urban: true,
        share: 0.2409,
        incomeIndex: 1.11
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5622,
        incomeIndex: 1.01
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.1969,
        incomeIndex: 0.83
      }
    ],
    lifeExpectancy: {
      male: 81.3,
      female: 86.7
    },
    under5MortalityPer1000: 3.2,
    tfr: 1.12,
    meanAgeFirstMarriage: {
      male: 30.3,
      female: 27.7
    },
    secondaryNetEnrollment: 0.969,
    tertiaryGrossEnrollment: 0.938,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.114,
    informalEmploymentShare: 0.03799,
    pensionCoverage: 0.889,
    pensionReplacementRate: 0.804,
    outOfPocketHealthShare: 0.209,
    effectiveTaxRateAvgWorker: 0.23543533,
    rentShareOfIncome: 0.198811450708,
    housePriceToIncome: 8.7,
    disasterRisk: 0.2,
    remittanceShareGdp: 37e-4,
    estimated: [
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ESP/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "AUS",
    nameJa: "\u30AA\u30FC\u30B9\u30C8\u30E9\u30EA\u30A2",
    major: false,
    incomeGroup: "HIC",
    births: 287900,
    currency: {
      code: "AUD",
      nameJa: "\u30AA\u30FC\u30B9\u30C8\u30E9\u30EA\u30A2 \u30C9\u30EB",
      symbol: "$",
      jpyPerUnit: 110.652,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 1.4274,
    gniPerCapitaLCU: 95113.3,
    consumptionPerCapitaLCU: 50687.7,
    incomeShareQuintiles: [
      0.072,
      0.124,
      0.165,
      0.226,
      0.413
    ],
    urbanShare: 0.876,
    places: [
      {
        nameJa: "\u30B7\u30C9\u30CB\u30FC",
        urban: true,
        share: 0.2628,
        incomeIndex: 1.09
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.6132,
        incomeIndex: 1
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.124,
        incomeIndex: 0.82
      }
    ],
    lifeExpectancy: {
      male: 81.1,
      female: 85.1
    },
    under5MortalityPer1000: 3.7,
    tfr: 1.5,
    meanAgeFirstMarriage: {
      male: 31.2,
      female: 29.9
    },
    secondaryNetEnrollment: 0.923,
    tertiaryGrossEnrollment: 1,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.039,
    informalEmploymentShare: 0.244,
    pensionCoverage: 0.744,
    pensionReplacementRate: 0.408,
    outOfPocketHealthShare: 0.158,
    effectiveTaxRateAvgWorker: 0.23523271,
    rentShareOfIncome: 0.189366945646,
    housePriceToIncome: 8.2,
    disasterRisk: 0.25,
    remittanceShareGdp: 1e-3,
    estimated: [
      "informalEmploymentShare",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2020; \u9AD8\u7B49\u6559\u80B2\u7DCF\u5C31\u5B66\u7387108%\u30921.0\u306B\u4E38\u3081",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=AUS&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/AUS/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "POL",
    nameJa: "\u30DD\u30FC\u30E9\u30F3\u30C9",
    major: false,
    incomeGroup: "HIC",
    births: 271500,
    currency: {
      code: "PLN",
      nameJa: "\u30DD\u30FC\u30E9\u30F3\u30C9 \u30BA\u30A6\u30A9\u30C6\u30A3",
      symbol: "z\u0142",
      jpyPerUnit: 40.6932,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 2.00804,
    gniPerCapitaLCU: 96583.4,
    consumptionPerCapitaLCU: 57344,
    incomeShareQuintiles: [
      0.086,
      0.139,
      0.177,
      0.225,
      0.373
    ],
    urbanShare: 0.6,
    places: [
      {
        nameJa: "\u30EF\u30EB\u30B7\u30E3\u30EF",
        urban: true,
        share: 0.1799,
        incomeIndex: 1.16
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4198,
        incomeIndex: 1.06
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4003,
        incomeIndex: 0.87
      }
    ],
    lifeExpectancy: {
      male: 74.6,
      female: 82.1
    },
    under5MortalityPer1000: 4.3,
    tfr: 1.2,
    meanAgeFirstMarriage: {
      male: 28.7,
      female: 26.6
    },
    secondaryNetEnrollment: 0.941,
    tertiaryGrossEnrollment: 0.809,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.028,
    informalEmploymentShare: 0.14351,
    pensionCoverage: 0.829,
    pensionReplacementRate: 0.286,
    outOfPocketHealthShare: 0.158,
    effectiveTaxRateAvgWorker: 0.24435537,
    rentShareOfIncome: 0.160708130482,
    housePriceToIncome: 9.7,
    disasterRisk: 0.12,
    remittanceShareGdp: 95e-4,
    estimated: [
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2023",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/POL/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "TJK",
    nameJa: "\u30BF\u30B8\u30AD\u30B9\u30BF\u30F3",
    major: false,
    incomeGroup: "LMC",
    births: 271400,
    currency: {
      code: "TJS",
      nameJa: "\u30BF\u30B8\u30AD\u30B9\u30BF\u30F3 \u30BD\u30E2\u30CB",
      symbol: "TJS",
      jpyPerUnit: 17.1212,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 3.17683,
    gniPerCapitaLCU: 19237.1,
    consumptionPerCapitaLCU: 13629.8,
    incomeShareQuintiles: [
      0.0709,
      0.1148,
      0.1597,
      0.2226,
      0.432
    ],
    urbanShare: 0.262,
    places: [
      {
        nameJa: "\u30C9\u30A5\u30B7\u30E3\u30F3\u30D9",
        urban: true,
        share: 0.0785,
        incomeIndex: 2
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1833,
        incomeIndex: 1.29
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.7382,
        incomeIndex: 0.82
      }
    ],
    lifeExpectancy: {
      male: 69.6,
      female: 74
    },
    under5MortalityPer1000: 28.8,
    tfr: 3.07,
    meanAgeFirstMarriage: {
      male: 24.2,
      female: 21
    },
    secondaryNetEnrollment: 0.88,
    tertiaryGrossEnrollment: 0.356,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.07,
    informalEmploymentShare: 0.6363,
    pensionCoverage: 1,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.624,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.102989641918,
    housePriceToIncome: 10.3,
    disasterRisk: 0.4,
    remittanceShareGdp: 0.4715,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2023"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2016"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/TJK/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "ECU",
    nameJa: "\u30A8\u30AF\u30A2\u30C9\u30EB",
    major: false,
    incomeGroup: "UMC",
    births: 270300,
    currency: {
      code: "USD",
      nameJa: "\u7C73\u30C9\u30EB",
      symbol: "$",
      jpyPerUnit: 157.728,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 0.45022,
    gniPerCapitaLCU: 6641.41,
    consumptionPerCapitaLCU: 4338.21,
    incomeShareQuintiles: [
      0.043,
      0.091,
      0.144,
      0.222,
      0.5
    ],
    urbanShare: 0.632,
    places: [
      {
        nameJa: "\u30B0\u30A2\u30E4\u30AD\u30EB",
        urban: true,
        share: 0.1897,
        incomeIndex: 1.36
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4427,
        incomeIndex: 1.07
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3676,
        incomeIndex: 0.73
      }
    ],
    lifeExpectancy: {
      male: 74.7,
      female: 80.1
    },
    under5MortalityPer1000: 13,
    tfr: 1.82,
    meanAgeFirstMarriage: {
      male: 25,
      female: 21.8
    },
    secondaryNetEnrollment: 0.847,
    tertiaryGrossEnrollment: 0.679,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.035,
    informalEmploymentShare: 0.6845,
    pensionCoverage: 0.661,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.309,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.107406756729,
    housePriceToIncome: 11.3,
    disasterRisk: 0.55,
    remittanceShareGdp: 0.0529,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ECU/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "TGO",
    nameJa: "\u30C8\u30FC\u30B4",
    major: false,
    incomeGroup: "LIC",
    births: 268500,
    currency: {
      code: "XOF",
      nameJa: "\u897F\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "F\u202FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 223.316,
    gniPerCapitaLCU: 769351,
    consumptionPerCapitaLCU: 538115,
    incomeShareQuintiles: [
      0.068,
      0.11,
      0.154,
      0.216,
      0.452
    ],
    urbanShare: 0.438,
    places: [
      {
        nameJa: "\u30ED\u30E1",
        urban: true,
        share: 0.1314,
        incomeIndex: 2
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3067,
        incomeIndex: 1.16
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.5619,
        incomeIndex: 0.68
      }
    ],
    lifeExpectancy: {
      male: 62.5,
      female: 62.9
    },
    under5MortalityPer1000: 58.1,
    tfr: 4.19,
    meanAgeFirstMarriage: {
      male: 27.6,
      female: 21.3
    },
    secondaryNetEnrollment: 0.41,
    tertiaryGrossEnrollment: 0.149,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.019,
    informalEmploymentShare: 0.95067,
    pensionCoverage: 0.159,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.643,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.126177055369,
    housePriceToIncome: 17.5,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0869,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2023/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/TGO/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      homicide_rate: {
        source: "UNODC Research Data Portal",
        url: "https://dataunodc.un.org/dp-intentional-homicide-victims",
        year: "2015"
      }
    }
  },
  {
    iso3: "BOL",
    nameJa: "\u30DC\u30EA\u30D3\u30A2",
    major: false,
    incomeGroup: "LMC",
    births: 260200,
    currency: {
      code: "BOB",
      nameJa: "\u30DC\u30EA\u30D3\u30A2 \u30DC\u30EA\u30D3\u30A2\u30FC\u30CE",
      symbol: "Bs",
      jpyPerUnit: 13.4564,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 3.93439,
    gniPerCapitaLCU: 50740.2,
    consumptionPerCapitaLCU: 36082.5,
    incomeShareQuintiles: [
      0.0541,
      0.1041,
      0.1522,
      0.2222,
      0.4674
    ],
    urbanShare: 0.712,
    places: [
      {
        nameJa: "\u30B5\u30F3\u30BF\u30AF\u30EB\u30B9",
        urban: true,
        share: 0.2137,
        incomeIndex: 1.53
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4987,
        incomeIndex: 0.99
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2876,
        incomeIndex: 0.63
      }
    ],
    lifeExpectancy: {
      male: 66.1,
      female: 71.1
    },
    under5MortalityPer1000: 16.4,
    tfr: 2.55,
    meanAgeFirstMarriage: {
      male: 26.6,
      female: 24
    },
    secondaryNetEnrollment: 0.766,
    tertiaryGrossEnrollment: 0.206,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.033,
    informalEmploymentShare: 0.85605,
    pensionCoverage: 1,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.273,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.160554161808,
    housePriceToIncome: 11.2,
    disasterRisk: 0.4,
    remittanceShareGdp: 0.0231,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "\u91D1\u984D\u306FWDI 2024\u5E74\u5024\u3092\u70BA\u66FF\u5909\u52D5\u3067\u73FE\u884C\u901A\u8CA8\u6C34\u6E96\u306B\u63DB\u7B97(x1.70); GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2012"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/BOL/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "SLE",
    nameJa: "\u30B7\u30A8\u30E9\u30EC\u30AA\u30CD",
    major: false,
    incomeGroup: "LIC",
    births: 258900,
    currency: {
      code: "SLE",
      nameJa: "\u30B7\u30A8\u30E9\u30EC\u30AA\u30CD \u30EC\u30AA\u30F3",
      symbol: "SLE",
      jpyPerUnit: 6.87866,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 6.61705,
    gniPerCapitaLCU: 18070.3,
    consumptionPerCapitaLCU: 14564.4,
    incomeShareQuintiles: [
      0.0789,
      0.1169,
      0.1528,
      0.2098,
      0.4416
    ],
    urbanShare: 0.454,
    places: [
      {
        nameJa: "\u30D5\u30EA\u30FC\u30BF\u30A6\u30F3",
        urban: true,
        share: 0.1361,
        incomeIndex: 1.97
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3175,
        incomeIndex: 1.14
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.5464,
        incomeIndex: 0.67
      }
    ],
    lifeExpectancy: {
      male: 60.1,
      female: 63.5
    },
    under5MortalityPer1000: 93.8,
    tfr: 3.79,
    meanAgeFirstMarriage: {
      male: 27.9,
      female: 23.1
    },
    secondaryNetEnrollment: 0.418,
    tertiaryGrossEnrollment: 0.064,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.031,
    informalEmploymentShare: 0.9447,
    pensionCoverage: 0.07,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.545,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.074816303092,
    housePriceToIncome: 17.5,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.046,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2018",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2019"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2018"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/SLE/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "HTI",
    nameJa: "\u30CF\u30A4\u30C1",
    major: false,
    incomeGroup: "LMC",
    births: 258400,
    currency: {
      code: "HTG",
      nameJa: "\u30CF\u30A4\u30C1 \u30B0\u30FC\u30EB\u30C9",
      symbol: "HTG",
      jpyPerUnit: 1.20375,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 106.602,
    gniPerCapitaLCU: 272395,
    consumptionPerCapitaLCU: 262023,
    incomeShareQuintiles: [
      0.0549,
      0.1029,
      0.1518,
      0.2198,
      0.4706
    ],
    urbanShare: 0.55,
    places: [
      {
        nameJa: "\u30DD\u30EB\u30C8\u30FC\u30D7\u30E9\u30F3\u30B9",
        urban: true,
        share: 0.1651,
        incomeIndex: 1.67
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3853,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4496,
        incomeIndex: 0.69
      }
    ],
    lifeExpectancy: {
      male: 61.7,
      female: 68.3
    },
    under5MortalityPer1000: 54.4,
    tfr: 2.66,
    meanAgeFirstMarriage: {
      male: 28.7,
      female: 25
    },
    secondaryNetEnrollment: 0.616,
    tertiaryGrossEnrollment: 0.206,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.146,
    informalEmploymentShare: 0.91607,
    pensionCoverage: 0.01,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.524,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.3,
    housePriceToIncome: 15,
    disasterRisk: 0.7,
    remittanceShareGdp: 0.1695,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "rentShareOfIncome",
      "secondaryNetEnrollment",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2012",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2012"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2017"
      }
    }
  },
  {
    iso3: "PNG",
    nameJa: "\u30D1\u30D7\u30A2\u30CB\u30E5\u30FC\u30AE\u30CB\u30A2",
    major: false,
    incomeGroup: "LMC",
    births: 255300,
    currency: {
      code: "PGK",
      nameJa: "\u30D1\u30D7\u30A2\u30CB\u30E5\u30FC\u30AE\u30CB\u30A2 \u30AD\u30CA",
      symbol: "PGK",
      jpyPerUnit: 35.2427,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 2.71633,
    gniPerCapitaLCU: 10527.9,
    consumptionPerCapitaLCU: 6316.73,
    incomeShareQuintiles: [
      0.051,
      0.1,
      0.152,
      0.224,
      0.473
    ],
    urbanShare: 0.154,
    places: [
      {
        nameJa: "\u30DD\u30FC\u30C8\u30E2\u30EC\u30B9\u30D3\u30FC",
        urban: true,
        share: 0.0462,
        incomeIndex: 2.15
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1078,
        incomeIndex: 1.39
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.846,
        incomeIndex: 0.89
      }
    ],
    lifeExpectancy: {
      male: 63.7,
      female: 69.1
    },
    under5MortalityPer1000: 40.6,
    tfr: 3.1,
    meanAgeFirstMarriage: {
      male: 26.2,
      female: 21.7
    },
    secondaryNetEnrollment: 0.324,
    tertiaryGrossEnrollment: 0.206,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.026,
    informalEmploymentShare: 0.909,
    pensionCoverage: 0.019,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.086,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.3,
    housePriceToIncome: 15,
    disasterRisk: 0.6,
    remittanceShareGdp: 1e-4,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "rentShareOfIncome",
      "tertiaryAnnualCostShareOfGni",
      "tertiaryGrossEnrollment"
    ],
    notes: "GNI2024/\u6D88\u8CBB\u63A8\u5B9A/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2009",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=PNG&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      }
    }
  },
  {
    iso3: "LKA",
    nameJa: "\u30B9\u30EA\u30E9\u30F3\u30AB",
    major: false,
    incomeGroup: "LMC",
    births: 246800,
    currency: {
      code: "LKR",
      nameJa: "\u30B9\u30EA\u30E9\u30F3\u30AB \u30EB\u30D4\u30FC",
      symbol: "Rs",
      jpyPerUnit: 0.475305,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 87.4893,
    gniPerCapitaLCU: 1337430,
    consumptionPerCapitaLCU: 951796,
    incomeShareQuintiles: [
      0.074,
      0.111,
      0.15,
      0.208,
      0.457
    ],
    urbanShare: 0.203,
    places: [
      {
        nameJa: "\u30B3\u30ED\u30F3\u30DC",
        urban: true,
        share: 0.0609,
        incomeIndex: 2.08
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.1421,
        incomeIndex: 1.35
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.797,
        incomeIndex: 0.86
      }
    ],
    lifeExpectancy: {
      male: 74.2,
      female: 80.6
    },
    under5MortalityPer1000: 6.1,
    tfr: 1.97,
    meanAgeFirstMarriage: {
      male: 27.2,
      female: 23.9
    },
    secondaryNetEnrollment: 0.91,
    tertiaryGrossEnrollment: 0.207,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.042,
    informalEmploymentShare: 0.66354,
    pensionCoverage: 0.311,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.548,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.0923231818763,
    housePriceToIncome: 55.4,
    disasterRisk: 0.4,
    remittanceShareGdp: 0.0675,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2019",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=LKA&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2012"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/LKA/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "CAF",
    nameJa: "\u4E2D\u592E\u30A2\u30D5\u30EA\u30AB",
    major: false,
    incomeGroup: "LIC",
    births: 238900,
    currency: {
      code: "XAF",
      nameJa: "\u4E2D\u592E\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 263.365,
    gniPerCapitaLCU: 331811,
    consumptionPerCapitaLCU: 306282,
    incomeShareQuintiles: [
      0.056,
      0.097,
      0.141,
      0.214,
      0.492
    ],
    urbanShare: 0.441,
    places: [
      {
        nameJa: "\u30D0\u30F3\u30AE",
        urban: true,
        share: 0.1324,
        incomeIndex: 1.99
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3089,
        incomeIndex: 1.15
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.5587,
        incomeIndex: 0.68
      }
    ],
    lifeExpectancy: {
      male: 55.3,
      female: 59.3
    },
    under5MortalityPer1000: 92.6,
    tfr: 6.01,
    meanAgeFirstMarriage: {
      male: 21.7,
      female: 17.3
    },
    secondaryNetEnrollment: 0.127,
    tertiaryGrossEnrollment: 0.028,
    tertiaryAnnualCostShareOfGni: 0.25,
    unemploymentRate: 0.063,
    informalEmploymentShare: 0.97,
    pensionCoverage: 0.047,
    pensionReplacementRate: 0.35,
    outOfPocketHealthShare: 0.45,
    effectiveTaxRateAvgWorker: 0.115,
    rentShareOfIncome: 0.0830174816005,
    housePriceToIncome: 17.5,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0395,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "remittanceShareGdp",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2019"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2010"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/CAF/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "JOR",
    nameJa: "\u30E8\u30EB\u30C0\u30F3",
    major: false,
    incomeGroup: "UMC",
    births: 235800,
    currency: {
      code: "JOD",
      nameJa: "\u30E8\u30EB\u30C0\u30F3 \u30C7\u30A3\u30CA\u30FC\u30EB",
      symbol: "JOD",
      jpyPerUnit: 222.465,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 0.3212,
    gniPerCapitaLCU: 3527.57,
    consumptionPerCapitaLCU: 2116.54,
    incomeShareQuintiles: [
      0.082,
      0.121,
      0.158,
      0.215,
      0.424
    ],
    urbanShare: 0.93,
    places: [
      {
        nameJa: "\u30A2\u30F3\u30DE\u30F3",
        urban: true,
        share: 0.2789,
        incomeIndex: 1.21
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.6507,
        incomeIndex: 0.95
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.0704,
        incomeIndex: 0.65
      }
    ],
    lifeExpectancy: {
      male: 75.7,
      female: 80.2
    },
    under5MortalityPer1000: 13.3,
    tfr: 2.64,
    meanAgeFirstMarriage: {
      male: 30.9,
      female: 24.7
    },
    secondaryNetEnrollment: 0.626,
    tertiaryGrossEnrollment: 0.359,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.167,
    informalEmploymentShare: 0.54223,
    pensionCoverage: 0.575,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.345,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.201807276545,
    housePriceToIncome: 6.7,
    disasterRisk: 0.3,
    remittanceShareGdp: 0.0756,
    estimated: [
      "consumptionPerCapitaLCU",
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB\u63A8\u5B9A/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2010",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2024"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2018"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/JOR/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "HND",
    nameJa: "\u30DB\u30F3\u30B8\u30E5\u30E9\u30B9",
    major: false,
    incomeGroup: "LMC",
    births: 233800,
    currency: {
      code: "HNL",
      nameJa: "\u30DB\u30F3\u30B8\u30E5\u30E9\u30B9 \u30EC\u30F3\u30D4\u30E9",
      symbol: "L",
      jpyPerUnit: 5.87547,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 12.388,
    gniPerCapitaLCU: 78259.8,
    consumptionPerCapitaLCU: 72477.4,
    incomeShareQuintiles: [
      0.037,
      0.0899,
      0.1449,
      0.2288,
      0.4994
    ],
    urbanShare: 0.588,
    places: [
      {
        nameJa: "\u30C6\u30B0\u30B7\u30AC\u30EB\u30D1",
        urban: true,
        share: 0.1764,
        incomeIndex: 1.63
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4115,
        incomeIndex: 1.06
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.4121,
        incomeIndex: 0.67
      }
    ],
    lifeExpectancy: {
      male: 70.3,
      female: 75.5
    },
    under5MortalityPer1000: 15.5,
    tfr: 2.5,
    meanAgeFirstMarriage: {
      male: 24.1,
      female: 21.2
    },
    secondaryNetEnrollment: 0.438,
    tertiaryGrossEnrollment: 0.233,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.049,
    informalEmploymentShare: 0.82612,
    pensionCoverage: 0.146,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.531,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.107569480046,
    housePriceToIncome: 15,
    disasterRisk: 0.55,
    remittanceShareGdp: 0.2574,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2017"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2012"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2012"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/HND/series/9060000?format=json&per_page=200",
        year: "2021"
      }
    }
  },
  {
    iso3: "KOR",
    nameJa: "\u97D3\u56FD",
    major: true,
    incomeGroup: "HIC",
    births: 232700,
    currency: {
      code: "KRW",
      nameJa: "\u97D3\u56FD\u30A6\u30A9\u30F3",
      symbol: "\u20A9",
      jpyPerUnit: 0.119215,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 872.469,
    gniPerCapitaLCU: 5012e4,
    consumptionPerCapitaLCU: 23955600,
    incomeShareQuintiles: [
      0.0739,
      0.1239,
      0.1688,
      0.2308,
      0.4026
    ],
    urbanShare: 0.812,
    places: [
      {
        nameJa: "\u30BD\u30A6\u30EB",
        urban: true,
        share: 0.1942,
        incomeIndex: 1.16
      },
      {
        nameJa: "\u4EAC\u757F\u9053\u306E\u90FD\u5E02",
        urban: true,
        share: 0.3,
        incomeIndex: 1.06
      },
      {
        nameJa: "\u91DC\u5C71",
        urban: true,
        share: 0.0675,
        incomeIndex: 0.96
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.2503,
        incomeIndex: 0.93
      },
      {
        nameJa: "\u5730\u65B9\u306E\u90E1\u90E8",
        urban: false,
        share: 0.188,
        incomeIndex: 0.81
      }
    ],
    lifeExpectancy: {
      male: 80.6,
      female: 86.4
    },
    under5MortalityPer1000: 2.9,
    tfr: 0.72,
    meanAgeFirstMarriage: {
      male: 33.9,
      female: 31.5
    },
    secondaryNetEnrollment: 0.98,
    tertiaryGrossEnrollment: 1,
    tertiaryAnnualCostShareOfGni: 0.16,
    unemploymentRate: 0.028,
    informalEmploymentShare: 0.29122,
    pensionCoverage: 1,
    pensionReplacementRate: 0.334,
    outOfPocketHealthShare: 0.318,
    effectiveTaxRateAvgWorker: 0.16534869,
    rentShareOfIncome: 0.140322809379,
    housePriceToIncome: 24.4,
    disasterRisk: 0.25,
    remittanceShareGdp: 39e-4,
    estimated: [
      "tertiaryAnnualCostShareOfGni",
      "places.incomeIndex"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2021; \u9AD8\u7B49\u6559\u80B2\u7DCF\u5C31\u5B66\u7387112%\u30921.0\u306B\u4E38\u3081",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=KOR&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2019"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/KOR/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      },
      city_population_share: {
        source: "UN WUP 2018 / WPP 2024",
        url: "https://population.un.org/wup/Download/Files/WUP2018-F22-Cities_Over_300K_Annual.xls; https://population.un.org/wpp/",
        year: "2025"
      }
    },
    cityPopulationShare: {
      Seoul: 0.1941587775346595,
      Busan: 0.06747937257737746,
      Incheon: 0.055652089544767004,
      Daegu: 0.04223875280044053,
      Daejon: 0.030717955635076535
    }
  },
  {
    iso3: "UKR",
    nameJa: "\u30A6\u30AF\u30E9\u30A4\u30CA",
    major: false,
    incomeGroup: "UMC",
    births: 212200,
    currency: {
      code: "UAH",
      nameJa: "\u30A6\u30AF\u30E9\u30A4\u30CA \u30D5\u30EA\u30F4\u30CB\u30E3",
      symbol: "\u20B4",
      jpyPerUnit: 3.50167,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 10.8088,
    gniPerCapitaLCU: 217083,
    consumptionPerCapitaLCU: 128639,
    incomeShareQuintiles: [
      0.1001,
      0.1431,
      0.1762,
      0.2212,
      0.3594
    ],
    urbanShare: 0.695,
    places: [
      {
        nameJa: "\u30AD\u30FC\u30A6",
        urban: true,
        share: 0.2086,
        incomeIndex: 1.33
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4867,
        incomeIndex: 1.04
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3047,
        incomeIndex: 0.71
      }
    ],
    lifeExpectancy: {
      male: 66.9,
      female: 80.2
    },
    under5MortalityPer1000: 8,
    tfr: 0.98,
    meanAgeFirstMarriage: {
      male: 25.9,
      female: 23
    },
    secondaryNetEnrollment: 0.857,
    tertiaryGrossEnrollment: 0.872,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.098,
    informalEmploymentShare: 0.35,
    pensionCoverage: 0.962,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.453,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.124384468432,
    housePriceToIncome: 11.8,
    disasterRisk: 0.15,
    remittanceShareGdp: 0.0629,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "informalEmploymentShare",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2020",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2020"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2007"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2012"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/UKR/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "DOM",
    nameJa: "\u30C9\u30DF\u30CB\u30AB\u5171\u548C\u56FD",
    major: false,
    incomeGroup: "UMC",
    births: 203200,
    currency: {
      code: "DOP",
      nameJa: "\u30C9\u30DF\u30CB\u30AB \u30DA\u30BD",
      symbol: "$",
      jpyPerUnit: 2.56947,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 23.5392,
    gniPerCapitaLCU: 614315,
    consumptionPerCapitaLCU: 438843,
    incomeShareQuintiles: [
      0.0611,
      0.1071,
      0.1542,
      0.2232,
      0.4544
    ],
    urbanShare: 0.724,
    places: [
      {
        nameJa: "\u30B5\u30F3\u30C8\u30C9\u30DF\u30F3\u30B4",
        urban: true,
        share: 0.2172,
        incomeIndex: 1.31
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.5069,
        incomeIndex: 1.03
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.2759,
        incomeIndex: 0.7
      }
    ],
    lifeExpectancy: {
      male: 70.5,
      female: 77
    },
    under5MortalityPer1000: 31.5,
    tfr: 2.24,
    meanAgeFirstMarriage: {
      male: 24.8,
      female: 21.5
    },
    secondaryNetEnrollment: 0.706,
    tertiaryGrossEnrollment: 0.577,
    tertiaryAnnualCostShareOfGni: 0.14,
    unemploymentRate: 0.053,
    informalEmploymentShare: 0.53504,
    pensionCoverage: 0.076,
    pensionReplacementRate: 0.655,
    outOfPocketHealthShare: 0.251,
    effectiveTaxRateAvgWorker: 0.145,
    rentShareOfIncome: 0.181375211164,
    housePriceToIncome: 13.7,
    disasterRisk: 0.5,
    remittanceShareGdp: 0.0913,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2013"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2014"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/DOM/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "COG",
    nameJa: "\u30B3\u30F3\u30B4\u5171\u548C\u56FD",
    major: false,
    incomeGroup: "LMC",
    births: 189400,
    currency: {
      code: "XAF",
      nameJa: "\u4E2D\u592E\u30A2\u30D5\u30EA\u30AB CFA \u30D5\u30E9\u30F3",
      symbol: "FCFA",
      jpyPerUnit: 0.270345,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 231.937,
    gniPerCapitaLCU: 1357580,
    consumptionPerCapitaLCU: 713464,
    incomeShareQuintiles: [
      0.042,
      0.082,
      0.132,
      0.207,
      0.537
    ],
    urbanShare: 0.639,
    places: [
      {
        nameJa: "\u30D6\u30E9\u30B6\u30D3\u30EB",
        urban: true,
        share: 0.1917,
        incomeIndex: 1.59
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.4472,
        incomeIndex: 1.03
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.3611,
        incomeIndex: 0.65
      }
    ],
    lifeExpectancy: {
      male: 64.1,
      female: 67.5
    },
    under5MortalityPer1000: 40.3,
    tfr: 4.16,
    meanAgeFirstMarriage: {
      male: 27.5,
      female: 21.9
    },
    secondaryNetEnrollment: 0.479,
    tertiaryGrossEnrollment: 0.104,
    tertiaryAnnualCostShareOfGni: 0.225,
    unemploymentRate: 0.199,
    informalEmploymentShare: 0.85278,
    pensionCoverage: 0.221,
    pensionReplacementRate: 0.39,
    outOfPocketHealthShare: 0.28,
    effectiveTaxRateAvgWorker: 0.12,
    rentShareOfIncome: 0.180998002662,
    housePriceToIncome: 15,
    disasterRisk: 0.3,
    remittanceShareGdp: 3e-3,
    estimated: [
      "effectiveTaxRateAvgWorker",
      "housePriceToIncome",
      "pensionReplacementRate",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2011; \u4E2D\u7B49\u6559\u80B2\u306F\u524D\u671F\u4E2D\u7B49\u4FEE\u4E86\u7387\u3067\u4EE3\u66FF",
    sources: {
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2011"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2009"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2015"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/COG/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      homicide_rate: {
        source: "UNODC Research Data Portal",
        url: "https://dataunodc.un.org/dp-intentional-homicide-victims",
        year: "2015"
      },
      ipv_past12m_women: {
        source: "DHS Program",
        url: "https://dhsprogram.com/publications/publication-fr253-dhs-final-reports.cfm",
        year: "2011"
      }
    }
  },
  {
    iso3: "ISR",
    nameJa: "\u30A4\u30B9\u30E9\u30A8\u30EB",
    major: false,
    incomeGroup: "HIC",
    births: 183200,
    currency: {
      code: "ILS",
      nameJa: "\u30A4\u30B9\u30E9\u30A8\u30EB\u65B0\u30B7\u30A7\u30B1\u30EB",
      symbol: "\u20AA",
      jpyPerUnit: 50.9503,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 3.60798,
    gniPerCapitaLCU: 199483,
    consumptionPerCapitaLCU: 97436.7,
    incomeShareQuintiles: [
      0.052,
      0.108,
      0.166,
      0.239,
      0.435
    ],
    urbanShare: 0.915,
    places: [
      {
        nameJa: "\u30C6\u30EB\u30A2\u30D3\u30D6",
        urban: true,
        share: 0.2746,
        incomeIndex: 1.08
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.6408,
        incomeIndex: 0.99
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.0846,
        incomeIndex: 0.81
      }
    ],
    lifeExpectancy: {
      male: 81,
      female: 85.5
    },
    under5MortalityPer1000: 3.4,
    tfr: 2.85,
    meanAgeFirstMarriage: {
      male: 29.2,
      female: 26.2
    },
    secondaryNetEnrollment: 0.986,
    tertiaryGrossEnrollment: 0.563,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.036,
    informalEmploymentShare: 0.229,
    pensionCoverage: 1,
    pensionReplacementRate: 0.428,
    outOfPocketHealthShare: 0.205,
    effectiveTaxRateAvgWorker: 0.21432677,
    rentShareOfIncome: 0.202968822725,
    housePriceToIncome: 11.1,
    disasterRisk: 0.3,
    remittanceShareGdp: 18e-4,
    estimated: [
      "informalEmploymentShare",
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2022",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=ISR&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2022"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2016"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/ISR/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  },
  {
    iso3: "CHL",
    nameJa: "\u30C1\u30EA",
    major: false,
    incomeGroup: "HIC",
    births: 176200,
    currency: {
      code: "CLP",
      nameJa: "\u30C1\u30EA \u30DA\u30BD",
      symbol: "$",
      jpyPerUnit: 0.161129,
      asOf: "2026-10-22"
    },
    pppPerIntlDollar: 464.876,
    gniPerCapitaLCU: 14984500,
    consumptionPerCapitaLCU: 9161740,
    incomeShareQuintiles: [
      0.0581,
      0.0991,
      0.1401,
      0.2032,
      0.4995
    ],
    urbanShare: 0.89,
    places: [
      {
        nameJa: "\u30B5\u30F3\u30C6\u30A3\u30A2\u30B4",
        urban: true,
        share: 0.267,
        incomeIndex: 1.09
      },
      {
        nameJa: "\u305D\u306E\u4ED6\u306E\u90FD\u5E02",
        urban: true,
        share: 0.623,
        incomeIndex: 1
      },
      {
        nameJa: "\u8FB2\u6751\u90E8",
        urban: false,
        share: 0.11,
        incomeIndex: 0.81
      }
    ],
    lifeExpectancy: {
      male: 79.2,
      female: 83.1
    },
    under5MortalityPer1000: 6.9,
    tfr: 1.17,
    meanAgeFirstMarriage: {
      male: 29.3,
      female: 27.4
    },
    secondaryNetEnrollment: 0.887,
    tertiaryGrossEnrollment: 1,
    tertiaryAnnualCostShareOfGni: 0.155,
    unemploymentRate: 0.087,
    informalEmploymentShare: 0.26368,
    pensionCoverage: 0.716,
    pensionReplacementRate: 0.497,
    outOfPocketHealthShare: 0.346,
    effectiveTaxRateAvgWorker: 0.07111488,
    rentShareOfIncome: 0.135776920276,
    housePriceToIncome: 15.6,
    disasterRisk: 0.5,
    remittanceShareGdp: 3e-4,
    estimated: [
      "places",
      "tertiaryAnnualCostShareOfGni"
    ],
    notes: "GNI2024/\u6D88\u8CBB2024/PPP2024(PA.NUS.PRVT.PP); \u4E94\u5206\u4F4D2024; \u9AD8\u7B49\u6559\u80B2\u7DCF\u5C31\u5B66\u7387110%\u30921.0\u306B\u4E38\u3081",
    sources: {
      ipv_past12m_women: {
        source: "WHO VAW Prevalence Estimates 2018",
        url: "https://vaw-data.srhr.org/api/chart1?violence_type=ipv&countries=CHL&age_group=15_49&violence_time=past_year&region_class=&region=",
        year: "2018"
      },
      pension_coverage: {
        source: "ILOSTAT SDG indicator 1.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0131_SEX_SOC_RT_A&format=.csv.gz",
        year: "2021"
      },
      informal_employment_share: {
        source: "ILOSTAT SDG indicator 8.3.1",
        url: "https://rplumber.ilo.org/data/indicator?id=SDG_0831_SEX_ECO_RT_A&format=.csv.gz",
        year: "2025"
      },
      smam_male: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      smam_female: {
        source: "UN World Marriage Data 2019",
        url: "https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2019_wmd_marital_status.xlsx",
        year: "2011"
      },
      pension_replacement_rate: {
        source: "OECD Pensions at a Glance 2025 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.ELS.SPD,DSD_PAG@DF_PAG,1.0/.A.GPRR100.....?startPeriod=2024&endPeriod=2024&dimensionAtObservation=AllDimensions",
        year: "2024"
      },
      tax_rate_avg_worker: {
        source: "OECD Taxing Wages 2026 database",
        url: "https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS,DSD_TAX_WAGES_COMP@DF_TW_COMP,/.AV_ITR+AV_R_EMPEE_SSC.PT_WG_EARN_G.S_C0.AW100._Z.A?startPeriod=2025&endPeriod=2025&dimensionAtObservation=AllDimensions",
        year: "2025"
      },
      housing_share_of_consumption: {
        source: "World Bank ICP 2021",
        url: "https://api.worldbank.org/v2/sources/90/country/CHL/series/9060000?format=json&per_page=200",
        year: "2021"
      },
      house_price_to_income: {
        source: "Numbeo Property Prices Index by Country",
        url: "https://www.numbeo.com/property-investment/rankings_by_country.jsp",
        year: "2026"
      }
    }
  }
];

// src/engine/world.ts
var COUNTRIES = countries_default;
var JP = COUNTRIES.find((c) => c.iso3 === "JPN");
var MAJOR = COUNTRIES.filter((c) => c.major);
function pickCountry(seed, mode) {
  if (mode === "j") return JAPAN;
  const r = new Rng(hashStr(`${seed}|country|${mode}`));
  const c = mode === "m" ? r.pick(MAJOR) : r.weighted(COUNTRIES, COUNTRIES.map((x) => x.births));
  return countryData(c.iso3);
}
var cache = /* @__PURE__ */ new Map();
function countryData(iso3) {
  if (iso3 === "JPN") return JAPAN;
  const hit = cache.get(iso3);
  if (hit) return hit;
  const c = COUNTRIES.find((x) => x.iso3 === iso3);
  if (!c) throw new Error(`\u56FD\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ${iso3}`);
  const d = build(c);
  cache.set(iso3, d);
  return d;
}
var EDU_PREMIUM = {
  HIC: { junior_high: 1, high_school: 1, vocational: 1, university: 1, graduate: 1 },
  UMC: { junior_high: 0.85, high_school: 1, vocational: 1.1, university: 1.35, graduate: 1.5 },
  LMC: { junior_high: 0.7, high_school: 1, vocational: 1.15, university: 1.6, graduate: 1.9 },
  LIC: { junior_high: 0.6, high_school: 1, vocational: 1.2, university: 1.9, graduate: 2.3 }
};
var DROPOUT = { HIC: 1, UMC: 1.5, LMC: 2, LIC: 2.6 };
var CANCER = { HIC: 1, UMC: 0.75, LMC: 0.55, LIC: 0.45 };
var clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
var fin = (x, d) => typeof x === "number" && isFinite(x) ? x : d;
function build(c) {
  const k = c.gniPerCapitaLCU / JP.gniPerCapitaLCU;
  const consumptionRatio = clamp(Math.pow(c.consumptionPerCapitaLCU / c.gniPerCapitaLCU / (JP.consumptionPerCapitaLCU / JP.gniPerCapitaLCU), 0.6), 0.75, 1.3);
  const prem = EDU_PREMIUM[c.incomeGroup] ?? EDU_PREMIUM.LMC;
  const J = JAPAN;
  const scale = (o, f) => Object.fromEntries(Object.entries(o).map(([key, v]) => [key, v * f]));
  const regular = {};
  for (const sex of ["male", "female"]) {
    regular[sex] = {};
    for (const edu of Object.keys(J.income.regular[sex])) {
      regular[sex][edu] = J.income.regular[sex][edu].map((v) => v * k * prem[edu]);
    }
  }
  const informal = 1 - 0.3 * c.informalEmploymentShare;
  const income = {
    ageBands: J.income.ageBands,
    regular,
    nonRegular: { male: J.income.nonRegular.male.map((v) => v * k * informal), female: J.income.nonRegular.female.map((v) => v * k * informal) },
    selfEmployedMedianAnnual: J.income.selfEmployedMedianAnnual * k * informal
  };
  const lk = k * consumptionRatio;
  const rentScale = clamp(c.rentShareOfIncome / JP.rentShareOfIncome, 0.5, 2);
  const L = J.living;
  const univYear = c.tertiaryAnnualCostShareOfGni * c.gniPerCapitaLCU;
  const living = {
    singleMonthly: scale(L.singleMonthly, lk),
    familyMonthlyByHeadAge: scale(L.familyMonthlyByHeadAge, lk),
    retiredCoupleMonthly: { expense: L.retiredCoupleMonthly.expense * lk, income: L.retiredCoupleMonthly.income * lk },
    educationCostPerChild: {
      public_total_k_to_hs: L.educationCostPerChild.public_total_k_to_hs * lk * (c.incomeGroup === "LIC" ? 0.7 : 1),
      private_total_k_to_hs: L.educationCostPerChild.private_total_k_to_hs * lk,
      university_national_4y: univYear * 4 * 0.6,
      university_private_4y: univYear * 4 * 1.5
    },
    weddingCost: L.weddingCost * lk,
    childbirthNetCost: L.childbirthNetCost * lk,
    funeralCost: L.funeralCost * lk,
    housePriceNewBuilt: {
      tokyo: L.housePriceNewBuilt.tokyo * k * clamp(c.housePriceToIncome / JP.housePriceToIncome, 0.5, 3),
      national: L.housePriceNewBuilt.national * k * clamp(c.housePriceToIncome / JP.housePriceToIncome, 0.5, 3)
    },
    rentMonthly: { tokyo: 0, osaka: 0, regional_city: L.rentMonthly.regional_city * k * rentScale, rural: 0 }
  };
  const qx = { male: brass(J.lifetable.qx.male, c.lifeExpectancy.male), female: brass(J.lifetable.qx.female, c.lifeExpectancy.female) };
  const poor2 = c.incomeGroup === "LIC" || c.incomeGroup === "LMC";
  const cs = J.lifetable.causeShare;
  const causeShare = poor2 ? {
    under40: cs.under40,
    "40to64": cs["40to64"],
    "65plus": { ...cs["65plus"], senility: (cs["65plus"].senility ?? 0) * 0.3, other: (cs["65plus"].other ?? 0) + (cs["65plus"].senility ?? 0) * 0.7 }
  } : cs;
  const jpTert = Math.max(0.05, JP.tertiaryGrossEnrollment);
  const tertScale = clamp(c.tertiaryGrossEnrollment / jpTert, 0.03, 1.4);
  const E = J.education;
  const education = {
    ...E,
    highSchoolEntryRate: c.secondaryNetEnrollment,
    highSchoolDropoutRate: E.highSchoolDropoutRate * (DROPOUT[c.incomeGroup] ?? 1.5),
    universityDropoutRate: E.universityDropoutRate * (DROPOUT[c.incomeGroup] ?? 1.5),
    universityEntryRate: c.tertiaryGrossEnrollment,
    graduateSchoolEntryRate: E.graduateSchoolEntryRate * tertScale,
    universityEntryByHouseholdIncome: scale(E.universityEntryByHouseholdIncome, tertScale)
  };
  for (const key of Object.keys(education.universityEntryByHouseholdIncome))
    education.universityEntryByHouseholdIncome[key] = Math.min(0.95, education.universityEntryByHouseholdIncome[key]);
  const hhMean = c.consumptionPerCapitaLCU * (2 + Math.min(4, c.tfr)) * 0.95;
  const names = ["\u3068\u3066\u3082\u8CA7\u3057\u3044\u5BB6\u5EAD", "\u8CA7\u3057\u3044\u5BB6\u5EAD", "\u3075\u3064\u3046\u306E\u5BB6\u5EAD", "\u3086\u3068\u308A\u306E\u3042\u308B\u5BB6\u5EAD", "\u88D5\u798F\u306A\u5BB6\u5EAD"];
  const ids = ["low", "lower_mid", "mid", "upper_mid", "high"];
  const q = c.incomeShareQuintiles.length === 5 ? c.incomeShareQuintiles : [0.06, 0.11, 0.16, 0.22, 0.45];
  const means = q.map((s) => s * 5 * hhMean);
  const cur = shortCurrency(c.currency.nameJa);
  const bands = means.map((m, i) => ({
    id: ids[i],
    label: `${names[i]}\uFF08\u5E74\u53CE \u7D04${jaUnits(m)}${cur}\uFF09`,
    min: i === 0 ? 0 : (means[i - 1] + m) / 2,
    max: i === 4 ? m * 2 : (m + means[i + 1]) / 2,
    share: 0.2
  }));
  const PLACE_LABEL = { \u305D\u306E\u4ED6\u306E\u90FD\u5E02: "\u5730\u65B9\u306E\u90FD\u5E02", \u305D\u306E\u4ED6\u306E\u8FB2\u6751\u90E8: "\u307B\u304B\u306E\u5730\u57DF\u306E\u8FB2\u6751" };
  const regions = c.places.map((p, i) => ({
    id: `p${i}`,
    label: PLACE_LABEL[p.nameJa] ?? p.nameJa,
    birthShare: p.share,
    wageIndex: clamp(p.incomeIndex, 0.35, 2.5),
    rentIndex: clamp(p.incomeIndex, 0.35, 2.5),
    disasterRisk: clamp(c.disasterRisk / 0.5, 0.1, 3) * 1.1,
    urban: p.urban
  }));
  const ev = {
    ...J.ev,
    unemploymentRate: c.unemploymentRate,
    layoffAnnual: J.ev.layoffAnnual * clamp(c.unemploymentRate / Math.max(0.01, JP.unemploymentRate), 0.5, 3),
    inheritanceAverage: J.ev.inheritanceAverage * k,
    retirementAllowance: {
      university: J.ev.retirementAllowance.university * k * (c.incomeGroup === "HIC" ? 0.8 : 0.3),
      high_school: J.ev.retirementAllowance.high_school * k * (c.incomeGroup === "HIC" ? 0.8 : 0.3)
    },
    cancerIncidenceByAge: scale(J.ev.cancerIncidenceByAge, CANCER[c.incomeGroup] ?? 0.6),
    birthsPerCouple: c.tfr
  };
  const inst = {
    iso3: c.iso3,
    incomeGroup: c.incomeGroup,
    under5MortalityPer1000: c.under5MortalityPer1000,
    pensionCoverage: clamp(c.pensionCoverage, 0, 1),
    pensionReplacementRate: clamp(fin(c.pensionReplacementRate, 0.4), 0.1, 0.9),
    medicalBurden: clamp(Math.pow(Math.max(0.02, c.outOfPocketHealthShare) / Math.max(0.05, JP.outOfPocketHealthShare), 0.8), 0.6, 3),
    effectiveTaxRate: clamp(fin(c.effectiveTaxRateAvgWorker, 0.15), 0.02, 0.5),
    informalShare: c.informalEmploymentShare,
    marriageAgeShift: {
      male: JP.meanAgeFirstMarriage.male - c.meanAgeFirstMarriage.male,
      female: JP.meanAgeFirstMarriage.female - c.meanAgeFirstMarriage.female
    },
    tfr: c.tfr,
    remittance: c.remittanceShareGdp
  };
  return new CountryData(
    c.iso3,
    c.nameJa,
    { code: c.currency.code, nameJa: cur, symbol: c.currency.symbol, jpyPerUnit: c.currency.jpyPerUnit },
    k,
    income,
    living,
    { lifeExpectancy0: c.lifeExpectancy, qx, causeShare },
    education,
    { incomeBandsWithChildren: bands, regions },
    ev,
    inst
  );
}
function shortCurrency(name) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}
function brass(stdQx, e0) {
  const lStd = [1];
  for (let x = 0; x < stdQx.length; x++) lStd.push(lStd[x] * (1 - Math.min(1, stdQx[x])));
  const logit = (l) => 0.5 * Math.log((1 - l) / l);
  const ys = lStd.map((l) => l <= 0 ? 10 : l >= 1 ? -10 : logit(l));
  const lxOf = (alpha) => ys.map((y, i) => i === 0 ? 1 : 1 / (1 + Math.exp(2 * (alpha + y))));
  const e0Of = (lx2) => lx2.slice(1).reduce((s, l, i) => s + (lx2[i] + l) / 2, 0);
  let lo = -3;
  let hi = 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (e0Of(lxOf(mid)) > e0) lo = mid;
    else hi = mid;
  }
  const lx = lxOf((lo + hi) / 2);
  return stdQx.map((_, x) => lx[x] > 0 ? clamp(1 - lx[x + 1] / lx[x], 0, 1) : 1);
}

// src/engine/types.ts
var EXPENSE_LABEL = {
  tax: "\u7A0E\u91D1\u30FB\u793E\u4F1A\u4FDD\u967A",
  food: "\u98DF\u8CBB",
  housing: "\u4F4F\u307E\u3044",
  utilities: "\u5149\u71B1\u30FB\u901A\u4FE1",
  kids: "\u5B50\u80B2\u3066\u30FB\u6559\u80B2",
  selfEdu: "\u81EA\u5206\u306E\u5B66\u8CBB",
  medical: "\u533B\u7642",
  care: "\u4ECB\u8B77",
  car: "\u8ECA\u30FB\u4EA4\u901A",
  fun: "\u8DA3\u5473\u30FB\u4EA4\u969B",
  events: "\u51A0\u5A5A\u846C\u796D\u30FB\u81E8\u6642",
  love: "\u604B\u611B\u30FB\u7D50\u5A5A",
  inflation: "\u7269\u4FA1\u3067\u6D88\u3048\u305F\u8CAF\u91D1",
  other: "\u305D\u306E\u4ED6\u306E\u751F\u6D3B\u8CBB"
};

// src/engine/result.ts
var CODEC_VERSION = "14";
function picksOf(l) {
  return l.choiceLog.flatMap((c) => c.alloc ? [c.alloc.save, c.alloc.invest, c.alloc.family, c.alloc.self] : [c.pickIndex ?? 0]);
}
function encodeResult(l) {
  const picks = picksOf(l).join("");
  return l.heir ? `${l.heir.code}~${l.heir.idx}.${picks}` : `${CODEC_VERSION}.${l.mode}.${l.seed}.${picks}`;
}
function decodeResult(code) {
  const m = /^(\d+)\.([jmw])\.([A-Za-z0-9-]{1,40})\.([0-9]{0,240})((?:~\d\.[0-9]{0,240}){0,2})$/.exec(code.trim());
  if (!m || m[1] !== CODEC_VERSION) return null;
  const next = m[5].split("~").slice(1).map((x) => {
    const [i, p] = x.split(".");
    return { idx: Number(i), picks: [...p].map(Number) };
  });
  return { mode: m[2], seed: m[3], picks: [...m[4]].map(Number), next };
}
function childOf(l, idx) {
  const k = l.kids[idx];
  const gen = (l.heir?.gen ?? 1) + 1;
  const sex = kidFemale(l.seed, idx) ? "female" : "male";
  const parentIdx = l.sex === "male" ? 0 : 1;
  const ages = [0, 0];
  ages[parentIdx] = k.born;
  ages[parentIdx === 0 ? 1 : 0] = Math.max(18, k.otherAge ?? k.born + (parentIdx === 0 ? -2 : 2));
  const died = k.otherSince !== void 0 ? l.partnerDeaths[k.otherSince] : void 0;
  const together = !!l.partner && l.partner.alive && l.partnerSince === k.otherSince;
  const rec = l.records.find((y) => y.age === k.born);
  const hh = rec ? (rec.income.salary ?? 0) + (rec.income.partner ?? 0) : 0;
  const bands = l.D.household.incomeBandsWithChildren;
  const band = bands.find((b) => hh >= b.min && hh < b.max) ?? (hh < bands[0].min ? bands[0] : bands[bands.length - 1]);
  const n = Math.max(1, l.kids.length);
  const total = l.balance;
  const home = Math.max(0, Math.min(l.homeValue, total));
  const s = l.summary();
  const lineage = [
    ...l.heir?.lineage ?? [],
    { gen: gen - 1, sex: l.sex, birthYear: l.birthYear, deathAge: l.age, region: l.region.label, earned: s.incomeTotal.salary ?? 0, left: s.finalBalance }
  ];
  const h = {
    gen,
    idx,
    code: encodeResult(l),
    nth: ["\u7B2C\u4E00\u5B50", "\u7B2C\u4E8C\u5B50", "\u7B2C\u4E09\u5B50", "\u7B2C\u56DB\u5B50", "\u7B2C\u4E94\u5B50"][idx] ?? "\u5B50\u3069\u3082",
    sex,
    regionId: l.region.id,
    bandId: band.id,
    parentAges: ages,
    parentIdx,
    parentDies: l.age - k.born,
    otherDies: died !== void 0 ? died - k.born : null,
    otherSafeUntil: together ? l.age - k.born + 1 : 0,
    sibs: l.kids.map((o, j) => ({ sex: kidFemale(l.seed, j) ? "female" : "male", born: o.born - k.born })).filter((_, j) => j !== idx),
    estate: Math.max(0, total - home) / n,
    debt: Math.max(0, -total) / n,
    // 前の代が教育にお金をかけた子は、勉強の得意さが少し上がる（家計の教育費と進学の統計にもとづく、ゆるい効き目）
    eduBoost: Math.min(0.12, (k.eduSpend ?? 0) / l.y(3e6) * 0.1),
    homeShare: home / n,
    hadHome: l.homeValue > 0,
    lineage
  };
  return new Life(`${l.seed}k${idx}`, l.D, l.mode, l.birthYear + k.born, h);
}
function newLife(seed, mode) {
  return new Life(seed, pickCountry(seed, mode), mode);
}
function replayByIndex(seed, picks, mode = "j") {
  return playPicks(newLife(seed, mode), picks);
}
function replayCode(d) {
  let l = replayByIndex(d.seed, d.picks, d.mode);
  for (const n of d.next) {
    if (!l.kids[n.idx]) return null;
    l = playPicks(childOf(l, n.idx), n.picks);
  }
  return l;
}
function playPicks(l, picks) {
  let i = 0;
  let guard = 0;
  while (!l.dead && guard++ < 500) {
    if (l.pending?.alloc) {
      const [save, invest, family, self] = [picks[i++] ?? 0, picks[i++] ?? 0, picks[i++] ?? 0, picks[i++] ?? 0];
      l.chooseAlloc({ living: 0, save, invest, family, self });
      continue;
    }
    if (l.pending) {
      const idx = Math.min(picks[i++] ?? 0, l.pending.options.length - 1);
      l.choose(l.pending.options[idx].id);
      continue;
    }
    l.advance();
  }
  return l;
}
function dateOf(seed, year, stream) {
  const r = streamRng(seed, stream, 0);
  const m = r.int(1, 12);
  const d = r.int(1, [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]);
  return `${year}\u5E74${m}\u6708${d}\u65E5`;
}
function stampOf(balance, k = 1) {
  balance /= k;
  if (balance < -3e6) return { text: "\u8D64\u5B57\u9589\u5E97", tone: "gray" };
  if (balance < 5e6) return { text: "\u4EBA\u751F\u5B8C\u6E08", tone: "red" };
  if (balance < 2e7) return { text: "\u30AE\u30EA\u30AE\u30EA\u9ED2\u5B57", tone: "blue" };
  if (balance < 1e8) return { text: "\u8001\u5F8C\u5B89\u6CF0", tone: "green" };
  return { text: "\u5927\u9ED2\u5B57\u5FA1\u793C", tone: "gold" };
}
function memoFor(l, cat, amount) {
  const s = l.summary();
  const ev = l.records.flatMap((y) => y.events);
  const has = (t) => ev.some((e) => e.text.includes(t));
  switch (cat) {
    case "tax":
      return l.D.toJpy(amount) > 8e7 ? "\u56FD\u306B\u306F\u305A\u3044\u3076\u3093\u8CA2\u732E\u3057\u305F" : "\u7D66\u6599\u304B\u3089\u6BCE\u6708\u3001\u9759\u304B\u306B\u5F15\u304B\u308C\u305F";
    case "housing":
      if (has("\u4F4F\u5B85\u30ED\u30FC\u30F3\u3092\u5B8C\u6E08")) return "35\u5E74\u30ED\u30FC\u30F3\u3001\u5B8C\u6E08";
      if (s.ownsHome) return l.loan > 0 ? "\u30ED\u30FC\u30F3\u306F\u9014\u4E2D\u306E\u307E\u307E" : "\u30DE\u30A4\u30DB\u30FC\u30E0";
      if (l.coLiveParents || l.home === "parents" || has("\u5B9F\u5BB6\u306B\u623B\u3063\u305F") || has("\u5B9F\u5BB6\u306B\u79FB\u308A\u4F4F\u3093\u3060")) return "\u5B9F\u5BB6\u306B\u52A9\u3051\u3089\u308C\u305F";
      return "\u5BB6\u8CC3\u3092\u6255\u3044\u7D9A\u3051\u305F";
    case "kids":
      return s.kids > 0 ? `\u5B50\u3069\u3082${s.kids}\u4EBA\u5206\u306E\u6559\u80B2\u3068\u66AE\u3089\u3057` : "\u2014";
    case "food":
      return "\u6BCE\u65E5\u306E\u3054\u306F\u3093";
    case "utilities":
      return "\u96FB\u6C17\u30FB\u30AC\u30B9\u30FB\u6C34\u9053";
    case "car":
      return l.region.id === "tokyo" || !l.D.isJapan && l.region.urban ? "\u96FB\u8ECA\u30FB\u30D0\u30B9\u3068\u30B9\u30DE\u30DB\u4EE3" : "\u8ECA\u306F\u66AE\u3089\u3057\u306E\u8DB3";
    case "medical":
      return has("\u304C\u3093") ? "\u304C\u3093\u6CBB\u7642\u3092\u542B\u3080" : has("\u5165\u9662") ? "\u5165\u9662\u3082\u7D4C\u9A13\u3057\u305F" : "\u901A\u9662\u3068\u85AC";
    case "care":
      return has("\u8981\u4ECB\u8B77") && !l.choiceLog.some((c) => c.id === "parentCare" && ["facility", "home", "liveIn", "quit", "share"].includes(c.optionId)) ? "\u81EA\u5206\u306E\u4ECB\u8B77\u30B5\u30FC\u30D3\u30B9" : "\u89AA\u306E\u4ECB\u8B77\u3068\u3001\u81EA\u5206\u306E\u4ECB\u8B77";
    case "fun":
      return l.lottery ? "\u5B9D\u304F\u3058\u4EE3\u3092\u542B\u3080" : "\u8DA3\u5473\u3068\u4ED8\u304D\u5408\u3044";
    case "events":
      return has("\u707D\u5BB3") || has("\u5730\u9707") ? "\u707D\u5BB3\u306E\u4FEE\u7406\u3092\u542B\u3080" : "\u304A\u795D\u3044\u3084\u304A\u846C\u5F0F\u306A\u3069";
    case "selfEdu":
      return l.choiceLog.some((c) => /loan|night/.test(c.optionId)) ? "\u5968\u5B66\u91D1\u3068\u5B66\u8CBB" : "\u5B66\u3073\u76F4\u3057\u306E\u8CBB\u7528";
    case "love": {
      const wed = has("\u7D50\u5A5A\u5F0F\u3092\u6319\u3052\u305F");
      const pay = has("\u6301\u53C2\u91D1") || has("\u5A5A\u8CC7");
      return [has("\u4ED8\u304D\u5408\u3044\u306F\u3058\u3081\u305F") ? "\u30C7\u30FC\u30C8\u4EE3" : "", wed ? "\u7D50\u5A5A\u5F0F" : "", pay ? "\u6301\u53C2\u91D1\u30FB\u5A5A\u8CC7" : ""].filter(Boolean).join("\u3068") || "\u51FA\u4F1A\u3044\u3068\u7D50\u5A5A";
    }
    case "inflation": {
      const spells = ev.filter((e) => e.text.includes("\u5B9F\u969B\u306B\u8A18\u9332\u3055\u308C\u305F\u4E0A\u6607\u7387")).length;
      return spells > 0 ? `\u7269\u4FA1\u306E\u9AD8\u9A30${spells}\u56DE\u3002\u50CD\u3044\u3066\u3082\u6B8B\u3089\u306A\u3044` : "\u7269\u4FA1\u304C\u4E0A\u304C\u308A\u3001\u5C11\u3057\u305A\u3064\u76EE\u6E1B\u308A";
    }
    case "other":
      return "\u670D\u30FB\u5BB6\u5177\u30FB\u65E5\u7528\u54C1";
  }
}
function buildReceipt(l, withCohort = true) {
  const s = l.summary();
  const c = withCohort ? cohort(l.D) : { income: [], balance: [], lives: [] };
  const order = ["housing", "food", "tax", "kids", "car", "fun", "other", "utilities", "medical", "care", "selfEdu", "events", "love", "inflation"];
  const items = order.map((k) => ({ label: EXPENSE_LABEL[k], amount: Math.round(s.expenseTotal[k] ?? 0), memo: memoFor(l, k, s.expenseTotal[k] ?? 0) })).filter((it) => l.D.toJpy(it.amount) >= 1e4).sort((a, b) => b.amount - a.amount);
  const subtotal = items.reduce((t, i) => t + i.amount, 0);
  const inv = Math.round(s.incomeTotal.invest ?? 0);
  const depositLines = [
    { label: "\u672C\u4EBA\u306E\u7A3C\u304E", amount: Math.round(s.incomeTotal.salary ?? 0) },
    { label: "\u30D1\u30FC\u30C8\u30CA\u30FC\u306E\u7A3C\u304E", amount: Math.round(s.incomeTotal.partner ?? 0) },
    { label: "\u5E74\u91D1\u30FB\u9000\u8077\u91D1", amount: Math.round(s.incomeTotal.pension ?? 0) },
    { label: l.inherited < 0 ? "\u89AA\u304B\u3089\u53D7\u3051\u7D99\u3044\u3060\u501F\u91D1" : "\u89AA\u304B\u3089\u53D7\u3051\u7D99\u3044\u3060\u304A\u91D1", amount: Math.round(l.inherited) },
    { label: "\u624B\u5F53\u30FB\u76F8\u7D9A\u30FB\u81E8\u6642", amount: Math.round((s.incomeTotal.windfall ?? 0) - l.inherited) },
    { label: "\u904B\u7528\u640D\u76CA", amount: inv }
    // 親から受け継いだお金・借金は、少なくても行を残す（子どもに生まれ直したことが分かるように）
  ].filter((d) => Math.abs(l.D.toJpy(d.amount)) >= 1e4 || d.label.startsWith("\u89AA\u304B\u3089\u53D7\u3051\u7D99\u3044\u3060") && Math.abs(d.amount) >= 1);
  const sexWord = s.sex === "male" ? "\u7537\u6027" : "\u5973\u6027";
  return {
    receiptNo: s.seed.toUpperCase(),
    visitDate: dateOf(s.seed, s.birthYear, "visit"),
    closeDate: dateOf(s.seed, s.birthYear + s.deathAge, "close"),
    customer: l.D.isJapan ? `${s.regionLabel}\u751F\u307E\u308C\u30FB${sexWord}\u30FB\u5BB6\u5EAD${s.familyBandLabel.replace("\u5E74\u53CE", "")}` : `${l.D.nameJa}\u30FB${s.regionLabel}\u751F\u307E\u308C\u30FB${sexWord}\u30FB${s.familyBandLabel.replace(/（.*$/, "")}`,
    items,
    subtotal,
    deposit: Math.round(s.lifetimeIncome + inv),
    depositLines,
    change: s.finalBalance,
    rankIncome: rankOf(c.income, s.lifetimeIncome),
    rankBalance: rankOf(c.balance, s.finalBalance),
    cohortSize: c.income.length,
    stamp: stampOf(s.finalBalance, l.D.k),
    currency: l.D.currency,
    countryName: l.D.nameJa,
    lifetimeIncome: Math.round(s.incomeTotal.salary ?? 0),
    deathLine: `${s.deathAge}\u6B73\u3067\u9589\u5E97\uFF08${s.deathCause}\uFF09`,
    closing: "\u307E\u305F\u306E\u3054\u6765\u5E97\u306F\u3001\u3054\u3056\u3044\u307E\u305B\u3093\u3002",
    generation: l.heir?.gen ?? 1,
    generationLabel: l.heir ? `${l.heir.gen}\u4EE3\u76EE\uFF08${l.heir.gen - 1}\u4EE3\u76EE\u306E${l.heir.nth}\uFF09` : "",
    lineage: l.heir ? [
      ...l.heir.lineage,
      { gen: l.heir.gen, sex: l.sex, birthYear: l.birthYear, deathAge: s.deathAge, region: s.regionLabel, earned: s.incomeTotal.salary ?? 0, left: s.finalBalance }
    ].map((e) => ({
      gen: e.gen,
      sex: e.sex === "male" ? "\u7537\u6027" : "\u5973\u6027",
      years: `${e.birthYear}\u301C${e.birthYear + e.deathAge}`,
      earnedJpy: l.D.toJpy(e.earned),
      leftJpy: l.D.toJpy(e.left)
    })) : []
  };
}
var SHARE_TEXT = "\u3042\u306A\u305F\u306F\u3069\u3053\u3067\u304A\u91D1\u3092\u4F7F\u3046\uFF1F #\u4EBA\u751F\u306E\u30EC\u30B7\u30FC\u30C8";
function lifetimeIncomeJpy(d) {
  return d.lifetimeIncome * d.currency.jpyPerUnit;
}
function shareText(d) {
  if (!d) return SHARE_TEXT;
  const who = d.generation > 1 ? `${d.countryName}\u306B\u751F\u307E\u308C\u305F${d.generation}\u4EE3\u76EE\u3002` : `${d.countryName}\u306B\u751F\u307E\u308C\u3001`;
  return `${who}\u751F\u6DAF\u3067\u7A3C\u3044\u3060\u304A\u91D1\u306F\u7D04${yen2(lifetimeIncomeJpy(d))}\u3002${SHARE_TEXT}`;
}

// src/server/og.ts
function receiptOf(code) {
  const d = decodeResult(code);
  if (!d) return null;
  try {
    const l = replayCode(d);
    if (!l || !l.records.length) return null;
    return buildReceipt(l, false);
  } catch {
    return null;
  }
}
var esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function shareHtml(code, origin) {
  const d = receiptOf(code);
  const detail = `${origin}/r.html#${code}`;
  const title = d ? `\u4EBA\u751F\u306E\u30EC\u30B7\u30FC\u30C8\uFF5C${d.countryName}\u306B\u751F\u307E\u308C\u305F\u4EBA\u751F` : "\u4EBA\u751F\u306E\u30EC\u30B7\u30FC\u30C8";
  const desc = d ? shareText(d) : SHARE_TEXT;
  const img = d ? `${origin}/api/og?c=${encodeURIComponent(code)}` : `${origin}/og.png`;
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="\u4EBA\u751F\u306E\u30EC\u30B7\u30FC\u30C8" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(`${origin}/s/${code}`)}" />
<meta property="og:image" content="${esc(img)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${esc(img)}" />
<meta http-equiv="refresh" content="0; url=${esc(detail)}" />
<link rel="canonical" href="${esc(detail)}" />
<script>location.replace(${JSON.stringify(detail)});</script>
</head>
<body><p><a href="${esc(detail)}">\u4EBA\u751F\u306E\u30EC\u30B7\u30FC\u30C8\u3092\u898B\u308B</a></p></body>
</html>`;
}

// src/server/api-share.ts
function handler(req, res) {
  const code = decodeURIComponent(new URL(req.url ?? "/", "http://x").searchParams.get("c") ?? "");
  const host = String(req.headers["x-forwarded-host"] ?? req.headers.host ?? "jinsei-receipt.vercel.app");
  const proto = String(req.headers["x-forwarded-proto"] ?? "https");
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=31536000");
  res.end(shareHtml(code, `${proto}://${host}`));
}
export {
  handler as default
};
