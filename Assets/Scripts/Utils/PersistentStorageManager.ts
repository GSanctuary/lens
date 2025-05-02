@component
export class PersistentStorageManager extends BaseScriptComponent {
  @input keys: Array<string>;

  private static instance: PersistentStorageManager;
  private localStorage: Record<string, string> = {};
  private persistentStorage: GeneralDataStore;

  onAwake() {
    if (PersistentStorageManager.instance) {
      this.destroy();
      return;
    }
    PersistentStorageManager.instance = this;
    this.persistentStorage = global.persistentStorageSystem.store;

    this.loadKeys();
  }

  private loadKeys = () => {
    for (const key of this.keys) {
      if (this.persistentStorage.has(key)) {
        this.localStorage[key] = this.persistentStorage.getString(key);
        print(
          `Key ${key} loaded from persistent storage: ${this.localStorage[key]}`
        );
      } else {
        this.localStorage[key] = null;
      }
    }
  };

  get = (key: string): string => {
    if (this.localStorage[key] !== undefined) {
      return this.localStorage[key];
    } else {
      print(`Key ${key} not found in local storage.`);
      return null;
    }
  };

  set = (key: string, value: string) => {
    this.localStorage[key] = value;
    this.persistentStorage.putString(key, value);
    print(`Set ${key} to ${value}`);
  };

  testKeySetter = (_: boolean) => {
    this.set('testKey', 'testValue');
  };
}
