export class DeploymentState {
  private state: Map<string, any> = new Map();

  updateResourceState(resourceId: string, state: any): void {
    this.state.set(resourceId, state);
  }

  getResourceState(resourceId: string): any {
    return this.state.get(resourceId);
  }

  getAllStates(): Record<string, any> {
    return Object.fromEntries(this.state);
  }

  clearState(): void {
    this.state.clear();
  }

  // In a real-world scenario, you might want to add methods for persisting and loading state
  // For example:
  // async saveState(): Promise<void> { ... }
  // async loadState(): Promise<void> { ... }
}