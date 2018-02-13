import * as graphqlFields from 'graphql-fields';
import { difference, union } from 'lodash';
import { GraphQLResolveInfo } from 'graphql';

export class RequestedFields {
  public getFields(
    info: GraphQLResolveInfo,
    options?: { keep?: string[], exclude?: string[]}
  ): string[] {
    let fields = Object.keys(graphqlFields(info));
    if (!options) return fields;
    fields = options.keep ? union(fields, options.keep) : fields;
    return options.exclude ? difference(fields, options.exclude) : fields;
  }
}
