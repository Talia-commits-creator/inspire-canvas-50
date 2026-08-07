/* Placeholder content used to demonstrate visual patterns only. */

export type CreatorSample = {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  availability: "Available" | "Limited" | "Booked";
  verified: boolean;
};

export type OrganizationSample = {
  id: string;
  name: string;
  type: string;
  location: string;
  description: string;
  initials: string;
};

export type ProjectSample = {
  id: string;
  title: string;
  category: string;
  owner: string;
  status: "Open" | "In progress" | "Completed";
  description: string;
};

export const CREATOR_SAMPLES: CreatorSample[] = [
  {
    id: "c1",
    name: "Amara Boateng",
    category: "Documentary photography",
    location: "Accra, Ghana",
    description:
      "Long-form photo essays on community, craft and everyday life across West Africa.",
    availability: "Available",
    verified: true,
  },
  {
    id: "c2",
    name: "Ilias Marchetti",
    category: "Sound design & scoring",
    location: "Lisbon, Portugal",
    description: "Original scores and mixes for short film, installation and independent games.",
    availability: "Limited",
    verified: false,
  },
];

export const ORGANIZATION_SAMPLES: OrganizationSample[] = [
  {
    id: "o1",
    name: "Northlight Studio",
    type: "Production studio",
    location: "Manchester, UK",
    description:
      "A cooperative studio commissioning short films and mentoring emerging directors.",
    initials: "NS",
  },
  {
    id: "o2",
    name: "Riverbank Arts Trust",
    type: "Nonprofit",
    location: "Cape Town, South Africa",
    description: "Youth arts programmes, residencies and paid placements for local creators.",
    initials: "RA",
  },
];

export const PROJECT_SAMPLES: ProjectSample[] = [
  {
    id: "p1",
    title: "Harbour Songs",
    category: "Short documentary",
    owner: "Northlight Studio",
    status: "Open",
    description:
      "A six-part portrait series following musicians who rehearse in a working port town.",
  },
  {
    id: "p2",
    title: "Second Light",
    category: "Photography commission",
    owner: "Riverbank Arts Trust",
    status: "In progress",
    description: "Documenting a year of workshops with fifteen first-time photographers.",
  },
];
