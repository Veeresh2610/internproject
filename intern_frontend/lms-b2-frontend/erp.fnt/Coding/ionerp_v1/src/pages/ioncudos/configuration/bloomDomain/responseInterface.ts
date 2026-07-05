/**
 * Response interface for Bloom's Domain
 * Defines the structure of Bloom's Domain data returned from the API
 */

export interface getBloomDomainList {
  bloom_domain_id: number;
  bloom_domain_name: string;
  bloom_domain_acronym: string;
  bloom_domain_description: string;
  status: number;
  org_id: number;
  create_date: string;
  created_by: number;
  modify_date: string;
  modified_by: number;
}
