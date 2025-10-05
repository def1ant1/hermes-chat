'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { memo } from 'react';

import ErrorCapture from '@/components/Error';

// Hermes Legal & Support approvals captured in LEG-204 / SUP-112 on 2025-02-10 for the
// documentation URLs and support alias surfaced below. This provenance keeps the auth
// experience aligned with enterprise contract copy until the retirement tasks complete.
const HERMES_SUPPORT_EMAIL = 'support@hermes.chat';
const DOCS_BASE_EN = 'https://docs.hermes.chat';
const DOCS_BASE_ZH_CN = 'https://docs.hermes.chat/zh-cn';

const buildDocsLink = (path: string) =>
  `${DOCS_BASE_EN}${path} (English) | 简体中文：${DOCS_BASE_ZH_CN}${path}`;

const SUPPORT_ESCALATION = `If you still run into issues after following the playbooks above, email Hermes Support at ${HERMES_SUPPORT_EMAIL} for a tracked escalation.`;

enum ErrorEnum {
  AccessDenied = 'AccessDenied',
  Configuration = 'Configuration',
  Default = 'Default',
  Verification = 'Verification',
}

const errorMap = {
  [ErrorEnum.Configuration]: `Wrong configuration, make sure you have the correct environment variables set. Review ${buildDocsLink('/self-hosting/advanced/authentication')} for the hardened checklist. ${SUPPORT_ESCALATION}`,
  [ErrorEnum.AccessDenied]: `Access was denied. See ${buildDocsLink('/platform/authentication/errors#access-denied')} for Hermes token scope guidance. ${SUPPORT_ESCALATION}`,
  [ErrorEnum.Verification]: `Verification error. Work through ${buildDocsLink('/platform/authentication/errors#verification')} before retrying. ${SUPPORT_ESCALATION}`,
  [ErrorEnum.Default]: `There was a problem when trying to authenticate. Inspect ${buildDocsLink('/platform/authentication/errors')} for troubleshooting flows. ${SUPPORT_ESCALATION}`,
};

export default memo(() => {
  const search = useSearchParams();
  const error = search.get('error') as ErrorEnum;
  const props = {
    error: {
      cause: error,
      message: errorMap[error] ?? errorMap[ErrorEnum.Default],
      name: 'NextAuth Error',
    },
    reset: () => signIn(undefined, { callbackUrl: '/' }),
  };
  console.log('[NextAuth] Error:', props.error);
  return <ErrorCapture {...props} />;
});
