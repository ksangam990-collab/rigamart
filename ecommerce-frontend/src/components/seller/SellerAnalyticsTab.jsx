import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Award,
  Layers,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  Truck,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import api from '../../utils/api.js';

export default function SellerAnalyticsTab({ statusCounts = {} }) {
  const [range, setRange] = useState('30d'); // '7d' | '30d' | '90d' | 'all'
  const [metricMode, setMetricMode] = useState('revenue'); // 'revenue' | 'units'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/seller/analytics?range=${range}`);
      setAnalyticsData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to fetch seller analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const timeline = analyticsData?.timeline || [];
  const topProducts = analyticsData?.topProducts || [];
  const categories = analyticsData?.categoryPerformance || [];
  const summary = analyticsData?.summary || {
    periodRevenue: 0,
    periodUnits: 0,
    periodOrders: 0,
    averageOrderValue: 0
  };

  // SVG Chart Geometry Calculations
  const chartWidth = 800;
  const chartHeight = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 65 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const values = timeline.map((d) => (metricMode === 'revenue' ? d.revenue : d.unitsSold));
  const maxVal = Math.max(...values, metricMode === 'revenue' ? 1000 : 10);

  // Compute X and Y coordinates for each day
  const points = timeline.map((d, index) => {
    const x =
      timeline.length > 1
        ? padding.left + (index / (timeline.length - 1)) * innerWidth
        : padding.left + innerWidth / 2;
    const val = metricMode === 'revenue' ? d.revenue : d.unitsSold;
    const y = padding.top + innerHeight - (val / maxVal) * innerHeight;
    return { ...d, x, y, val };
  });

  // Construct SVG Path strings
  const linePath = points.length
    ? points.reduce(
        (acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
        ''
      )
    : '';

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x},${padding.top + innerHeight} L ${
        points[0].x
      },${padding.top + innerHeight} Z`
    : '';

  // Format currency helper
  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  // Format compact Y-axis numbers (e.g. ₹10k, ₹50k)
  const formatYAxis = (val) => {
    if (metricMode === 'units') return Math.round(val);
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
    return `₹${Math.round(val)}`;
  };

  // Status meter data
  const totalStatusOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;
  const statuses = [
    { label: 'Delivered', count: statusCounts.Delivered || 0, color: 'bg-success', icon: CheckCircle2, text: 'text-success' },
    { label: 'Shipped', count: statusCounts.Shipped || 0, color: 'bg-accent', icon: Truck, text: 'text-accent' },
    { label: 'Confirmed', count: statusCounts.Confirmed || 0, color: 'bg-brand', icon: Clock, text: 'text-brand' },
    { label: 'Placed', count: statusCounts.Placed || 0, color: 'bg-warning', icon: Package, text: 'text-warning' },
    { label: 'Cancelled', count: statusCounts.Cancelled || 0, color: 'bg-danger', icon: AlertTriangle, text: 'text-danger' },
    { label: 'Returned', count: statusCounts.Returned || 0, color: 'bg-muted', icon: RotateCcw, text: 'text-muted' }
  ];

  const highestSellingProductRevenue = topProducts[0]?.totalRevenue || 1;

  return (
    <div className="space-y-8">
      {/* Controls Bar: Range & Metric Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-line shadow-xs">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand" />
            Merchant Sales Performance & Revenue Intelligence
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Real-time visual breakdown of revenue, volume, and top product velocity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Pills */}
          <div className="inline-flex rounded-xl bg-canvas border border-line p-1 text-xs font-semibold">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: '1 Year' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRange(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  range === t.id
                    ? 'bg-surface text-ink shadow-xs font-bold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2 text-muted hover:text-brand border border-line rounded-xl hover:bg-canvas transition-colors shadow-2xs"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-surface p-5 rounded-2xl border border-line shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Period Gross Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-success-soft text-success flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink font-mono">
            {formatCurrency(summary.periodRevenue)}
          </div>
          <div className="text-[11px] text-muted">
            Past {analyticsData?.range || range} revenue
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-surface p-5 rounded-2xl border border-line shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Total Units Sold
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink font-mono">
            {summary.periodUnits} units
          </div>
          <div className="text-[11px] text-muted">
            Fulfilled across {summary.periodOrders} orders
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-surface p-5 rounded-2xl border border-line shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Average Order Value (AOV)
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink font-mono">
            {formatCurrency(summary.averageOrderValue)}
          </div>
          <div className="text-[11px] text-muted">
            Average basket size per customer
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-surface p-5 rounded-2xl border border-line shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Delivery Success Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-warning-soft text-warning flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-success font-mono">
            {totalStatusOrders > 0
              ? `${Math.round(((statusCounts.Delivered || 0) / totalStatusOrders) * 100)}%`
              : '100%'}
          </div>
          <div className="text-[11px] text-muted">
            {statusCounts.Delivered || 0} successful deliveries
          </div>
        </motion.div>
      </div>

      {/* Main Revenue Over Time SVG Chart Card */}
      <div className="bg-surface p-6 rounded-2xl border border-line shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              Sales & Revenue Trajectory ({analyticsData?.range || range})
            </h3>
            <p className="text-xs text-muted">
              Interactive timeline graph (hover data points for detailed metrics)
            </p>
          </div>

          {/* Toggle Revenue vs Units */}
          <div className="inline-flex rounded-lg bg-canvas border border-line p-0.5 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMetricMode('revenue')}
              className={`px-3 py-1 rounded-md transition-all ${
                metricMode === 'revenue'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Revenue (₹)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('units')}
              className={`px-3 py-1 rounded-md transition-all ${
                metricMode === 'units'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Units Sold
            </button>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative w-full overflow-x-auto pt-2">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            </div>
          ) : points.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted space-y-2">
              <TrendingUp className="w-8 h-8 text-muted/60" />
              <p className="text-xs">No orders recorded in this date range.</p>
            </div>
          ) : (
            <div className="min-w-[640px]">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible select-none"
              >
                <defs>
                  {/* Royal Sapphire brand gradient fill */}
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="#2563EB" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.00" />
                  </linearGradient>

                  <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Horizontal Grid Lines & Labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = padding.top + innerHeight * (1 - ratio);
                  const labelVal = maxVal * ratio;
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="currentColor"
                        className="text-line/40"
                        strokeDasharray={ratio > 0 && ratio < 1 ? '4 4' : '0'}
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-muted font-mono font-medium"
                      >
                        {formatYAxis(labelVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Gradient Area Fill */}
                <path d={areaPath} fill="url(#revenueGradient)" />

                {/* Main Curve Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#lineGlow)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points on Line */}
                {points.map((pt, idx) => {
                  const isHovered = hoveredPoint?.date === pt.date;
                  return (
                    <g key={pt.date || idx}>
                      {/* Invisible hover hotspot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="14"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />

                      {/* Visible interactive dot */}
                      {(isHovered || pt.val > 0 || points.length <= 14) && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? '6' : '3.5'}
                          className={`transition-all duration-150 ${
                            isHovered
                              ? 'fill-surface stroke-brand stroke-[3px]'
                              : pt.val > 0
                              ? 'fill-brand'
                              : 'fill-line'
                          }`}
                        />
                      )}
                    </g>
                  );
                })}

                {/* X-Axis Dates Labels (Show spaced sample to prevent overlap) */}
                {points.map((pt, idx) => {
                  const step = Math.max(1, Math.floor(points.length / 7));
                  const isKeyTick = idx % step === 0 || idx === points.length - 1;
                  if (!isKeyTick) return null;

                  const dateObj = new Date(pt.date);
                  const label = dateObj.toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <text
                      key={pt.date}
                      x={pt.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      className="text-[10px] fill-muted font-medium font-mono"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>

              {/* Floating Tooltip upon hover */}
              <AnimatePresence>
                {hoveredPoint && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bg-surface border border-line text-ink px-3.5 py-2.5 rounded-xl shadow-xl pointer-events-none text-xs z-30 space-y-1"
                    style={{
                      left: `${Math.min(Math.max(10, (hoveredPoint.x / chartWidth) * 100), 85)}%`,
                      top: '15px'
                    }}
                  >
                    <p className="font-bold text-muted text-[11px] border-b border-line pb-1">
                      {new Date(hoveredPoint.date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted">Revenue:</span>
                      <span className="font-bold text-brand font-mono">
                        {formatCurrency(hoveredPoint.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted">Units Sold:</span>
                      <span className="font-bold text-ink font-mono">
                        {hoveredPoint.unitsSold} units
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted">Orders:</span>
                      <span className="font-bold text-ink font-mono">
                        {hoveredPoint.orderCount}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Grid: Order Fulfillment Breakdown & Top Products Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Status Distribution Card */}
        <div className="bg-surface p-6 rounded-2xl border border-line shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Package className="w-4 h-4 text-brand" />
                Order Pipeline & Fulfillment Status
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Distribution across all customer orders ({totalStatusOrders} total)
              </p>
            </div>
          </div>

          {/* Proportional Multi-Segment Progress Bar */}
          <div className="h-4 bg-canvas border border-line/40 rounded-full overflow-hidden flex shadow-inner">
            {statuses.map((s) => {
              const widthPct = (s.count / totalStatusOrders) * 100;
              if (widthPct === 0) return null;
              return (
                <div
                  key={s.label}
                  style={{ width: `${widthPct}%` }}
                  className={`${s.color} h-full transition-all duration-500`}
                  title={`${s.label}: ${s.count} (${widthPct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Status Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statuses.map((s) => {
              const Icon = s.icon;
              const pct = Math.round((s.count / totalStatusOrders) * 100);
              return (
                <div
                  key={s.label}
                  className="p-3 bg-canvas rounded-xl border border-line space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-muted">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.color}`} />
                      {s.label}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-muted" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-ink font-mono">{s.count}</span>
                    <span className="text-[11px] font-mono text-muted">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top-Selling Products Leaderboard Card */}
        <div className="bg-surface p-6 rounded-2xl border border-line shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Award className="w-4 h-4 text-brand" />
                Top Performing Products
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Highest velocity listings by revenue and units in this timeframe
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand/10 text-brand rounded-full">
              Top 5
            </span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-muted space-y-1">
              <ShoppingBag className="w-8 h-8 mx-auto text-muted/60" />
              <p className="text-xs">No sales recorded yet for this period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((prod, idx) => {
                const relativePct = Math.round(
                  (prod.totalRevenue / highestSellingProductRevenue) * 100
                );

                return (
                  <div
                    key={prod._id || idx}
                    className="p-3 rounded-xl border border-line hover:border-brand/40 hover:bg-canvas/50 transition-all flex items-center gap-3.5"
                  >
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-warning-soft text-warning'
                          : idx === 1
                          ? 'bg-canvas text-ink border border-line'
                          : idx === 2
                          ? 'bg-brand/10 text-brand'
                          : 'bg-canvas text-muted'
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-11 h-11 rounded-lg bg-canvas overflow-hidden shrink-0 border border-line">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Title & relative bar */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-ink truncate">
                          {prod.name}
                        </h4>
                        <span className="text-xs font-bold text-ink font-mono whitespace-nowrap">
                          {formatCurrency(prod.totalRevenue)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted">
                        <span>{prod.totalUnits} units sold</span>
                        <span className="font-mono text-[10px]">{relativePct}% share</span>
                      </div>

                      <div className="h-1.5 bg-canvas border border-line/40 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${relativePct}%` }}
                          className="h-full bg-brand rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Performance Breakdown Card */}
      {categories.length > 0 && (
        <div className="bg-surface p-6 rounded-2xl border border-line shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand" />
                Category Sales Distribution
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Revenue contribution grouped by store product categories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={cat.categoryName || idx}
                className="p-4 bg-canvas rounded-xl border border-line space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink truncate">
                    {cat.categoryName}
                  </span>
                  <span className="text-xs font-bold text-brand font-mono">
                    {formatCurrency(cat.revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>{cat.unitsSold} units ordered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
