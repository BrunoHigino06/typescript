import { EnvironmentHelper } from '../../../infra/lib/helpers/environment-helper';
const PropertiesReader = require('properties-reader');

/**
 * Returns a formatted string including the namespace, the resource name (passed as a parameter)
 *
 * @param resourceName Name of the resource.
 * @returns
 */
export function setResourceName(resourceName: string): string {
  let envHelper = EnvironmentHelper.getInstance();
  let proppath = envHelper.getPropertiesPath('/../../../');
  let properties = PropertiesReader(__dirname + proppath);
  let env = envHelper.getEnvironment();
  return `${properties.get('namespace')}-${resourceName}-${env.toLowerCase()}`;
}
