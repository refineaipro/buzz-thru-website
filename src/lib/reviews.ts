export type GoogleReview = {
  name: string;
  date: string;
  text: string;
  rating: number;
};

export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Buzz+Thru+Car+Wash+Richmond+VA";

export const FEATURED_REVIEWS: GoogleReview[] = [
  {
    name: "Paul Dennis",
    date: "8 months ago",
    rating: 5,
    text: "I am impressed by the facility as a first time customer and used the powerwash and new vacuums without any issues. Will be returning as a repeat customer in the near future.",
  },
  {
    name: "Ms Everything",
    date: "5 months ago",
    rating: 5,
    text: "Come on now go wash your car great place. Big and clean, friendly people. Find a best friend I did. I love you Dillon and Cody, no loud music lol. Great place.",
  },
  {
    name: "Bubbles PoPn",
    date: "3 months ago",
    rating: 5,
    text: "When weather is bad I always remember they have hot water spraying that can be used. I have been washing my car here for over 20 years.",
  },
  {
    name: "Tasha Meekins",
    date: "4 years ago",
    rating: 5,
    text: "Very professional! Inexpensive. Great punctuality, quality, professionalism, and value.",
  },
];
