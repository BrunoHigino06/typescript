import * as lambda from 'aws-cdk-lib/aws-lambda';
import { ApiGatewayBackL3 } from '@mapfre-mar/cdk-mar-patterns';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';

/**
 * @description Gives permission to each lambda for accessing an API passed as parameter.
 * Teh parameter permissionName must be unique, as lambdas cannot have two permissions with the same name.
 * @return void
 */
export function giveApiPermissionToLambdas(
  lambdas: lambda.Function[] | undefined,
  api: ApiGatewayBackL3,
  permissionName: string
): void {
  if (lambdas) {
    for (let lambda of lambdas) {
      lambda.addPermission(permissionName, {
        principal: new ServicePrincipal('apigateway.amazonaws.com'),
        sourceArn: api.getApiGateway().arnForExecuteApi('*'),
      });
    }
  }
}
