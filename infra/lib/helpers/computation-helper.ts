import { Construct } from 'constructs';
import * as aws_core from '@aws-solutions-constructs/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';

export interface EndpointDefinition {
  /**
   * Endpoint name. It is compulsory.
   *
   *    */
  endpointName: string;
  /**
   * The service that will be accessed through the interface endpoint.
   *
   *    */
  endpointInterfaceService?: ec2.InterfaceVpcEndpointAwsService;
}

/**
 * @description Adds interface endpoint for service.
 * @return void
 */
export function AddAwsServiceEndpoint(
  scope: Construct,
  vpc: ec2.IVpc,
  interfaceTag: string,
  endpointName: string,
  endpointInterfaceService?: ec2.InterfaceVpcEndpointAwsService
): void {
  const service = {
    endpointName: endpointName,
    endpointInterfaceService: endpointInterfaceService,
  } as EndpointDefinition;

  AddInterfaceEndpoint(scope, vpc, service, interfaceTag);
  return;
}

/**
 * @description checks if an endpoint already exists in a VPC
 * @return void
 */
export function CheckIfEndpointAlreadyExists(
  vpc: ec2.IVpc,
  interfaceTag: string
): boolean {
  return vpc.node.children.some((child) => child.node.id === interfaceTag);
}

/**
 * @description Adds an interface endpoint for a given AWS service in a VPC passed as parameter.
 * @return void
 */
export function AddInterfaceEndpoint(
  scope: Construct,
  vpc: ec2.IVpc,
  service: EndpointDefinition,
  interfaceTag: string
): void {
  const endpointDefaultSecurityGroup = aws_core.buildSecurityGroup(
    scope,
    `${scope.node.id}-${service.endpointName}`,
    {
      vpc,
      allowAllOutbound: true,
    },
    [
      {
        peer: ec2.Peer.ipv4(vpc.vpcCidrBlock),
        connection: ec2.Port.tcp(443),
      },
    ],
    []
  );

  vpc.addInterfaceEndpoint(interfaceTag, {
    service:
      service.endpointInterfaceService as ec2.InterfaceVpcEndpointAwsService,
    securityGroups: [endpointDefaultSecurityGroup],
  });
}

/**
 * @description Establishes a relation between a specific Lambda Function and a DocDB cluster, both services passed as parameters.
 * @return void
 */
export function lambdaToDocDBRelation(
  lambda: cdk.aws_lambda.Function,
  docDBCluster: cdk.aws_docdb.DatabaseCluster
): void {
  lambda.addEnvironment(
    'SM_SECRET_ARN',
    docDBCluster.secret?.secretArn ? docDBCluster.secret?.secretArn : ''
  );
  lambda.addEnvironment(
    'DOC_DB_ENDPOINT_PORT',
    docDBCluster.clusterEndpoint.portAsString()
  );
  lambda.addEnvironment(
    'DOC_DB_ENDPOINT_ADDRESS',
    docDBCluster.clusterEndpoint.hostname
  );
  lambda.addEnvironment(
    'DOC_DB_ENDPOINT_SOCKET_ADDRESS',
    docDBCluster.clusterEndpoint.socketAddress
  );
}

/**
 * @description Establishes a relation between a specific Lambda Function and a State Machine, both services passed as parameters.
 * @return void
 */
export function lambdaToStateMachineRelation(
  scope: Construct,
  lambda: cdk.aws_lambda.Function,
  stateMachine: cdk.aws_stepfunctions.StateMachine,
  vpc: ec2.IVpc
): void {
  stateMachine.grantStartExecution(lambda);
  lambda.addEnvironment('STATE_MACHINE_ARN', stateMachine.stateMachineArn);

  AddAwsServiceEndpoint(
    scope,
    vpc,
    'SF',
    'SF',
    ec2.InterfaceVpcEndpointAwsService.STEP_FUNCTIONS
  );
}

/**
 * @description Establishes a relation between a specific Lambda Function and a Aurora cluster, both services passed as parameters.
 * @return void
 */
export function lambdaToRdsRelation(
  scope: Construct,
  lambda: cdk.aws_lambda.Function,
  rdsCluster: [cdk.aws_rds.ServerlessCluster, cdk.aws_secretsmanager.ISecret],
  vpc: ec2.IVpc
): void {
  let auroraCluster = rdsCluster[0];
  let secret = rdsCluster[1];

  lambda.addEnvironment('dbClusterArn', auroraCluster.clusterArn);
  lambda.addEnvironment('secretArn', secret.secretArn);

  // AddAwsServiceEndpoint(
  //   scope,
  //   vpc,
  //   'RDS',
  //   'RDS',
  //   ec2.InterfaceVpcEndpointAwsService.RDS
  // );

  auroraCluster.grantDataApiAccess(lambda);
  secret.grantRead(lambda);
}

/**
 * @description Establishes a relation between a specific Lambda Function and a DynamoDB Table, both services passed as parameters.
 * @return void
 */
export function lambdaToDynamoRelation(
  lambda: cdk.aws_lambda.Function,
  dynamo: cdk.aws_dynamodb.Table
): void {
  lambda.addEnvironment('TABLE_NAME', dynamo.tableName);
  dynamo.grantFullAccess(lambda);
}

/**
 * @description Establishes a relation between a specific Lambda Function and a S3 Bucket, both services passed as parameters.
 * @return void
 */
export function lambdaToS3Relation(
  lambda: cdk.aws_lambda.Function,
  s3Bucket: cdk.aws_s3.IBucket
): void {
  lambda.addEnvironment('S3_BUCKET_NAME', s3Bucket.bucketName);
  s3Bucket.grantReadWrite(lambda);
}

/**
 * @description Establishes a relation between a specific Lambda Function and a SQS Queue, both services passed as parameters.
 * @return void
 */
export function lambdaToSQSRelation(
  lambda: cdk.aws_lambda.Function,
  sqsQueue: cdk.aws_sqs.Queue
): void {
  lambda.addEnvironment('SQS_QUEUE_URL', sqsQueue.queueUrl);
  sqsQueue.grantSendMessages(lambda);
  sqsQueue.grantConsumeMessages(lambda);
  sqsQueue.grantPurge(lambda);
}
