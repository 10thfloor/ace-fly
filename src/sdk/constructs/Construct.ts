export abstract class Construct {
  constructor(protected scope: Construct | null, protected id: string) {
    this.id = id;
    this.scope = scope;
  }
}