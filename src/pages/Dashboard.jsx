import React, { useState, useEffect } from "react";
import { fetchInterviews, fetchChallenges } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Calendar, 
  Users, 
  Code, 
  TrendingUp, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Zap,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { getUser } from '../api/auth';
import { supabase } from '../api/supabase';

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentInterviews from "../components/dashboard/RecentInterviews";
import QuickActions from "../components/dashboard/QuickActions";
import UpcomingInterviews from "../components/dashboard/UpcomingInterviews";

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const [challenges, setChallenges] = useState([]);
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
        fetchInterviews(dbUser.company_id, 50),
        fetchChallenges(20)
      ]);
      setInterviews(interviewsData);
      setChallenges(challengesData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const stats = {
    totalInterviews: interviews.length,
    activeInterviews: interviews.filter(i => i.status === 'in_progress').length,
    completedInterviews: interviews.filter(i => i.status === 'completed').length,
    totalChallenges: challenges.length,
    upcomingInterviews: interviews.filter(i => 
      i.status === 'scheduled' && 
      new Date(i.scheduled_date) > new Date()
    )
  };

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
              Interview Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered technical interviews for the modern era
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("Challenges")}>
              <Button variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Browse Challenges
              </Button>
            </Link>
            <Link to={createPageUrl("Interviews")}>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4" />
                Schedule Interview
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RecentInterviews interviews={interviews} isLoading={isLoading} />
            <QuickActions />
          </div>
          
          <div className="space-y-8">
            <UpcomingInterviews interviews={stats.upcomingInterviews} isLoading={isLoading} />
            
            {/* AI Features Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Brain className="w-5 h-5" />
                  AI-Powered Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Code Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Automatic evaluation of code quality, architecture, and maintainability
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Feedback</h4>
                    <p className="text-sm text-gray-600">
                      Detailed insights and recommendations for both candidates and interviewers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}