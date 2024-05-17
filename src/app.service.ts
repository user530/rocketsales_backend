import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosHeaders, AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import {
  Contact,
  Lead,
  Status,
  User,
  GetLeadsResponse,
  GetContactsResponse,
  GetPipelinesResponse,
  GetUsersResponse,
  JoinedLeads,
} from './types';
import { URL } from 'url';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
  ) { }

  async getJoinedLeads(): Promise<JoinedLeads[]> {
    const leads: Lead[] = await this.getLeadsWithContacts();
    const { statusIds, responsibleIds, contactIds } = this.leadsToRelationIds(leads);
    const statuses: Status[] = await this.getStatusesByIds(statusIds);
    const responsible: User[] = await this.getResponsiblesByIds(responsibleIds);
    const contacts: Contact[] = await this.getContactsByIds(contactIds);
    const joinedLeads: JoinedLeads[] = this.joinEntities();
    return [];
  }

  private async getLeadsWithContacts(): Promise<Lead[]> {
    try {
      const response = await this.fetchFromAmoApi<GetLeadsResponse>('/leads', 'with=contacts');

      return response._embedded?.leads || [];
    } catch (error) {
      console.error('GetLeadsWithContacts Error!', error);
      throw error;
    }
  };

  private async getStatusesByIds(statusIds: string[]): Promise<Status[]> {
    try {
      // Sadly there is no filtering for the pipelines or statuses
      const response = await this.fetchFromAmoApi<GetPipelinesResponse>('/leads/pipelines');
      let result: Status[] = [];

      const pipelines = response?._embedded?.pipelines ?? [];

      // Iterate over each pipeline and fill the result
      pipelines.forEach(
        (pipeline) => {
          const statuses = pipeline?._embedded?.statuses;

          // Skip pipelines w/o statuses
          if (!statuses) return;
          // Filter statuses that are required
          const required = statuses.filter(status => statusIds.includes(`${status.id}`));

          // Add them to the result
          result = result.concat(required);
        }
      );

      return result;
    } catch (error) {
      console.error('GetStatusesByIds Error!', error);
      throw error;
    }
  };

  private async getResponsiblesByIds(userIds: string[]): Promise<User[]> {
    try {
      // Prepare the filter query
      const filterQuery = this.generateFilterQuery('id', userIds);

      // Fetch required users
      const response = await this.fetchFromAmoApi<GetUsersResponse>('/users', filterQuery);

      return response?._embedded?.users ?? [];
    } catch (error) {
      console.error('GetResponsiblesByIds Error!', error);
      throw error;
    }
  };

  private async getContactsByIds(contactIds: string[]): Promise<Contact[]> {
    return [];
  };

  private leadsToRelationIds(leads: Lead[]):
    Record<'statusIds' | 'responsibleIds' | 'contactIds', string[]> {
    const statusIds = new Set<string>();
    const responsibleIds = new Set<string>();
    const contactIds = new Set<string>();

    // Iterate over leads array once and collect ids of all related entities
    leads.forEach(
      ({ status_id, responsible_user_id, _embedded }) => {
        statusIds.add(`${status_id}`);
        responsibleIds.add(`${responsible_user_id}`);
        _embedded?.contacts?.forEach(contact => contactIds.add(`${contact.id}`));
      });

    return {
      statusIds: Array.from(statusIds),
      responsibleIds: Array.from(responsibleIds),
      contactIds: Array.from(contactIds),
    };
  };

  private joinEntities(): JoinedLeads[] {
    return [];
  };

  private async fetchFromAmoApi<T>(
    endpoint: string,
    queryString?: string,
    baseURL: string = process.env.AMOCRM_API_URL,
  ): Promise<T> {
    try {
      // Construct URL
      const url = new URL(baseURL + endpoint);

      // Add query params if needed
      if (queryString)
        url.search = queryString;

      // Header with JWT token
      const header: RawAxiosRequestHeaders = { Authorization: `Bearer ${process.env.AMOCRM_API_TOKEN}` };

      const response = await axios.get<T>(url.toString(), { headers: header });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch from amoCRM!');
      throw error;
    }
  };

  private generateFilterQuery(param: string, valuesToFilter: string[]): string {
    return valuesToFilter.reduce<string>((filterStr, value) => filterStr += `&filter[${[param]}]=${value}`, '');
  }
}
