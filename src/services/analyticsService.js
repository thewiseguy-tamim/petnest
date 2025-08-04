// src/services/analyticsService.js
import apiClient from './api';

const analyticsService = {
  // Helper function to filter data by date range
  filterByDateRange: (data, dateField, dateRange) => {
    if (!dateRange || dateRange === 'all') return data;
    
    const now = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= now;
    });
  },

  // Calculate growth percentage
  calculateGrowth: (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  },

  // Admin analytics
  getAdminStats: async (dateRange) => {
    try {
      // Fetch all necessary data
      const [users, posts, pets, payments, verificationRequests] = await Promise.all([
        apiClient.get('/users/admin/users/').then(res => res.data),
        apiClient.get('/users/admin/posts/').then(res => res.data),
        apiClient.get('/pets/list/').then(res => res.data),
        apiClient.get('/pets/payment/history/').then(res => res.data).catch(() => []),
        apiClient.get('/users/admin/verification-requests/').then(res => res.data)
      ]);

      // Filter by date range
      const filteredUsers = analyticsService.filterByDateRange(users, 'date_joined', dateRange);
      const filteredPosts = analyticsService.filterByDateRange(posts, 'created_at', dateRange);
      const filteredPets = analyticsService.filterByDateRange(pets, 'created_at', dateRange);
      const filteredPayments = analyticsService.filterByDateRange(payments, 'created_at', dateRange);

      // Calculate previous period for growth
      const previousPeriodUsers = analyticsService.filterByDateRange(users, 'date_joined', 
        dateRange === 'week' ? 'month' : 'year').length;
      const previousPeriodPosts = analyticsService.filterByDateRange(posts, 'created_at', 
        dateRange === 'week' ? 'month' : 'year').length;

      // Calculate stats
      const totalRevenue = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const activeUsers = filteredUsers.filter(user => user.is_active).length;
      const verifiedUsers = filteredUsers.filter(user => user.is_verified).length;
      const pendingVerifications = verificationRequests.filter(req => req.status === 'pending').length;

      return {
        overview: {
          totalUsers: filteredUsers.length,
          activeUsers,
          verifiedUsers,
          totalPosts: filteredPosts.length,
          totalPets: filteredPets.length,
          totalRevenue,
          pendingVerifications
        },
        growth: {
          userGrowth: analyticsService.calculateGrowth(filteredUsers.length, previousPeriodUsers),
          postGrowth: analyticsService.calculateGrowth(filteredPosts.length, previousPeriodPosts),
        },
        userStats: {
          byRole: {
            admin: filteredUsers.filter(u => u.role === 'admin').length,
            moderator: filteredUsers.filter(u => u.role === 'moderator').length,
            client: filteredUsers.filter(u => u.role === 'client').length,
          },
          byStatus: {
            active: activeUsers,
            inactive: filteredUsers.length - activeUsers,
            verified: verifiedUsers,
            unverified: filteredUsers.length - verifiedUsers,
          }
        }
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return null;
    }
  },

  getRevenueData: async (dateRange) => {
    try {
      const payments = await apiClient.get('/pets/payment/history/').then(res => res.data).catch(() => []);
      const filteredPayments = analyticsService.filterByDateRange(payments, 'created_at', dateRange);

      // Group by date for chart data
      const revenueByDate = {};
      filteredPayments.forEach(payment => {
        const date = new Date(payment.created_at).toLocaleDateString();
        if (!revenueByDate[date]) {
          revenueByDate[date] = 0;
        }
        revenueByDate[date] += payment.amount || 0;
      });

      // Calculate summary
      const totalRevenue = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const averageTransaction = filteredPayments.length > 0 ? totalRevenue / filteredPayments.length : 0;

      return {
        summary: {
          totalRevenue,
          totalTransactions: filteredPayments.length,
          averageTransaction: averageTransaction.toFixed(2),
        },
        chartData: Object.entries(revenueByDate).map(([date, amount]) => ({
          date,
          amount
        })).sort((a, b) => new Date(a.date) - new Date(b.date)),
        recentTransactions: filteredPayments.slice(0, 10).map(payment => ({
          id: payment.id,
          amount: payment.amount,
          date: payment.created_at,
          status: payment.status,
          petId: payment.pet_id,
          userId: payment.user_id
        }))
      };
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return null;
    }
  },

  getUserGrowthData: async (dateRange) => {
    try {
      const users = await apiClient.get('/users/admin/users/').then(res => res.data);
      
      // Create date range array
      const now = new Date();
      const dates = [];
      let currentDate = new Date();
      
      switch (dateRange) {
        case 'week':
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            dates.push(date.toLocaleDateString());
          }
          break;
        case 'month':
          for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            dates.push(date.toLocaleDateString());
          }
          break;
        case 'year':
          for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(now.getMonth() - i);
            dates.push(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
          }
          break;
        default:
          dates.push(now.toLocaleDateString());
      }

      // Count users by registration date
      const usersByDate = {};
      dates.forEach(date => usersByDate[date] = 0);

      users.forEach(user => {
        const userDate = new Date(user.date_joined);
        const dateKey = dateRange === 'year' 
          ? userDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          : userDate.toLocaleDateString();
        
        if (usersByDate.hasOwnProperty(dateKey)) {
          usersByDate[dateKey]++;
        }
      });

      // Calculate cumulative growth
      let cumulative = 0;
      const growthData = dates.map(date => {
        cumulative += usersByDate[date];
        return {
          date,
          newUsers: usersByDate[date],
          totalUsers: cumulative
        };
      });

      return {
        chartData: growthData,
        summary: {
          totalUsers: users.length,
          newUsersThisPeriod: analyticsService.filterByDateRange(users, 'date_joined', dateRange).length,
          averagePerDay: (growthData.reduce((sum, d) => sum + d.newUsers, 0) / dates.length).toFixed(1)
        }
      };
    } catch (error) {
      console.error('Error fetching user growth data:', error);
      return null;
    }
  },

  getPostsAnalytics: async (dateRange) => {
    try {
      const [posts, pets] = await Promise.all([
        apiClient.get('/users/admin/posts/').then(res => res.data),
        apiClient.get('/pets/list/').then(res => res.data)
      ]);

      const filteredPosts = analyticsService.filterByDateRange(posts, 'created_at', dateRange);
      const filteredPets = analyticsService.filterByDateRange(pets, 'created_at', dateRange);

      // Categorize pets
      const petsByCategory = {};
      const petsByStatus = {
        available: 0,
        adopted: 0,
        pending: 0
      };

      filteredPets.forEach(pet => {
        // By category
        if (!petsByCategory[pet.category]) {
          petsByCategory[pet.category] = 0;
        }
        petsByCategory[pet.category]++;

        // By status
        if (petsByStatus.hasOwnProperty(pet.status)) {
          petsByStatus[pet.status]++;
        }
      });

      // Calculate engagement metrics
      const totalViews = filteredPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      const totalLikes = filteredPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const averageEngagement = filteredPosts.length > 0 
        ? ((totalViews + totalLikes) / filteredPosts.length).toFixed(1) 
        : 0;

      return {
        summary: {
          totalPosts: filteredPosts.length,
          totalPets: filteredPets.length,
          totalViews,
          totalLikes,
          averageEngagement
        },
        petsByCategory: Object.entries(petsByCategory).map(([category, count]) => ({
          category,
          count
        })),
        petsByStatus,
        topPosts: filteredPosts
          .sort((a, b) => (b.views || 0) + (b.likes || 0) - (a.views || 0) - (a.likes || 0))
          .slice(0, 5)
          .map(post => ({
            id: post.id,
            title: post.title,
            views: post.views || 0,
            likes: post.likes || 0,
            created_at: post.created_at
          }))
      };
    } catch (error) {
      console.error('Error fetching posts analytics:', error);
      return null;
    }
  },

  // Moderator analytics
  getModeratorStats: async (dateRange) => {
    try {
      const [verificationRequests, posts, users] = await Promise.all([
        apiClient.get('/users/admin/verification-requests/').then(res => res.data),
        apiClient.get('/users/admin/posts/').then(res => res.data),
        apiClient.get('/users/admin/users/').then(res => res.data)
      ]);

      const filteredRequests = analyticsService.filterByDateRange(verificationRequests, 'created_at', dateRange);
      const filteredPosts = analyticsService.filterByDateRange(posts, 'created_at', dateRange);

      // Calculate moderation metrics
      const pendingVerifications = filteredRequests.filter(req => req.status === 'pending').length;
      const approvedVerifications = filteredRequests.filter(req => req.status === 'approved').length;
      const rejectedVerifications = filteredRequests.filter(req => req.status === 'rejected').length;

      const flaggedPosts = filteredPosts.filter(post => post.is_flagged || post.status === 'flagged').length;
      const reportedUsers = users.filter(user => user.is_reported || user.reports_count > 0).length;

      return {
        overview: {
          pendingVerifications,
          totalVerificationRequests: filteredRequests.length,
          flaggedPosts,
          reportedUsers
        },
        verificationStats: {
          pending: pendingVerifications,
          approved: approvedVerifications,
          rejected: rejectedVerifications,
          approvalRate: filteredRequests.length > 0 
            ? ((approvedVerifications / filteredRequests.length) * 100).toFixed(1) 
            : 0
        },
        recentActivity: {
          recentVerifications: filteredRequests.slice(0, 10).map(req => ({
            id: req.id,
            userId: req.user_id,
            status: req.status,
            created_at: req.created_at,
            reviewed_at: req.reviewed_at
          })),
          recentFlaggedPosts: filteredPosts
            .filter(post => post.is_flagged || post.status === 'flagged')
            .slice(0, 10)
        }
      };
    } catch (error) {
      console.error('Error fetching moderator stats:', error);
      return null;
    }
  },

  // Client analytics
  getClientStats: async () => {
    try {
      const [profile, userPosts, conversations] = await Promise.all([
        apiClient.get('/users/profile/').then(res => res.data),
        apiClient.get('/users/posts/').then(res => res.data),
        apiClient.get('/messenger/messages/conversations/').then(res => res.data).catch(() => [])
      ]);

      // Calculate engagement metrics
      const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
      const unreadMessages = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

      return {
        profile: {
          username: profile.username,
          email: profile.email,
          isVerified: profile.is_verified,
          joinDate: profile.date_joined,
          role: profile.role
        },
        stats: {
          totalPosts: userPosts.length,
          totalViews,
          totalLikes,
          averageEngagement: userPosts.length > 0 
            ? ((totalViews + totalLikes) / userPosts.length).toFixed(1) 
            : 0,
          activeConversations: conversations.length,
          unreadMessages
        },
        recentPosts: userPosts.slice(0, 5).map(post => ({
          id: post.id,
          title: post.title,
          views: post.views || 0,
          likes: post.likes || 0,
          created_at: post.created_at
        }))
      };
    } catch (error) {
      console.error('Error fetching client stats:', error);
      return null;
    }
      },

  // Additional utility functions for advanced analytics

  // Get trending pets based on views and inquiries
  getTrendingPets: async (limit = 10) => {
    try {
      const pets = await apiClient.get('/pets/list/').then(res => res.data);
      
      // Sort by views, likes, or other engagement metrics
      const sortedPets = pets
        .filter(pet => pet.status === 'available')
        .sort((a, b) => {
          const scoreA = (a.views || 0) + (a.inquiries || 0) * 2;
          const scoreB = (b.views || 0) + (b.inquiries || 0) * 2;
          return scoreB - scoreA;
        })
        .slice(0, limit);

      return sortedPets.map(pet => ({
        id: pet.id,
        name: pet.name,
        category: pet.category,
        views: pet.views || 0,
        inquiries: pet.inquiries || 0,
        score: (pet.views || 0) + (pet.inquiries || 0) * 2,
        image: pet.images?.[0]?.url || null
      }));
    } catch (error) {
      console.error('Error fetching trending pets:', error);
      return [];
    }
  },

  // Get user activity heatmap data
  getUserActivityHeatmap: async (userId = null) => {
    try {
      const endpoint = userId 
        ? `/users/admin/users/${userId}/` 
        : '/users/posts/';
      
      const data = await apiClient.get(endpoint).then(res => res.data);
      const posts = Array.isArray(data) ? data : data.posts || [];

      // Create heatmap data (hour x day of week)
      const heatmapData = Array(7).fill(null).map(() => Array(24).fill(0));
      
      posts.forEach(post => {
        const date = new Date(post.created_at);
        const dayOfWeek = date.getDay();
        const hour = date.getHours();
        heatmapData[dayOfWeek][hour]++;
      });

      return {
        heatmap: heatmapData,
        mostActiveDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
          heatmapData.reduce((maxDay, day, index, arr) => 
            day.reduce((a, b) => a + b) > arr[maxDay].reduce((a, b) => a + b) ? index : maxDay, 0)
        ],
        mostActiveHour: heatmapData.flat().reduce((maxHour, count, index, arr) => 
          count > arr[maxHour] ? index % 24 : maxHour, 0)
      };
    } catch (error) {
      console.error('Error fetching activity heatmap:', error);
      return null;
    }
  },

  // Get conversion funnel data
  getConversionFunnel: async (dateRange) => {
    try {
      const [users, pets, messages, payments] = await Promise.all([
        apiClient.get('/users/admin/users/').then(res => res.data),
        apiClient.get('/pets/list/').then(res => res.data),
        apiClient.get('/messenger/messages/conversations/').then(res => res.data).catch(() => []),
        apiClient.get('/pets/payment/history/').then(res => res.data).catch(() => [])
      ]);

      const filteredUsers = analyticsService.filterByDateRange(users, 'date_joined', dateRange);
      const filteredPets = analyticsService.filterByDateRange(pets, 'created_at', dateRange);
      const filteredPayments = analyticsService.filterByDateRange(payments, 'created_at', dateRange);

      // Calculate funnel stages
      const totalVisitors = filteredUsers.length;
      const usersWithPosts = new Set(filteredPets.map(pet => pet.user_id)).size;
      const usersWithMessages = new Set(messages.map(msg => msg.sender_id)).size;
      const usersWithPayments = new Set(filteredPayments.map(payment => payment.user_id)).size;

      return {
        stages: [
          {
            name: 'Registered Users',
            count: totalVisitors,
            percentage: 100
          },
          {
            name: 'Posted Pets',
            count: usersWithPosts,
            percentage: totalVisitors > 0 ? (usersWithPosts / totalVisitors * 100).toFixed(1) : 0
          },
          {
            name: 'Engaged (Messages)',
            count: usersWithMessages,
            percentage: totalVisitors > 0 ? (usersWithMessages / totalVisitors * 100).toFixed(1) : 0
          },
          {
            name: 'Completed Transaction',
            count: usersWithPayments,
            percentage: totalVisitors > 0 ? (usersWithPayments / totalVisitors * 100).toFixed(1) : 0
          }
        ],
        conversionRate: totalVisitors > 0 ? (usersWithPayments / totalVisitors * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error fetching conversion funnel:', error);
      return null;
    }
  },

  // Get geographic distribution of users/pets
  getGeographicDistribution: async () => {
    try {
      const [users, pets] = await Promise.all([
        apiClient.get('/users/admin/users/').then(res => res.data),
        apiClient.get('/pets/list/').then(res => res.data)
      ]);

      // Group by location (assuming users/pets have location data)
      const usersByLocation = {};
      const petsByLocation = {};

      users.forEach(user => {
        const location = user.city || user.state || 'Unknown';
        usersByLocation[location] = (usersByLocation[location] || 0) + 1;
      });

      pets.forEach(pet => {
        const location = pet.location || 'Unknown';
        petsByLocation[location] = (petsByLocation[location] || 0) + 1;
      });

      return {
        users: Object.entries(usersByLocation)
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        pets: Object.entries(petsByLocation)
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching geographic distribution:', error);
      return null;
    }
  },

  // Get performance metrics
  getPerformanceMetrics: async (dateRange) => {
    try {
      const [posts, pets, messages] = await Promise.all([
        apiClient.get('/users/admin/posts/').then(res => res.data),
        apiClient.get('/pets/list/').then(res => res.data),
        apiClient.get('/messenger/messages/conversations/').then(res => res.data).catch(() => [])
      ]);

      const filteredPosts = analyticsService.filterByDateRange(posts, 'created_at', dateRange);
      const filteredPets = analyticsService.filterByDateRange(pets, 'created_at', dateRange);

      // Calculate response times (if available in message data)
      const responseTimesInHours = messages
        .filter(conv => conv.first_response_time)
        .map(conv => conv.first_response_time / 3600); // Convert to hours

      const avgResponseTime = responseTimesInHours.length > 0
        ? (responseTimesInHours.reduce((a, b) => a + b) / responseTimesInHours.length).toFixed(1)
        : 'N/A';

      // Calculate adoption rate
      const adoptedPets = filteredPets.filter(pet => pet.status === 'adopted').length;
      const adoptionRate = filteredPets.length > 0
        ? (adoptedPets / filteredPets.length * 100).toFixed(1)
        : 0;

      return {
        engagement: {
          avgPostsPerUser: (filteredPosts.length / new Set(filteredPosts.map(p => p.user_id)).size).toFixed(1),
          avgResponseTime: avgResponseTime + ' hours',
          adoptionRate: adoptionRate + '%'
        },
        quality: {
          verifiedUserPosts: filteredPosts.filter(p => p.user?.is_verified).length,
          postsWithImages: filteredPosts.filter(p => p.images?.length > 0).length,
          completePetProfiles: filteredPets.filter(p => 
            p.name && p.description && p.age && p.category && p.images?.length > 0
          ).length
        }
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return null;
    }
  },

  // Export analytics data
  exportAnalyticsData: async (type, dateRange) => {
    try {
      let data;
      switch (type) {
        case 'users':
          data = await apiClient.get('/users/admin/users/').then(res => res.data);
          break;
        case 'pets':
          data = await apiClient.get('/pets/list/').then(res => res.data);
          break;
        case 'revenue':
          data = await apiClient.get('/pets/payment/history/').then(res => res.data);
          break;
        default:
          throw new Error('Invalid export type');
      }

      const filteredData = analyticsService.filterByDateRange(data, 'created_at', dateRange);
      
      // Convert to CSV format
      const headers = Object.keys(filteredData[0] || {}).join(',');
      const rows = filteredData.map(item => 
        Object.values(item).map(val => 
          typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      return { success: false, error: error.message };
    }
  }
};

export default analyticsService;