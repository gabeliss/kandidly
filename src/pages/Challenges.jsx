import React, { useState, useEffect } from "react";
import { fetchChallenges, createChallenge } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Code, 
  ExternalLink,
  Star,
  Users,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ChallengeCard from "../components/challenges/ChallengeCard";
import CreateChallengeModal from "../components/challenges/CreateChallengeModal";
import ChallengeFilters from "../components/challenges/ChallengeFilters";
import SendChallengeModal from "../components/interviews/SendChallengeModal"; // New Import

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false); // New state
  const [selectedChallenge, setSelectedChallenge] = useState(null); // New state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    difficulty: "all",
    category: "all",
    duration: "all"
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, searchTerm, filters]);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const data = await fetchChallenges("-created_date");
      setChallenges(data);
    } catch (error) {
      console.error("Error loading challenges:", error);
    }
    setIsLoading(false);
  };

  const filterChallenges = () => {
    let filtered = challenges;

    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.difficulty !== "all") {
      filtered = filtered.filter(challenge => challenge.difficulty === filters.difficulty);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter(challenge => challenge.category === filters.category);
    }

    if (filters.duration !== "all") {
      const [min, max] = filters.duration.split("-").map(Number);
      filtered = filtered.filter(challenge => {
        const duration = challenge.estimated_duration;
        return duration >= min && (max ? duration <= max : true);
      });
    }

    setFilteredChallenges(filtered);
  };

  const handleCreateChallenge = async (challengeData) => {
    try {
      await createChallenge(challengeData);
      setShowCreateModal(false);
      loadChallenges();
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  // New function to handle using a challenge (opening SendChallengeModal)
  const handleUseChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setShowSendModal(true);
  };

  // New function to handle sending a challenge
  const handleSendChallenge = async (interviewData) => {
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // Challenge link expires in 7 days
      
      const { Interview } = await import("@/api/entities");
      await Interview.create({
        ...interviewData,
        challenge_id: selectedChallenge.id,
        sent_date: new Date().toISOString(),
        expires_date: expires.toISOString(),
      });
      
      setShowSendModal(false);
      setSelectedChallenge(null);
    } catch (error) {
      console.error("Error sending challenge:", error);
    }
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
              Challenge Library
            </h1>
            <p className="text-gray-600 mt-2">
              Curated coding challenges designed for AI-assisted development
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4" />
            Create Challenge
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <ChallengeFilters filters={filters} setFilters={setFilters} />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Challenges</p>
                  <p className="text-xl font-bold text-gray-900">{challenges.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Popular</p>
                  <p className="text-xl font-bold text-gray-900">
                    {challenges.filter(c => c.difficulty === 'mid').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-xl font-bold text-gray-900">
                    {challenges.filter(c => c.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">AI-Ready</p>
                  <p className="text-xl font-bold text-gray-900">{challenges.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : filteredChallenges.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredChallenges.map((challenge, index) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  index={index}
                  onUseChallenge={handleUseChallenge} // Pass the new handler
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <CreateChallengeModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateChallenge}
      />

      {/* New SendChallengeModal component */}
      <SendChallengeModal
        isOpen={showSendModal}
        onClose={() => {
          setShowSendModal(false);
          setSelectedChallenge(null); // Clear selected challenge on close
        }}
        onSubmit={handleSendChallenge}
        challenges={[selectedChallenge].filter(Boolean)} // Ensure selectedChallenge is in an array if not null
        preSelectedChallenge={selectedChallenge}
      />
    </div>
  );
}
