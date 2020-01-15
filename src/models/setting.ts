import { Datastore } from '@google-cloud/datastore';

const datastore = new Datastore();

class Setting {
  private static kind = 'Setting';

  static async add({
    teamId,
    settingInfo
  }: {
    teamId: string;
    settingInfo: {
      broadcastChannel: string;
      reminderText: string;
    };
  }) {
    const key = datastore.key({
      namespace: teamId,
      path: [this.kind, teamId]
    });
    const entity = {
      key: key,
      data: [
        {
          name: 'broadcastChannel',
          value: settingInfo.broadcastChannel
        },
        {
          name: 'reminderText',
          value: settingInfo.reminderText
        },
        {
          name: 'created',
          value: new Date().toJSON()
        }
      ]
    };

    try {
      await datastore.upsert(entity);
      console.log(`Setting created successfully.`);
      return true;
    } catch (err) {
      console.error('ERROR:', err);
      return false;
    }
  }

  static fromDatastore(obj) {
    obj.id = obj[Datastore.KEY].name;
    return obj;
  }

  static async read(teamId: string) {
    const key = datastore.key({
      namespace: teamId,
      path: [this.kind, teamId]
    });
    const [setting] = await datastore.get(key);
    return setting ? this.fromDatastore(setting) : null;
  }
}

export default Setting;
