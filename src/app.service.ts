import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  Contact,
  Lead,
  Status,
  User,
  GetLeadsResponse,
  GetContactsResponse,
  GetPipelinesResponse,
  GetUsersResponse
} from './types';

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
  ) { }

  async fetchLeads(query?: Record<string, string>) {
    const leads = await this.getLeads(query);

    // Prepare containers
    const responsibleIds = new Set<number>();
    const pipelineIds = new Set<number>();
    const statusIds = new Set<number>();
    const contactIds = new Set<number>();

    // Iterate over leads and collect required data
    leads.forEach(
      ({ responsible_user_id, pipeline_id, status_id, _embedded: { contacts } }) => {
        // Store the data in the associated set
        responsibleIds.add(responsible_user_id);
        pipelineIds.add(pipeline_id);
        statusIds.add(status_id);
        // Add each contact in the contacts array
        contacts.forEach(contact => contactIds.add(contact.id));
      }
    )

    console.log('Responsible IDs'); console.log(responsibleIds);
    console.log('Pipelines IDs'); console.log(pipelineIds);
    console.log('Contact IDs'); console.log(contactIds);
    console.log('Status IDs'); console.log(statusIds);

    const responsibleUsers = await this.getResponsible(Array.from(responsibleIds));

    const contacts = await this.getContacts(Array.from(contactIds));

    return leads;
  }

  async getLeads(query?: Record<string, string>): Promise<Lead[]> {
    const url = new URL(`${this.configService.get<string>('AMOCRM_API_URL')}/api/v4/leads`);

    // Add 'with=contacts' param by default
    url.searchParams.append('with', 'contacts');

    // Add query params
    if (query) {
      Object
        .keys(query)
        .forEach(paramName => url.searchParams.append(paramName, query[paramName]));
    }

    try {
      // Fetch leads adding token
      const response = await axios.get<GetLeadsResponse>(
        url.toString(),
        {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('AMOCRM_API_TOKEN')}`,
          },
        }
      );

      // Return empty object if there is no content (?)
      if (response.status === 204)
        return [];

      return response.data._embedded.leads;
    } catch (error) {
      console.error('Failed to fetch leads from the amoCRM', error);
      throw new Error('Failed to fetch leads');
    }
  }

  async getStatuses(): Promise<Status[]> {
    // Fetch pipelines and statuses
    return [];
  }

  async getResponsible(responsibleIds: number[]): Promise<User[]> {
    // Fetch all users
    return [];
  }

  async getContacts(contactIds: number[]): Promise<Contact[]> {
    // Fetch all contacts
    return [];
  }
}
