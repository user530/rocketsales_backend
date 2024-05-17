import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { RawAxiosRequestHeaders } from 'axios';
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
} from '../../types';
import { URL } from 'url';
import { EntitiesManipulationService } from '../entities-manipulation/entities-manipulation.service';

interface IApiService {
  getJoinedLeads(): Promise<JoinedLeads[]>
}

@Injectable()
export class ApiService implements IApiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly entitiesManipulationService: EntitiesManipulationService,
  ) { }

  async getJoinedLeads(): Promise<JoinedLeads[]> {
    try {
      // Fetch all leads
      const leads: Lead[] = await this.getLeadsWithContacts();

      // Collect relation ids for required entities
      const { statusIds, responsibleIds, contactIds } = this.entitiesManipulationService.leadsToRelationIds(leads);

      // Fetch related statuses 
      const statuses: Status[] = await this.getStatusesByIds(statusIds);

      // Fetch related responsible users
      const responsible: User[] = await this.getResponsiblesByIds(responsibleIds);

      // Fetch related contacts
      const contacts: Contact[] = await this.getContactsByIds(contactIds);

      // Join related entities and leads and transform them
      const joinedLeads: JoinedLeads[] = this.entitiesManipulationService.joinEntities(leads, statuses, responsible, contacts);

      return joinedLeads;
    } catch (error) {
      console.error('Failed to obtain joined leads!');
      throw new InternalServerErrorException('Something went wrong during fetch! Please try again later.');
    }
  }

  private async getLeadsWithContacts(): Promise<Lead[]> {
    try {
      // Fetch leads with contacts
      const response = await this.fetchFromAmoApi<GetLeadsResponse>('/leads', 'with=contacts');

      return response._embedded?.leads || [];
    } catch (error) {
      console.error('GetLeadsWithContacts Error!', error);
      throw error;
    }
  }

  private async getStatusesByIds(statusIds: string[]): Promise<Status[]> {
    try {
      // Sadly there is no filtering for the pipelines or statuses so we fetch all pipelines
      const response = await this.fetchFromAmoApi<GetPipelinesResponse>('/leads/pipelines');

      // Prepare result variable
      let result: Status[] = [];

      // Try to extract all pipelines
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
  }

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
  }

  private async getContactsByIds(contactIds: string[]): Promise<Contact[]> {
    try {
      // Prepare the filter query
      const filterQuery = this.generateFilterQuery('id', contactIds);

      // Fetch required contacts
      const response = await this.fetchFromAmoApi<GetContactsResponse>('/contacts', filterQuery);

      return response?._embedded?.contacts ?? [];
    } catch (error) {
      console.error('GetContactsByIds Error!', error);
      throw error;
    }
  }

  private async fetchFromAmoApi<T>(
    endpoint: string,
    queryString?: string,
    baseURL: string = this.configService.get('AMOCRM_API_URL'),
  ): Promise<T> {
    try {
      // Construct URL
      const url = new URL(baseURL + endpoint);

      // Add query params if needed
      if (queryString)
        url.search = queryString;

      // Header with JWT token
      const header: RawAxiosRequestHeaders = { Authorization: `Bearer ${this.configService.get('AMOCRM_API_TOKEN')}` };

      // Fetch request data providing auth token along
      const response = await axios.get<T>(url.toString(), { headers: header });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch from amoCRM!');
      throw error;
    }
  }

  private generateFilterQuery(param: string, valuesToFilter: string[]): string {
    return valuesToFilter.reduce<string>(
      // Structure filter query from array of value for provided param
      (filterStr, value, ind) => filterStr += `&filter[${[param]}][${ind}]=${value}`,
      ''
    );
  }

}
