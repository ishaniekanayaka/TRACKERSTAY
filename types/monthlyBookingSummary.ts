export interface MonthlyBookingSummaryResponse {
  labels: string[];      // ["Dec", "Jan", "Feb", ...]
  earned: number[];      // completed / earned amounts
  upcoming: number[];    // upcoming amounts
  selected: string;      // "Feb"
}
