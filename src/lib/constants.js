import { pound_hex_to_dec } from '@/lib/color';
import { kebab_to_camel } from '@/lib/utils';

export const DEFAULT_SIZE = {
  width: 800,
  height: 600,
};

export const TEXT_FONT_FAMILY =
  '"Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';

const DEFAULT_COLORS = {
  gray: {
    100: '#f5f5f5',
    200: '#ececec',
    300: '#e2e2e2',
    400: '#cbcbcb',
    500: '#a0a0a0',
    600: '#707070',
    700: '#545454',
    800: '#404040',
    900: '#303030',
  },
  white: '#ffffff',
  black: '#202020',
  red: '#de3d00',
  cyan: {
    100: '#b4fcff',
    200: '#9bfeff',
    300: '#19f7ff',
    400: '#1dd7de',
    500: '#31a7ac',
  },
};

export const colors = (orig =>
  Object.keys(orig).reduce((acc, key) => {
    const value = orig[key];
    if (typeof value === 'string') {
      acc[key] = value;
      acc[kebab_to_camel(key)] = value;
    } else if (typeof value === 'object') {
      Object.keys(value).forEach(key2 => {
        const value2 = value[key2];
        const key3 = `${key}-${key2}`;
        if (typeof value2 === 'string') {
          acc[key3] = value2;
          acc[kebab_to_camel(key3)] = value2;
        }
      });
    }
    return acc;
  }, {}))(DEFAULT_COLORS);

const COLOR_NORM = colors.cyan300;
const COLOR_FULL = colors.red;

export const DEFAULT_AIRPORT_OPTIONS = {
  background_color: colors.gray900,

  // PORT
  num_of_ports: 5,
  port_capacity: 5,
  port_color_norm: COLOR_NORM,
  port_color_full: COLOR_FULL,

  // AIRPLANES
  num_of_planes: 50,
  plane_path_max: 100,
  plane_path_spacing: 300,
  plane_holding_distance: 5,
  plane_holding_color: colors.gray600,
  plane_flight_color: COLOR_NORM,
  plane_unique_color: colors.red,
  plane_path_color: colors.gray300,

  // TEXT
  text_font_family: TEXT_FONT_FAMILY,
  text_color: colors.gray300,
  text_color_norm: COLOR_NORM,
  text_color_full: COLOR_FULL,
};

const NEED_DECIMAL_CONVERSIONS = [
  'background_color',
  'port_color_norm',
  'port_color_full',
  'plane_holding_color',
  'plane_flight_color',
  'plane_unique_color',
  'plane_path_color',
  'text_color',
];

export const makeAirportOptions = (given = {}) => {
  return Object.keys(DEFAULT_AIRPORT_OPTIONS).reduce((acc, key) => {
    const val = given[key] || DEFAULT_AIRPORT_OPTIONS[key];
    if (!val) {
      throw new Error(`[constants] No values for: ${key}`);
    }
    acc[key] = NEED_DECIMAL_CONVERSIONS.includes(key)
      ? pound_hex_to_dec(val)
      : val;
    return acc;
  }, {});
};

export const DEFAULT_STAGE_OPTIONS = {
  forceCanvas: true,
  backgroundColor: pound_hex_to_dec(DEFAULT_AIRPORT_OPTIONS.background_color),
  resolution: window.devicePixelRatio,
  width: 800,
  height: 600,
};
