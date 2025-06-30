import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Building, Send } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusColors = {
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  started: "bg-orange-100 text-orange-800 border-orange-200",
  submitted: "bg-purple-100 text-purple-800 border-purple-200",
  evaluating: "bg-indigo-100 text-indigo-800 border-indigo-200",
  evaluated: "bg-green-100 text-green-800 border-green-200",
  expired: "bg-red-100 text-red-800 border-red-200"
};

export default function InterviewCard({ interview, index, onClick, isSelected }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => onClick(interview)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {interview.candidate_name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {interview.position} at {interview.company}
              </p>
              <p className="text-sm text-gray-500">
                {interview.candidate_email}
              </p>
            </div>
            <Badge 
              variant="secondary"
              className={`${statusColors[interview.status]} border font-medium`}
            >
              {interview.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="space-y-2">
            {interview.sent_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Send className="w-4 h-4" />
                <span>
                  Sent: {format(parseISO(interview.sent_date), "MMM d, yyyy")}
                </span>
              </div>
            )}
            
            {interview.expires_date && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Expires: {format(parseISO(interview.expires_date), "MMM d, yyyy")}</span>
                </div>
            )}
          </div>

          {interview.evaluation?.overall_score && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${(interview.evaluation.overall_score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {interview.evaluation.overall_score}/10
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}