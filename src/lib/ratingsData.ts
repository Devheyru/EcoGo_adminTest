import { Rating } from "../types/ratings";

// --- HARDCODED DATA INPUT ---
export const allRatings: Rating[] = [
  {
    id: 1,
    ratedBy: "DriverTest",
    ratedFor: "test",
    rating: 5,
    ratedOn: "02/12/2025 12:56",
  },
  {
    id: 2,
    ratedBy: "DriverSam",
    ratedFor: "My Rider",
    rating: 5,
    ratedOn: "02/12/2025 02:18",
  },
  {
    id: 3,
    ratedBy: "DriverTest",
    ratedFor: "test",
    rating: 4,
    ratedOn: "01/12/2025 12:15",
  },
  {
    id: 4,
    ratedBy: "Felon",
    ratedFor: "Paxton",
    rating: 5,
    ratedOn: "28/11/2025 16:43",
  },
  {
    id: 5,
    ratedBy: "RiderX",
    ratedFor: "DriverAlice",
    rating: 3,
    ratedOn: "27/11/2025 10:00",
  },
  {
    id: 6,
    ratedBy: "RiderY",
    ratedFor: "DriverBob",
    rating: 5,
    ratedOn: "26/11/2025 09:10",
  },
  {
    id: 7,
    ratedBy: "RiderZ",
    ratedFor: "DriverCharlie",
    rating: 4,
    ratedOn: "25/11/2025 18:30",
  },
  {
    id: 8,
    ratedBy: "AppUser1",
    ratedFor: "DriverDave",
    rating: 5,
    ratedOn: "24/11/2025 14:05",
  },
  {
    id: 9,
    ratedBy: "AppUser2",
    ratedFor: "DriverEve",
    rating: 4,
    ratedOn: "23/11/2025 21:55",
  },
  {
    id: 10,
    ratedBy: "AppUser3",
    ratedFor: "DriverFrank",
    rating: 5,
    ratedOn: "22/11/2025 07:45",
  },
  {
    id: 11,
    ratedBy: "AppUser4",
    ratedFor: "DriverGrace",
    rating: 3,
    ratedOn: "21/11/2025 11:15",
  },
  {
    id: 12,
    ratedBy: "AppUser5",
    ratedFor: "DriverHeidi",
    rating: 5,
    ratedOn: "20/11/2025 13:20",
  },
  {
    id: 13,
    ratedBy: "AppUser6",
    ratedFor: "DriverIvy",
    rating: 4,
    ratedOn: "19/11/2025 17:00",
  },
  {
    id: 14,
    ratedBy: "DriverTest",
    ratedFor: "test",
    rating: 5,
    ratedOn: "18/11/2025 19:30",
  },
];

export const ROWS_PER_PAGE = 10;
