import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, BookOpen, Calendar, BarChart3, Users, Settings } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Schedule Interview",
      description: "Set up a new technical interview session",
      icon: Plus,
      href: createPageUrl("Interviews"),
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Browse Challenges",
      description: "Explore our curated challenge library",
      icon: BookOpen,
      href: createPageUrl("Challenges"),
      color: "from-green-500 to-teal-500"
    },
    {
      title: "View Analytics",
      description: "Review interview performance metrics",
      icon: BarChart3,
      href: createPageUrl("Analytics"),
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.href}>
              <div className="group p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}