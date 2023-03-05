const nav = {
  goBack: jest.fn(),
  goTo: jest.fn(),
  stack: [{ elem: <div />, key: 0 }],
  active: <div />,
};

export const useNav = () => nav;

export const useScreens = () => ({ current: <div />, prev: <div /> });
