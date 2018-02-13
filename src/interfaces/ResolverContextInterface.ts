import { DbConnetion } from "./DbConnectionInterface";
import { AuthUser } from "./AuthUserInterface";

export interface ResolverContext {
  db?: DbConnetion;
  authorization?: string;
  authUser?: AuthUser;
}