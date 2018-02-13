import { GraphQLFieldResolver, GraphQLResolveInfo } from "graphql";

import { ComposableResolver } from "./composable.resolver";
import { AuthUser } from "../../interfaces/AuthUserInterface";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";

export const authResolver: ComposableResolver<any, ResolverContext> =
  (resolver: GraphQLFieldResolver<any, ResolverContext>): GraphQLFieldResolver<any, ResolverContext> => {
    return (parent, args, context: ResolverContext, info: GraphQLResolveInfo) => {
      if (context.authUser || context.authorization) {
        return resolver(parent, args, context, info);
      }
      throw new Error(`Unauthorized! Token not provided!`);
    }
  }