const dayjs = require("dayjs");

const calculateCompositeRank = averageRank => {
  if (0 < averageRank && averageRank <= 1.8) {
    return 1;
  } else if (1.81 <= averageRank && averageRank <= 2.6) {
    return 2;
  } else if (2.61 <= averageRank && averageRank <= 3.4) {
    return 3;
  } else if (3.41 <= averageRank && averageRank <= 4.2) {
    return 4;
  } else if (4.21 <= averageRank && averageRank <= 5) {
    return 5;
  } else {
    return 5;
  }
};

const finalRankMatrix = [
  [
    { rank: 1, comment: "" },
    { rank: 1, comment: "" },
    { rank: 1, comment: "" },
    { rank: 1, comment: "" },
    {
      rank: 1,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan semesteran"
    }
  ],
  [
    { rank: 1, comment: "" },
    { rank: 2, comment: "" },
    { rank: 2, comment: "" },
    {
      rank: 2,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan semesteran"
    },
    {
      rank: 2,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan triwulanan"
    }
  ],
  [
    { rank: 2, comment: "" },
    { rank: 2, comment: "" },
    {
      rank: 3,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan semesteran"
    },
    {
      rank: 3,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan triwulanan"
    },
    {
      rank: 3,
      comment: "kaji ulang menyeluruh, rencana tindak dilaporkan triwulanan"
    }
  ],
  [
    { rank: 2, comment: "" },
    {
      rank: 3,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan triwulanan"
    },
    {
      rank: 4,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan triwulanan"
    },
    {
      rank: 4,
      comment: "kaji ulang menyeluruh, rencana tindak dilaporkan triwulanan"
    },
    {
      rank: 4,
      comment: "kaji ulang menyeluruh, rencana tindak dilaporkan bulanan"
    }
  ],
  [
    {
      rank: 3,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan triwulanan"
    },
    {
      rank: 3,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan bulanan"
    },
    {
      rank: 4,
      comment: "kaji ulang terbatas, rencana tindak dilaporkan bulanan"
    },
    {
      rank: 5,
      comment: "kaji ulang menyeluruh, rencana tindak dilaporkan bulanan"
    },
    {
      rank: 5,
      comment:
        "pengawasan melekat, membutuhkan pemantauan secara lebih mendalam"
    }
  ]
];
const calculateFinalRank = (riskInherentRank, KPMRRank) => {
  riskInherentRank = parseInt(riskInherentRank);
  KPMRRank = parseInt(KPMRRank);
  // console.log({ riskInherentRank, KPMRRank });
  return finalRankMatrix[riskInherentRank - 1][KPMRRank - 1];
};

const filterObligatoryRiskTypes = (
  allRiskTypes,
  allRiskProfileObligationRules,
  riskProfile
) => {
  // console.log({ allRiskTypes, allRiskProfileObligationRules, riskProfile });
  const matchRules = allRiskProfileObligationRules.filter(rule => {
    for (const criteria of rule.criteria) {
      // console.log(criteria.condition, criteria.value, riskProfile.coreCapital);
      if (criteria.condition === "Sebelum Tanggal") {
        let riskProfilePeriod = dayjs(
          new Date(
            riskProfile.year,
            riskProfile.semester === "Genap" ? 11 : 5,
            1
          )
        );
        if (dayjs().isAfter(riskProfilePeriod)) {
          return false;
        }
      } else if (criteria.condition === "Sesudah Tanggal") {
        let riskProfilePeriod = dayjs(
          new Date(
            riskProfile.year,
            riskProfile.semester === "Genap" ? 11 : 5,
            1
          )
        );
        if (dayjs().isBefore(riskProfilePeriod)) {
          return false;
        }
      } else if (
        criteria.condition === "Modal Inti Kurang Dari" &&
        riskProfile.coreCapital >= parseFloat(criteria.value)
      ) {
        return false;
      } else if (
        criteria.condition === "Modal Inti Paling Sedikit Sebanyak" &&
        riskProfile.coreCapital < parseFloat(criteria.value)
      ) {
        return false;
      } else if (
        criteria.condition === "Memiliki Kantor Cabang Kurang Dari" &&
        riskProfile.countBranchOffices >= parseInt(criteria.value)
      ) {
        return false;
      } else if (
        criteria.condition === "Memiliki Kantor Cabang Paling Sedikit" &&
        riskProfile.countBranchOffices < parseInt(criteria.value)
      ) {
        return false;
      } else if (
        criteria.condition === "Total Aset Kurang Dari" &&
        riskProfile.totalAsset >= parseFloat(criteria.value)
      ) {
        return false;
      } else if (
        criteria.condition === "Total Aset Paling Sedikit Sebanyak" &&
        riskProfile.totalAsset < parseFloat(criteria.value)
      ) {
        return false;
      } else if (
        criteria.condition ===
        "Melakukan kegiatan sebagai penerbit kartu ATM atau kartu debit"
      ) {
        if (criteria.value === "Ya" && riskProfile.isCardIssuer === false) {
          return false;
        } else if (
          criteria.value === "Tidak" &&
          riskProfile.isCardIssuer === true
        ) {
          return false;
        }
      }
    }
    return true;
  });

  // console.log({ matchRules });
  if (matchRules.length === 0) {
    return [];
  }
  let obligatoryRiskTypes = {};
  const indexedRiskTypes = allRiskTypes.reduce((all, type) => {
    all[type._id] = type;
    return all;
  }, {});
  for (const rule of matchRules) {
    for (const riskTypeId of rule.obligatoryRiskTypeIds) {
      if (!indexedRiskTypes[riskTypeId]) {
        continue;
      }
      if (!obligatoryRiskTypes[riskTypeId]) {
        obligatoryRiskTypes[riskTypeId] = indexedRiskTypes[riskTypeId];
      }
    }
  }
  // console.log(Object.values(obligatoryRiskTypes));
  return Object.values(obligatoryRiskTypes);
};

module.exports = {
  calculateCompositeRank,
  calculateFinalRank,
  filterObligatoryRiskTypes
};
