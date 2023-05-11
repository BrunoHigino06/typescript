import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { setResourceName } from '../infra/lib/helpers/resource-naming-helper';
import { EnvironmentHelper } from '../infra/lib/helpers/environment-helper';
import * as marAspects from '@mapfre-mar/cdk-mar-aspects';
import { LambdaStack } from '../infra/lib/index';


const app = new cdk.App();

let envHelper = EnvironmentHelper.createInstance(app);

var proppath = '';

proppath = envHelper.getPropertiesPath('/../');
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader(__dirname + proppath);

const appEnv = {
  account: properties.get('env.account').toString(),
  region: properties.get('env.region'),
};
const exclusions = PropertiesReader(
  __dirname + properties.get('aspects.suppressions.path')
);
const tagging = PropertiesReader(
  __dirname + properties.get('aspects.tagging.path')
);

let marValidation = new marAspects.MARValidation(
  app,
  properties.get('architecture.type')
);

let lamdbaStack = new LambdaStack(
  app,
  setResourceName(properties.get('stack.lambda')),
  properties,
);
