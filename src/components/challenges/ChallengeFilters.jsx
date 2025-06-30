import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function ChallengeFilters({ filters, setFilters }) {
  return (
    <div className="flex gap-2 items-center">
      <Filter className="w-4 h-4 text-gray-400" />
      
      <Select 
        value={filters.difficulty} 
        onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="junior">Junior</SelectItem>
          <SelectItem value="mid">Mid</SelectItem>
          <SelectItem value="senior">Senior</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={filters.category} 
        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="frontend">Frontend</SelectItem>
          <SelectItem value="backend">Backend</SelectItem>
          <SelectItem value="fullstack">Fullstack</SelectItem>
          <SelectItem value="mobile">Mobile</SelectItem>
          <SelectItem value="devops">DevOps</SelectItem>
          <SelectItem value="data">Data</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={filters.duration} 
        onValueChange={(value) => setFilters(prev => ({ ...prev, duration: value }))}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Duration</SelectItem>
          <SelectItem value="0-30">0-30 min</SelectItem>
          <SelectItem value="30-60">30-60 min</SelectItem>
          <SelectItem value="60-90">60-90 min</SelectItem>
          <SelectItem value="90-120">90+ min</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}