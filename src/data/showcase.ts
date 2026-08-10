/* Placeholder content used to demonstrate visual patterns only. */

import type { CreatorCardData } from "@/components/entities/creator-card";

/** Design-only samples that follow the real creator profile structure. */
export type CreatorSample = CreatorCardData & { id: string };

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
    username: "amaraboateng",
    name: "Amara Boateng",
    headline: "Documentary photographer & visual storyteller",
    primaryCategory: "Photographer",
    location: "Accra, Ghana",
    availability: "available",
  },
  {
    id: "c2",
    username: "iliasmarchetti",
    name: "Ilias Marchetti",
    headline: "Producer | Sound design & scoring for film",
    primaryCategory: "Producer",
    location: "Lisbon, Portugal",
    availability: "limited",
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
