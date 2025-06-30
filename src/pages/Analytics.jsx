import React, { useState, useEffect } from "react";
import { fetchInterviews, fetchChallenges } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Clock, Star, Award, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { getUser } from '../api/auth';
import { supabase } from '../api/supabase';

export default function Analytics() {
  const [interviews, setInterviews] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [timeRange, setTimeRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const authUser = await getUser();
      const { data: dbUser, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();
      if (userErr) throw userErr;
      const [interviewsData, challengesData] = await Promise.all([
        fetchInterviews(dbUser.company_id),
        fetchChallenges()
      ]);
      setInterviews(interviewsData);
      setChallenges(challengesData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
    setIsLoading(false);
  };

  // Filter data based on time range
  const getFilteredInterviews = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return interviews.filter(interview => 
      new Date(interview.created_date) >= cutoffDate
    );
  };

  const filteredInterviews = getFilteredInterviews();

  // Analytics calculations
  const stats = {
    totalInterviews: filteredInterviews.length,
    completedInterviews: filteredInterviews.filter(i => i.status === 'completed').length,
    averageScore: filteredInterviews
      .filter(i => i.evaluation?.overall_score)
      .reduce((sum, i) => sum + i.evaluation.overall_score, 0) / 
      filteredInterviews.filter(i => i.evaluation?.overall_score).length || 0,
    hireRate: filteredInterviews.filter(i => 
      i.evaluation?.recommendation === 'hire' || i.evaluation?.recommendation === 'strong_hire'
    ).length / filteredInterviews.filter(i => i.evaluation?.recommendation).length * 100 || 0
  };

  // Chart data
  const statusData = [
    { name: 'Scheduled', value: filteredInterviews.filter(i => i.status === 'scheduled').length },
    { name: 'In Progress', value: filteredInterviews.filter(i => i.status === 'in_progress').length },
    { name: 'Completed', value: filteredInterviews.filter(i => i.status === 'completed').length },
    { name: 'Evaluated', value: filteredInterviews.filter(i => i.status === 'evaluated').length },
  ];

  const difficultyData = challenges.map(difficulty => ({
    name: difficulty.difficulty,
    count: challenges.filter(c => c.difficulty === difficulty.difficulty).length
  })).reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.name);
    if (existing) {
      existing.count += curr.count;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Interview Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered insights and performance metrics
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Interviews",
              value: stats.totalInterviews,
              icon: Users,
              color: "from-blue-500 to-cyan-500",
              bgColor: "from-blue-50 to-cyan-50"
            },
            {
              title: "Completed",
              value: stats.completedInterviews,
              icon: Award,
              color: "from-green-500 to-emerald-500",
              bgColor: "from-green-50 to-emerald-50"
            },
            {
              title: "Average Score",
              value: `${stats.averageScore.toFixed(1)}/10`,
              icon: Star,
              color: "from-purple-500 to-pink-500",
              bgColor: "from-purple-50 to-pink-50"
            },
            {
              title: "Hire Rate",
              value: `${stats.hireRate.toFixed(1)}%`,
              icon: TrendingUp,
              color: "from-orange-500 to-red-500",
              bgColor: "from-orange-50 to-red-50"
            }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-0 shadow-lg bg-gradient-to-br ${metric.bgColor}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color}`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Interview Status Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Interview Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Challenge Difficulty Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Challenge Difficulty Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Performance trends will appear here as more interviews are completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Brain className="w-5 h-5" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Key Findings</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    Most candidates perform well on practical coding challenges
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    AI assistance leads to higher quality code submissions
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    Interview completion rates are 23% higher than traditional formats
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Recommendations</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    Consider adding more system design challenges
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    Expand evaluation criteria to include collaboration skills
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    Implement standardized scoring rubrics for consistency
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}