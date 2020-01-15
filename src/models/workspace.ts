import { Datastore } from '@google-cloud/datastore';

const datastore = new Datastore();

class Workspace {
  private static kind = 'Workspace';

  static async add({
    teamId,
    botInfo
  }: {
    teamId: string;
    botInfo: {
      botId: string;
      botToken: string;
      botUserId: string;
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
          name: 'botId',
          value: botInfo.botId
        },
        {
          name: 'botToken',
          value: botInfo.botToken
        },
        {
          name: 'botUserId',
          value: botInfo.botUserId
        },
        {
          name: 'created',
          value: new Date().toJSON()
        }
      ]
    };

    try {
      await datastore.upsert(entity);
      console.log(`Workspace created successfully.`);
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
    const [workspace] = await datastore.get(key);
    return workspace ? this.fromDatastore(workspace) : null;
  }
}

export default Workspace;
