import { useEffect } from 'react';

import { AuthData } from '@/api/auth';
import { Resort } from '@/api/resort';

declare global {
  interface Window {
    OneID?: {
      get: (config: any) => {
        init: () => Promise<void>;
        launchLogin: () => void;
        on: (eventName: string, callback: (result: any) => void) => void;
      };
    };
  }
}

const SCRIPT_URL = 'https://cdn.registerdisney.go.com/v4/OneID.js';
const SCRIPT_ID = 'oneid-script';
const WRAPPER_ID = 'oneid-wrapper';
const RESPONDER_ID = 'oneid-secure-responder';

export default function LoginForm({
  resort,
  onLogin,
}: {
  resort: Pick<Resort, 'id'>;
  onLogin: (data: AuthData) => void;
}) {
  useEffect(() => {
    let timeoutId = 0;

    async function launchLogin() {
      if (!window.OneID) {
        timeoutId = self.setTimeout(launchLogin, 100);
        return;
      }
      const os = navigator.userAgent.includes('Android') ? 'AND' : 'IOS';
      const OneID = window.OneID.get({
        clientId: `TPR-${resort.id}-LBSDK.${os}`,
        responderPage: 'https://bg1.joelface.com/responder.html',
      });
      OneID.on('login', ({ token }) => {
        onLogin({
          swid: token.swid,
          accessToken: token.access_token,
          expires: new Date(token.exp).getTime(),
        });
      });
      OneID.on('close', () => {
        OneID.launchLogin();
      });
      await OneID.init();
      OneID.launchLogin();
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_URL;
      document.head.appendChild(script);
    }

    launchLogin();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      for (const id of [WRAPPER_ID, RESPONDER_ID, SCRIPT_ID]) {
        const elem = document.getElementById(id);
        elem?.parentNode?.removeChild(elem);
      }
    };
  }, [resort, onLogin]);

  return <div className="fixed top-0 left-0 w-full h-full border-0" />;
}
