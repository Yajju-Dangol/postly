import { GraphQLClient, gql } from 'graphql-request';

const API_KEY = import.meta.env.VITE_BUFFER_API_KEY;
const ORG_ID = import.meta.env.VITE_BUFFER_ORG_ID;
const API_URL = window.location.origin + '/api-buffer/graphql';

const getAuthHeader = () => {
  const tokens = localStorage.getItem('buffer_tokens');
  if (tokens) {
    const { access_token } = JSON.parse(tokens);
    return `Bearer ${access_token}`;
  }
  return `Bearer ${import.meta.env.VITE_BUFFER_API_KEY}`;
};

const client = new GraphQLClient(API_URL, {
  headers: {
    Authorization: getAuthHeader(),
  },
});

// Rate limiting protection
let channelsCache = null;
let inFlightRequests = new Map();

// Persistent caching to survive HMR/Refreshes and prevent rate limiting (429)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const getCachedData = (key) => {
  const cached = localStorage.getItem(`postly_cache_${key}`);
  if (!cached) return null;
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(`postly_cache_${key}`);
    return null;
  }
  return data;
};

const setCachedData = (key, data) => {
  localStorage.setItem(`postly_cache_${key}`, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

const request = async (query, variables = {}) => {
  try {
    console.log('[Buffer Request]:', { query, variables });
    const response = await client.rawRequest(query, variables);
    const { data, errors } = response;

    // 1. Handle Non-recoverable errors (GraphQL system errors)
    if (errors && errors.length > 0) {
      const error = errors[0];
      const code = error.extensions?.code || 'UNEXPECTED';
      console.error(`[Buffer System Error] ${code}:`, error);
      return { error: true, code, message: error.message, details: error };
    }

    console.log('[Buffer Success]:', data);
    return data;
  } catch (err) {
    console.error('[Buffer Network Error]:', err);
    // Extract detailed message from ClientError if possible
    const message = err.response?.errors?.[0]?.message || err.message || 'Network failure';
    return { error: true, code: 'NETWORK_ERROR', message };
  }
};

export const fetchOrganizations = async () => {
  const query = gql`
    query GetOrganizations {
      account {
        organizations {
          id
          name
        }
      }
    }
  `;
  const data = await request(query);
  if (data?.error) {
    console.error('[fetchOrganizations] Failed:', data.message);
    return [];
  }
  return data?.account?.organizations || [];
};

export const fetchChannels = async (orgId = ORG_ID, forceRefresh = false) => {
  if (forceRefresh) {
    localStorage.removeItem('postly_cache_channels');
  } else {
    const cached = getCachedData('channels');
    if (cached) return cached;
  }

  if (inFlightRequests.has('channels')) return inFlightRequests.get('channels');

  const query = gql`
    query GetChannels($input: ChannelsInput!) {
      channels(input: $input) {
        id
        name
        service
      }
    }
  `;
  
  const requestPromise = (async () => {
    try {
      const data = await request(query, {
        input: { organizationId: orgId },
      });
      
      if (data?.error) {
        throw new Error(data.message || 'Buffer API Error');
      }

      const channels = data?.channels || [];
      if (channels.length > 0) {
        setCachedData('channels', channels);
      }
      return channels;
    } catch (err) {
      console.warn('[fetchChannels] Request failed:', err.message);
      
      // Try stale cache
      const stale = localStorage.getItem('postly_cache_channels');
      if (stale) {
        const parsed = JSON.parse(stale);
        return parsed.data;
      }
      
      throw err;
    } finally {
      inFlightRequests.delete('channels');
    }
  })();

  inFlightRequests.set('channels', requestPromise);
  return requestPromise;
};

let isCreatingPost = false;

export const createPost = async ({ text, channelId, mode = 'addToQueue', dueAt, assets, type }) => {
  if (isCreatingPost) return { error: true, message: 'A post is already being processed.' };
  
  isCreatingPost = true;
  try {
    const mutation = gql`
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess {
            post {
              id
              text
              dueAt
              status
              assets {
                id
                mimeType
              }
            }
          }
          ... on MutationError {
            message
          }
        }
      }
    `;

    const input = {
      text,
      channelId,
      schedulingType: 'automatic',
      mode,
    };

    if (type) {
      input.metadata = {
        instagram: {
          type: type,
          shouldShareToFeed: true
        }
      };
    }

    if (mode === 'customScheduled' && dueAt) {
      input.dueAt = dueAt;
    }

    if (assets && assets.length > 0) {
      input.assets = { images: assets };
    }

    const data = await request(mutation, { input });

    if (!data || data.error) return data || { error: true, message: 'No response from API' };

    const result = data.createPost;
    if (result?.post) {
      localStorage.removeItem('postly_cache_posts');
      return { post: result.post, success: true };
    }

    const errorMsg = result?.message || 'Buffer rejected this post (Unknown reason)';
    return { error: true, message: errorMsg };
  } catch (err) {
    console.error('[createPost] Fatal Error:', err);
    return { error: true, message: err.message };
  } finally {
    isCreatingPost = false;
  }
};


export const updatePost = async ({ id, text, dueAt, assets }) => {
  try {
    const mutation = gql`
      mutation UpdatePost($input: UpdatePostInput!) {
        updatePost(input: $input) {
          ... on PostActionSuccess {
            post {
              id
              text
              dueAt
              status
            }
          }
          ... on MutationError {
            message
          }
        }
      }
    `;

    const input = { id };
    if (text) input.text = text;
    if (dueAt) {
      input.dueAt = dueAt;
    }
    if (assets) {
      input.assets = { images: assets };
    }

    const data = await request(mutation, { input });
    if (!data || data.error) return data || { error: true, message: 'No response from API' };

    const result = data.updatePost;
    if (result?.post) {
      localStorage.removeItem('postly_cache_posts');
      return { post: result.post, success: true };
    }
    return { error: true, message: result?.message || 'Buffer rejected update' };
  } catch (err) {
    console.error('[updatePost] Fatal Error:', err);
    return { error: true, message: err.message };
  }
};


export const fetchPosts = async (orgId = ORG_ID, forceRefresh = false) => {
  if (forceRefresh) {
    localStorage.removeItem('postly_cache_posts');
  } else {
    const cached = getCachedData('posts');
    if (cached) return cached;
  }

  if (inFlightRequests.has('posts')) return inFlightRequests.get('posts');

  const query = gql`
    query GetPosts($input: PostsInput!) {
      posts(first: 20, input: $input) {
        edges {
          node {
            id
            text
            dueAt
            channelId
            status
            assets {
              id
              mimeType
            }
          }
        }
      }
    }
  `;

  const requestPromise = (async () => {
    try {
      const data = await request(query, {
        input: { 
          organizationId: orgId,
          filter: {
            status: ['scheduled', 'sent', 'error', 'draft', 'sending']
          }
        },
      });

      if (data?.error) {
        throw new Error(data.message || 'Buffer API Error');
      }

      const posts = data?.posts?.edges?.map(e => e.node) || [];
      if (posts.length > 0) {
        setCachedData('posts', posts);
      }
      return posts;
    } catch (err) {
      console.warn('[fetchPosts] Request failed:', err.message);
      
      // Try stale cache
      const stale = localStorage.getItem('postly_cache_posts');
      if (stale) {
        const parsed = JSON.parse(stale);
        return parsed.data;
      }

      throw err;
    } finally {
      inFlightRequests.delete('posts');
    }
  })();

  inFlightRequests.set('posts', requestPromise);
  return requestPromise;
};

export const deletePost = async (id) => {
  try {
    const mutation = gql`
      mutation DeletePost($input: DeletePostInput!) {
        deletePost(input: $input) {
          ... on DeletePostSuccess {
            id
          }
          ... on MutationError {
            message
          }
        }
      }
    `;

    const input = { id };
    const data = await request(mutation, { input });
    if (!data || data.error) return data || { error: true, message: 'No response from API' };

    const result = data.deletePost;
    if (result?.id) {
      localStorage.removeItem('postly_cache_posts');
      return { success: true };
    }
    return { error: true, message: result?.message || 'Buffer rejected deletion' };
  } catch (err) {
    console.error('[deletePost] Fatal Error:', err);
    return { error: true, message: err.message };
  }
};
