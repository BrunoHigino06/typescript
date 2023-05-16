import { App, Stack, StackProps, Construct } from 'aws-cdk-lib';
import { InstanceType, InstanceClass, InstanceSize } from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class rdsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Use the existing VPC
    const vpcId = 'vpc-08a981858f523642f';

    // Generate a random password
    const randomPassword = Math.random().toString(36).slice(-10); // Generates a 10-character alphanumeric password

    // Create a secret in Secrets Manager
    const secret = new Secret(this, 'RDSSecret', {
      secretName: 'RDSDBPassword',
      generateSecretString: {
        excludePunctuation: true,
        passwordLength: 16, // Specify the desired password length
        includeSpace: false,
        generateStringKey: 'password',
        secretStringTemplate: JSON.stringify({ username: 'admin', password: randomPassword }),
      },
    });

    // Create an RDS instance
    const rdsInstance = new DatabaseInstance(this, 'RDSInstance', {
      engine: DatabaseInstanceEngine.SQL_SERVER_SE, // Specify the desired database engine as SQL Server Standard Edition
      instanceType: InstanceType.of(InstanceClass.BURSTABLE2, InstanceSize.MICRO), // Specify the instance type
      masterUsername: 'admin', // Specify the master username
      masterUserPassword: randomPassword, // Use the generated password
      vpc: vpcId, // Use the existing VPC
      allocatedStorage: 200, // Specify the allocated storage size in GB
      deletionProtection: false, // Set deletion protection to false if desired
    });

    // Output the connection details
    new CfnOutput(this, 'RDSInstanceEndpoint', {
      value: rdsInstance.dbInstanceEndpointAddress,
    });
  }
}