import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Code, Users, Star } from "lucide-react";

const difficultyColors = {
  junior: "bg-green-100 text-green-800 border-green-200",
  mid: "bg-yellow-100 text-yellow-800 border-yellow-200",
  senior: "bg-orange-100 text-orange-800 border-orange-200",
  staff: "bg-red-100 text-red-800 border-red-200"
};

const categoryColors = {
  frontend: "bg-blue-100 text-blue-800 border-blue-200",
  backend: "bg-purple-100 text-purple-800 border-purple-200",
  fullstack: "bg-indigo-100 text-indigo-800 border-indigo-200",
  mobile: "bg-pink-100 text-pink-800 border-pink-200",
  devops: "bg-gray-100 text-gray-800 border-gray-200",
  data: "bg-emerald-100 text-emerald-800 border-emerald-200"
};

export default function ChallengeCard({ challenge, index, onUseChallenge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {challenge.title}
            </CardTitle>
            <div className="flex gap-2">
              <Badge 
                variant="secondary"
                className={`${difficultyColors[challenge.difficulty]} border font-medium`}
              >
                {challenge.difficulty}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {challenge.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline"
              className={`${categoryColors[challenge.category]} border`}
            >
              <Code className="w-3 h-3 mr-1" />
              {challenge.category}
            </Badge>
            {challenge.estimated_duration && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {challenge.estimated_duration}min
              </Badge>
            )}
          </div>

          {challenge.tech_stack && challenge.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {challenge.tech_stack.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {challenge.tech_stack.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{challenge.tech_stack.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3" />
              <span>4.8</span>
              <Users className="w-3 h-3 ml-2" />
              <span>234 used</span>
            </div>
            
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => onUseChallenge(challenge)}
            >
              Use Challenge
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}