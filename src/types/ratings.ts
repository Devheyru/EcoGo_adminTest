// Define the type for a single Rating object
export interface Rating {
  id: number;
  ratedBy: string;
  ratedFor: string;
  rating: number; // The score out of 5
  ratedOn: string; // The date and time string
}
