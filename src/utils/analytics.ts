export const trackScreen = (screenName: string) => {
  // eslint-disable-next-line no-console
  console.log(`Analytics: Screen viewed - ${screenName}`);
};

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  // eslint-disable-next-line no-console
  console.log(`Analytics: Event - ${eventName}`, properties);
};

export const trackGuideView = (guideId: string, guideName: string) => {
  // eslint-disable-next-line no-console
  console.log(`Analytics: Guide viewed - ${guideName} (${guideId})`);
};

export const trackEmergencyAction = (action: string, details?: Record<string, unknown>) => {
  // eslint-disable-next-line no-console
  console.log(`Analytics: Emergency action - ${action}`, details);
};
