import { Injectable } from '@nestjs/common';
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
  JoinedStatus,
  JoinedResponsible,
  JoinedContact,
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
    const joinedLeads: JoinedLeads[] = this.joinEntities(leads, statuses, responsible, contacts);

    return joinedLeads;
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

  private joinEntities(
    leads: Lead[],
    statuses: Status[],
    responsible: User[],
    contacts: Contact[]
  ):
    JoinedLeads[] {
    return leads.map(
      ({ name, price, created_at, status_id, responsible_user_id, _embedded }) => {
        // Find required status and responsible user
        const leadStatus = statuses.find(status => status.id === status_id);
        const leadResponsible = responsible.find(user => user.id === responsible_user_id);
        // Collect required contacts if any exist
        const leadContacts = _embedded && _embedded.contacts
          ? _embedded.contacts.map(
            ({ id }) => contacts.find(contact => contact.id === id)
          )
          : [];

        return {
          name,
          price,
          created_at,
          status: this.statusToJoined(leadStatus),
          responsible: this.responsibleToJoined(leadResponsible),
          contacts: this.contactsToJoined(leadContacts),
        };
      }
    );
  };

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

      const response = await axios.get<T>(url.toString(), { headers: header });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch from amoCRM!');
      throw error;
    }
  };

  private generateFilterQuery(param: string, valuesToFilter: string[]): string {
    return valuesToFilter.reduce<string>((filterStr, value, ind) => filterStr += `&filter[${[param]}][${ind}]=${value}`, '');
  };

  private statusToJoined({ name, color }: Status): JoinedStatus {
    return {
      name,
      color,
    };
  };

  private responsibleToJoined({ name }: User): JoinedResponsible {
    return {
      name,
    };
  };

  private contactsToJoined(contacts: Contact[]): JoinedContact[] {
    return contacts.map(
      ({ name, custom_fields_values }) => {
        // Prepare contact data object for optional fields
        const contactData: Omit<JoinedContact, 'name'> = {};

        // Check and populate if there are contact data
        if (custom_fields_values) {
          custom_fields_values.forEach(
            ({ field_code, values }) => {
              switch (field_code) {
                case 'PHONE': {
                  contactData['phone'] = values[0].value;
                  break;
                }
                case 'EMAIL': {
                  contactData['email'] = values[0].value;
                  break;
                }
                case 'POSITION': {
                  contactData['phone'] = values[0].value;
                  break;
                }
              }
            }
          )
        };

        return {
          name,
          ...contactData,
        };
      }
    )
  };
}
