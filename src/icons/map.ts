// 🤖 AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run 'python generate_map.py' to update this file.

import ExploreFilled from './filled/explore.svg';
import ExploreStroked from './stroked/explore.svg';
import FandomFilled from './filled/fandom.svg';
import FandomStroked from './stroked/fandom.svg';
import FavoriteFilled from './filled/favorite.svg';
import FavoriteStroked from './stroked/favorite.svg';
import HomeFilled from './filled/home.svg';
import HomeStroked from './stroked/home.svg';
import MenuFilled from './filled/menu.svg';
import MenuStroked from './stroked/menu.svg';
import MoonFilled from './filled/moon.svg';
import MoonStroked from './stroked/moon.svg';
import SearchFilled from './filled/search.svg';
import SearchStroked from './stroked/search.svg';
import SettingsFilled from './filled/settings.svg';
import SettingsStroked from './stroked/settings.svg';
import SparklesFilled from './filled/sparkles.svg';
import SparklesStroked from './stroked/sparkles.svg';
import SunFilled from './filled/sun.svg';
import SunStroked from './stroked/sun.svg';
import SystemFilled from './filled/system.svg';
import SystemStroked from './stroked/system.svg';
import UserFilled from './filled/user.svg';
import UserStroked from './stroked/user.svg';
import ZapFilled from './filled/zap.svg';
import ZapStroked from './stroked/zap.svg';

export const iconMap = {
  'explore': { filled: ExploreFilled, stroked: ExploreStroked },
  'fandom': { filled: FandomFilled, stroked: FandomStroked },
  'favorite': { filled: FavoriteFilled, stroked: FavoriteStroked },
  'home': { filled: HomeFilled, stroked: HomeStroked },
  'menu': { filled: MenuFilled, stroked: MenuStroked },
  'moon': { filled: MoonFilled, stroked: MoonStroked },
  'search': { filled: SearchFilled, stroked: SearchStroked },
  'settings': { filled: SettingsFilled, stroked: SettingsStroked },
  'sparkles': { filled: SparklesFilled, stroked: SparklesStroked },
  'sun': { filled: SunFilled, stroked: SunStroked },
  'system': { filled: SystemFilled, stroked: SystemStroked },
  'user': { filled: UserFilled, stroked: UserStroked },
  'zap': { filled: ZapFilled, stroked: ZapStroked },
} as const;

export type IconName = keyof typeof iconMap;
