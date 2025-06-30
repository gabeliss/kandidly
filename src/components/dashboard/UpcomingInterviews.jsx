import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingInterviews({ interviews, isLoading }) {
  const getDateLabel = (date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Calendar className="w-5 h-5" />
          Upcoming Interviews
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No upcoming interviews</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {interviews.slice(0, 5).map((interview) => (
              <div key={interview.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {interview.candidate_name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {interview.position}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      isToday(new Date(interview.scheduled_date)) 
                        ? 'bg-orange-50 text-orange-700 border-orange-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {getDateLabel(new Date(interview.scheduled_date))}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {format(new Date(interview.scheduled_date), "h:mm a")}
                  <span>•</span>
                  <span>{interview.duration_minutes}min</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}