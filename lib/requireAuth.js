// lib/requireAuth.js
import { getAuth } from "@clerk/nextjs/server";

export function requireAuth(gssp) {
  return async (ctx) => {
    const { userId } = getAuth(ctx.req);
    if (!userId) {
      return {
        redirect: {
          destination: `/sign-in?redirect_url=${encodeURIComponent(ctx.resolvedUrl)}`,
          permanent: false,
        },
      };
    }
    return gssp ? await gssp(ctx) : { props: {} };
  };
}
