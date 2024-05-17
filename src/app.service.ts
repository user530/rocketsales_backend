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
      const res = await this.fetchFromAmoApi<GetLeadsResponse>('/leads', 'with=contacts');

      return res._embedded?.leads || [];
    } catch (error) {
      console.error('GetLeadsWithContacts Error!', error);
      throw error;
    }
  };

  private async getStatusesByIds(statusIds: string[]): Promise<Status[]> {
    return [];
  };

  private async getResponsiblesByIds(userIds: string[]): Promise<User[]> {
    return [];
  };

  private async getContactsByIds(contactIds: string[]): Promise<Contact[]> {
    return [];
  };

  private leadsToRelationIds(leads: Lead[]): Record<'statusIds' | 'responsibleIds' | 'contactIds', string[]> {
    return {
      statusIds: [],
      responsibleIds: [],
      contactIds: [],
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
  }
}
