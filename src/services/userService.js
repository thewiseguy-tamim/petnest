// src/services/userService.js
import apiClient from './api';

const userService = {
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token available');
      const response = await apiClient.post('/users/token/refresh/', { refresh: refreshToken });
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      return access;
    } catch (error) {
      console.error('[userService.refreshToken] Failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw new Error('Session expired. Please log in again.');
    }
  },

  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/users/', { params });
      if (!Array.isArray(response.data)) {
        console.warn('[userService.getUsers] Expected array, got:', response.data);
        return [];
      }
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get('/users/admin/users/', { params });
          if (!Array.isArray(retryResponse.data)) {
            console.warn('[userService.getUsers] Retry - Expected array, got:', retryResponse.data);
            return [];
          }
          return retryResponse.data;
        } catch (refreshError) {
          console.error('[userService.getUsers] Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin.');
        }
      }
      console.error('[userService.getUsers] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch users.');
    }
  },

  getUserDetails: async (userId) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.get(`/users/admin/users/${userId}/`);
      console.log('[userService.getUserDetails] Fetched user:', response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get(`/users/admin/users/${userId}/`);
          console.log('[userService.getUserDetails] Retry - Fetched user:', retryResponse.data);
          return retryResponse.data;
        } catch (refreshError) {
          console.error('[userService.getUserDetails] Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin.');
        }
      }
      console.error('[userService.getUserDetails] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch user details.');
    }
  },

  deleteUser: async (userId) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.delete(`/users/admin/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('[userService.deleteUser] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to delete user.');
    }
  },

  updateVerificationStatus: async (userId, status, notes = '') => {
    if (!userId) throw new Error('User ID is required for verification action');
    if (!['approved', 'rejected', 'pending'].includes(status)) throw new Error('Invalid verification status');
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/approve/`, { status, notes });
      console.log('[userService.updateVerificationStatus] Success:', response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.post(`/users/admin/users/${userId}/approve/`, { status, notes });
          console.log('[userService.updateVerificationStatus] Retry - Success:', retryResponse.data);
          return retryResponse.data;
        } catch (refreshError) {
          console.error('[userService.updateVerificationStatus] Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin or moderator.');
        }
      }
      console.error('[userService.updateVerificationStatus] Error:', error.message, error.response?.data);
      throw new Error(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.response?.data?.status?.[0] ||
        'Failed to update verification status.'
      );
    }
  },

  updateUserRole: async (userId, role) => {
    if (!userId) throw new Error('User ID is required');
    try {
      const response = await apiClient.post(`/users/admin/users/${userId}/role/`, { role });
      return response.data;
    } catch (error) {
      console.error('[userService.updateUserRole] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to update user role.');
    }
  },

  getVerificationRequests: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/verification-requests/', { params });
      if (!Array.isArray(response.data)) {
        console.warn('[userService.getVerificationRequests] Expected array, got:', response.data);
        return [];
      }
      console.log('[userService.getVerificationRequests] Raw requests:', response.data);
      // Log created_at values specifically for debugging
      response.data.forEach((request, index) => {
        console.log(`[userService.getVerificationRequests] Request ${index} created_at:`, request.created_at);
      });
      // Enrich requests with detailed user information
      const enrichedRequests = await Promise.all(
        response.data.map(async (request) => {
          let userData = {};
          try {
            if (request.user) {
              const userId = typeof request.user === 'object' ? request.user.id : request.user;
              if (userId) {
                const userResponse = await apiClient.get(`/users/admin/users/${userId}/`);
                userData = userResponse.data;
                console.log(`[userService.getVerificationRequests] Fetched user details for user ${userId}:`, userData);
              } else {
                console.warn(`[userService.getVerificationRequests] No user ID for request ${request.id}`);
              }
            } else {
              console.warn(`[userService.getVerificationRequests] No user data for request ${request.id}`);
            }
            return {
              ...request,
              user: userData,
            };
          } catch (error) {
            console.error(`[userService.getVerificationRequests] Error enriching request ${request.id}:`, error.response?.data || error.message, { status: error.response?.status });
            return {
              ...request,
              user: userData,
            };
          }
        })
      );
      console.log('[userService.getVerificationRequests] Enriched requests:', enrichedRequests);
      return enrichedRequests;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get('/users/admin/verification-requests/', { params });
          if (!Array.isArray(retryResponse.data)) {
            console.warn('[userService.getVerificationRequests] Retry - Expected array, got:', retryResponse.data);
            return [];
          }
          console.log('[userService.getVerificationRequests] Retry - Raw requests:', retryResponse.data);
          retryResponse.data.forEach((request, index) => {
            console.log(`[userService.getVerificationRequests] Retry - Request ${index} created_at:`, request.created_at);
          });
          const enrichedRequests = await Promise.all(
            retryResponse.data.map(async (request) => {
              let userData = {};
              try {
                if (request.user) {
                  const userId = typeof request.user === 'object' ? request.user.id : request.user;
                  if (userId) {
                    const userResponse = await apiClient.get(`/users/admin/users/${userId}/`);
                    userData = userResponse.data;
                    console.log(`[userService.getVerificationRequests] Retry - Fetched user details for user ${userId}:`, userData);
                  } else {
                    console.warn(`[userService.getVerificationRequests] Retry - No user ID for request ${request.id}`);
                  }
                } else {
                  console.warn(`[userService.getVerificationRequests] Retry - No user data for request ${request.id}`);
                }
                return {
                  ...request,
                  user: userData,
                };
              } catch (error) {
                console.error(`[userService.getVerificationRequests] Retry - Error enriching request ${request.id}:`, error.response?.data || error.message, { status: error.response?.status });
                return {
                  ...request,
                  user: userData,
                };
              }
            })
          );
          console.log('[userService.getVerificationRequests] Retry - Enriched requests:', enrichedRequests);
          return enrichedRequests;
        } catch (refreshError) {
          console.error('[userService.getVerificationRequests] Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin or moderator.');
        }
      }
      console.error('[userService.getVerificationRequests] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch verification requests.');
    }
  },

  getAdminPosts: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/admin/posts/', { params });
      if (!Array.isArray(response.data)) {
        console.warn('[userService.getAdminPosts] Expected array, got:', response.data);
        return [];
      }
      console.log('[userService.getAdminPosts] Raw posts:', response.data);
      const enrichedPosts = await Promise.all(
        response.data.map(async (post) => {
          let petData = {};
          let userData = {};
          try {
            if (post.pet) {
              const petId = typeof post.pet === 'object' ? post.pet.id : post.pet;
              if (petId) {
                const petResponse = await apiClient.get(`/pets/${petId}/`);
                petData = petResponse.data;
                console.log(`[userService.getAdminPosts] Fetched pet details for pet ${petId}:`, petData);
              } else {
                console.warn(`[userService.getAdminPosts] No pet ID for post ${post.id}`);
              }
            } else {
              console.warn(`[userService.getAdminPosts] No pet data for post ${post.id}`);
            }
            if (post.user) {
              const userId = typeof post.user === 'object' ? post.user.id : post.user;
              if (userId) {
                const userResponse = await apiClient.get(`/users/admin/users/${userId}/`);
                userData = userResponse.data;
                console.log(`[userService.getAdminPosts] Fetched user details for user ${userId}:`, userData);
              } else {
                console.warn(`[userService.getAdminPosts] No user ID for post ${post.id}`);
              }
            } else {
              console.warn(`[userService.getAdminPosts] No user data for post ${post.id}`);
            }
            return {
              ...post,
              pet: petData,
              user: userData,
            };
          } catch (error) {
            console.error(`[userService.getAdminPosts] Error enriching post ${post.id}:`, error.response?.data || error.message, { status: error.response?.status });
            return {
              ...post,
              pet: petData,
              user: userData,
            };
          }
        })
      );
      console.log('[userService.getAdminPosts] Enriched posts:', enrichedPosts);
      return enrichedPosts;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get('/users/admin/posts/', { params });
          if (!Array.isArray(retryResponse.data)) {
            console.warn('[userService.getAdminPosts] Retry - Expected array, got:', retryResponse.data);
            return [];
          }
          console.log('[userService.getAdminPosts] Retry - Raw posts:', retryResponse.data);
          const enrichedPosts = await Promise.all(
            retryResponse.data.map(async (post) => {
              let petData = {};
              let userData = {};
              try {
                if (post.pet) {
                  const petId = typeof post.pet === 'object' ? post.pet.id : post.pet;
                  if (petId) {
                    const petResponse = await apiClient.get(`/pets/${petId}/`);
                    petData = petResponse.data;
                    console.log(`[userService.getAdminPosts] Retry - Fetched pet details for pet ${petId}:`, petData);
                  } else {
                    console.warn(`[userService.getAdminPosts] Retry - No pet ID for post ${post.id}`);
                  }
                } else {
                  console.warn(`[userService.getAdminPosts] Retry - No pet data for post ${post.id}`);
                }
                if (post.user) {
                  const userId = typeof post.user === 'object' ? post.user.id : post.user;
                  if (userId) {
                    const userResponse = await apiClient.get(`/users/admin/users/${userId}/`);
                    userData = userResponse.data;
                    console.log(`[userService.getAdminPosts] Retry - Fetched user details for user ${userId}:`, userData);
                  } else {
                    console.warn(`[userService.getAdminPosts] Retry - No user ID for post ${post.id}`);
                  }
                } else {
                  console.warn(`[userService.getAdminPosts] Retry - No user data for post ${post.id}`);
                }
                return {
                  ...post,
                  pet: petData,
                  user: userData,
                };
              } catch (error) {
                console.error(`[userService.getAdminPosts] Retry - Error enriching post ${post.id}:`, error.response?.data || error.message, { status: error.response?.status });
                return {
                  ...post,
                  pet: petData,
                  user: userData,
                };
              }
            })
          );
          console.log('[userService.getAdminPosts] Retry - Enriched posts:', enrichedPosts);
          return enrichedPosts;
        } catch (refreshError) {
          console.error('[userService.getAdminPosts] Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin or moderator.');
        }
      }
      console.error('[userService.getAdminPosts] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch posts.');
    }
  },

  getAdminPostDetails: async (postId) => {
    if (!postId) throw new Error('Post ID is required');
    try {
      const response = await apiClient.get(`/users/admin/posts/${postId}/`);
      let postData = response.data;
      console.log('[userService.getAdminPostDetails] Raw post:', postData);
      let petData = {};
      let userData = {};
      try {
        if (postData.pet) {
          const petId = typeof postData.pet === 'object' ? postData.pet.id : postData.pet;
          if (petId) {
            const petResponse = await apiClient.get(`/pets/${petId}/`);
            petData = petResponse.data;
            console.log(`[userService.getAdminPostDetails] Fetched pet details for pet ${petId}:`, petData);
          } else {
            console.warn(`[userService.getAdminPostDetails] No pet ID for post ${postId}`);
          }
        } else {
          console.warn(`[userService.getAdminPostDetails] No pet data for post ${postId}`);
        }
        if (postData.user) {
          const userId = typeof postData.user === 'object' ? postData.user.id : postData.user;
          if (userId) {
            const userResponse = await apiClient.get(`/users/admin/users/${userId}/`);
            userData = userResponse.data;
            console.log(`[userService.getAdminPostDetails] Fetched user details for user ${userId}:`, userData);
          } else {
            console.warn(`[userService.getAdminPostDetails] No user ID for post ${postId}`);
          }
        } else {
          console.warn(`[userService.getAdminPostDetails] No user data for post ${postId}`);
        }
        postData = {
          ...postData,
          pet: petData,
          user: userData,
        };
      } catch (error) {
        console.error(`[userService.getAdminPostDetails] Error enriching post ${postId}:`, error.response?.data || error.message, { status: error.response?.status });
      }
      console.log('[userService.getAdminPostDetails] Final post data:', postData);
      return postData;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get(`/users/admin/posts/${postId}/`);
          let postData = retryResponse.data;
          console.log('[userService.getAdminPostDetails] Retry - Raw post:', postData);
          let petData = {};
          let userData = {};
          try {
            if (postData.pet) {
              const petId = typeof postData.pet === 'object' ? postData.pet.id : postData.pet;
              if (petId) {
                const petResponse = await apiClient.get(`/pets/${petId}/`);
                petData = petResponse.data;
                console.log(`[userService.getAdminPostDetails] Retry - Fetched pet details for pet ${petId}:`, petData);
              } else {
                console.warn(`[userService.getAdminPostDetails] Retry - No pet ID for post ${postId}`);
              }
            } else {
              console.warn(`[userService.getAdminPostDetails] Retry - No pet data for post ${postId}`);
            }
            if (postData.user) {
              const userId = typeof postData.user === 'object' ? postData.user.id : postData.user;
              if (userId) {
                const userResponse = await apiClient.get(`/users/admin/users/${userId}/`);
                userData = userResponse.data;
                console.log(`[userService.getAdminPostDetails] Retry - Fetched user details for user ${userId}:`, userData);
              } else {
                console.warn(`[userService.getAdminPostDetails] Retry - No user ID for post ${postId}`);
              }
            } else {
              console.warn(`[userService.getAdminPostDetails] Retry - No user data for post ${postId}`);
            }
            postData = {
              ...postData,
              pet: petData,
              user: userData,
            };
          } catch (error) {
            console.error(`[userService.getAdminPostDetails] Retry - Error enriching post ${postId}:`, error.response?.data || error.message, { status: error.response?.status });
          }
          console.log('[userService.getAdminPostDetails] Retry - Final post data:', postData);
          return postData;
        } catch (refreshError) {
          console.error('[userService.getAdminPostDetails] Refresh token failed:', refreshError);
          throw new Error('Session expired or insufficient permissions. Please log in again as an admin or moderator.');
        }
      }
      console.error('[userService.getAdminPostDetails] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch post details.');
    }
  },

  deletePost: async (postId) => {
    if (!postId) throw new Error('Post ID is required');
    try {
      const response = await apiClient.delete(`/users/admin/posts/${postId}/`);
      return response.data;
    } catch (error) {
      console.error('[userService.deletePost] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to delete post.');
    }
  },

  getUserPosts: async () => {
    try {
      const response = await apiClient.get('/users/posts/');
      if (!Array.isArray(response.data)) {
        console.warn('[userService.getUserPosts] Expected array, got:', response.data);
        return [];
      }
      
      console.log('[userService.getUserPosts] Raw posts:', response.data);
      
      // Enrich posts with pet details
      const enrichedPosts = await Promise.all(
        response.data.map(async (post) => {
          try {
            // Handle different possible data structures
            let petId = null;
            if (post.pet) {
              petId = typeof post.pet === 'object' ? post.pet.id : post.pet;
            } else if (post.pet_id) {
              petId = post.pet_id;
            }
            
            if (petId) {
              const petResponse = await apiClient.get(`/pets/${petId}/`);
              console.log(`[userService.getUserPosts] Fetched pet details for pet ${petId}:`, petResponse.data);
              return {
                ...post,
                pet: petResponse.data,
                pet_id: petId // Ensure pet_id is always available
              };
            } else {
              console.warn(`[userService.getUserPosts] No pet ID found for post ${post.id}`);
              return post;
            }
          } catch (error) {
            console.error(`[userService.getUserPosts] Error fetching pet details for post ${post.id}:`, error);
            // Return the post with whatever data we have
            return {
              ...post,
              pet_id: post.pet_id || (typeof post.pet === 'number' ? post.pet : null)
            };
          }
        })
      );
      
      console.log('[userService.getUserPosts] Enriched posts:', enrichedPosts);
      return enrichedPosts;
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          await userService.refreshToken();
          const retryResponse = await apiClient.get('/users/posts/');
          if (!Array.isArray(retryResponse.data)) {
            console.warn('[userService.getUserPosts] Retry - Expected array, got:', retryResponse.data);
            return [];
          }
          
          console.log('[userService.getUserPosts] Retry - Raw posts:', retryResponse.data);
          
          // Enrich posts with pet details
          const enrichedPosts = await Promise.all(
            retryResponse.data.map(async (post) => {
              try {
                // Handle different possible data structures
                let petId = null;
                if (post.pet) {
                  petId = typeof post.pet === 'object' ? post.pet.id : post.pet;
                } else if (post.pet_id) {
                  petId = post.pet_id;
                }
                
                if (petId) {
                  const petResponse = await apiClient.get(`/pets/${petId}/`);
                  console.log(`[userService.getUserPosts] Retry - Fetched pet details for pet ${petId}:`, petResponse.data);
                  return {
                    ...post,
                    pet: petResponse.data,
                    pet_id: petId // Ensure pet_id is always available
                  };
                } else {
                  console.warn(`[userService.getUserPosts] Retry - No pet ID found for post ${post.id}`);
                  return post;
                }
              } catch (error) {
                console.error(`[userService.getUserPosts] Retry - Error fetching pet details for post ${post.id}:`, error);
                // Return the post with whatever data we have
                return {
                  ...post,
                  pet_id: post.pet_id || (typeof post.pet === 'number' ? post.pet : null)
                };
              }
            })
          );
          
          console.log('[userService.getUserPosts] Retry - Enriched posts:', enrichedPosts);
          return enrichedPosts;
        } catch (refreshError) {
          console.error('[userService.getUserPosts] Refresh token failed:', refreshError);
          throw new Error('Session expired. Please log in again.');
        }
      }
      console.error('[userService.getUserPosts] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch user posts.');
    }
  },

  createPost: async (petId) => {
    if (!petId) throw new Error('Pet ID is required');
    try {
      const response = await apiClient.post('/users/posts/create/', { pet: petId });
      return response.data;
    } catch (error) {
      console.error('[userService.createPost] Error:', error.message, error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to create post.');
    }
  },
};

export default userService;