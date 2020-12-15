import { Datastore } from '@google-cloud/datastore';

const datastore = new Datastore();

class Standup {
  private static kind = 'Standup';

  static async add({
    teamId,
    userId,
    standupInfo
  }: {
    teamId: string;
    userId: string;
    standupInfo: {
      status: string;
      postDate: string;
      lastTimeTodo: string;
      todayTodo: string;
      trouble: string;
      goodPoint: string;
      workPlace: string;
      information: string;
      ts: string;
    };
  }) {
    const key = datastore.key({
      namespace: teamId,
      path: [this.kind, userId]
    });
    const entity = {
      key: key,
      data: [
        {
          name: 'userId',
          value: userId
        },
        {
          name: 'postDate',
          value: standupInfo.postDate
        },
        {
          name: 'status',
          value: standupInfo.status
        },
        {
          name: 'lastTimeTodo',
          value: standupInfo.lastTimeTodo
        },
        {
          name: 'todayTodo',
          value: standupInfo.todayTodo
        },
        {
          name: 'trouble',
          value: standupInfo.trouble || ''
        },
        {
          name: 'goodPoint',
          value: standupInfo.goodPoint || ''
        },
        {
          name: 'workPlace',
          value: standupInfo.workPlace || ''
        },
        {
          name: 'information',
          value: standupInfo.information || ''
        },
        {
          name: 'ts',
          value: standupInfo.ts
        },
        {
          name: 'created',
          value: new Date().toJSON()
        }
      ]
    };

    try {
      await datastore.upsert(entity);
      console.log(`Standup created successfully.`);
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

  static async read(teamId: string, userId: string) {
    const key = datastore.key({
      namespace: teamId,
      path: [this.kind, userId]
    });
    const [standup] = await datastore.get(key);
    return standup ? this.fromDatastore(standup) : null;
  }
}

export default Standup;
