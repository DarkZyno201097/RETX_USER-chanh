import { IRoleOrganization, Organization } from "src/models/organization.model";
import { urls } from ".";
import { baseApi } from "./axios_client";


export function getOne(id: string): Promise<Organization>{
    return baseApi({
        url: urls.getOrganization(id),
        method: 'GET'
    })
}

export function getRoles(): Promise<IRoleOrganization[]>{
    return baseApi({
        url: urls.getRolesOrganization,
        method: 'GET'
    })
}