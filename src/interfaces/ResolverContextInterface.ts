import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";
import { DbConnetion } from "./DbConnectionInterface";
import { RequestedFields } from "../graphql/ast/RequestedFields";

export interface ResolverContext {
  db?: DbConnetion;
  authorization?: string;
  authUser?: AuthUser;
  dataloaders?: DataLoaders;
  requestedFields?: RequestedFields;
}
