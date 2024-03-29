import Vue from 'vue';
import VueApollo from 'vue-apollo';
import {
  createApolloClient,
  restartWebsockets
} from 'vue-cli-plugin-apollo/graphql-client';

import errorHandler from '../utils/errorHandler';

// Install the vue plugin
Vue.use(VueApollo);

// Http endpoint
const httpEndpoint =
  process.env.VUE_APP_GRAPHQL_HTTP || 'http://localhost:3000/graphql';

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint,
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:3000/graphql',
  // LocalStorage token
  tokenName: process.env.VUE_APP_ACCESS_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,
  connectToDevTools: true

  // Override default apollo link
  // note: don't override httpLink here, specify httpLink options in the
  // httpLinkOptions property of defaultOptions.
  // link: myLink

  // Override default cache
  // cache: myCache

  // Override the way the Authorization header is set
  // getAuth: (tokenName) => ...

  // Additional ApolloClient options
  // apollo: { ... }

  // Client local data (see apollo-link-state)
  // clientState: { resolvers: { ... }, defaults: { ... } }
};

// Call this in the Vue app file
export function createProvider(options = {}) {
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient({
    ...defaultOptions,
    ...options
  });

  // Override connection params
  wsClient.connectionParams = () => {
    return {
      token: localStorage.getItem(process.env.VUE_APP_ACCESS_TOKEN)
        ? `Bearer ${localStorage.getItem(process.env.VUE_APP_ACCESS_TOKEN)}`
        : ''
    };
  };

  apolloClient.wsClient = wsClient;

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all'
      }
    },
    errorHandler(e) {
      errorHandler(e);
    }
  });

  return apolloProvider;
}

// Manually call this when user log in
export async function onLogin(apolloClient, accessToken, refreshToken) {
  if (typeof localStorage !== 'undefined' && accessToken && refreshToken) {
    localStorage.setItem(process.env.VUE_APP_ACCESS_TOKEN, accessToken);
    localStorage.setItem(process.env.VUE_APP_REFRESH_TOKEN, refreshToken);
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient);
  try {
    await apolloClient.cache.reset();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (login)', 'color: orange;', e.message);
  }
}

// Manually call this when user log out
export async function onLogout(apolloClient) {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(process.env.VUE_APP_ACCESS_TOKEN);
    localStorage.removeItem(process.env.VUE_APP_REFRESH_TOKEN);
  }
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient);
  try {
    await apolloClient.cache.reset();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('%cError on cache reset (logout)', 'color: orange;', e.message);
  }
}
