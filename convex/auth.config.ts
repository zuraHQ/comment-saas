// Clerk JWT config. Set CLERK_JWT_ISSUER_DOMAIN on the Convex deployment
// (npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-app.clerk.accounts.dev)
// after creating a "convex" JWT template in the Clerk dashboard.
export default {
  providers: process.env.CLERK_JWT_ISSUER_DOMAIN
    ? [
        {
          domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
          applicationID: "convex",
        },
      ]
    : [],
};
