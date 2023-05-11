import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';

var path = require('path');

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);  
        
    // Log group for the API access logs
    const accessLogGroup = new logs.LogGroup(this, "app-accessLogs", {
      logGroupName: "pypefy-api-access-logs",
      retention: 90,
    });

    // Api key used for the api gateway autentication
    const apiKey = new apigw.ApiKey(this, 'ApiKey', {
      description: 'API Key for my LambdaRestApis',
      enabled: true,
    });

    // Lambda for the export tech process    
    const MapfreAwsfnPipefyRelatorioExportTechProcess = new lambda.Function(this, 'MapfreAwsfnPipefyRelatorioExportTechProcess', {
      code: lambda.Code.fromAsset(path.join(__dirname, "./src", "/MapfreAwsfnPipefyRelatorioExportTechProcess")),
      functionName: "Mapfre-Awsfn-Pipefy-Relatorio-Export-Tech-Process",
      handler: 'lambda_function.lambda_handler',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    });

    // Rest Api create for the MapfreAwsfnPipefyRelatorioExportTechProcess lambda function
    const restApi = new apigw.LambdaRestApi(this, 'MapfreAwsfnPipefyRelatorioExportTechProcessApi', {
      handler: MapfreAwsfnPipefyRelatorioExportTechProcess,
      proxy: true,
      defaultMethodOptions: {
        authorizationType: apigw.AuthorizationType.API_KEY,
        apiKey: apiKey,
      },
      deployOptions: {
        stageName: 'prod',
        accessLogDestination: new apigw.LogGroupLogDestination(accessLogGroup),
        accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: apigw.MethodLoggingLevel.INFO
      },
    });

    // Dependence to create the Api Key before the Lambda rest API
    restApi.node.addDependency(apiKey)

    // WAF ACL to the Rest API's 
    const webACL = new wafv2.CfnWebACL(this, 'webACL', {
      name: 'webACL',
      description: 'This is WebACL for Auth APi Gateway',
      scope: 'REGIONAL',
      defaultAction: { block: {} }, 
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'webACL',
        sampledRequestsEnabled: true,
      },
    
      rules: [],
    });

    // Association the WebACL with the Rest Api
    const webACLAssociation = new wafv2.CfnWebACLAssociation(this, 'webACLAssociation', {
      webAclArn: webACL.attrArn, // Web ACL ARN from above
      // For an Amazon API Gateway REST API: arn:aws:apigateway:region::/restapis/api-id/stages/stage-name
      resourceArn: restApi.deploymentStage.stageArn,
    });
    
    // make sure api gateway is deployed before web ACL association
    webACLAssociation.node.addDependency(restApi)

    // MapfreAwsfnPipefyValFatAuxCargaAsIs Lambda function
    const MapfreAwsfnPipefyValFatAuxCargaAsIs = new lambda.Function(this, 'MapfreAwsfnPipefyValFatAuxCargaAsIs', {
      code: lambda.Code.fromAsset(path.join(__dirname, "./src", "/MapfreAwsfnPipefyValFatAuxCargaAsIs")),
      functionName: "Mapfre-Awsfn-Pipefy-Val-Fat-Aux-Carga-As-Is",
      handler: 'lambda_function.lambda_handler',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    });

    // Rest API for the MapfreAwsfnPipefyValFatAuxCargaAsIs Lambda Function
    const restapi1 = new apigw.LambdaRestApi(this, 'MapfreAwsfnPipefyValFatAuxCargaAsIsApi', {
      handler: MapfreAwsfnPipefyValFatAuxCargaAsIs,
      defaultMethodOptions: {
        authorizationType: apigw.AuthorizationType.API_KEY,
        apiKey: apiKey,
      },
      deployOptions: {
        accessLogDestination: new apigw.LogGroupLogDestination(accessLogGroup),
        accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: apigw.MethodLoggingLevel.INFO
      },
    });

    // Dependence to create the Api Key before the Lambda rest API
    restapi1.node.addDependency(apiKey)

    // Association the WebACL with the Rest Api
    const webACLAssociation1 = new wafv2.CfnWebACLAssociation(this, 'webACLAssociation1', {
      webAclArn: webACL.attrArn, // Web ACL ARN from above
      // For an Amazon API Gateway REST API: arn:aws:apigateway:region::/restapis/api-id/stages/stage-name
      resourceArn: restapi1.deploymentStage.stageArn,
    });
    
    // Association the WebACL with the Rest Api
    webACLAssociation1.node.addDependency(restapi1)

    const MapfreAwsfnPipefyValFatStatusSap = new lambda.Function(this, 'MapfreAwsfnPipefyValFatStatusSap', {
      code: lambda.Code.fromAsset(path.join(__dirname, "./src", "/MapfreAwsfnPipefyValFatStatusSap")),
      functionName: "Mapfre-Awsfn-Pipefy-Val-Fat-Status-Sap",
      handler: 'lambda_function.lambda_handler',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    });

    const restapi2 = new apigw.LambdaRestApi(this, 'MapfreAwsfnPipefyValFatStatusSapApi', {
      handler: MapfreAwsfnPipefyValFatStatusSap,
      defaultMethodOptions: {
        authorizationType: apigw.AuthorizationType.API_KEY,
        apiKey: apiKey,
      },
      deployOptions: {
        accessLogDestination: new apigw.LogGroupLogDestination(accessLogGroup),
        accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: apigw.MethodLoggingLevel.INFO
      },
    });

    // Dependence to create the Api Key before the Lambda rest API
    restapi2.node.addDependency(apiKey)

    // Association the WebACL with the Rest Api
    const webACLAssociation2 = new wafv2.CfnWebACLAssociation(this, 'webACLAssociation2', {
      webAclArn: webACL.attrArn, // Web ACL ARN from above
      // For an Amazon API Gateway REST API: arn:aws:apigateway:region::/restapis/api-id/stages/stage-name
      resourceArn: restapi2.deploymentStage.stageArn,
    });
    
    // Association the WebACL with the Rest Api
    webACLAssociation2.node.addDependency(restapi2)

    const MapfreAwsfnPipefyValFaturamentoChecagemAuto = new lambda.Function(this, 'MapfreAwsfnPipefyValFaturamentoChecagemAuto', {
      code: lambda.Code.fromAsset(path.join(__dirname, "./src", "/MapfreAwsfnPipefyValFaturamentoChecagemAuto")),
      functionName: "Mapfre-Awsfn-Pipefy-Val-Faturamento-Checagem-Auto",
      handler: 'lambda_function.lambda_handler',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    });

    const restapi3 = new apigw.LambdaRestApi(this, 'MapfreAwsfnPipefyValFaturamentoChecagemAutoApi', {
      handler: MapfreAwsfnPipefyValFaturamentoChecagemAuto,
      defaultMethodOptions: {
        authorizationType: apigw.AuthorizationType.API_KEY,
        apiKey: apiKey,
      },
      deployOptions: {
        accessLogDestination: new apigw.LogGroupLogDestination(accessLogGroup),
        accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: apigw.MethodLoggingLevel.INFO
      },
    });

    // Dependence to create the Api Key before the Lambda rest API
    restapi3.node.addDependency(apiKey)

    // Association the WebACL with the Rest Api
    const webACLAssociation3 = new wafv2.CfnWebACLAssociation(this, 'webACLAssociation3', {
      webAclArn: webACL.attrArn, // Web ACL ARN from above
      // For an Amazon API Gateway REST API: arn:aws:apigateway:region::/restapis/api-id/stages/stage-name
      resourceArn: restapi3.deploymentStage.stageArn,
    });
    
    // Association the WebACL with the Rest Api
    webACLAssociation3.node.addDependency(restapi3)

    const MapfreAwsfnPipefyValFaturamentoGeralKitCsn = new lambda.Function(this, 'MapfreAwsfnPipefyValFaturamentoGeralKitCsn', {
      code: lambda.Code.fromAsset(path.join(__dirname, "./src", "/MapfreAwsfnPipefyValFaturamentoGeralKitCsn")),
      functionName: "Mapfre-Awsfn-Pipefy-Val-Faturamento-Geral-Kit-Csn",
      handler: 'lambda_function.lambda_handler',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    });

    const restapi4 = new apigw.LambdaRestApi(this, 'MapfreAwsfnPipefyValFaturamentoGeralKitCsnApi', {
      handler: MapfreAwsfnPipefyValFaturamentoGeralKitCsn,
      defaultMethodOptions: {
        authorizationType: apigw.AuthorizationType.API_KEY,
        apiKey: apiKey,
      },
      deployOptions: {
        accessLogDestination: new apigw.LogGroupLogDestination(accessLogGroup),
        accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: apigw.MethodLoggingLevel.INFO
      },
    });

    // Dependence to create the Api Key before the Lambda rest API
    restapi4.node.addDependency(apiKey)

    // Association the WebACL with the Rest Api
    const webACLAssociation4 = new wafv2.CfnWebACLAssociation(this, 'webACLAssociation4', {
      webAclArn: webACL.attrArn, // Web ACL ARN from above
      // For an Amazon API Gateway REST API: arn:aws:apigateway:region::/restapis/api-id/stages/stage-name
      resourceArn: restapi4.deploymentStage.stageArn,
    });
    
    // Association the WebACL with the Rest Api
    webACLAssociation4.node.addDependency(restapi4)

    const MapfreAwsfnPipefyValFaturamentoTratativaCsn = new lambda.Function(this, 'MapfreAwsfnPipefyValFaturamentoTratativaCsn', {
      code: lambda.Code.fromAsset(path.join(__dirname, "./src", "/MapfreAwsfnPipefyValFaturamentoTratativaCsn")),
      functionName: "Mapfre-Awsfn-Pipefy-Val-Faturamento-Tratativa-Csn",
      handler: 'lambda_function.lambda_handler',
      memorySize: 512,
      runtime: lambda.Runtime.PYTHON_3_9,
    });

    const restapi5 = new apigw.LambdaRestApi(this, 'MapfreAwsfnPipefyValFaturamentoTratativaCsnApi', {
      handler: MapfreAwsfnPipefyValFaturamentoTratativaCsn,
      defaultMethodOptions: {
        authorizationType: apigw.AuthorizationType.API_KEY,
        apiKey: apiKey,
      },
      deployOptions: {
        accessLogDestination: new apigw.LogGroupLogDestination(accessLogGroup),
        accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: apigw.MethodLoggingLevel.INFO
      },
    });

    // Dependence to create the Api Key before the Lambda rest API
    restapi5.node.addDependency(apiKey)

    // Association the WebACL with the Rest Api
    const webACLAssociation5 = new wafv2.CfnWebACLAssociation(this, 'webACLAssociation5', {
      webAclArn: webACL.attrArn, // Web ACL ARN from above
      // For an Amazon API Gateway REST API: arn:aws:apigateway:region::/restapis/api-id/stages/stage-name
      resourceArn: restapi5.deploymentStage.stageArn,
    });
    
    // Association the WebACL with the Rest Api
    webACLAssociation5.node.addDependency(restapi5)
    
  }
}