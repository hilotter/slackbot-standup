import dayjs from 'dayjs';
import Workspace from '~/models/workspace';

export const getToday = async (teamId: string) => {
  const workspace = await Workspace.read(teamId);
  const tzOffset = workspace.tzOffset || 0;
  const today = dayjs()
    .add(tzOffset, 'second')
    .startOf('day');
  return today;
};
