export const donationStats = [
  {
    id: "monthly",
    label: "ការបរិច្ចាគប្រចាំខែ",
    value: "$2,000",
    growth: "+15%",
    note: "ក្នុងខែនេះ",
    variant: "blue",
  },
  {
    id: "donors",
    label: "អ្នកបរិច្ចាគសរុប",
    value: "200 នាក់",
    growth: "+10%",
    note: "ក្នុងខែនេះ",
    variant: "amber",
  },
];

export const donationRows = [
  { id: 1, month: "មករា", year: "២០២៦", branch: "ក្រចេះ", monthlyRiel: "៛ 340,000", monthlyUsd: "$470", total: "$545" },
  { id: 2, month: "មីនា", year: "២០២៦", branch: "តាកែវ", monthlyRiel: "៛ 500,000", monthlyUsd: "$500", total: "$625" },
  { id: 3, month: "មករា", year: "២០២៦", branch: "កណ្ដាល", monthlyRiel: "៛ 200,000", monthlyUsd: "$400", total: "$450" },
  { id: 4, month: "មេសា", year: "២០២៦", branch: "កំពង់ចាម", monthlyRiel: "៛ 300,000", monthlyUsd: "$200", total: "$230" },
  { id: 5, month: "ឧសភា", year: "២០២៦", branch: "ភ្នំពេញ", monthlyRiel: "៛ 500,000", monthlyUsd: "$200", total: "$325" },
  { id: 6, month: "មិថុនា", year: "២០២៦", branch: "សៀមរាប", monthlyRiel: "៛ 400,000", monthlyUsd: "$100", total: "$200" },
  { id: 7, month: "កក្កដា", year: "២០២៥", branch: "បន្ទាយមានជ័យ", monthlyRiel: "៛ 500,000", monthlyUsd: "$200", total: "$325" },
  { id: 8, month: "សីហា", year: "២០២៥", branch: "ក្រចេះ", monthlyRiel: "៛ 400,000", monthlyUsd: "$500", total: "$600" },
  { id: 9, month: "កញ្ញា", year: "២០២៥", branch: "ស្ទឹងត្រែង", monthlyRiel: "៛ 600,000", monthlyUsd: "$400", total: "$550" },
  { id: 10, month: "តុលា", year: "២០២៥", branch: "ភ្នំពេញ", monthlyRiel: "៛ 500,000", monthlyUsd: "$300", total: "$425" },
  { id: 11, month: "វិច្ឆិកា", year: "២០២៥", branch: "កំពង់ស្ពឺ", monthlyRiel: "៛ 200,000", monthlyUsd: "$100", total: "$150" },
  { id: 12, month: "ធ្នូ", year: "២០២៥", branch: "ស្ទឹងត្រែង", monthlyRiel: "៛ 400,000", monthlyUsd: "$200", total: "$300" },
];

const members = [
  ["ឌី រីយ៉ា", "/riya.jpg", "ស្រី", "០៧ កុម្ភៈ ២០០៦"],
  ["តុំ ស៊ីវនាន", "/sivnean.jpg", "ស្រី", "០៧ កុម្ភៈ ២០០៥"],
  ["ជា ជិងជិង", "/ching.jpg", "ស្រី", "១២ មិថុនា ២០០៦"],
  ["យីម ស្រីពៅ", "/sreypov.jpg", "ស្រី", "១៥ មករា ២០០៤"],
  ["សេង គឹមសួរ", "/kimsour.jpg", "ប្រុស", "២១ មីនា ២០០៥"],
  ["ទេព មករា", "/makara.jpg", "ប្រុស", "០៣ មេសា ២០០៣"],
  ["សាធ ប៊ុនថន", "/thorn.jpg", "ប្រុស", "១១ ឧសភា ២០០៦"],
  ["ឈួម ម៉ាលីស", "/malis.jpg", "ស្រី", "២៥ មិថុនា ២០០៥"],
  ["ឆាយ ចន្ថា", "/chantha.jpg", "ស្រី", "០៩ កក្កដា ២០០៦"],
  ["សុធា លីសា", "/lisa.jpg", "ស្រី", "១៧ សីហា ២០០៦"],
  ["ទូច សុគន្ធារ៉ា", "/mazer.jpg", "ស្រី", "២៨ កញ្ញា ២០០៥"],
  ["អេន ច័ន្ទហេង", "/chanheng.jpg", "ស្រី", "០៥ តុលា ២០០៦"],
];

const branchCycle = ["ក្រចេះ", "តាកែវ", "កណ្ដាល", "ភ្នំពេញ", "សៀមរាប", "បាត់ដំបង"];
const monthCycle = ["មករា", "មីនា", "មេសា"];
const paymentCycle = ["Cash", "ABA", "Wing", "Bank Transfer"];

export const addDonationRows = Array.from({ length: 34 }, (_, index) => {
  const member = members[index % members.length];

  return {
    id: index + 1,
    branch: branchCycle[Math.floor(index / 6) % branchCycle.length],
    month: monthCycle[Math.floor(index / 12) % monthCycle.length],
    year: "២០២៦",
    name: member[0],
    avatar: member[1],
    gender: member[2],
    dob: member[3],
    realAmount: "",
    dollarAmount: "",
    paymentMethod: paymentCycle[index % paymentCycle.length],
  };
});
