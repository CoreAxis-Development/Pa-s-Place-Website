export const SITE = {
  name: "Pa's Place",
  tagline: "A Haven for Youth in Kelso, Pennington",
  description:
    "Pa's Place provides a safe, nurturing environment for disadvantaged youth, offering enriching activities, personal growth opportunities, and community support in Pennington, KZN.",
  url: "https://pasplace.co.za",
};

export const CONTACT = {
  email: "info@pasplace.co.za",
  phone: "7 436 5056",
  phoneLink: "+27834365056",
  person: "Luke",
  address: {
    street: "35b Umdoni Road",
    area: "Kelso, Pennington",
    province: "KwaZulu-Natal",
    country: "South Africa",
    full: "35b Umdoni Road, Kelso, Pennington, KZN",
  },
  mapUrl:
    "https://www.google.com/maps/d/u/0/edit?mid=1sgAUvrOYHiKmndi8EFMzghuUgxeYLtw&ll=-30.377096718500717%2C30.696060901428037&z=19",
};

export const SOCIAL = {
  facebook: null,
  instagram: null,
  twitter: null,
  linkedin: null,
};

export const PRICING = {
  accommodation: {
    rate: 200,
    currency: "R",
    unit: "person/night",
    minimum: 4,
    minimumTotal: 800,
  },
  venue: {
    rate: 80,
    currency: "R",
    unit: "person",
    minimum: 10,
    minimumTotal: 800,
    deposit: 500,
  },
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Activities", href: "/services/activities" },
      { label: "Accommodation", href: "/services/accommodation" },
      { label: "Venue Hire", href: "/services/venue" },
    ],
  },
  { label: "Contact", href: "/contact" },
];
