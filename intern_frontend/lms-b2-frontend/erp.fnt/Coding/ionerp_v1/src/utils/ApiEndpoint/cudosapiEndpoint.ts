/**
 * API Endpoint Configuration for IonCUDOS Module
 * Central location for all CUDOS-related API endpoints
 */

export const ApiEndpoint = {
  // Common master delete endpoint (shared across modules)
  master_soft_delete: "comman_function/soft_delete",

  // Bloom's Domain specific endpoints
  bloomDomain: {
    save_bloom_domain: "bloom_domain/save_bloom_domain", // Create/Update Bloom's Domain
    bloom_domain_list: "comman_function/bloom_domain_list", // Fetch all Bloom's Domains
  },

  // Bloom's Level specific endpoints (for future implementation)
  bloomLevel: {
    save_bloom_level: "bloom_level/save_bloom_level",
    bloom_level_list: "comman_function/bloom_level_list",
  },

  // Additional CUDOS endpoints can be added here
  // Example:
  // programOutcome: {
  //   save_program_outcome: "program_outcome/save_program_outcome",
  //   program_outcome_list: "comman_function/program_outcome_list",
  // },
} as const;
