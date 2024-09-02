import { Construct } from './constructs/Construct.js';
import type { ACEStack } from './constructs/Stack.js';
import type { StackConfig } from './constructs/Stack.js';

export class AceSDK extends Construct {
  private stacks: ACEStack[] = [];

  constructor(private config: AceConfig) {
    super(null, 'root');
  }

  async synth(): Promise<StackConfig> {
    console.log('Synthesizing infrastructure...');
    // TODO: Implement synthesis logic for all stacks
    return {};
  }

  async deploy(config: StackConfig): Promise<void> {
    console.log('Deploying infrastructure...');
    // TODO: Implement deployment logic for all stacks
  }

  async addSecret(appName: string, key: string, value: string) {
    // Make API call to Fly.io to add a secret
    // This might use the `fly secrets set` equivalent API
  }

  async listSecrets(appName: string) {
    // Make API call to Fly.io to list secrets
    // This might use the `fly secrets list` equivalent API
  }

  async removeSecret(appName: string, key: string) {
    // Make API call to Fly.io to remove a secret
    // This might use the `fly secrets unset` equivalent API
  }
}

interface AceConfig {
  apiToken: string;
}