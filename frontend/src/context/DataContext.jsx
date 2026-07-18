import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getStats, getBills, getTickets } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // Dashboard state
  const [stats, setStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // History state
  const [historyBills, setHistoryBills] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 0 });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lastHistoryParams, setLastHistoryParams] = useState(null);

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Ref for polling interval to prevent multiple intervals
  const pollingRef = useRef(null);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async (showSilent = false) => {
    if (!isAuthenticated) return;
    if (!stats) setLoadingDashboard(true);
    try {
      const [statsRes, billsRes] = await Promise.all([
        getStats(),
        getBills({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (billsRes.data.success) {
        setRecentBills(billsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (!showSilent) toast.error('Failed to load dashboard data');
    } finally {
      setLoadingDashboard(false);
    }
  }, [isAuthenticated, stats]);

  // Fetch History Data
  const fetchHistoryData = useCallback(async (params = {}, showSilent = false) => {
    if (!isAuthenticated) return;
    
    // Check if params changed from last time
    const paramsStr = JSON.stringify(params);
    const lastParamsStr = JSON.stringify(lastHistoryParams);
    
    if (historyBills.length === 0 || paramsStr !== lastParamsStr) {
      setLoadingHistory(true);
    }
    
    try {
      const { data } = await getBills(params);
      if (data.success) {
        setHistoryBills(data.data);
        setPagination(data.pagination);
        setLastHistoryParams(params);
      }
    } catch (error) {
      console.error('Failed to load bills:', error);
      if (!showSilent) toast.error('Failed to load bills');
    } finally {
      setLoadingHistory(false);
    }
  }, [isAuthenticated, historyBills.length, lastHistoryParams]);

  // Process Analytics client-side helper
  const processAnalytics = useCallback((allBills) => {
    if (!allBills || allBills.length === 0) {
      setAnalytics(null);
      return;
    }

    const completedBills = allBills.filter(b => b.status === 'completed');

    // 1. Core KPIs
    const totalAmount = completedBills.reduce((sum, b) => sum + (b.amount || 0), 0);
    const avgAmount = completedBills.length > 0 ? totalAmount / completedBills.length : 0;

    // Vendor counts
    const vendorCounts = {};
    completedBills.forEach(b => {
      const v = b.vendorName || 'Unknown';
      vendorCounts[v] = (vendorCounts[v] || 0) + 1;
    });
    let peakVendor = 'N/A';
    let maxVendorCount = 0;
    Object.entries(vendorCounts).forEach(([vendor, count]) => {
      if (count > maxVendorCount) {
        maxVendorCount = count;
        peakVendor = vendor;
      }
    });

    // Platform counts
    const platformCounts = {};
    completedBills.forEach(b => {
      const p = b.platform || b.supplierPlatform || 'other';
      platformCounts[p] = (platformCounts[p] || 0) + 1;
    });
    let topPlatform = 'N/A';
    let maxPlatformCount = 0;
    Object.entries(platformCounts).forEach(([plat, count]) => {
      if (count > maxPlatformCount) {
        maxPlatformCount = count;
        topPlatform = plat;
      }
    });

    // Return rates
    const totalCount = allBills.length;
    const returnCount = allBills.filter(b => b.billType === 'return').length;
    const returnRate = totalCount > 0 ? (returnCount / totalCount) * 100 : 0;

    // 2. Bills per month (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyData[key] = { count: 0, amount: 0 };
    }

    allBills.forEach(b => {
      const date = b.createdAt ? new Date(b.createdAt) : null;
      if (date) {
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        if (monthlyData[key] !== undefined) {
          monthlyData[key].count += 1;
          if (b.status === 'completed' && b.amount) {
            monthlyData[key].amount += b.amount;
          }
        }
      }
    });

    // 3. Bills per day (last 7 days trend)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      dailyData.push({ label: key, dateStr: d.toDateString(), count: 0 });
    }

    allBills.forEach(b => {
      const date = b.createdAt ? new Date(b.createdAt) : null;
      if (date) {
        const dateStr = date.toDateString();
        const found = dailyData.find(item => item.dateStr === dateStr);
        if (found) {
          found.count += 1;
        }
      }
    });

    // 4. Vendor distribution (Top 5 + Others)
    const vendorAmounts = {};
    completedBills.forEach(b => {
      const v = b.vendorName || 'Unknown';
      vendorAmounts[v] = (vendorAmounts[v] || 0) + (b.amount || 0);
    });
    const sortedVendors = Object.entries(vendorAmounts)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    const top5Vendors = sortedVendors.slice(0, 5);
    const otherVendorsAmount = sortedVendors.slice(5).reduce((sum, v) => sum + v.amount, 0);
    const vendorChartData = [...top5Vendors];
    if (otherVendorsAmount > 0) {
      vendorChartData.push({ name: 'Others', amount: otherVendorsAmount });
    }

    // 5. Amount distribution buckets
    const amountBuckets = [
      { label: 'Under ₹1k', min: 0, max: 1000, count: 0 },
      { label: '₹1k - ₹5k', min: 1000, max: 5000, count: 0 },
      { label: '₹5k - ₹10k', min: 5000, max: 10000, count: 0 },
      { label: 'Above ₹10k', min: 10000, max: Infinity, count: 0 },
    ];
    completedBills.forEach(b => {
      const amt = b.amount || 0;
      const bucket = amountBuckets.find(bucket => amt >= bucket.min && amt < bucket.max);
      if (bucket) bucket.count += 1;
    });

    setAnalytics({
      avgAmount,
      peakVendor,
      topPlatform,
      returnRate,
      monthly: Object.entries(monthlyData).map(([label, val]) => ({ label, count: val.count, amount: val.amount })),
      daily: dailyData,
      vendors: vendorChartData,
      amounts: amountBuckets,
    });
  }, []);

  // Fetch Analytics Data
  const fetchAnalyticsData = useCallback(async (showSilent = false) => {
    if (!isAuthenticated) return;
    if (!analytics) setLoadingAnalytics(true);
    try {
      const { data } = await getBills({ page: 1, limit: 500 });
      if (data.success) {
        processAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      if (!showSilent) toast.error('Failed to load analytics data');
    } finally {
      setLoadingAnalytics(false);
    }
  }, [isAuthenticated, analytics, processAnalytics]);

  // Fetch Support Tickets Data
  const fetchTicketsData = useCallback(async (showSilent = false) => {
    if (!isAuthenticated) return;
    if (tickets.length === 0) setLoadingTickets(true);
    try {
      const { data } = await getTickets();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      if (!showSilent) toast.error('Failed to load tickets');
    } finally {
      setLoadingTickets(false);
    }
  }, [isAuthenticated, tickets.length]);

  // Global Refresh all loaded data
  const refreshAllData = useCallback(async (showSilent = false) => {
    if (!isAuthenticated) return;
    await Promise.all([
      fetchDashboardData(showSilent),
      fetchAnalyticsData(showSilent),
      fetchTicketsData(showSilent),
      lastHistoryParams ? fetchHistoryData(lastHistoryParams, showSilent) : fetchHistoryData({}, showSilent),
    ]);
  }, [isAuthenticated, fetchDashboardData, fetchAnalyticsData, fetchTicketsData, fetchHistoryData, lastHistoryParams]);

  // Check if any loaded bills are in "processing" state
  const hasProcessingBills = useCallback(() => {
    const processingInRecent = recentBills.some(b => b.status === 'processing');
    const processingInHistory = historyBills.some(b => b.status === 'processing');
    return processingInRecent || processingInHistory;
  }, [recentBills, historyBills]);

  // Polling logic when bills are in "processing" state
  useEffect(() => {
    if (!isAuthenticated) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const needsPolling = hasProcessingBills();

    if (needsPolling && !pollingRef.current) {
      console.log('[Data Cache] Processing bills detected. Starting background auto-polling (5s)...');
      pollingRef.current = setInterval(() => {
        // Poll silently in the background
        fetchDashboardData(true);
        if (lastHistoryParams) {
          fetchHistoryData(lastHistoryParams, true);
        } else {
          fetchHistoryData({}, true);
        }
        fetchAnalyticsData(true);
      }, 5000);
    } else if (!needsPolling && pollingRef.current) {
      console.log('[Data Cache] No processing bills. Stopping background auto-polling.');
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      // Clean up polling interval on unmount or authentication status change
    };
  }, [isAuthenticated, hasProcessingBills, fetchDashboardData, fetchHistoryData, fetchAnalyticsData, lastHistoryParams]);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Clear cache on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setStats(null);
      setRecentBills([]);
      setHistoryBills([]);
      setPagination({ total: 0, page: 1, limit: 15, pages: 0 });
      setAnalytics(null);
      setTickets([]);
      setLastHistoryParams(null);
    }
  }, [isAuthenticated]);

  return (
    <DataContext.Provider
      value={{
        stats,
        recentBills,
        loadingDashboard,
        fetchDashboardData,

        historyBills,
        pagination,
        loadingHistory,
        fetchHistoryData,
        setHistoryBills, // allow local updates (e.g. on deletion)

        analytics,
        loadingAnalytics,
        fetchAnalyticsData,

        tickets,
        loadingTickets,
        fetchTicketsData,
        setTickets, // allow local updates (e.g. on submission)

        refreshAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
