import * as cdk from 'aws-cdk-lib';

class PrivateEnvironmentHelper {
  private env: string;
  constructor(app: cdk.App) {
    this.env = app.node.tryGetContext('env');
  }

  /**
   * Returns properties path dependind on the deployment environment
   *
   * @param pathLevel path level with respect to the folder /sources. For example, '/../'
   * @returns
   */
  public getPropertiesPath(pathLevel: string): string {
    let proppath;
    let env = EnvironmentHelper.getInstance().env;

    switch (env) {
      case 'DEV':
        proppath = pathLevel + 'sources/config/backend-dev.properties';
        break;
      case 'INT':
        proppath = pathLevel + 'sources/config/backend-int.properties';
        break;
      case 'PRE':
        proppath = pathLevel + 'sources/config/backend-pre.properties';
        break;
      case 'PRO':
        proppath = pathLevel + 'sources/config/backend-pro.properties';
        break;
      default:
        throw new Error(
          'Please provide a valid environment variable. Format: cdk <COMMAND> -c env=<DEV,INT,PRE or PRO>'
        );
    }

    return proppath;
  }

  public getEnvironment(): string {
    return this.env;
  }

  public setEnvironment(env: string): void {
    this.env = env;
  }
}

/**
 * Helper class which sets the environment properties and properties file selection.
 */
export class EnvironmentHelper {
  private static instance: PrivateEnvironmentHelper;

  constructor() {
    throw new Error('Use EnvironmentHelper.createInstance(app)');
  }

  static createInstance(app: cdk.App): PrivateEnvironmentHelper {
    if (!EnvironmentHelper.instance) {
      EnvironmentHelper.instance = new PrivateEnvironmentHelper(app);
    }

    return EnvironmentHelper.instance;
  }

  static getInstance(): PrivateEnvironmentHelper {
    return EnvironmentHelper.instance;
  }
}
