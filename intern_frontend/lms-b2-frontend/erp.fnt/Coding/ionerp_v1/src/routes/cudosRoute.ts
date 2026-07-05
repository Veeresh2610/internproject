import { Outlet } from "react-router-dom";
import BloomDomainPage from "../pages/ioncudos/configuration/bloomDomain/bloomDomainPage";

/**
 * IonCUDOS Route Configuration
 * Defines navigation structure and routing for CUDOS module (Outcome-Based Education)
 *
 * Phase A - Master Data CRUD Modules:
 * - Bloom's Domain (Cognitive, Affective, Psychomotor)
 */

export const CUDOSROUTE = [
  {
    name: "Configuration",
    href: "/configuration",
    element: Outlet, // Parent route with nested children
    roles: [],
    subItems: [
      {
        name: "Bloom's Domain",
        href: "/configuration/bloom_domain",
        element: BloomDomainPage,
        roles: [],
      },
    ],
  },
];
