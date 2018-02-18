import { GraphQLFieldResolver, GraphQLResolveInfo } from "graphql";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";
import { ComposableResolver } from "./composable.resolver";

export const simpleComposableResolver: ComposableResolver<any, ResolverContext> =
  (resolver: GraphQLFieldResolver<any, ResolverContext>) => {
    return (parent, args, context: ResolverContext, info: GraphQLResolveInfo) => {
      return resolver(parent, args, context, info);
    }
  }
