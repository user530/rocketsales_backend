interface WithId {
    id: number;
};

interface WithName {
    name: string;
};

interface RestLink {
    href: string;
};

interface WithPage {
    _page: number;
};

interface WithLinks {
    _links: {
        self: RestLink;
        [key: string]: RestLink;
    }
};

interface WithEmbedded<T> {
    _embedded: T;
};

interface EmbedLeads {
    leads: Lead[];
};

interface EmbedTags {
    tags: Tag[];
};

interface EmbedCompanies {
    companies: CompanyRef[];
};

interface EmbedContacts {
    contacts: ContactRef[];
};

// Placeholder embeds
interface EmbedCatalogElements {
    catalog_elements?: CatalogElementRef[];
};

interface EmbedLossReasons {
    loss_reason?: LossReasonRef[];
};

// Embeded object bundles
interface EmbedTagsCompanies extends EmbedTags, EmbedCompanies { };
interface EmbedTagsCompaniesContactsCatalogLosses extends
    EmbedTagsCompanies,
    EmbedContacts,
    EmbedCatalogElements,
    EmbedLossReasons { };

// Referenced entities
interface Ref extends WithId, WithLinks { };

interface Tag extends WithId, WithName {
    color: string | null;
};

interface ContactRef extends Ref {
    is_main: boolean;
};

interface CompanyRef extends Ref { };

// Placeholder for future updates
interface CatalogElementRef { };
interface LossReasonRef { };


// Entities
export interface Lead extends WithId, WithName, WithLinks, WithEmbedded<EmbedTagsCompaniesContactsCatalogLosses> {
    price: number;
    responsible_user_id: number;
    group_id: number;
    status_id: number;
    pipeline_id: number;
    loss_reason_id: number | null;
    source_id?: number | null;
    created_by: number;
    updated_by: number;
    created_at: number;
    updated_at: number;
    closed_at: number | null;
    closest_task_at: number | null;
    is_deleted: boolean;
    custom_fields_values: any[] | null;
    score: number | null;
    account_id: number;
    labor_cost: null;
    is_price_modified_by_robot?: boolean | null;
    is_price_computed?: boolean | null;
};

export interface Contact extends WithId, WithName, WithLinks, WithEmbedded<EmbedTagsCompanies> {
    first_name: string;
    last_name: string;
    responsible_user_id: number;
    group_id: number;
    created_by: number;
    updated_by: number;
    created_at: number;
    updated_at: number;
    closest_task_at: number | null;
    is_deleted: boolean;
    is_unsorted: boolean;
    account_id: number;
    custom_fields_values: CustomField[];
};

// Custom properties
interface CustomField {
    field_id: number;
    field_name: string;
    field_code: string;
    field_type: string;
    values: CustomFieldValue[];
};

interface CustomFieldValue {
    value: string;
    enum_id: number;
    enum_code: string;
};

// Get ALl Response body
interface GeneralResponse extends WithPage, WithLinks { };
export interface GeneralLeadsResponse extends GeneralResponse, WithEmbedded<EmbedLeads> { };