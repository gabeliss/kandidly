import React, { useState, useEffect } from "react";
import { fetchInterviews, fetchChallenges, createInterview } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Send, Plus, User, Building, Clock, Search, CheckCircle, Zap, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { getUser } from '../api/auth';
import { supabase } from '../api/supabase';

import InterviewCard from "../components/interviews/InterviewCard";
import SendChallengeModal from "../components/interviews/SendChallengeModal";
import InterviewDetails from "../components/interviews/InterviewDetails";

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSendChallenge = async (interviewData) => {
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // Challenge link expires in 7 days
      await createInterview({
        ...interviewData,
        sent_date: new Date().toISOString(),
        expires_date: expires.toISOString(),
      });
      setShowSendModal(false);
      loadData();
    } catch (error) {
      console.error("Error sending challenge:", error);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: interviews.length,
    created: interviews.filter(i => i.status === 'created').length,
    sent: interviews.filter(i => i.status === 'sent').length,
    started: interviews.filter(i => i.status === 'started').length,
    submitted: interviews.filter(i => i.status === 'submitted').length,
    evaluated: interviews.filter(i => i.status === 'evaluated').length,
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
              Interview Management
            </h1>
            <p className="text-gray-600 mt-2">
              Send asynchronous challenges and review submissions with AI analysis
            </p>
          </div>
          <Button
            onClick={() => setShowSendModal(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
            Schedule Interview
          </Button>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {[
            { key: 'all', label: 'Total', color: 'from-gray-50 to-gray-100', textColor: 'text-gray-600', icon: User },
            { key: 'created', label: 'Created', color: 'from-yellow-50 to-yellow-100', textColor: 'text-yellow-600', icon: Plus },
            { key: 'sent', label: 'Sent', color: 'from-blue-50 to-cyan-50', textColor: 'text-blue-600', icon: Send },
            { key: 'started', label: 'In Progress', color: 'from-orange-50 to-red-50', textColor: 'text-orange-600', icon: Clock },
            { key: 'submitted', label: 'Submitted', color: 'from-purple-50 to-pink-50', textColor: 'text-purple-600', icon: FileText },
            { key: 'evaluated', label: 'Evaluated', color: 'from-green-50 to-emerald-50', textColor: 'text-green-600', icon: CheckCircle },
          ].map((status) => (
            <Card
              key={status.key}
              className={`border-0 shadow-md bg-gradient-to-br ${status.color} cursor-pointer hover:shadow-lg transition-all duration-200 ${
                statusFilter === status.key ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setStatusFilter(status.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{status.label}</p>
                    <p className={`text-2xl font-bold ${status.textColor}`}>
                      {statusCounts[status.key]}
                    </p>
                  </div>
                  <status.icon className={`w-6 h-6 ${status.textColor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search interviews by candidate, email, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Interviews List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <AnimatePresence>
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <Card className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="flex gap-2">
                              <div className="h-6 bg-gray-200 rounded w-20"></div>
                              <div className="h-6 bg-gray-200 rounded w-24"></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                ) : filteredInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews found</h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Send your first challenge to get started'
                      }
                    </p>
                  </div>
                ) : (
                  filteredInterviews.map((interview, index) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      index={index}
                      onClick={setSelectedInterview}
                      isSelected={selectedInterview?.id === interview.id}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <InterviewDetails
              interview={selectedInterview}
              challenges={challenges}
              onUpdate={loadData}
            />
          </div>
        </div>
      </div>

      <SendChallengeModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSubmit={handleSendChallenge}
        challenges={challenges}
      />
    </div>
  );
}
