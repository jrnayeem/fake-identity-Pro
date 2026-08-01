import { countries as rawCountries } from "@/data/names";

export interface CountryStats {
  code: string;
  name: string;
  flag: string;
  maleNames: number;
  femaleNames: number;
  lastNames: number;
  total: number;
}

export const countries: CountryStats[] = rawCountries.map((c) => ({
  code: c.code,
  name: c.name,
  flag: c.flag,
  maleNames: c.maleNames.length,
  femaleNames: c.femaleNames.length,
  lastNames: c.lastNames.length,
  total: c.maleNames.length + c.femaleNames.length + c.lastNames.length,
}));

export const totalStats = {
  countries: countries.length,
  totalNames: countries.reduce((s, c) => s + c.total, 0),
  totalMale: countries.reduce((s, c) => s + c.maleNames, 0),
  totalFemale: countries.reduce((s, c) => s + c.femaleNames, 0),
  totalLast: countries.reduce((s, c) => s + c.lastNames, 0),
};
