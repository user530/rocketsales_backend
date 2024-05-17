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
  GetUsersResponse,
  JoinedLeads,
} from './types';

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
    return [];
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

}
