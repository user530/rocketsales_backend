import { Injectable } from '@nestjs/common';
import { Contact, JoinedContact, JoinedLeads, JoinedResponsible, JoinedStatus, Lead, Status, User } from 'src/types';

interface IEntitiesManipulationService {
    leadsToRelationIds(leads: Lead[]): Record<'statusIds' | 'responsibleIds' | 'contactIds', string[]>;
    joinEntities(leads: Lead[], statuses: Status[], responsible: User[], contacts: Contact[]): JoinedLeads[];
}

@Injectable()
export class EntitiesManipulationService implements IEntitiesManipulationService {
    leadsToRelationIds(leads: Lead[]): Record<'statusIds' | 'responsibleIds' | 'contactIds', string[]> {
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
    }

    joinEntities(leads: Lead[], statuses: Status[], responsible: User[], contacts: Contact[]): JoinedLeads[] {
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
    }

    private statusToJoined({ name, color }: Status): JoinedStatus {
        return {
            name,
            color,
        };
    }

    private responsibleToJoined({ name }: User): JoinedResponsible {
        return {
            name,
        };
    }

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
                                    contactData['position'] = values[0].value;
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
        );
    }

}
