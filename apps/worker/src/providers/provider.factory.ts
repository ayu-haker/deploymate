import { DeploymentProvider, ProviderType } from '@deploymate/types';
import { KubernetesProvider } from './kubernetes.provider';
import { VercelProvider } from './vercel.provider';
import { NetlifyProvider } from './netlify.provider';

export class ProviderFactory {
  public static getProvider(providerType: ProviderType, credentials?: Record<string, any>): DeploymentProvider {
    switch (providerType) {
      case ProviderType.KUBERNETES:
        return new KubernetesProvider(credentials?.kubeconfig);
      case ProviderType.VERCEL:
        return new VercelProvider(credentials?.token);
      case ProviderType.NETLIFY:
        return new NetlifyProvider(credentials?.token);
      default:
        throw new Error(`Unsupported deployment provider type: ${providerType}`);
    }
  }
}
