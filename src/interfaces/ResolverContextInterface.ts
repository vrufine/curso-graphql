import { DbConnetion } from "./DbConnectionInterface";
import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";

export interface ResolverContext {
  db?: DbConnetion;
  authorization?: string;
  authUser?: AuthUser;
  dataloaders?: DataLoaders;
}
