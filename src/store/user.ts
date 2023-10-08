import { atom } from 'recoil';
import { TPlugin } from '~/common/dataprovider';;

const user = atom({
  key: 'user',
  default: null,
});

const availableTools = atom<TPlugin[]>({
  key: 'availableTools',
  default: [],
});

export default {
  user,
  availableTools,
};
