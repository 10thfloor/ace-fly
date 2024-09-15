export interface Plugin {
    name: string;
    execute: () => void;
  }
  
  export class PluginManager {
    private plugins: Plugin[] = [];
  
    register(plugin: Plugin) {
      this.plugins.push(plugin);
      console.log(`Plugin registered: ${plugin.name}`);
    }
  
    runAll() {
      for (const plugin of this.plugins) {
        console.log(`Running plugin: ${plugin.name}`);
        plugin.execute();
      };
    }
  }